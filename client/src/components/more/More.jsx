import React from "react";
import { useState, useRef, useEffect } from "react";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { LuPinOff } from "react-icons/lu";
import { LuPin } from "react-icons/lu";

import { RiShareForwardLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { update_conversations } from "../SideBar/Side";
import axios from "axios";
import { useGlobalContext } from "../contextHandle/Context";
import { createPortal } from "react-dom";

function More({ showMore, positions, is_pinned, conversation_id ,more_ref}) {
  const handler = useGlobalContext();

  console.log("rerender", conversation_id);
  const handle_delete = (e) => {
    e.stopPropagation();
    const { conversationId } = e.currentTarget.dataset;
    console.log("we are in delete");
    handler.setChangeConv(conversationId);
    handler.setShowConfirm(true);
    // update the list of conversations
  };

  const handle_unpin = async (e) => {
    e.stopPropagation();
    const { conversationId } = e.currentTarget.dataset;
    console.log("we are in the unpin section");

    const res = await axios.put(
      `http://127.0.0.1:8000/update_conversation/${conversationId}`,
      {
        command: "unpin-conversation",
      },
    );

    await update_conversations(handler);
  };

  const handle_pin = async (e) => {
    e.stopPropagation();
    const { conversationId } = e.currentTarget.dataset;
    console.log("we are in the pin section");

    const res = await axios.put(
      `http://127.0.0.1:8000/update_conversation/${conversationId}`,
      {
        command: "pin-conversation",
      },
    );

    await update_conversations(handler);
  };

  if (!showMore) {
    return null;
  }

  return createPortal(
    <div
      className="flex text-white  bg-second-color-1 flex-col w-[125px] transition-all duration-100 absolute rounded-xl top-10 -right-[35%] p-1 shadow-lg z-40"
      id="more-div"
      ref={more_ref}
      style={{
        top: `${positions.top >= 790 ? positions.top - 160 : positions.top}px`,
        left: `${positions.left}px`,
        pointerEvents: "auto",
      }}
    >
      <button className="flex items-center gap-1  h-[40px] hover:bg-second-color-2 rounded-xl px-2">
        <MdDriveFileRenameOutline size={20} className="w-1/4" />
        <p className="w-3/4 text-left">Rename</p>
      </button>
      {!is_pinned ? (
        <button
          className="flex items-center gap-1  h-[40px] hover:bg-second-color-2 rounded-xl px-2"
          onClick={handle_pin}
          data-conversation-id={conversation_id}
        >
          <LuPin size={20} className="w-1/4" />{" "}
          <p className="w-3/4 text-left">Pin</p>
        </button>
      ) : (
        <button
          className="flex items-center gap-1  h-[40px] hover:bg-second-color-2 rounded-xl px-2"
          onClick={handle_unpin}
          data-conversation-id={conversation_id}
        >
          <LuPinOff size={20} className="w-1/4" />{" "}
          <p className="w-3/4 text-left">unPin</p>
        </button>
      )}{" "}
      <button className="flex items-center gap-1  h-[40px] hover:bg-second-color-2 rounded-xl px-2">
        <RiShareForwardLine size={20} className="w-1/4" />{" "}
        <p className="w-3/4 text-left">Share</p>
      </button>
      <button
        className="flex items-center gap-1  h-[40px] hover:bg-red-950 text-red-500 rounded-xl px-2"
        onClick={handle_delete}
        data-conversation-id={conversation_id}
      >
        <MdDeleteOutline size={20} className="w-1/4" />{" "}
        <p className="w-3/4 text-left">Delete</p>
      </button>
    </div>,
    document.getElementById("portal"),
  );
}

export default More;
