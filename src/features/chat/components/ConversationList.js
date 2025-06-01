import React, { useEffect, useState, useCallback } from "react";
import {
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Box,
  ListItemButton,
  ListItemIcon,
  Badge,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import BusinessIcon from "@mui/icons-material/Business";
import LaunchIcon from "@mui/icons-material/Launch";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useChatContext } from "../context/ChatContext";
import { getConversationsForUser } from "../services/chatService";

const ConversationList = ({ currentUserProfileId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken, user } = useAuth();
  const {
    unreadCounts,
    selectConversation: selectConversationFromContext,
    activeConversationId,
    markMessagesAsRead,
  } = useChatContext();

  const actualCurrentUserId = currentUserProfileId || user?._id;

  const handleListItemClick = useCallback(
    (conv) => {
      selectConversationFromContext(conv);
    },
    [selectConversationFromContext]
  );

  const fetchConversations = useCallback(async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const convos = await getConversationsForUser(idToken);
      setConversations(convos);
    } catch (err) {
      setError(err.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error}
      </Alert>
    );
  }
  if (conversations.length === 0) {
    return (
      <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
        No conversations yet.
      </Typography>
    );
  }

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        p: 0,
        overflowY: "auto",
      }}
    >
      {conversations.map((conv) => {
        if (!conv || !conv.participants) return null;

        const otherParticipant = conv.participants.find(
          (p) => p && p._id !== actualCurrentUserId
        );
        const displayName =
          otherParticipant?.displayName ||
          otherParticipant?.email ||
          "Unknown User";
        const profilePicUrl = otherParticipant?.profilePictureUrl;
        const lastMessageText = conv.lastMessage?.text || "No messages yet...";
        const lastMessageSender = conv.lastMessage?.senderId;
        let lastMessagePrefix = "";

        if (lastMessageSender) {
          if (lastMessageSender._id === actualCurrentUserId) {
            lastMessagePrefix = "You: ";
          }
        }

        const propertyTitle = conv.property?.title;
        const propertyImage = conv.property?.images?.[0]
          ? `/pictures/${conv.property.images[0]}`
          : null;
        const propertyId = conv.property?._id;
        const unreadCount = unreadCounts[conv._id] || 0;

        return (
          <ListItemButton
            key={conv._id}
            onClick={() => handleListItemClick(conv)}
            selected={activeConversationId === conv._id}
            divider
            sx={{ alignItems: "flex-start", py: 1.5 }}
          >
            <ListItemAvatar sx={{ mt: 0.5 }}>
              <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0}
                overlap="circular"
              >
                <Avatar alt={displayName} src={profilePicUrl}>
                  {!profilePicUrl && displayName.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  component="div"
                  noWrap
                  fontWeight={
                    activeConversationId === conv._id || unreadCount > 0
                      ? "bold"
                      : "normal"
                  }
                  color={unreadCount > 0 ? "primary.main" : "text.primary"}
                >
                  {displayName}
                </Typography>
              }
              secondary={
                <>
                  {propertyId && propertyTitle && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <BusinessIcon
                        sx={{
                          fontSize: "0.9rem",
                          verticalAlign: "middle",
                          mr: 0.5,
                          color: "text.secondary",
                        }}
                      />
                      <Typography
                        component={RouterLink}
                        to={`/properties/details/${propertyId}`}
                        variant="caption"
                        color="text.secondary"
                        onClick={(event) => event.stopPropagation()}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flexShrink: 1,
                          minWidth: 0,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        title={`Regarding: ${propertyTitle}`}
                      >
                        Regarding: {propertyTitle}
                      </Typography>
                      <LaunchIcon
                        sx={{
                          fontSize: "0.8rem",
                          ml: 0.5,
                          color: "text.secondary",
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  )}
                  <Typography
                    sx={{ display: "block" }}
                    component="span"
                    variant="body2"
                    color={unreadCount > 0 ? "text.primary" : "text.secondary"}
                    noWrap
                    fontWeight={unreadCount > 0 ? "bold" : "normal"}
                  >
                    {lastMessagePrefix}
                    {lastMessageText}
                  </Typography>
                </>
              }
              secondaryTypographyProps={{ component: "div" }}
            />
            {propertyImage && (
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  ml: 1,
                  mt: 0.5,
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={propertyImage}
                  alt="Property"
                  sx={{ width: 36, height: 36 }}
                >
                  <ImageIcon />
                </Avatar>
              </ListItemIcon>
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default ConversationList;
