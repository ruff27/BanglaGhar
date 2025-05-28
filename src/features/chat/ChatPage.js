// src/features/chat/ChatPage.js
import React, { useEffect, useRef } from "react";
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
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import { useChatContext } from "./context/ChatContext";

import ConversationList from "./components/ConversationList"; // Assuming this is the correct path
import ChatWindow from "./components/ChatWindow"; // Assuming this is the correct path
// import AblyConnectionStatus from "./components/AblyConnectionStatus"; // Optional: For debugging

const ChatPage = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));

  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();
  const {
    isAblyConnected,
    ablyError,
    activeConversationData,
    activeConversationId,
    selectConversation,
    isChatLoading,
  } = useChatContext();

  const processedStateForIdRef = useRef(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const paramConvId = params.conversationId;
    const stateConvId = location.state?.conversationId;
    const stateInitialData = location.state?.initialConversationData;

    let targetId = null;
    let dataForSelection = null;

    if (paramConvId) {
      // If URL specifies a conversation ID
      targetId = paramConvId;
      if (
        stateConvId === paramConvId &&
        stateInitialData &&
        processedStateForIdRef.current !== paramConvId
      ) {
        dataForSelection = stateInitialData;
        processedStateForIdRef.current = paramConvId;
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        dataForSelection = { _id: targetId };
      }
    } else {
      // No conversation ID in URL params (e.g., on base /chat path)
      processedStateForIdRef.current = null;
      // Important: DO NOT call selectConversation(null) here based on isMobileView.
      // If a user clicks an item in ConversationList, activeConversationId will be set.
      // This useEffect should not clear it if the URL doesn't have an ID.
      // The display logic in JSX handles showing/hiding panels based on activeConversationId.
      // selectConversation(null) is handled by explicit actions like handleMobileBackToConversations.
      return; // No specific conversation ID from URL to process further in this effect.
    }

    if (targetId) {
      const isNewDataForSameActiveId =
        targetId === activeConversationId &&
        dataForSelection &&
        activeConversationData &&
        JSON.stringify(dataForSelection) !==
          JSON.stringify(activeConversationData);

      const isDifferentActiveId = targetId !== activeConversationId;

      if (isDifferentActiveId || isNewDataForSameActiveId) {
        selectConversation(dataForSelection);
      }
    }
  }, [
    params.conversationId,
    location.state,
    location.pathname,
    isLoggedIn,
    isAuthLoading,
    navigate,
    selectConversation, // Stable reference from ChatContext is crucial
    activeConversationId,
    activeConversationData,
    // isMobileView was removed from this specific effect's dependencies as the primary logic
    // for no paramConvId path was simplified to not alter selection.
  ]);

  const handleMobileBackToConversations = () => {
    selectConversation(null);
    if (params.conversationId) {
      navigate("/chat");
    }
  };

  if (isAuthLoading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading authentication...</Typography>
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
  if (isChatLoading && !activeConversationId) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading chat features...</Typography>
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
  if (!isAblyConnected && !ablyError && isLoggedIn && !isChatLoading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Connecting to chat service...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 0, sm: 2, md: 4 },
        mb: { xs: 0, sm: 2, md: 4 },
        height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px - 32px)" },
        display: "flex",
        p: { xs: 0, sm: 1, md: 2 },
      }}
    >
      {/* Optional: For debugging Ably connection independently */}
      {/* <AblyConnectionStatus /> */}
      <Grid
        container
        spacing={0}
        sx={{ height: "100%", flexGrow: 1, overflow: "hidden" }}
      >
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{
            height: "100%",
            borderRight: { sm: `1px solid ${theme.palette.divider}` },
            display: isMobileView && activeConversationId ? "none" : "flex", // HIDE list if chat active on mobile
            flexDirection: "column",
            backgroundColor: "background.paper",
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
              currentUserProfileId={user?._id}
              // activeConversationId is used by ConversationList internally from context now
            />
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{
            height: "100%",
            display: isMobileView && !activeConversationId ? "none" : "flex", // HIDE window if no chat active on mobile
            flexDirection: "column",
          }}
        >
          {activeConversationId ? (
            <ChatWindow
              key={activeConversationId}
              conversationId={activeConversationId}
              initialConversationData={activeConversationData}
              currentUserProfileId={user?._id}
              onMobileBack={
                isMobileView ? handleMobileBackToConversations : undefined
              }
            />
          ) : (
            !isMobileView && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 2,
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  textAlign="center"
                >
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
