// src/features/chat/context/ChatContext.js
import React, { createContext, useContext } from "react";
import useAblyClient from "../hooks/useAblyClient"; // Ensure path is correct

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  // Use the renamed state variables from useAblyClient
  const { ably, isAblyConnected, ablyError } = useAblyClient();

  return (
    <ChatContext.Provider value={{ ably, isAblyConnected, ablyError }}>
      {children}
    </ChatContext.Provider>
  );
};
