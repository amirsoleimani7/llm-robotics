import { useGlobalContext } from "../contextHandle/Context";

export default function ChatDetail() {
  const chat_data = useGlobalContext();

  return (
    <>
      {chat_data.messages.map((m, index) => {
        return (
          <>
            <div className="max-w-[80%] h-auto self-end p-4 bg-second-color rounded-[2rem] break-words">
              {m.user_prompt}
            </div>
            <div className="w-full break-words">{m.llm_response}</div>
          </>
        );
      })}
    </>
  );
}


