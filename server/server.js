// server/server.js
const path = require("path");

const aiRoutes = require("./routes/aiRoutes");

// 1) load exactly the .env you intend
require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});

// 2) imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", aiRoutes);

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

// CREATE property
app.post("/api/properties", async (req, res) => {
  try {
    const { createdBy, ...propertyData } = req.body;

    if (!createdBy) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user must be logged in" });
    }

    const newProperty = new Property({
      ...propertyData,
      createdBy,
    });

    await newProperty.save();
    res.json({
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ error: "Server error creating property" });
  }
});

// READ all properties
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error fetching properties" });
  }
});

// READ single property
app.get("/api/properties/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    console.error("Get property error:", err);
    res.status(500).json({ error: "Server error fetching property" });
  }
});

// UPDATE property
app.put("/api/properties/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updates = req.body;
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updates,
      { new: true }
    );
    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (err) {
    console.error("Update property error:", err);
    res.status(500).json({ error: "Server error updating property" });
  }
});

// DELETE property
app.delete("/api/properties/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ error: "Server error deleting property" });
  }
});

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
