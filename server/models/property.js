const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },

    // Location: Replace 'location' string with structured address
    // location: { type: String, required: true }, // Remove this or redefine
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    cityTown: { type: String, required: true },
    upazila: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    // Consider adding Division if needed: division: { type: String },
    // Optional: Geolocation coordinates
    // geo: {
    //   type: { type: String, enum: ['Point'], default: 'Point' },
    //   coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    // },

    // Property Type & Listing Type (mode)
    propertyType: {
      type: String,
      required: true,
      enum: ["apartment", "house", "condo", "land", "commercial"], // Add new types
      // default: "apartment", // Already handled in frontend initial state
    },
    listingType: {
      // Renamed 'mode' for clarity? Or keep 'mode'. Let's keep 'mode' as per original
      type: String,
      enum: ["rent", "buy", "sold"], // Keep existing or adjust
      default: "rent",
      required: true, // Make required
    },

    // Basic Details
    bedrooms: { type: Number, default: 0 }, // Keep default or adjust
    bathrooms: { type: Number, default: 0 }, // Keep default or adjust
    area: { type: Number /* , required: false */ }, // Make optional - remove required or set required: false

    // Features (Standard) - Nested object
    features: {
      parking: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      // furnished: { type: Boolean, default: false }, // Changed to String enum
      furnished: { type: String, enum: ["no", "semi", "full"], default: "no" },
      pool: { type: Boolean, default: false },
      // Add others if needed: lift, servantRoom, etc.
    },

    // Bangladesh Specific Details - Nested object
    bangladeshDetails: {
      propertyCondition: {
        type: String,
        enum: ["new", "under_construction", "resale"],
      },
      proximityToMainRoad: { type: String },
      publicTransport: { type: String },
      floodProne: { type: String, enum: ["yes", "no", "sometimes"] },
      waterSource: {
        type: String,
        enum: ["wasa", "deep_tube_well", "both", "other"],
      },
      gasSource: { type: String, enum: ["piped", "cylinder", "none"] },
      gasLineInstalled: { type: String, enum: ["yes", "no", "na"] }, // 'na' = not applicable
      backupPower: {
        type: String,
        enum: ["ips", "generator", "solar", "none"],
      },
      sewerSystem: {
        type: String,
        enum: ["covered", "open", "septic_tank", "none"],
      },
      nearbySchools: { type: String },
      nearbyHospitals: { type: String },
      nearbyMarkets: { type: String },
      nearbyReligiousPlaces: { type: String },
      nearbyOthers: { type: String },
      securityFeatures: [{ type: String, enum: ["gated", "guards", "cctv"] }], // Array of strings
      earthquakeResistance: { type: String, enum: ["yes", "no", "unknown"] },
      roadWidth: { type: String },
      parkingType: {
        type: String,
        enum: ["dedicated", "street", "garage", "none"],
      },
      floorNumber: { type: Number },
      totalFloors: { type: Number },
      balcony: { type: String, enum: ["yes", "no"] },
      rooftopAccess: { type: String, enum: ["yes", "no"] },
      naturalLight: { type: String },
      ownershipPapers: {
        type: String,
        enum: ["clear", "pending", "issue", "unknown"],
      },
      propertyTenure: { type: String, enum: ["freehold", "leasehold"] },
      recentRenovations: { type: String },
      nearbyDevelopments: { type: String },
      reasonForSelling: { type: String },
    },

    isHidden: {
      type: Boolean,
      default: false, // Listings are visible by default
      index: true, // Add index for faster filtering if needed later
    },

    // Description & Images
    description: { type: String },
    images: [{ type: String }], // Store image URLs or keys

    // Ownership & Timestamps
    createdBy: { type: String, required: true }, // Keep as String (stores user email)
    // Consider adding ref to User model if you have one:
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Add index for faster geospatial queries if using geo field
// propertySchema.index({ geo: '2dsphere' });

// Add index on fields commonly used for searching/filtering
propertySchema.index({
  district: 1,
  upazila: 1,
  propertyType: 1,
  listingType: 1,
  price: 1,
});

module.exports =
  mongoose.models.Property || mongoose.model("Property", propertySchema);
