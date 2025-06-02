const UserProfile = require("../models/UserProfile"); // Adjust path if necessary

const fetchUserProfileMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.email) {
    console.warn("[FetchProfile] User not found on request object.");
    return res
      .status(401)
      .json({ message: "User authentication data missing." });
  }

  try {
    const userProfile = await UserProfile.findOne({ email: req.user.email });

    if (!userProfile) {
      console.warn(
        `[FetchProfile] No profile found for email: ${req.user.email}`
      );
      return res.status(403).json({ message: "User profile not found." });
    }

    if (userProfile.accountStatus === "blocked") {
      console.log(
        `[FetchProfile] Access denied for blocked user: ${req.user.email}`
      );
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }

    req.userProfile = userProfile;
    console.log(
      `[FetchProfile] Profile fetched for user: ${req.user.email}, isAdmin: ${userProfile.isAdmin}, status: ${userProfile.accountStatus}, displayName: ${userProfile.displayName}}`
    );

    next();
  } catch (error) {
    console.error(
      `[FetchProfile] Error fetching profile for ${req.user.email}:`,
      error
    );
    res.status(500).json({ message: "Server error fetching user profile." });
  }
};

module.exports = fetchUserProfileMiddleware;
