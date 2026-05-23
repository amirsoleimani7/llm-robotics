import InputArea from "./components/MainArea/InputArea";
import Side from "./components/SideBar/Side";

function App() {
  return (
    <div className="bg-main-color text-white w-full h-screen flex">
      <Side/>
      <div className="flex justify-center w-full p-4 transition-all ease-in-out duration-300">
        {/* chats shoudl come here is as well */}
        <InputArea/>
        </div>
    </div>
  );
}

export default App;
