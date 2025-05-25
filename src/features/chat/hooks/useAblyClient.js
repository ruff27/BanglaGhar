// src/features/chat/hooks/useAblyClient.js
import { useState, useEffect, useRef } from "react";
import Ably from "ably";
import { getAblyTokenRequest } from "../services/chatService"; //
import { useAuth } from "../../../context/AuthContext"; //
import { useSnackbar } from "../../../context/SnackbarContext"; // NEW IMPORT
// Assuming ChatPage is where activeConversationId is managed, or pass it down if needed for notification logic
// import { useLocation } from 'react-router-dom'; // To check current path

let ablyClient = null; //

const useAblyClient = () => {
  const {
    idToken, //
    isLoggedIn, //
    user,
    isLoading: isAuthLoading, //
  } = useAuth();
  const { showSnackbar } = useSnackbar(); // Initialize snackbar hook
  // const location = useLocation(); // To check if user is currently on /chat page

  const [isAblyConnected, setIsAblyConnected] = useState(false); //
  const [ablyError, setAblyError] = useState(null); //
  const isInitializing = useRef(false); //

  // Ref to store the notification channel
  const notificationChannelRef = useRef(null);

  // console.log('[useAblyClient] Auth State:', { //
  //   isAuthenticated: isLoggedIn, //
  //   hasToken: !!idToken, //
  //   userSub: user?.cognitoSub, //
  //   userId: user?._id, // MongoDB _id for notification channel
  //   isAuthLoading //
  // });

  useEffect(() => {
    if (isAuthLoading) {
      //
      // console.log('[useAblyClient] Authentication is loading. Waiting...'); //
      return; //
    }

    // Critical: Ensure user and user._id (MongoDB ID) are available for notification channel
    if (!isLoggedIn || !idToken || !user?.cognitoSub || !user?._id) {
      //
      if (ablyClient) {
        //
        console.log(
          "[Ably] User logged out or essential auth data unavailable. Closing Ably connection."
        ); //
        ablyClient.close(); //
        ablyClient = null; //
        setIsAblyConnected(false); //
        if (notificationChannelRef.current) {
          notificationChannelRef.current.detach(); // Detach from notification channel
          notificationChannelRef.current = null;
        }
      }
      return; //
    }

    if (ablyClient && ablyClient.connection.state === "connected") {
      //
      if (ablyClient.auth.clientId === user.cognitoSub) {
        //
        setIsAblyConnected(true); //
        // Ensure notification channel is subscribed if client already exists
        if (!notificationChannelRef.current && ablyClient && user?._id) {
          const userNotificationChannelName = `user-notifications-${user._id}`;
          notificationChannelRef.current = ablyClient.channels.get(
            userNotificationChannelName
          );
          notificationChannelRef.current.subscribe(
            "new-message-notification",
            (message) => {
              console.log("[Ably User Notification] Received:", message.data);
              // TODO: Check if the user is currently viewing this specific conversation
              // For now, always show snackbar.
              // const currentPath = location.pathname;
              // const onChatPageForThisConvo = currentPath.startsWith('/chat') && activeConversationId === message.data.conversationId;
              // if (!onChatPageForThisConvo) {
              showSnackbar(
                `${message.data.title || "New message"}: ${
                  message.data.body || ""
                }`,
                "info"
              );
              // }
              // Here you could also update a global unread message count
            }
          );
          console.log(
            `[Ably User Notification] Subscribed to ${userNotificationChannelName}`
          );
        }
        return; //
      } else {
        console.log("[Ably] User changed. Closing old Ably connection."); //
        ablyClient.close(); //
        ablyClient = null; //
        if (notificationChannelRef.current) {
          notificationChannelRef.current.detach();
          notificationChannelRef.current = null;
        }
      }
    }

    if (
      isInitializing.current ||
      (ablyClient && ablyClient.connection.state !== "closed")
    ) {
      //
      return; //
    }

    const initializeAbly = async () => {
      //
      if (isInitializing.current) return; //
      isInitializing.current = true; //
      setAblyError(null); //
      console.log(
        "[Ably] Initializing connection for clientId (Cognito Sub):",
        user.cognitoSub
      ); //

      try {
        const client = new Ably.Realtime({
          //
          authCallback: async (tokenParams, callback) => {
            //
            try {
              console.log(
                "[Ably AuthCallback] Requesting new token from backend..."
              ); //
              const tokenRequest = await getAblyTokenRequest(idToken); //
              callback(null, tokenRequest); //
            } catch (err) {
              console.error("[Ably AuthCallback] Error fetching token:", err); //
              setAblyError(err); //
              callback(err, null); //
            }
          },
          clientId: user.cognitoSub, //
        });

        client.connection.on("connected", () => {
          //
          console.log("[Ably] Successfully connected!"); //
          setIsAblyConnected(true); //
          setAblyError(null); //
          ablyClient = client; //
          isInitializing.current = false; //

          // Subscribe to user-specific notification channel
          if (user?._id) {
            // Check if user._id (MongoDB ID) is available
            const userNotificationChannelName = `user-notifications-${user._id}`;
            // Detach from any old channel instance before getting a new one
            if (notificationChannelRef.current) {
              notificationChannelRef.current.detach();
            }
            notificationChannelRef.current = client.channels.get(
              userNotificationChannelName
            );
            notificationChannelRef.current.subscribe(
              "new-message-notification",
              (message) => {
                console.log("[Ably User Notification] Received:", message.data);
                // To avoid showing notification if user is already in that chat:
                // You'd need access to the currently activeConversationId.
                // This might require lifting activeConversationId state or passing it to ChatContext.
                // For now, let's show it. We can refine later.
                // Example check: if (activeConversationId !== message.data.conversationId) { ... }
                showSnackbar(
                  `${message.data.title || "New Message"}: ${
                    message.data.body || ""
                  }`,
                  "info" // Or 'success', or a custom type
                );
                // TODO: Potentially update global unread count here
              }
            );
            console.log(
              `[Ably User Notification] Subscribed to ${userNotificationChannelName}`
            );
          }
        });

        client.connection.on("failed", (stateChange) => {
          //
          console.error("[Ably] Connection failed:", stateChange.reason); //
          setIsAblyConnected(false); //
          setAblyError(stateChange.reason); //
          ablyClient = null; //
          isInitializing.current = false; //
        });

        // ... (other connection event handlers: disconnected, suspended, closed remain the same)
        client.connection.on("disconnected", (stateChange) => {
          //
          console.warn("[Ably] Disconnected.", stateChange?.reason); //
          setIsAblyConnected(false); //
        });
        client.connection.on("suspended", (stateChange) => {
          //
          console.warn("[Ably] Connection suspended.", stateChange?.reason); //
          setIsAblyConnected(false); //
          setAblyError(stateChange.reason); //
        });
        client.connection.on("closed", () => {
          //
          console.log("[Ably] Connection closed."); //
          setIsAblyConnected(false); //
          ablyClient = null; //
          isInitializing.current = false; //
          if (notificationChannelRef.current) {
            notificationChannelRef.current.detach(); // Detach on close
            notificationChannelRef.current = null;
          }
        });
      } catch (initError) {
        console.error("[Ably] Initialization error:", initError); //
        setAblyError(initError); //
        isInitializing.current = false; //
      }
    };

    initializeAbly(); //

    return () => {
      // Cleanup when the hook unmounts or dependencies change in a way that closes the client
      // If the client is globally managed (ablyClient), direct closing here might be too aggressive
      // The logic for closing on logout or user change is handled within the useEffect.
      // However, if the component using this specific hook instance unmounts and the channel should be released:
      // if (notificationChannelRef.current) {
      //   notificationChannelRef.current.detach(); // Or unsubscribe
      //   console.log(`[Ably User Notification] Detached from ${notificationChannelRef.current.name}`);
      //   notificationChannelRef.current = null;
      // }
    };
  }, [idToken, isLoggedIn, user, isAuthLoading, showSnackbar]); // Added showSnackbar to dependencies

  return { ably: ablyClient, isAblyConnected, ablyError }; //
};

export default useAblyClient;
