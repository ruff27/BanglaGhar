// server/routes/userProfileRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path"); // Needed for path resolution
const fs = require("fs"); // Needed for directory creation
const multer = require("multer"); // Import multer
const userProfileController = require("../controllers/userProfileController");
const authMiddleware = require("../middleware/authMiddleware");

// --- Multer Configuration ---
const UPLOAD_DIR = path.resolve(__dirname, "../uploads/govt_ids"); // Absolute path

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log(`Creating upload directory: ${UPLOAD_DIR}`);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR); // Use absolute path
  },
  filename: function (req, file, cb) {
    // Ensure unique filenames using user identifier + timestamp
    const userIdentifier = req.user?.sub || req.user?.email || "unknownuser"; // Use sub or email
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Keep original extension
    const extension = path.extname(file.originalname);
    // Sanitize userIdentifier if needed (replace characters invalid in filenames)
    const safeIdentifier = userIdentifier.replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${safeIdentifier}-${uniqueSuffix}${extension}`);
  },
});

// Optional: File filter (example: accept only images/PDF)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, or PDF allowed."), false); // Reject file
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit (adjust as needed)
  },
  fileFilter: fileFilter, // Apply the file filter
});

// --- Routes ---

// Route to get the logged-in user's profile
router.get("/me", authMiddleware, userProfileController.getMyProfile);

// PUT /api/user-profiles/me - Update current user's profile (e.g., displayName)
router.put(
  "/me",
  authMiddleware, // Ensures user is logged in
  userProfileController.updateMyProfile // Uses the new controller function
);

// NEW: Route to upload government ID
// Applying middlewares:
// 1. authMiddleware: Verifies token, attaches req.user
// 2. upload.single('govtId'): Handles single file upload from form field named 'govtId', attaches req.file
// 3. userProfileController.uploadGovtId: Processes the request and updates DB
router.post(
  "/me/upload-id",
  authMiddleware,
  upload.single("govtId"), // 'govtId' must match the name attribute of your file input field in the frontend form
  userProfileController.uploadGovtId
);

// GET /api/user-profiles/me/listings - Fetch properties listed by current user
router.get(
  "/me/listings",
  authMiddleware, // Ensure user is logged in
  userProfileController.getMyListings // Use the new controller function
);

// --- Multer Error Handling Middleware ---
// This should be placed after routes that use multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    console.error("Multer Error:", error);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File is too large. Maximum size is 5MB." });
    }
    return res
      .status(400)
      .json({ message: `File upload error: ${error.message}` });
  } else if (error) {
    // An unknown error occurred when uploading.
    console.error("File Upload Error (Non-Multer):", error);
    // Handle specific errors like the fileFilter error
    if (error.message.startsWith("Invalid file type")) {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `File upload failed: ${error.message}` });
  }
  // Everything went fine.
  next();
});

// Add routes for updating profile, etc., later if needed
// router.put('/me', authMiddleware, userProfileController.updateMyProfile);

module.exports = router;
