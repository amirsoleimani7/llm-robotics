import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { useGlobalContext } from "../contextHandle/Context";
import { update_conversations } from "../SideBar/Side";
import axios from "axios";
import { Tooltip } from "antd";

export function moveToBottom() {
  setTimeout(() => {
    const container = document.getElementById("chatDetailContainer");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 100);
}

function InputArea() {
  

  const global_handler = useGlobalContext();
  const [is_voice, SetIsVoice] = useState(true);
  const [input, setInput] = useState("");
  const [high_len, setHighlen] = useState(false);

  const handle_user_input = async (e) => {
    const input = e.target.value;

    // checks
    input !== "" ? SetIsVoice(false) : SetIsVoice(true);
    input.length > 148 ? setHighlen(true) : setHighlen(false);

    setInput(input);
  };

  const handle_input = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // clearing the input field after submitsion
    document.getElementById("user-input").value = "";
    document.getElementById("user-input").selectionStart = 0;

    moveToBottom();

    if (input.length > 0) {
      try {
        const conv = global_handler.current_conversation;

        if (Object.keys(conv).length !== 0) {
          const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
            command: "new_message",
            conversaion: global_handler.current_conversation,
            role: "user",
            content: input,
          });

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

          global_handler.setIsLoading(false);
          global_handler.addLLMResponse(prompt_response.data);

          moveToBottom();
        } else {
          // make a conversation and put the messages in it
          const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
            command: "new_chat",
          });

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
              conversation: response.data,
              content: input,
            },
          );

          global_handler.setIsLoading(false);
          global_handler.addLLMResponse(prompt_response.data);
          moveToBottom();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <form
        className="flex flex-col bg-white  dark:bg-second-color w-full h-36 p-6 rounded-[2rem]  mb-2 duration-500 ease-in-out transition-all border border-gray-300  dark:border-gray-700 max-md:h-28 max-md:text-sm max-md:p-4 shadow-md"
        style={{
          height: `${high_len ? "230px" : ""}`,
        }}
      >
        <textarea
          id="user-input"
          type="text"
          placeholder="Message to Robot"
          onChange={handle_user_input}
          className="bg-transparent focus:outline-none w-full h-[80%] resize-none dark:text-white text-black"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handle_input();
            }
          }}
        />

        <div className="flex justify-between mt-auto w-full">
          <Tooltip
            title={"change model"}
            color={"#353638"}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <button className="flex items-center justify-center gap-1 border px-2 border-gray-300 dark:border-gray-700 rounded-[2rem] text-sm hover:bg-select-light-mode">
              <LuBrain></LuBrain>
              <p>Model</p>
            </button>
          </Tooltip>
          <Tooltip
            title={
              global_handler.is_loading
                ? "stop"
                : !is_voice
                  ? "send command"
                  : "use voice mode"
            }
            color={"#353638"}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <button
              className="ml-auto rounded-full p-2 flex justify-center items-center border border-gray-300 dark:border-gray-700 duration-200 w-10 h-10 aspect-square ease-in-out hover:bg-select-side-light-mode transition-all dark:text-white"
              style={{
                background: `${!is_voice ? "#3964fe" : ""}`,
                color: `${!is_voice ? "white" : ""}`,
              }}
              onClick={handle_input}
            >
              {global_handler.is_loading ? (
                <div className="w-[50%] h-[50%] bg-main-color-"></div>
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
          </Tooltip>
        </div>
      </form>
    </>
  );
}

export default InputArea;
