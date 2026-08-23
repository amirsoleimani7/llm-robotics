import { useEffect } from "react";
import ChatDetail from "./components/Chats/ChatDetail";
import Confirmation from "./components/Confirmation/Confirmation";
import { useGlobalContext } from "./components/contextHandle/Context";
import InputArea from "./components/MainArea/InputArea";
import Setting from "./components/ShowSettings/ShowSetting";
import Side from "./components/SideBar/Side";
import SVGComponent from "./logo";

function App() {
  const handler = useGlobalContext();

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    const prefersNotSet = window.matchMedia(
      "(prefers-color-scheme: no-preference)",
    ).matches;

    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === null) {
      prefersDark
        ? document.querySelector("#main-page").classList.add("dark")
        : document.querySelector("#main-page").classList.remove("dark");
      return;
    }

    if (currentTheme == "Dark") {
      document.querySelector("#main-page").classList.add("dark");
    } else {
      document.querySelector("#main-page").classList.remove("dark");
    }
  }, []);

  return (
    <div
      className={`dark:bg-main-color dark:text-white  w-full h-screen flex justify-between`}
    >
      <Confirmation />
      <Side />
      <Setting />

      <div
        className={`w-[800px] px-2 shrink flex flex-col ${handler.messages.length === 0 ? "justify-center" : "justify-between"}  mx-auto tranistion-all ease-in-out  mb-4`}
      >
        {handler.messages.length === 0 ? (
          <>
            <div className="w-[100%] h-[50px] text-center flex items-center justify-center gap-5">
              <div className="w-[50px] h-[50px]">
                <SVGComponent />
              </div>
              <div className="flex gap-2 max-md:flex-col">
                <h1 className="text-3xl max-md:text-2xl ">
                  Start Chatting with
                </h1>
                <h1 className="text-3xl font-extrabold max-md:text-2xl">RoboTalk</h1>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}

        <div
          className={`w-full transition-all duration-200 ease-in-out  flex flex-col gap-2 py-12  ${handler.messages.length === 0 ? "" : "overflow-scroll h-full"} overflow-x-hidden duration-300 transition-all scroll-smooth scrollbar-thin dark:scrollbar-thumb-[#3c3c3d]  dark:scrollbar-track-[#0d1117] scrollbar-thumb-[#e6e8ea] scrollbar-track-white shadow-remove`}
          id="chatDetailContainer"
        >
          <ChatDetail />
        </div>
        <InputArea />
      </div>
    </div>
  );
}

export default App;
