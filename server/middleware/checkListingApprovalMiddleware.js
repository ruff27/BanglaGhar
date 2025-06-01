const checkListingApprovalMiddleware = (req, res, next) => {
  if (!req.userProfile) {
    console.error(
      "CheckListingApprovalMiddleware Error: req.userProfile not found. Ensure fetchUserProfileMiddleware runs first."
    );
    return res.status(500).json({ message: "User profile data is missing." });
  }

  const approvalStatus = req.userProfile.approvalStatus;

  if (approvalStatus === "approved") {
    console.log(`User ${req.userProfile.email} is approved for listing.`);
    next();
  } else {
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
