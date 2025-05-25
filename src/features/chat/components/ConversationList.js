// src/features/chat/components/ConversationList.js
import React, { useEffect, useState, useCallback } from "react";
import {
  List,
  // ListItem, // Replaced by ListItemButton
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Box,
  ListItemButton,
  ListItemIcon,
  // Badge, // For unread messages later
  Link, // Import MUI Link for styling consistency
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import BusinessIcon from "@mui/icons-material/Business";
import LaunchIcon from "@mui/icons-material/Launch"; // Icon for "view property" link

// NEW IMPORT for react-router-dom Link
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext"; //
import { getConversationsForUser } from "../services/chatService";

const ConversationList = ({
  onSelectConversation,
  currentUserProfileId,
  activeConversationId,
}) => {
  const [conversations, setConversations] = useState([]); //
  const [loading, setLoading] = useState(true); //
  const [error, setError] = useState(null); //
  const { idToken, user } = useAuth(); //

  const actualCurrentUserId = currentUserProfileId || user?._id; //

  const fetchConversations = useCallback(async () => {
    //
    if (!idToken) {
      //
      setLoading(false); //
      return; //
    }
    setLoading(true); //
    setError(null); //
    try {
      const convos = await getConversationsForUser(idToken); //
      setConversations((convoReults) => convos); //
      console.log("[ConversationList] Fetched conversations:", convos); //
      if (!activeConversationId && convos && convos.length > 0) {
        //
        onSelectConversation(convos[0]); //
      }
    } catch (err) {
      console.error("[ConversationList] Error fetching conversations:", err); //
      setError(err.message || "Failed to load conversations."); //
    } finally {
      setLoading(false); //
    }
  }, [idToken, onSelectConversation, activeConversationId]); //

  useEffect(() => {
    //
    fetchConversations(); //
  }, [fetchConversations]); //

  // Loading, error, and empty states remain the same as in the previous version of ConversationList.js
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
      {" "}
      {/* */}
      {conversations.map((conv) => {
        if (!conv || !conv.participants) return null; //

        const otherParticipant = conv.participants.find(
          (p) => p && p._id !== actualCurrentUserId
        ); //
        const displayName =
          otherParticipant?.displayName ||
          otherParticipant?.email ||
          "Unknown User"; //
        const profilePicUrl = otherParticipant?.profilePictureUrl; //

        const lastMessageText = conv.lastMessage?.text || "No messages yet..."; //
        const lastMessageSender = conv.lastMessage?.senderId; //
        let lastMessagePrefix = ""; //

        if (lastMessageSender) {
          //
          if (lastMessageSender._id === actualCurrentUserId) {
            //
            lastMessagePrefix = "You: "; //
          }
        }

        const propertyTitle = conv.property?.title; //
        const propertyImage = conv.property?.images?.[0]
          ? `/pictures/${conv.property.images[0]}`
          : null; //
        const propertyId = conv.property?._id; // Get property ID for the link

        return (
          <ListItemButton
            key={conv._id}
            onClick={() => onSelectConversation(conv)}
            selected={activeConversationId === conv._id}
            divider
            sx={{ alignItems: "flex-start", py: 1.5 }} //
          >
            <ListItemAvatar sx={{ mt: 0.5 }}>
              {" "}
              {/* */}
              <Avatar alt={displayName} src={profilePicUrl}>
                {" "}
                {/* */}
                {!profilePicUrl && displayName.charAt(0).toUpperCase()} {/* */}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  component="div"
                  noWrap
                  fontWeight={
                    activeConversationId === conv._id ? "bold" : "normal"
                  }
                >
                  {" "}
                  {/* */}
                  {displayName}
                </Typography>
              }
              secondary={
                <>
                  {propertyId &&
                    propertyTitle && ( // Check for propertyId as well for link
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
                        />{" "}
                        {/* */}
                        <Link
                          component={RouterLink}
                          to={`/properties/details/${propertyId}`} // Navigate to property detail page
                          variant="caption"
                          color="text.secondary"
                          underline="hover"
                          onClick={(event) => event.stopPropagation()} // Prevents ListItemButton onClick
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flexShrink: 1, // Allow shrinking if space is tight
                            minWidth: 0, // Important for textOverflow with flex items
                          }}
                          title={`Regarding: ${propertyTitle}`} // Tooltip for full title if truncated
                        >
                          Regarding: {propertyTitle}
                        </Link>
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
                    color={
                      activeConversationId === conv._id
                        ? "text.primary"
                        : "text.secondary"
                    }
                    noWrap
                  >
                    {" "}
                    {/* */}
                    {lastMessagePrefix}
                    {lastMessageText}
                  </Typography>
                </>
              }
              secondaryTypographyProps={{ component: "div" }} // Ensure secondary can render complex children
            />
            {propertyImage && ( //
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  ml: 1,
                  mt: 0.5,
                  display: { xs: "none", sm: "flex" },
                }}
              >
                {" "}
                {/* */}
                <Avatar
                  variant="rounded"
                  src={propertyImage}
                  alt="Property"
                  sx={{ width: 36, height: 36 }}
                >
                  {" "}
                  {/* */}
                  <ImageIcon /> {/* */}
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
