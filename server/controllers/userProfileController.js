// server/controllers/userProfileController.js
const UserProfile = require("../models/UserProfile");
// const fs = require("fs"); // REMOVED: No longer interacting with local filesystem directly for uploads
const path = require("path"); // Keep for extension extraction if needed
const Property = require("../models/property");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); // ADDED: AWS S3 Client

// --- Configure AWS S3 Client ---
// Ensure these environment variables are set in Netlify:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, APP_AWS_REGION
const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});
const S3_BUCKET = process.env.S3_BUCKET_NAME;
// --- End S3 Configuration ---

// --- getMyProfile function --- (No changes from your previous version)
exports.getMyProfile = async (req, res) => {
  // ... (your existing getMyProfile code) ...
  if (!req.user || !req.user.email || !req.user.sub) {
    console.error("UserProfile Fetch Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }
  const userEmail = req.user.email;
  const userSub = req.user.sub;
  const cognitoName = req.user.name || req.user.username || req.user.sub;

  try {
    let userProfile = await UserProfile.findOne({ email: userEmail });
    if (!userProfile) {
      console.log(`Creating new UserProfile for email: ${userEmail}`);
      userProfile = new UserProfile({
        email: userEmail,
        cognitoSub: userSub,
        name: cognitoName,
        displayName: cognitoName,
      });
      await userProfile.save();
      console.log(`UserProfile created successfully for ${userEmail}`);
    } else {
      let profileNeedsSave = false;
      if (userProfile.cognitoSub !== userSub) {
        console.warn(
          `UserProfile sub mismatch for ${userEmail}. DB: ${userProfile.cognitoSub}, JWT: ${userSub}. Updating DB sub.`
        );
        userProfile.cognitoSub = userSub;
        profileNeedsSave = true;
      }
      if (cognitoName && userProfile.name !== cognitoName) {
        console.log(
          `Updating cognito source name in DB for ${userEmail} from '${userProfile.name}' to '${cognitoName}'.`
        );
        userProfile.name = cognitoName;
        profileNeedsSave = true;
      }
      if (!userProfile.displayName) {
        console.log(
          `Populating missing displayName for ${userEmail} using name or email.`
        );
        userProfile.displayName = userProfile.name || userProfile.email;
        profileNeedsSave = true;
      }
      if (profileNeedsSave) {
        await userProfile.save();
        console.log(`UserProfile updated for ${userEmail} during fetch.`);
      } else {
        console.log(
          `Found UserProfile for ${userEmail}, no immediate updates needed.`
        );
      }
    }
    res.status(200).json(userProfile.toObject());
  } catch (error) {
    console.error(`Error in getMyProfile for ${userEmail}:`, error);
    res.status(500).json({ message: "Server error retrieving user profile." });
  }
};

// --- updateMyProfile function --- (No changes from your previous version)
exports.updateMyProfile = async (req, res) => {
  // ... (your existing updateMyProfile code) ...
  if (!req.user || !req.user.email) {
    console.error("Update Profile Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }
  const userEmail = req.user.email;
  const { displayName } = req.body;
  if (typeof displayName === "undefined") {
    return res
      .status(400)
      .json({ message: "Missing 'displayName' in request body." });
  }
  if (typeof displayName !== "string" || displayName.trim().length === 0) {
    return res.status(400).json({ message: "Display name cannot be empty." });
  }
  if (displayName.trim().length > 100) {
    return res
      .status(400)
      .json({ message: "Display name is too long (max 100 characters)." });
  }
  try {
    const userProfile = await UserProfile.findOne({ email: userEmail });
    if (!userProfile) {
      console.error(
        `Update Profile Error: UserProfile not found for ${userEmail}.`
      );
      return res.status(404).json({ message: "User profile not found." });
    }
    userProfile.displayName = displayName.trim();
    await userProfile.save();
    console.log(
      `UserProfile displayName updated successfully for ${userEmail} to '${userProfile.displayName}'`
    );
    res.status(200).json({
      message: "Profile updated successfully.",
      displayName: userProfile.displayName,
    });
  } catch (error) {
    console.error(`Error saving updated profile for ${userEmail}:`, error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: error.errors });
    }
    res.status(500).json({ message: "Server error updating user profile." });
  }
};

// --- uploadGovtId function (MODIFIED for S3) ---
exports.uploadGovtId = async (req, res) => {
  if (!req.user || !req.user.email || !req.user.sub) {
    // Ensure sub is available
    console.error("ID Upload Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please select a file." });
  }
  if (!S3_BUCKET) {
    console.error(
      "ID Upload Error: S3_BUCKET_NAME environment variable not set."
    );
    return res
      .status(500)
      .json({ message: "Server configuration error [S3 Bucket]." });
  }

  const userEmail = req.user.email;
  const userSub = req.user.sub; // Use cognitoSub for unique folder/filename if desired
  const fileBuffer = req.file.buffer;
  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const fileExtension = path.extname(originalName);

  // Construct a unique filename for S3
  // Example: govt_ids/ap-southeast-2_user_sub_id/1678886400000.pdf
  const s3Key = `govt_ids/${userSub}/${Date.now()}${fileExtension}`;

  // S3 Upload Parameters
  const params = {
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: 'public-read' // Optional: if you want the file to be publicly accessible directly via S3 URL
    // Consider using CloudFront or signed URLs for better security/control
  };

  console.log(
    `Attempting to upload Govt ID for ${userEmail} to S3 bucket: ${S3_BUCKET}, Key: ${s3Key}`
  );

  try {
    // Upload to S3
    const command = new PutObjectCommand(params);
    const uploadResult = await s3Client.send(command);
    console.log("S3 Upload Result:", uploadResult); // Log the result from S3

    // Construct the S3 URL (adjust based on your bucket/region/settings)
    // Basic HTTPS URL format:
    const fileUrl = `https://${S3_BUCKET}.s3.${process.env.APP_AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log(`File uploaded successfully to: ${fileUrl}`);

    // Find user profile
    const userProfile = await UserProfile.findOne({ email: userEmail });
    if (!userProfile) {
      console.error(
        `ID Upload Error: UserProfile not found for ${userEmail} after S3 upload.`
      );
      // Note: Consider deleting the S3 object here if the profile doesn't exist, though unlikely
      return res.status(404).json({ message: "User profile not found." });
    }

    // Update profile with S3 URL
    // Note: No need to delete old file from S3 here unless you implement specific tracking/versioning
    userProfile.govtIdUrl = fileUrl;
    userProfile.approvalStatus = "pending";
    await userProfile.save();
    console.log(
      `UserProfile updated for ${userEmail}. Status set to pending. Govt ID URL: ${fileUrl}`
    );

    res.status(200).json({
      message: "ID uploaded successfully. Your request is pending approval.",
      approvalStatus: userProfile.approvalStatus,
      fileUrl: fileUrl, // Optionally return the URL
    });
  } catch (error) {
    console.error(`ID Upload Error processing file for ${userEmail}:`, error);
    res.status(500).json({
      message: "Server error processing ID upload.",
      error: error.message,
    });
  }
};

// --- getMyListings function --- (No changes from your previous version)
exports.getMyListings = async (req, res) => {
  // ... (your existing getMyListings code) ...
  if (!req.user || !req.user.email) {
    console.error(
      "Get My Listings Error: User not authenticated or email missing."
    );
    return res.status(401).json({ error: "Authentication required." });
  }
  const userEmail = req.user.email;
  try {
    const userListings = await Property.find({ createdBy: userEmail })
      .sort({ createdAt: -1 })
      .select(
        "title price listingType propertyType images addressLine1 cityTown district createdAt isHidden bedrooms bathrooms area"
      );
    console.log(`Found ${userListings.length} listings for user ${userEmail}`);
    res.status(200).json(userListings);
  } catch (error) {
    console.error(`Error fetching listings for user ${userEmail}:`, error);
    res.status(500).json({ error: "Server error fetching user listings." });
  }
};
