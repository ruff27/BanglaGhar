// server/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware"); // Your existing auth middleware
// We need fetchUserProfileMiddleware for routes that interact with UserProfile _id
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware"); //

// Route to generate an Ably token for an authenticated client
// This route needs to be protected by authentication, so the server knows which user (clientId)
// the token is being generated for.
router.get(
  "/ably-token",
  authMiddleware, // Ensures only authenticated users can get a token
  chatController.generateAblyToken
);

// Get a summary of all conversations for the logged-in user (for unread counts etc.)
router.get(
  "/conversations/summary",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.getConversationsSummaryForUser
);

// --- NEW CHAT AND MESSAGE ROUTES ---

// Initiate or get an existing conversation
// Requires user to be authenticated and their profile loaded
router.post(
  "/conversations",
  authMiddleware, //
  fetchUserProfileMiddleware, //
  chatController.initiateOrGetConversation
);

// Post a message to a specific conversation
// Requires user to be authenticated and their profile loaded
router.post(
  "/conversations/:conversationId/messages",
  authMiddleware, //
  fetchUserProfileMiddleware, //
  chatController.postMessageToConversation
);

// Get all conversations for the logged-in user
// Requires user to be authenticated and their profile loaded
router.get(
  "/conversations",
  authMiddleware, //
  fetchUserProfileMiddleware, //
  chatController.getConversationsForUser
);

// Get messages within a specific conversation (with pagination)
// Requires user to be authenticated and their profile loaded
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware, //
  fetchUserProfileMiddleware, //
  chatController.getMessagesInConversation
);

module.exports = router;
