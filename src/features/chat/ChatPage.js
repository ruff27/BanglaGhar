// src/features/chat/ChatPage.js
import React, { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material"; // Added useTheme, useMediaQuery, IconButton
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // For back button on mobile chat window
import { useAuth } from "../../context/AuthContext";
import { useChatContext } from "./context/ChatContext";

import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";

const ChatPage = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();
  const {
    isAblyConnected,
    ablyError,
    activeConversationData,
    activeConversationId,
    selectConversation,
  } = useChatContext();

  const theme = useTheme();
  // Check if the screen is small (mobile view)
  // theme.breakpoints.down('sm') usually means 'xs' and 'sm'
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));

  // Effect to handle incoming conversationId from route state or params
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const stateConversationId = location.state?.conversationId;
    const stateInitialData = location.state?.initialConversationData;
    const paramConversationId = params.conversationId;

    let conversationToSelect = null;
    let dataToSelect = null;

    if (stateConversationId) {
      console.log(
        "[ChatPage] Received conversation from state:",
        stateInitialData || stateConversationId
      );
      conversationToSelect = stateConversationId;
      dataToSelect = stateInitialData || { _id: stateConversationId };
      // Clear location state after processing it
      navigate(location.pathname, { replace: true, state: {} });
    } else if (paramConversationId) {
      console.log(
        "[ChatPage] Received conversationId from URL param:",
        paramConversationId
      );
      conversationToSelect = paramConversationId;
      dataToSelect = { _id: paramConversationId };
    }

    if (conversationToSelect) {
      // If a conversation is directly specified (e.g. navigated from property or URL)
      // select it. This will also make ChatWindow visible on mobile if isMobileView is true.
      selectConversation(dataToSelect);
    } else if (!activeConversationId && !isMobileView) {
      // If no conversation is active AND we are on desktop,
      // ConversationList might auto-select the first one later.
      // On mobile, we want to show the list first if no specific conversation is targeted.
    }
  }, [
    location.state,
    params.conversationId,
    isLoggedIn,
    isAuthLoading,
    navigate,
    selectConversation,
    location.pathname,
    activeConversationId,
    isMobileView,
  ]); // Added activeConversationId and isMobileView

  // Handler for mobile view to go back from ChatWindow to ConversationList
  const handleMobileBackToConversations = () => {
    console.log(
      "[ChatPage] handleMobileBackToConversations called. Clearing active conversation."
    ); // <<< ADD THIS LOG
    selectConversation(null);
  };

  // Loading and error states (same as before)
  if (isAuthLoading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography>Loading authentication...</Typography>
      </Container>
    );
  }
  if (!isLoggedIn) {
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
      sx={{
        mt: { xs: 0, sm: 2, md: 4 }, // Adjust top margin for mobile
        mb: { xs: 0, sm: 2, md: 4 },
        height: {
          // Full height for mobile, subtracting potential header/footer on larger screens
          xs: "calc(100vh - 56px)", // Assuming 56px for mobile AppBar
          sm: "calc(100vh - 64px - 32px)", // AppBar (64) + Margins (32)
        },
        display: "flex",
        p: { xs: 0, sm: 1, md: 2 }, // No padding on xs for edge-to-edge
      }}
    >
      <Grid
        container
        spacing={0}
        sx={{
          height: "100%",
          flexGrow: 1,
          overflow: "hidden" /* Prevent double scrollbars */,
        }}
      >
        {/* Conversation List Column */}
        {/* On mobile, show if no active conversation OR if not mobile view */}
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{
            height: "100%",
            borderRight: { sm: `1px solid ${theme.palette.divider}` },
            display: isMobileView && activeConversationId ? "none" : "flex", // Hide on mobile if a chat is active
            flexDirection: "column",
            backgroundColor: "background.paper", // Add a background for clarity
          }}
        >
          <Paper
            elevation={0}
            sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="h6">Chats</Typography>
          </Paper>
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <ConversationList
              onSelectConversation={selectConversation}
              currentUserProfileId={user?._id}
              activeConversationId={activeConversationId}
            />
          </Box>
        </Grid>

        {/* Chat Window Column */}
        {/* On mobile, show only if an active conversation IS selected OR if not mobile view */}
        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{
            height: "100%",
            display: isMobileView && !activeConversationId ? "none" : "flex", // Hide on mobile if no chat is active
            flexDirection: "column",
          }}
        >
          {activeConversationId ? (
            <ChatWindow
              key={activeConversationId} // Ensures ChatWindow re-mounts with new state for new convo
              conversationId={activeConversationId}
              initialConversationData={activeConversationData}
              // Pass initialConversationData if ChatPage receives it and activeId matches
              currentUserProfileId={user?._id}
              // Pass a handler for mobile back buttonc
              onMobileBack={
                isMobileView ? handleMobileBackToConversations : undefined
              }
            />
          ) : (
            // This placeholder is mainly for desktop view if no chat is selected initially
            !isMobileView && (
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
            )
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;
