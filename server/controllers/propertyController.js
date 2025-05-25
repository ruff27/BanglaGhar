// server/controllers/propertyController.js
const Property = require("../models/property");
const mongoose = require("mongoose"); // Ensure mongoose is required if not already

// Example for Create Property (remains the same):
exports.createProperty = async (req, res) => {
  // Ensure user is authenticated and req.user exists
  if (!req.userProfile || !req.userProfile._id) {
    return res
      .status(401)
      .json({ message: "Authentication required to create listing." });
  }

  try {
    const newProperty = new Property({
      ...req.body, // Spread the data from the frontend form
      createdBy: req.userProfile._id, // <<< Set createdBy from authenticated user's email
      // Make sure other required fields (title, price, etc.) are present in req.body
    });
    await newProperty.save();
    const populatedProperty = await Property.findById(newProperty._id).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl"
    );
    res.status(201).json(populatedProperty || newProperty);
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

    const userFieldsToPopulate =
      "_id displayName email cognitoSub profilePictureUrl";

    if (isRandom && limit > 0) {
      properties = await Property.aggregate([
        { $match: baseFilter },
        { $sample: { size: limit } },
      ]);
      // Note: .populate() doesn't work directly with .aggregate().
      // For random properties, if you need createdBy populated, you'd do a separate lookup
      // or adjust the aggregation pipeline, which is more complex.
      // For simplicity, if populated createdBy is critical here, consider fetching IDs then populating.
      // Or, fetch more than needed and then populate + limit in JS (less efficient).
      // For now, this branch will return unpopulated createdBy for random items.
      // If you need them populated, this section would need a more significant rewrite.
      // One common way:
      // const randomProperties = await Property.aggregate([...]);
      // const propertyIds = randomProperties.map(p => p._id);
      // properties = await Property.find({ '_id': { $in: propertyIds } }).populate('createdBy', userFieldsToPopulate);

      console.log(
        `Workspaceed ${properties.length} random, visible properties (limit: ${limit})`
      );
    } else if (isFeatured) {
      console.log(`Workspaceing featured listings (limit: ${limit})`); //
      query = Property.find({ ...baseFilter, featuredAt: { $ne: null } })
        .populate("createdBy", userFieldsToPopulate) // Added populate
        .sort({ featuredAt: -1 }); //
      if (limit > 0) {
        //
        query.limit(limit); //
      }
      properties = await query.exec(); //
      console.log(`Workspaceed ${properties.length} featured properties.`); //
    } else {
      const queryFilters = { ...baseFilter }; //
      if (req.query.listingType)
        //
        queryFilters.listingType = req.query.listingType; //
      query = Property.find(queryFilters)
        .populate("createdBy", userFieldsToPopulate) // Added populate
        .sort({ createdAt: -1 }); //
      if (limit > 0) {
        //
        query.limit(limit); //
      }
      properties = await query.exec(); //
      console.log(
        `Workspaceed ${properties.length} visible properties with filters/limit.`
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
      isHidden: { $ne: true }, //
    }).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl"
    );
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
      { new: true, runValidators: true }
    ).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl"
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
