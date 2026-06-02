import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contextHandle/Context";
import axios from "axios";
import { FiMoreHorizontal } from "react-icons/fi";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { BsPinAngle } from "react-icons/bs";
import { RiShareForwardLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";

export default function Chats({ conversation_id, created_date, last_edited }) {
  const handler = useGlobalContext();
  const [show_more, setShowMore] = useState(false);

  const go_to_chat_detail = async (e) => {
    const { conversationId, createdDate, lastEdited } = e.currentTarget.dataset;
    handler.setcurrentconversation({
      conversation_id: conversationId,
      created_at: createdDate,
      lastedited_at: lastEdited,
    });

    const res = await axios.get(
      `http://127.0.0.1:8000/get_conversation/${conversation_id}`,
    );

    // loading initial data
    handler.setMessages(res.data);
  };

  const handle_more = (e) => {
    // reading conversationId for the more option
    const { conversationId } = e.currentTarget.dataset;

    console.log(conversationId);
  };

  return (
    <>
      <div
        className="group w-full p-2 rounded-xl duration-75 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer  relative"
        onClick={go_to_chat_detail}
        data-conversation-id={conversation_id}
        data-created-date={created_date}
        data-last-edited={last_edited}
        style={{
          backgroundColor: `${conversation_id == handler.current_conversation.conversation_id ? "#363738" : ""}`,
        }}
      >
        {conversation_id}
        <div className="z-10 absolute right-1 top-1 aspect-square rounded-full flex group-hover:opacity-100 opacity-0 justify-center items-center p-2  hover:bg-second-color-1 outline-gray-700 hover:outline hover:outline-1">
          <button
            className="relative"
            data-conversation-id={conversation_id}
            onClick={handle_more}
          >
            <FiMoreHorizontal />
          </button>
        </div>
        <div className="flex  bg-second-color-1 flex-col w-[130px] absolute rounded-lg  right-0 p-1 shadow-lg">
          <button className="flex items-center gap-1  h-[40px] hover:bg-main-color-1 rounded-lg px-2">
            <MdDriveFileRenameOutline size={20} className="w-1/4" />
            <p className="w-3/4 text-left">Rename</p>
          </button>
          <button className="flex items-center gap-1  h-[40px] hover:bg-main-color-1 rounded-lg px-2">
            <BsPinAngle size={20}  className="w-1/4" /> <p className="w-3/4 text-left">Pin</p>
          </button>
          <button className="flex items-center gap-1  h-[40px] hover:bg-main-color-1 rounded-lg px-2">
            <RiShareForwardLine size={20} className="w-1/4" />{" "}
            <p className="w-3/4 text-left">Share</p>
          </button>
          <button className="flex items-center gap-1  h-[40px] hover:bg-main-color-1 rounded-lg px-2">
            <MdDeleteOutline size={20} className="w-1/4" />{" "}
            <p className="w-3/4 text-left">Delete</p>
          </button>
        </div>
      </div>
    </>
  );
}
