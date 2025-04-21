// server/middleware/isAdminMiddleware.js

const isAdminMiddleware = (req, res, next) => {
  // Ensure fetchUserProfileMiddleware has run and attached userProfile
  if (!req.userProfile) {
    console.error(
      "[Admin Check Error] req.userProfile not found. Ensure fetchUserProfileMiddleware runs first."
    );
    // This indicates a problem earlier in the middleware chain
    return res
      .status(500)
      .json({ message: "User profile data is missing for admin check." });
  }

  if (req.userProfile.isAdmin === true) {
    // User is an admin, allow request to proceed
    console.log(`Admin access granted for user: ${req.userProfile.email}`);
    next();
  } else {
    // User is not an admin, send a 403 Forbidden response
    console.log(`Admin access denied for user: ${req.userProfile.email}`);
    res
      .status(403)
      .json({ message: "Access denied. Administrator privileges required." });
  }
};

module.exports = isAdminMiddleware;
