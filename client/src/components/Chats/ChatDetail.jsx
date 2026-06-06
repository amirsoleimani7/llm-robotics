import { useGlobalContext } from "../contextHandle/Context";
import React, { useEffect } from "react";

export default function ChatDetail() {
  const handler = useGlobalContext();

  useEffect(() => {
  }, [handler.current_conversation]);

  const { messages } = useGlobalContext();

  return (
    <>
      {messages.map((m, index) => (
        <React.Fragment key={index}>
          {m.role === "user" && m.content && m.content !== "" ? (
            <div className="max-w-[80%] h-auto self-end p-4 bg-second-color rounded-[2rem] break-words">
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
            </div>
          ) : null}
        </React.Fragment>
      ))}
      {handler.is_loading ? (
        <div
          className={`flex gap-2 items-center scale-[.90] mr-auto  duration-100`}
        >
          <div className="loader"></div>
          <p className="font-bold">Planning Actions ...</p>
        </div>
      ) : null}
    </>
  );
}
