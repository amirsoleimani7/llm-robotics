import React, { useContext, useState } from "react";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [current_conversation, setcurrentconversation] = useState({});
  
  const addUserMessage = (user_prompt) => {
    const userMessage = {
      type: "user",
      content: user_prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  // Add LLM response
  const addLLMResponse = (llm_response) => {
    const llmMessage = {
      type: "assistant",
      content: llm_response,
    };

    setMessages((prev) => [...prev, llmMessage]);
  };

  const handle_messages = (user_prompt, llm_response) => {
    addUserMessage(user_prompt);
    addLLMResponse(llm_response);
  };

  return (
    <AppContext.Provider
      value={{
        messages,
        addUserMessage,
        addLLMResponse,
        handle_messages,
        conversations,
        setConversations,
        current_conversation,
        setcurrentconversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
