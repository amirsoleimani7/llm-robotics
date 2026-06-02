import { useEffect, useState } from "react";
import { topButtons } from "./buttons";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgMore, CgSidebar } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";
import { RiChatNewFill } from "react-icons/ri";
import axios from "axios";
import Chats from "../Chats/Chats";
import { IoConstructOutline } from "react-icons/io5";
import { useGlobalContext } from "../contextHandle/Context";
import { BsCloudFog } from "react-icons/bs";

// load he
export const update_conversations = async (handler) => {
  const res = await axios.get("http://127.0.0.1:8000/get_converastions", {
    params: {
      commnad: "get_conversations",
    },
  });
  handler.setConversations(res.data);
  console.log("sidebar conversations updated!");
};

function Side() {
  const global_handlers = useGlobalContext();
  const [is_open, setIs_open] = useState(false);

  const handle_sidebar = async () => {
    setIs_open(!is_open);
    // when ever it opense we can update the data
    await update_conversations(global_handlers);
  };

  const handle_newChat = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
        command: "new_chat",
      });

      const conv_id = response.data.conversation_id;

      await global_handlers.setcurrentconversation(response.data);

      const res = await axios.get(
        `http://127.0.0.1:8000/get_conversation/${conv_id}`,
      );

      // get the init messages
      global_handlers.setMessages(res.data);
    } catch (error) {
      console.error("Error:", error);
    }

    // adding to the list of conversations
    await update_conversations(global_handlers);
  };

  const handlers = {
    handle_sidebar,
    handle_newChat,
  };

  return (
    <>
      <div className="fixed top-2 w-[150px] gap-1 flex justify-around items-center p-1 duration-300 ease-in-out transition-all max-md:left-0 -left-full">
        <button
          onClick={handle_sidebar}
          className="w-[20px] h-full aspect-square"
        >
          <RxHamburgerMenu className="pointer-events-none" />
        </button>
        <p className="font-bold text-2xl">Robo Talk</p>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-[2rem] absolute w-[200px] top-2 left-2 max-md:-translate-x-full max-md:left-0 duration-300 ease-in-out transition-all">
        <div className="bg-red-100 w-1/4  h-full rounded-full aspect-square"></div>
        <div className="flex w-3/4 p-1 gap-1  bg-main-color-2 rounded-[2rem] border border-gray-700">
          {topButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                className="w-full aspect-square p-1 rounded-[2rem] flex justify-center items-center hover:bg-main-color-3 duration-200 ease-in-out active:*:scale-[1.10]"
                onClick={handlers[btn.onClick]}
              >
                <Icon className="scale-105" />
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="duration-300 ease-in-out h-full border-gray-700 max-lg:fixed max-lg:left-0 z-40 flex-none  bg-main-color-1 px-2 flex flex-col gap-3"
        style={{
          width: `${is_open ? "270px" : "0px"}`,
          opacity: `${is_open ? "100" : "0"}`,
          borderRight: `${is_open ? "1px solid rgb(55 65 81 / var(--tw-border-opacity, 1)" : ""}`,
        }}
      >
        <div className="h-10 bg flex justify-between items-center mt-4">
          <div className="flex gap-1 items-center w-full">
            <div className="bg-red-100 w-[40px] h-[40px] rounded-[2rem] aspect-square"></div>
            <h1 className="font-bold text-lg">RoboTalk</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-full aspect-square p-3 rounded-[2rem] flex justify-center items-center hover:bg-main-color-3 duration-200 ease-in-out active:*:scale-[1.10]">
              <FaSearch />
            </button>
            <button
              onClick={handle_sidebar}
              className="w-full aspect-square p-3 rounded-[2rem] flex justify-center items-center hover:bg-main-color-3 duration-200 ease-in-out active:*:scale-[1.10]"
            >
              <CgSidebar />
            </button>
          </div>
        </div>

        <button
          className="flex justify-center items-center w-full p-2 rounded-3xl bg-second-color-2 border-y border-gray-500 gap-1"
          onClick={handle_newChat}
        >
          <RiChatNewFill />
          <p>New Chat</p>
        </button>

        <div className="side-section flex flex-col gap-1  h-full ">
          {global_handlers.conversations.map((conv) => {
            return (
              <Chats
                key={conv.conversation_id}
                conversation_id={conv.conversation_id}
                created_date={conv.created_at}
                last_edited={conv.lastedited_at}
              />
            );
          })}
        </div>
        <div className="flex items-center w-full rounded-xl p-2 justify-between mt-auto mb-2">
          <div className="flex items-center gap-1">
            <div className="bg-gray-800 w-10 h-full rounded-full aspect-square border border-gray-500" />
            <p className="text-sm">AmirHossein Soleimani</p>
          </div>
          <button>
            <CgMore />
          </button>
        </div>
      </div>
    </>
  );
}

export default Side;
