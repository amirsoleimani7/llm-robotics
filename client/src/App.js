import InputArea from "./components/MainArea/InputArea";
import Side from "./components/SideBar/Side";

function App() {
  return (
    <div className="bg-main-color text-white w-full h-screen flex justify-center duration-300 ease-in-out">
      <Side/>
      <InputArea/>
    </div>
  );
}

export default App;
