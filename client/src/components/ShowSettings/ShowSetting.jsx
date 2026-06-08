import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { useGlobalContext } from "../contextHandle/Context";
import { IoClose } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import { IoCheckmarkOutline } from "react-icons/io5";
import { update_user } from "../SideBar/Side";
import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdComputer,
} from "react-icons/md";
import axios from "axios";

function Setting() {
  const [tab, setTab] = useState("general");
  const [theme, setTheme] = useState("System");
  const [Language, setLanguage] = useState("English");
  const [show_ok, setShowOk] = useState(false);
  const [query_name, setQueryname] = useState("");

  const handle = useGlobalContext();

  const handle_username = (e) => {
    const query_name = e.currentTarget.value;

    query_name === "" ? setShowOk(false) : setShowOk(true);
    if (query_name !== "") {
      setQueryname(query_name);
    }
  };

  const handle_change_name = async () => {
    const res = await axios.put("http://127.0.0.1:8000/update_user", {
      command: "change_name",
      new_name: query_name,
    });

    // udpate user
    await update_user(handle);

    // reset the input area
    document.getElementById("user-name-change").value = "";
    setShowOk(false);
    toast.success("name changed!", { duration: 1500 });
  };

  return (
    <div
      className="z-50 absolute w-screen h-screen  bg-[rgba(0,0,0,0.8)] flex justify-center items-center p-2 "
      style={{
        display: `${handle.show_settings ? "flex" : "none"}`,
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#353638",
            color: "white",
            width: "200px",
            display: "flex",
            justifyContent: "center",
          },
        }}
      />
      <div className="p-4 flex flex-col w-[700px] h-[500px] rounded-2xl  bg-second-color max-md:w-full max-md:h-[80%] max-md:mt-auto max-md:rounded-b-none">
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

        <div className="flex mt-3 gap-3 max-md:flex-col">
          <div className="flex flex-col w-[30%] gap-1 max-md:flex-row max-md:w-full ">
            <button
              className={`text-md gap-1 flex justify-start rounded-lg px-1 py-2  items-center hover:bg-select-color ${tab === "general" ? "bg-select-color" : ""} transition-all duration-100 max-md:px-4`}
              onClick={() => {
                setTab("general");
              }}
            >
              <IoIosSettings />
              <p>General</p>
            </button>
            <button
              className={`text-md gap-1 flex justify-start rounded-lg px-1 py-2  items-center hover:bg-select-color ${tab === "profile" ? "bg-select-color" : ""}  transition-all duration-100 max-md:px-4`}
              onClick={() => {
                setTab("profile");
              }}
            >
              <RxAvatar />
              <p>Profile</p>
            </button>
          </div>
          {tab === "general" ? (
            <div className="w-[75%] flex flex-col gap-8 max-md:flex-col max-md:w-full">
              <div className="flex flex-col gap-3 ">
                <h1>Theme</h1>
                <div className="flex gap-2 ">
                  <button
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600 ${theme === "Light" ? "bg-select-color" : ""}`}
                    onClick={() => {
                      setTheme("Light");
                    }}
                  >
                    <MdOutlineLightMode />
                    <p>Light</p>
                  </button>
                  <button
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600 ${theme === "Dark" ? "bg-select-color" : ""}`}
                    onClick={() => {
                      setTheme("Dark");
                    }}
                  >
                    <MdOutlineDarkMode />
                    <p>Dark</p>
                  </button>
                  <button
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-color rounded-lg outline-1 outline outline-gray-600 ${theme === "System" ? "bg-select-color" : ""}`}
                    onClick={() => {
                      setTheme("System");
                    }}
                  >
                    <MdComputer />
                    <p>System</p>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <p>Language</p>
                <div className="flex gap-1">
                  <button
                    className={`px-2 py-1 rounded-[2rem] hover:bg-select-color ${Language === "English" ? "bg-select-color" : ""} transition-all duration-100`}
                    onClick={() => {
                      setLanguage("English");
                    }}
                  >
                    English
                  </button>
                  <button
                    className={`px-2 py-1 rounded-[2rem] hover:bg-select-color ${Language === "Persian" ? "bg-select-color" : ""} transition-all duration-100`}
                    onClick={() => {
                      setLanguage("Persian");
                    }}
                  >
                    فارسی
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-[75%]  gap-4 max-md:w-full">
              <div className="flex justify-between items-center w-[100%] relative">
                <h1>Name</h1>
                <input
                  onChange={handle_username}
                  type="text"
                  id="user-name-change"
                  placeholder={handle.user.name}
                  maxLength={25}
                  className="bg-second-color-1 rounded-lg p-2 border-none outline-none focus:outline-1 focus:outline-sky-50"
                />
                <button                
                  className={`translate-x-10 absolute right-1 p-2 rounded-lg hover:bg-seocnd-color-3 ${show_ok ? "translate-x-0 opacity-100 scale-100 visible" : "invisible pointer-events-none scale-0"} duration-100 transition-all`}
                  onClick={handle_change_name}
                >
                  <IoCheckmarkOutline size={18} />
                </button>
              </div>
              <div className=" bg-red-100 border-b w-full border-gray-700"></div>
              <div className="flex justify-between items-center">
                <h1>Profile picture</h1>
                <div className="overflow-hidden w-14 h-14 aspect-square bg-red-100 rounded-full z-10 flex justify-center items-center">
                  <input type="file" className="scale-[300%]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Setting;
