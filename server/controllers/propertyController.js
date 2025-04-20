// server/controllers/propertyController.js
const Property = require("../models/Property");
const mongoose = require("mongoose"); // Ensure mongoose is required if not already

// Example for Create Property (remains the same):
exports.createProperty = async (req, res) => {
  // ... (existing code) ...
  try {
    const newProperty = new Property({
      ...req.body,
      // Ensure createdBy is handled correctly, perhaps passed in req.body
      // createdBy: req.user.id // Example if user info was available
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Create property error:", err); // Log error
    // Provide more specific error messages if possible
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.message });
    }
    res.status(500).json({ error: "Server error creating property" });
  }
};

// --- MODIFIED Get All Properties ---
exports.getAllProperties = async (req, res) => {
  try {
    // Check for 'random' query parameter
    const isRandom = req.query.random === "true";
    // Get limit, default to a reasonable number if random, maybe 30?
    // Or use the limit specifically requested for random (e.g., 30)
    const limit = parseInt(req.query.limit) || (isRandom ? 30 : 0); // Default limit 0 means no limit unless random

    let properties;

    if (isRandom && limit > 0) {
      // Use $sample aggregation for random selection
      properties = await Property.aggregate([{ $sample: { size: limit } }]);
      console.log(
        `Fetched ${properties.length} random properties (limit: ${limit})`
      );
    } else {
      // Standard find query (add filters/pagination later if needed)
      // Example: Add filtering based on query params like mode, location etc.
      const queryFilters = {};
      if (req.query.listingType) {
        queryFilters.listingType = req.query.listingType;
      }
      // Add more filters as needed...

      // Apply limit if provided and not random, otherwise fetch all matching filters
      const query = Property.find(queryFilters);
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(
        `Fetched ${properties.length} properties with filters/limit.`
      );
    }

    res.json(properties);
  } catch (err) {
    console.error("Fetch all properties error:", err);
    res.status(500).json({ error: "Server error fetching properties" });
  }
};

// Example for Get Property by ID (remains the same):
exports.getPropertyById = async (req, res) => {
  // ... (existing code) ...
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    console.error("Fetch property by ID error:", err);
    if (err.kind === "ObjectId") {
      // Handle invalid ID format
      return res.status(400).json({ error: "Invalid property ID format" });
    }
    res.status(500).json({ error: "Server error fetching property" });
  }
};

// Example for Update Property (remains the same):
exports.updateProperty = async (req, res) => {
  // ... (existing code) ...
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated doc and run validators
    );
    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(updatedProperty);
  } catch (err) {
    console.error("Update property error:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.message });
    }
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid property ID format" });
    }
    res.status(500).json({ error: "Server error updating property" });
  }
};

// Example for Delete Property (remains the same):
exports.deleteProperty = async (req, res) => {
  // ... (existing code) ...
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid property ID format" });
    }
    res.status(500).json({ error: "Server error deleting property" });
  }
};
