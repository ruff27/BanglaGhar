// server/routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const fetchUserProfileMiddleware = require("../middleware/fetchUserProfileMiddleware");
const checkListingApprovalMiddleware = require("../middleware/checkListingApprovalMiddleware.js"); // You fixed this import
const {
  handleValidationErrors,
} = require("../middleware/ValidationMiddleware");
const { body, param, query } = require("express-validator");
const multer = require("multer"); 

// >> ENSURE THIS MULTER CONFIGURATION IS PRESENT AND CORRECT <<
// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image file."), false);
    }
  },
});

router.post(
  "/",
  authMiddleware, 
  fetchUserProfileMiddleware, 
  [
    
    body("title").notEmpty().trim().escape().withMessage("Title is required."), //
    body("price").isNumeric().withMessage("Price must be a number.").toFloat(), //

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

    
    body("propertyType") //
      .isIn(["apartment", "house", "condo", "land", "commercial"])
      .withMessage("Invalid property type."),
    body("listingType") //
      .isIn(["rent", "buy", "sold"])
      .withMessage("Invalid listing type."),

    body("listingStatus")
      .optional() 
      .isIn(["available", "rented", "sold", "unavailable"])
      .withMessage("Invalid listing status."),

    
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

    body("bangladeshDetails.backupPower")
      .optional() 
      .isIn(["ips", "generator", "solar", "none"]) 
      .withMessage("Invalid backup power option."),
    body("bangladeshDetails.sewerSystem")
      .optional()
      .isIn(["covered", "open", "septic_tank", "none"]) 
      .withMessage("Invalid sewer system option."),
    body("bangladeshDetails.parkingType")
      .optional()
      .isIn(["dedicated", "street", "garage", "none"]) 
      .withMessage("Invalid parking type option."),

    body("bangladeshDetails.propertyCondition")
      .notEmpty()
      .withMessage("Property condition is required.") 
      .isIn(["new", "under_construction", "resale"]) 
      .withMessage("Invalid property condition."),
    body("bangladeshDetails.waterSource")
      .notEmpty()
      .withMessage("Water source is required.") 
      .isIn(["wasa", "deep_tube_well", "both", "other"]) 
      .withMessage("Invalid water source."),
    body("bangladeshDetails.gasSource")
      .notEmpty()
      .withMessage("Gas source is required.") 
      .isIn(["piped", "cylinder", "none"]) 
      .withMessage("Invalid gas source."),
    body("bangladeshDetails.gasLineInstalled")
      .optional() 
      .isIn(["yes", "no", "na"]) 
      .withMessage("Invalid gas line installation status."),
    body("bangladeshDetails.floodProne")
      .optional() 
      .isIn(["yes", "no", "sometimes"]) 
      .withMessage("Invalid flood prone status."),
    body("bangladeshDetails.securityFeatures.*") 
      .optional()
      .isIn(["gated", "guards", "cctv"]) 
      .withMessage("Invalid security feature selected."),
    body("bangladeshDetails.earthquakeResistance")
      .optional() 
      .isIn(["yes", "no", "unknown"]) 
      .withMessage("Invalid earthquake resistance status."),
    body("bangladeshDetails.balcony")
      .optional() 
      .isIn(["yes", "no"]) 
      .withMessage("Invalid balcony status."),
    body("bangladeshDetails.rooftopAccess")
      .optional() 
      .isIn(["yes", "no"]) 
      .withMessage("Invalid rooftop access status."),
    body("bangladeshDetails.ownershipPapers")
      .optional()
      .isIn(["clear", "pending", "issue", "unknown"]) 
      .withMessage("Invalid ownership papers status."),
    body("bangladeshDetails.propertyTenure")
      .optional()
      .isIn(["freehold", "leasehold", "unknown", ""]) 
      .withMessage("Invalid property tenure."),
  ],
  handleValidationErrors, //
  propertyController.createProperty //
);


router.get(
  "/",
  [
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
      .withMessage("Invalid listing type filter."),
    query("listingStatus") 
      .optional()
      .isIn(["available", "rented", "sold", "unavailable"])
      .withMessage("Invalid listing status filter."),
    query("includeUnavailable") 
      .optional()
      .isBoolean()
      .withMessage("includeUnavailable must be true or false.")
      .toBoolean(),
  ],
  handleValidationErrors, //
  propertyController.getAllProperties //
);


router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid property ID format."), //
  ],
  handleValidationErrors, //
  propertyController.getPropertyById //
);

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


router.post(
  "/upload-image", 
  authMiddleware,
  fetchUserProfileMiddleware,
  checkListingApprovalMiddleware,
  upload.single("propertyImage"), // 'propertyImage' is the field name from FormData
  propertyController.uploadPropertyImageToS3 // Ensure this controller function exists
);

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
