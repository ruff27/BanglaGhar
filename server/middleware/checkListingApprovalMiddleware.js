// server/middleware/checkListingApprovalMiddleware.js

const checkListingApprovalMiddleware = (req, res, next) => {
  // Ensure fetchUserProfileMiddleware has run and attached userProfile
  if (!req.userProfile) {
    console.error(
      "CheckListingApprovalMiddleware Error: req.userProfile not found. Ensure fetchUserProfileMiddleware runs first."
    );
    // This indicates a problem earlier in the middleware chain
    return res.status(500).json({ message: "User profile data is missing." });
  }

  const approvalStatus = req.userProfile.approvalStatus;

  if (approvalStatus === "approved") {
    // User is approved, allow request to proceed
    console.log(`User ${req.userProfile.email} is approved for listing.`);
    next();
  } else {
    // User is not approved, send a 403 Forbidden response
    console.log(
      `User ${req.userProfile.email} denied listing. Status: ${approvalStatus}`
    );
    let message = "Your account is not yet approved to list properties.";
    if (approvalStatus === "pending") {
      message = "Your listing request is pending approval.";
    } else if (approvalStatus === "rejected") {
      message =
        "Your listing request has been rejected. Please contact support.";
    } else if (approvalStatus === "not_started") {
      message =
        "Please submit your government ID for approval to list properties.";
    }
    res.status(403).json({ message: message });
  }
};

module.exports = checkListingApprovalMiddleware;
