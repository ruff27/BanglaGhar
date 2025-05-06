// server/controllers/propertyController.js
const Property = require("../models/property");
const mongoose = require("mongoose");
const axios = require("axios");

// Helper function to check if coordinates are within Bangladesh
const isValidBangladeshLocation = (lat, lng) => {
  // Rough bounding box for Bangladesh
  const BD_BOUNDS = {
    minLat: 20.5,
    maxLat: 26.7,
    minLng: 88.0,
    maxLng: 92.7
  };
  
  return (
    lat >= BD_BOUNDS.minLat &&
    lat <= BD_BOUNDS.maxLat &&
    lng >= BD_BOUNDS.minLng &&
    lng <= BD_BOUNDS.maxLng
  );
};

// Helper function to get fallback coordinates for districts
const getDistrictCoordinates = (district) => {
  const districtMap = {
    // Central districts
    "Dhaka": { lat: 23.8103, lng: 90.4125 },
    "Gazipur": { lat: 24.0958, lng: 90.4125 },
    "Narayanganj": { lat: 23.6238, lng: 90.5000 },
    
    // Chittagong Division
    "Chattogram": { lat: 22.3569, lng: 91.7832 },
    "Cox's Bazar": { lat: 21.4272, lng: 92.0101 },
    
    // Sylhet Division
    "Sylhet": { lat: 24.8949, lng: 91.8687 },
    "Moulvibazar": { lat: 24.4843, lng: 91.7774 },
    
    // Rajshahi Division
    "Rajshahi": { lat: 24.3745, lng: 88.6042 },
    "Bogura": { lat: 24.8465, lng: 89.3729 },
    
    // Khulna Division
    "Khulna": { lat: 22.8456, lng: 89.5403 },
    "Jessore": { lat: 23.1681, lng: 89.2134 },
    
    // Barisal Division
    "Barisal": { lat: 22.7010, lng: 90.3535 },
    
    // Rangpur Division
    "Rangpur": { lat: 25.7439, lng: 89.2752 }
  };
  
  // Normalize district name for lookup (lowercase and remove extra spaces)
  const normalizedDistrict = district.toLowerCase().trim();
  
  // Try to find an exact match
  for (const [key, value] of Object.entries(districtMap)) {
    if (key.toLowerCase() === normalizedDistrict) {
      return value;
    }
  }
  
  // If no exact match, try partial match
  for (const [key, value] of Object.entries(districtMap)) {
    if (normalizedDistrict.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedDistrict)) {
      return value;
    }
  }
  
  // Default to Dhaka if no match found
  return districtMap["Dhaka"];
};

// Helper to construct a well-formatted address for geocoding
const constructGeocodingAddress = (addressData) => {
  const {
    addressLine1,
    addressLine2,
    upazila,
    cityTown,
    district,
    postalCode
  } = addressData;
  
  // Create a properly structured address for optimal geocoding results
  let addressComponents = [];
  if (addressLine1) addressComponents.push(addressLine1);
  if (addressLine2) addressComponents.push(addressLine2);
  if (upazila) addressComponents.push(upazila);
  if (cityTown) addressComponents.push(cityTown);
  if (district) addressComponents.push(district);
  if (postalCode) addressComponents.push(postalCode);
  addressComponents.push("Bangladesh");
  
  return addressComponents.join(", ");
};

// Function to geocode an address using OpenCage API
const geocodeAddress = async (addressData) => {
  const fullAddress = constructGeocodingAddress(addressData);
  console.log("Geocoding address:", fullAddress);
  
  try {
    const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
      params: {
        q: fullAddress,
        key: process.env.OPENCAGE_API_KEY,
        countrycode: "bd",
        limit: 1,
        no_annotations: 0,
        abbrv: 1
      }
    });
    
    if (geoRes.data.results && geoRes.data.results.length > 0) {
      const result = geoRes.data.results[0];
      const location = result.geometry;
      
      // Determine location accuracy
      let locationAccuracy = "approximate";
      
      // OpenCage provides a confidence score (0-10)
      if (result.confidence >= 8) {
        locationAccuracy = "precise";
      } else if (result.confidence >= 5) {
        locationAccuracy = "approximate";
      } else {
        locationAccuracy = "district-level";
      }
      
      // Check if coordinates are within Bangladesh
      if (!isValidBangladeshLocation(location.lat, location.lng)) {
        console.warn(`Geocoding returned coordinates outside Bangladesh: ${location.lat}, ${location.lng}`);
        
        // Use district-based fallback coordinates
        const districtCoordinates = getDistrictCoordinates(addressData.district);
        if (districtCoordinates) {
          location.lat = districtCoordinates.lat;
          location.lng = districtCoordinates.lng;
          locationAccuracy = "district-level";
          console.log(`Using fallback coordinates for ${addressData.district}: ${location.lat}, ${location.lng}`);
        }
      }
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        position: {
          lat: location.lat,
          lng: location.lng
        },
        locationAccuracy,
        geocodedAddress: fullAddress,
        formatted: result.formatted || fullAddress
      };
    } else {
      console.warn(`No geocoding results for address: ${fullAddress}`);
      
      // Use district-based fallback
      const districtCoordinates = getDistrictCoordinates(addressData.district);
      if (districtCoordinates) {
        return {
          latitude: districtCoordinates.lat,
          longitude: districtCoordinates.lng,
          position: {
            lat: districtCoordinates.lat,
            lng: districtCoordinates.lng
          },
          locationAccuracy: "district-level",
          geocodedAddress: fullAddress,
          formatted: fullAddress
        };
      }
      
      return null;
    }
  } catch (error) {
    console.error("Error during geocoding:", error.message);
    return null;
  }
};

// Create Property with enhanced geocoding
exports.createProperty = async (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: "Authentication required to list property." });
  }

  try {
    // Extract address fields for geocoding
    const addressData = {
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      cityTown: req.body.cityTown,
      upazila: req.body.upazila,
      district: req.body.district,
      postalCode: req.body.postalCode
    };
    
    // Geocode the address
    const geocodeResult = await geocodeAddress(addressData);
    
    let propertyData = {
      ...req.body,
      createdBy: req.user.email
    };
    
    // Add geocoding result to property data if available
    if (geocodeResult) {
      propertyData = {
        ...propertyData,
        ...geocodeResult
      };
      console.log(`Geocoded address to: ${geocodeResult.latitude}, ${geocodeResult.longitude} (accuracy: ${geocodeResult.locationAccuracy})`);
    } else {
      console.warn(`Geocoding failed for address, using null coordinates`);
      propertyData.locationAccuracy = "unknown";
    }
    
    const newProperty = new Property(propertyData);
    await newProperty.save();
    
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ error: "Server error creating property" });
  }
};

// Get All Properties with enhanced filtering
exports.getAllProperties = async (req, res) => {
  console.log("--- getAllProperties: Received req.query:", req.query);

  try {
    // Check for query parameters
    const isRandom = req.query.random === "true";
    const isFeatured = req.query.featured === "true";
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
      // Featured properties logic
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
        
      // Add position filters if present
      if (req.query.nearLat && req.query.nearLng && req.query.radius) {
        const lat = parseFloat(req.query.nearLat);
        const lng = parseFloat(req.query.nearLng);
        const radius = parseInt(req.query.radius, 10) / 111.12; // Convert km to degrees (approx)
        
        queryFilters.$and = [
          { latitude: { $gte: lat - radius, $lte: lat + radius } },
          { longitude: { $gte: lng - radius, $lte: lng + radius } }
        ];
      }
      
      query = Property.find(queryFilters).sort({ createdAt: -1 });
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(
        `Fetched ${properties.length} visible properties with filters/limit.`
      );
    }
    
    // Process properties to ensure they have position data
    const processedProperties = properties.map(prop => {
      // If using aggregate, convert to object
      const property = prop.toObject ? prop.toObject() : prop;
      
      // Ensure property has position data for frontend
      if (!property.position && property.latitude && property.longitude) {
        property.position = {
          lat: property.latitude,
          lng: property.longitude
        };
      }
      
      return property;
    });
    
    res.json(processedProperties);
  } catch (err) {
    console.error("Fetch all properties error:", err);
    res.status(500).json({ error: "Server error fetching properties" });
  }
};

// Get Property by ID with position handling
exports.getPropertyById = async (req, res) => {
  try {
    // Use findOne with isHidden check
    const property = await Property.findOne({
      _id: req.params.id,
      isHidden: { $ne: true },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    // Convert to object to modify before sending
    const propertyObj = property.toObject();
    
    // Ensure property has position data for frontend
    if (!propertyObj.position && propertyObj.latitude && propertyObj.longitude) {
      propertyObj.position = {
        lat: propertyObj.latitude,
        lng: propertyObj.longitude
      };
    }
    
    res.json(propertyObj);
  } catch (err) {
    console.error("Fetch property by ID error:", err);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid property ID format" });
    }
    res.status(500).json({ error: "Server error fetching property" });
  }
};

// Update Property with geocoding if address changed
exports.updateProperty = async (req, res) => {
  try {
    // Check if address fields have been updated
    const addressFieldsUpdated = [
      'addressLine1',
      'addressLine2',
      'cityTown',
      'upazila',
      'district',
      'postalCode'
    ].some(field => field in req.body);

    let updatedFields = { ...req.body };
    
    // Only regeocode if address fields updated
    if (addressFieldsUpdated) {
      // Get existing property to combine with updates
      const existingProperty = await Property.findById(req.params.id);
      if (!existingProperty) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      // Combine existing data with updates for geocoding
      const addressData = {
        addressLine1: req.body.addressLine1 || existingProperty.addressLine1,
        addressLine2: req.body.addressLine2 || existingProperty.addressLine2,
        cityTown: req.body.cityTown || existingProperty.cityTown,
        upazila: req.body.upazila || existingProperty.upazila,
        district: req.body.district || existingProperty.district,
        postalCode: req.body.postalCode || existingProperty.postalCode
      };
      
      try {
        // Geocode the updated address
        const geocodeResult = await geocodeAddress(addressData);
        
        // Add geocoding result to update data if available
        if (geocodeResult) {
          updatedFields = {
            ...updatedFields,
            ...geocodeResult
          };
          console.log(`Geocoded updated address to: ${geocodeResult.latitude}, ${geocodeResult.longitude} (accuracy: ${geocodeResult.locationAccuracy})`);
        } else {
          console.warn(`Geocoding failed for updated address`);
        }
      } catch (geocodeError) {
        console.error("Error during geocoding for update:", geocodeError.message);
        // Continue with property update even if geocoding fails
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
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

// Delete Property (remains largely the same)
exports.deleteProperty = async (req, res) => {
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

// NEW: API endpoint to manually update coordinates for a property
exports.updatePropertyCoordinates = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: "Latitude and longitude must be numbers" });
    }
    
    // Check if coordinates are within Bangladesh
    if (!isValidBangladeshLocation(latitude, longitude)) {
      return res.status(400).json({ 
        error: "Coordinates are outside Bangladesh",
        details: "Please provide coordinates within Bangladesh territory"
      });
    }
    
    // Update the property with new coordinates
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        latitude,
        longitude,
        position: { lat: latitude, lng: longitude },
        locationAccuracy: "precise", // User-provided coordinates are marked as precise
        manuallyUpdated: true
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    res.json({
      message: "Property coordinates updated successfully",
      property: updatedProperty
    });
  } catch (err) {
    console.error("Update property coordinates error:", err);
    res.status(500).json({ error: "Server error updating property coordinates" });
  }
};

// NEW: Batch geocode properties
exports.batchGeocodeProperties = async (req, res) => {
  // This should be an admin-only endpoint
  if (!req.user || !req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  
  try {
    const { limit = 10 } = req.query;
    
    // Find properties with missing coordinates
    const properties = await Property.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { position: { $exists: false } }
      ]
    }).limit(parseInt(limit));
    
    console.log(`Found ${properties.length} properties to geocode`);
    
    if (properties.length === 0) {
      return res.json({ message: "No properties need geocoding" });
    }
    
    const results = {
      total: properties.length,
      success: 0,
      failed: 0,
      details: []
    };
    
    // Process each property
    for (const property of properties) {
      const addressData = {
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        cityTown: property.cityTown,
        upazila: property.upazila,
        district: property.district,
        postalCode: property.postalCode
      };
      
      try {
        // Add a delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Geocode the address
        const geocodeResult = await geocodeAddress(addressData);
        
        if (geocodeResult) {
          // Update the property
          await Property.findByIdAndUpdate(property._id, geocodeResult);
          
          results.success++;
          results.details.push({
            propertyId: property._id,
            status: 'success',
            coordinates: `${geocodeResult.latitude}, ${geocodeResult.longitude}`,
            accuracy: geocodeResult.locationAccuracy
          });
        } else {
          results.failed++;
          results.details.push({
            propertyId: property._id,
            status: 'failed',
            reason: 'Geocoding returned no results'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          propertyId: property._id,
          status: 'error',
          reason: error.message
        });
      }
    }
    
    res.json({
      message: `Batch geocoding completed. Success: ${results.success}, Failed: ${results.failed}`,
      results
    });
  } catch (err) {
    console.error("Batch geocode error:", err);
    res.status(500).json({ error: "Server error during batch geocoding" });
  }
};