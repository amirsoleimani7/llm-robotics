import ChatDetail from "./components/Chats/ChatDetail";
import Confirmation from "./components/Confirmation/Confirmation";
import { useGlobalContext } from "./components/contextHandle/Context";
import InputArea from "./components/MainArea/InputArea";
import Setting from "./components/ShowSettings/ShowSetting";
import Side from "./components/SideBar/Side";
import SVGComponent from "./logo";

function App() {
  
  const handler = useGlobalContext();
  console.log(handler.messages.length == 0);
  return (
    
    <div className="bg-main-color text-white w-full h-screen flex justify-between">
      <Confirmation/>
      <Side />
      <Setting/>
      
      <div className={`w-[800px] px-2 shrink flex flex-col ${handler.messages.length == 0 ? "justify-center" : "justify-between"}  mx-auto tranistion-all ease-in-out  mb-4`}>
        {handler.messages.length == 0 ? 
        <>
          <div className="w-[100%] h-[50px] text-center flex items-center justify-center gap-5">
            <div className="w-[50px] h-[50px]">
              <SVGComponent/>
            </div>
            <h1 className="text-4xl font-bold max-md:text-4xl">Start Chatting with RoboTalk</h1>
          </div>
        </> 
        : <></>}
        <div className={`chat-section w-full  flex flex-col gap-2 py-12  ${handler.messages.length == 0 ? "" : "overflow-scroll"} overflow-x-hidden duration-300 transition-all`}>
          <ChatDetail  />
        </div>
        <InputArea />
      </div>
    
    </div>
  );
}

export default App;
