import React from "react";
import {
  ListItem, 
  Box,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";

const MessageItem = React.memo(({ message, isCurrentUser }) => {
  const senderName = message.senderId?.displayName || "User"; 
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }); 

  return (
    <ListItem 
      sx={{
        display: "flex",
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        px: { xs: 0.5, sm: 1 }, 
        py: 0.5, 
      }}
    >
      <Box 
        sx={{
          display: "flex",
          alignItems: "flex-start", 
          flexDirection: isCurrentUser ? "row-reverse" : "row",
          maxWidth: { xs: "90%", sm: "75%", md: "65%" }, 
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.9rem", 
            mt: 0.25, 
            mx: 0.75,
            bgcolor: message.senderId?.profilePictureUrl
              ? "transparent"
              : "secondary.light", 
            color: "white",
          }}
          src={message.senderId?.profilePictureUrl}
          alt={senderName}
        >
          {!message.senderId?.profilePictureUrl &&
            senderName.charAt(0).toUpperCase()}
        </Avatar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isCurrentUser ? "flex-end" : "flex-start", 
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: "8px 12px", 
              borderRadius: isCurrentUser
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px", 
              bgcolor: isCurrentUser ? "primary.main" : "#e9e9eb", 
              color: isCurrentUser ? "primary.contrastText" : "text.primary",
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
              px: 0.5,
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
