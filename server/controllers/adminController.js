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
      return res.status(200).json({
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
      return res.status(200).json({
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

// ... (keep existing functions: getPendingApprovals, approveUser, rejectUser) ...

// Get all users (for Manage Users page)
exports.getAllUsers = async (req, res) => {
  try {
    // --- Query Parameters ---
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 25; // Default to 25 users per page
    const sortField = req.query.sort || "name"; // Default sort by name
    const sortOrder = req.query.order === "desc" ? -1 : 1; // Default asc (1)
    const searchTerm = req.query.search || ""; // Search term for name/email
    const statusFilter = req.query.status || ""; // Filter by approvalStatus

    // --- Calculate Skip ---
    const skip = (page - 1) * limit;

    // --- Build Filter Query ---
    let filterQuery = {};
    if (searchTerm) {
      // Case-insensitive search on name and email
      const regex = new RegExp(searchTerm, "i");
      filterQuery.$or = [{ name: regex }, { email: regex }];
    }
    if (
      statusFilter &&
      ["not_started", "pending", "approved", "rejected"].includes(statusFilter)
    ) {
      filterQuery.approvalStatus = statusFilter;
    }
    // Add other filters as needed (e.g., isAdmin: req.query.isAdmin === 'true')

    // --- Build Sort Object ---
    const sortObject = {};
    sortObject[sortField] = sortOrder;
    // Add a secondary sort key for consistency if primary keys are equal (optional)
    if (sortField !== "_id") {
      sortObject["_id"] = 1; // Ascending by ID
    }

    // --- Fetch Data ---
    // Get total count matching the filter *before* pagination
    const totalUsers = await UserProfile.countDocuments(filterQuery);

    // Get paginated, sorted, and filtered users
    const users = await UserProfile.find(filterQuery)
      .select("name email createdAt isAdmin approvalStatus _id") // Ensure _id is included
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // --- Calculate Total Pages ---
    const totalPages = Math.ceil(totalUsers / limit);

    // --- Send Response ---
    res.status(200).json({
      users: users,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error fetching users." });
  }
};

// change user status for approval

exports.updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isAdmin, approvalStatus } = req.body; // Get updates from request body

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  // Validate input data
  const updates = {};
  if (typeof isAdmin === "boolean") {
    updates.isAdmin = isAdmin;
  }
  if (
    approvalStatus &&
    ["not_started", "pending", "approved", "rejected"].includes(approvalStatus)
  ) {
    updates.approvalStatus = approvalStatus;
  }

  // Check if there are any valid fields to update
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  try {
    // Find the user profile by ID
    const userProfile = await UserProfile.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // Prevent admin from modifying their own status via this specific route (optional but safer)
    // Assumes req.userProfile is populated by middleware
    if (req.userProfile && req.userProfile._id.toString() === userId) {
      // Check if attempting to change own admin status
      if (
        updates.hasOwnProperty("isAdmin") &&
        updates.isAdmin !== req.userProfile.isAdmin
      ) {
        console.warn(
          `Admin ${req.user.email} attempted to change their own admin status via bulk update route.`
        );
        return res
          .status(403)
          .json({
            message: "Cannot change your own admin status using this control.",
          });
      }
      // Can potentially allow changing own approval status if needed, otherwise add similar check
    }

    // Apply the updates
    Object.assign(userProfile, updates);

    // Save the updated profile
    const updatedUserProfile = await userProfile.save();

    console.log(
      `Admin ${req.user.email} updated status for user ${userId}. New status:`,
      updates
    );

    // Return the updated user profile (select relevant fields)
    const responseProfile = await UserProfile.findById(userId).select(
      "name email createdAt isAdmin approvalStatus _id"
    );

    res.status(200).json({
      message: "User status updated successfully.",
      user: responseProfile, // Send back the updated user data
    });
  } catch (error) {
    console.error(`Error updating status for user ${userId}:`, error);
    res.status(500).json({ message: "Server error updating user status." });
  }
};

// Add other admin functions later (e.g., list all users, block user)
