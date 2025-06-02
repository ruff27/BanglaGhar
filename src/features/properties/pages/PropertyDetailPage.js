import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useNavigate,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import WaterIcon from "@mui/icons-material/Water";
import GasMeterIcon from "@mui/icons-material/GasMeter";
import BoltIcon from "@mui/icons-material/Bolt";
import GavelIcon from "@mui/icons-material/Gavel";
import BuildIcon from "@mui/icons-material/Build";
import ParkIcon from "@mui/icons-material/Park";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import DeckIcon from "@mui/icons-material/Deck";
import PoolIcon from "@mui/icons-material/Pool";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import MapIcon from "@mui/icons-material/Map";

import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import useWishlist from "./../hooks/useWishlist";
import { initiateOrGetConversation } from "../../chat/services/chatService";
import { useSnackbar } from "../../../context/SnackbarContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Helper functions (formatDisplayPrice, displayText, etc.) remain the same
const formatDisplayPrice = (price, listingType) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${
    listingType === "rent" ? "/mo" : ""
  }`;
};

const displayText = (value, fallback = "N/A") => value || fallback;

const formatFeatureText = (value, t) => {
  if (value === true || value === "yes" || value === "clear") return "Yes";
  if (value === false || value === "no") return "No";
  if (Array.isArray(value))
    return value.length > 0
      ? value.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")
      : "None";
  if (typeof value === "string" && value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value ?? "N/A";
};

const getPropertyPosition = (property) => {
  if (!property) return null;
  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    return {
      lat: property.position.lat,
      lng: property.position.lng,
    };
  }
  if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    return {
      lat: property.latitude,
      lng: property.longitude,
    };
  }
  return null;
};

const constructLocationString = (property) => {
  if (!property) return "Location unavailable";
  if (property.address) return property.address;
  if (property.location) return property.location;
  const locationParts = [
    property.addressLine1,
    property.addressLine2,
    property.upazila,
    property.cityTown,
    property.district,
    property.postalCode,
  ].filter(Boolean);
  return locationParts.length > 0
    ? locationParts.join(", ")
    : "Location details not available";
};

const getLocationAccuracyInfo = (accuracy) => {
  switch (accuracy) {
    case "precise":
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        color: "success",
        text: "precise",
        label: "P",
      };
    case "approximate":
      return {
        icon: <WarningIcon fontSize="small" />,
        color: "warning",
        text: "approximate",
        label: "A",
      };
    case "district-level":
      return {
        icon: <ErrorIcon fontSize="small" />,
        color: "error",
        text: "district-level",
        label: "D",
      };
    default:
      return {
        icon: <InfoIcon fontSize="small" />,
        color: "default",
        text: "unknown",
        label: "U",
      };
  }
};

const DetailListItem = ({ icon, primary, secondary }) => {
  if (
    !secondary ||
    secondary === "N/A" ||
    secondary === "No" ||
    secondary === "None"
  )
    return null;
  return (
    <ListItem disablePadding sx={{ pb: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
        secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
      />
    </ListItem>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-detail-tabpanel-${index}`}
      aria-labelledby={`property-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: { xs: 2, md: 3 }, pb: 2, px: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PropertyDetailPage = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, idToken, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const [contactLoading, setContactLoading] = useState(false);
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist();
  const theme = useTheme();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchPropertyDetails = useCallback(async () => {
    if (!propertyId) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/properties/${propertyId}`
      );
      if (response.data) {
        const fetchedProperty = response.data;
        setSelectedImageIndex(0); // Reset for new property
        const positionData = getPropertyPosition(fetchedProperty);
        if (!positionData) {
          if (
            fetchedProperty.locationAccuracy === "district-level" &&
            fetchedProperty.district
          ) {
            fetchedProperty.position = {
              lat: 23.8103 + (Math.random() * 0.1 - 0.05),
              lng: 90.4125 + (Math.random() * 0.1 - 0.05),
            };
          } else {
            fetchedProperty.position = {
              lat: 23.8103 + (Math.random() * 0.1 - 0.05),
              lng: 90.4125 + (Math.random() * 0.1 - 0.05),
            };
            if (!fetchedProperty.locationAccuracy) {
              fetchedProperty.locationAccuracy = "approximate";
            }
          }
        }
        setProperty(fetchedProperty);
      } else {
        setError("Property not found.");
      }
    } catch (err) {
      if (err.response) {
        setError(
          `Failed to load property details. Server responded with: ${err.response.status} ${err.response.statusText}`
        );
      } else if (err.request) {
        setError(
          "Failed to load property details. No response received from server."
        );
      } else {
        setError(`Failed to load property details. ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  const handleWishlistToggle = () => {
    if (!property || !property._id) return;
    toggleWishlist(property._id, (message, severity) => {
      showSnackbar(message, severity);
    });
  };

  const handleOpenMap = () => {
    if (property && property._id) {
      navigate(`/map/${property._id}`);
    } else {
      showSnackbar(
        "Location data for this property is not available or invalid.",
        "warning"
      );
    }
  };

  const handleContactAdvertiser = async () => {
    if (!isLoggedIn || !idToken || !user || !user.cognitoSub) {
      showSnackbar("Please log in to contact the advertiser.", "warning");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    const advertiserId = property?.createdBy?._id || property?.createdBy;
    if (!advertiserId) {
      showSnackbar(
        "Advertiser information is missing for this property.",
        "error"
      );
      return;
    }
    if (user._id && user._id.toString() === advertiserId.toString()) {
      showSnackbar(
        "You cannot start a conversation about your own listing.",
        "info"
      );
      return;
    }
    setContactLoading(true);
    try {
      const conversation = await initiateOrGetConversation(
        idToken,
        advertiserId,
        property._id
      );
      showSnackbar(
        `Chat ready! ID: ${conversation._id}. Navigating...`,
        "success"
      );
      navigate("/chat", {
        state: {
          conversationId: conversation._id,
          initialConversationData: conversation,
        },
      });
    } catch (err) {
      showSnackbar(err.message || "Could not start conversation.", "error");
    } finally {
      setContactLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // --- IMAGE LOGIC FROM FIRST FILE ---
  const placeholderImg = `/pictures/placeholder.png`;
  let mainImageSrc = placeholderImg;

  if (Array.isArray(property?.images) && property.images.length > 0) {
    const selectedImg = property.images[selectedImageIndex];
    if (
      selectedImg &&
      (selectedImg.startsWith("http://") || selectedImg.startsWith("https://"))
    ) {
      mainImageSrc = selectedImg;
    } else if (selectedImg) {
      console.warn("Image URL does not start with http(s):", selectedImg);
    }
  }

  const handleImageError = (e) => {
    console.error(
      "Error loading main property image, falling back to placeholder. Failed URL:",
      e.target.src
    );
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };
  // --- END IMAGE LOGIC FROM FIRST FILE ---

  if (loading || isAuthLoading)
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t("loading", "Loading...")}</Typography>
      </Container>
    );
  if (error)
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          {t("back_button", "Back")}
        </Button>
      </Container>
    );
  if (!property || typeof property !== "object")
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">
          {t("property_not_available", "Property data not available.")}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          {t("back_button", "Back")}
        </Button>
      </Container>
    );

  const isWishlisted = wishlistIds.has(property._id);
  const locationString = constructLocationString(property);
  const locationAccuracy = property.locationAccuracy || "unknown";
  const accuracyInfo = getLocationAccuracyInfo(locationAccuracy);
  const bdDetails = property.bangladeshDetails || {};
  const features = property.features || {};
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  const isOwnListing =
    isLoggedIn &&
    property?.createdBy &&
    user?._id &&
    ((property.createdBy._id && property.createdBy._id === user._id) ||
      property.createdBy === user._id);

  let statusChipColor = "default";
  let statusChipIcon = <HelpOutlineIcon fontSize="small" />;
  let statusLabel = property.listingStatus
    ? property.listingStatus.charAt(0).toUpperCase() +
      property.listingStatus.slice(1)
    : "Unknown";

  switch (property.listingStatus) {
    case "available":
      statusChipColor = "success";
      statusChipIcon = <CheckCircleIcon fontSize="small" />;
      statusLabel = t("status_available", "Available");
      break;
    case "sold":
      statusChipColor = "error";
      statusChipIcon = <RemoveShoppingCartIcon fontSize="small" />;
      statusLabel = t("status_sold", "Sold");
      break;
    case "rented":
      statusChipColor = "warning";
      statusChipIcon = <EventBusyIcon fontSize="small" />;
      statusLabel = t("status_rented", "Rented");
      break;
    case "unavailable":
      statusChipColor = "default";
      statusChipIcon = <HelpOutlineIcon fontSize="small" />;
      statusLabel = t("status_unavailable", "Unavailable");
      break;
    default:
      statusLabel = t("status_unknown", "Unknown Status");
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: { xs: 2, md: 3 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: { xs: 2, md: 3 },
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          {t("back_to_listings", "Back to Listings")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={handleOpenMap}
        >
          {t("view_on_map", "View on Map")}
        </Button>
      </Box>

      {(locationAccuracy === "district-level" ||
        locationAccuracy === "approximate") && (
        <Alert
          severity={locationAccuracy === "district-level" ? "error" : "warning"}
          icon={accuracyInfo.icon}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {locationAccuracy === "district-level"
            ? t(
                "district_level_warning_detail",
                "This property listing has only district-level location information. The exact property location may be elsewhere in this district."
              )
            : t(
                "approximate_location_warning_detail",
                "This property listing has an approximate location. The exact property may be nearby but not at the exact point shown on the map."
              )}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* --- MAIN IMAGE AND THUMBNAILS SECTION --- */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              background: theme.palette.grey[100],
            }}
          >
            <CardMedia
              component="img"
              image={mainImageSrc}
              alt={property.title || t("property_image_alt", "Property image")}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: { xs: 300, sm: 400, md: 520 },
                objectFit: "cover",
                display: "block",
                transition: "opacity 0.3s ease-in-out",
              }}
            />
            <Tooltip
              title={
                isWishlisted
                  ? t("remove_from_wishlist", "Remove from Wishlist")
                  : t("add_to_wishlist", "Add to Wishlist")
              }
              arrow
            >
              <IconButton
                onClick={handleWishlistToggle}
                disabled={loadingWishlist}
                size="large"
                sx={{
                  position: "absolute",
                  top: { xs: 8, md: 16 },
                  right: { xs: 8, md: 16 },
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                }}
              >
                {isWishlisted ? (
                  <FavoriteIcon sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { height: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.grey[400],
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: theme.palette.grey[200],
                  borderRadius: "4px",
                },
              }}
            >
              {property.images.map((imgUrl, index) => {
                const isValidUrl =
                  typeof imgUrl === "string" &&
                  (imgUrl.startsWith("http://") ||
                    imgUrl.startsWith("https://"));
                const thumbnailUrl = isValidUrl ? imgUrl : placeholderImg;

                return (
                  <Box
                    key={index}
                    component="img"
                    src={thumbnailUrl}
                    alt={`${t("thumbnail_alt", "Thumbnail")} ${index + 1}`}
                    onClick={() => handleThumbnailClick(index)}
                    sx={{
                      width: { xs: 70, sm: 90, md: 100 },
                      height: { xs: 50, sm: 60, md: 70 },
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border:
                        selectedImageIndex === index
                          ? `3px solid ${theme.palette.primary.main}`
                          : `3px solid transparent`,
                      transition: "border-color 0.2s ease, transform 0.2s ease",
                      flexShrink: 0,
                      "&:hover": {
                        borderColor:
                          selectedImageIndex !== index
                            ? theme.palette.primary.light
                            : theme.palette.primary.main,
                        transform: "scale(1.05)",
                      },
                    }}
                    onError={(e) => {
                      if (e.target.src !== placeholderImg) {
                        e.target.onerror = null;
                        e.target.src = placeholderImg;
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: "12px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ lineHeight: 1.3 }}
              >
                {displayText(property.title)}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  color: "text.secondary",
                  mb: 2,
                  flexWrap: "nowrap",
                }}
              >
                <LocationOnIcon
                  sx={{
                    fontSize: "1.2rem",
                    mr: 0.75,
                    mt: "3px",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ mr: 1, lineHeight: 1.5 }}>
                    {locationString}
                  </Typography>
                  <Tooltip
                    title={t(
                      `location_accuracy_${accuracyInfo.text}`,
                      `${
                        locationAccuracy.charAt(0).toUpperCase() +
                        locationAccuracy.slice(1)
                      } Location`
                    )}
                    arrow
                  >
                    <Chip
                      size="small"
                      color={accuracyInfo.color}
                      label={accuracyInfo.label}
                      sx={{
                        height: 18,
                        minWidth: 18,
                        width: 18,
                        "& .MuiChip-label": {
                          p: 0,
                          fontSize: "0.65rem",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Typography
                variant="h4"
                color="primary.main"
                fontWeight="bold"
                sx={{ my: { xs: 2, md: 2.5 } }}
              >
                {formatDisplayPrice(
                  property.price,
                  property.listingType || property.mode
                )}
              </Typography>
              <Grid
                container
                spacing={{ xs: 1.5, md: 2 }}
                sx={{ mb: { xs: 2, md: 2.5 } }}
              >
                {!isLandOrCommercial && (
                  <>
                    <Grid item xs={6} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <BedIcon color="action" fontSize="small" />
                        <Typography variant="body1" fontWeight="500">
                          {displayText(property.bedrooms)} {t("beds", "Beds")}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <BathtubIcon color="action" fontSize="small" />
                        <Typography variant="body1" fontWeight="500">
                          {displayText(property.bathrooms)}{" "}
                          {t("baths", "Baths")}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={6} sm={6}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <SquareFootIcon color="action" fontSize="small" />
                    <Typography variant="body1" fontWeight="500">
                      {displayText(property.area)} {t("sqft", "sqft")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <HomeWorkIcon color="action" fontSize="small" />
                    <Typography variant="body1" fontWeight="500">
                      {formatFeatureText(property.propertyType)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                  mb: { xs: 2, md: 2.5 },
                }}
              >
                <Chip
                  label={formatFeatureText(
                    property.listingType || property.mode
                  )}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: "medium", borderRadius: "8px" }}
                />
                <Chip
                  icon={statusChipIcon}
                  label={statusLabel}
                  size="small"
                  color={statusChipColor}
                  variant="outlined"
                  sx={{ fontWeight: "medium", borderRadius: "8px" }}
                />
              </Box>
              {property.createdBy && (
                <>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {t("property_listed_by_short", "Listed by:")}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {property.createdBy.displayName ||
                        property.createdBy.name ||
                        t("unknown_lister", "Unknown User")}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <Box sx={{ mt: property.createdBy ? 1 : "auto" }}>
              {isAuthLoading ? (
                <CircularProgress
                  size={24}
                  sx={{ display: "block", margin: "auto" }}
                />
              ) : isOwnListing ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", fontStyle: "italic", py: 1 }}
                >
                  {t("this_is_your_listing_message", "This is your listing.")}
                </Typography>
              ) : isLoggedIn ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={
                    contactLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <MailOutlineIcon />
                    )
                  }
                  onClick={handleContactAdvertiser}
                  disabled={contactLoading || !property?.createdBy}
                  sx={{
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {contactLoading
                    ? t("processing", "Processing...")
                    : t("message_advertiser", "Message Advertiser")}
                </Button>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, textAlign: "center", py: 1 }}
                >
                  {t("please", "Please")}{" "}
                  <RouterLink to="/login" state={{ from: location.pathname }}>
                    {t("log_in_link", "log in")}
                  </RouterLink>{" "}
                  {t("to_contact_advertiser", "to contact the advertiser.")}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={3}
        sx={{ p: { xs: 0, sm: 1, md: 2 }, borderRadius: "12px", mb: 3 }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: { xs: 1, sm: 1, md: 0 },
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label={t(
              "property_details_tabs_label",
              "Property details tabs"
            )}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={t("description_tab", "Description")}
              id="property-detail-tab-0"
              aria-controls="property-detail-tabpanel-0"
            />
            <Tab
              label={t("features_amenities_tab", "Features & Amenities")}
              id="property-detail-tab-1"
              aria-controls="property-detail-tabpanel-1"
            />
            <Tab
              label={t("more_details_tab", "More Details")}
              id="property-detail-tab-2"
              aria-controls="property-detail-tabpanel-2"
            />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight="medium"
            gutterBottom
          >
            {t("property_description_heading", "Property Description")}
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: "text.secondary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
            }}
          >
            {displayText(
              property.description,
              t("no_description_available", "No description available.")
            )}
          </Typography>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight="medium"
            gutterBottom
          >
            {t("general_features_heading", "General Features & Amenities")}
          </Typography>
          <List dense>
            {!isLandOrCommercial && features.furnished !== "no" && (
              <DetailListItem
                icon={<DeckIcon fontSize="small" />}
                primary={t("furnished_status", "Furnished Status")}
                secondary={formatFeatureText(features.furnished)}
              />
            )}
            {features.parking && !isLandOrCommercial && (
              <DetailListItem
                icon={<HomeWorkIcon fontSize="small" />}
                primary={t("parking_available", "Parking")}
                secondary={t("yes", "Yes")}
              />
            )}
            {features.garden && !isLandOrCommercial && (
              <DetailListItem
                icon={<ParkIcon fontSize="small" />}
                primary={t("garden_available", "Garden")}
                secondary={t("yes", "Yes")}
              />
            )}
            {features.pool && !isLandOrCommercial && (
              <DetailListItem
                icon={<PoolIcon fontSize="small" />}
                primary={t("pool_available", "Pool")}
                secondary={t("yes", "Yes")}
              />
            )}
            {features.airConditioning && !isLandOrCommercial && (
              <DetailListItem
                icon={<AcUnitIcon fontSize="small" />}
                primary={t("air_conditioning", "Air Conditioning")}
                secondary={t("yes", "Yes")}
              />
            )}
          </List>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight="medium"
            gutterBottom
          >
            {t("more_details_heading", "More Details")}
          </Typography>
          <List dense>
            <DetailListItem
              icon={accuracyInfo.icon}
              primary={t("location_accuracy_label", "Location Accuracy")}
              secondary={t(
                `location_accuracy_${accuracyInfo.text}_full`,
                `${
                  locationAccuracy.charAt(0).toUpperCase() +
                  locationAccuracy.slice(1)
                } Location`
              )}
            />
            <DetailListItem
              icon={<BuildIcon fontSize="small" />}
              primary={t("property_condition", "Property Condition")}
              secondary={formatFeatureText(bdDetails.propertyCondition)}
            />
            <DetailListItem
              icon={<GavelIcon fontSize="small" />}
              primary={t("legal_status", "Legal Status")}
              secondary={formatFeatureText(bdDetails.legalStatus)}
            />
            <DetailListItem
              icon={<WaterIcon fontSize="small" />}
              primary={t("water_supply", "Water Supply")}
              secondary={formatFeatureText(bdDetails.waterSupply)}
            />
            <DetailListItem
              icon={<GasMeterIcon fontSize="small" />}
              primary={t("gas_supply", "Gas Supply")}
              secondary={formatFeatureText(bdDetails.gasSupply)}
            />
            <DetailListItem
              icon={<BoltIcon fontSize="small" />}
              primary={t("electricity_supply", "Electricity")}
              secondary={formatFeatureText(bdDetails.electricity)}
            />
          </List>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PropertyDetailPage;
