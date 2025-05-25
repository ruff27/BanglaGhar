// src/features/chat/components/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar, // Keep for consistency if needed, but custom layout is used
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../../../context/AuthContext"; //
import { useChatContext } from "../context/ChatContext"; //
import {
  getMessagesInConversation,
  postMessageToConversation,
} from "../services/chatService"; //

const MESSAGES_PER_PAGE = 20; // Define how many messages to load per page

const ChatWindow = ({
  conversationId,
  initialConversationData,
  currentUserProfileId,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingInitialMessages, setLoadingInitialMessages] = useState(true); // Renamed from 'loading'
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [conversationDetails, setConversationDetails] = useState(
    initialConversationData
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { idToken } = useAuth(); //
  const { ably, isAblyConnected } = useChatContext(); //

  const messageListRef = useRef(null); // Ref for the message list container (the <List> element)
  const messagesEndRef = useRef(null); // For scrolling to bottom of new messages
  // Ref to store the scroll height before new messages are prepended
  const prevScrollHeightRef = useRef(0);

  // Determine the other participant for display
  const otherParticipant = conversationDetails?.participants?.find(
    (p) => p && p._id !== currentUserProfileId
  ); //
  const chatWindowTitle =
    otherParticipant?.displayName || otherParticipant?.email || "Chat"; //

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch historical messages (initial load and load more)
  const fetchMessages = useCallback(
    async (pageToFetch) => {
      console.log(
        `[ChatWindow] ENTERING fetchMessages for conversation ${conversationId}, page: ${pageToFetch}`
      ); //
      if (!idToken || !conversationId) return;

      if (pageToFetch === 1) {
        setLoadingInitialMessages(true);
      } else {
        setLoadingMoreMessages(true);
      }
      setError(null);

      try {
        console.log(
          `[ChatWindow] Fetching messages for ${conversationId}, page: ${pageToFetch}`
        ); //
        const data = await getMessagesInConversation(
          idToken,
          conversationId,
          pageToFetch,
          MESSAGES_PER_PAGE
        );
        console.log(
          `[ChatWindow] RAW API RESPONSE for page ${pageToFetch}:`,
          JSON.parse(JSON.stringify(data))
        ); //

        if (data.messages) {
          // Check if data.messages exists
          setMessages((prevMessages) => {
            let updatedMessages;
            if (pageToFetch === 1) {
              // For initial load (page 1), directly use the fetched messages, reversed for correct order.
              updatedMessages = data.messages.reverse();
            } else {
              // For loading older messages, filter out any duplicates already in prevMessages
              // and prepend the new (older) messages.
              const existingMessageIds = new Set(
                prevMessages.map((pm) => pm._id)
              );
              const newOlderMessages = data.messages.filter(
                (msg) => !existingMessageIds.has(msg._id)
              );
              updatedMessages = [
                ...newOlderMessages.reverse(),
                ...prevMessages,
              ];
            }
            console.log(
              `[ChatWindow] UPDATING messages state for page ${pageToFetch} with:`,
              JSON.parse(JSON.stringify(updatedMessages))
            ); //
            return updatedMessages;
          });
        } else if (pageToFetch === 1) {
          // Explicitly set to empty if page 1 fetch yields no messages array
          console.log(
            `[ChatWindow] No messages array in response for page 1. Setting messages to empty.`
          );
          setMessages([]);
        }

        setHasMoreMessages(data.currentPage < data.totalPages);
        setCurrentPage(data.currentPage);

        if (pageToFetch === 1) {
          setTimeout(() => scrollToBottom("auto"), 0);
        } else if (
          messageListRef.current &&
          data.messages &&
          data.messages.length > 0
        ) {
          // Only adjust scroll if new messages were added
          const currentScrollHeight = messageListRef.current.scrollHeight;
          // Ensure scrollTop is adjusted only if prevScrollHeightRef.current was set (i.e., not the very first "load more")
          if (prevScrollHeightRef.current > 0) {
            messageListRef.current.scrollTop +=
              currentScrollHeight - prevScrollHeightRef.current;
          }
          prevScrollHeightRef.current = 0; // Reset after use
        }
      } catch (err) {
        console.error("[ChatWindow] Error fetching messages:", err);
        setError(err.message || "Failed to load messages.");
      } finally {
        if (pageToFetch === 1) {
          setLoadingInitialMessages(false);
        } else {
          setLoadingMoreMessages(false);
        }
      }
    },
    [idToken, conversationId]
  ); // Dependencies for useCallback

  // Initial message fetch useEffect (this seems to be the main trigger for multiple calls)
  useEffect(() => {
    // This effect runs when conversationId changes.
    // It's intended to load messages for the newly selected conversation.
    console.log(
      `[ChatWindow] conversationId CHANGED or fetchMessages RE-CREATED. New conversationId: ${conversationId}`
    );
    setMessages([]); // Clear messages for the new conversation
    setCurrentPage(1);
    setHasMoreMessages(true);
    prevScrollHeightRef.current = 0; // Reset scroll height memory
    if (conversationId) {
      fetchMessages(1); // Call the memoized fetchMessages
    }
  }, [conversationId, fetchMessages]);

  // Ably subscription for real-time messages
  useEffect(() => {
    if (!ably || !isAblyConnected || !conversationId) {
      //
      return; //
    }

    const channelName = `chat-${conversationId}`; //
    const channel = ably.channels.get(channelName); //

    const onMessageReceived = (message) => {
      //
      console.log("[Ably] Received message:", message.data); //
      setMessages((prevMessages) => {
        if (prevMessages.find((m) => m._id === message.data._id)) {
          //
          return prevMessages; //
        }
        return [...prevMessages, message.data]; //
      });
      // If the user is scrolled near the bottom, auto-scroll. Otherwise, they might be reading history.
      if (messageListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messageListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 100) {
          // If within 100px of bottom
          setTimeout(() => scrollToBottom(), 0); // Scroll after message is rendered
        }
      }
    };

    channel.subscribe("new-message", onMessageReceived); //
    console.log(`[Ably] Subscribed to ${channelName}`); //

    return () => {
      channel.unsubscribe("new-message", onMessageReceived); //
      console.log(`[Ably] Unsubscribed from ${channelName}`); //
    };
  }, [ably, isAblyConnected, conversationId]); //

  const handleSendMessage = async (e) => {
    //
    e.preventDefault(); //
    if (!newMessage.trim() || !idToken || !conversationId || sending) return; //

    setSending(true); //
    const text = newMessage.trim(); //
    const optimisticMessageId = `optimistic-${Date.now()}`; // Create a temporary ID

    // Optimistically add message to UI (optional, but good for UX)
    // const optimisticMsgObject = {
    //   _id: optimisticMessageId,
    //   text: text,
    //   senderId: { _id: currentUserProfileId, displayName: user?.displayName, profilePictureUrl: user?.profilePictureUrl }, //
    //   createdAt: new Date().toISOString(),
    //   isOptimistic: true,
    // };
    // setMessages(prev => [...prev, optimisticMsgObject]);
    // setTimeout(() => scrollToBottom(), 0);

    setNewMessage(""); //

    try {
      const savedMessage = await postMessageToConversation(
        idToken,
        conversationId,
        text
      ); //
      console.log("[ChatWindow] Message saved to DB:", savedMessage); //

      // Remove optimistic message if used and replace with server-confirmed one
      // setMessages(prev => prev.map(m => m._id === optimisticMessageId ? savedMessage : m).filter(m => !m.isOptimistic || m._id !== optimisticMessageId));
      // If not using optimistic update, the Ably echo (if enabled) or direct add from publish will handle it.

      if (ably && isAblyConnected) {
        //
        const channelName = `chat-${conversationId}`; //
        const channel = ably.channels.get(channelName); //
        channel.publish({ name: "new-message", data: savedMessage }); //
        console.log("[Ably] Published message:", savedMessage); //
      }
      // If Ably echo is off, or to ensure the sender sees their message immediately if there's a delay
      // setMessages(prev => [...prev, savedMessage]); // This could cause duplicates if echo is ON and your subscribe logic doesn't de-dupe well.
      // The current subscribe logic *does* de-duplicate by _id.
    } catch (err) {
      console.error("[ChatWindow] Error sending message:", err); //
      setError(err.message || "Failed to send message."); //
      setNewMessage(text); // Restore text if sending failed //
      // Remove optimistic message if it failed
      // setMessages(prev => prev.filter(m => m._id !== optimisticMessageId));
    } finally {
      setSending(false); //
    }
  };

  // Ensure handleLoadMoreMessages is stable if it's a dependency for the scroll listener
  const handleLoadMoreMessages = useCallback(() => {
    if (!loadingMoreMessages && hasMoreMessages) {
      if (messageListRef.current) {
        prevScrollHeightRef.current = messageListRef.current.scrollHeight;
      }
      fetchMessages(currentPage + 1);
    }
  }, [loadingMoreMessages, hasMoreMessages, fetchMessages, currentPage]);

  // Scroll listener for infinite scroll (simplified)
  // For more robust solution, consider IntersectionObserver
  useEffect(() => {
    const listEl = messageListRef.current;

    const handleScroll = () => {
      // Check if listEl exists, not loading, has more, and scrolled to top
      if (
        listEl &&
        listEl.scrollTop < 10 &&
        !loadingInitialMessages &&
        !loadingMoreMessages &&
        hasMoreMessages
      ) {
        // Check if near top (e.g. < 10px)
        console.log("[ChatWindow] Scrolled to top, loading more messages.");
        handleLoadMoreMessages(); // This function needs to be defined or correctly called
      }
    };

    if (listEl) {
      listEl.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (listEl) {
        listEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [
    loadingInitialMessages,
    loadingMoreMessages,
    hasMoreMessages,
    handleLoadMoreMessages,
  ]); // Added handleLoadMoreMessages to deps

  if (loadingInitialMessages && messages.length === 0) {
    // Show full page loader only on very first load
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 3,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 0 }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "background.paper",
          display: "flex",
          alignItems: "center",
        }}
      >
        {otherParticipant?.profilePictureUrl && (
          <Avatar
            sx={{ mr: 1.5, width: 32, height: 32 }}
            src={otherParticipant.profilePictureUrl}
          >
            {!otherParticipant.profilePictureUrl &&
              otherParticipant.displayName?.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Typography variant="h6">{chatWindowTitle}</Typography>
      </Box>
      <List
        ref={messageListRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "grey.100", // Slightly different background for message area
        }}
      >
        {/* Button to load more messages, can be replaced by scroll detection */}
        {hasMoreMessages && !loadingInitialMessages && (
          <Box sx={{ textAlign: "center", my: 1 }}>
            <Button
              onClick={handleLoadMoreMessages}
              disabled={loadingMoreMessages}
              size="small"
            >
              {loadingMoreMessages ? (
                <CircularProgress size={20} />
              ) : (
                "Load Older Messages"
              )}
            </Button>
          </Box>
        )}
        {loadingInitialMessages &&
          messages.length === 0 && ( // More specific loading indicator within list
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          )}

        {!loadingInitialMessages && messages.length === 0 && (
          <Typography
            sx={{ textAlign: "center", p: 3, color: "text.secondary" }}
          >
            No messages yet. Start the conversation!
          </Typography>
        )}

        {messages.map((msg) => {
          const isCurrentUser = msg.senderId?._id === currentUserProfileId;
          return (
            <ListItem
              key={msg._id} // Use msg._id from database
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isCurrentUser ? "flex-end" : "flex-start",
                mb: 1,
                px: 0, // Remove ListItem default padding
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  flexDirection: isCurrentUser ? "row-reverse" : "row",
                  maxWidth: "75%",
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    ml: isCurrentUser ? 1 : 0,
                    mr: isCurrentUser ? 0 : 1,
                    bgcolor: msg.senderId?.profilePictureUrl
                      ? "transparent"
                      : "primary.main", // Fallback background if no image
                  }}
                  src={msg.senderId?.profilePictureUrl} // Populate this from backend
                >
                  {/* Fallback to first letter of display name */}
                  {!msg.senderId?.profilePictureUrl &&
                    msg.senderId?.displayName?.charAt(0).toUpperCase()}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: "8px 12px",
                    borderRadius: isCurrentUser
                      ? "12px 12px 0 12px"
                      : "12px 12px 12px 0",
                    bgcolor: isCurrentUser
                      ? "primary.main"
                      : "background.paper",
                    color: isCurrentUser
                      ? "primary.contrastText"
                      : "text.primary",
                  }}
                >
                  <ListItemText
                    primary={msg.text}
                    secondary={
                      <Typography
                        variant="caption"
                        component="span" // component="span" to avoid block display issues inside ListItemText
                        sx={{
                          color: isCurrentUser
                            ? "rgba(255,255,255,0.8)"
                            : "text.secondary",
                          fontSize: "0.7rem",
                          mt: 0.5, // Add a little margin-top
                          display: "block", // Ensure it takes its own line if needed
                          textAlign: isCurrentUser ? "right" : "left",
                        }}
                      >
                        {/* {msg.senderId?.displayName || 'User'} - Removed sender name as avatar and alignment imply it */}
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
                    }}
                  />
                </Paper>
              </Box>
            </ListItem>
          );
        })}
        <div ref={messagesEndRef} />
      </List>
      {error && messages.length > 0 && (
        <Alert severity="warning" sx={{ m: 1, mt: 0 }}>
          {error}
        </Alert>
      )}{" "}
      {/* Show non-critical errors if messages are already displayed */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 1.5,
          borderTop: "1px solid #ddd",
          backgroundColor: "background.paper",
        }}
      >
        {" "}
        {/* */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          autoFocus
          InputProps={{
            endAdornment: (
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={sending || !newMessage.trim() || !isAblyConnected}
              >
                {" "}
                {/* */}
                {sending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Send"
                )}{" "}
                {/* */}
              </Button>
            ),
            sx: { borderRadius: "20px" }, //
          }}
        />
      </Box>
    </Paper>
  );
};

export default ChatWindow;
