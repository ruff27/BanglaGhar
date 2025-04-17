// server/controllers/propertyController.js

const Property = require("../models/Property");

exports.createProperty = async (req, res) => {
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
    res.status(201).json({
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ error: "Server error creating property" });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error fetching properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    console.error("Get property error:", err);
    // you could check err.kind==='ObjectId' here for invalid IDs
    res.status(500).json({ error: "Server error fetching property" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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
    // handle ValidationError or ObjectId errors as needed
    res.status(500).json({ error: "Server error updating property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ error: "Server error deleting property" });
  }
};
