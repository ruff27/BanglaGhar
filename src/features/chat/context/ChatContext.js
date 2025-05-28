// src/features/chat/context/ChatContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import useAblyClient from "../hooks/useAblyClient";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { getConversationsSummary } from "../services/chatService";

const ChatContext = createContext(null);
const LAST_SEEN_MESSAGES_KEY_PREFIX = "chatApp_lastSeenMessages_";

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { ably, isAblyConnected, ablyError } = useAblyClient();
  const { showSnackbar } = useSnackbar();
  const { user, isLoggedIn, idToken } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationData, setActiveConversationData] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [detailedUnreadConversations, setDetailedUnreadConversations] =
    useState([]);

  const getLocalStorageKey = useCallback(() => {
    return user?._id ? `${LAST_SEEN_MESSAGES_KEY_PREFIX}${user._id}` : null;
  }, [user?._id]);

  useEffect(() => {
    let total = 0;
    Object.values(unreadCounts).forEach((count) => (total += count || 0));
    setTotalUnreadMessages(total);
  }, [unreadCounts]);

  // Side effect to update localStorage when a conversation is active and data is loaded
  useEffect(() => {
    const storageKey = getLocalStorageKey();
    if (
      storageKey &&
      activeConversationId &&
      activeConversationData?.lastMessage?.createdAt
    ) {
      try {
        const seenTimestamps = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );
        const newTimestamp = new Date(
          activeConversationData.lastMessage.createdAt
        ).getTime();
        if (
          !seenTimestamps[activeConversationId] ||
          newTimestamp > seenTimestamps[activeConversationId]
        ) {
          seenTimestamps[activeConversationId] = newTimestamp;
          localStorage.setItem(storageKey, JSON.stringify(seenTimestamps));
        }
      } catch (e) {
        console.error(
          "Error updating localStorage for active conversation's last message:",
          e
        );
      }
    }
  }, [activeConversationData, activeConversationId, getLocalStorageKey]);

  const selectConversation = useCallback(
    (conversationData) => {
      let idToSet = null;
      let dataToSet = null;

      if (conversationData && conversationData._id) {
        idToSet = conversationData._id;
        const keys = Object.keys(conversationData);
        // If only _id is present, it's just an ID wrapper. dataToSet becomes null,
        // indicating ChatWindow should fetch full details.
        // Otherwise, assume it's richer initial data.
        dataToSet =
          keys.length === 1 && keys[0] === "_id" ? null : conversationData;
      } else if (typeof conversationData === "string" && conversationData) {
        idToSet = conversationData; // A raw ID string was passed
        dataToSet = null;
      } else if (conversationData === null) {
        // Explicitly clearing selection
        setActiveConversationId(null);
        setActiveConversationData(null);
        return;
      } else {
        // console.warn("[ChatContext] selectConversation: Invalid data:", conversationData);
        return; // Invalid data, do nothing
      }

      // These are direct state updates. React handles preventing re-renders if values are identical.
      setActiveConversationId(idToSet);
      setActiveConversationData(dataToSet);

      if (idToSet) {
        setUnreadCounts((prevCounts) => {
          if (prevCounts[idToSet] && prevCounts[idToSet] > 0) {
            const newCounts = { ...prevCounts };
            delete newCounts[idToSet];
            return newCounts;
          }
          return prevCounts;
        });
        setDetailedUnreadConversations((prevDetails) =>
          prevDetails.filter((convo) => convo.id !== idToSet)
        );
      }
    },
    // This function's reference is now stable as it only depends on state setters.
    [
      setActiveConversationId,
      setActiveConversationData,
      setUnreadCounts,
      setDetailedUnreadConversations,
    ]
  );

  const updateDetailedUnreadConversations = useCallback(
    (summary, currentUnreadCounts, currentUserId) => {
      const unreadConvDetails = summary
        .filter((convo) => currentUnreadCounts[convo._id] > 0)
        .map((convo) => {
          const otherParticipant = convo.participants.find(
            (p) => p && p._id !== currentUserId
          );
          return {
            id: convo._id,
            displayName:
              otherParticipant?.displayName ||
              otherParticipant?.email ||
              "Unknown User",
            lastMessageText:
              convo.lastMessage?.text?.substring(0, 35) +
                (convo.lastMessage?.text?.length > 35 ? "..." : "") ||
              "New message",
            profilePictureUrl: otherParticipant?.profilePictureUrl,
            count: currentUnreadCounts[convo._id],
            // Store more complete data from summary for potential use by selectConversation
            participants: convo.participants,
            lastMessage: convo.lastMessage,
            property: convo.property,
            _id: convo._id, // Ensure _id is also at the top level for convenience
          };
        });
      setDetailedUnreadConversations(unreadConvDetails);
    },
    []
  );

  const fetchInitialUnreadDetails = useCallback(
    async (token, currentUserId) => {
      const storageKey = getLocalStorageKey();
      if (!currentUserId || !storageKey || isInitialLoadComplete) {
        if (!isInitialLoadComplete) setIsInitialLoadComplete(true);
        return;
      }
      try {
        const conversationsSummary = await getConversationsSummary(token);
        const initialUnread = {};
        const seenTimestamps = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );
        conversationsSummary.forEach((convo) => {
          if (
            convo.lastMessage &&
            convo.lastMessage.senderId?._id !== currentUserId
          ) {
            const lastMessageTime = new Date(
              convo.lastMessage.createdAt
            ).getTime();
            const lastSeenTime = seenTimestamps[convo._id] || 0;
            if (lastMessageTime > lastSeenTime) {
              initialUnread[convo._id] = (initialUnread[convo._id] || 0) + 1;
            }
          }
        });
        setUnreadCounts(initialUnread);
        updateDetailedUnreadConversations(
          conversationsSummary,
          initialUnread,
          currentUserId
        );
      } catch (error) {
        console.error(
          "[ChatContext] Failed to fetch initial unread details:",
          error
        );
        showSnackbar("Could not load chat summary.", "error");
      } finally {
        setIsInitialLoadComplete(true);
      }
    },
    [
      showSnackbar,
      updateDetailedUnreadConversations,
      getLocalStorageKey,
      isInitialLoadComplete,
    ]
  );

  const handleIncomingMessageNotification = useCallback(
    (notificationData) => {
      if (!notificationData || !notificationData.conversationId || !user?._id)
        return;
      const {
        conversationId: incomingConvId,
        senderDisplayName,
        body,
        senderId,
        timestamp,
      } = notificationData;
      if (senderId === user._id) return;

      if (activeConversationId !== incomingConvId) {
        showSnackbar(
          `${senderDisplayName || "New Message"}: ${
            body || "You have a new message."
          }`,
          "info"
        );
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [incomingConvId]: (prevCounts[incomingConvId] || 0) + 1,
        }));
      } else {
        const storageKey = getLocalStorageKey();
        if (storageKey && timestamp) {
          try {
            const seenTimestamps = JSON.parse(
              localStorage.getItem(storageKey) || "{}"
            );
            seenTimestamps[incomingConvId] = new Date(timestamp).getTime();
            localStorage.setItem(storageKey, JSON.stringify(seenTimestamps));
          } catch (e) {
            console.error(
              "Error updating localStorage for active chat notification:",
              e
            );
          }
        }
      }
    },
    [
      activeConversationId,
      showSnackbar,
      user?._id,
      getLocalStorageKey,
      setUnreadCounts,
    ] // Added setUnreadCounts
  );

  useEffect(() => {
    const storageKey = getLocalStorageKey();
    if (
      isLoggedIn &&
      idToken &&
      user?._id &&
      storageKey &&
      !isInitialLoadComplete
    ) {
      fetchInitialUnreadDetails(idToken, user._id);
    } else if (!isLoggedIn && isInitialLoadComplete) {
      setUnreadCounts({});
      setDetailedUnreadConversations([]);
      setIsInitialLoadComplete(false);
      setActiveConversationId(null);
      setActiveConversationData(null);
    }
  }, [
    isLoggedIn,
    idToken,
    user,
    fetchInitialUnreadDetails,
    isInitialLoadComplete,
    getLocalStorageKey,
  ]);

  return (
    <ChatContext.Provider
      value={{
        ably,
        isAblyConnected,
        ablyError,
        activeConversationId,
        activeConversationData,
        selectConversation, // Reference is now stable
        handleIncomingMessageNotification,
        unreadCounts,
        totalUnreadMessages,
        detailedUnreadConversations,
        updateDetailedUnreadConversations,
        isChatLoading:
          !isInitialLoadComplete ||
          (isLoggedIn && !isAblyConnected && !ablyError),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext };
