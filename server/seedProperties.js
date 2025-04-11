const mongoose = require("mongoose");
const Property = require("./models/Property");

// Use your existing connection string (update if needed)
const MONGO_URI =
  "mongodb+srv://103531273:forctpA2025@cluster1.wmpcxe1.mongodb.net/BanglaGhar?retryWrites=true&w=majority&appName=Cluster1";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

function generateSeedData() {
  const rentData = [];
  const buyData = [];
  const soldData = [];

  // The images should be placed in your public/pictures folder.
  const images = ["house1.png", "house2.png", "house3.png"];
  const locations = ["Dhaka", "Gulshan", "Dhanmondi", "Banani", "Uttara"];

  for (let i = 1; i <= 20; i++) {
    // RENT listings – available for rent
    rentData.push({
      title: `Rent Listing #${i}`,
      price: 10000 + i * 500, // Example: rent in Taka
      location: locations[i % locations.length],
      mode: "rent",
      bedrooms: (i % 3) + 1,
      bathrooms: (i % 2) + 1,
      area: 400 + i * 20,
      description: `This rental property, Rent Listing #${i}, offers comfortable living with modern amenities and excellent accessibility in ${
        locations[i % locations.length]
      }. Enjoy a secure, well-maintained community with convenient proximity to all essential services.`,
      images: [images[i % images.length]],
    });

    // BUY listings – available for purchase
    buyData.push({
      title: `Buy Listing #${i}`,
      price: 40 + i * 5, // Example: price in lakhs
      location: locations[i % locations.length],
      mode: "buy",
      bedrooms: (i % 4) + 1,
      bathrooms: (i % 3) + 1,
      area: 450 + i * 25,
      description: `Discover this modern property for sale! Buy Listing #${i} features upscale design, premium finishes, and a location in the heart of ${
        locations[i % locations.length]
      }, perfect for homeowners seeking quality and value.`,
      images: [images[i % images.length]],
    });

    // SOLD listings – properties that have been sold
    soldData.push({
      title: `Sold Listing #${i}`,
      price: 80 + i * 4, // Example: price in lakhs
      location: locations[i % locations.length],
      mode: "sold",
      bedrooms: (i % 5) + 1,
      bathrooms: (i % 2) + 1,
      area: 500 + i * 15,
      description: `This property, Sold Listing #${i}, has successfully changed hands. The new owners are enjoying a modern home in ${
        locations[i % locations.length]
      }. Congratulations to all parties involved in this seamless transaction!`,
      images: [images[i % images.length]],
    });
  }

  // Combine all listings into one array (total of 60 properties)
  return [...rentData, ...buyData, ...soldData];
}

const propertiesData = generateSeedData();

async function seedDB() {
  try {
    // Check if any property exists; if so, skip seeding.
    const count = await Property.countDocuments({});
    if (count > 0) {
      console.log("Properties already exist. Skipping seeding.");
      return mongoose.connection.close();
    }

    // Otherwise, seed the database with the new data.
    await Property.insertMany(propertiesData);
    console.log("Successfully inserted properties!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
