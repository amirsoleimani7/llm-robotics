import React, { useState } from "react";
import { useGlobalContext } from "../contextHandle/Context";
import { IoClose } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdComputer,
} from "react-icons/md";

function Setting() {
  const [tab, setTab] = useState("general");

  const handle = useGlobalContext();

  return (
    <div
      className="z-50 absolute w-screen h-screen  bg-[rgba(0,0,0,0.8)] flex justify-center items-center p-2"
      style={{
        display: `${handle.show_settings ? "flex" : "none"}`,
      }}
    >
      <div className="p-4 flex flex-col w-[700px] h-[500px] rounded-2xl  bg-second-color">
        <div className="flex justify-between font-bold">
          <h1>Settings</h1>
          <button
            className="flex items-center justify-center rounded-full aspect-square hover:bg-second-color-2 hover:rotate-90 transition-all duration-200"
            onClick={() => {
              handle.setShowSetting(false);
            }}
          >
            <IoClose />
          </button>
        </div>

        <div className="flex mt-1 gap-3">
          <div className="flex flex-col w-[25%] gap-1">
            <button
              className={`text-md gap-1 flex justify-start rounded-lg px-1 py-2  items-center hover:bg-select-color ${tab === "general" ? "bg-select-color" : ""} `}
              onClick={() => {
                setTab("general");
              }}
            >
              <IoIosSettings />
              <p>General</p>
            </button>
            <button
              className={`text-md gap-1 flex justify-start rounded-lg px-1 py-2  items-center hover:bg-select-color ${tab == "profile" ? "bg-select-color" : ""}  `}
              onClick={() => {
                setTab("profile");
              }}
            >
              <RxAvatar />
              <p>Profile</p>
            </button>
          </div>
          <div className="w-[75%] flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1>Theme</h1>
              <div className="flex gap-2 ">
                <button className="flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600">
                  <MdOutlineLightMode />
                  <p>Light</p>
                </button>
                <button className="flex flex-col flex-1 items-center py-4 gap-1 transition-all duration100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600">
                  <MdOutlineDarkMode />
                  <p>Light</p>
                </button>
                <button className="flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600">
                  <MdComputer />
                  <p>System</p>
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <p>Language</p>
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded-[2rem] bg-select-color">
                  English
                </button>
                <button className="px-2 py-1 rounded-[2rem] bg-select-color">
                  Persian
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
