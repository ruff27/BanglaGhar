const UserProfile = require("../models/UserProfile");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Property = require("../models/property");
const mongoose = require("mongoose");
const { subDays } = require("date-fns");

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});
const S3_BUCKET = process.env.S3_BUCKET_NAME;

exports.getDashboardStats = async (req, res) => {
  try {
    const sevenDaysAgo = subDays(new Date(), 7);
    const [
      totalActiveListings,
      pendingUsersCount,
      totalUsersCount,
      recentListingsCount,
      recentUsersCount,
    ] = await Promise.all([
      Property.countDocuments({ isHidden: { $ne: true } }),
      UserProfile.countDocuments({ approvalStatus: "pending" }),
      UserProfile.countDocuments({}),
      Property.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      UserProfile.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);
    res.status(200).json({
      totalActiveListings,
      pendingUsersCount,
      totalUsersCount,
      recentListingsCount,
      recentUsersCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats." });
  }
};

exports.viewUserGovtId = async (req, res) => {
  const { userId } = req.params;
  if (!S3_BUCKET || !process.env.APP_AWS_REGION) {
    console.error("Server S3 configuration error viewing ID.");
    return res.status(500).json({ message: "Server configuration error." });
  }
  try {
    const userProfile = await UserProfile.findById(userId).select("govtIdUrl");
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    if (!userProfile.govtIdUrl) {
      return res
        .status(404)
        .json({ message: "Government ID not uploaded for this user." });
    }
    // Extract the S3 Key from the stored URL
    const urlParts = userProfile.govtIdUrl.split(".amazonaws.com/");
    if (urlParts.length < 2 || !urlParts[1]) {
      console.error(`Could not parse S3 key from URL: ${userProfile.govtIdUrl}`);
      return res.status(500).send("Error processing file location.");
    }
    const s3Key = decodeURIComponent(urlParts[1]);
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.redirect(signedUrl);
  } catch (error) {
    console.error(`Error generating signed URL for user ${userId}:`, error);
    if (error.name === "NoSuchKey") {
      res.status(404).send("File not found in storage.");
    } else if (error.name === "NotFound") {
      res.status(404).send("File not found.");
    } else if (error.name === "CastError") {
      res.status(400).send("Invalid user ID format.");
    } else {
      res.status(500).send("Server error retrieving file.");
    }
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await UserProfile.find({
      approvalStatus: "pending",
    }).select("name email createdAt govtIdUrl _id approvalStatus");
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Server error fetching pending users." });
  }
};

exports.getSignedIdUrlForAdmin = async (req, res) => {
  const { userId } = req.params;
  if (!S3_BUCKET) {
    console.error("Server S3 configuration error getting signed URL.");
    return res.status(500).json({ message: "Server configuration error." });
  }
  try {
    const userProfile = await UserProfile.findById(userId).select("govtIdUrl");
    if (!userProfile || !userProfile.govtIdUrl) {
      return res
        .status(404)
        .json({ message: "Government ID not found for this user." });
    }
    const urlParts = userProfile.govtIdUrl.split(".amazonaws.com/");
    if (urlParts.length < 2 || !urlParts[1]) {
      console.error(`Could not parse S3 key from URL: ${userProfile.govtIdUrl}`);
      return res
        .status(500)
        .json({ message: "Error processing file location." });
    }
    const s3Key = decodeURIComponent(urlParts[1]);
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.status(200).json({ signedUrl: signedUrl });
  } catch (error) {
    console.error(`Error generating signed URL for user ${userId} (admin request):`, error);
    if (error.name === "NoSuchKey" || error.name === "NotFound") {
      res.status(404).json({ message: "File not found in storage." });
    } else if (error.name === "CastError") {
      res.status(400).json({ message: "Invalid user ID format." });
    } else {
      res.status(500).json({ message: "Server error generating file URL." });
    }
  }
};

exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }
  try {
    const userProfile = await UserProfile.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    if (userProfile.approvalStatus !== "pending") {
      console.log(
        `User ${userId} is not pending approval (status: ${userProfile.approvalStatus}). No action taken.`
      );
      return res.status(200).json({
        message: `User is already ${userProfile.approvalStatus}.`,
        profile: userProfile,
      });
    }
    userProfile.approvalStatus = "approved";
    await userProfile.save();
    console.log(
      `Admin ${req.user.email} approved user ${userId} (${userProfile.email})`
    );
    res.status(200).json({ message: "User approved successfully.", profile: userProfile });
  } catch (error) {
    console.error(`Error approving user ${userId}:`, error);
    res.status(500).json({ message: "Server error approving user." });
  }
};

exports.rejectUser = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }
  try {
    const userProfile = await UserProfile.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    if (userProfile.approvalStatus !== "pending") {
      console.log(
        `User ${userId} is not pending approval (status: ${userProfile.approvalStatus}). No action taken.`
      );
      return res.status(200).json({
        message: `User is already ${userProfile.approvalStatus}.`,
        profile: userProfile,
      });
    }
    userProfile.approvalStatus = "rejected";
    await userProfile.save();
    console.log(
      `Admin ${req.user.email} rejected user ${userId} (${userProfile.email})`
    );
    res.status(200).json({ message: "User rejected successfully.", profile: userProfile });
  } catch (error) {
    console.error(`Error rejecting user ${userId}:`, error);
    res.status(500).json({ message: "Server error rejecting user." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const sortField = req.query.sort || "displayName";
    const sortOrder = req.query.order === "desc" ? -1 : 1;
    const searchTerm = req.query.search || "";
    const statusFilter = req.query.status || "";
    const skip = (page - 1) * limit;
    let filterQuery = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      filterQuery.$or = [
        { name: regex },
        { displayName: regex },
        { email: regex },
      ];
    }
    if (
      statusFilter &&
      ["not_started", "pending", "approved", "rejected"].includes(statusFilter)
    ) {
      filterQuery.approvalStatus = statusFilter;
    }
    const sortObject = {};
    sortObject[sortField] = sortOrder;
    if (sortField !== "_id") {
      sortObject["_id"] = 1;
    }
    const totalUsers = await UserProfile.countDocuments(filterQuery);
    const users = await UserProfile.find(filterQuery)
      .select(
        "name displayName email createdAt isAdmin approvalStatus accountStatus _id"
      )
      .sort(sortObject)
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      users: users,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error fetching users." });
  }
};

exports.updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isAdmin, approvalStatus, accountStatus } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }
  const updates = {};
  if (typeof isAdmin === "boolean") {
    updates.isAdmin = isAdmin;
  }
  if (
    approvalStatus &&
    ["not_started", "pending", "approved", "rejected"].includes(approvalStatus)
  ) {
    updates.approvalStatus = approvalStatus;
  }
  if (
    accountStatus &&
    ["active", "blocked"].includes(accountStatus)
  ) {
    updates.accountStatus = accountStatus;
  }
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }
  try {
    const userProfile = await UserProfile.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    if (req.userProfile && req.userProfile._id.toString() === userId) {
      if (
        updates.hasOwnProperty("isAdmin") &&
        updates.isAdmin !== req.userProfile.isAdmin
      ) {
        console.warn(`Admin ${req.user.email} attempted to change their own admin status via bulk update route.`);
        return res.status(403).json({
          message: "Cannot change your own admin status using this control.",
        });
      }
      if (
        updates.hasOwnProperty("accountStatus") &&
        updates.accountStatus === "blocked"
      ) {
        console.warn(`Admin ${req.user.email} attempted to block their own account via admin update route.`);
        return res.status(403).json({
          message: "You cannot block your own account.",
        });
      }
    }
    Object.assign(userProfile, updates);
    const updatedUserProfile = await userProfile.save();
    console.log(
      `Admin ${req.user.email} updated status for user ${userId}. New status:`,
      updates
    );
    const responseProfile = await UserProfile.findById(userId).select(
      "name email createdAt displayName isAdmin approvalStatus accountStatus _id "
    );
    res.status(200).json({
      message: "User status updated successfully.",
      user: responseProfile,
    });
  } catch (error) {
    console.error(`Error updating status for user ${userId}:`, error);
    res.status(500).json({ message: "Server error updating user status." });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const searchTerm = req.query.search || "";
    const filterListingType = req.query.listingType || "";
    const filterPropertyType = req.query.propertyType || "";
    const filterIsHidden = req.query.isHidden;
    const filterIsFeatured = req.query.isFeatured;
    const skip = (page - 1) * limit;
    let filterQuery = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      filterQuery.$or = [
        { title: regex },
        { addressLine1: regex },
        { cityTown: regex },
        { upazila: regex },
        { district: regex },
        { createdBy: regex },
      ];
    }
    if (
      filterListingType &&
      ["rent", "buy", "sold"].includes(filterListingType)
    ) {
      filterQuery.listingType = filterListingType;
    }
    if (
      filterPropertyType &&
      ["apartment", "house", "condo", "land", "commercial"].includes(
        filterPropertyType
      )
    ) {
      filterQuery.propertyType = filterPropertyType;
    }
    if (filterIsHidden === "true") {
      filterQuery.isHidden = true;
    } else if (filterIsHidden === "false") {
      filterQuery.isHidden = { $ne: true };
    }
    if (filterIsFeatured === "true") {
      filterQuery.featuredAt = { $ne: null };
    } else if (filterIsFeatured === "false") {
      filterQuery.featuredAt = null;
    }
    const sortObject = {};
    sortObject[sortField] = sortOrder;
    if (sortField !== "_id") {
      sortObject["_id"] = 1;
    }
    const totalListings = await Property.countDocuments(filterQuery);
    const listings = await Property.find(filterQuery)
      .select(
        "title price addressLine1 cityTown district upazila propertyType listingType createdBy createdAt images isHidden featuredAt"
      )
      .sort(sortObject)
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalListings / limit);
    res.status(200).json({
      listings: listings,
      currentPage: page,
      totalPages: totalPages,
      totalListings: totalListings,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching all listings for admin:", error);
    res.status(500).json({ message: "Server error fetching listings." });
  }
};

exports.updateListingVisibility = async (req, res) => {
  const { listingId } = req.params;
  const { isHidden } = req.body;
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res.status(400).json({ message: "Invalid listing ID format." });
  }
  if (typeof isHidden !== "boolean") {
    return res
      .status(400)
      .json({ message: "Invalid value for isHidden. Must be true or false." });
  }
  try {
    const property = await Property.findById(listingId);
    if (!property) {
      return res.status(404).json({ message: "Property listing not found." });
    }
    property.isHidden = isHidden;
    await property.save();
    console.log(
      `Admin ${req.user.email} updated visibility for listing ${listingId} to isHidden=${isHidden}.`
    );
    res.status(200).json({
      message: `Listing visibility updated successfully.`,
      listing: { _id: property._id, isHidden: property.isHidden },
    });
  } catch (error) {
    console.error(`Error updating visibility for listing ${listingId}:`, error);
    res
      .status(500)
      .json({ message: "Server error updating listing visibility." });
  }
};

exports.featureListing = async (req, res) => {
  const { listingId } = req.params;
  const { feature } = req.body;
  const FEATURE_LIMIT = 25;
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res.status(400).json({ message: "Invalid listing ID format." });
  }
  if (typeof feature !== "boolean") {
    return res.status(400).json({
      message: "Invalid value for feature flag. Must be true or false.",
    });
  }
  try {
    const property = await Property.findById(listingId);
    if (!property) {
      return res.status(404).json({ message: "Property listing not found." });
    }
    if (feature) {
      // Enforce feature limit
      if (property.featuredAt !== null) {
        console.log(`Listing ${listingId} is already featured.`);
        return res.status(200).json({
          message: "Listing is already featured.",
          listing: { _id: property._id, featuredAt: property.featuredAt },
        });
      }
      const currentFeaturedCount = await Property.countDocuments({
        featuredAt: { $ne: null },
        _id: { $ne: listingId },
      });
      if (currentFeaturedCount >= FEATURE_LIMIT) {
        const excessCount = currentFeaturedCount - FEATURE_LIMIT + 1;
        console.log(`Featured limit (${FEATURE_LIMIT}) reached. Removing ${excessCount} oldest featured listing(s).`);
        const oldestFeatured = await Property.find({
          featuredAt: { $ne: null },
          _id: { $ne: listingId },
        })
          .sort({ featuredAt: 1 })
          .limit(excessCount)
          .select("_id featuredAt");
        const idsToUnfeature = oldestFeatured.map((p) => p._id);
        if (idsToUnfeature.length > 0) {
          const updateResult = await Property.updateMany(
            { _id: { $in: idsToUnfeature } },
            { $set: { featuredAt: null } }
          );
          console.log(
            `Unfeatured ${updateResult.modifiedCount} oldest listing(s).`
          );
        }
      }
      property.featuredAt = new Date();
    } else {
      property.featuredAt = null;
    }
    await property.save();
    const action = feature ? "featured" : "unfeatured";
    console.log(`Admin ${req.user.email} ${action} listing ${listingId}.`);
    res.status(200).json({
      message: `Listing ${action} successfully.`,
      listing: { _id: property._id, featuredAt: property.featuredAt },
    });
  } catch (error) {
    console.error(`Error updating feature status for listing ${listingId}:`, error);
    res.status(500).json({ message: "Server error updating feature status." });
  }
};

exports.deleteMultipleListings = async (req, res) => {
  const { listingIds } = req.body;
  if (!Array.isArray(listingIds) || listingIds.length === 0) {
    return res.status(400).json({
      message:
        "Invalid request: Listing IDs must be provided as a non-empty array.",
    });
  }
  const validIds = listingIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  if (validIds.length !== listingIds.length) {
    console.warn("Admin delete request contained invalid IDs. Only valid IDs will be processed.");
  }
  if (validIds.length === 0) {
    return res.status(400).json({ message: "No valid listing IDs provided." });
  }
  try {
    const deleteResult = await Property.deleteMany({
      _id: { $in: validIds },
    });
    if (deleteResult.deletedCount === 0) {
      console.log(
        `Admin ${req.user.email} attempted to delete listings, but none matched the provided IDs:`,
        validIds
      );
      return res
        .status(404)
        .json({ message: "No matching listings found to delete." });
    }
    console.log(
      `Admin ${req.user.email} deleted ${deleteResult.deletedCount} listing(s):`,
      validIds
    );
    res.status(200).json({
      message: `${deleteResult.deletedCount} listing(s) deleted successfully.`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting multiple listings:", error);
    res.status(500).json({ message: "Server error during bulk deletion." });
  }
};
