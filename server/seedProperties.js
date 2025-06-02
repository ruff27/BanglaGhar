// seedProperties.js (Updated for New Schema & ReferenceError Fix)
const mongoose = require("mongoose");
// Ensure this path points to your UPDATED Property model definition
const Property = require("./models/property"); // Adjust path if needed

// Use your existing connection string or environment variable
const MONGO_URI =
  process.env.MONGO_URI || // Use environment variable if set
  "mongodb+srv://103531273:forctpA2025@cluster1.wmpcxe1.mongodb.net/BanglaGhar?retryWrites=true&w=majority&appName=Cluster1"; // Fallback

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit if connection fails
  });

// --- Helper Data for New Structure ---
const images = ["house1.png", "house2.png", "house3.png"];
const propertyTypes = ["apartment", "house", "condo"]; // Exclude land/commercial for seeding simplicity, or add specific logic
const districts = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"];
const citiesAndUpazilas = {
  Dhaka: ["Gulshan", "Dhanmondi", "Banani", "Uttara", "Mirpur", "Motijheel"],
  Chattogram: ["Agrabad", "Khulshi", "Pahartali", "Kotwali", "Panchlaish"],
  Sylhet: ["Amberkhana", "Zindabazar", "Subidbazar", "Tilagarh"],
  Rajshahi: ["Boalia", "Motihar", "Shaheb Bazar"],
  Khulna: ["Sonadanga", "Khalishpur", "Daulatpur"],
};
const conditions = ["new", "resale", "under_construction"];
const waterSources = ["wasa", "deep_tube_well", "both"];
const gasSources = ["piped", "cylinder", "none"];
const parkingTypes = ["dedicated", "street", "garage", "none"];
const yesNo = ["yes", "no"];
const yesNoUnknown = ["yes", "no", "unknown"];
const furnishedStatus = ["no", "semi", "full"];
const tenureTypes = ["freehold", "leasehold"];

// Helper function to get a random item from an array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Generate Data Based on NEW Schema ---
function generateNewSeedData() {
  const properties = [];
  const listingTypes = ["rent", "buy", "sold"];
  const TOTAL_PER_TYPE = 20;
  let counter = 1;

  // Define a Static Description for Seeding
  const staticDescription =
    "This is a well-maintained property available in a desirable location. It features essential amenities and offers good value. Please contact us for further information or to arrange a visit.";

  for (const listingType of listingTypes) {
    for (let i = 1; i <= TOTAL_PER_TYPE; i++) {
      const district = getRandom(districts);
      const cityOrUpazilaOptions = citiesAndUpazilas[district] || [
        "Generic Upazila",
      ];
      const cityTown = getRandom(cityOrUpazilaOptions);
      const upazila = getRandom(cityOrUpazilaOptions);
      const propertyType = getRandom(propertyTypes);
      const isLandOrCommercial =
        propertyType === "land" || propertyType === "commercial"; // Adjust if seeding these types

      // Define the object WITHOUT the description first
      const propertyData = {
        // Basic Info
        title: `${
          propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
        } for ${listingType} #${counter}`,
        propertyType: propertyType,
        listingType: listingType,
        price:
          listingType === "rent"
            ? 10000 + Math.floor(Math.random() * 40000)
            : 5000000 + Math.floor(Math.random() * 45000000),
        area: 800 + Math.floor(Math.random() * 2200),
        bedrooms: isLandOrCommercial ? null : getRandom([1, 2, 3, 4, 5]),
        bathrooms: isLandOrCommercial ? null : getRandom([1, 2, 3]),

        // Location
        addressLine1: `${10 + i} ${getRandom([
          "Mirpur",
          "Gulshan",
          "Dhanmondi",
          "Banani",
        ])} Road`,
        addressLine2: getRandom([
          "",
          `Block ${String.fromCharCode(65 + (i % 5))}`,
        ]),
        cityTown: cityTown,
        upazila: upazila,
        district: district,
        postalCode: `${1200 + (i % 30)}`,

        // Features (Nested Object)
        features: isLandOrCommercial
          ? {}
          : {
              parking: getRandom([true, false]),
              garden: getRandom([true, false]),
              airConditioning: getRandom([true, false]),
              furnished: getRandom(furnishedStatus),
              pool: getRandom([true, false]),
            },

        // Bangladesh Details (Nested Object)
        bangladeshDetails: {
          propertyCondition: getRandom(conditions),
          proximityToMainRoad: getRandom([
            "On main road",
            "100m",
            "5 mins walk",
            "500m+",
          ]),
          publicTransport: getRandom([
            "Bus nearby",
            "Rickshaws available",
            "CNG stand close",
            "Metro 1km",
          ]),
          floodProne: getRandom(yesNo),
          waterSource: getRandom(waterSources),
          gasSource: getRandom(gasSources),
          gasLineInstalled: gasSources === "piped" ? getRandom(yesNo) : "na",
          backupPower: getRandom(["ips", "generator", "solar", "none"]),
          sewerSystem: getRandom(["covered", "open", "septic_tank", "none"]),
          nearbySchools: getRandom(["Nearby School A", "School B 5min", ""]),
          nearbyHospitals: getRandom(["Nearby Clinic", "Hospital C 10min", ""]),
          nearbyMarkets: getRandom(["Local Bazaar", "Supermarket nearby", ""]),
          nearbyReligiousPlaces: getRandom([
            "Mosque nearby",
            "Temple nearby",
            "",
          ]),
          nearbyOthers: getRandom(["Park nearby", "Restaurants close", ""]),
          securityFeatures: getRandom([
            [],
            ["gated"],
            ["guards"],
            ["cctv"],
            ["guards", "cctv"],
          ]),
          earthquakeResistance: getRandom(yesNoUnknown),
          roadWidth: getRandom(["10ft", "15ft", "20ft", "30ft+"]),
          parkingType: getRandom(parkingTypes),
          floorNumber: isLandOrCommercial
            ? null
            : getRandom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
          totalFloors: isLandOrCommercial
            ? null
            : getRandom([4, 5, 6, 8, 10, 12, 15]),
          balcony: isLandOrCommercial ? "no" : getRandom(yesNo),
          rooftopAccess: isLandOrCommercial ? "no" : getRandom(yesNo),
          naturalLight: getRandom([
            "Good",
            "Average",
            "Excellent",
            "Corner Plot",
          ]),
          ownershipPapers: getRandom(["clear", "pending", "unknown"]),
          propertyTenure: getRandom(tenureTypes),
          recentRenovations: getRandom([
            "",
            "Newly painted",
            "Kitchen updated 2024",
          ]),
          nearbyDevelopments: getRandom([
            "",
            "Metro station coming soon",
            "New shopping mall planned",
          ]),
          reasonForSelling:
            listingType === "buy"
              ? getRandom(["Relocating", "Upgrading", "Investment Sale", ""])
              : "",
        },

        // Images (Randomly chosen from predefined list)
        images: [getRandom(images)],

        // CreatedBy (Use a dummy email)
        createdBy: "seeduser@example.com",

        isHidden: false,
        featuredAt: null,
      };

      // Assign the STATIC description property AFTER the object is defined
      propertyData.description = staticDescription;

      properties.push(propertyData);
      counter++;
    }
  }
  console.log(
    `Generated ${properties.length} total property seed data objects.`
  );
  return properties;
}

// Generate the data
const propertiesToSeed = generateNewSeedData();

// Seeding Function
async function seedDB() {
  try {
    // Optional: Clear existing data first (USE WITH CAUTION!)
    // console.log("Clearing existing properties...");
    // await Property.deleteMany({});
    // console.log("Existing properties cleared.");

    // Check count again if you didn't clear
    const count = await Property.countDocuments({});
    if (count > 0) {
      console.log(
        `Properties collection already has ${count} documents. Skipping seeding.`
      );
      // Ensure connection closes even when skipping
      // return mongoose.connection.close().then(() => console.log("MongoDB connection closed after skipping."));
      return; // Exit the function early
    }

    console.log(
      `Attempting to insert ${propertiesToSeed.length} properties...`
    );
    await Property.insertMany(propertiesToSeed);
    console.log(`Successfully inserted ${propertiesToSeed.length} properties!`);
  } catch (err) {
    console.error("Error seeding data:", err.message);
    if (err.writeErrors) {
      err.writeErrors.forEach((e) =>
        console.error(`Write Error Index ${e.index}: ${e.errmsg}`)
      );
    }
  } finally {
    console.log("Closing MongoDB connection.");
    // Ensure connection closes regardless of seeding status
    mongoose.connection
      .close()
      .catch((err) => console.error("Error closing MongoDB connection:", err));
  }
}

// Run the seeding process
seedDB();
