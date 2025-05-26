// server/routes/propertyRoutes.js
const express = require("express");
const { body, param, query } = require("express-validator");
const propertyController = require("../controllers/propertyController");
const {
  handleValidationErrors,
} = require("../middleware/ValidationMiddleware");
const authMiddleware = require("../middleware/authMiddleware"); //

// NEW IMPORT for fetchUserProfileMiddleware
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware");

// Assuming you might need mongoose for custom validation or reference
const mongoose = require("mongoose"); //

const router = express.Router();

// POST /api/properties - Create Property
router.post(
  "/",
  authMiddleware, // First, authenticate
  fetchUserProfileMiddleware, // THEN, fetch the user profile <<<< ADD THIS MIDDLEWARE
  [
    // --- Basic Info ---
    body("title").notEmpty().trim().escape().withMessage("Title is required."), //
    body("price").isNumeric().withMessage("Price must be a number.").toFloat(), //

    // --- Location (Based on property.js) ---
    body("addressLine1") //
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Address Line 1 is required."),
    body("addressLine2").optional().trim().escape(), //
    body("cityTown") //
      .notEmpty()
      .trim()
      .escape()
      .withMessage("City/Town is required."),
    body("upazila") //
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Upazila is required."),
    body("district") //
      .notEmpty()
      .trim()
      .escape()
      .withMessage("District is required."),
    body("postalCode") //
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Postal Code is required."),

    // --- Property & Listing Type ---
    body("propertyType") //
      .isIn(["apartment", "house", "condo", "land", "commercial"])
      .withMessage("Invalid property type."),
    body("listingType") //
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type."),

    body("listingStatus")
      .optional() // It will default to 'available' in the controller if not provided
      .isIn(["available", "rented", "sold", "unavailable"])
      .withMessage("Invalid listing status."),

    // --- Details ---
    body("bedrooms") //
      .optional()
      .isInt({ min: 0 })
      .withMessage("Bedrooms must be a non-negative integer.")
      .toInt(),
    body("bathrooms") //
      .optional()
      .isInt({ min: 0 })
      .withMessage("Bathrooms must be a non-negative integer.")
      .toInt(),
    body("area") //
      .optional()
      .isNumeric()
      .withMessage("Area must be a number.")
      .toFloat(),

    // --- Features --- (Validate boolean fields)
    body("features.parking") //
      .optional()
      .isBoolean()
      .withMessage("Parking must be true or false."),
    body("features.garden") //
      .optional()
      .isBoolean()
      .withMessage("Garden must be true or false."),
    body("features.airConditioning") //
      .optional()
      .isBoolean()
      .withMessage("Air Conditioning must be true or false."),
    body("features.furnished") //
      .optional()
      .isIn(["no", "semi", "full"])
      .withMessage("Invalid furnished status."),
    body("features.pool") //
      .optional()
      .isBoolean()
      .withMessage("Pool must be true or false."),

    // --- Bangladesh Specific Details (Example subset) ---
    body("bangladeshDetails.backupPower")
      .optional() // Make it optional if 'none' is a valid non-choice or if it can be omitted
      .isIn(["ips", "generator", "solar", "none"]) // Enum from property.js
      .withMessage("Invalid backup power option."),
    body("bangladeshDetails.sewerSystem")
      .optional()
      .isIn(["covered", "open", "septic_tank", "none"]) // Enum from property.js
      .withMessage("Invalid sewer system option."),
    body("bangladeshDetails.parkingType")
      .optional()
      .isIn(["dedicated", "street", "garage", "none"]) // Enum from property.js
      .withMessage("Invalid parking type option."),

    // Also, ensure other enum fields from bangladeshDetails are validated if they are mandatory
    // or have specific enum constraints you want to check early.
    // For example, propertyCondition is required in your Step_Bangladesh_Details.js
    body("bangladeshDetails.propertyCondition")
      .notEmpty()
      .withMessage("Property condition is required.") // If it's truly required
      .isIn(["new", "under_construction", "resale"]) // Enum from property.js
      .withMessage("Invalid property condition."),
    body("bangladeshDetails.waterSource")
      .notEmpty()
      .withMessage("Water source is required.") // If it's truly required
      .isIn(["wasa", "deep_tube_well", "both", "other"]) // Enum from property.js
      .withMessage("Invalid water source."),
    body("bangladeshDetails.gasSource")
      .notEmpty()
      .withMessage("Gas source is required.") // If it's truly required
      .isIn(["piped", "cylinder", "none"]) // Enum from property.js
      .withMessage("Invalid gas source."),
    body("bangladeshDetails.gasLineInstalled")
      .optional() // Assuming 'no' is a valid default and can be overridden
      .isIn(["yes", "no", "na"]) // Enum from property.js
      .withMessage("Invalid gas line installation status."),
    body("bangladeshDetails.floodProne")
      .optional() // Assuming 'no' is a valid default
      .isIn(["yes", "no", "sometimes"]) // Enum from property.js
      .withMessage("Invalid flood prone status."),
    body("bangladeshDetails.securityFeatures.*") // For array elements
      .optional()
      .isIn(["gated", "guards", "cctv"]) // Enum from property.js
      .withMessage("Invalid security feature selected."),
    body("bangladeshDetails.earthquakeResistance")
      .optional() // Assuming 'unknown' is a valid default
      .isIn(["yes", "no", "unknown"]) // Enum from property.js
      .withMessage("Invalid earthquake resistance status."),
    body("bangladeshDetails.balcony")
      .optional() // Assuming 'no' is a valid default
      .isIn(["yes", "no"]) // Enum from property.js
      .withMessage("Invalid balcony status."),
    body("bangladeshDetails.rooftopAccess")
      .optional() // Assuming 'no' is a valid default
      .isIn(["yes", "no"]) // Enum from property.js
      .withMessage("Invalid rooftop access status."),
    body("bangladeshDetails.ownershipPapers")
      .optional() // Assuming 'unknown' is a valid default
      .isIn(["clear", "pending", "issue", "unknown"]) // Enum from property.js
      .withMessage("Invalid ownership papers status."),
    body("bangladeshDetails.propertyTenure")
      .optional()
      .isIn(["freehold", "leasehold", ""]) // Allow empty string if it's truly optional and not selected
      .withMessage("Invalid property tenure."),
  ],
  handleValidationErrors, //
  propertyController.createProperty //
);

// GET /api/properties - Get All Properties (remains the same)
router.get(
  "/",
  [
    query("random") //
      .optional()
      .isBoolean()
      .withMessage("Random must be true or false."),
    query("featured") //
      .optional()
      .isBoolean()
      .withMessage("Featured must be true or false."),
    query("limit") //
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer."),
    query("listingType") //
      .optional()
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type filter."),
    query("listingStatus") // For explicitly querying by status
      .optional()
      .isIn(["available", "rented", "sold", "unavailable"])
      .withMessage("Invalid listing status filter."),
    query("includeUnavailable") // To fetch all statuses
      .optional()
      .isBoolean()
      .withMessage("includeUnavailable must be true or false.")
      .toBoolean(),
  ],
  handleValidationErrors, //
  propertyController.getAllProperties //
);

// GET /api/properties/:id - Get Property by ID (remains the same)
router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), //
  ],
  handleValidationErrors, //
  propertyController.getPropertyById //
);

// PUT /api/properties/:id - Update Property
// Add fetchUserProfileMiddleware here as well if updateProperty needs req.userProfile
// and to ensure user can only update their own properties (logic for that check would be in controller)
router.put(
  "/:id",
  authMiddleware, //
  fetchUserProfileMiddleware, // <<<< ADD THIS if updates depend on user profile or for ownership checks
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), //
    body("title") //
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Title cannot be empty if provided."),
    body("price") //
      .optional()
      .isNumeric()
      .withMessage("Price must be a number.")
      .toFloat(),
    body("addressLine1") //
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Address Line 1 cannot be empty if provided."),
    body("cityTown") //
      .optional()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("City/Town cannot be empty if provided."),
    body("isHidden") //
      .optional()
      .isBoolean()
      .withMessage("isHidden must be true or false."),

    body("listingStatus")
      .optional()
      .isIn(["available", "rented", "sold", "unavailable"])
      .withMessage("Invalid listing status provided for update."),
  ],
  handleValidationErrors, //
  propertyController.updateProperty //
);

// DELETE /api/properties/:id - Delete Property
// Add fetchUserProfileMiddleware here as well if deleteProperty needs req.userProfile
// and to ensure user can only delete their own properties (logic for that check would be in controller)
router.delete(
  "/:id",
  authMiddleware, //
  fetchUserProfileMiddleware, // <<<< ADD THIS if deletes depend on user profile or for ownership checks
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), //
  ],
  handleValidationErrors, //
  propertyController.deleteProperty //
);

module.exports = router;
