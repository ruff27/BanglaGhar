
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
    index: true, 
  },
  cognitoSub: {
   
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    
    type: String,
    trim: true,
  },
  
  displayName: {
    
    type: String,
    trim: true,
  },
  
  approvalStatus: {
    type: String,
    enum: ["not_started", "pending", "approved", "rejected"],
    default: "not_started",
  },
  accountStatus: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
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


userProfileSchema.pre("save", function (next) {
  if (this.isNew || !this.displayName) {
    if (!this.displayName && this.name) {
      this.displayName = this.name;
    }
  }

  this.updatedAt = Date.now();
  next();
});


userProfileSchema.pre("findOneAndUpdate", function (next) {
  
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
