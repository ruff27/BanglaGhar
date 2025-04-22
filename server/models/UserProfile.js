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
    // Store name from Cognito attribute (e.g., username or sub)
    type: String,
    trim: true,
  },
  // START MODIFICATION: Added displayName field
  displayName: {
    // User-editable display name
    type: String,
    trim: true,
  },
  // END MODIFICATION
  approvalStatus: {
    type: String,
    enum: ["not_started", "pending", "approved", "rejected"],
    default: "not_started",
  },
  accountStatus: {
    type: String,
    enum: ["active", "blocked"],
    default: "active", // Users are active by default
    index: true,
  },
  govtIdUrl: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field on save
userProfileSchema.pre("save", function (next) {
  // START MODIFICATION: Ensure displayName is set on initial save if empty
  // Set default displayName based on 'name' (Cognito source) if displayName is empty
  if (!this.displayName && this.name) {
    this.displayName = this.name;
  }
  // END MODIFICATION
  this.updatedAt = Date.now();
  next();
});

// Middleware to update `updatedAt` field on findOneAndUpdate
userProfileSchema.pre("findOneAndUpdate", function (next) {
  // Ensure `updatedAt` is set for updates using findOneAndUpdate operations
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
