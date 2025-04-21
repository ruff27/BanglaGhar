// server/controllers/adminController.js
const UserProfile = require("../models/UserProfile");
const mongoose = require("mongoose"); // Required for ObjectId validation

// Get users pending approval
exports.getPendingApprovals = async (req, res) => {
  try {
    // Find users whose status is 'pending'
    // Select only necessary fields to send back
    const pendingUsers = await UserProfile.find({
      approvalStatus: "pending",
    }).select("name email createdAt govtIdUrl _id approvalStatus"); // Added _id and status

    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Server error fetching pending users." });
  }
};

// Approve a user's listing request
exports.approveUser = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter

  // Validate if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const userProfile = await UserProfile.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // Check if user is actually pending (optional, but good practice)
    if (userProfile.approvalStatus !== "pending") {
      console.log(
        `User ${userId} is not pending approval (status: ${userProfile.approvalStatus}). No action taken.`
      );
      // Return success but indicate no change or return a specific message
      return res
        .status(200)
        .json({
          message: `User is already ${userProfile.approvalStatus}.`,
          profile: userProfile,
        });
    }

    userProfile.approvalStatus = "approved";
    await userProfile.save();

    console.log(
      `Admin ${req.user.email} approved user ${userId} (${userProfile.email})`
    );
    res
      .status(200)
      .json({ message: "User approved successfully.", profile: userProfile }); // Return updated profile
  } catch (error) {
    console.error(`Error approving user ${userId}:`, error);
    res.status(500).json({ message: "Server error approving user." });
  }
};

// Reject a user's listing request
exports.rejectUser = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter

  // Validate if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const userProfile = await UserProfile.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // Check if user is actually pending (optional)
    if (userProfile.approvalStatus !== "pending") {
      console.log(
        `User ${userId} is not pending approval (status: ${userProfile.approvalStatus}). No action taken.`
      );
      return res
        .status(200)
        .json({
          message: `User is already ${userProfile.approvalStatus}.`,
          profile: userProfile,
        });
    }

    userProfile.approvalStatus = "rejected";
    // Optionally clear the govtIdUrl upon rejection? Depends on policy.
    // userProfile.govtIdUrl = null;
    await userProfile.save();

    console.log(
      `Admin ${req.user.email} rejected user ${userId} (${userProfile.email})`
    );
    res
      .status(200)
      .json({ message: "User rejected successfully.", profile: userProfile }); // Return updated profile
  } catch (error) {
    console.error(`Error rejecting user ${userId}:`, error);
    res.status(500).json({ message: "Server error rejecting user." });
  }
};

// Add other admin functions later (e.g., list all users, block user)
