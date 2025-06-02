const express = require("express");
const { body, param, query } = require("express-validator"); 
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware"); 
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const {
  handleValidationErrors,
} = require("../middleware/ValidationMiddleware"); 


const mongoose = require("mongoose");

const router = express.Router();


router.use(authMiddleware, fetchUserProfileMiddleware, isAdminMiddleware);

router.get("/stats", adminController.getDashboardStats);


router.get("/pending-approvals", adminController.getPendingApprovals);

router.get(
  "/get-signed-id-url/:userId", 
  authMiddleware, 
  isAdminMiddleware, 
  adminController.getSignedIdUrlForAdmin 
);

router.put(
  "/users/:userId/approve",
  [param("userId").isMongoId().withMessage("Invalid user ID format.")],
  handleValidationErrors,
  adminController.approveUser 
);

router.put(
  "/users/:userId/reject",
  [param("userId").isMongoId().withMessage("Invalid user ID format.")],
  handleValidationErrors,
  adminController.rejectUser
);

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

router.put(
  "/listings/:listingId/visibility",
  [
    param("listingId").isMongoId().withMessage("Invalid listing ID format."),
    body("isHidden").isBoolean().withMessage("isHidden must be true or false."),
  ],
  handleValidationErrors,
  adminController.updateListingVisibility
);

router.put(
  "/listings/:listingId/feature",
  [
    param("listingId").isMongoId().withMessage("Invalid listing ID format."),
    body("feature").isBoolean().withMessage("feature must be true or false."),
  ],
  handleValidationErrors,
  adminController.featureListing
);

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
