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

// 4) USER MODEL
const User = require("./models/User");

// 5) PROPERTY MODEL
const Property = require("./models/Property");

// 6) TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello from the backend server! MongoDB connection is active.");
});

// 7) AUTH ROUTES
// SIGN UP
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists. Please choose a different name.",
      });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    return res.json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // If match, respond with success (or token if you want)
    return res.json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// 8) PROPERTY ROUTES

// CREATE property
app.post("/api/properties", async (req, res) => {
  try {
    // Typically you'd check if user is logged in, but let's skip that for now
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

    // createdBy is the user ID of whoever is creating it
    // In a real app, you'd get this from an auth token or session

    const newProperty = new Property({
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
    // .populate('createdBy') to get user info from User model
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
    const updates = req.body; // title, price, etc.
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

// 9) START THE SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
