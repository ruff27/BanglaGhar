// server/controllers/chatController.js
const Ably = require("ably"); //
const Conversation = require("../models/Conversation"); //
const Message = require("../models/Message"); //
const UserProfile = require("../models/UserProfile"); //
const mongoose = require("mongoose"); //

// generateAblyToken function remains the same ...
exports.generateAblyToken = async (req, res) => {
  if (!process.env.ABLY_API_KEY) {
    console.error("[Ably Auth Error] ABLY_API_KEY not set.");
    return res.status(500).json({
      message:
        "Server configuration error: Ably API key not found. Cannot generate token.",
    });
  }
  if (!req.user || !req.user.sub) {
    console.error(
      "[Ably Auth Error] User information (sub) not found on request. Ensure authMiddleware has run."
    );
    return res
      .status(401)
      .json({ message: "User authentication details missing." });
  }
  const clientId = req.user.sub;
  try {
    const ablyClient = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const tokenParams = {
      clientId: clientId,
      capability: {
        "*": ["subscribe", "publish", "presence", "history"],
      },
    };
    console.log(`[Ably Auth] Requesting Ably token for clientId: ${clientId}`);
    const tokenRequest = await ablyClient.auth.createTokenRequest(tokenParams);
    res.status(200).json(tokenRequest);
  } catch (error) {
    console.error(
      `[Ably Auth Error] Error generating Ably token for clientId ${clientId}:`,
      error
    );
    res.status(500).json({
      message: "Failed to generate Ably token.",
      error: error.message,
    });
  }
};

// initiateOrGetConversation function remains the same ...
exports.initiateOrGetConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res
      .status(401)
      .json({ message: "User profile not found. Authentication required." });
  }
  const senderId = req.userProfile._id;
  const { receiverId, propertyId } = req.body;
  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required." });
  }
  if (senderId.toString() === receiverId.toString()) {
    return res
      .status(400)
      .json({ message: "Cannot initiate a conversation with yourself." });
  }
  const participants = [senderId, receiverId].sort();
  try {
    const query = { participants: { $all: participants } };
    if (propertyId) {
      query.property = propertyId;
    } else {
      query.property = null;
    }
    let conversation = await Conversation.findOne(query)
      .populate({
        path: "participants",
        select: "displayName email cognitoSub profilePictureUrl",
      })
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "displayName email" },
      });
    if (!conversation) {
      console.log(
        `Creating new conversation between ${senderId} and ${receiverId}` +
          (propertyId ? ` for property ${propertyId}` : "")
      );
      const newConversationData = {
        participants: participants,
      };
      if (propertyId) {
        newConversationData.property = propertyId;
      }
      conversation = new Conversation(newConversationData);
      await conversation.save();
      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: "participants",
          select: "displayName email cognitoSub profilePictureUrl",
        })
        .populate({
          path: "lastMessage",
        });
    }
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error initiating or getting conversation:", error);
    res.status(500).json({
      message: "Server error processing conversation request.",
      error: error.message,
    });
  }
};

exports.postMessageToConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    //
    return res
      .status(401)
      .json({ message: "User profile not found. Authentication required." }); //
  }

  const senderId = req.userProfile._id; //
  const senderDisplayName =
    req.userProfile.displayName || req.userProfile.email; // For notification
  const { conversationId } = req.params; //
  const { text } = req.body; //

  if (!text || text.trim() === "") {
    //
    return res.status(400).json({ message: "Message text cannot be empty." }); //
  }
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    //
    return res.status(400).json({ message: "Invalid conversation ID format." }); //
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "_id cognitoSub"
    ); // Populate participants to get their IDs for notifications //
    if (!conversation) {
      //
      return res.status(404).json({ message: "Conversation not found." }); //
    }

    if (
      !conversation.participants
        .map((p) => p._id.toString())
        .includes(senderId.toString())
    ) {
      //
      return res
        .status(403)
        .json({ message: "User is not a participant of this conversation." }); //
    }

    const message = new Message({
      //
      conversationId: conversation._id, //
      senderId: senderId, //
      text: text.trim(), //
    });

    await message.save(); //

    conversation.lastMessage = message._id; //
    await conversation.save(); //

    const populatedMessage = await Message.findById(message._id) //
      .populate({
        path: "senderId", //
        select: "displayName email cognitoSub profilePictureUrl", //
      });

    // --- Publish notification to other participants ---
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
      const notificationPayload = {
        conversationId: conversation._id.toString(),
        title: `New message from ${senderDisplayName}`,
        body:
          populatedMessage.text.substring(0, 100) +
          (populatedMessage.text.length > 100 ? "..." : ""), // Snippet
        senderId: senderId.toString(),
        senderDisplayName: senderDisplayName,
        messageId: populatedMessage._id.toString(),
        timestamp: populatedMessage.createdAt,
        // You might want to include property title if available for richer notifications
        // propertyTitle: conversation.property ? (await conversation.populate('property', 'title')).property.title : null
      };

      conversation.participants.forEach((participant) => {
        if (participant._id.toString() !== senderId.toString()) {
          const userNotificationChannelName = `user-notifications-${participant._id.toString()}`;
          const channel = ably.channels.get(userNotificationChannelName);
          console.log(
            `[Backend Notification] Attempting to publish to: ${userNotificationChannelName} for recipient ${participant._id}`
          ); // <<< ADD THIS LOG
          channel.publish(
            "new-message-notification",
            notificationPayload,
            (err) => {
              if (err) {
                console.error(
                  `[Ably Notification] Error publishing to ${userNotificationChannelName}: ${err.message}`
                );
              } else {
                console.log(
                  `[Ably Notification] Successfully published to ${userNotificationChannelName}`
                ); // <<< CONFIRM THIS LOG
              }
            }
          );
        }
      });
    }
    // --- End Notification Publishing ---

    res.status(201).json(populatedMessage); //
  } catch (error) {
    console.error("Error posting message:", error); //
    res
      .status(500)
      .json({ message: "Server error posting message.", error: error.message }); //
  }
};

// getConversationsForUser function remains the same ...
exports.getConversationsForUser = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res
      .status(401)
      .json({ message: "User profile not found. Authentication required." });
  }
  const userId = req.userProfile._id;
  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: "participants",
        select: "displayName email cognitoSub profilePictureUrl",
        // match: { _id: { $ne: userId } } // This would exclude current user from participant list
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "displayName email cognitoSub",
        },
      })
      .populate({
        path: "property",
        select: "title images addressLine1 _id", // Ensure _id is selected for property if needed
      })
      .sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations for user:", error);
    res.status(500).json({
      message: "Server error fetching conversations.",
      error: error.message,
    });
  }
};

// getMessagesInConversation function remains the same ...
exports.getMessagesInConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res
      .status(401)
      .json({ message: "User profile not found. Authentication required." });
  }
  const userId = req.userProfile._id;
  const { conversationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID format." });
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });
    if (!conversation) {
      return res
        .status(403)
        .json({ message: "Access denied or conversation not found." });
    }
    const messages = await Message.find({ conversationId: conversationId })
      .populate({
        path: "senderId",
        select: "displayName email cognitoSub profilePictureUrl",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalMessages = await Message.countDocuments({
      conversationId: conversationId,
    });
    const reversedMessages = messages.reverse();
    res.status(200).json({
      messages: reversedMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages: totalMessages,
    });
  } catch (error) {
    console.error("Error fetching messages in conversation:", error);
    res.status(500).json({
      message: "Server error fetching messages.",
      error: error.message,
    });
  }
};
