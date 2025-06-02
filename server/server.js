const path = require("path");

// 1) load exactly the .env you intend
require("dotenv").config({
  path: path.resolve(__dirname, "./.env"), // Updated to point to root directory
});

const aiRoutes = require("./routes/aiRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");

// 2) imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 3) API Routes
app.use("/api", aiRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users/:username/wishlist", wishlistRoutes);
app.use("/api/user-profiles", userProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// 4) Connect to DB
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

// 5) MODELS (Ensure UserProfile is defined in its file)
const Property = require("./models/property");
const Wishlist = require("./models/Wishlist");
const UserProfile = require("./models/UserProfile");

// 6) TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello from the backend server! MongoDB connection is active.");
});

// // 7) Start Server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });  🎉  This has been commented out for deployment on Netlify 🎉

module.exports = { app };
