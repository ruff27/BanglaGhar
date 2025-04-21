// server/routes/adminRoutes.js  <-- Make sure this is the content of this file

const express = require("express");
const router = express.Router();
// Verify this path is correct
const adminController = require("../controllers/adminController");

// Import Middlewares - Verify these paths are correct
const authMiddleware = require("../middleware/authMiddleware");
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware");
const isAdminMiddleware = require("../middleware/isAdminMiddleware"); // Make sure you created this middleware file

// Middleware chain for all admin routes
const requireAdmin = [
  authMiddleware, // 1. Authenticate user
  fetchUserProfileMiddleware, // 2. Fetch user's profile
  isAdminMiddleware, // 3. Check if user is admin
];

// Update user status (isAdmin, approvalStatus)
router.put(
  "/users/:userId/status", // The new endpoint for general status updates
  requireAdmin,
  adminController.updateUserStatus // Linked to the new controller function
);

// Get users pending approval
router.get(
  "/pending-approvals",
  requireAdmin,
  adminController.getPendingApprovals
);

// Get all users
router.get(
  "/users", // The new endpoint
  requireAdmin, // Protected by the same middleware chain
  adminController.getAllUsers // Linked to the new controller function
);

// Get all property listings
router.get(
  "/listings", // The new endpoint
  requireAdmin,
  adminController.getAllListings // Linked to the new controller
);

// Update listing visibility (Hide/Unhide)
router.put(
  "/listings/:listingId/visibility", // New endpoint
  requireAdmin,
  adminController.updateListingVisibility // Linked to the new controller
);

// Approve a user
router.put("/users/:userId/approve", requireAdmin, adminController.approveUser);

// Reject a user
router.put("/users/:userId/reject", requireAdmin, adminController.rejectUser);

// Add other admin routes here later

// Ensure this line is present and correct at the very end
module.exports = router;
