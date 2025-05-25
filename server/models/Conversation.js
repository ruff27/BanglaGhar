// server/models/Conversation.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserProfile", // Refers to your UserProfile model
        required: true,
      },
    ],
    property: {
      // Optional: Link conversation to a specific property
      type: Schema.Types.ObjectId,
      ref: "Property", // Refers to your Property model
      default: null,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Timestamps for when the conversation was created and last updated
    // 'updatedAt' will be particularly useful for sorting conversations by recent activity
  },
  { timestamps: true }
); // `timestamps: true` automatically adds createdAt and updatedAt

// Ensure that a combination of participants (and optionally property) is unique
// to prevent duplicate conversations.
// For two participants, their order in the array doesn't matter for uniqueness.
// A more complex index or pre-save hook might be needed for participant order-agnostic uniqueness if not handled at application level.
// For now, we'll rely on application logic to sort participant IDs before querying/creating.

// Index for efficient querying of conversations by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ property: 1 }); // If you query by property often

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
