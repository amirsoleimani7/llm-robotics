import ChatDetail from "./components/Chats/ChatDetail";
import InputArea from "./components/MainArea/InputArea";
import Side from "./components/SideBar/Side";

function App() {
  return (
    <div className="bg-main-color text-white w-full h-screen flex justify-between">
      <Side />
      <div className="w-[800px] px-2 shrink flex flex-col justify-center mx-auto tranistion-all ease-in-out duration-300 mb-4">
        <div className="chat-section w-full h-full  flex flex-col gap-2 py-10 overflow-scroll overflow-x-hidden">
          <ChatDetail />
        </div>
        <InputArea />
      </div>
    </div>
  );
}

export default App;
