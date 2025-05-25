// src/features/chat/components/MessageItem.js
import React from "react";
import {
  ListItem, // Keep ListItem as the root for semantic list structure
  Box,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";

const MessageItem = React.memo(({ message, isCurrentUser }) => {
  const senderName = message.senderId?.displayName || "User"; //
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }); //

  return (
    <ListItem // Root element for each message item
      sx={{
        display: "flex",
        // Align the entire ListItem (avatar + bubble + timestamp column) to one side
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        px: { xs: 0.5, sm: 1 }, // Reduce horizontal padding for the entire list item
        py: 0.5, // Reduce vertical padding between list items
        // No direct alignItems here, will be handled by inner Box
      }}
    >
      <Box // This Box now contains the Avatar and the (Bubble + Timestamp) column
        sx={{
          display: "flex",
          alignItems: "flex-start", // Align avatar with top of message bubble
          flexDirection: isCurrentUser ? "row-reverse" : "row",
          maxWidth: { xs: "90%", sm: "75%", md: "65%" }, // Max width of the message content
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.9rem", // Slightly smaller avatar
            // Consistent margin regardless of current user
            mt: 0.25, // Align avatar slightly better with text
            mx: 0.75, // Reduced horizontal margin
            bgcolor: message.senderId?.profilePictureUrl
              ? "transparent"
              : "secondary.light", // Lighter fallback
            color: "white",
          }}
          src={message.senderId?.profilePictureUrl}
          alt={senderName}
        >
          {!message.senderId?.profilePictureUrl &&
            senderName.charAt(0).toUpperCase()}
        </Avatar>
        <Box // This Box groups the message bubble and its timestamp
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isCurrentUser ? "flex-end" : "flex-start", // Align timestamp under the bubble
          }}
        >
          <Paper
            elevation={1} // Reduced elevation for a flatter look
            sx={{
              p: "8px 12px", // Consistent padding
              borderRadius: isCurrentUser
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px", // Slightly adjusted bubble shape
              bgcolor: isCurrentUser ? "primary.main" : "#e9e9eb", // Use a light grey for other user
              color: isCurrentUser ? "primary.contrastText" : "text.primary",
              // No border by default, can add if needed:
              // border: !isCurrentUser ? '1px solid #e0e0e0' : 'none'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: "1.45",
              }}
            >
              {message.text}
            </Typography>
          </Paper>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.65rem",
              mt: 0.5,
              px: 0.5, // Add a little padding to the timestamp itself
            }}
          >
            {time}
          </Typography>
        </Box>
      </Box>
    </ListItem>
  );
});

export default MessageItem;
