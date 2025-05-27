// server/controllers/aiController.js

const fetch = require("node-fetch"); // Add fetch for Gemini API
const axios = require("axios");

const NVIDIA_API_KEY = "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";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

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
    // Debug: Log the language received from frontend
    console.log("[AIController] Received language:", req.body.language);

    // Access the nested propertyData object sent from the frontend
    const propertyDataFromRequest = req.body.propertyData;
    const language = req.body.language || "en"; // Default to English
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
    let prompt = "";
    
    
      prompt = `You are an expert real estate copywriter with deep understanding of the Bangladeshi property market, local culture, and what appeals to buyers and renters in different segments. Write a warm, emotionally engaging, and highly appealing property description for the listing below.

**Instructions:**
- The tone should be inviting, descriptive, and story-driven—like a trusted friend or real estate advisor is narrating the experience of living in the home.
- Highlight the **unique lifestyle advantages** this property offers, not just its features.
- Emphasize **comfort, ambiance, and neighborhood character**—make the reader imagine walking through the space and feeling at home.
- Draw attention to **standout features**, such as views, balconies, natural light, peaceful surroundings, or convenient access to roads, markets, schools, mosques, hospitals, etc.—but only if included in the data provided.
- Incorporate **cultural references or habits** where appropriate, such as the value of separate dining space for family gatherings, prayer space, veranda tea time, or close-knit community living.
- Never make up facts—only use what's provided in the listing details.
- Focus on clarity, warmth, and a strong sense of place.
- Avoid sounding robotic, overly generic, or like a simple feature list.
- give response in simple txt format, no markdown or code block
- (IMPORTANT) PLEASE GIVE ME THE RESPONSE IN ${language} LANGUAGE. the translation should be accurate and natural, not just a direct word-for-word translation. if possible use google translate api to get the translation. if you can't use google translate api, then use your own translation model to get the translation. but please make sure the translation is accurate and natural.
- avoid using like in the heart of dhaka or in the heart of dhaka city, instead use like in dhaka city or in dhaka or anything more specific.
- can you analyse the the location of the property in whatever part of the city it lies and generate a description accoringly avoiding key phrases like in the heart of dhaka or in the heart of dhaka city, instead use like in dhaka city or in dhaka or anything like that.

Length: 150–200 words
`;
    
    prompt += `**Property Details:**
- Title: ${getSafe(basicInfo, "title")}
- Property Type: ${getSafe(basicInfo, "propertyType")}
- Listing Type: For ${getSafe(basicInfo, "listingType")}
- Price: ${getSafe(basicInfo, "price")} BDT${basicInfo.listingType === "rent" ? " /month" : ""}
- Size: ${getSafe(basicInfo, "area")} sqft
- Bedrooms: ${getSafe(basicInfo, "bedrooms", "N/A (Land/Commercial)")}
- Bathrooms: ${getSafe(basicInfo, "bathrooms", "N/A (Land/Commercial)")}

**Location:**
- Address: ${getSafe(location, "addressLine1")}${location.addressLine2 ? `, ${location.addressLine2}` : ""}
- Area/Town: ${getSafe(location, "cityTown")}
- Upazila/Thana: ${getSafe(location, "upazila")}
- District: ${getSafe(location, "district")}
- Postal Code: ${getSafe(location, "postalCode")}

**Key Features & Amenities:**
${formatFeaturesForPrompt(features)}

**Local Highlights & Context:**
${formatBangladeshDetailsForPrompt(bdDetails)}`;
    // --- End of Improved Prompt ---

    console.log("---- Sending Prompt to NVIDIA ----\n", prompt); // Log the prompt for debugging

    const payload = {
      model: "mistralai/mistral-medium-3-instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 512,
      temperature: 1.0,
      top_p: 1.0,
      stream: false
    };
    const headers = {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    const response = await axios.post(NVIDIA_API_URL, payload, { headers });
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
      const description = response.data.choices[0].message.content.trim();
      res.json({ description });
    } else {
      console.error("Invalid response structure from NVIDIA API:", response.data);
      res.status(500).json({
        error: "Failed to generate property description",
        details: "Invalid response structure from NVIDIA API",
        nvidiaRaw: response.data,
      });
    }
  } catch (error) {
    console.error(
      "AI Description Error:",
      error?.response?.data || error?.message || error,
      JSON.stringify(error, null, 2)
    );
    res.status(500).json({
      error: "Failed to generate property description",
      details: error?.message || "Unknown AI service error",
    });
  }
};

exports.generateDescription = generatePropertyDescription;
