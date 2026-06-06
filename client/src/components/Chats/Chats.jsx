import { useEffect, useState, useRef } from "react";
import { useGlobalContext } from "../contextHandle/Context";
import axios from "axios";
import { FiMoreHorizontal } from "react-icons/fi";
export default function Chats({
  conversation_id,
  created_date,
  last_edited,
  is_pinned,
}) {
  
  const handler = useGlobalContext();
  const [show_more, setShowMore] = useState(false);
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
    setShowMore(!show_more);
    console.log(conversationId);
  };

  const handle_delete = (e) => {
    const { conversationId } = e.currentTarget.dataset;
    handler.setChangeConv(conversationId);
    handler.setShowConfirm(true);

    // update the list of conversations
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
            ref={more_ref}
          >
            <FiMoreHorizontal className="pointer-events-none" />
          </button>
        </div>
        
      </div>
      
    </>
  );
}
