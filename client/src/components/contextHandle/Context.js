import React, { useContext, useState } from "react";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [current_conversation, setcurrentconversation] = useState({});

  const addUserMessage = (user_prompt) => {
    setMessages((prev) => [...prev, user_prompt]);
  };

  // Add LLM response
  const addLLMResponse = (llm_response) => {
    setMessages((prev) => [...prev, llm_response]);
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
        setMessages,
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
