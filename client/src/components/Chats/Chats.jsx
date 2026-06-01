import React from "react";
import { useGlobalContext } from "../contextHandle/Context";
import axios from "axios";

export default function Chats({ conversation_id, created_date, last_edited }) {
  const handler = useGlobalContext();
  const go_to_chat_detail = async (e) => {
    const { conversationId, createdDate, lastEdited } = e.currentTarget.dataset;
    handler.setcurrentconversation({
      conv_id: conversationId,
      created_at: createdDate,
      last_edited: lastEdited,
    });

    const res = await axios.get(`http://127.0.0.1:8000/get_conversation/${conversation_id}`);    
    // loading initial data
    handler.setMessages(res.data);    
    
  };

  return (
    <>
      <div
        className="w-full p-2 rounded-xl duration-100 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer hover:font-bold"
        onClick={go_to_chat_detail}
        data-conversation-id={conversation_id}
        data-created-date={created_date}
        data-last-edited={last_edited}
      >
        {conversation_id}
      </div>
    </>
  );
}
