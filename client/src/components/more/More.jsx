import React from "react";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { LuPinOff } from "react-icons/lu";
import { LuPin } from "react-icons/lu";
import { RiShareForwardLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { update_conversations } from "../SideBar/Side";
import axios from "axios";
import { useGlobalContext } from "../contextHandle/Context";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

function More({ showMore, positions, is_pinned, conversation_id, more_ref }) {
  const handler = useGlobalContext();

  const handle_delete = (e) => {
    e.stopPropagation();
    const { conversationId } = e.currentTarget.dataset;
    handler.setChangeConv(conversationId);
    handler.setShowConfirm(true);
  };

  const handle_unpin = async (e) => {
    e.stopPropagation();
    const { conversationId } = e.currentTarget.dataset;

    await axios.put(
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

    await axios.put(
      `http://127.0.0.1:8000/update_conversation/${conversationId}`,
      {
        command: "pin-conversation",
      },
    );

    await update_conversations(handler);
  };

  // Fixed: Proper return with conditional rendering
  if (!showMore) return null;

  return createPortal(
    <div
      className="flex dark:text-white bg-white dark:bg-second-color-1 flex-col w-[125px] transition-all duration-100 absolute rounded-xl top-10 -right-[35%] p-1 shadow-lg z-40"
      id="more-div"
      ref={more_ref}
      style={{
        top: `${positions.top >= 790 ? positions.top - 160 : positions.top}px`,
        left: `${positions.left}px`,
        pointerEvents: "auto",
      }}
    >
      {!is_pinned ? (
        <button
          className="flex items-center gap-1 h-[40px] hover:bg-select-light-mode dark:hover:bg-second-color-2 rounded-xl px-2"
          onClick={handle_pin}
          data-conversation-id={conversation_id}
        >
          <LuPin size={20} className="w-1/4" />
          <p className="w-3/4 text-left">Pin</p>
        </button>
      ) : (
        <button
          className="flex items-center gap-1 h-[40px] hover:bg-select-light-mode dark:hover:bg-second-color-2 rounded-xl px-2"
          onClick={handle_unpin}
          data-conversation-id={conversation_id}
        >
          <LuPinOff size={20} className="w-1/4" />
          <p className="w-3/4 text-left">unPin</p>
        </button>
      )}
      <button
        className="flex items-center gap-1 h-[40px] dark:hover:bg-red-950 hover:bg-red-100 text-red-500 rounded-xl px-2 font-semibold"
        onClick={handle_delete}
        data-conversation-id={conversation_id}
      >
        <MdDeleteOutline size={20} className="w-1/4" />
        <p className="w-3/4 text-left">Delete</p>
      </button>
    </div>,
    document.getElementById("portal")
  );
}

export default More;


// /*
//     createPortal(
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 10 }}
//           transition={{ duration: 0.1 }}
//           className="flex  dark:text-white bg-white   dark:bg-second-color-1 flex-col w-[125px] transition-all duration-100 absolute rounded-xl top-10 -right-[35%] p-1 shadow-lg z-40"
//           id="more-div"
//           ref={more_ref}
//           style={{
//             top: `${positions.top >= 790 ? positions.top - 160 : positions.top}px`,
//             left: `${positions.left}px`,
//             pointerEvents: "auto",
//           }}
//         >
//           {/* <button className="flex items-center gap-1  h-[40px] hover:bg-select-light-mode dark:hover:bg-second-color-2 rounded-xl px-2">
//         <MdDriveFileRenameOutline size={20} className="w-1/4" />
//         <p className="w-3/4 text-left">Rename</p>
//       </button> */}
//           {!is_pinned ? (
//             <button
//               className="flex items-center gap-1  h-[40px] hover:bg-select-light-mode  dark:hover:bg-second-color-2 rounded-xl px-2"
//               onClick={handle_pin}
//               data-conversation-id={conversation_id}
//             >
//               <LuPin size={20} className="w-1/4" />{" "}
//               <p className="w-3/4 text-left">Pin</p>
//             </button>
//           ) : (
//             <button
//               className="flex items-center gap-1  h-[40px] hover:bg-select-light-mode dark:hover:bg-second-color-2 rounded-xl px-2"
//               onClick={handle_unpin}
//               data-conversation-id={conversation_id}
//             >
//               <LuPinOff size={20} className="w-1/4" />{" "}
//               <p className="w-3/4 text-left">unPin</p>
//             </button>
//           )}{" "}
//           {/* <button className="flex items-center gap-1  h-[40px] hover:bg-select-light-mode dark:hover:bg-second-color-2 rounded-xl px-2">
//         <RiShareForwardLine size={20} className="w-1/4" />{" "}
//         <p className="w-3/4 text-left">Share</p>
//       </button> */}
//           <button
//             className="flex items-center gap-1  h-[40px] dark:hover:bg-red-950 hover:bg-red-100  text-red-500 rounded-xl px-2 font-semibold"
//             onClick={handle_delete}
//             data-conversation-id={conversation_id}
//           >
//             <MdDeleteOutline size={20} className="w-1/4" />{" "}
//             <p className="w-3/4 text-left">Delete</p>
//           </button>
//         </motion.div>,
//         document.getElementById("portal"),
//       );

//  */
