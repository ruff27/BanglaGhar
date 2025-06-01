const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation", 
      required: true,
      index: true, 
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile", 
      required: true,
    },
  
    text: {
      type: String,
      required: true,
      trim: true,
    },
    
  },
  { timestamps: true }
); 

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
