const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware");

router.get("/ably-token", authMiddleware, chatController.generateAblyToken);
router.get(
  "/conversations/summary",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.getConversationsSummaryForUser
);
router.post(
  "/conversations",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.initiateOrGetConversation
);
router.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.postMessageToConversation
);
router.get(
  "/conversations",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.getConversationsForUser
);
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.getMessagesInConversation
);
router.post(
  "/conversations/:conversationId/mark-read",
  authMiddleware,
  fetchUserProfileMiddleware,
  chatController.markConversationAsRead
);

module.exports = router;
