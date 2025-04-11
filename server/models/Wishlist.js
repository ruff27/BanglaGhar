// models/Wishlist.js

const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
