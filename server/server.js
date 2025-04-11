// server.js

// 1) IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2) APP SETUP
const app = express();
app.use(cors());
app.use(express.json()); // parse incoming JSON data

// 3) CONNECT TO MONGODB ATLAS
mongoose
  .connect(
    "mongodb+srv://103531273:forctpA2025@cluster1.wmpcxe1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

// 4) MODELS

const User = require("./models/User");
const Property = require("./models/Property");
// New Wishlist model for handling user-specific wishlist data without needing a MongoDB user record.
const Wishlist = require("./models/Wishlist");

// 5) TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello from the backend server! MongoDB connection is active.");
});

// 6) (Optional) AUTH ROUTES for backward compatibility
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists. Please choose a different name.",
      });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    return res.json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    return res.json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// 7) PROPERTY ROUTES

// CREATE property
app.post("/api/properties", async (req, res) => {
  try {
    console.log("Received property data:", req.body); // Debug line

    const {
      title,
      price,
      location,
      mode,
      bedrooms,
      bathrooms,
      area,
      description,
      images,
      createdBy,
    } = req.body;
    if (!createdBy) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user must be logged in" });
    }
    const userDoc = await User.findOne({ username: createdBy });
    if (!userDoc) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: "Price must be a number" });
    }
    const propertyImages =
      images && images.length > 0 ? images : ["house1.png"];

    const newProperty = new Property({
      title,
      price: parsedPrice,
      location,
      mode,
      bedrooms,
      bathrooms,
      area,
      description,
      images: propertyImages,
      createdBy: userDoc._id,
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
    const properties = await Property.find().populate("createdBy", "username");
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
    const property = await Property.findById(propertyId).populate(
      "createdBy",
      "username"
    );
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

// 8) WISHLIST ROUTES (Using the Wishlist model)

app.post("/api/users/:username/wishlist", async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;

    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      wishlistDoc = new Wishlist({ username, items: [] });
    }
    if (wishlistDoc.items.includes(propertyId)) {
      return res.status(400).json({ error: "Property already in wishlist" });
    }

    // Add the property to the wishlist
    user.wishlist.push(propertyId);
    await user.save();

    res.json({
      message: "Property added to wishlist successfully",
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ error: err });
  }
});

app.get("/api/users/:username/wishlist", async (req, res) => {
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
});

app.delete("/api/users/:username/wishlist", async (req, res) => {
  try {
    const { username } = req.params;
    const { propertyId } = req.body;
    let wishlistDoc = await Wishlist.findOne({ username });
    if (!wishlistDoc) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    // Remove the property from the wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    res.json({
      message: "Property removed from wishlist successfully",
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res
      .status(500)
      .json({ error: "Server error removing property from wishlist" });
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
