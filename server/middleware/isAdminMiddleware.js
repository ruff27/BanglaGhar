const isAdminMiddleware = (req, res, next) => {
  if (!req.userProfile) {
    console.error(
      "[Admin Check Error] req.userProfile not found. Ensure user exists in database and fetchUserProfileMiddleware ran correctly."
    );
    return res
      .status(403)
      .json({ message: "Forbidden: User profile data not available." });
  }

  if (req.userProfile.isAdmin) {
    console.log(
      `[Admin Check Success] User ${
        req.user.email || req.userProfile.email
      } is an admin.`
    ); 
    next();
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
