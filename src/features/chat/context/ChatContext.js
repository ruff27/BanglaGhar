// src/features/chat/context/ChatContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import useAblyClient from "../hooks/useAblyClient";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { getConversationsSummary } from "../services/chatService";

const ChatContext = createContext(null);
const LAST_SEEN_MESSAGES_KEY_PREFIX = "chatApp_lastSeenMessages_";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

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

  const activeConversationIdRef = useRef(null);

  const getLocalStorageKey = useCallback(
    (suffix = "") => {
      return user?._id
        ? `${LAST_SEEN_MESSAGES_KEY_PREFIX}${user._id}${suffix}`
        : null;
    },
    [user?._id]
  );

  useEffect(() => {
    let total = 0;
    Object.values(unreadCounts).forEach((count) => (total += count || 0));
    setTotalUnreadMessages(total);
  }, [unreadCounts]);

  // Load initial unread counts from dedicated localStorage for counts
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      // Ensure user is logged in before accessing localStorage
      const countsStorageKey = getLocalStorageKey("_counts");
      if (countsStorageKey) {
        const savedUnread = localStorage.getItem(countsStorageKey);
        if (savedUnread) {
          try {
            setUnreadCounts(JSON.parse(savedUnread));
          } catch (e) {
            console.error("Failed to parse unread counts from localStorage", e);
            localStorage.removeItem(countsStorageKey);
          }
        }
      }
    }
  }, [isLoggedIn, user?._id, getLocalStorageKey]); // Rerun if user changes

  // Persist unread counts to dedicated localStorage for counts
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      // Ensure user is logged in
      const countsStorageKey = getLocalStorageKey("_counts");
      if (countsStorageKey) {
        localStorage.setItem(countsStorageKey, JSON.stringify(unreadCounts));
      }
    }
  }, [unreadCounts, isLoggedIn, user?._id, getLocalStorageKey]);

  // Effect to update "seen timestamp" in localStorage if activeConversationData provides a more precise last message time.
  useEffect(() => {
    const seenTimestampsStorageKey = getLocalStorageKey(); // Key for timestamps
    if (
      seenTimestampsStorageKey &&
      activeConversationId &&
      activeConversationData?.lastMessage?.createdAt
    ) {
      try {
        const seenTimestamps = JSON.parse(
          localStorage.getItem(seenTimestampsStorageKey) || "{}"
        );
        const newTimestamp = new Date(
          activeConversationData.lastMessage.createdAt
        ).getTime();

        if (
          !seenTimestamps[activeConversationId] ||
          newTimestamp > seenTimestamps[activeConversationId]
        ) {
          seenTimestamps[activeConversationId] = newTimestamp;
          localStorage.setItem(
            seenTimestampsStorageKey,
            JSON.stringify(seenTimestamps)
          );
        }
      } catch (e) {
        console.error(
          "Error updating localStorage (timestamps) for active conversation's last message:",
          e
        );
      }
    }
  }, [activeConversationData, activeConversationId, getLocalStorageKey]);

  const markMessagesAsRead = useCallback(
    async (conversationIdToMark) => {
      if (!idToken || !conversationIdToMark) return;

      try {
        await axios.post(
          `${API_BASE_URL}/chat/conversations/${conversationIdToMark}/mark-read`,
          {},
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        setUnreadCounts((prevCounts) => {
          if (prevCounts[conversationIdToMark]) {
            const newCounts = { ...prevCounts };
            delete newCounts[conversationIdToMark];
            return newCounts;
          }
          return prevCounts;
        });

        const seenTimestampsStorageKey = getLocalStorageKey(); // Key for timestamps
        if (seenTimestampsStorageKey) {
          const seenTimestamps = JSON.parse(
            localStorage.getItem(seenTimestampsStorageKey) || "{}"
          );
          const now = new Date().getTime();
          // Update if 'now' is greater, or if no existing timestamp.
          // This ensures we record that the user has "seen" the conversation up to this point.
          if (
            !seenTimestamps[conversationIdToMark] ||
            now > seenTimestamps[conversationIdToMark]
          ) {
            seenTimestamps[conversationIdToMark] = now;
            localStorage.setItem(
              seenTimestampsStorageKey,
              JSON.stringify(seenTimestamps)
            );
          }
        }
      } catch (error) {
        console.error(
          `[ChatContext] Error marking messages as read for ${conversationIdToMark}:`,
          error
        );
        showSnackbar(
          error.response?.data?.message ||
            "Failed to mark conversation as read.",
          "error"
        );
      }
    },
    [idToken, getLocalStorageKey, showSnackbar]
  );

  const selectConversation = useCallback(
    (conversationData) => {
      let idToSet = null;
      let dataToSet = null;

      if (conversationData && conversationData._id) {
        idToSet = conversationData._id;
        const keys = Object.keys(conversationData);
        dataToSet =
          keys.length === 1 && keys[0] === "_id" ? null : conversationData;
      } else if (typeof conversationData === "string" && conversationData) {
        idToSet = conversationData;
        dataToSet = null;
      } else if (conversationData === null) {
        activeConversationIdRef.current = null;
        setActiveConversationId(null);
        setActiveConversationData(null);
        return;
      } else {
        return; // Invalid data
      }

      const previouslyActiveId = activeConversationIdRef.current;
      activeConversationIdRef.current = idToSet;

      setActiveConversationId(idToSet);
      setActiveConversationData(dataToSet);

      if (idToSet) {
        // If the conversation was locally marked as unread OR it's a different conversation being selected,
        // call markMessagesAsRead. This ensures backend and localStorage "seen timestamp" are updated.
        if (
          (unreadCounts[idToSet] && unreadCounts[idToSet] > 0) ||
          previouslyActiveId !== idToSet
        ) {
          markMessagesAsRead(idToSet);
        }
        // If it wasn't in local unreadCounts (e.g. fresh load, no unread from DB) but is a *new* selection,
        // still call markMessagesAsRead to update its "seen" timestamp to now.
        else if (
          !unreadCounts.hasOwnProperty(idToSet) &&
          previouslyActiveId !== idToSet
        ) {
          markMessagesAsRead(idToSet);
        }

        setDetailedUnreadConversations((prevDetails) =>
          prevDetails.filter((convo) => convo.id !== idToSet)
        );
      }
    },
    [unreadCounts, markMessagesAsRead]
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
            participants: convo.participants,
            lastMessage: convo.lastMessage,
            property: convo.property,
            _id: convo._id,
          };
        });
      setDetailedUnreadConversations(unreadConvDetails);
    },
    []
  );

  const fetchInitialUnreadDetails = useCallback(
    async (token, currentUserId) => {
      const seenTimestampsStorageKey = getLocalStorageKey(); // Key for "seen timestamps"
      const countsStorageKey = getLocalStorageKey("_counts"); // Key for persisted "unread counts"

      if (
        !currentUserId ||
        !seenTimestampsStorageKey ||
        !countsStorageKey ||
        isInitialLoadComplete
      ) {
        if (!isInitialLoadComplete) setIsInitialLoadComplete(true);
        return;
      }

      try {
        const conversationsSummary = await getConversationsSummary(token);
        let newUnreadCounts = {};
        const seenTimestamps = JSON.parse(
          localStorage.getItem(seenTimestampsStorageKey) || "{}"
        );
        const persistedCounts = JSON.parse(
          localStorage.getItem(countsStorageKey) || "{}"
        );

        // Determine unread based on summary and seen timestamps
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
              newUnreadCounts[convo._id] = Math.max(
                persistedCounts[convo._id] || 0,
                1
              );
            }
          }
        });

        for (const convoId in persistedCounts) {
          const convoInSummary = conversationsSummary.find(
            (c) => c._id === convoId
          );
          if (!convoInSummary) {
            if (newUnreadCounts[convoId]) delete newUnreadCounts[convoId]; // Should already not be there
          } else if (!newUnreadCounts[convoId]) {
          }
        }

        setUnreadCounts(newUnreadCounts);
        updateDetailedUnreadConversations(
          conversationsSummary,
          newUnreadCounts,
          currentUserId
        );
      } catch (error) {
        console.error(
          "[ChatContext] Failed to fetch initial unread details:",
          error
        );
        showSnackbar(
          error.response?.data?.message || "Could not load chat summary.",
          "error"
        );
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
        const seenTimestampsStorageKey = getLocalStorageKey();
        if (seenTimestampsStorageKey && timestamp) {
          try {
            const seenTimestamps = JSON.parse(
              localStorage.getItem(seenTimestampsStorageKey) || "{}"
            );
            const newMsgTime = new Date(timestamp).getTime();
            if (
              !seenTimestamps[incomingConvId] ||
              newMsgTime > seenTimestamps[incomingConvId]
            ) {
              seenTimestamps[incomingConvId] = newMsgTime;
              localStorage.setItem(
                seenTimestampsStorageKey,
                JSON.stringify(seenTimestamps)
              );
            }
          } catch (e) {
            console.error(
              "Error updating localStorage (timestamps) for active chat notification:",
              e
            );
          }
        }
      }
    },
    [activeConversationId, showSnackbar, user?._id, getLocalStorageKey]
  );

  useEffect(() => {
    if (isLoggedIn && idToken && user?._id && !isInitialLoadComplete) {
      fetchInitialUnreadDetails(idToken, user._id);
    } else if (!isLoggedIn && isInitialLoadComplete) {
      setUnreadCounts({});
      setDetailedUnreadConversations([]);
      setActiveConversationId(null);
      setActiveConversationData(null);
      setIsInitialLoadComplete(false);
      activeConversationIdRef.current = null;
    }
  }, [
    isLoggedIn,
    idToken,
    user,
    fetchInitialUnreadDetails,
    isInitialLoadComplete,
  ]);

  return (
    <ChatContext.Provider
      value={{
        ably,
        isAblyConnected,
        ablyError,
        activeConversationId,
        activeConversationData,
        selectConversation,
        handleIncomingMessageNotification,
        unreadCounts,
        totalUnreadMessages,
        detailedUnreadConversations,
        updateDetailedUnreadConversations,
        markMessagesAsRead,
        isChatLoading:
          (isLoggedIn && !isInitialLoadComplete) ||
          (isLoggedIn &&
            !isAblyConnected &&
            !ablyError &&
            isInitialLoadComplete),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext };
