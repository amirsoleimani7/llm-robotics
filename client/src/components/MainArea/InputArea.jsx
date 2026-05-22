import { IoSend } from "react-icons/io5";


function InputArea() {
  return (
    <>
      <div className="flex flex-col bg-second-color w-[700px] h-36 pt-4 p-4 pb-6 rounded-[2rem] mt-auto mb-8 duration-300 ease-in-out transition-all scrollbar-thin">
        <textarea type="text" placeholder="Message to Robot" className="bg-transparent focus:outline-none w-full h-[80%] resize-none scrollbar-thin"/>
        <div className="flex mt-auto">
            <button className="ml-auto rounded-full bg-gray-500 p-2 flex justify-center items-center">
                <IoSend>
                    
                </IoSend>
            </button>
        </div>
      </div>
    </>
  );
}

export default InputArea;
