import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contextHandle/Context";
import { IoSearch } from "react-icons/io5";

function Confirmation() {
  const handle = useGlobalContext();

  const handle_cancel = () => {
    handle.setShowConfirm(false);
  };

  const handle_delete = () => {
    handle.setShowConfirm(false);
  };

  return (
    <div
      className="z-50 absolute w-screen h-screen  bg-[rgba(0,0,0,0.8)] flex justify-center items-center"
      style={{
        display: `${handle.show_confim ? "flex" : "none"}`,
      }}
    >
      <div className="bg-main-color-3 p-3 w-[320px] h-[120px] font-bold rounded-2xl flex flex-col left-[50%] top-[50%]">
        <h1>This conversation can't be recovered.</h1>
        <div className="w-[60%] flex font-bold text-sm gap-2 self-end mt-auto">
          <button
            className="bg-main-color-2 px-3 py-2 rounded-[2rem] flex justify-center items-center w-1/3 outline outline-1 outline-gray-600 hover:bg-main-color-3"
            onClick={handle_cancel}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 px-3 py-2 rounded-[2rem] flex justify-center items-center w-2/3"
            onClick={handle_delete}
          >
            Delete chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;
