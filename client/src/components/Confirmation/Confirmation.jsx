import React from "react";

function Confirmation() {



  return (
    <div className="z-20 absolute w-screen h-screen  bg-main-color-2 bg-[rgba(0, 0, 0, 0.5)] flex justify-center items-center">
        <div className="bg-main-color-3 p-3 w-[320px] h-[120px] font-bold rounded-2xl flex flex-col left-[50%] top-[50%]">
          <h1>This conversation can't be recovered.</h1>
          <div className="w-[60%] flex font-bold text-sm gap-2 self-end mt-auto">
            <button className="bg-main-color-2 px-3 py-2 rounded-[2rem] flex justify-center items-center w-1/3 outline outline-1 outline-gray-600 hover:bg-main-color-3">Cancel</button>
            <button className="bg-red-500 px-3 py-2 rounded-[2rem] flex justify-center items-center w-2/3">Delete chat</button>
          </div>
        </div>
    </div>
  );
}

export default Confirmation;
