// server/routes/adminRoutes.js
const express = require("express");
const { body, param, query } = require("express-validator"); // Keep validator imports
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware"); // <<<--- IMPORT THIS MIDDLEWARE
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const {
  handleValidationErrors,
} = require("../middleware/ValidationMiddleware"); // Keep this

// Assuming mongoose might be needed if you have custom validation needing it
const mongoose = require("mongoose");

const router = express.Router();

// --- IMPORTANT: Correct Middleware Order ---
// 1. Authenticate the user (provides req.user, e.g., req.user.email)
// 2. Fetch the full user profile from DB based on req.user info (provides req.userProfile)
// 3. Check if the fetched profile (req.userProfile) has admin privileges
router.use(authMiddleware, fetchUserProfileMiddleware, isAdminMiddleware);
// -------------------------------------------
// Now, all subsequent routes defined on this router instance will first pass through
// these three middlewares in the specified order.

// --- Your Admin Routes (Validation remains the same) ---

// GET /api/admin/stats
router.get("/stats", adminController.getDashboardStats);

// GET /api/admin/pending-approvals
router.get("/pending-approvals", adminController.getPendingApprovals);

router.get(
  "/get-signed-id-url/:userId", // New distinct path
  authMiddleware, // MUST be authenticated
  isAdminMiddleware, // MUST be admin
  adminController.getSignedIdUrlForAdmin // Use the new controller function
);

// PUT /api/admin/users/:userId/approve
router.put(
  "/users/:userId/approve",
  [param("userId").isMongoId().withMessage("Invalid user ID format.")],
  handleValidationErrors,
  adminController.approveUser // This controller can now safely assume req.userProfile exists if isAdminMiddleware passed
);

// PUT /api/admin/users/:userId/reject
router.put(
  "/users/:userId/reject",
  [param("userId").isMongoId().withMessage("Invalid user ID format.")],
  handleValidationErrors,
  adminController.rejectUser
);

// GET /api/admin/users
router.get(
  "/users",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer."),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer."),
    query("sort").optional().isString().trim().escape(),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage('Order must be "asc" or "desc".'),
    query("search").optional().isString().trim().escape(),
    query("status")
      .optional()
      .isIn(["not_started", "pending", "approved", "rejected"])
      .withMessage("Invalid status filter."),
  ],
  handleValidationErrors,
  adminController.getAllUsers
);

// PUT /api/admin/users/:userId/status
router.put(
  "/users/:userId/status",
  [
    param("userId").isMongoId().withMessage("Invalid user ID format."),
    body("isAdmin")
      .optional()
      .isBoolean()
      .withMessage("isAdmin must be true or false."),
    body("approvalStatus")
      .optional()
      .isIn(["not_started", "pending", "approved", "rejected"])
      .withMessage("Invalid approval status."),
    body("accountStatus")
      .optional()
      .isIn(["active", "blocked"])
      .withMessage("Invalid account status."),
  ],
  handleValidationErrors,
  adminController.updateUserStatus
);

// GET /api/admin/listings
router.get(
  "/listings",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer."),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer."),
    query("sort").optional().isString().trim().escape(),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage('Order must be "asc" or "desc".'),
    query("search").optional().isString().trim().escape(),
    query("listingType")
      .optional()
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type filter."),
    query("propertyType")
      .optional()
      .isIn(["apartment", "house", "condo", "land", "commercial"])
      .withMessage("Invalid property type filter."),
    query("isHidden")
      .optional()
      .isBoolean()
      .withMessage("isHidden filter must be true or false."),
    query("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("isFeatured filter must be true or false."),
  ],
  handleValidationErrors,
  adminController.getAllListings
);

// PUT /api/admin/listings/:listingId/visibility
router.put(
  "/listings/:listingId/visibility",
  [
    param("listingId").isMongoId().withMessage("Invalid listing ID format."),
    body("isHidden").isBoolean().withMessage("isHidden must be true or false."),
  ],
  handleValidationErrors,
  adminController.updateListingVisibility
);

// PUT /api/admin/listings/:listingId/feature
router.put(
  "/listings/:listingId/feature",
  [
    param("listingId").isMongoId().withMessage("Invalid listing ID format."),
    body("feature").isBoolean().withMessage("feature must be true or false."),
  ],
  handleValidationErrors,
  adminController.featureListing
);

// POST /api/admin/listings/delete-multiple
router.post(
  "/listings/delete-multiple",
  [
    body("listingIds")
      .isArray({ min: 1 })
      .withMessage("listingIds must be a non-empty array.")
      .custom((ids) => {
        if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
          throw new Error("One or more listing IDs are invalid.");
        }
        return true;
      }),
  ],
  handleValidationErrors,
  adminController.deleteMultipleListings
);

module.exports = router;
