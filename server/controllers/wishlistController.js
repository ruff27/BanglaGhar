// server/controllers/wishlistController.js

const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Property = require("../models/property"); // for populate()

exports.addToWishlist = async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID format" });
    }

    // Find or create wishlist
    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      wishlistDoc = new Wishlist({ username, items: [] });
    }

    // Add if not already present
    if (!wishlistDoc.items.includes(propertyId)) {
      wishlistDoc.items.push(propertyId);
      await wishlistDoc.save();
    }

    // Populate items with Property details
    await wishlistDoc.populate("items");

    res.status(200).json({
      message: "Property added to wishlist successfully",
      wishlist: wishlistDoc.items,
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ error: "Server error adding to wishlist" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const { username } = req.params;

    let wishlistDoc = await Wishlist.findOne({ username }).populate("items");
    if (!wishlistDoc) {
      return res.json({ wishlist: [] });
    }

    res.json({ wishlist: wishlistDoc.items });
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ error: "Server error fetching wishlist" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID format" });
    }

    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const initialLength = wishlistDoc.items.length;
    wishlistDoc.items = wishlistDoc.items.filter(
      (id) => id.toString() !== propertyId
    );

    if (wishlistDoc.items.length < initialLength) {
      await wishlistDoc.save();
      await wishlistDoc.populate("items");
      return res.json({
        message: "Property removed from wishlist successfully",
        wishlist: wishlistDoc.items,
      });
    } else {
      return res.status(404).json({ error: "Property not found in wishlist" });
    }
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ error: "Server error removing from wishlist" });
  }
};
