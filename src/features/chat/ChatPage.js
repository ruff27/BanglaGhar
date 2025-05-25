// src/features/chat/ChatPage.js
import React, { useEffect } from "react"; // Removed useState for activeConversationId here
import { useLocation, useParams, useNavigate } from "react-router-dom"; //
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material"; //
import { useAuth } from "../../context/AuthContext"; //
import { useChatContext } from "./context/ChatContext"; //

import ConversationList from "./components/ConversationList"; //
import ChatWindow from "./components/ChatWindow"; //

const ChatPage = () => {
  const location = useLocation(); //
  const params = useParams(); //
  const navigate = useNavigate(); //
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth(); // Removed idToken as it's not directly used here

  // Get activeConversationId and selectConversation from ChatContext
  const {
    isAblyConnected,
    ablyError,
    activeConversationId, // Get from context
    // activeConversationData, // Get from context if you stored it there
    selectConversation, // Get from context
  } = useChatContext();

  // State for initial conversation data passed via navigation (if any)
  // This is only needed if ChatWindow needs more than just the ID to start
  // const [initialNavConversationData, setInitialNavConversationData] = useState(null);

  useEffect(() => {
    //
    if (isAuthLoading) return; //

    if (!isLoggedIn) {
      //
      navigate("/login", { state: { from: location.pathname } }); //
      return; //
    }

    const stateConversationId = location.state?.conversationId;
    const stateInitialData = location.state?.initialConversationData; // This can be passed to selectConversation
    const paramConversationId = params.conversationId;

    let conversationToSelect = null;

    if (stateConversationId) {
      console.log(
        "[ChatPage] Received conversation from state:",
        stateInitialData || stateConversationId
      );
      // If full initial data is passed, use it. Otherwise, ChatWindow will fetch details if needed.
      // The selectConversation in context now only takes ID, but you could modify it to take full object.
      // For now, just setting the ID.
      // selectConversation({ _id: stateConversationId, ...stateInitialData }); // Pass full object if context handles it
      selectConversation(stateInitialData || { _id: stateConversationId }); // Pass what you have
      // setInitialNavConversationData(stateInitialData); // If ChatWindow needs it directly

      // Clear the state to prevent re-processing on refresh if state isn't cleared by router
      // This is important if you don't want this specific conversation to auto-load on simple refresh of /chat
      navigate(location.pathname, { replace: true, state: {} });
    } else if (paramConversationId) {
      console.log(
        "[ChatPage] Received conversationId from URL param:",
        paramConversationId
      );
      // selectConversation({ _id: paramConversationId }); // Pass as an object if context expects that
      // For now, assuming selectConversation can take just an ID and ChatWindow fetches details
      // Or, ConversationList would fetch full data when this ID is passed to it.
      // Let's assume selecting by ID is enough for context, ChatWindow fetches details.
      selectConversation({ _id: paramConversationId }); // Pass an object with _id
    }
    // If neither, ConversationList will handle fetching and might call selectConversation on the first item.
  }, [
    location.state,
    params.conversationId,
    isLoggedIn,
    isAuthLoading,
    navigate,
    selectConversation,
    location.pathname,
  ]);

  // handleSelectConversation is now effectively selectConversation from context
  // So, we pass selectConversation directly to ConversationList
  // const handleSelectConversation = (conversation) => {
  //   if (conversation && conversation._id) {
  //     console.log('[ChatPage] Selecting conversation:', conversation._id);
  //     selectConversation(conversation); // Call context's selectConversation
  //   } else {
  //     console.warn('[ChatPage] Attempted to select invalid conversation:', conversation);
  //   }
  // };

  // ... (loading and error states remain the same)
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
      sx={{ mt: 4, mb: 4, height: "calc(100vh - 128px)", display: "flex" }}
    >
      {" "}
      {/* */}
      <Grid container spacing={0} sx={{ height: "100%" }}>
        {" "}
        {/* */}
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{
            /* ... styles same ... */ height: "100%",
            borderRight: { sm: "1px solid #ddd" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {" "}
          {/* */}
          <Paper elevation={0} sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
            {" "}
            {/* */}
            <Typography variant="h6">Chats</Typography> {/* */}
          </Paper>
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            {" "}
            {/* */}
            <ConversationList
              onSelectConversation={selectConversation} // Pass context's selectConversation directly
              currentUserProfileId={user?._id}
              activeConversationId={activeConversationId} // Get from context
            />{" "}
            {/* */}
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {" "}
          {/* */}
          {activeConversationId ? (
            <ChatWindow
              key={activeConversationId}
              conversationId={activeConversationId} // Get from context
              // Pass initialConversationData if needed by ChatWindow for first render
              // initialConversationData={location.state?.initialConversationData || activeConversationData}
              // For simplicity, ChatWindow will fetch its own details if only ID is known initially
              currentUserProfileId={user?._id}
            /> //
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {" "}
              {/* */}
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start chatting
              </Typography>{" "}
              {/* */}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;
