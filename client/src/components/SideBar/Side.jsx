import { useState } from "react";
import { topButtons } from "./buttons";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgSidebar } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";
import { RiChatNewFill } from "react-icons/ri";
import axios from "axios";
import Chats from "../Chats/Chats";
import { useGlobalContext } from "../contextHandle/Context";
import SVGComponent from "../../logo";
import { Tooltip } from "antd";

// load the covnersations
export const update_conversations = async (handler) => {
  const res = await axios.get("http://127.0.0.1:8000/get_converastions", {
    params: {
      commnad: "get_conversations",
    },
  });
  handler.setConversations(res.data);
};

export const update_user = async (handler) => {
  const res = await axios.get("http://127.0.0.1:8000/get_user");
  handler.setUser(res.data);
  console.log(res.data);
};

function Side() {
  const global_handlers = useGlobalContext();
  const [is_open, setIs_open] = useState(false);

  const handle_sidebar = async (e) => {
    setIs_open(!is_open);

    // when ever it opens we can update the data(current conversations of the user)
    await update_conversations(global_handlers);
    await update_user(global_handlers);
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
      <div className="fixed top-2 w-[170px]  gap-1 flex justify-around items-center p-1 duration-300 ease-in-out transition-all max-md:left-0 max-md:w-full max-md:justify-start dark:max-md:bg-black-rgba max-md:top-0 max-md:h-12 -left-full ">
        <button
          onClick={handle_sidebar}
          className="aspect-square p-3 rounded-[2rem] flex items-center justify-center dark:hover:bg-main-color-3 hover:bg-select-light-mode duration-200 ease-in-out"
        >
          <RxHamburgerMenu />
        </button>

        <p className="font-bold text-2xl">Robo Talk</p>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-[2rem] absolute w-[180px] top-2 left-2 max-md:-translate-x-full max-md:left-0 duration-300 ease-in-out transition-all ">
        <div
          className="w-[35px] h-[35px] cursor-pointer"
          onClick={handle_sidebar}
        >
          <SVGComponent />
        </div>

        <div className="flex w-3/4 p-1 gap-1  dark:bg-main-color-2 rounded-[2rem] border  dark:border-gray-600 border-gray-300 shadow-sm">
          {topButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <Tooltip
                fontFamily={"Geist"}
                fontSize={10}
                title={btn.label}
                color={"#353638"}
                mouseEnterDelay={0}
                mouseLeaveDelay={0}
                arrow={true}
                key={btn.id}
              >
                <button
                  key={btn.id}
                  className="w-full aspect-square p-1 rounded-[2rem] flex justify-center items-center dark:hover:bg-main-color-3 hover:bg-select-light-mode duration-200 ease-in-out active:*:scale-[1.10]"
                  onClick={handlers[btn.onClick]}
                >
                  <Icon className="scale-105" />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div
        className="duration-300 ease-in-out h-full  dark:border-gray-700 max-lg:fixed max-lg:left-0  flex-none bg-second-light-mode dark:bg-main-color-1 px-2 flex flex-col gap-3"
        style={{
          width: `${is_open ? "270px" : "0px"}`,
          zIndex: `${is_open ? "40" : "-10"}`,
          opacity: `${is_open ? "100" : "0"}`,
          borderRight: `${is_open ? `1px solid rgb(55 65 81 / var(--tw-border-opacity, 1)` : ""}`,
        }}
      >
        <div className="h-10 bg flex justify-between items-center mt-4">
          <div className="flex gap-1 items-center w-full">
            <div className="w-[40px] h-[40px]">
              <SVGComponent />
            </div>
            <h1 className="font-bold text-lg">RoboTalk</h1>
          </div>

          <div className="flex gap-2">
            <Tooltip
              title={"Search"}
              color={"#353638"}
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
              arrow={true}
            >
              <button className="w-full aspect-square p-3 rounded-[2rem] flex justify-center items-center  dark:hover:bg-main-color-3 duration-200 ease-in-out active:*:scale-[1.10] hover:bg-select-light-mode">
                <FaSearch />
              </button>
            </Tooltip>
            <Tooltip
              title={"Toggle Sidebar"}
              color={"#353638"}
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
              arrow={true}
            >
              <button
                onClick={handle_sidebar}
                className="w-full aspect-square p-3 rounded-[2rem] flex justify-center items-center hover:bg-select-light-mode dark:hover:bg-main-color-3 duration-200 ease-in-out active:*:scale-[1.10]"
              >
                <CgSidebar />
              </button>
            </Tooltip>
          </div>
        </div>

        <button
          className="flex justify-center items-center w-full px-2 py-3  rounded-3xl dark:bg-second-color-2 bg-white shadow-sm border-y dark:border-gray-500 gap-2
          hover:shadow-md transition-all duration-200 ease-in-out"
          onClick={handle_newChat}
        >
          <RiChatNewFill />
          <p className="text-sm font-semibold">New Chat</p>
        </button>

        <div className="h-full overflow-y-scroll scrollbar-thin dark:scrollbar-thumb-[#3c3c3d]  dark:scrollbar-track-[#1b1b1c] scrollbar-thumb-[#e6e8ea] scrollbar-track-white">
          <div className="flex flex-col gap-1">
            <h1 className="text-sm  text-second-color-3 ml-2">Pinned</h1>
            {global_handlers.conversations.map((conv, index) => {
              return conv.is_pinned ? (
                <Chats
                  key={conv.conversation_id}
                  conversation_id={conv.conversation_id}
                  created_date={conv.created_at}
                  last_edited={conv.lastedited_at}
                  is_pinned={conv.is_pinned}
                  
                />
              ) : (
                <></>
              );
            })}
          </div>
          <div className=" flex flex-col gap-1 h-full">
            <h1 className="text-sm  text-second-color-3 ml-2 ">Other</h1>
            {global_handlers.conversations.map((conv, index) => {
              return !conv.is_pinned ? (
                <Chats
                  key={index}
                  conversation_id={conv.conversation_id}
                  created_date={conv.created_at}
                  last_edited={conv.lastedited_at}
                  is_pinned={conv.is_pinned}
                />
              ) : (
                <></>
              );
            })}
          </div>
        </div>

        <div
          className="duration-300 transition-all ease-in-out flex items-center w-full  dark:bg-main-color-2 cursor-pointer rounded-xl p-2  mt-auto mb-2 hover:bg-select-light-mode shadow-md"
          onClick={() => {
            global_handlers.setShowSetting(true);
          }}
        >
          <div className="flex items-center gap-5 justify-start w-full">
            <div className="dark:bg-gray-800 w-10 h-full rounded-full aspect-square border border-gray-500 overflow-hidden">
              <img
                src={global_handlers.user.data_url}
                alt=""
                className="w-full h-full object-conver "
              />
            </div>
            <p className="text-sm">{global_handlers.user.name}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Side;
