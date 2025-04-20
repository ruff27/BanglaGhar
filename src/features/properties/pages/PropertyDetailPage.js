// src/features/Properties/PropertyDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  CardMedia,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Button,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
// Existing Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// New Icons (Examples - Use appropriate icons)
import WaterIcon from "@mui/icons-material/Water"; // Water source
import GasMeterIcon from "@mui/icons-material/GasMeter"; // Gas source
import BoltIcon from "@mui/icons-material/Bolt"; // Backup power
import SecurityIcon from "@mui/icons-material/Security"; // Security
import SchoolIcon from "@mui/icons-material/School"; // Nearby Schools
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // Nearby Hospitals
import StorefrontIcon from "@mui/icons-material/Storefront"; // Nearby Markets
import BalconyIcon from "@mui/icons-material/Balcony"; // Balcony
import GavelIcon from "@mui/icons-material/Gavel"; // Legal
import BuildIcon from "@mui/icons-material/Build"; // Condition
import ParkIcon from "@mui/icons-material/Park"; // Garden/Park
import AcUnitIcon from "@mui/icons-material/AcUnit"; // AC
import DeckIcon from "@mui/icons-material/Deck"; // Furnished status
import PoolIcon from "@mui/icons-material/Pool"; // Pool
import ElevatorIcon from "@mui/icons-material/Elevator"; // Lift (Example)

import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed
import useWishlist from "./../hooks/useWishlist"; // Adjust path if needed

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Helper to format price
const formatDisplayPrice = (price, listingType) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${
    listingType === "rent" ? "/mo" : ""
  }`;
};

// Helper to display formatted text or fallback
const displayText = (value, fallback = "N/A") => value || fallback;

// Helper to display boolean/enum/array values nicely
const formatFeatureText = (value, t) => {
  // Add translation function if needed
  if (value === true || value === "yes" || value === "clear") return "Yes"; // t('yes', 'Yes');
  if (value === false || value === "no") return "No"; // t('no', 'No');
  if (Array.isArray(value))
    return value.length > 0
      ? value.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")
      : "None"; // t('none', 'None');
  if (typeof value === "string" && value) {
    // Attempt translation for known enum values, otherwise capitalize
    // Example: return t(`enum_${value}`, value.charAt(0).toUpperCase() + value.slice(1));
    return value.charAt(0).toUpperCase() + value.slice(1); // Simple capitalize for now
  }
  return value ?? "N/A"; // t('na', 'N/A');
};

// Helper to create list items concisely
const DetailListItem = ({ icon, primary, secondary }) => {
  if (
    !secondary ||
    secondary === "N/A" ||
    secondary === "No" ||
    secondary === "None"
  )
    return null; // Don't render if value is trivial/missing
  return (
    <ListItem disablePadding>
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

const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetching Logic
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
        setProperty(response.data);
      } else {
        setError("Property not found.");
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  // Wishlist and Snackbar handlers
  const handleWishlistToggle = () => {
    if (!property || !property._id) return;
    toggleWishlist(property._id, (message, severity) => {
      setSnackbar({ open: true, message, severity });
    });
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --- Render Logic ---
  if (loading)
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
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
          Back
        </Button>
      </Container>
    );
  if (!property || typeof property !== "object")
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Property data not available.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Container>
    );

  // Prepare data for rendering
  const placeholderImg = `/pictures/placeholder.png`;
  const imgSrc =
    Array.isArray(property.images) && property.images.length > 0
      ? `/pictures/${property.images[0]}`
      : placeholderImg;
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };
  const isWishlisted = wishlistIds.has(property._id);

  // Construct location string
  const locationString =
    [
      property.addressLine1,
      property.addressLine2,
      property.upazila,
      property.cityTown,
      property.district,
      property.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Location details not available";

  const bdDetails = property.bangladeshDetails || {};
  const features = property.features || {};
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Listings
      </Button>
      <Paper elevation={3} sx={{ borderRadius: "12px", overflow: "hidden" }}>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={7}>
            <CardMedia
              component="img"
              image={imgSrc}
              alt={property.title || "Property image"}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: { xs: 300, md: 500 },
                objectFit: "cover",
              }}
            />
            {/* Consider Image Carousel Here */}
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Chip
                  label={formatFeatureText(property.listingType)}
                  size="small"
                  color={
                    property.listingType === "sold" ? "default" : "primary"
                  }
                  variant="filled"
                />
                <Tooltip
                  title={
                    isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                  arrow
                >
                  <span>
                    {" "}
                    {/* Span needed for tooltip on disabled button */}
                    <IconButton
                      onClick={handleWishlistToggle}
                      size="small"
                      disabled={loadingWishlist}
                    >
                      {isWishlisted ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Typography
                variant="h4"
                component="h1"
                fontWeight="600"
                gutterBottom
              >
                {displayText(property.title)}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: "1.1rem", mr: 0.5, color: "primary.main" }}
                />
                <Typography variant="body1">{locationString}</Typography>
              </Box>

              <Typography
                variant="h4"
                color="primary.main"
                fontWeight="700"
                sx={{ mb: 2 }}
              >
                {formatDisplayPrice(property.price, property.listingType)}
              </Typography>

              <Divider sx={{ my: 1 }} />

              {/* --- Overview Section --- */}
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {!isLandOrCommercial && (
                  <>
                    <Grid item xs={6} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <BedIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {displayText(property.bedrooms)} Beds
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <BathtubIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {displayText(property.bathrooms)} Baths
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SquareFootIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {displayText(property.area)} sqft
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HomeWorkIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {formatFeatureText(property.propertyType)}
                    </Typography>
                  </Box>
                </Grid>
                {!isLandOrCommercial && features.furnished !== "no" && (
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DeckIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {formatFeatureText(features.furnished)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {/* Add more standard features if desired */}
                {features.parking === true && !isLandOrCommercial && (
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {
                        /* Parking Icon Optional */ <HomeWorkIcon
                          color="action"
                          fontSize="small"
                        />
                      }
                      <Typography variant="body2">Parking</Typography>
                    </Box>
                  </Grid>
                )}
                {features.garden === true && !isLandOrCommercial && (
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ParkIcon color="action" fontSize="small" />
                      <Typography variant="body2">Garden</Typography>
                    </Box>
                  </Grid>
                )}
                {features.pool === true && !isLandOrCommercial && (
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PoolIcon color="action" fontSize="small" />
                      <Typography variant="body2">Pool</Typography>
                    </Box>
                  </Grid>
                )}
                {features.airConditioning === true && !isLandOrCommercial && (
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AcUnitIcon color="action" fontSize="small" />
                      <Typography variant="body2">AC</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 1 }} />

              {/* --- Description --- */}
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body2"
                paragraph
                sx={{ color: "text.secondary", whiteSpace: "pre-wrap", mb: 2 }}
              >
                {displayText(property.description, "No description available.")}
              </Typography>

              {/* --- Detailed Features Section --- */}
              <Typography variant="h6" gutterBottom>
                Details & Features
              </Typography>
              <Box
                sx={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  mb: 2,
                  pr: 1 /* For scrollbar */,
                }}
              >
                <List dense>
                  {/* Examples using DetailListItem helper */}
                  <DetailListItem
                    icon={<BuildIcon fontSize="small" />}
                    primary="Condition"
                    secondary={formatFeatureText(bdDetails.propertyCondition)}
                  />
                  {!isLandOrCommercial && (
                    <DetailListItem
                      icon={<BedIcon fontSize="small" />}
                      primary="Bedrooms"
                      secondary={displayText(property.bedrooms)}
                    />
                  )}
                  {!isLandOrCommercial && (
                    <DetailListItem
                      icon={<BathtubIcon fontSize="small" />}
                      primary="Bathrooms"
                      secondary={displayText(property.bathrooms)}
                    />
                  )}
                  <DetailListItem
                    icon={<SquareFootIcon fontSize="small" />}
                    primary="Area"
                    secondary={
                      property.area
                        ? `${displayText(property.area)} sqft`
                        : "N/A"
                    }
                  />
                  {!isLandOrCommercial && (
                    <DetailListItem
                      icon={<DeckIcon fontSize="small" />}
                      primary="Furnished Status"
                      secondary={formatFeatureText(features.furnished)}
                    />
                  )}
                  {!isLandOrCommercial && bdDetails.floorNumber && (
                    <DetailListItem
                      icon={<ElevatorIcon fontSize="small" />}
                      primary="Floor Number"
                      secondary={displayText(bdDetails.floorNumber)}
                    />
                  )}
                  {!isLandOrCommercial && bdDetails.totalFloors && (
                    <DetailListItem
                      icon={<ElevatorIcon fontSize="small" />}
                      primary="Total Floors"
                      secondary={displayText(bdDetails.totalFloors)}
                    />
                  )}

                  <Divider sx={{ my: 1 }} component="li" />

                  <DetailListItem
                    icon={<WaterIcon fontSize="small" />}
                    primary="Water Source"
                    secondary={formatFeatureText(bdDetails.waterSource)}
                  />
                  <DetailListItem
                    icon={<GasMeterIcon fontSize="small" />}
                    primary="Gas Source"
                    secondary={formatFeatureText(bdDetails.gasSource)}
                  />
                  {bdDetails.gasSource === "piped" && (
                    <DetailListItem
                      icon={<GasMeterIcon fontSize="small" />}
                      primary="Gas Line Installed"
                      secondary={formatFeatureText(bdDetails.gasLineInstalled)}
                    />
                  )}
                  <DetailListItem
                    icon={<BoltIcon fontSize="small" />}
                    primary="Backup Power"
                    secondary={formatFeatureText(bdDetails.backupPower)}
                  />
                  <DetailListItem
                    icon={<SecurityIcon fontSize="small" />}
                    primary="Security Features"
                    secondary={formatFeatureText(bdDetails.securityFeatures)}
                  />
                  <DetailListItem
                    icon={<BuildIcon fontSize="small" />}
                    primary="Earthquake Resistant"
                    secondary={formatFeatureText(
                      bdDetails.earthquakeResistance
                    )}
                  />
                  <DetailListItem
                    icon={<HomeWorkIcon fontSize="small" />}
                    primary="Parking Type"
                    secondary={formatFeatureText(bdDetails.parkingType)}
                  />
                  {!isLandOrCommercial && (
                    <DetailListItem
                      icon={<BalconyIcon fontSize="small" />}
                      primary="Balcony"
                      secondary={formatFeatureText(bdDetails.balcony)}
                    />
                  )}
                  {!isLandOrCommercial && (
                    <DetailListItem
                      icon={<DeckIcon fontSize="small" />}
                      primary="Rooftop Access"
                      secondary={formatFeatureText(bdDetails.rooftopAccess)}
                    />
                  )}

                  <Divider sx={{ my: 1 }} component="li" />

                  <DetailListItem
                    icon={<GavelIcon fontSize="small" />}
                    primary="Ownership Papers"
                    secondary={formatFeatureText(bdDetails.ownershipPapers)}
                  />
                  <DetailListItem
                    icon={<GavelIcon fontSize="small" />}
                    primary="Property Tenure"
                    secondary={formatFeatureText(bdDetails.propertyTenure)}
                  />

                  {/* Add more items for nearby amenities etc. */}
                  {bdDetails.nearbySchools && (
                    <DetailListItem
                      icon={<SchoolIcon fontSize="small" />}
                      primary="Nearby Schools"
                      secondary={displayText(bdDetails.nearbySchools)}
                    />
                  )}
                  {bdDetails.nearbyHospitals && (
                    <DetailListItem
                      icon={<LocalHospitalIcon fontSize="small" />}
                      primary="Nearby Hospitals"
                      secondary={displayText(bdDetails.nearbyHospitals)}
                    />
                  )}
                  {bdDetails.nearbyMarkets && (
                    <DetailListItem
                      icon={<StorefrontIcon fontSize="small" />}
                      primary="Nearby Markets"
                      secondary={displayText(bdDetails.nearbyMarkets)}
                    />
                  )}

                  {/* Add other fields from bangladeshDetails */}
                </List>
              </Box>

              {/* Contact Owner section */}
              <Box sx={{ mt: "auto", pt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact Owner/Agent
                </Typography>
                {/* TODO: Add actual contact display/button logic */}
                <Button variant="contained" fullWidth>
                  Show Contact Info
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PropertyDetailPage;
