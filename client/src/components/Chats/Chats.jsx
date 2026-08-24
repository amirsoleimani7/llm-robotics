import React, { useEffect, useState, useRef } from "react";
import { useGlobalContext } from "../contextHandle/Context";
import axios from "axios";
import { FiMoreHorizontal } from "react-icons/fi";
import More from "../more/More";

import { moveToBottom } from "../MainArea/InputArea";

export default function Chats({
  conversation_id,
  created_date,
  last_edited,
  is_pinned,
}) {
  const handler = useGlobalContext();
  const [show_more, setShowMore] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
  });

  const more_ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (more_ref.current && !more_ref.current.contains(event.target)) {
        setShowMore(false);
      }
    }

    if (show_more) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [show_more]);

  const handle_more = (e) => {
    e.stopPropagation();
    // reading conversationId for the more option
    const { conversationId } = e.currentTarget.dataset;
    const rect = e.currentTarget.getBoundingClientRect();

    setPosition({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
    });

    setShowMore(!show_more);
    console.log(`conversation id is : ${conversationId}`);
  };

  const go_to_chat_detail = async (e) => {
    // ✅ Use e.currentTarget, not e.target
    const { dataset } = e.currentTarget;
    const conversationId = dataset.conversationId;
    const createdDate = dataset.createdDate;
    const lastEdited = dataset.lastEdited;

    console.log("Clicked conversation:", conversationId);

    handler.setcurrentconversation({
      conversation_id: conversationId,
      created_at: createdDate,
      lastedited_at: lastEdited,
    });

    // ✅ Use the conversationId from the dataset, not the prop
    const res = await axios.get(
      `http://127.0.0.1:8000/get_conversation/${conversationId}`,
    );

    handler.setMessages(res.data);
    moveToBottom();
  };

  console.log(handler.current_conversation);

  return (
    <>
      <div
        className={`group w-full p-2 rounded-xl duration-75 ease-in-out transition-all dark:hover:bg-second-color-1 hover:bg-select-light-mode hover:cursor-pointer  relative ${conversation_id == handler.current_conversation.conversation_id ? "dark:bg-[#2c2c2e] bg-select-light-mode" : ""}`}
        onClick={go_to_chat_detail}
        data-conversation-id={conversation_id}
        data-created-date={created_date}
        data-last-edited={last_edited}
      >
        {conversation_id}
        <div className="z-10 absolute right-1 top-1 aspect-square rounded-full flex group-hover:opacity-100 opacity-0 justify-center items-center p-2  dark:hover:bg-second-color-2 hover:bg-gray-300 dark:outline-gray-700 dark:hover:outline dark:hover:outline-1 transition-all duration-100 ease-in-out ">
          <button
            className="relative"
            data-conversation-id={conversation_id}
            onClick={handle_more}
            ref={more_ref}
          >
            <FiMoreHorizontal className="pointer-events-none" />
          </button>
        </div>
      </div>

      <More
        showMore={show_more}
        positions={position}
        is_pinned={is_pinned}
        conversation_id={conversation_id}
        more_ref={more_ref}
      />
    </>
  );
}
