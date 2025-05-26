const mongoose = require("mongoose");
const { Schema } = mongoose;

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },

    // Structured address fields
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    cityTown: { type: String, required: true },
    upazila: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },

    // Coordinate storage - both formats for compatibility
    latitude: { type: Number },
    longitude: { type: Number },

    // Position object for frontend map compatibility
    position: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Location accuracy flag
    locationAccuracy: {
      type: String,
      enum: ["precise", "approximate", "district-level", "unknown"],
      default: "unknown",
    },

    // Original geocoded address (for troubleshooting)
    geocodedAddress: { type: String },

    // Property Type & Listing Type
    propertyType: {
      type: String,
      required: true,
      enum: ["apartment", "house", "condo", "land", "commercial"],
    },
    listingType: {
      type: String,
      enum: ["rent", "buy", "sold"],
      default: "rent",
      required: true,
    },

    listingStatus: {
      type: String,
      enum: ["available", "rented", "sold", "unavailable"], // Added "unavailable" for general cases
      default: "available",
      required: true,
      index: true, // Add index if you plan to query by this field often
    },

    // Basic Details
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number },

    // Features (Standard) - Nested object
    features: {
      parking: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      furnished: { type: String, enum: ["no", "semi", "full"], default: "no" },
      pool: { type: Boolean, default: false },
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
      gasLineInstalled: { type: String, enum: ["yes", "no", "na"] },
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
      securityFeatures: [{ type: String, enum: ["gated", "guards", "cctv"] }],
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
      propertyTenure: {
        type: String,
        enum: ["freehold", "leasehold", "unknown"],
        default: "unknown",
      },
      recentRenovations: { type: String },
      nearbyDevelopments: { type: String },
      reasonForSelling: { type: String },
    },

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    featuredAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Description & Images
    description: { type: String },
    images: {
      type: [String], // Array of S3 image URLs
      default: [],
    },

    // Ownership & Timestamps
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile", // This links it to your UserProfile model
      required: true,
      index: true, // Good for performance if you query properties by user
    }, // Keep as String (stores user email)
    // Consider adding ref to User model if you have one:
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Add custom instance methods for location handling
propertySchema.methods = {
  // Method to return a formatted address string
  getFormattedAddress: function () {
    const addressParts = [
      this.addressLine1,
      this.addressLine2,
      this.upazila,
      this.cityTown,
      this.district,
      this.postalCode,
    ].filter(Boolean);

    return addressParts.length > 0
      ? addressParts.join(", ")
      : "Location details not available";
  },

  // Method to check if position data is valid
  hasValidPosition: function () {
    return (
      this.position &&
      typeof this.position.lat === "number" &&
      typeof this.position.lng === "number"
    );
  },
};

// Add hooks for automatic position field synchronization
propertySchema.pre("save", function (next) {
  // If latitude and longitude are set, but position is not
  if (this.isModified("latitude") || this.isModified("longitude")) {
    if (this.latitude !== undefined && this.longitude !== undefined) {
      if (!this.position) this.position = {};
      this.position.lat = this.latitude;
      this.position.lng = this.longitude;
    }
  }

  // If position is set, but latitude and longitude are not
  if (this.isModified("position.lat") || this.isModified("position.lng")) {
    if (
      this.position &&
      typeof this.position.lat === "number" &&
      typeof this.position.lng === "number"
    ) {
      this.latitude = this.position.lat;
      this.longitude = this.position.lng;
    }
  }

  next();
});

// Add index for faster geospatial queries
propertySchema.index({ latitude: 1, longitude: 1 });

// Add index on fields commonly used for searching/filtering
propertySchema.index({
  district: 1,
  upazila: 1,
  propertyType: 1,
  listingType: 1,
  listingStatus: 1,
  price: 1,
});

module.exports =
  mongoose.models.Property || mongoose.model("Property", propertySchema);
