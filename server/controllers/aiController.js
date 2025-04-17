// server/controllers/aiController.js

const OpenAI = require("openai");

// Configure OpenAI client from env
// Make sure server/.env defines AIML_API_KEY (or OPENAI_API_KEY) and optionally OPENAI_API_BASE_URL
const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.aimlapi.com/v1",
  apiKey: process.env.AIML_API_KEY || process.env.OPENAI_API_KEY,
});

const generatePropertyDescription = async (req, res) => {
  try {
    const property = req.body.propertyData;
    if (!property || typeof property !== "object") {
      return res.status(400).json({ error: "Invalid property data received" });
    }

    const prompt =
      `You are a professional real estate agent. Generate a compelling 150-200 word description for a property with these details:\n\n` +
      `Property Title: ${property.title || "N/A"}\n` +
      `Property Type: ${property.propertyType || "N/A"}\n` +
      `Listing Type: For ${property.listingType || "N/A"}\n` +
      `Price: ${property.price || "N/A"} BDT\n` +
      `Location: ${property.address || "N/A"}, ${property.city || "N/A"}, ${
        property.state || "N/A"
      }\n` +
      `Size: ${property.area || "N/A"} square feet\n` +
      `Bedrooms: ${property.bedrooms || "N/A"}\n` +
      `Bathrooms: ${property.bathrooms || "N/A"}\n\n` +
      `Key Features:\n` +
      `${property.features?.parking ? "- Ample parking space\n" : ""}` +
      `${property.features?.garden ? "- Beautiful garden area\n" : ""}` +
      `${
        property.features?.airConditioning ? "- Fully air-conditioned\n" : ""
      }` +
      `${property.features?.furnished ? "- Fully furnished\n" : ""}` +
      `${property.features?.pool ? "- Swimming pool\n" : ""}` +
      `\nWrite an engaging description that highlights the property's best features, location advantages, and potential uses. Use persuasive language suitable for a property listing.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional realtor crafting high-quality property descriptions.",
        },
        { role: "user", content: prompt },
      ],
      model: "mistralai/Mistral-7B-Instruct-v0.2",
    });

    if (
      completion &&
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message
    ) {
      res.json({ description: completion.choices[0].message.content });
    } else {
      throw new Error("Invalid response structure from AI API");
    }
  } catch (error) {
    console.error("AI Description Error:", error);
    res.status(500).json({
      error: "Failed to generate property description",
      details: error.message,
    });
  }
};

exports.generateDescription = generatePropertyDescription;
