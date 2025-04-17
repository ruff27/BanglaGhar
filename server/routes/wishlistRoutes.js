// server/routes/wishlistRoutes.js

const express = require("express");
// mergeParams so we can read :username from parent mount
const router = express.Router({ mergeParams: true });
const wishlistController = require("../controllers/wishlistController");

// Base path: /api/users/:username/wishlist
router.post("/", wishlistController.addToWishlist);
router.get("/", wishlistController.getWishlist);
router.delete("/", wishlistController.removeFromWishlist);

module.exports = router;
