// src/pages/Properties.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  useMediaQuery,
  useTheme,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Fuse from "fuse.js";
import axios from "axios";
import { useAuth } from "./AuthContext";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Landscape as LandscapeIcon,
  SortRounded as SortIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Apartment as ApartmentIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Define API base URL as a constant
const API_BASE_URL = "http://localhost:5001/api";

// Price formatter helper function
const formatPrice = (price, mode) => {
  if (mode === "rent") {
    // treat as Taka
    return `৳${price.toLocaleString()}/mo`;
  } else {
    // treat as Lakh
    if (price >= 100) {
      const crore = price / 100;
      return `৳${crore.toFixed(crore % 1 === 0 ? 0 : 2)} Crore`;
    } else {
      return `৳${price} Lakh`;
    }
  }
};

// Sample land properties data
const getSampleLandProperties = (mode) => {
  const landProperties = [
    {
      _id: "60d0fe4f5311236168a109ca", // valid ObjectId string (24 hex characters)
      title: "Prime Land in Gulshan",
      location: "Gulshan Avenue, Dhaka",
      price: mode === "rent" ? 50000 : 200, // 50k Taka rent or 200 Lakh purchase
      area: 10000,
      propertyType: "Land",
      pricePerUnit: mode === "rent" ? "5 Tk/sqft/month" : "2000 Tk/sqft",
      description:
        "Premium land plot in upscale Gulshan area, perfect for commercial development.",
      images: ["land.jpg"],
      featured: true,
    },
    {
      _id: "60d0fe4f5311236168a109cb",
      title: "Residential Plot in Uttara",
      location: "Sector 10, Uttara, Dhaka",
      price: mode === "rent" ? 35000 : 150, // 35k Taka rent or 150 Lakh purchase
      area: 7200,
      propertyType: "Land",
      pricePerUnit: mode === "rent" ? "4.9 Tk/sqft/month" : "2083 Tk/sqft",
      description:
        "Well-connected residential plot in Uttara with all utilities ready.",
      images: ["land.jpg"],
      featured: false,
    },
    {
      _id: "60d0fe4f5311236168a109cc",
      title: "Commercial Land in Motijheel",
      location: "Motijheel C/A, Dhaka",
      price: mode === "rent" ? 90000 : 280, // 90k Taka rent or 280 Lakh purchase
      area: 8500,
      propertyType: "Land",
      pricePerUnit: mode === "rent" ? "10.6 Tk/sqft/month" : "3294 Tk/sqft",
      description:
        "Prime commercial land in Dhaka's business district with excellent frontage.",
      images: ["dhaka2.jpg"],
      featured: true,
    },
  ];

  // Define building sample properties with valid _id strings:
  const buildingProperties = [
    {
      _id: "60d0fe4f5311236168a109cd",
      title: "Luxury Apartment in Banani",
      location: "Banani, Dhaka",
      price: mode === "rent" ? 75000 : 180,
      area: 2200,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      description:
        "Modern luxury apartment with spacious rooms and premium finishes in Banani.",
      images: ["house1.png"],
      featured: true,
    },
    {
      _id: "60d0fe4f5311236168a109ce",
      title: "Family House in Dhanmondi",
      location: "Dhanmondi, Dhaka",
      price: mode === "rent" ? 90000 : 250,
      area: 3200,
      propertyType: "House",
      bedrooms: 4,
      bathrooms: 3,
      description:
        "Spacious family house in a quiet street with garden and parking.",
      images: ["house1.jpg"],
      featured: false,
    },
  ];

  // Combine land and building sample properties and explicitly set their mode:
  const allSampleProperties = [...landProperties, ...buildingProperties].map(
    (prop) => ({
      ...prop,
      mode: mode, // Ensure each sample property has the correct mode ("rent", "buy", or "sold")
    })
  );

  return allSampleProperties;
};

// Property Card Component
const PropertyCard = ({
  property,
  mode,
  isWishlisted,
  onToggleWishlist,
  isLoggedIn,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Get appropriate image for property
  const getPropertyImage = () => {
    // Use specified image for Land properties if available or fallback
    if (property.propertyType === "Land") {
      if (property.images && property.images.length > 0) {
        return `/pictures/${property.images[0]}`;
      }
      return "/pictures/land.jpg"; // Default land image
    }

    // For non-Land properties, use first image or placeholder
    if (property.images && property.images.length > 0) {
      return `/pictures/${property.images[0]}`;
    }
    return "/pictures/placeholder.png";
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isLoggedIn) {
      onToggleWishlist(property._id);
    } else {
      navigate("/login", { state: { from: window.location.pathname } });
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={() => {
        if (onViewDetails) {
          onViewDetails(property);
        } else {
          navigate(`/properties/${property._id}`);
        }
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={getPropertyImage()}
          alt={property.title}
          sx={{ objectFit: "cover" }} // Improve image display
        />
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: 1,
          }}
        >
          {property.propertyType === "Land" ? (
            <Chip
              icon={<LandscapeIcon />}
              label="Land"
              size="small"
              sx={{ backgroundColor: "rgba(43, 123, 140, 0.9)" }}
            />
          ) : (
            <Chip
              icon={<ApartmentIcon />}
              label="Building"
              size="small"
              sx={{ backgroundColor: "rgba(76, 175, 80, 0.9)" }}
            />
          )}
          {property.featured && (
            <Chip
              label="Featured"
              color="secondary"
              size="small"
              sx={{
                fontWeight: "bold",
                backgroundColor: "rgba(220, 0, 78, 0.9)",
              }}
            />
          )}
        </Box>

        {/* Add availability tag */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0,0,0,0.6)",
            p: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            {mode === "rent"
              ? "Available for Rent"
              : mode === "buy"
              ? "For Sale"
              : "Recently Sold"}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {property.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {property.location}
        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 1, color: theme.palette.primary.main }}
        >
          {formatPrice(property.price, mode)}
        </Typography>

        {/* Show different details based on property type */}
        {property.propertyType === "Land" ? (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {property.area.toLocaleString()} sqft of Land
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.pricePerUnit}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {property.bedrooms} bed • {property.bathrooms} bath •{" "}
            {property.area.toLocaleString()} sqft
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails(property);
              } else {
                navigate(`/properties/${property._id}`);
              }
            }}
          >
            View Details
          </Button>
          <IconButton
            color={isWishlisted ? "error" : "default"}
            onClick={handleWishlistClick}
            size="small"
          >
            {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Filters Component
const PropertyFilters = ({
  searchTerm,
  setSearchTerm,
  propertyTypeFilter,
  setPropertyTypeFilter,
  bedroomFilter,
  setBedroomFilter,
  bathroomFilter,
  setBathroomFilter,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  mode,
  onResetFilters,
  isMobile,
}) => {
  const [showFilters, setShowFilters] = useState(!isMobile);

  return (
    <Paper elevation={2} sx={{ mb: 4, p: 2, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isMobile && !showFilters ? 0 : 2,
        }}
      >
        <Typography variant="h6">Filters</Typography>
        <Box>
          {isMobile && (
            <Button
              startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={onResetFilters}
            color="secondary"
          >
            Reset
          </Button>
        </Box>
      </Box>

      {(!isMobile || showFilters) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Fuzzy search text input */}
          <TextField
            label="Search (title or location)"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: isMobile ? "100%" : 220 }}
          />

          {/* Property Type Filter */}
          <FormControl size="small" sx={{ width: isMobile ? "100%" : 150 }}>
            <InputLabel>Property Type</InputLabel>
            <Select
              label="Property Type"
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="other">Buildings</MenuItem>
              <MenuItem value="land">Land Only</MenuItem>
            </Select>
          </FormControl>

          {/* Only show bedroom/bathroom filters if not filtering for land only */}
          {propertyTypeFilter !== "land" && (
            <>
              {/* Bedrooms */}
              <FormControl size="small" sx={{ width: isMobile ? "100%" : 120 }}>
                <InputLabel>Bedrooms</InputLabel>
                <Select
                  label="Bedrooms"
                  value={bedroomFilter}
                  onChange={(e) => setBedroomFilter(Number(e.target.value))}
                >
                  <MenuItem value={0}>Any</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5+</MenuItem>
                </Select>
              </FormControl>

              {/* Bathrooms */}
              <FormControl size="small" sx={{ width: isMobile ? "100%" : 120 }}>
                <InputLabel>Bathrooms</InputLabel>
                <Select
                  label="Bathrooms"
                  value={bathroomFilter}
                  onChange={(e) => setBathroomFilter(Number(e.target.value))}
                >
                  <MenuItem value={0}>Any</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4+</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* Price Slider */}
          <Box sx={{ width: isMobile ? "100%" : 200 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Max Price: {formatPrice(priceRange[1], mode)}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(e, newVal) => setPriceRange(newVal)}
              valueLabelDisplay="auto"
              min={0}
              max={mode === "rent" ? 100000 : 300}
              defaultValue={9000}
            />
          </Box>

          {/* Sort By Dropdown */}
          <FormControl size="small" sx={{ width: isMobile ? "100%" : 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={<SortIcon sx={{ ml: 1, mr: 1, color: "gray" }} />}
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="priceAsc">Price (Low to High)</MenuItem>
              <MenuItem value="priceDesc">Price (High to Low)</MenuItem>
              {propertyTypeFilter !== "land" && (
                <MenuItem value="bedroomsAsc">Bedrooms (Few to Many)</MenuItem>
              )}
              {propertyTypeFilter !== "land" && (
                <MenuItem value="bedroomsDesc">Bedrooms (Many to Few)</MenuItem>
              )}
              <MenuItem value="areaAsc">Area (Small to Large)</MenuItem>
              <MenuItem value="areaDesc">Area (Large to Small)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </Paper>
  );
};

// Simple Property Details Dialog
const PropertyDetailsDialog = ({ open, property, onClose, mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!property) return null;

  // Get property image
  const getPropertyImage = () => {
    if (property.propertyType === "Land") {
      if (property.images && property.images.length > 0) {
        return `/pictures/${property.images[0]}`;
      }
      return "/pictures/land.jpg";
    }

    if (property.images && property.images.length > 0) {
      return `/pictures/${property.images[0]}`;
    }
    return "/pictures/placeholder.png";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{property.title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          {/* Property Image */}
          <CardMedia
            component="img"
            image={getPropertyImage()}
            alt={property.title}
            sx={{ height: 300, mb: 2 }}
          />

          {/* Property Details */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              {formatPrice(property.price, mode)}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {property.location}
            </Typography>

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                icon={
                  property.propertyType === "Land" ? (
                    <LandscapeIcon />
                  ) : (
                    <ApartmentIcon />
                  )
                }
                label={`${
                  property.propertyType
                }: ${property.area.toLocaleString()} sqft`}
                variant="outlined"
              />
              {property.propertyType !== "Land" && (
                <>
                  <Chip
                    label={`${property.bedrooms} Bedrooms`}
                    variant="outlined"
                  />
                  <Chip
                    label={`${property.bathrooms} Bathrooms`}
                    variant="outlined"
                  />
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Description */}
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {property.description}
          </Typography>

          {property.propertyType === "Land" && (
            <Typography variant="body2" color="text.secondary">
              {property.pricePerUnit}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary">
          {mode === "buy"
            ? "Contact Agent"
            : mode === "rent"
            ? "Schedule Viewing"
            : "See Similar Properties"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function Properties() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Read the URL param to see which mode we want: "rent", "buy", or "sold"
  const { mode: urlMode } = useParams();

  // Set default mode if not provided
  const mode = urlMode || "buy";

  // Log the current mode for debugging
  console.log("Current mode from URL:", urlMode);
  console.log("Using mode:", mode);

  // Get sample properties including both land and buildings
  const sampleLandProperties = useMemo(
    () => getSampleLandProperties(mode),
    [mode]
  );

  // State for all properties from the backend
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Property details dialog state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // States for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [bathroomFilter, setBathroomFilter] = useState(0);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [priceRange, setPriceRange] = useState(
    mode === "rent" ? [0, 100000] : [0, 300]
  );
  const [sortBy, setSortBy] = useState("recommended");

  // Auth/wishlist
  const { isLoggedIn, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Reset filters handler
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setBedroomFilter(0);
    setBathroomFilter(0);
    setPropertyTypeFilter("all");
    setPriceRange(mode === "rent" ? [0, 100000] : [0, 300]);
    setSortBy("recommended");
  }, [mode]);

  // Handler for opening property details dialog
  const handleViewPropertyDetails = useCallback((property) => {
    setSelectedProperty(property);
    setDetailsDialogOpen(true);
  }, []);

  // Handler for closing property details dialog
  const handleClosePropertyDetails = useCallback(() => {
    setDetailsDialogOpen(false);
  }, []);

  // Fetch all properties and add sample properties
  useEffect(() => {
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/properties`)
      .then((response) => {
        // Use API data directly without merging sample data.
        const apiProperties = response.data;

        // Filter the properties so only those with the current mode are shown.
        const filteredProperties = apiProperties.filter(
          (prop) => prop.mode === mode
        );

        setAllProperties(filteredProperties);
        setLoading(false);

        console.log("API properties count:", apiProperties.length);
        console.log("Filtered properties count:", filteredProperties.length);
      })
      .catch((err) => {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties.");
        setLoading(false);
      });
  }, [mode]);

  // Fetch wishlist if user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      axios
        .get(`${API_BASE_URL}/users/${user}/wishlist`)
        .then((res) => {
          setWishlist(res.data.wishlist);
        })
        .catch((err) => {
          console.error("Error fetching wishlist:", err);
          setNotification({
            open: true,
            message: "Could not load your wishlist",
            severity: "error",
          });
        });
    } else {
      setWishlist([]);
    }
  }, [isLoggedIn, user]);

  // Helper: is a property already in wishlist?
  const isPropertyWishlisted = useCallback(
    (propertyId) => {
      return wishlist.some((prop) => prop._id === propertyId);
    },
    [wishlist]
  );

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (propertyId) => {
      if (!isLoggedIn || !user) {
        setNotification({
          open: true,
          message: "Please log in to save properties",
          severity: "info",
        });
        return;
      }

      const alreadyInWishlist = isPropertyWishlisted(propertyId);

      try {
        if (alreadyInWishlist) {
          await axios.delete(`${API_BASE_URL}/users/${user}/wishlist`, {
            data: { propertyId },
          });
          setWishlist((prev) => prev.filter((p) => p._id !== propertyId));
          setNotification({
            open: true,
            message: "Property removed from wishlist",
            severity: "success",
          });
        } else {
          await axios.post(`${API_BASE_URL}/users/${user}/wishlist`, {
            propertyId,
          });
          const addedProp = allProperties.find((p) => p._id === propertyId);
          setWishlist((prev) => [...prev, addedProp]);
          setNotification({
            open: true,
            message: "Property added to wishlist",
            severity: "success",
          });
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
        setNotification({
          open: true,
          message: "Failed to update wishlist",
          severity: "error",
        });
      }
    },
    [isLoggedIn, user, isPropertyWishlisted, allProperties]
  );

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Use useMemo to optimize filtering operations
  const filteredProperties = useMemo(() => {
    // Log to help debug
    console.log("Filtering properties. Mode:", mode);
    console.log("Total properties count:", allProperties.length);

    // Safely handle empty allProperties
    if (!allProperties || allProperties.length === 0) {
      return [];
    }

    // Ensure all properties have correct properties
    const safeProperties = allProperties.map((prop) => ({
      ...prop,
      propertyType: prop.propertyType || "Other",
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      area: prop.area || 0,
      mode: prop.mode || mode, // Ensure mode is set
    }));

    // 1) Filter by mode - check each property's mode
    const filteredByMode = safeProperties.filter((prop) => {
      const propMode = prop.mode || mode;
      return propMode === mode;
    });

    console.log("Properties after mode filter:", filteredByMode.length);

    // 2) Filter by property type
    const filteredByType =
      propertyTypeFilter === "all"
        ? filteredByMode
        : filteredByMode.filter((property) =>
            propertyTypeFilter === "land"
              ? property.propertyType === "Land"
              : property.propertyType !== "Land"
          );

    console.log("Properties after type filter:", filteredByType.length);

    // 3) Fuzzy search with Fuse.js
    let fuzzyFiltered;
    if (searchTerm && searchTerm.trim() !== "") {
      try {
        const fuse = new Fuse(filteredByType, {
          keys: ["title", "location"],
          threshold: 0.3,
          ignoreLocation: true,
        });
        fuzzyFiltered = fuse.search(searchTerm).map((result) => result.item);
      } catch (error) {
        console.error("Error in fuzzy search:", error);
        fuzzyFiltered = filteredByType;
      }
    } else {
      fuzzyFiltered = filteredByType;
    }

    console.log("Properties after fuzzy search:", fuzzyFiltered.length);

    // 4) Numeric filters (price, bedrooms, bathrooms)
    const numericFiltered = fuzzyFiltered
      .filter((property) => {
        return (
          property.price >= priceRange[0] && property.price <= priceRange[1]
        );
      })
      .filter((property) => {
        // Skip bedroom filter for Land properties
        return (
          property.propertyType === "Land" ||
          bedroomFilter === 0 ||
          (property.bedrooms && property.bedrooms === bedroomFilter)
        );
      })
      .filter((property) => {
        // Skip bathroom filter for Land properties
        return (
          property.propertyType === "Land" ||
          bathroomFilter === 0 ||
          (property.bathrooms && property.bathrooms === bathroomFilter)
        );
      });

    console.log("Properties after numeric filters:", numericFiltered.length);

    // 5) Sorting
    let sortedProperties = [...numericFiltered];

    try {
      if (sortBy === "priceAsc") {
        sortedProperties.sort((a, b) => a.price - b.price);
      } else if (sortBy === "priceDesc") {
        sortedProperties.sort((a, b) => b.price - a.price);
      } else if (sortBy === "bedroomsAsc") {
        sortedProperties.sort((a, b) => {
          const bedroomsA =
            a.propertyType === "Land" || !a.bedrooms ? 0 : a.bedrooms;
          const bedroomsB =
            b.propertyType === "Land" || !b.bedrooms ? 0 : b.bedrooms;
          return bedroomsA - bedroomsB;
        });
      } else if (sortBy === "bedroomsDesc") {
        sortedProperties.sort((a, b) => {
          const bedroomsA =
            a.propertyType === "Land" || !a.bedrooms ? 0 : a.bedrooms;
          const bedroomsB =
            b.propertyType === "Land" || !b.bedrooms ? 0 : b.bedrooms;
          return bedroomsB - bedroomsA;
        });
      } else if (sortBy === "areaAsc") {
        sortedProperties.sort((a, b) => (a.area || 0) - (b.area || 0));
      } else if (sortBy === "areaDesc") {
        sortedProperties.sort((a, b) => (b.area || 0) - (a.area || 0));
      } else if (sortBy === "recommended") {
        sortedProperties.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
      }
    } catch (error) {
      console.error("Error sorting properties:", error);
    }

    console.log("Final filtered properties:", sortedProperties.length);
    return sortedProperties;
  }, [
    allProperties,
    mode,
    propertyTypeFilter,
    searchTerm,
    priceRange,
    bedroomFilter,
    bathroomFilter,
    sortBy,
  ]);

  return (
    <Container sx={{ py: 4 }}>
      {/* Navigation Bar - Custom styling for better appearance */}
      <Box
        sx={{
          mb: 5,
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "rgba(240, 247, 250, 0.7)",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            background: "transparent",
          }}
        >
          <Button
            variant={mode === "rent" ? "contained" : "outlined"}
            onClick={() => navigate("/properties/rent")}
            startIcon={<HomeIcon />}
            sx={{
              borderRadius: "8px",
              padding: "8px 22px",
              fontWeight: 600,
              boxShadow:
                mode === "rent" ? "0 4px 8px rgba(43, 122, 140, 0.3)" : "none",
              backgroundColor: mode === "rent" ? "#2B7A8C" : "transparent",
              borderColor: "#2B7A8C",
              color: mode === "rent" ? "white" : "#2B7A8C",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  mode === "rent" ? "#1e5b68" : "rgba(43, 122, 140, 0.1)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 12px rgba(43, 122, 140, 0.2)",
              },
            }}
          >
            RENT
          </Button>
          <Button
            variant={mode === "buy" ? "contained" : "outlined"}
            onClick={() => navigate("/properties/buy")}
            sx={{
              borderRadius: "8px",
              padding: "8px 22px",
              fontWeight: 600,
              boxShadow:
                mode === "buy" ? "0 4px 8px rgba(43, 122, 140, 0.3)" : "none",
              backgroundColor: mode === "buy" ? "#2B7A8C" : "transparent",
              borderColor: "#2B7A8C",
              color: mode === "buy" ? "white" : "#2B7A8C",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  mode === "buy" ? "#1e5b68" : "rgba(43, 122, 140, 0.1)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 12px rgba(43, 122, 140, 0.2)",
              },
            }}
          >
            BUY
          </Button>
          <Button
            variant={mode === "sold" ? "contained" : "outlined"}
            onClick={() => navigate("/properties/sold")}
            sx={{
              borderRadius: "8px",
              padding: "8px 22px",
              fontWeight: 600,
              boxShadow:
                mode === "sold" ? "0 4px 8px rgba(43, 122, 140, 0.3)" : "none",
              backgroundColor: mode === "sold" ? "#2B7A8C" : "transparent",
              borderColor: "#2B7A8C",
              color: mode === "sold" ? "white" : "#2B7A8C",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  mode === "sold" ? "#1e5b68" : "rgba(43, 122, 140, 0.1)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 12px rgba(43, 122, 140, 0.2)",
              },
            }}
          >
            SOLD
          </Button>
        </Box>
      </Box>

      {/* Page Title */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {mode === "rent" && "Properties for Rent"}
          {mode === "buy" && "Properties for Sale"}
          {mode === "sold" && "Recently Sold Properties"}
          {!["rent", "buy", "sold"].includes(mode) && "All Properties"}
        </Typography>
      </Box>

      {/* ADVANCED SEARCH FORM */}
      <PropertyFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        propertyTypeFilter={propertyTypeFilter}
        setPropertyTypeFilter={setPropertyTypeFilter}
        bedroomFilter={bedroomFilter}
        setBedroomFilter={setBedroomFilter}
        bathroomFilter={bathroomFilter}
        setBathroomFilter={setBathroomFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        mode={mode}
        onResetFilters={resetFilters}
        isMobile={isMobile}
      />

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results count */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {filteredProperties.length === 0
              ? "No properties match your search criteria"
              : `Showing ${filteredProperties.length} ${
                  filteredProperties.length === 1 ? "property" : "properties"
                }`}
          </Typography>
        </Box>
      )}

      {/* Property Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <PropertyCard
              property={property}
              mode={mode}
              isWishlisted={isPropertyWishlisted(property._id)}
              onToggleWishlist={toggleWishlist}
              isLoggedIn={isLoggedIn}
              onViewDetails={handleViewPropertyDetails}
            />
          </Grid>
        ))}
      </Grid>

      {/* No results */}
      {!loading && filteredProperties.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            p: 4,
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No properties match your search criteria
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Try adjusting your filters or search terms
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </Box>
      )}

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        open={detailsDialogOpen}
        property={selectedProperty}
        onClose={handleClosePropertyDetails}
        mode={mode}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Properties;
