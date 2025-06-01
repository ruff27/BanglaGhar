const Ably = require("ably");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const UserProfile = require("../models/UserProfile");
const mongoose = require("mongoose");

exports.generateAblyToken = async (req, res) => {
  if (!process.env.ABLY_API_KEY) {
    return res.status(500).json({
      message: "Server configuration error: Ably API key not found.",
    });
  }
  if (!req.user || !req.user.sub) {
    return res
      .status(401)
      .json({ message: "User authentication details missing." });
  }

  try {
    const ablyClient = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const tokenRequest = await ablyClient.auth.createTokenRequest({
      clientId: req.user.sub,
      capability: { "*": ["subscribe", "publish", "presence", "history"] },
    });
    res.status(200).json(tokenRequest);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate Ably token.",
      error: error.message,
    });
  }
};

exports.initiateOrGetConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { receiverId, propertyId } = req.body;
  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required." });
  }
  if (req.userProfile._id.toString() === receiverId.toString()) {
    return res.status(400).json({ message: "Cannot message yourself." });
  }

  try {
    const participants = [req.userProfile._id, receiverId].sort();
    const query = { participants: { $all: participants } };
    if (propertyId) query.property = propertyId;

    let conversation = await Conversation.findOne(query)
      .populate(
        "participants",
        "displayName email cognitoSub profilePictureUrl"
      )
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "displayName email" },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        property: propertyId,
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "displayName email cognitoSub profilePictureUrl"
      );
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      message: "Server error processing conversation request.",
      error: error.message,
    });
  }
};

exports.postMessageToConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Message text cannot be empty." });
  }
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID format." });
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "_id cognitoSub"
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }
    if (
      !conversation.participants.some((p) => p._id.equals(req.userProfile._id))
    ) {
      return res
        .status(403)
        .json({ message: "Not a conversation participant." });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.userProfile._id,
      text: text.trim(),
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "displayName email cognitoSub profilePictureUrl"
    );

    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
      const notificationPayload = {
        conversationId: conversation._id.toString(),
        title: `New message from ${
          req.userProfile.displayName || req.userProfile.email
        }`,
        body:
          populatedMessage.text.substring(0, 100) +
          (populatedMessage.text.length > 100 ? "..." : ""),
        senderId: req.userProfile._id.toString(),
        senderDisplayName: req.userProfile.displayName || req.userProfile.email,
        messageId: populatedMessage._id.toString(),
        timestamp: populatedMessage.createdAt,
      };

      conversation.participants
        .filter((p) => !p._id.equals(req.userProfile._id))
        .forEach((participant) => {
          const channel = ably.channels.get(
            `user-notifications-${participant._id}`
          );
          channel.publish("new-message-notification", notificationPayload);
        });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: "Server error posting message.",
      error: error.message,
    });
  }
};

exports.getConversationsForUser = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const conversations = await Conversation.aggregate([
      { $match: { participants: req.userProfile._id } },
      {
        $lookup: {
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$conversationId", "$$conversationId"] },
                senderId: { $ne: req.userProfile._id },
                read: { $ne: true },
              },
            },
          ],
          as: "unreadMessages",
        },
      },
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" },
        },
      },
      { $sort: { updatedAt: -1 } },
    ]).exec();

    await Conversation.populate(conversations, [
      {
        path: "participants",
        select: "displayName email cognitoSub profilePictureUrl",
      },
      {
        path: "lastMessage",
        populate: { path: "senderId", select: "displayName email cognitoSub" },
      },
      { path: "property", select: "title images addressLine1 _id" },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching conversations.",
      error: error.message,
    });
  }
};

exports.getMessagesInConversation = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { conversationId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;

  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userProfile._id,
    });

    if (!conversation) {
      return res
        .status(403)
        .json({ message: "Access denied or conversation not found." });
    }

    const [messages, totalMessages] = await Promise.all([
      Message.find({ conversationId })
        .populate("senderId", "displayName email cognitoSub profilePictureUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Message.countDocuments({ conversationId }),
    ]);

    res.status(200).json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching messages.",
      error: error.message,
    });
  }
};

exports.markConversationAsRead = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        senderId: { $ne: req.userProfile._id },
        read: { $ne: true },
      },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Server error marking messages as read.",
      error: error.message,
    });
  }
};

exports.getConversationsSummaryForUser = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const conversations = await Conversation.find({
      participants: req.userProfile._id,
    })
      .populate(
        "participants",
        "displayName email cognitoSub profilePictureUrl _id"
      )
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "displayName email cognitoSub _id",
        },
      })
      .populate("property", "title _id images")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching conversations summary.",
      error: error.message,
    });
  }
};
