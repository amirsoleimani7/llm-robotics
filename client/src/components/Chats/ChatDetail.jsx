// ChatDetail.js
import { useGlobalContext } from "../contextHandle/Context";
import React, { useEffect } from "react";

export default function ChatDetail() {
  const handler = useGlobalContext();
  useEffect(() => {
    console.log(handler.current_conversation);
    
  }, [handler.current_conversation]);

  const { messages } = useGlobalContext();

  return (
    <>
      {messages.map((m, index) => (
        <>
          {m.role === "user" ? (
            <div className="max-w-[80%] h-auto self-end p-4 bg-second-color rounded-[2rem] break-words" key={index}>
              {m.content}
            </div>
          ) : (
            <div className="w-full break-words" key={index}>
              <p>
                {m.content.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < m.content.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          )}
        </>
      ))}
    </>
  );
}
