// server/middleware/isAdminMiddleware.js

const isAdminMiddleware = (req, res, next) => {
  // Check if fetchUserProfileMiddleware successfully attached the profile
  if (!req.userProfile) {
    // This might happen if the user exists in Cognito but not in your UserProfile DB,
    // or if fetchUserProfileMiddleware had an error.
    console.error(
      "[Admin Check Error] req.userProfile not found. Ensure user exists in database and fetchUserProfileMiddleware ran correctly."
    );
    return res
      .status(403)
      .json({ message: "Forbidden: User profile data not available." });
  }

  // Now safely check the isAdmin flag
  if (req.userProfile.isAdmin) {
    console.log(
      `[Admin Check Success] User ${
        req.user.email || req.userProfile.email
      } is an admin.`
    ); // Log email for clarity
    next(); // User is admin, proceed
  } else {
    console.warn(
      `[Admin Check Failed] User ${
        req.user.email || req.userProfile.email
      } is not an admin.`
    );
    res.status(403).json({ message: "Forbidden: Requires admin privileges." }); // User is not admin
  }
};

module.exports = isAdminMiddleware;
