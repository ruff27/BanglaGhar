// server/controllers/propertyController.js
const Property = require("../models/property");
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
  // --- ADDED DEBUG LOG ---
  console.log("--- getAllProperties: Received req.query:", req.query);
  // -------------------------

  try {
    // Check for query parameters
    const isRandom = req.query.random === "true";
    const isFeatured = req.query.featured === "true"; // <<<--- Check for featured
    const defaultLimit = isRandom ? 30 : isFeatured ? 25 : 0;
    const limit = parseInt(req.query.limit) || defaultLimit;
    const baseFilter = { isHidden: { $ne: true } };
    let properties;
    let query;

    if (isRandom && limit > 0) {
      // Random logic
      properties = await Property.aggregate([
        { $match: baseFilter },
        { $sample: { size: limit } },
      ]);
      console.log(
        `Fetched ${properties.length} random, visible properties (limit: ${limit})`
      );
    } else if (isFeatured) {
      // <<<--- Logic for featured
      console.log(`Fetching featured listings (limit: ${limit})`);
      query = Property.find({ ...baseFilter, featuredAt: { $ne: null } }).sort({
        featuredAt: -1,
      });
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(`Fetched ${properties.length} featured properties.`);
    } else {
      // Standard logic
      const queryFilters = { ...baseFilter };
      if (req.query.listingType)
        queryFilters.listingType = req.query.listingType;
      query = Property.find(queryFilters).sort({ createdAt: -1 });
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(
        `Fetched ${properties.length} visible properties with filters/limit.`
      );
    }
    res.json(properties);
  } catch (err) {
    console.error("Fetch all properties error:", err);
    res.status(500).json({ error: "Server error fetching properties" });
  }
};

// --- MODIFIED Get Property by ID (for public) ---
exports.getPropertyById = async (req, res) => {
  try {
    // --- Use findOne with isHidden check ---
    const property = await Property.findOne({
      _id: req.params.id,
      isHidden: { $ne: true }, // <<<--- ADDED: Ensure property is not hidden
    });
    // ---------------------------------------

    if (!property) {
      // Return 404 whether it doesn't exist OR it's hidden
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    console.error("Fetch property by ID error:", err);
    if (err.kind === "ObjectId") {
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
