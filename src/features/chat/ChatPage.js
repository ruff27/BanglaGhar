// src/features/chat/ChatPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { useChatContext } from "./context/ChatContext"; // Assuming you created this

// Placeholder components (we will create these next)
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";

const ChatPage = () => {
  const location = useLocation();
  const params = useParams(); // For /chat/:conversationId route
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: isAuthLoading, user, idToken } = useAuth();
  const { isAblyConnected, ablyError } = useChatContext();

  // Stores the ID of the currently selected conversation to display in ChatWindow
  const [activeConversationId, setActiveConversationId] = useState(null);
  // Stores the full data of the active conversation, useful for passing to ChatWindow
  const [activeConversationData, setActiveConversationData] = useState(null);

  // Effect to handle incoming conversationId from route state or params
  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth to settle

    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const stateConversationId = location.state?.conversationId;
    const stateInitialData = location.state?.initialConversationData;
    const paramConversationId = params.conversationId;

    if (stateConversationId) {
      console.log(
        "[ChatPage] Received conversationId from state:",
        stateConversationId
      );
      setActiveConversationId(stateConversationId);
      if (stateInitialData) {
        setActiveConversationData(stateInitialData);
      }
      // Clear the state to prevent re-processing on refresh if state isn't cleared by router
      // navigate(location.pathname, { replace: true, state: {} }); // Optional: clear state
    } else if (paramConversationId) {
      console.log(
        "[ChatPage] Received conversationId from URL param:",
        paramConversationId
      );
      setActiveConversationId(paramConversationId);
      // Here, you'd typically fetch conversation details if only ID is from param
      // For now, if only param, setActiveConversationData might remain null until fetched by ConversationList or ChatWindow
    }
    // If neither, ConversationList will handle fetching and setting the first active conversation later
  }, [
    location.state,
    params.conversationId,
    isLoggedIn,
    isAuthLoading,
    navigate,
    location.pathname,
  ]);

  const handleSelectConversation = (conversation) => {
    if (conversation && conversation._id) {
      console.log("[ChatPage] Selecting conversation:", conversation._id);
      setActiveConversationId(conversation._id);
      setActiveConversationData(conversation);
      // If using URL param for active chat, navigate here:
      // navigate(`/chat/${conversation._id}`);
    } else {
      console.warn(
        "[ChatPage] Attempted to select invalid conversation:",
        conversation
      );
    }
  };

  if (isAuthLoading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography>Loading authentication...</Typography>
      </Container>
    );
  }

  if (!isLoggedIn) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Alert severity="warning">Please log in to access your chats.</Alert>
      </Container>
    );
  }

  if (ablyError) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Alert severity="error">
          Chat service connection error:{" "}
          {ablyError.message || JSON.stringify(ablyError)}
          <br />
          Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  if (!isAblyConnected) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography>Connecting to chat service...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: 4, mb: 4, height: "calc(100vh - 128px)", display: "flex" }}
    >
      {" "}
      {/* Adjust height based on Navbar/Footer */}
      <Grid container spacing={0} sx={{ height: "100%" }}>
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{
            height: "100%",
            borderRight: { sm: "1px solid #ddd" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper elevation={0} sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
            <Typography variant="h6">Chats</Typography>
          </Paper>
          {/* ConversationList will fetch and display conversations */}
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <ConversationList
              onSelectConversation={handleSelectConversation}
              currentUserProfileId={user?._id} // Pass current user's MongoDB ID
              activeConversationId={activeConversationId}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* ChatWindow will display messages for activeConversationId */}
          {activeConversationId ? (
            <ChatWindow
              key={activeConversationId} // Re-mount component if conversationId changes
              conversationId={activeConversationId}
              initialConversationData={activeConversationData} // Pass initial data if available
              currentUserProfileId={user?._id} // Pass current user's MongoDB ID
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start chatting
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;
