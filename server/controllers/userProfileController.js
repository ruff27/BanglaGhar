const UserProfile = require("../models/UserProfile");
const path = require("path");
const Property = require("../models/property.js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});
const S3_BUCKET = process.env.S3_BUCKET_NAME;

exports.getMyProfile = async (req, res) => {
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

exports.updateMyProfile = async (req, res) => {
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

exports.uploadGovtId = async (req, res) => {
  if (!req.user || !req.user.email || !req.user.sub) {
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
  const userSub = req.user.sub;
  const fileBuffer = req.file.buffer;
  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const fileExtension = path.extname(originalName);
  const s3Key = `govt_ids/${userSub}/${Date.now()}${fileExtension}`;
  const params = {
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  console.log(
    `Attempting to upload Govt ID for ${userEmail} to S3 bucket: ${S3_BUCKET}, Key: ${s3Key}`
  );

  try {
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
    userProfile.govtIdUrl = fileUrl;
    userProfile.approvalStatus = "pending";
    await userProfile.save();
    console.log(
      `UserProfile updated for ${userEmail}. Status set to pending. Govt ID URL: ${fileUrl}`
    );

    res.status(200).json({
      message: "ID uploaded successfully. Your request is pending approval.",
      approvalStatus: userProfile.approvalStatus,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error(`ID Upload Error processing file for ${userEmail}:`, error);
    res.status(500).json({
      message: "Server error processing ID upload.",
      error: error.message,
    });
  }
};

exports.getMyListings = async (req, res) => {
  if (!req.user || (!req.user.email && !req.user.sub)) {
    console.error(
      "Get My Listings Error: User not authenticated or identifier (email/sub) missing from token."
    );
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    const queryIdentifier = req.user.sub
      ? { cognitoSub: req.user.sub }
      : { email: req.user.email };
    const userProfile = await UserProfile.findOne(queryIdentifier);
    if (!userProfile) {
      console.log(
        `User profile not found for identifier: ${JSON.stringify(
          queryIdentifier
        )}. Cannot fetch listings.`
      );
      // If a user is authenticated but somehow has no profile record, they can't have listings.
      return res.status(200).json([]); // Return empty array, not an error
    }
    const userListings = await Property.find({ createdBy: userProfile._id })
      .sort({ createdAt: -1 })
      .select(
        "title price listingType propertyType images addressLine1 cityTown district createdAt isHidden bedrooms bathrooms area"
      );

    console.log(
      `Found ${userListings.length} listings for user ${userProfile.email} (ID: ${userProfile._id})`
    );
    res.status(200).json(userListings);
  } catch (error) {
    console.error(
      `Error fetching listings for user (identifier: ${
        JSON.stringify(req.user && (req.user.sub || req.user.email)) || "N/A"
      }):`,
      error
    );
    res.status(500).json({ error: "Server error fetching user listings." });
  }
};
