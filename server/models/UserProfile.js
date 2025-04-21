// server/models/UserProfile.js
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  email: {
    // Link to Cognito user via email
    type: String,
    required: true,
    unique: true, // Ensure one profile per email
    lowercase: true,
    trim: true,
    index: true, // Index for faster lookups
  },
  cognitoSub: {
    // Store Cognito's unique ID as well (good practice)
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    // Store name from Cognito attribute
    type: String,
    trim: true,
  },
  approvalStatus: {
    type: String,
    enum: ["not_started", "pending", "approved", "rejected"],
    default: "not_started",
  },
  govtIdUrl: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // Add any other application-specific fields here
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field on save
userProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
// Middleware to update `updatedAt` field on findOneAndUpdate
userProfileSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
