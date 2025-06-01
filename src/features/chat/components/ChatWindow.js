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
  Avatar,
  Divider,
  IconButton, 
} from "@mui/material"; 
import SendIcon from "@mui/icons-material/Send"; 
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../../context/AuthContext"; 
import { useChatContext } from "../context/ChatContext"; 
import {
  getMessagesInConversation,
  postMessageToConversation,
} from "../services/chatService"; 

import MessageItem from "./MessageItem";

const MESSAGES_PER_PAGE = 20; 

const ChatWindow = ({
  conversationId,
  initialConversationData,
  currentUserProfileId,
  onMobileBack, 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [conversationDetails, setConversationDetails] = useState(
    initialConversationData
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { idToken, user } = useAuth();
  const { ably, isAblyConnected } = useChatContext();

  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const otherParticipant = conversationDetails?.participants?.find(
    (p) => p && p._id !== currentUserProfileId
  );
  const chatWindowTitle =
    otherParticipant?.displayName || otherParticipant?.email || "Chat";

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const fetchMessages = useCallback(
    async (pageToFetch) => {
      console.log(
        `[ChatWindow] ENTERING fetchMessages for conversation ${conversationId}, page: ${pageToFetch}`
      );
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
        );
        const data = await getMessagesInConversation(
          idToken,
          conversationId,
          pageToFetch,
          MESSAGES_PER_PAGE
        );
        console.log(
          `[ChatWindow] RAW API RESPONSE for page ${pageToFetch}:`,
          JSON.parse(JSON.stringify(data))
        );

        if (data.messages) {
          setMessages((prevMessages) => {
            let updatedMessages;
            if (pageToFetch === 1) {
              updatedMessages = data.messages.reverse();
            } else {
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
            );
            return updatedMessages;
          });
        } else if (pageToFetch === 1) {
          console.log(
            `[ChatWindow] No messages array in response for page 1. Setting messages to empty.`
          );
          setMessages([]);
        }

        setHasMoreMessages(data.currentPage < data.totalPages);
        setCurrentPage(data.currentPage);

        if (pageToFetch === 1) {
          setTimeout(() => scrollToBottom("auto"), 100);
        } else if (
          messageListRef.current &&
          data.messages &&
          data.messages.length > 0
        ) {
          const currentScrollHeight = messageListRef.current.scrollHeight;
          if (prevScrollHeightRef.current > 0) {
            messageListRef.current.scrollTop +=
              currentScrollHeight - prevScrollHeightRef.current;
          }
          prevScrollHeightRef.current = 0;
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
    [idToken, conversationId, scrollToBottom]
  );

  useEffect(() => {
    console.log(
      `[ChatWindow] conversationId CHANGED or fetchMessages RE-CREATED. New conversationId: ${conversationId}`
    );
    if (
      initialConversationData &&
      initialConversationData._id === conversationId
    ) {
      setConversationDetails(initialConversationData);
    } else if (
      conversationId &&
      (!conversationDetails || conversationDetails._id !== conversationId)
    ) {
      setConversationDetails(null);
    }
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    prevScrollHeightRef.current = 0;
    if (conversationId) {
      fetchMessages(1);
    }
  }, [conversationId, fetchMessages, initialConversationData]);

  useEffect(() => {
    if (!ably || !isAblyConnected || !conversationId) {
      return;
    }
    const channelName = `chat-${conversationId}`;
    const channel = ably.channels.get(channelName);
    const onMessageReceived = (message) => {
      console.log("[Ably] Received message:", message.data);
      setMessages((prevMessages) => {
        if (prevMessages.find((m) => m._id === message.data._id)) {
          return prevMessages;
        }
        return [...prevMessages, message.data];
      });
      if (messageListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messageListRef.current;
        if (
          scrollHeight - scrollTop - clientHeight < 150 ||
          message.data.senderId?._id === currentUserProfileId
        ) {
          setTimeout(() => scrollToBottom("smooth"), 50);
        }
      }
    };
    channel.subscribe("new-message", onMessageReceived);
    console.log(`[Ably] Subscribed to ${channelName}`);
    return () => {
      channel.unsubscribe("new-message", onMessageReceived);
      console.log(`[Ably] Unsubscribed from ${channelName}`);
    };
  }, [
    ably,
    isAblyConnected,
    conversationId,
    currentUserProfileId,
    scrollToBottom,
  ]);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        !newMessage.trim() ||
        !idToken ||
        !conversationId ||
        sending ||
        !isAblyConnected
      )
        return;

      setSending(true);
      const text = newMessage.trim();
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage = {
        _id: optimisticId,
        text: text,
        createdAt: new Date().toISOString(),
        senderId: {
          _id: currentUserProfileId,
          displayName: user?.displayName || user?.email,
          profilePictureUrl: user?.profilePictureUrl,
        },
        isOptimistic: true,
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      setTimeout(() => scrollToBottom("smooth"), 0);

      try {
        const savedMessage = await postMessageToConversation(
          idToken,
          conversationId,
          text
        );
        console.log("[ChatWindow] Message saved to DB:", savedMessage);
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticId ? savedMessage : m))
        );

        if (ably) {
          const channelName = `chat-${conversationId}`;
          const channel = ably.channels.get(channelName);
          channel.publish({ name: "new-message", data: savedMessage });
          console.log("[Ably] Published message:", savedMessage);
        }
      } catch (err) {
        console.error("[ChatWindow] Error sending message:", err);
        setError(err.message || "Failed to send message.");
        setNewMessage(text);
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      } finally {
        setSending(false);
      }
    },
    [
      newMessage,
      idToken,
      conversationId,
      sending,
      isAblyConnected,
      currentUserProfileId,
      user,
      ably,
      scrollToBottom,
    ]
  );

  const handleLoadMoreMessages = useCallback(() => {
    if (!loadingMoreMessages && hasMoreMessages) {
      if (messageListRef.current) {
        prevScrollHeightRef.current = messageListRef.current.scrollHeight;
      }
      fetchMessages(currentPage + 1);
    }
  }, [loadingMoreMessages, hasMoreMessages, fetchMessages, currentPage]);

  useEffect(() => {
    const listEl = messageListRef.current;
    const handleScroll = () => {
      if (
        listEl &&
        listEl.scrollTop < 20 &&
        !loadingInitialMessages &&
        !loadingMoreMessages &&
        hasMoreMessages
      ) {
        console.log("[ChatWindow] Scrolled to top, loading more messages.");
        handleLoadMoreMessages();
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
  ]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 0,
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5, 
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper",
          display: "flex",
          alignItems: "center",
          gap: 1.5, 
          flexShrink: 0, 
        }}
      >
        {onMobileBack && (
          <IconButton
            onClick={onMobileBack}
            sx={{ mr: { xs: -0.5, sm: 0 } }}
            size="medium"
          >
            {" "}
            <ArrowBackIcon />
          </IconButton>
        )}
        {otherParticipant ? (
          otherParticipant.profilePictureUrl ? (
            <Avatar
              sx={{ width: 36, height: 36 }}
              src={otherParticipant.profilePictureUrl}
              alt={otherParticipant.displayName || "User"}
            />
          ) : (
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                color: "white",
                fontSize: "1rem",
              }}
            >
              {otherParticipant.displayName?.charAt(0).toUpperCase() ||
                (otherParticipant.email
                  ? otherParticipant.email.charAt(0).toUpperCase()
                  : "U")}
            </Avatar>
          )
        ) : (
          <Avatar sx={{ width: 36, height: 36, bgcolor: "grey.300" }}>?</Avatar>
        )}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            flexGrow: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {chatWindowTitle}
        </Typography>
      </Box>

      <List
        ref={messageListRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: { xs: 1, sm: 1.5, md: 2 }, 
          bgcolor: "#f7f9fc", 
          position: "relative",
          minHeight: "300px", 
        }}
      >
        {hasMoreMessages &&
          !loadingInitialMessages && ( 
            <Box sx={{ textAlign: "center", my: 1.5 }}>
              <Button
                onClick={handleLoadMoreMessages}
                disabled={loadingMoreMessages}
                size="small"
                variant="text"
                color="primary"
              >
                {loadingMoreMessages ? (
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                ) : null}
                Load Older Messages
              </Button>
            </Box>
          )}
        {loadingInitialMessages && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100% - 40px)",
              p: 3,
            }}
          >
            {" "}
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Loading messages...
            </Typography>
          </Box>
        )}
        {!loadingInitialMessages && messages.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        )}
        {!loadingInitialMessages &&
          messages.map(
            (
              msg 
            ) => (
              <MessageItem 
                key={msg._id || msg.optimisticId} 
                message={msg}
                isCurrentUser={msg.senderId?._id === currentUserProfileId}
              />
            )
          )}
        <div ref={messagesEndRef} /> 
      </List>

      {error && messages.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            m: 0,
            borderRadius: 0,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: { xs: 1, sm: 1.5 },
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper", 
          flexShrink: 0, 
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          autoFocus
          multiline 
          maxRows={4} 
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                color="primary"
                disabled={sending || !newMessage.trim() || !isAblyConnected}
                sx={{ p: "10px" }}
              >
                {sending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            ),
            sx: { borderRadius: "24px", bgcolor: "background.paper" }, //
          }}
        />
      </Box>
    </Paper>
  );
};

export default ChatWindow;
