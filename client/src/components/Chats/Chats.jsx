import React from "react";


export default function Chats({ conversation_id, created_date, last_edited }) {
  
  const go_to_chat_detail = () => {};

  return (
    <>
      <div
        className="w-full p-2 rounded-xl duration-100 ease-in-out transition-all hover:bg-second-color-1 hover:cursor-pointer"
        onClick={go_to_chat_detail}
      >
        {
          conversation_id
        }
      </div>
    </>
  );
}
