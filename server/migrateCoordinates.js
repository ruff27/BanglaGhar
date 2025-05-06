// migration-fix-coordinates.js
const mongoose = require("mongoose");
const Property = require("./models/property");
const axios = require("axios");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB for migration"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

async function geocodeAddress(property) {
  const addressComponents = [];
  if (property.addressLine1) addressComponents.push(property.addressLine1);
  if (property.addressLine2) addressComponents.push(property.addressLine2);
  if (property.upazila) addressComponents.push(property.upazila);
  if (property.cityTown) addressComponents.push(property.cityTown);
  if (property.district) addressComponents.push(property.district);
  if (property.postalCode) addressComponents.push(property.postalCode);
  addressComponents.push("Bangladesh");
  
  const fullAddress = addressComponents.join(", ");
  console.log(`Geocoding: ${property._id} - ${fullAddress}`);
  
  try {
    const geoRes = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: fullAddress,
          key: OPENCAGE_API_KEY,
          countrycode: "bd",
          limit: 1,
          no_annotations: 0,
          abbrv: 1
        }
      }
    );
    
    if (geoRes.data.results && geoRes.data.results.length > 0) {
      const location = geoRes.data.results[0].geometry;
      
      // Update the property
      await Property.findByIdAndUpdate(property._id, {
        latitude: location.lat,
        longitude: location.lng,
        position: {
          lat: location.lat,
          lng: location.lng
        }
      });
      
      console.log(`Updated coordinates for ${property._id}: ${location.lat}, ${location.lng}`);
      return true;
    } else {
      console.warn(`No geocoding results for ${property._id}: ${fullAddress}`);
      return false;
    }
  } catch (error) {
    console.error(`Geocoding error for ${property._id}:`, error.message);
    return false;
  }
}

async function migrateCoordinates() {
  try {
    // Find properties with missing or invalid coordinates
    const properties = await Property.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { position: { $exists: false } },
        { position: null },
        { "position.lat": { $exists: false } },
        { "position.lng": { $exists: false } }
      ]
    });
    
    console.log(`Found ${properties.length} properties to update`);
    
    // Geocode in batches to avoid rate limits
    let successCount = 0;
    for (let i = 0; i < properties.length; i++) {
      // Add delay to respect API rate limits
      if (i > 0 && i % 5 === 0) {
        console.log(`Pausing for API rate limits after ${i} requests...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const success = await geocodeAddress(properties[i]);
      if (success) successCount++;
    }
    
    console.log(`Migration completed. Updated ${successCount} out of ${properties.length} properties.`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    mongoose.connection.close();
  }
}

migrateCoordinates();