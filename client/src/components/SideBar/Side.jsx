import { useState } from "react";
import { topButtons, bottomButtons } from "./buttons";
import { IoIosShareAlt } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgSidebar } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";
import { RiChatNewFill } from "react-icons/ri";

/*

        <button
          className="absolute top-4 -translate-x-full max-md:translate-x-full max-md:left-2 duration-300 ease-in-out transition-all "
          onClick={handle_sidebar}
        >
          <RxHamburgerMenu />
        </button>
      <div
        className="duration-300 ease-in-out h-full border-r border-gray-700  max-lg:fixed max-lg:left-0 bg-red-300"
        // style={{
        //   width: `${is_open ? "250px" : "0px"}`,
        //   opacity: `${is_open ? "100" : "100"}`,
        // }}
      >
        <div className="w-[100vw] absolute  top-2 left-2 gap-1 duration-300 ease-in-out tarnsform-all">
          <div className="flex gap-2">
            <img
              src=""
              alt=""
              className="bg-red-100 rounded-[2rem] aspect-square"
            />
            <div className="flex bg-main-color-2 gap-2 p-1 rounded-[2rem] border border-gray-700">
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
          <button className="rounded-[2rem] p-3 b ml-auto">
            <IoIosShareAlt />
          </button>
        </div>
        
      </div>

        */

function Side() {
  const [is_open, setIs_open] = useState(false);

  const handle_sidebar = () => {
    setIs_open(!is_open);
  };

  const handlers = {
    handle_sidebar,
    // handle_search,
    // handle_newChat,
    // handle_profile,
    // handle_settings
  };

  return (
    <>
      <div className="fixed top-2 w-[150px] gap-1 flex justify-around items-center p-1 duration-300 ease-in-out transition-all max-md:left-0 -left-full" >
        <button
          onClick={handle_sidebar}
          
        >
          <RxHamburgerMenu />
        </button>
        <p className="font-bold text-2xl">Robo Talk</p>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-[2rem] absolute w-[200px] top-2 left-2 max-md:-translate-x-full max-md:left-0 duration-300 ease-in-out transition-all">
        <img
          src=""
          alt=""
          className="bg-red-100 w-1/4  h-full rounded-full aspect-square"
        />
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
        className="duration-300 ease-in-out h-full border-gray-700 max-lg:fixed max-lg:left-0 z-10 flex-none overflow-hidden bg-main-color-1 px-2 flex flex-col gap-3"
        style={{
          width: `${is_open ? "270px" : "0px"}`,
          opacity: `${is_open ? "100" : "0"}`,
          borderRight: `${is_open ? "1px solid rgb(55 65 81 / var(--tw-border-opacity, 1)" : ""}`,
        }}
      >
        
        <div className="h-10 bg flex justify-between items-center mt-4">
          <div className="flex gap-1 items-center w-full">
            <img
              src=""
              alt=""
              className="bg-red-100 w-[40px] h-[40px] rounded-[2rem] aspect-square"
            />
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

        <button className="flex justify-center items-center w-full p-2 rounded-3xl bg-second-color-2 border-y border-gray-500 gap-1">
          <RiChatNewFill />
          <p>New Chat</p>
        </button>

        <div className="flex flex-col gap-1">
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
          <div className="w-full p-2 rounded-xl duration-300 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer">
            Acidental Type Clarification
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}

export default Side;
