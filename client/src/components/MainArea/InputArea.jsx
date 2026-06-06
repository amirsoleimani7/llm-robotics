import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { useGlobalContext } from "../contextHandle/Context";
import { update_conversations } from "../SideBar/Side";
import axios, { isCancel, AxiosError } from "axios";



function InputArea() {
  const global_handler = useGlobalContext();
  const [is_voice, SetIsVoice] = useState(true);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [high_len, setHighlen] = useState(false);

  const handle_user_input = async (e) => {
    const input = e.target.value;

    // checks for the the string
    input !== "" ? SetIsVoice(false) : SetIsVoice(true);
    input.length > 148 ? setHighlen(true) : setHighlen(false);

    setInput(input);
  };

  const handle_input = async (e) => {
    e.preventDefault();
    if (input.length > 0) {
      try {
        const conv = global_handler.current_conversation;
        console.log(conv);
        if (Object.keys(conv).length !== 0) {
          const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
            command: "new_message",
            conversaion: global_handler.current_conversation,
            role: "user",
            content: input,
          });
          console.log("response");
          console.log(response.data);
          console.log("response endd");
          global_handler.addUserMessage(response.data);

          global_handler.setIsLoading(true);
          const prompt_response = await axios.post(
            `http://127.0.0.1:8000/handle_prompt`,
            {
              commnad: "handle_prompt",
              conversation: global_handler.current_conversation,
              content: input,
            },
          );

          console.log("got the reponse");
          global_handler.setIsLoading(false);
          global_handler.addLLMResponse(prompt_response.data);
        } else {
          // make a conversation and put the messages in it
          const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
            command: "new_chat",
          });

          console.log(response);
          global_handler.setcurrentconversation(response.data);

          await update_conversations(global_handler);

          const response_msg = await axios.post(
            `http://127.0.0.1:8000/make_chat`,
            {
              command: "new_message",
              conversaion: response.data,
              role: "user",
              content: input,
            },
          );
          global_handler.addUserMessage(response_msg.data);

          global_handler.setIsLoading(true);

          const prompt_response = await axios.post(
            `http://127.0.0.1:8000/handle_prompt`,
            {
              commnad: "handle_prompt",
              conversation: global_handler.current_conversation,
              content: input,
            },
          );
          console.log(prompt_response.data);

          global_handler.setIsLoading(false);
          global_handler.addLLMResponse(prompt_response.data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <form
        className="flex flex-col bg-second-color w-full h-36 p-6 rounded-[2rem] mt-auto mb-2 duration-500 ease-in-out transition-all border border-gray-700 max-md:h-28 max-md:text-sm max-md:p-4
        "
        style={{
          height: `${high_len ? "230px" : ""}`,
        }}
      >
        <textarea
          type="text"
          placeholder="Message to Robot"
          onChange={handle_user_input}
          className="bg-transparent focus:outline-none w-full h-[80%] resize-none text-white "
        />
        <div className="flex justify-between mt-auto w-full">
          <button className="flex items-center justify-center gap-1 border px-2 border-gray-700 rounded-[2rem] text-sm ">
            <LuBrain></LuBrain>
            <p>Model</p>
          </button>
          <button
            className="ml-auto rounded-full p-2 flex justify-center items-center border border-gray-700 duration-300 w-10 h-10 aspect-square ease-in-out"
            style={{
              background: `${!is_voice ? "gray" : ""}`,
            }}
            onClick={handle_input}
          >
            {global_handler.is_loading ? (
              <div className="loader1"></div>
            ) : (
              <div>
                {is_voice ? (
                  <MdOutlineKeyboardVoice></MdOutlineKeyboardVoice>
                ) : (
                  <IoSend></IoSend>
                )}
              </div>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default InputArea;
