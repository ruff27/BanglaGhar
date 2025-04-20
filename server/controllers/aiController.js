// server/controllers/aiController.js

const OpenAI = require("openai");

// Configure OpenAI client from env
const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.aimlapi.com/v1", // Default to aimlapi if needed
  apiKey: process.env.AIML_API_KEY || process.env.OPENAI_API_KEY, // Check both potential env var names
});

// Helper function to safely access nested properties
const getSafe = (obj, path, defaultValue = "N/A") => {
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return defaultValue; // Return default if path is invalid or value is null/undefined
    }
  }
  // Handle cases where the final value might be null/undefined/empty string
  return result !== null && result !== undefined && result !== ""
    ? result
    : defaultValue;
};

// Helper function to format features for the prompt
const formatFeaturesForPrompt = (features = {}) => {
  let featureString = "";
  if (features.parking === true) featureString += "- Parking Available\n";
  if (features.garden === true) featureString += "- Garden Area\n";
  if (features.airConditioning === true)
    featureString += "- Air Conditioning\n";
  if (features.pool === true) featureString += "- Swimming Pool\n";
  if (features.furnished && features.furnished !== "no")
    featureString += `- Furnished: ${features.furnished}\n`;
  // Add other boolean features from your `features` object here...
  return featureString || "N/A"; // Return N/A if no features listed
};

// Helper function to format Bangladesh-specific details for the prompt
const formatBangladeshDetailsForPrompt = (bdDetails = {}) => {
  let detailString = "";
  if (getSafe(bdDetails, "propertyCondition") !== "N/A")
    detailString += `- Condition: ${getSafe(bdDetails, "propertyCondition")}\n`;
  if (getSafe(bdDetails, "waterSource") !== "N/A")
    detailString += `- Water Source: ${getSafe(bdDetails, "waterSource")}\n`;
  if (getSafe(bdDetails, "gasSource") !== "N/A")
    detailString += `- Gas Source: ${getSafe(bdDetails, "gasSource")} ${
      bdDetails.gasSource === "piped"
        ? `(Line Installed: ${getSafe(
            bdDetails,
            "gasLineInstalled",
            "Unknown"
          )})`
        : ""
    }\n`;
  if (
    getSafe(bdDetails, "backupPower") !== "N/A" &&
    getSafe(bdDetails, "backupPower") !== "none"
  )
    detailString += `- Backup Power: ${getSafe(bdDetails, "backupPower")}\n`;
  if (
    getSafe(bdDetails, "parkingType") !== "N/A" &&
    getSafe(bdDetails, "parkingType") !== "none"
  )
    detailString += `- Parking: ${getSafe(bdDetails, "parkingType")}\n`;
  if (
    Array.isArray(bdDetails.securityFeatures) &&
    bdDetails.securityFeatures.length > 0
  )
    detailString += `- Security: ${bdDetails.securityFeatures.join(", ")}\n`;
  if (getSafe(bdDetails, "nearbySchools") !== "N/A")
    detailString += `- Nearby Schools: ${getSafe(
      bdDetails,
      "nearbySchools"
    )}\n`;
  if (getSafe(bdDetails, "nearbyHospitals") !== "N/A")
    detailString += `- Nearby Hospitals: ${getSafe(
      bdDetails,
      "nearbyHospitals"
    )}\n`;
  if (getSafe(bdDetails, "nearbyMarkets") !== "N/A")
    detailString += `- Nearby Markets: ${getSafe(
      bdDetails,
      "nearbyMarkets"
    )}\n`;
  // Add other important details from bdDetails here...
  if (getSafe(bdDetails, "balcony") === "yes")
    detailString += `- Balcony Available\n`;
  if (getSafe(bdDetails, "rooftopAccess") === "yes")
    detailString += `- Rooftop Access\n`;
  if (getSafe(bdDetails, "naturalLight") !== "N/A")
    detailString += `- Natural Light: ${getSafe(bdDetails, "naturalLight")}\n`;
  if (getSafe(bdDetails, "roadWidth") !== "N/A")
    detailString += `- Road Width: ${getSafe(bdDetails, "roadWidth")}\n`;

  return detailString || "N/A"; // Return N/A if no specific details provided
};

const generatePropertyDescription = async (req, res) => {
  try {
    // Access the nested propertyData object sent from the frontend
    const propertyDataFromRequest = req.body.propertyData;
    if (
      !propertyDataFromRequest ||
      typeof propertyDataFromRequest !== "object"
    ) {
      return res.status(400).json({ error: "Invalid property data received" });
    }

    // Extract data using safe getter, accessing the correct nested structure
    const basicInfo = propertyDataFromRequest.basicInfo || {};
    const location = propertyDataFromRequest.location || {};
    const features = propertyDataFromRequest.features || {};
    const bdDetails = propertyDataFromRequest.bangladeshDetails || {};

    // --- Build the NEW, Detailed Prompt ---
    const prompt = `
You are a professional real estate agent writing a property listing for the Bangladeshi market. Generate a compelling and informative 150-200 word description for the following property. Focus on clarity, key selling points, and local context.

**Property Overview:**
- Title: ${getSafe(basicInfo, "title")}
- Property Type: ${getSafe(basicInfo, "propertyType")}
- Listing Type: For ${getSafe(basicInfo, "listingType")}
- Price: ${getSafe(basicInfo, "price")} BDT ${
      basicInfo.listingType === "rent" ? "/month" : ""
    }
- Size: ${getSafe(basicInfo, "area")} sqft
- Bedrooms: ${getSafe(basicInfo, "bedrooms", "N/A (Land/Commercial)")}
- Bathrooms: ${getSafe(basicInfo, "bathrooms", "N/A (Land/Commercial)")}

**Location:**
- Address: ${getSafe(location, "addressLine1")}${
      location.addressLine2 ? `, ${location.addressLine2}` : ""
    }
- Area/Town: ${getSafe(location, "cityTown")}
- Upazila/Thana: ${getSafe(location, "upazila")}
- District: ${getSafe(location, "district")}
- Postal Code: ${getSafe(location, "postalCode")}

**Standard Features:**
${formatFeaturesForPrompt(features)}

**Specific Details & Local Context:**
${formatBangladeshDetailsForPrompt(bdDetails)}

**Instructions:**
Write an engaging description based *only* on the details provided above. Highlight the most attractive features, benefits of the location, and suitability for potential buyers/renters in Bangladesh. Ensure the tone is professional and inviting. Do not invent details not listed.
`;
    // --- End of New Prompt ---

    console.log("---- Sending Prompt to AI ----\n", prompt); // Log the prompt for debugging

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant writing compelling property descriptions for the Bangladeshi market based on provided details.",
        },
        { role: "user", content: prompt },
      ],
      model: process.env.AI_MODEL || "mistralai/Mistral-7B-Instruct-v0.2", // Use env var for model if needed
      // max_tokens: 250, // Optional: Limit response length
      // temperature: 0.7, // Optional: Adjust creativity
    });

    if (completion?.choices?.[0]?.message?.content) {
      console.log(
        "---- AI Response Received ----\n",
        completion.choices[0].message.content
      ); // Log response
      res.json({ description: completion.choices[0].message.content.trim() });
    } else {
      console.error("Invalid response structure from AI API:", completion);
      throw new Error("Invalid response structure from AI API");
    }
  } catch (error) {
    console.error(
      "AI Description Error:",
      error?.response?.data || error?.message || error
    );
    res.status(500).json({
      error: "Failed to generate property description",
      details: error?.message || "Unknown AI service error",
    });
  }
};

exports.generateDescription = generatePropertyDescription;
