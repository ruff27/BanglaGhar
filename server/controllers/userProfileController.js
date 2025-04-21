// server/controllers/userProfileController.js
const UserProfile = require("../models/UserProfile");
const fs = require("fs"); // Require Node.js file system module for potential cleanup
const path = require("path"); // Require path module

// --- getMyProfile function (Keep existing code) ---
exports.getMyProfile = async (req, res) => {
  // ... (keep existing getMyProfile code from previous step) ...
  if (!req.user || !req.user.email || !req.user.sub) {
    console.error("UserProfile Fetch Error: req.user not found or incomplete.");
    return res.status(401).json({ message: "Authentication required." });
  }
  const userEmail = req.user.email;
  const userSub = req.user.sub;
  const userName = req.user.username || req.user.email;

  try {
    let userProfile = await UserProfile.findOne({ email: userEmail });
    if (!userProfile) {
      console.log(`Creating new UserProfile for email: ${userEmail}`);
      userProfile = new UserProfile({
        email: userEmail,
        cognitoSub: userSub,
        name: userName,
      });
      await userProfile.save();
      console.log(`UserProfile created successfully for ${userEmail}`);
    } else {
      // Optional: Check if cognitoSub matches, handle potential discrepancies
      if (userProfile.cognitoSub !== userSub) {
        console.warn(
          `UserProfile sub mismatch for ${userEmail}. Stored: ${userProfile.cognitoSub}, Current: ${userSub}. Updating stored sub.`
        );
        userProfile.cognitoSub = userSub;
        if (userName && userProfile.name !== userName) {
          userProfile.name = userName;
        }
        await userProfile.save();
      } else if (userName && userProfile.name !== userName) {
        // Update name if it changed in Cognito and sub matches
        console.log(
          `Updating name for ${userEmail} from '${userProfile.name}' to '${userName}'.`
        );
        userProfile.name = userName;
        await userProfile.save();
      }
      console.log(`Found UserProfile for ${userEmail}`);
    }
    const profileData = userProfile.toObject();
    res.status(200).json(profileData);
  } catch (error) {
    console.error(
      `Error fetching/creating UserProfile for ${userEmail}:`,
      error
    );
    res.status(500).json({ message: "Server error retrieving user profile." });
  }
};

// --- NEW: Function to handle Government ID Upload ---
exports.uploadGovtId = async (req, res) => {
  // Ensure authMiddleware has run and attached user info
  if (!req.user || !req.user.email) {
    console.error("ID Upload Error: req.user not found or incomplete.");
    // If a file was uploaded despite auth error, attempt to delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting orphaned uploaded file:", err);
      });
    }
    return res.status(401).json({ message: "Authentication required." });
  }

  // Check if multer middleware processed a file
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please select a file." });
  }

  const userEmail = req.user.email;
  const filePath = req.file.path; // Path where multer saved the file

  console.log(`Govt ID received for ${userEmail}. File saved to: ${filePath}`);

  try {
    // Find the user's profile
    const userProfile = await UserProfile.findOne({ email: userEmail });

    if (!userProfile) {
      // Should not happen if GET /me runs first, but handle defensively
      console.error(
        `ID Upload Error: UserProfile not found for ${userEmail} during upload.`
      );
      // Delete the uploaded file as we can't associate it
      fs.unlink(filePath, (err) => {
        if (err)
          console.error("Error deleting file for non-existent profile:", err);
      });
      return res.status(404).json({ message: "User profile not found." });
    }

    // --- Optional: Delete old ID file if replacing ---
    if (userProfile.govtIdUrl && userProfile.govtIdUrl !== filePath) {
      console.log(`Deleting old Govt ID file: ${userProfile.govtIdUrl}`);
      // Construct the absolute path if needed, assuming filePath is relative to server root
      const oldFilePath = path.resolve(userProfile.govtIdUrl); // Adjust if paths are stored differently
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old Govt ID file:", err);
          // Decide if this should halt the process or just warn
        } else {
          console.log(
            `Successfully deleted old file: ${userProfile.govtIdUrl}`
          );
        }
      });
    }
    // --- End Optional Delete ---

    // Update the user profile
    userProfile.govtIdUrl = filePath; // Store the path (relative or absolute depends on setup)
    userProfile.approvalStatus = "pending"; // Set status to pending
    // Ensure updatedAt is updated (handled by schema pre-save hook)

    await userProfile.save();

    console.log(`UserProfile updated for ${userEmail}. Status set to pending.`);

    res.status(200).json({
      message: "ID uploaded successfully. Your request is pending approval.",
      approvalStatus: userProfile.approvalStatus, // Return the new status
      // Optional: return the file path for confirmation? (Maybe not needed)
      // filePath: filePath
    });
  } catch (error) {
    console.error(`ID Upload Error saving profile for ${userEmail}:`, error);
    // Attempt to delete the newly uploaded file if DB save fails
    fs.unlink(filePath, (err) => {
      if (err)
        console.error("Error deleting uploaded file after DB error:", err);
    });
    res.status(500).json({ message: "Server error processing ID upload." });
  }
};
