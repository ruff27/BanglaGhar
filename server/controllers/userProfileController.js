// server/controllers/userProfileController.js
const UserProfile = require("../models/UserProfile");
const fs = require("fs");
const path = require("path");
const Property = require("../models/property"); // Assuming you have a Property model

// --- getMyProfile function (Modified) ---
exports.getMyProfile = async (req, res) => {
  // Ensure user details from auth middleware are present
  if (!req.user || !req.user.email || !req.user.sub) {
    console.error("UserProfile Fetch Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }
  const userEmail = req.user.email;
  const userSub = req.user.sub;
  // Determine the name provided by Cognito (might be username, name attribute, or sub)
  const cognitoName = req.user.name || req.user.username || req.user.sub; // Use claim that holds the unique ID/login name

  try {
    let userProfile = await UserProfile.findOne({ email: userEmail });

    if (!userProfile) {
      // --- Create new profile ---
      console.log(`Creating new UserProfile for email: ${userEmail}`);
      userProfile = new UserProfile({
        email: userEmail,
        cognitoSub: userSub,
        name: cognitoName, // Store the original cognito identifier
        displayName: cognitoName, // Initialize displayName with the cognito identifier
        // Other fields get defaults from schema
      });
      // The pre-save hook will handle setting updatedAt and potentially displayName again if needed
      await userProfile.save();
      console.log(`UserProfile created successfully for ${userEmail}`);
    } else {
      // --- Update existing profile if needed ---
      let profileNeedsSave = false;

      // Check if cognitoSub or cognito name attribute needs updating
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
        // NOTE: We do NOT automatically update displayName here. User controls it.
        profileNeedsSave = true;
      }
      // Ensure displayName has a value if it's missing (migration for older profiles)
      if (!userProfile.displayName) {
        console.log(
          `Populating missing displayName for ${userEmail} using name or email.`
        );
        userProfile.displayName = userProfile.name || userProfile.email; // Use Cognito name or fallback to email
        profileNeedsSave = true;
      }

      if (profileNeedsSave) {
        // pre-save hook will update 'updatedAt'
        await userProfile.save();
        console.log(`UserProfile updated for ${userEmail} during fetch.`);
      } else {
        console.log(
          `Found UserProfile for ${userEmail}, no immediate updates needed.`
        );
      }
    }

    // Return the complete profile data as an object
    res.status(200).json(userProfile.toObject());
  } catch (error) {
    console.error(`Error in getMyProfile for ${userEmail}:`, error);
    res.status(500).json({ message: "Server error retrieving user profile." });
  }
};

// --- START: ADDED updateMyProfile function ---
exports.updateMyProfile = async (req, res) => {
  // Ensure user is authenticated
  if (!req.user || !req.user.email) {
    console.error("Update Profile Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }

  const userEmail = req.user.email;
  const { displayName } = req.body; // Extract only displayName from body

  // Validate input: Check if displayName is provided and is a non-empty string
  if (typeof displayName === "undefined") {
    return res
      .status(400)
      .json({ message: "Missing 'displayName' in request body." });
  }
  if (typeof displayName !== "string" || displayName.trim().length === 0) {
    return res.status(400).json({ message: "Display name cannot be empty." });
  }
  if (displayName.trim().length > 100) {
    // Example length limit
    return res
      .status(400)
      .json({ message: "Display name is too long (max 100 characters)." });
  }

  try {
    // Find the user's profile
    const userProfile = await UserProfile.findOne({ email: userEmail });

    if (!userProfile) {
      console.error(
        `Update Profile Error: UserProfile not found for ${userEmail}.`
      );
      // This might indicate a sync issue if user exists in Cognito but not DB
      return res.status(404).json({ message: "User profile not found." });
    }

    // Update the displayName
    userProfile.displayName = displayName.trim();
    // The pre-save hook automatically updates 'updatedAt'

    await userProfile.save();

    console.log(
      `UserProfile displayName updated successfully for ${userEmail} to '${userProfile.displayName}'`
    );

    // Return success message and the updated field
    res.status(200).json({
      message: "Profile updated successfully.",
      displayName: userProfile.displayName, // Send back the updated name
    });
  } catch (error) {
    console.error(`Error saving updated profile for ${userEmail}:`, error);
    // Handle potential validation errors from Mongoose as well
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: error.errors });
    }
    res.status(500).json({ message: "Server error updating user profile." });
  }
};
// --- END: ADDED updateMyProfile function ---

// --- uploadGovtId function (Unchanged from your provided version) ---
exports.uploadGovtId = async (req, res) => {
  // ... (Your existing uploadGovtId code remains here) ...
  if (!req.user || !req.user.email) {
    console.error("ID Upload Error: req.user not found or incomplete.");
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting orphaned uploaded file:", err);
      });
    }
    return res.status(401).json({ message: "Authentication required." });
  }
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please select a file." });
  }
  const userEmail = req.user.email;
  const filePath = req.file.path;
  console.log(`Govt ID received for ${userEmail}. File saved to: ${filePath}`);
  try {
    const userProfile = await UserProfile.findOne({ email: userEmail });
    if (!userProfile) {
      console.error(
        `ID Upload Error: UserProfile not found for ${userEmail} during upload.`
      );
      fs.unlink(filePath, (err) => {
        if (err)
          console.error("Error deleting file for non-existent profile:", err);
      });
      return res.status(404).json({ message: "User profile not found." });
    }
    if (userProfile.govtIdUrl && userProfile.govtIdUrl !== filePath) {
      console.log(`Deleting old Govt ID file: ${userProfile.govtIdUrl}`);
      const oldFilePath = path.resolve(userProfile.govtIdUrl);
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old Govt ID file:", err);
        } else {
          console.log(
            `Successfully deleted old file: ${userProfile.govtIdUrl}`
          );
        }
      });
    }
    userProfile.govtIdUrl = filePath;
    userProfile.approvalStatus = "pending";
    await userProfile.save();
    console.log(`UserProfile updated for ${userEmail}. Status set to pending.`);
    res.status(200).json({
      message: "ID uploaded successfully. Your request is pending approval.",
      approvalStatus: userProfile.approvalStatus,
    });
  } catch (error) {
    console.error(`ID Upload Error saving profile for ${userEmail}:`, error);
    fs.unlink(filePath, (err) => {
      if (err)
        console.error("Error deleting uploaded file after DB error:", err);
    });
    res.status(500).json({ message: "Server error processing ID upload." });
  }
};

exports.getMyListings = async (req, res) => {
  // Ensure user is authenticated
  if (!req.user || !req.user.email) {
    console.error(
      "Get My Listings Error: User not authenticated or email missing."
    );
    return res.status(401).json({ error: "Authentication required." });
  }

  const userEmail = req.user.email;

  try {
    // Find properties where 'createdBy' matches the user's email
    // Select fields you want to return (optional, but good practice)
    // Sort by creation date descending (newest first)
    const userListings = await Property.find({ createdBy: userEmail })
      .sort({ createdAt: -1 }) // Sort newest first
      .select(
        "title price listingType propertyType images addressLine1 cityTown district createdAt isHidden bedrooms bathrooms area"
      ); // Select relevant fields

    console.log(`Found ${userListings.length} listings for user ${userEmail}`);

    res.status(200).json(userListings);
  } catch (error) {
    console.error(`Error fetching listings for user ${userEmail}:`, error);
    res.status(500).json({ error: "Server error fetching user listings." });
  }
};
