const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
      },
    ],
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ property: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
