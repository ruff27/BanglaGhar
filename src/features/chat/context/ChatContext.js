// src/features/chat/context/ChatContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import useAblyClient from "../hooks/useAblyClient"; //
import { useSnackbar } from "../../../context/SnackbarContext"; // Import useSnackbar here

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { ably, isAblyConnected, ablyError } = useAblyClient(); // This hook still manages the Ably client
  const { showSnackbar } = useSnackbar(); // Get showSnackbar function

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationData, setActiveConversationData] = useState(null);
  // You might also want to store activeConversationData here if needed globally by other components
  // const [activeConversationData, setActiveConversationData] = useState(null);

  const selectConversation = useCallback(
    (conversationData) => {
      if (conversationData && conversationData._id) {
        console.log(
          "[ChatContext] Setting active conversation:",
          conversationData
        );
        setActiveConversationId(conversationData._id);
        setActiveConversationData(conversationData); // Store the whole object
      } else if (conversationData === null) {
        console.log("[ChatContext] Clearing active conversation.");
        setActiveConversationId(null);
        setActiveConversationData(null); // Clear the object too
      } else {
        // This case might occur if only an ID is passed, but ChatPage now tries to pass the object.
        // If conversationData is just an ID string (e.g., from URL param not yet resolved to full object):
        if (typeof conversationData === "string" && conversationData) {
          // Check if it's just an ID string
          console.log(
            "[ChatContext] Setting active conversationId by ID string:",
            conversationData
          );
          setActiveConversationId(conversationData);
          setActiveConversationData(null); // Full data would need to be fetched by ChatWindow/ConversationList
        } else {
          console.warn(
            "[ChatContext] Attempted to select invalid or incomplete conversation data:",
            conversationData
          );
        }
      }
    },
    [activeConversationId]
  );

  // This function will be called by useAblyClient when a notification arrives
  const handleIncomingMessageNotification = useCallback(
    (notificationData) => {
      console.log(
        "[ChatContext] Handling incoming message notification:",
        notificationData
      );
      console.log(
        "[ChatContext] Current activeConversationId:",
        activeConversationId
      );

      // Only show snackbar if the notification is for a DIFFERENT conversation
      // or if no conversation is active (activeConversationId is null)
      if (activeConversationId !== notificationData.conversationId) {
        showSnackbar(
          `${notificationData.title || "New Message"}: ${
            notificationData.body || ""
          }`,
          "info"
        );
      }
      // Here, you would also typically trigger logic to update unread counts for the specific conversationId
      // e.g., incrementUnreadCount(notificationData.conversationId);
    },
    [activeConversationId, showSnackbar]
  );

  return (
    <ChatContext.Provider
      value={{
        ably,
        isAblyConnected,
        ablyError,
        activeConversationId, // Provide activeConversationId
        activeConversationData,
        // activeConversationData, // Provide if you store it here
        selectConversation, // Provide function to set active conversation
        handleIncomingMessageNotification, // Provide handler for Ably hook
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext };
