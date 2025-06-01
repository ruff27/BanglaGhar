const Property = require("../models/property.js");
const mongoose = require("mongoose");
const axios = require("axios");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");


const propertyImagesS3Client = new S3Client({
  region: process.env.APP_AWS_REGION, // Assuming region is the same for both buckets
  credentials: {
    accessKeyId: process.env.PROPERTY_IMAGES_ACCESS_KEY,
    secretAccessKey: process.env.PROPERTY_IMAGES_SECRET_KEY,
  },
});
const S3_PROPERTY_IMAGES_BUCKET = process.env.APP_S3_BUCKET_PROPERTY_IMAGES;
const S3_PROPERTY_IMAGES_FOLDER = "property-images/";

const isValidBangladeshLocation = (lat, lng) => {
  // Rough bounding box for Bangladesh
  const BD_BOUNDS = {
    minLat: 20.5,
    maxLat: 26.7,
    minLng: 88.0,
    maxLng: 92.7,
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
    Dhaka: { lat: 23.8103, lng: 90.4125 },
    Gazipur: { lat: 24.0958, lng: 90.4125 },
    Narayanganj: { lat: 23.6238, lng: 90.5 },

    // Chittagong Division
    Chattogram: { lat: 22.3569, lng: 91.7832 },
    "Cox's Bazar": { lat: 21.4272, lng: 92.0101 },

    // Sylhet Division
    Sylhet: { lat: 24.8949, lng: 91.8687 },
    Moulvibazar: { lat: 24.4843, lng: 91.7774 },

    // Rajshahi Division
    Rajshahi: { lat: 24.3745, lng: 88.6042 },
    Bogura: { lat: 24.8465, lng: 89.3729 },

    // Khulna Division
    Khulna: { lat: 22.8456, lng: 89.5403 },
    Jessore: { lat: 23.1681, lng: 89.2134 },

    // Barisal Division
    Barisal: { lat: 22.701, lng: 90.3535 },

    // Rangpur Division
    Rangpur: { lat: 25.7439, lng: 89.2752 },
  };

  const normalizedDistrict = district.toLowerCase().trim();

  for (const [key, value] of Object.entries(districtMap)) {
    if (key.toLowerCase() === normalizedDistrict) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(districtMap)) {
    if (
      normalizedDistrict.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedDistrict)
    ) {
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
    postalCode,
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
    const geoRes = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: fullAddress,
          key: process.env.OPENCAGE_API_KEY,
          countrycode: "bd",
          limit: 1,
          no_annotations: 0,
          abbrv: 1,
        },
      }
    );

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
        console.warn(
          `Geocoding returned coordinates outside Bangladesh: ${location.lat}, ${location.lng}`
        );

        // Use district-based fallback coordinates
        const districtCoordinates = getDistrictCoordinates(
          addressData.district
        );
        if (districtCoordinates) {
          location.lat = districtCoordinates.lat;
          location.lng = districtCoordinates.lng;
          locationAccuracy = "district-level";
          console.log(
            `Using fallback coordinates for ${addressData.district}: ${location.lat}, ${location.lng}`
          );
        }
      }

      return {
        latitude: location.lat,
        longitude: location.lng,
        position: {
          lat: location.lat,
          lng: location.lng,
        },
        locationAccuracy,
        geocodedAddress: fullAddress,
        formatted: result.formatted || fullAddress,
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
            lng: districtCoordinates.lng,
          },
          locationAccuracy: "district-level",
          geocodedAddress: fullAddress,
          formatted: fullAddress,
        };
      }

      return null;
    }
  } catch (error) {
    console.error("Error during geocoding:", error.message);
    return null;
  }
};

exports.createProperty = async (req, res) => {
  if (!req.userProfile || !req.userProfile._id) {
    return res
      .status(401)
      .json({ message: "Authentication required to create listing." });
  }

  try {
    const addressData = {
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      cityTown: req.body.cityTown,
      upazila: req.body.upazila,
      district: req.body.district,
      postalCode: req.body.postalCode,
    };

    const geocodeResult = await geocodeAddress(addressData); //

    let propertyData = {
      ...req.body,
      createdBy: req.userProfile._id, //
      listingStatus: req.body.listingStatus || "available", //
      images: req.body.images || [], //
    };

    if (geocodeResult) {
      propertyData = {
        ...propertyData,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        position: geocodeResult.position, //
        locationAccuracy: geocodeResult.locationAccuracy, //
        geocodedAddress: geocodeResult.geocodedAddress,
      };
      console.log(
        `Geocoded address to: ${geocodeResult.latitude}, ${geocodeResult.longitude} (accuracy: ${geocodeResult.locationAccuracy})`
      );
    } else {
      console.warn(
        `Geocoding failed completely for address. Using district fallback or general default.`
      );
      const districtCoordinates = getDistrictCoordinates(addressData.district); //
      if (districtCoordinates) {
        propertyData.latitude = districtCoordinates.lat;
        propertyData.longitude = districtCoordinates.lng;
        propertyData.position = {
          lat: districtCoordinates.lat,
          lng: districtCoordinates.lng,
        };
        propertyData.locationAccuracy = "district-level"; //
      } else {
        const defaultMapCenter = { lat: 23.8103, lng: 90.4125 }; // Dhaka
        propertyData.latitude = defaultMapCenter.lat;
        propertyData.longitude = defaultMapCenter.lng;
        propertyData.position = {
          lat: defaultMapCenter.lat,
          lng: defaultMapCenter.lng,
        };
        propertyData.locationAccuracy = "unknown"; //
      }
    }

    const newProperty = new Property(propertyData);
    await newProperty.save(); // This will also trigger the pre('save') hook in property.js
    const populatedProperty = await Property.findById(newProperty._id).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl"
    );
    res.status(201).json(populatedProperty || newProperty);
  } catch (err) {
    console.error("Create property error:", err);
    if (err.name === "ValidationError") {
      let errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res
        .status(400)
        .json({ message: "Validation Error", errors: errors });
    }
    res.status(500).json({ error: "Server error creating property" });
  }
};

exports.getAllProperties = async (req, res) => {
  console.log("--- getAllProperties: Received req.query:", req.query);

  try {
    const isRandom = req.query.random === "true";
    const isFeatured = req.query.featured === "true";
    const defaultLimit = isRandom ? 30 : isFeatured ? 25 : 0;
    const limit = parseInt(req.query.limit) || defaultLimit;

    const baseFilter = {
      isHidden: { $ne: true },
    };

    if (req.query.includeUnavailable !== "true") {
      baseFilter.listingStatus = "available";
    }

    let properties;
    let query;

    const userFieldsToPopulate =
      "_id displayName email cognitoSub profilePictureUrl"; // Ensure displayName

    if (isRandom && limit > 0) {
      properties = await Property.aggregate([
        { $match: baseFilter },
        { $sample: { size: limit } },
      ]);
      const propertyIds = properties.map((p) => p._id);
      properties = await Property.find({ _id: { $in: propertyIds } }).populate(
        "createdBy",
        userFieldsToPopulate
      );

      console.log(
        `Workspaceed ${properties.length} random, visible properties (limit: ${limit}) with status filter`
      );
    } else if (isFeatured) {
      console.log(`Workspaceing featured listings (limit: ${limit})`);
      query = Property.find({ ...baseFilter, featuredAt: { $ne: null } })
        .populate("createdBy", userFieldsToPopulate)
        .sort({ featuredAt: -1 });
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(
        `Workspaceed ${properties.length} featured properties with status filter.`
      );
    } else {
      const queryFilters = { ...baseFilter };
      if (req.query.listingType)
        queryFilters.listingType = req.query.listingType;

      if (req.query.listingStatus) {
        queryFilters.listingStatus = req.query.listingStatus;
      }

      if (req.query.nearLat && req.query.nearLng && req.query.radius) {
        const lat = parseFloat(req.query.nearLat);
        const lng = parseFloat(req.query.nearLng);
        const radius = parseInt(req.query.radius, 10) / 111.12;

        queryFilters.$and = queryFilters.$and || []; // Initialize $and if not present
        queryFilters.$and.push(
          { latitude: { $gte: lat - radius, $lte: lat + radius } },
          { longitude: { $gte: lng - radius, $lte: lng + radius } }
        );
      }

      query = Property.find(queryFilters)
        .populate("createdBy", userFieldsToPopulate)
        .sort({ createdAt: -1 });
      if (limit > 0) {
        query.limit(limit);
      }
      properties = await query.exec();
      console.log(
        `Workspaceed ${properties.length} visible properties with filters/limit and status filter.`
      );
    }

    const processedProperties = properties.map((prop) => {
      const property = prop.toObject ? prop.toObject() : prop;
      if (!property.position && property.latitude && property.longitude) {
        property.position = {
          lat: property.latitude,
          lng: property.longitude,
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
    // For now, let's assume fetching by direct ID should show it, regardless of status, but still respect 'isHidden'.
    const property = await Property.findOne({
      _id: req.params.id,
      isHidden: { $ne: true },
    }).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl" // Ensure displayName
    );

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const propertyObj = property.toObject();
    if (
      !propertyObj.position &&
      propertyObj.latitude &&
      propertyObj.longitude
    ) {
      propertyObj.position = {
        lat: propertyObj.latitude,
        lng: propertyObj.longitude,
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
    const propertyId = req.params.id;
    const existingProperty = await Property.findById(propertyId);

    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (
      existingProperty.createdBy.toString() !==
        req.userProfile._id.toString() &&
      !req.userProfile.isAdmin
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this property." });
    }

    const addressFields = [
      "addressLine1",
      "addressLine2",
      "cityTown",
      "upazila",
      "district",
      "postalCode",
    ];
    const addressFieldsUpdated = addressFields.some(
      (field) => field in req.body
    ); //

    let updatedFields = { ...req.body };

    if (addressFieldsUpdated) {
      const addressDataForUpdate = {
        addressLine1: req.body.addressLine1 || existingProperty.addressLine1, //
        addressLine2: req.body.addressLine2 || existingProperty.addressLine2, //
        cityTown: req.body.cityTown || existingProperty.cityTown, //
        upazila: req.body.upazila || existingProperty.upazila, //
        district: req.body.district || existingProperty.district, //
        postalCode: req.body.postalCode || existingProperty.postalCode, //
      };

      console.log(
        "Address fields updated. Re-geocoding with:",
        addressDataForUpdate
      );
      try {
        const geocodeResult = await geocodeAddress(addressDataForUpdate); //
        if (geocodeResult) {
          updatedFields.latitude = geocodeResult.latitude;
          updatedFields.longitude = geocodeResult.longitude;
          updatedFields.position = geocodeResult.position;
          updatedFields.locationAccuracy = geocodeResult.locationAccuracy;
          updatedFields.geocodedAddress = geocodeResult.geocodedAddress; //
          console.log(
            `Geocoded updated address to: ${geocodeResult.latitude}, ${geocodeResult.longitude} (accuracy: ${geocodeResult.locationAccuracy})`
          );
        } else {
          console.warn(
            `Geocoding failed for updated address. Coordinates might not be updated or will use fallback.`
          );
        }
      } catch (geocodeError) {
        console.error(
          "Error during geocoding for update:",
          geocodeError.message
        );
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).populate(
      "createdBy",
      "_id displayName email cognitoSub profilePictureUrl"
    );

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ error: "Property not found during update attempt." });
    }

    res.json(updatedProperty);
  } catch (err) {
    console.error("Update property error:", err);
    if (err.name === "ValidationError") {
      let errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res
        .status(400)
        .json({ message: "Validation Error", errors: errors });
    }
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid property ID format" });
    }
    res.status(500).json({ error: "Server error updating property" });
  }
};

// Delete Property (remains largely the same, but ensure authorization)
exports.deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const propertyToDelete = await Property.findById(propertyId);

    if (!propertyToDelete) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Authorization check
    if (
      propertyToDelete.createdBy.toString() !==
        req.userProfile._id.toString() &&
      !req.userProfile.isAdmin
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this property." });
    }

    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      
      return res
        .status(404)
        .json({ error: "Property not found, may have been deleted already." });
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

// ... (updatePropertyCoordinates function remains the same, but add authorization if needed)
exports.updatePropertyCoordinates = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res
        .status(400)
        .json({ error: "Latitude and longitude must be numbers" });
    }

    // Check if coordinates are within Bangladesh
    if (!isValidBangladeshLocation(latitude, longitude)) {
      return res.status(400).json({
        error: "Coordinates are outside Bangladesh",
        details: "Please provide coordinates within Bangladesh territory",
      });
    }

    // Authorization check (optional, depends on who can manually update coordinates)
    const propertyToUpdate = await Property.findById(id);
    if (!propertyToUpdate) {
      return res.status(404).json({ error: "Property not found" });
    }
    // Example: Only owner or admin can update coordinates
    if (
      propertyToUpdate.createdBy.toString() !==
        req.userProfile._id.toString() &&
      !req.userProfile.isAdmin
    ) {
      return res.status(403).json({
        error:
          "You are not authorized to update coordinates for this property.",
      });
    }

    // Update the property with new coordinates
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        latitude,
        longitude,
        position: { lat: latitude, lng: longitude },
        locationAccuracy: "precise", 
        manuallyUpdated: true, 
      },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ error: "Property not found after update attempt." });
    }

    res.json({
      message: "Property coordinates updated successfully",
      property: updatedProperty,
    });
  } catch (err) {
    console.error("Update property coordinates error:", err);
    res
      .status(500)
      .json({ error: "Server error updating property coordinates" });
  }
};

// s3 property images upload
exports.uploadPropertyImageToS3 = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded." });
  }
  if (!S3_PROPERTY_IMAGES_BUCKET || !process.env.APP_AWS_REGION) {
    console.error("S3 Property Images Bucket or Region not configured.");
    return res
      .status(500)
      .json({ message: "Server configuration error for file upload." });
  }

  const file = req.file;
  const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${S3_PROPERTY_IMAGES_FOLDER}${uuidv4()}-${originalName}`;

  try {
    const uploadParams = {
      Bucket: S3_PROPERTY_IMAGES_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", 
      
    };

    
    await propertyImagesS3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${S3_PROPERTY_IMAGES_BUCKET}.s3.${process.env.APP_AWS_REGION}.amazonaws.com/${fileName}`;
    res
      .status(200)
      .json({ message: "Image uploaded successfully", imageUrl: imageUrl });
  } catch (error) {
    console.error("Error uploading property image to S3:", error);
    
    if (error.name === "CredentialsError" || error.name === "AccessDenied") {
      console.error(
        "AWS Credentials or Permissions issue for Property Images S3 Client."
      );
    }
    res.status(500).json({ message: "Failed to upload image." });
  }
};

 

exports.batchGeocodeProperties = async (req, res) => {
  
  if (!req.userProfile || !req.userProfile.isAdmin) {
    
    return res
      .status(403)
      .json({ error: "Admin privileges required for batch geocoding." });
  }

  try {
    const { limit = 10 } = req.query; // Default limit to 10
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        error: "Invalid limit parameter. Must be a positive integer.",
      });
    }

    
    const properties = await Property.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { position: { $exists: false } },
        { locationAccuracy: "unknown" }, 
      ],
      
    }).limit(parsedLimit); 

    console.log(
      `Found ${properties.length} properties to geocode (limit: ${parsedLimit})`
    );

    if (properties.length === 0) {
      return res.json({
        message: "No properties currently need geocoding based on criteria.",
      });
    }

    const results = {
      totalToProcess: properties.length,
      successfulGeocodes: 0,
      failedGeocodes: 0,
      details: [],
    };

    for (const property of properties) {
      const addressData = {
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        cityTown: property.cityTown,
        upazila: property.upazila,
        district: property.district,
        postalCode: property.postalCode,
      };

      try {
        
        await new Promise((resolve) => setTimeout(resolve, 1100)); 
        const geocodeResult = await geocodeAddress(addressData);

        if (geocodeResult) {
          
          await Property.findByIdAndUpdate(property._id, {
            ...geocodeResult,
            
          });

          results.successfulGeocodes++;
          results.details.push({
            propertyId: property._id.toString(),
            status: "success",
            coordinates: `${geocodeResult.latitude}, ${geocodeResult.longitude}`,
            accuracy: geocodeResult.locationAccuracy,
            formattedAddress: geocodeResult.formatted,
          });
        } else {
          results.failedGeocodes++;
          results.details.push({
            propertyId: property._id.toString(),
            status: "failed",
            reason:
              "Geocoding returned no results for the constructed address.",
            addressAttempted: constructGeocodingAddress(addressData),
          });
          
        }
      } catch (error) {
        results.failedGeocodes++;
        results.details.push({
          propertyId: property._id.toString(),
          status: "error",
          reason: error.message,
          addressAttempted: constructGeocodingAddress(addressData),
        });
      }
    }

    res.json({
      message: `Batch geocoding completed. Success: ${results.successfulGeocodes}, Failed: ${results.failedGeocodes} out of ${results.totalToProcess}.`,
      results,
    });
  } catch (err) {
    console.error("Batch geocode error:", err);
    res.status(500).json({ error: "Server error during batch geocoding." });
  }
};
