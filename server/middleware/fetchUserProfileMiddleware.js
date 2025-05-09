// server/middleware/fetchUserProfileMiddleware.js
const UserProfile = require("../models/UserProfile"); // Adjust path if necessary

const fetchUserProfileMiddleware = async (req, res, next) => {
  // Ensure user is authenticated (req.user should be set by previous middleware)
  if (!req.user || !req.user.email) {
    console.warn("[FetchProfile] User not found on request object.");
    // This shouldn't happen if authMiddleware ran correctly, but good to check.
    return res
      .status(401)
      .json({ message: "User authentication data missing." });
  }

  try {
    // Fetch the user's profile from MongoDB using the email from the token
    const userProfile = await UserProfile.findOne({ email: req.user.email });

    if (!userProfile) {
      // If no profile exists in MongoDB for this authenticated Cognito user
      console.warn(
        `[FetchProfile] No profile found for email: ${req.user.email}`
      );
      // Decide how to handle this: deny access, create a profile, etc.
      // For now, denying access seems safest unless auto-creation is intended.
      return res.status(403).json({ message: "User profile not found." });
    }

    // --- ADDED: Check Account Status ---
    if (userProfile.accountStatus === "blocked") {
      console.log(
        `[FetchProfile] Access denied for blocked user: ${req.user.email}`
      );
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }
    // --- END Check ---

    // Attach the fetched profile to the request object for subsequent middleware/controllers
    req.userProfile = userProfile;
    console.log(
      `[FetchProfile] Profile fetched for user: ${req.user.email}, isAdmin: ${userProfile.isAdmin}, status: ${userProfile.accountStatus}, displayName: ${userProfile.displayName}}`
    );

    next(); // Proceed to the next middleware (e.g., isAdminMiddleware or the controller)
  } catch (error) {
    console.error(
      `[FetchProfile] Error fetching profile for ${req.user.email}:`,
      error
    );
    res.status(500).json({ message: "Server error fetching user profile." });
  }
};

module.exports = fetchUserProfileMiddleware;
