import { useState } from "react";
import { topButtons, bottomButtons } from "./buttons";
import { IoIosShareAlt } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";

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
        className=" duration-300 ease-in-out h-full border-r border-gray-700 mr-auto max-md:fixed max-md:left-0"
        // style={{
        //   width: `${is_open ? "250px" : "50px"}`,
        //   opacity: `${is_open ? "100" : "100"}`,
        // }}
      >
        
        {/* <div className="w-[50px] h-full flex flex-col py-2 items-center justify-between"> */}
        
        <button className="absolute right-2 top-2 rounded-[2rem] p-3">
          <IoIosShareAlt/>
        </button>

        <div className="w-[180px] absolute flex top-2 left-2 gap-1 duration-300 ease-in-out tarnsform-all max-md:-translate-x-full max-md:left-0">
          <img src="" alt="" className="bg-red-100 w-1/4 rounded-[2rem] aspect-square" />
          <div className="flex bg-main-color-2 w-3/4 gap-2 p-1 rounded-[2rem] border border-gray-700">
            {topButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  className="w-full aspect-square p-1 rounded-[2rem] flex justify-center items-center hover:bg-main-color-3  duration-200 ease-in-out active:*:scale-[1.10]"
                  onClick={handlers[btn.onClick]}
                >
                  <Icon className="scale-105" />
                </button>
              );
            })}
          </div>
          {/* </div> */}

          {/* <div>
                        
          </div> */}
          {/* <div className="flex flex-col gap-2 w-full p-2">
            {bottomButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  className="w-full aspect-square p-1 rounded-lg flex justify-center items-center hover:bg-gray-300 hover:text-black duration-300 ease-in-out active:*:scale-[1.10]"
                >
                  <Icon className="scale-105" />
                </button>
              );
            })}
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Side;
