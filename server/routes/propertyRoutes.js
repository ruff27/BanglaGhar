// server/routes/propertyRoutes.js
const express = require("express");
const { body, param, query } = require("express-validator");
const propertyController = require("../controllers/propertyController");
const {
  handleValidationErrors,
} = require("../middleware/ValidationMiddleware");
const authMiddleware = require("../middleware/authMiddleware"); // Optional: Apply if needed for specific routes

// Assuming you might need mongoose for custom validation or reference
const mongoose = require("mongoose");

const router = express.Router();

// POST /api/properties - Create Property
router.post(
  "/",
  authMiddleware, // Example: Protect property creation
  [
    // --- Basic Info ---
    body("title").notEmpty().trim().escape().withMessage("Title is required."), // [cite: 4]
    body("price").isNumeric().withMessage("Price must be a number.").toFloat(), // [cite: 4] Convert to float after validation

    // --- Location (Based on property.js) --- [cite: 4]
    body("addressLine1")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Address Line 1 is required."),
    body("addressLine2").optional().trim().escape(),
    body("cityTown")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("City/Town is required."),
    body("upazila")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Upazila is required."),
    body("district")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("District is required."),
    body("postalCode")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Postal Code is required."),

    // --- Property & Listing Type --- [cite: 4]
    body("propertyType")
      .isIn(["apartment", "house", "condo", "land", "commercial"])
      .withMessage("Invalid property type."),
    body("listingType")
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type."),

    // --- Details --- [cite: 4]
    body("bedrooms")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Bedrooms must be a non-negative integer.")
      .toInt(),
    body("bathrooms")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Bathrooms must be a non-negative integer.")
      .toInt(),
    body("area")
      .optional()
      .isNumeric()
      .withMessage("Area must be a number.")
      .toFloat(),

    // --- Features --- [cite: 4] (Validate boolean fields)
    body("features.parking")
      .optional()
      .isBoolean()
      .withMessage("Parking must be true or false."),
    body("features.garden")
      .optional()
      .isBoolean()
      .withMessage("Garden must be true or false."),
    body("features.airConditioning")
      .optional()
      .isBoolean()
      .withMessage("Air Conditioning must be true or false."),
    body("features.furnished")
      .optional()
      .isIn(["no", "semi", "full"])
      .withMessage("Invalid furnished status."),
    body("features.pool")
      .optional()
      .isBoolean()
      .withMessage("Pool must be true or false."),

    // --- Bangladesh Specific Details (Example subset) --- [cite: 4]
    body("bangladeshDetails.propertyCondition")
      .optional()
      .isIn(["new", "under_construction", "resale"])
      .withMessage("Invalid property condition."),
    body("bangladeshDetails.floodProne")
      .optional()
      .isIn(["yes", "no", "sometimes"])
      .withMessage("Invalid flood prone value."),
    // ... add validation for other bangladeshDetails fields as needed ...

    // --- Other Fields ---
    body("description").optional().trim().escape(),
    body("images").optional().isArray().withMessage("Images must be an array."),
    body("images.*")
      .optional()
      .isURL()
      .withMessage("Each image must be a valid URL."), // Validate each item in the array
    body("createdBy")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Created By is required."), // [cite: 4] Should likely be set server-side based on logged-in user
  ],
  handleValidationErrors,
  propertyController.createProperty
);

// GET /api/properties - Get All Properties
router.get(
  "/",
  [
    // Validate query parameters [cite: 3]
    query("random")
      .optional()
      .isBoolean()
      .withMessage("Random must be true or false."),
    query("featured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be true or false."),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer."),
    query("listingType")
      .optional()
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type filter."), // [cite: 4]
  ],
  handleValidationErrors,
  propertyController.getAllProperties
);

// GET /api/properties/:id - Get Property by ID
router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), // Validate id in params [cite: 3]
  ],
  handleValidationErrors,
  propertyController.getPropertyById
);

// PUT /api/properties/:id - Update Property
router.put(
  "/:id",
  authMiddleware, // Example: Protect property updates
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), // Validate id in params [cite: 3]
    // Add optional validation for any fields allowed in the update body
    // Re-use validations from the POST route but make them optional()
    body("title")
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Title cannot be empty if provided."),
    body("price")
      .optional()
      .isNumeric()
      .withMessage("Price must be a number.")
      .toFloat(),
    body("addressLine1")
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Address Line 1 cannot be empty if provided."),
    body("cityTown")
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("City/Town cannot be empty if provided."),
    // ... add optional validation for all other updatable fields ...
    body("isHidden")
      .optional()
      .isBoolean()
      .withMessage("isHidden must be true or false."), // Allow updating isHidden via this route too? Or only admin route?
  ],
  handleValidationErrors,
  propertyController.updateProperty // Assumes updateProperty handles partial updates [cite: 3]
);

// DELETE /api/properties/:id - Delete Property
router.delete(
  "/:id",
  authMiddleware, // Example: Protect property deletion
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), // Validate id in params [cite: 3]
  ],
  handleValidationErrors,
  propertyController.deleteProperty
);

module.exports = router;
