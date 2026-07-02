import { useGlobalContext } from "../contextHandle/Context";
import axios from "axios";
import { update_conversations } from "../SideBar/Side";

function Confirmation() {
  const handle = useGlobalContext();

  const handle_cancel = () => {
    handle.setShowConfirm(false);
  };
  
  const handle_delete = async () => {
    handle.setShowConfirm(false);
    const conv_id = handle.change_conv;

    const res = await axios.delete(
      `http://127.0.0.1:8000/delete_conversation/${conv_id}`,
    );
    console.log(res);

    await update_conversations(handle);
    
    console.log("Removing ...");
    handle.setcurrentconversation({});
    handle.setMessages([]);
  };

  return (
    <div
      className="z-50 absolute w-screen h-screen  bg-[rgba(0,0,0,0.8)] flex justify-center items-center"
      style={{
        display: `${handle.show_confim ? "flex" : "none"}`,
      }}
    >
      <div className="dark:bg-main-color-3 bg-white p-3 w-[320px] h-[120px] font-bold rounded-2xl flex flex-col left-[50%] top-[50%]">
        <h1>This conversation can't be recovered.</h1>
        <div className="w-[60%] flex font-bold text-sm gap-2 self-end mt-auto *:transition-all *:duration-200 *:ease-in-out">
          <button
            className="dark:bg-main-color-2  bg-white px-3 py-2 rounded-[2rem] flex justify-center items-center w-1/3 outline outline-1 outline-gray-600 dark:hover:bg-main-color-3 hover:bg-gray-200 "
            onClick={handle_cancel}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white  px-3 py-2 rounded-[2rem] flex justify-center items-center w-2/3 hover:bg-red-700"
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
