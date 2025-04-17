// server/server.js
const path = require("path");

// 1) load exactly the .env you intend
require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});

const aiRoutes = require("./routes/aiRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

// 2) imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", aiRoutes);
app.use("/api/properties", propertyRoutes);

// 3) connect
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("No Mongo URI found in ENV! Check your .env name.");
  process.exit(1);
}

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:", err);
  });

// 4) MODELS
// Removed the User model since Cognito now handles authentication
const Property = require("./models/Property");
// New Wishlist model for handling user-specific wishlist data
const Wishlist = require("./models/Wishlist");

// 5) TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello from the backend server! MongoDB connection is active.");
});

// 6) AUTH ROUTES
// Removed the signup and login routes since the project now uses Cognito

// 7) PROPERTY ROUTES

// 8) WISHLIST ROUTES

// ADD PROPERTY TO WISHLIST
app.post("/api/users/:username/wishlist", async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;

    // Find existing wishlist or create a new one
    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      wishlistDoc = new Wishlist({ username, items: [] });
    }
    if (wishlistDoc.items.includes(propertyId)) {
      return res.status(400).json({ error: "Property already in wishlist" });
    }

    // Add the property to the wishlist document
    wishlistDoc.items.push(propertyId);
    await wishlistDoc.save();

    res.json({
      message: "Property added to wishlist successfully",
      wishlist: wishlistDoc.items,
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ error: err });
  }
});

// FETCH WISHLISTED PROPERTIES
app.get("/api/users/:username/wishlist", async (req, res) => {
  try {
    const { username } = req.params;

    // Find the wishlist for the given username and populate items if needed
    let wishlistDoc = await Wishlist.findOne({ username }).populate("items");
    if (!wishlistDoc) {
      return res.json({ wishlist: [] });
    }
    res.json({ wishlist: wishlistDoc.items });
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ error: "Server error fetching wishlist" });
  }
});

// REMOVE PROPERTY FROM WISHLIST
app.delete("/api/users/:username/wishlist", async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;

    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    // Remove the property from the wishlist document
    wishlistDoc.items = wishlistDoc.items.filter(
      (id) => id.toString() !== propertyId
    );
    await wishlistDoc.save();

    res.json({
      message: "Property removed from wishlist successfully",
      wishlist: wishlistDoc.items,
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res
      .status(500)
      .json({ error: "Server error removing property from wishlist" });
  }
});

// 9) START THE SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
