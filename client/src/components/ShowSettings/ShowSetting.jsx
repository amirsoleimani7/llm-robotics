import { useState } from "react";
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
// for sending image
import FormData from "form-data";

function Setting() {
  const [tab, setTab] = useState("general");
  const [theme, setTheme] = useState("System");
  const [Language, setLanguage] = useState("English");
  const [show_ok, setShowOk] = useState(false);
  const [show_ok_image, setShowOkImage] = useState(false);
  const [query_name, setQueryname] = useState("");
  const [current_image, setCurrentImage] = useState({});
  const [image, setImage] = useState(null);

  const handle = useGlobalContext();

  const handle_set_image = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      // making a url for the image
      var url = URL.createObjectURL(file);
      setCurrentImage(url);
      setImage(file);
      setShowOkImage(true);
    } else {
      console.log("upload an image");
    }
  };

  const handle_username = (e) => {
    const query_name = e.currentTarget.value;

    query_name === "" ? setShowOk(false) : setShowOk(true);
    if (query_name !== "") {
      setQueryname(query_name);
    }
  };

  const handle_change_name = async () => {
    await axios.put("http://127.0.0.1:8000/update_user", {
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

  const handle_change_image = async (e) => {
    // this return an string
    const { changeStatus } = e.currentTarget.dataset;
    if (changeStatus === "true") {
      // we need to change the user profile pictur and then return the image back to the client
      let data = new FormData();

      data.append("image", image);
      data.append("command", "change_profile");

      await axios.put("http://127.0.0.1:8000/update_user", data, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });

      const user_updated = await axios.get("http://127.0.0.1:8000/get_user");
      handle.setUser(user_updated.data);

      toast.success("profile changed!", { duration: 1500 });
      setShowOkImage(false);
    } else {
      // get the lastest image from the server
      setCurrentImage(handle.user.data_url);
      setShowOkImage(false);
    }
  };

  return (
    <div
      className="z-50 absolute w-screen h-screen bg-[rgba(0,0,0,0.7)] flex justify-center items-center backdrop-blur-sm"
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

      <div className="p-4 flex flex-col w-[700px] h-[500px] rounded-2xl bg-white  dark:bg-second-color max-md:w-full max-md:h-[80%] max-md:mt-auto max-md:rounded-b-none">
        <div className="flex justify-between font-bold ml-2">
          <h1>Settings</h1>
          <button
            className="flex items-center justify-center rounded-full aspect-square dark:hover:bg-second-color-2  hover:bg-select-light-mode  transition-all duration-200"
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
              className={`text-md gap-1 flex justify-start rounded-lg p-2 items-center dark:hover:bg-select-color hover:bg-select-light-mode ${tab === "general" ? "dark:bg-select-color bg-select-light-mode" : ""} transition-all duration-100 max-md:px-4`}
              onClick={() => {
                setTab("general");
              }}
            >
              <IoIosSettings />
              <p>General</p>
            </button>
            <button
              className={`text-md gap-1 flex justify-start rounded-lg p-2  items-center dark:hover:bg-select-color hover:bg-select-light-mode ${tab === "profile" ? "dark:bg-select-color bg-select-light-mode" : ""}  transition-all duration-100 max-md:px-4`}
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
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-light-mode dark:hover:bg-select-color rounded-lg outline-1 outline outline-gray-300 dark:outline-gray-600 ${theme === "Light" ? "dar:bg-select-color bg-select-light-mode" : ""}`}
                    onClick={() => {
                      setTheme("Light");

                      document
                        .querySelector("#main-page")
                        .classList.remove("dark");
                    }}
                  >
                    <MdOutlineLightMode />
                    <p>Light</p>
                  </button>
                  <button
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-light-mode dark:hover:bg-select-color rounded-lg outline-1 outline outline-gray-300 dark:outline-gray-600 ${theme === "Dark" ? "dark:bg-select-color bg-select-light-mode" : ""}`}
                    onClick={() => {
                      setTheme("Dark");
                      document
                        .querySelector("#main-page")
                        .classList.add("dark");
                    }}
                  >
                    <MdOutlineDarkMode />
                    <p>Dark</p>
                  </button>
                  <button
                    className={`flex flex-col flex-1 items-center py-4 gap-1 transition-all duration-100 hover:bg-select-light-mode dark:hover:bg-select-color rounded-lg outline-1 outline outline-gray-300 dark:outline-gray-600 ${theme === "System" ? "dark:bg-select-color bg-select-light-mode" : ""}`}
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
                    className={`px-2 py-1 rounded-[2rem] hover:bg-select-light-mode dark:hover:bg-select-color ${Language === "English" ? "dark:bg-select-color bg-select-light-mode" : ""} transition-all duration-100`}
                    onClick={() => {
                      setLanguage("English");
                    }}
                  >
                    English
                  </button>
                  <button
                    className={`px-2 py-1 rounded-[2rem] hover:bg-select-light-mode dark:hover:bg-select-color ${Language === "Persian" ? "dark:bg-select-color bg-select-light-mode" : ""} transition-all duration-100`}
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
              <div className="flex justify-between items-center w-[100%] relative ">
                <h1>Name</h1>
                <input
                  onChange={handle_username}
                  onKeyDown={(e) => {
                    if(e.key === "Enter"){
                      handle_change_name();
                    }
                  }}
                  type="text"
                  id="user-name-change"
                  placeholder={handle.user.name}
                  maxLength={25}
                  className="dark:bg-second-color-1  bg-select-light-mode rounded-lg p-2 border-none outline-none focus:outline-1 dark:focus:outline-sky-50 focus:outline-gray-500 "
                />
                <button
                  className={` absolute right-1 p-2 rounded-lg hover:bg-seocnd-color-3 ${show_ok ? "translate-x-0 opacity-100 scale-100 " : " pointer-events-none scale-0"} duration-100 transition-all`}
                  onClick={handle_change_name}
                >
                  <IoCheckmarkOutline size={18} />
                </button>
              </div>
              <div className="border-b h-0 w-full border-gray-300 dark:border-gray-600"></div>
              <div className="flex justify-between items-center">
                <h1>Profile Picture</h1>
                <div className="flex gap-2 items-center justify-end transition-all duration-100">
                  <button
                    className={`p-2 rounded-lg hover:bg-seocnd-color-3 aspect-square w-10 h-10 flex justify-center items-center ${show_ok_image ? "scale-100 opacity-100" : "scale-0 opacity-0 hidden"} transition-all duration-100`}
                    onClick={handle_change_image}
                    data-change-status={false}
                  > 
                    <IoClose size={18} />
                  </button>
                  <button
                    className={`p-2 rounded-lg hover:bg-seocnd-color-3 aspect-square w-10 h-10 flex justify-center items-center ${show_ok_image ? "scale-100 opacity-100" : "scale-0 opacity-0 hidden"} transition-all duration-100`}
                    onClick={handle_change_image}
                    data-change-status={true}
                  >
                    <IoCheckmarkOutline size={18} />
                  </button>
                  <div className="overflow-hidden w-14 h-14 aspect-square bg-red-100 rounded-full z-10 flex justify-center items-center relative dark:border-gray-500 border-gray-300 border">
                    <input
                      type="file"
                      className="scale-[300%] cursor-pointer"
                      onChange={handle_set_image}
                    />
                    <img
                      src={
                        Object.keys(current_image).length === 0
                          ? handle.user.data_url
                          : current_image
                      }
                      alt=""
                      className="absolute w-full h-full pointer-events-none bg-gray-800"
                    />
                  </div>
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
