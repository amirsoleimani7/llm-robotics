import { useGlobalContext } from "../contextHandle/Context";
import React, { useEffect } from "react";
import Typewriter from "./typewriter";


export default function ChatDetail({ covnersation_id }) {

  const handler = useGlobalContext();

  
  const { messages } = useGlobalContext();
  
  return (
    <div className="w-full gap-1 h-fit flex flex-col" id="detailDiv">
      {messages.map((m, index) => (
        <React.Fragment key={index}>
          {m.role === "user" && m.content && m.content !== "" ? (
            <div className="max-w-[80%] h-auto self-end p-4 dark:bg-second-color bg-select-side-light-mode rounded-[2rem] break-words">
              {m.content}
            </div>
          ) : m.content ? (
            <div className="w-full break-words font-bold transition-all duration-300">
              <p>
                {m.content.split("\n").map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < m.content.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <div className="w-1/2 h-80  rounded-xl bg-main-color-2 overflow-hidden">
                {/* video should go here */}
                <video src="" controls className="w-full h-full "></video>
              </div>
            </div>
          ) : null}
        </React.Fragment>
      ))}
      {handler.is_loading ? (
        <div
          className={`flex gap-1 items-center scale-[.90] mr-auto  duration-100`}
        >
          <div className="loader left-0 right-auto"> </div>
          <Typewriter text="Planning Actions ..." speed={150} 
          className={"text-sm w-[200px] font-semibold"}/>
        </div>
      ) : null}
    </div>
  );
}
