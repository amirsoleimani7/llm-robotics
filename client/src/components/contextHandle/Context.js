import React, { useContext, useState } from "react";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  
  const [messages, setMessages] = useState([]);

  const handle_messages = (user_prompt, llm_response) => {
    const current_pair = {
      user_prompt,
      llm_response,
    };
    setMessages((prev) => [...prev, current_pair]);
  };
  console.log(messages);

  return <AppContext.Provider value={{messages,handle_messages}}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
