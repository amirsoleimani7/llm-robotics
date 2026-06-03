import React from "react";
import { useGlobalContext } from "../contextHandle/Context";
import { IoClose } from "react-icons/io5";


function Setting() {
  const handle = useGlobalContext();
  
  return (
    <div
      className="z-50 absolute w-screen h-screen  bg-[rgba(0,0,0,0.8)] flex justify-center items-center p-2"
      style={{
        display: `${handle.show_settings ? "flex" : "none"}`,
      }}
    >
        <div className="p-4 flex flex-col w-[600px] h-[500px] rounded-2xl  bg-second-color">    
            <div className="flex justify-between font-bold">
                <h1 >Settings</h1>
                <button className="flex items-center justify-center rounded-full aspect-square hover:bg-second-color-2 hover:rotate-90 transition-all duration-200"
                onClick={() => {
                    handle.setShowSetting(false);
                }}>
                    <IoClose/>
                </button>
            </div>
        </div>
    </div>
  );
}

export default Setting;
