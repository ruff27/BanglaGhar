// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the schema (i.e., the structure) for your "User" collection
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // No duplicate usernames
  },
  password: {
    type: String,
    required: true,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property", // Reference to the Property model
    },
  ],
});

// This "pre-save" hook runs before saving a new user
// It automatically hashes the password if it's new or modified
userSchema.pre("save", async function (next) {
  // Only hash if password is new/modified
  if (!this.isModified("password")) return next();

  // Generate a salt and use it to hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// A method to compare a plain password with the hashed one
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Export the model based on this schema
module.exports = mongoose.model("User", userSchema);
