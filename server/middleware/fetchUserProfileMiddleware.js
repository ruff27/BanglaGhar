// server/middleware/fetchUserProfileMiddleware.js
const UserProfile = require("../models/UserProfile");

const fetchUserProfileMiddleware = async (req, res, next) => {
  // Ensure authMiddleware has run and attached user info
  if (!req.user || !req.user.email) {
    console.error(
      "FetchUserProfileMiddleware Error: req.user.email not found. Ensure authMiddleware runs first."
    );
    // Don't explicitly send a 401 here, as authMiddleware should handle that.
    // Let the flow break naturally or proceed if some routes don't strictly need the profile.
    // However, for routes *requiring* a profile (like listing), subsequent checks will fail.
    // Consider sending 500 if this state is unexpected.
    return res
      .status(500)
      .json({ message: "User information missing after authentication." });
  }

  try {
    const userProfile = await UserProfile.findOne({ email: req.user.email });

    if (!userProfile) {
      // This case should ideally be rare for logged-in users if the
      // GET /api/user-profiles/me endpoint is called on login/refresh.
      // However, if it happens, it means the user is authenticated via Cognito
      // but has no corresponding profile in *this* app's DB yet.
      console.warn(
        `FetchUserProfileMiddleware Warning: UserProfile not found for authenticated user ${req.user.email}.`
      );
      // Option 1: Deny access, as subsequent logic depends on the profile
      return res
        .status(403)
        .json({
          message:
            "User profile not found. Please complete profile setup or log in again.",
        });
      // Option 2: Allow proceeding, but req.userProfile will be null (requires careful handling downstream)
      // req.userProfile = null;
      // next();
    } else {
      // Attach the found profile to the request object
      req.userProfile = userProfile;
      console.log(`Fetched UserProfile for ${req.user.email} in middleware.`);
      next(); // Proceed to the next middleware or route handler
    }
  } catch (error) {
    console.error(
      `FetchUserProfileMiddleware Error fetching profile for ${req.user.email}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Server error retrieving user profile data." });
  }
};

module.exports = fetchUserProfileMiddleware;
