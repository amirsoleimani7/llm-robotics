import { useState } from "react";
import { topButtons, bottomButtons } from "./buttons";
import { IoIosShareAlt } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";

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
      <div
        className="duration-300 ease-in-out h-full border-r border-gray-700 max-lg:fixed max-lg:left-0 bg-red-300 flex-none"
        style={{
          width: `${is_open ? "250px" : "0px"}`,
          opacity: `${is_open ? "100" : "100"}`,
        }}
      >
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
    </>
  );
}

export default Side;
