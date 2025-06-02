const express = require("express");
const router = express.Router({ mergeParams: true });
const wishlistController = require("../controllers/wishlistController");

router.post("/", wishlistController.addToWishlist);
router.get("/", wishlistController.getWishlist);
router.delete("/", wishlistController.removeFromWishlist);

module.exports = router;
