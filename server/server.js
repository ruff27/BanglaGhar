// server/server.js
const path = require("path");

// 1) load exactly the .env you intend
require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});

const aiRoutes = require("./routes/aiRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// 2) imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", aiRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users/:username/wishlist", wishlistRoutes); // Wishlist endpoints (uses :username from URL)

// 3) connect
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("No Mongo URI found in ENV! Check your .env name.");
  process.exit(1);
}

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:", err);
  });

// 4) MODELS
// Removed the User model since Cognito now handles authentication
const Property = require("./models/Property");
// New Wishlist model for handling user-specific wishlist data
const Wishlist = require("./models/Wishlist");

// 5) TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello from the backend server! MongoDB connection is active.");
});

// 6) AUTH ROUTES
// Removed the signup and login routes since the project now uses Cognito

// 9) START THE SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
