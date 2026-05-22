import { useState } from "react";
import { topButtons, bottomButtons } from "./buttons";

function Side() {
  const [is_open, setIs_open] = useState(false);

  const handle_sidebar = () => {
    setIs_open(!is_open);
  };

  return (
    <>
      <div
        className="w-[200px] duration-300 ease-in-out h-full bg-main-color-1 border-r border-gray-700 mr-auto max-md:fixed max-md:left-0"
        style={{
          width: `${is_open ? "250px" : "50px"}`,
          opacity: `${is_open ? "100" : "50px"}`,
        }}
      >
        <div className="w-[50px] h-full flex flex-col py-2 items-center justify-between">
          <div className="flex flex-col gap-2 w-full p-2">
            {topButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button key={btn.id} className="w-full aspect-square p-1 rounded-lg  flex justify-center items-center hover:bg-gray-300 hover:text-black duration-300 ease-in-out">
                  <Icon />
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 w-full p-2">
            {bottomButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <button key={btn.id} className="w-full aspect-square p-1 rounded-lg flex justify-center items-center hover:bg-gray-300 hover:text-black duration-300 ease-in-out">
                  <Icon />
                </button>
              );
            })}
          </div>
        </div>
        {/* <button onClick={handle_sidebar}>close/open</button> */}
      </div>
    </>
  );
}

export default Side;
