// server/models/Message.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation", // Links to the Conversation model
      required: true,
      index: true, // Index for fetching messages by conversation quickly
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile", // Links to the UserProfile model (the sender)
      required: true,
    },
    // receiverId: { // Not strictly needed if we have conversationId and senderId within a 2-participant conversation
    //   type: Schema.Types.ObjectId,
    //   ref: 'UserProfile',
    //   required: true,
    // },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // status: { // Optional: for read receipts
    //   type: String,
    //   enum: ['sent', 'delivered', 'read'],
    //   default: 'sent',
    // },
    // messageType: { // Optional: if you plan to support images, files, etc.
    //   type: String,
    //   enum: ['text', 'image', 'file'],
    //   default: 'text',
    // }
  },
  { timestamps: true }
); // `timestamps: true` automatically adds createdAt and updatedAt

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
