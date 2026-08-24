// import { useState } from "react";
// import { IoSend } from "react-icons/io5";
// import { LuBrain } from "react-icons/lu";
// import { MdOutlineKeyboardVoice } from "react-icons/md";
// import { useGlobalContext } from "../contextHandle/Context";
// import { update_conversations } from "../SideBar/Side";
// import axios from "axios";
// import { Tooltip } from "antd";
// import { useSpeechRecognition } from 'react-speech-kit';

// export function moveToBottom() {
//   setTimeout(() => {
//     const container = document.getElementById("chatDetailContainer");
//     if (container) {
//       container.scrollTop = container.scrollHeight;
//     }
//   }, 100);
// }

// function InputArea() {
//   const global_handler = useGlobalContext();
//   const [is_voice, SetIsVoice] = useState(true);
//   const [input, setInput] = useState("");
//   const [high_len, setHighlen] = useState(false);

//   const handle_user_input = async (e) => {
//     const input = e.target.value;

//     // checks
//     input !== "" ? SetIsVoice(false) : SetIsVoice(true);
//     input.length > 148 ? setHighlen(true) : setHighlen(false);

//     setInput(input);
//   };

//   const handle_input = async (e) => {
//     if (e) {
//       e.preventDefault();
//     }

//     // clearing the input field after submitsion
//     document.getElementById("user-input").value = "";
//     document.getElementById("user-input").selectionStart = 0;

//     moveToBottom();

//     if (input.length > 0) {
//       try {
//         const conv = global_handler.current_conversation;

//         if (Object.keys(conv).length !== 0) {
//           const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
//             command: "new_message",
//             conversaion: global_handler.current_conversation,
//             role: "user",
//             content: input,
//           });

//           global_handler.addUserMessage(response.data);
//           global_handler.setIsLoading(true);

//           const prompt_response = await axios.post(
//             `http://127.0.0.1:8000/handle_prompt`,
//             {
//               commnad: "handle_prompt",
//               conversation: global_handler.current_conversation,
//               content: input,
//             },
//           );

//           global_handler.setIsLoading(false);
//           global_handler.addLLMResponse(prompt_response.data);

//           moveToBottom();
//         } else {
//           // make a conversation and put the messages in it
//           const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
//             command: "new_chat",
//           });

//           global_handler.setcurrentconversation(response.data);
//           await update_conversations(global_handler);

//           const response_msg = await axios.post(
//             `http://127.0.0.1:8000/make_chat`,
//             {
//               command: "new_message",
//               conversaion: response.data,
//               role: "user",
//               content: input,
//             },
//           );

//           global_handler.addUserMessage(response_msg.data);
//           global_handler.setIsLoading(true);

//           const prompt_response = await axios.post(
//             `http://127.0.0.1:8000/handle_prompt`,
//             {
//               commnad: "handle_prompt",
//               conversation: response.data,
//               content: input,
//             },
//           );

//           global_handler.setIsLoading(false);
//           global_handler.addLLMResponse(prompt_response.data);
//           moveToBottom();
//         }
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     }
//   };

//   return (
//     <>
//       <form
//         className="flex flex-col bg-white  dark:bg-second-color w-full h-36 p-6 rounded-[2rem]  mb-2 duration-500 ease-in-out transition-all border border-gray-300  dark:border-gray-700 max-md:h-28 max-md:text-sm max-md:p-4 shadow-md"
//         style={{
//           height: `${high_len ? "230px" : ""}`,
//         }}
//       >
//         <textarea
//           id="user-input"
//           type="text"
//           placeholder="Message to Robot"
//           onChange={handle_user_input}
//           className="bg-transparent focus:outline-none w-full h-[80%] resize-none dark:text-white text-black scrollbar-thin dark:scrollbar-thumb-[#3c3c3d]  dark:scrollbar-track-second-color scrollbar-thumb-[#e6e8ea] scrollbar-track-white "
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               handle_input();
//             }
//           }}
//         />

//         <div className="flex justify-between mt-auto w-full">
//           <Tooltip
//             title={"change model"}
//             color={"#353638"}
//             mouseEnterDelay={0}
//             mouseLeaveDelay={0}
//           >
//             <button className="flex items-center justify-center gap-1 border dark:hover:bg-main-color-2 px-2 border-gray-300 dark:border-gray-700 rounded-[2rem] text-sm hover:bg-select-light-mode">
//               <LuBrain></LuBrain>
//               <p>Model</p>
//             </button>
//           </Tooltip>
//           <Tooltip
//             title={
//               global_handler.is_loading
//                 ? "stop"
//                 : !is_voice
//                   ? "send command"
//                   : "use voice mode"
//             }
//             color={"#353638"}
//             mouseEnterDelay={0}
//             mouseLeaveDelay={0}
//           >
//             <button
//               className="ml-auto rounded-full p-2 flex justify-center items-center border border-gray-300 dark:border-gray-700 duration-200 w-10 h-10 aspect-square ease-in-out dark:hover:bg-main-color-2 hover:bg-select-side-light-mode transition-all dark:text-white"
//               style={{
//                 background: `${!is_voice ? "#3964fe" : ""}`,
//                 color: `${!is_voice ? "white" : ""}`,
//               }}
//               onClick={handle_input}
//             >
//               {global_handler.is_loading ? (
//                 <div className="w-[50%] h-[50%] bg-main-color-"></div>
//               ) : (
//                 <div>
//                   {is_voice ? (
//                     <MdOutlineKeyboardVoice></MdOutlineKeyboardVoice>
//                   ) : (
//                     <IoSend></IoSend>
//                   )}
//                 </div>
//               )}
//             </button>
//           </Tooltip>
//         </div>
//       </form>
//     </>
//   );
// }

// export default InputArea;
import { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";
import { MdOutlineKeyboardVoice, MdStop } from "react-icons/md";
import { useGlobalContext } from "../contextHandle/Context";
import { update_conversations } from "../SideBar/Side";
import axios from "axios";
import { Tooltip } from "antd";

export function moveToBottom() {
  setTimeout(() => {
    const container = document.getElementById("chatDetailContainer");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 100);
}

function InputArea() {
  const global_handler = useGlobalContext();
  const [is_voice, SetIsVoice] = useState(true);
  const [input, setInput] = useState("");
  const [high_len, setHighlen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(true);

  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupport(false);
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    // Create recognition instance
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.maxAlternatives = 1;

    // Handle results
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Use final transcript if available, otherwise use interim
      const result = finalTranscript || interimTranscript;

      if (result) {
        setInput(result);
        if (inputRef.current) {
          inputRef.current.value = result;
          // Trigger change event
          const changeEvent = new Event("change", { bubbles: true });
          inputRef.current.dispatchEvent(changeEvent);
        }
        // Update voice state
        result !== "" ? SetIsVoice(false) : SetIsVoice(true);
        result.length > 148 ? setHighlen(true) : setHighlen(false);
      }
    };

    // Handle end of speech
    recognitionRef.current.onend = () => {
      setIsListening(false);
      // If we have input, automatically send it
      if (input.trim().length > 0) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          handleSendMessage();
        }, 300);
      }
    };

    // Handle errors
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      // Handle specific errors
      if (event.error === "not-allowed") {
        alert("Please allow microphone access to use voice input");
      } else if (event.error === "no-speech") {
        // Silent fail for no speech
        setIsListening(false);
      }
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Handle sending message
  const handleSendMessage = async () => {
    const messageToSend = input.trim();

    if (!messageToSend) {
      return;
    }

    // Clear input
    setInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    SetIsVoice(true);

    moveToBottom();

    try {
      const conv = global_handler.current_conversation;

      if (Object.keys(conv).length !== 0) {
        const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
          command: "new_message",
          conversaion: global_handler.current_conversation,
          role: "user",
          content: messageToSend,
        });

        global_handler.addUserMessage(response.data);
        global_handler.setIsLoading(true);

        const prompt_response = await axios.post(
          `http://127.0.0.1:8000/handle_prompt`,
          {
            commnad: "handle_prompt",
            conversation: global_handler.current_conversation,
            content: messageToSend,
          },
        );

        global_handler.setIsLoading(false);
        global_handler.addLLMResponse(prompt_response.data);

        moveToBottom();
      } else {
        // make a conversation and put the messages in it
        const response = await axios.post(`http://127.0.0.1:8000/make_chat`, {
          command: "new_chat",
        });

        global_handler.setcurrentconversation(response.data);
        await update_conversations(global_handler);

        const response_msg = await axios.post(
          `http://127.0.0.1:8000/make_chat`,
          {
            command: "new_message",
            conversaion: response.data,
            role: "user",
            content: messageToSend,
          },
        );

        global_handler.addUserMessage(response_msg.data);
        global_handler.setIsLoading(true);

        const prompt_response = await axios.post(
          `http://127.0.0.1:8000/handle_prompt`,
          {
            commnad: "handle_prompt",
            conversation: response.data,
            content: messageToSend,
          },
        );

        global_handler.setIsLoading(false);
        global_handler.addLLMResponse(prompt_response.data);
        moveToBottom();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handle_user_input = async (e) => {
    const inputValue = e.target.value;

    // checks
    inputValue !== "" ? SetIsVoice(false) : SetIsVoice(true);
    inputValue.length > 148 ? setHighlen(true) : setHighlen(false);

    setInput(inputValue);
  };

  const handle_input = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // If we're listening, stop and send
    if (isListening) {
      stopListening();
      return;
    }

    // If voice mode is on and no input, start listening
    if (is_voice && !input.trim()) {
      startListening();
      return;
    }

    // Otherwise send the message
    await handleSendMessage();
  };
  

  const startListening = () => {
    if (!recognitionRef.current) {
      if (!browserSupport) {
        alert(
          "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.",
        );
      }
      return;
    }

    try {
      // Clear any previous input
      setInput("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
    setIsListening(false);
  };

  // Handle button click
  const handleButtonClick = async () => {
    // If loading, do nothing
    if (global_handler.is_loading) return;

    // If listening, stop and send
    if (isListening) {
      stopListening();
      // The onend event will handle sending
      return;
    }

    // If voice mode is active, start listening
    if (is_voice && !input.trim()) {
      startListening();
      return;
    }

    // Otherwise send the message
    await handleSendMessage();
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleButtonClick();
    }
  };

  // Check if browser supports speech recognition
  if (!browserSupport) {
    console.warn("Speech recognition not supported");
  }

  return (
    <>
      <form
        className="flex flex-col bg-white dark:bg-second-color w-full h-36 p-6 rounded-[2rem] mb-2 duration-500 ease-in-out transition-all border border-gray-300 dark:border-gray-700 max-md:h-28 max-md:text-sm max-md:p-4 shadow-md"
        style={{
          height: `${high_len ? "230px" : ""}`,
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <textarea
          ref={inputRef}
          id="user-input"
          type="text"
          placeholder={
            isListening ? "🎤 Listening... Speak now" : "Message to Robot"
          }
          onChange={handle_user_input}
          className="bg-transparent focus:outline-none w-full h-[80%] resize-none dark:text-white text-black scrollbar-thin dark:scrollbar-thumb-[#3c3c3d] dark:scrollbar-track-second-color scrollbar-thumb-[#e6e8ea] scrollbar-track-white"
          onKeyDown={handleKeyDown}
          value={input}
        />

        <div className="flex justify-between mt-auto w-full">
          <Tooltip
            title={"change model"}
            color={"#353638"}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <button
              type="button"
              className="flex items-center justify-center gap-1 border dark:hover:bg-main-color-2 px-2 border-gray-300 dark:border-gray-700 rounded-[2rem] text-sm hover:bg-select-light-mode"
            >
              <LuBrain />
              <p>Model</p>
            </button>
          </Tooltip>
          <Tooltip
            title={
              global_handler.is_loading
                ? "Loading..."
                : isListening
                  ? "Stop listening and send"
                  : is_voice
                    ? "Start voice input"
                    : "Send message"
            }
            color={"#353638"}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <button
              type="button"
              className="ml-auto rounded-full p-2 flex justify-center items-center border border-gray-300 dark:border-gray-700 duration-200 w-10 h-10 aspect-square ease-in-out dark:hover:bg-main-color-2 hover:bg-select-side-light-mode transition-all dark:text-white"
              style={{
                background: `${isListening ? "#3964fe" : !is_voice ? "#3964fe" : ""}`,
                color: `${isListening || !is_voice ? "white" : ""}`,
              }}
              onClick={handleButtonClick}
            >
              {global_handler.is_loading ? (
                <div className="w-[50%] h-[50%] bg-main-color-"></div>
              ) : (
                <div>
                  {isListening ? (
                    <MdStop />
                  ) : is_voice ? (
                    <MdOutlineKeyboardVoice />
                  ) : (
                    <IoSend />
                  )}
                </div>
              )}
            </button>
          </Tooltip>
        </div>
      </form>

      {/* Voice indicator */}
      {isListening && (
        <div className="text-center text-sm text-blue-500 animate-pulse mt-1">
          🎤 Listening... Speak clearly
        </div>
      )}

      {/* Browser support warning */}
      {!browserSupport && (
        <div className="text-center text-xs text-yellow-500 mt-1">
          ⚠️ Voice input not supported in this browser. Please use Chrome, Edge,
          or Safari.
        </div>
      )}
    </>
  );
}

export default InputArea;
