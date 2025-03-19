// seedProperties.js

const mongoose = require("mongoose");
const Property = require("./models/Property");

// 1) Atlas connection string
const MONGO_URI =
  "mongodb+srv://103531273:forctpA2025@cluster1.wmpcxe1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

function generateSeedData() {
  const rentData = [];
  const buyData = [];
  const soldData = [];

  const images = ["house1.png", "house2.png", "house3.png"];
  const locations = ["Dhaka", "Gulshan", "Dhanmondi", "Banani", "Uttara"];

  for (let i = 1; i <= 20; i++) {
    // RENT
    rentData.push({
      title: `Rent Listing #${i}`,
      price: 10000 + i * 500,
      location: locations[i % locations.length],
      mode: "rent",
      bedrooms: (i % 3) + 1,
      bathrooms: (i % 2) + 1,
      area: 400 + i * 20,
      description: `A nice rental property number ${i}.`,
      images: [images[i % images.length]],
    });

    // BUY
    buyData.push({
      title: `Buy Listing #${i}`,
      price: 40 + i * 5, // e.g., in lakhs
      location: locations[i % locations.length],
      mode: "buy",
      bedrooms: (i % 4) + 1,
      bathrooms: (i % 3) + 1,
      area: 450 + i * 25,
      description: `A lovely home to purchase number ${i}.`,
      images: [images[i % images.length]],
    });

    // SOLD
    soldData.push({
      title: `Sold Listing #${i}`,
      price: 80 + i * 4,
      location: locations[i % locations.length],
      mode: "sold",
      bedrooms: (i % 5) + 1,
      bathrooms: (i % 2) + 1,
      area: 500 + i * 15,
      description: `This property has been sold, listing #${i}.`,
      images: [images[i % images.length]],
    });
  }

  return [...rentData, ...buyData, ...soldData]; // total 60
}

const propertiesData = generateSeedData();

async function seedDB() {
  try {
    // Check if the collection is already seeded
    const count = await Property.countDocuments({});
    if (count > 0) {
      console.log("Properties already exist. Skipping seeding.");
      return mongoose.connection.close();
    }

    // Otherwise seed
    await Property.insertMany(propertiesData);
    console.log("Successfully inserted properties!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
