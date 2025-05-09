// server/routes/userProfileRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path"); // Keep path if needed for extension checking, etc.
// const fs = require("fs"); // Removed: No longer needed for directory creation
const multer = require("multer"); // Import multer
const userProfileController = require("../controllers/userProfileController");
const authMiddleware = require("../middleware/authMiddleware");

// --- Multer Configuration ---
// REMOVED: const UPLOAD_DIR = path.resolve(__dirname, "../uploads/govt_ids");

// REMOVED: Ensure upload directory exists block
// if (!fs.existsSync(UPLOAD_DIR)) {
//   console.log(`Creating upload directory: ${UPLOAD_DIR}`);
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// CHANGED: Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage(); // Store file in memory as a Buffer

// Optional: File filter (example: accept only images/PDF) - Keep this
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

// Configure multer with memory storage and previous limits/filter
const upload = multer({
  storage: storage, // Use memory storage
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

// Route to upload government ID - Multer middleware now uses memory storage
router.post(
  "/me/upload-id",
  authMiddleware,
  upload.single("govtId"), // 'govtId' must match the name attribute of your file input field
  userProfileController.uploadGovtId // Controller needs to handle req.file.buffer
);

// GET /api/user-profiles/me/listings - Fetch properties listed by current user
router.get(
  "/me/listings",
  authMiddleware, // Ensure user is logged in
  userProfileController.getMyListings // Use the new controller function
);

// --- Multer Error Handling Middleware --- (Keep this as is)
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

module.exports = router;
