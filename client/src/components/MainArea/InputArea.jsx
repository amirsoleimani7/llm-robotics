import { use, useState } from "react";
import { IoSend } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { faker } from "@faker-js/faker";
import { useGlobalContext } from "../contextHandle/Context";

function InputArea() {
  const global_handler = useGlobalContext();
  const [is_voice, SetIsVoice] = useState(true);
  const [input, setInput] = useState("");
  const [high_len, setHighlen] = useState(false);

  const handle_user_input = (e) => {
    const input = e.target.value;

    // checks for the the string
    input !== "" ? SetIsVoice(false) : SetIsVoice(true);
    input.length > 148 ? setHighlen(true) : setHighlen(false);

    setInput(input);
  };

  const handle_input = (e) => {
    e.preventDefault(); // Prevent page reload
    const user_input = input;
    const repsone = faker.lorem.paragraph(4);
    global_handler.handle_messages(user_input, repsone);
  };
  
  return (
    <>
      <form
        className="flex flex-col bg-second-color w-full h-36 p-6 rounded-[2rem] mt-auto mb-2 duration-500 ease-in-out transition-all border border-gray-700 max-md:h-28 max-md:text-sm max-md:p-4"
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
            className="ml-auto rounded-full p-2 flex justify-center items-center border border-gray-700 duration-300 ease-in-out"
            style={{
              background: `${!is_voice ? "gray" : ""}`,
            }}
            
            onClick={handle_input}
          >
            {is_voice ? (
              <MdOutlineKeyboardVoice></MdOutlineKeyboardVoice>
            ) : (
              <IoSend></IoSend>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default InputArea;
