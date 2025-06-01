import { useState, useEffect, useRef, useContext } from "react";
import Ably from "ably";
import { getAblyTokenRequest } from "../services/chatService"; 
import { useAuth } from "../../../context/AuthContext";
import { ChatContext } from "./../context/ChatContext"; 

let ablyClient = null; 

const useAblyClient = () => {
  const {
    idToken, 
    isLoggedIn, 
    user,
    isLoading: isAuthLoading, 
  } = useAuth();

  console.log("[useAblyClient] User from useAuth():", user);

  // GET notification handler from ChatContext
  const chatCtx = useContext(ChatContext); 

  const [isAblyConnected, setIsAblyConnected] = useState(false); 
  const [ablyError, setAblyError] = useState(null); 
  const isInitializing = useRef(false); 
  const notificationChannelRef = useRef(null); 

  useEffect(() => {
    // This effect needs chatCtx.handleIncomingMessageNotification to be stable or included if it changes.
    // For now, assuming it's stable as it's memoized in ChatContext.
    const handleNotification = chatCtx?.handleIncomingMessageNotification;

    if (isAuthLoading) {
      return; 
    }

    if (!isLoggedIn || !idToken || !user?.cognitoSub || !user?._id) {
      if (ablyClient) {
        console.log(
          "[Ably] User logged out or essential auth data unavailable. Closing Ably connection."
        ); 
        ablyClient.close(); 
        ablyClient = null; 
        setIsAblyConnected(false); 
        if (notificationChannelRef.current) {
          notificationChannelRef.current.detach();
          notificationChannelRef.current = null;
        }
      }
      return; 
    }

    if (ablyClient && ablyClient.connection.state === "connected") {
      if (ablyClient.auth.clientId === user.cognitoSub) {
        setIsAblyConnected(true); 
        if (
          !notificationChannelRef.current &&
          ablyClient &&
          user?._id &&
          handleNotification
        ) {
          const userNotificationChannelName = `user-notifications-${user._id}`;
          notificationChannelRef.current = ablyClient.channels.get(
            userNotificationChannelName
          );
          notificationChannelRef.current.subscribe(
            "new-message-notification",
            (message) => {
              console.log(
                "[Ably User Notification] Received in useAblyClient (existing client):",
                message.data
              );
              handleNotification(message.data); 
            }
          );
          console.log(
            `[Ably User Notification] Subscribed to ${userNotificationChannelName} (existing client)`
          );
        }
        return; 
      } else {
        console.log("[Ably] User changed. Closing old Ably connection."); 
        ablyClient.close();
        ablyClient = null;
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
      return; 
    }

    const initializeAbly = async () => {
      //
      if (isInitializing.current) return; 
      isInitializing.current = true; 
      setAblyError(null); 
      console.log(
        "[Ably] Initializing connection for clientId (Cognito Sub):",
        user.cognitoSub
      ); 

      try {
        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              console.log(
                "[Ably AuthCallback] Requesting new token from backend..."
              );
              const tokenRequest = await getAblyTokenRequest(idToken); 
              callback(null, tokenRequest); 
            } catch (err) {
              console.error("[Ably AuthCallback] Error fetching token:", err); 
              setAblyError(err); 
              callback(err, null); 
            }
          },
          clientId: user.cognitoSub, 
        });

        client.connection.on("connected", () => {
          console.log("[Ably] Successfully connected!"); 
          setIsAblyConnected(true); 
          setAblyError(null); 
          ablyClient = client; 
          isInitializing.current = false; 

          if (user?._id && handleNotification) {
            const userNotificationChannelName = `user-notifications-${user._id}`; 
            if (notificationChannelRef.current) {
              notificationChannelRef.current.detach(); 
            }
            notificationChannelRef.current = client.channels.get(
              userNotificationChannelName
            );
            notificationChannelRef.current.subscribe(
              "new-message-notification",
              (message) => {
                console.log(
                  "[Ably User Notification] Received in useAblyClient (new client):",
                  message.data
                ); 
                handleNotification(message.data); 
              }
            );
            console.log(
              `[Ably User Notification] Subscribed to ${userNotificationChannelName} (new client)`
            ); 
          }
        });

        client.connection.on("failed", (stateChange) => {
          console.error("[Ably] Connection failed:", stateChange.reason); 
          setIsAblyConnected(false); 
          setAblyError(stateChange.reason); 
          ablyClient = null; 
          isInitializing.current = false; 
        });

        client.connection.on("disconnected", (stateChange) => {
          console.warn("[Ably] Disconnected.", stateChange?.reason); 
          setIsAblyConnected(false); 
        });
        client.connection.on("suspended", (stateChange) => {
          //
          console.warn("[Ably] Connection suspended.", stateChange?.reason); 
          setIsAblyConnected(false); 
          setAblyError(stateChange.reason); 
        });
        client.connection.on("closed", () => {
          console.log("[Ably] Connection closed."); 
          setIsAblyConnected(false); 
          ablyClient = null; 
          isInitializing.current = false; 
          if (notificationChannelRef.current) {
            notificationChannelRef.current.detach();
            notificationChannelRef.current = null;
          }
        });
      } catch (initError) {
        console.error("[Ably] Initialization error:", initError); 
        setAblyError(initError); 
        isInitializing.current = false; 
      }
    };

    initializeAbly(); 

    return () => {
    };
  }, [idToken, isLoggedIn, user, isAuthLoading, chatCtx]);

  return { ably: ablyClient, isAblyConnected, ablyError };
};

export default useAblyClient;
