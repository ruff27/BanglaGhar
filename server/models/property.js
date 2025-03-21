const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    // Updated enum to allow 'sold'
    mode: {
      type: String,
      enum: ["rent", "buy", "sold"],
      default: "rent",
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    description: { type: String },
    // We'll store only filenames or paths to local images
    images: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // not strictly required if you just want a listing
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
