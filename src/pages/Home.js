import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HouseIcon from "@mui/icons-material/House";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BathtubIcon from "@mui/icons-material/Bathtub";
import BedIcon from "@mui/icons-material/Bed";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";
import dhaka2 from "../pictures/dhaka2.jpg";
import house1 from "../pictures/house1.png";
import house2 from "../pictures/house2.png";
import house3 from "../pictures/house3.png";
import land from "../pictures/land.jpg";
import BangladeshMap from "./BangladeshMap"; // Import the BangladeshMap component
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Import the AuthContext
import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle";

// Styled components with modern design
const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 4px 14px rgba(43, 123, 140, 0.25)" : "none",
  transition: "all 0.3s ease",
  ...(variant === "contained" && {
    backgroundColor: "#2B7B8C",
    color: "white",
    "&:hover": {
      backgroundColor: "#246A77",
      transform: "translateY(-3px)",
      boxShadow: "0 8px 20px rgba(43, 123, 140, 0.3)",
    },
  }),
  ...(variant === "outlined" && {
    borderColor: "#2B7B8C",
    color: "#2B7B8C",
    backgroundColor: alpha("#2B7B8C", 0.05),
    "&:hover": {
      backgroundColor: alpha("#2B7B8C", 0.1),
      borderColor: "#2B7B8C",
    },
  }),
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.06)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  border: "1px solid rgba(43, 123, 140, 0.08)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 25px rgba(43, 123, 140, 0.12)",
  },
}));

const SectionBox = styled(Box)(({ theme, bgColor }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  backgroundColor: bgColor || "transparent",
}));

// Sample data
const allProperties = [
  {
    id: 1,
    title: "Modern 1-Bedroom Apartment",
    price: "৳12,000/mo",
    displayPrice: "৳ 12,000 / month",
    salePrice: "৳45 Lakh",
    location: "Downtown Dhaka",
    image: house1,
    beds: 1,
    baths: 1,
    sqft: 450,
    type: "apartment",
    status: "For Rent",
    amenities: ["Pet Friendly", "Gym", "Parking"],
  },
  {
    id: 2,
    title: "Spacious 2-Bedroom House",
    price: "৳24,000/mo",
    displayPrice: "৳ 24,000 / month",
    salePrice: "৳1.20 Crore",
    location: "Gulshan",
    image: house2,
    beds: 2,
    baths: 2,
    sqft: 850,
    type: "house",
    status: "For Rent",
    forSale: true,
    amenities: ["Garden", "Parking", "Washer/Dryer"],
  },
  {
    id: 3,
    title: "Cozy 1-Bedroom Apartment",
    price: "৳15,000/mo",
    displayPrice: "৳ 15,000 / month",
    salePrice: "৳60 Lakh",
    location: "Dhanmondi",
    image: house3,
    beds: 1,
    baths: 1,
    sqft: 600,
    type: "apartment",
    status: "For Rent",
    forSale: true,
    amenities: ["Balcony", "Hardwood Floors"],
  },
  {
    id: 4,
    title: "Luxury 3-Bedroom Condo",
    price: "৳32,000/mo",
    displayPrice: "৳ 32,000 / month",
    salePrice: "৳1.80 Crore",
    location: "Banani",
    image: house1,
    beds: 3,
    baths: 2,
    sqft: 1100,
    type: "condo",
    status: "For Rent",
    forSale: true,
    amenities: ["Swimming Pool", "Gym", "Security"],
  },
  {
    id: 5,
    title: "Modern 1-Bedroom Loft",
    price: "৳13,500/mo",
    displayPrice: "৳ 13,500 / month",
    salePrice: "৳55 Lakh",
    location: "Old Dhaka",
    image: house2,
    beds: 1,
    baths: 1,
    sqft: 500,
    type: "loft",
    status: "For Rent",
    forSale: true,
    amenities: ["High Ceiling", "Industrial Design"],
  },
  {
    id: 6,
    title: "Waterfront 2-Bedroom",
    price: "৳28,000/mo",
    displayPrice: "৳ 28,000 / month",
    salePrice: "৳1.50 Crore",
    location: "Uttara",
    image: house3,
    beds: 2,
    baths: 2,
    sqft: 900,
    type: "apartment",
    status: "For Rent",
    forSale: true,
    amenities: ["Lake View", "Modern Kitchen", "Parking"],
  },
];

// Featured properties (subset of all properties)
const featuredProperties = allProperties.slice(0, 3);

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth(); // Get user info from AuthContext
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Any location");
  const [searchType, setSearchType] = useState("rent"); // Default to 'rent'
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { t } = useTranslation(); // ✅ enables translation

  useEffect(() => {
    if (isLoggedIn && user) {
      axios
        .get(`http://localhost:5001/api/users/${user}/wishlist`)
        .then((response) => {
          setWishlist(response.data.wishlist.map((property) => property._id));
        });
    }
  }, [isLoggedIn, user]);

  const toggleWishlist = async (propertyId) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const isInWishlist = wishlist.includes(propertyId);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`http://localhost:5001/api/users/${user}/wishlist`, {
          data: { propertyId },
        });
        setWishlist(wishlist.filter((id) => id !== propertyId));
      } else {
        // Add to wishlist
        await axios.post(`http://localhost:5001/api/users/${user}/wishlist`, {
          propertyId,
        });
        setWishlist([...wishlist, propertyId]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  // Function to handle map dialog opening
  const handleOpenMap = () => {
    setMapOpen(true);
  };

  // Function to handle map dialog closing
  const handleCloseMap = () => {
    setMapOpen(false);
  };

  // Function to handle location selection
  const handleLocationSelected = (locationName) => {
    setSelectedLocation(locationName || "Any location");
    setMapOpen(false);
  };

  // Function to handle list property button click
  const handleListPropertyClick = () => {
    if (isLoggedIn) {
      navigate("/list-property");
    } else {
      navigate("/login");
    }
  };

  // Function to handle search input changes
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      // Check if input is just a number (like 1, 2, 3)
      const isJustNumber = /^\d+$/.test(query);

      // Show all properties when user types a single number or short address pattern
      if (isJustNumber || query.length <= 3) {
        setFilteredProperties(allProperties);
        setShowSuggestions(true);
        return;
      }

      // Enhanced filtering to be more inclusive
      const filtered = allProperties.filter((property) => {
        // Basic text matching in various property fields
        const matchesTitle = property.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesLocation = property.location
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesType = property.type
          .toLowerCase()
          .includes(query.toLowerCase());

        // Match by bedroom number - more flexible now
        // If query contains a number, check if it matches beds
        const numberInQuery = query.match(/\d+/)?.[0];
        const matchesBedrooms = numberInQuery
          ? property.beds === parseInt(numberInQuery)
          : false;

        // Match typical address patterns
        const isAddressPattern = /^[a-z0-9\s,.\-#/]+$/i.test(query);

        // Return true if any condition matches
        return (
          matchesTitle ||
          matchesLocation ||
          matchesType ||
          matchesBedrooms ||
          isAddressPattern
        );
      });

      // If we have specific matches, show them, otherwise show all properties
      if (filtered.length > 0) {
        setFilteredProperties(filtered);
      } else {
        setFilteredProperties(allProperties); // Show all properties as fallback
      }
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Function to handle property selection from suggestions
  const handlePropertySelect = (property) => {
    // Just navigate directly - property pages will show both rent and buy options
    if (property.status === "For Rent") {
      navigate(`/properties/rent`);
    } else {
      navigate(`/properties/buy`);
    }

    setShowSuggestions(false);
    setSearchQuery("");
  };

  // Function to handle search button click
  const handleSearch = () => {
    navigate(`/properties/${searchType}`);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  const handleClickOutside = () => {
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      if (showSuggestions) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showSuggestions]);

  return (
    <Box onClick={handleClickOutside}>
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 30,
          zIndex: 999,
          display: { xs: "none", md: "block" }, // Only show on desktop
        }}
      >
        {/* 🌐 Language toggle button start */}
        <LanguageToggle />
        {/* 🌐 Language toggle button end */}
      </Box>

      {/* Hero Section with expanded search */}
      <Box
        sx={{
          background: `linear-gradient(160deg, #EFF9FE 60%, rgba(139, 198, 206, 0.4) 100%)`,
          pt: { xs: 12, md: 15 },
          pb: { xs: 10, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(43, 123, 140, 0.05)",
            top: -200,
            right: -100,
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2,
                  color: "#0B1F23",
                }}
              >
                {/* 🌐 Translated hero title start */}
                {t("hero_title")}{" "}
                <Box component="span" sx={{ color: "#2B7B8C" }}>
                  Home
                </Box>{" "}
                {t("in_bangladesh")}
                {/* 🌐 Translated hero title end */}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  mb: 4,
                  color: "#0B1F23",
                  opacity: 0.8,
                  maxWidth: "650px",
                }}
              >
                {/* 🌐 Translated subtitle start */}
                {t("hero_subtitle")}
                {/* 🌐 Translated subtitle end */}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 2, sm: 2 },
                }}
              >
                {/* 🌐 Translated buttons start */}
                <StyledButton
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/properties/rent")}
                >
                  {t("explore_properties")}
                </StyledButton>
                <StyledButton
                  variant="outlined"
                  size="large"
                  onClick={() =>
                    navigate(isLoggedIn ? "/list-property" : "/login")
                  }
                >
                  {t("list_property")}
                </StyledButton>
                {/* 🌐 Translated buttons end */}
              </Box>
            </Grid>

            {/* Hero Image */}
            <Grid item xs={12} md={6} sx={{ display: "block" }}>
              <Box
                component="img"
                src={dhaka2}
                alt="Modern home in Bangladesh"
                sx={{
                  width: "100%",
                  maxWidth: "600px",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                  transform: "perspective(1000px) rotateY(-5deg)",
                  transition: "all 0.5s ease",
                  "&:hover": {
                    transform: "perspective(1000px) rotateY(0deg)",
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Search Box moved down and with increased length */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
              bgcolor: "white",
              p: { xs: 2, md: 3 }, // Increased padding
              borderRadius: "12px",
              mt: 10, // Increased margin top to move it down
              mb: 6, // Add margin bottom
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)", // Enhanced shadow
              zIndex: 1000,
              position: "relative",
              width: "100%", // Ensure full width
              maxWidth: "100%",
              transition: "all 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                position: "relative",
                flex: 3,
                zIndex: 1001,
                width: "100%",
              }}
            >
              <TextField
                placeholder="Search for properties (e.g., 3 bedroom, Gulshan, apartment)"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: "#2B7B8C", fontSize: "1.3rem" }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "8px",
                    py: 0.5, // Add padding to make input field larger
                    "& fieldset": { borderColor: "rgba(43, 123, 140, 0.1)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(43, 123, 140, 0.2)",
                    },
                    fontSize: "1.05rem", // Slightly larger font
                  },
                }}
                sx={{ bgcolor: "#F9FDFE" }}
              />

              {/* Property Suggestions */}
              {showSuggestions && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    bgcolor: "white",
                    borderRadius: "0 0 12px 12px",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)", // Enhanced shadow
                    maxHeight: "450px",
                    overflowY: "auto",
                    zIndex: 9999, // Extremely high z-index
                    mt: 0.5,
                    border: "1px solid rgba(43, 123, 140, 0.15)",
                    p: filteredProperties.length > 0 ? 0 : 2,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {filteredProperties.length > 0 ? (
                    <>
                      <Box
                        sx={{
                          p: 2,
                          fontWeight: 600,
                          bgcolor: "rgba(43, 123, 140, 0.05)",
                          borderBottom: "1px solid rgba(43, 123, 140, 0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle2">
                          {filteredProperties.length} properties found
                        </Typography>
                        <Button
                          size="small"
                          sx={{
                            color: "#2B7B8C",
                            textTransform: "none",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => setShowSuggestions(false)}
                        >
                          Close
                        </Button>
                      </Box>
                      {filteredProperties.map((property) => (
                        <Box
                          key={property.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "rgba(43, 123, 140, 0.05)",
                              transform: "translateY(-2px)",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertySelect(property);
                          }}
                        >
                          <Box
                            component="img"
                            src={property.image}
                            sx={{
                              width: 70,
                              height: 70,
                              borderRadius: "8px",
                              objectFit: "cover",
                              mr: 2,
                              border: "1px solid rgba(0,0,0,0.05)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            >
                              {property.title}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <LocationOnIcon
                                sx={{
                                  color: "#2B7B8C",
                                  fontSize: "0.9rem",
                                  mr: 0.5,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.85rem",
                                  color: "text.secondary",
                                }}
                              >
                                {property.location}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  bgcolor: "rgba(43, 123, 140, 0.06)",
                                  borderRadius: "4px",
                                  p: "2px 6px",
                                }}
                              >
                                <BedIcon
                                  sx={{
                                    color: "#2B7B8C",
                                    fontSize: "0.9rem",
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  {property.beds}{" "}
                                  {property.beds > 1 ? "Beds" : "Bed"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  bgcolor: "rgba(43, 123, 140, 0.06)",
                                  borderRadius: "4px",
                                  p: "2px 6px",
                                }}
                              >
                                <BathtubIcon
                                  sx={{
                                    color: "#2B7B8C",
                                    fontSize: "0.9rem",
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  {property.baths}{" "}
                                  {property.baths > 1 ? "Baths" : "Bath"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  bgcolor: "rgba(43, 123, 140, 0.06)",
                                  borderRadius: "4px",
                                  p: "2px 6px",
                                }}
                              >
                                <SquareFootIcon
                                  sx={{
                                    color: "#2B7B8C",
                                    fontSize: "0.9rem",
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  {property.sqft} ft²
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              ml: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            {/* Pricing options with clickable navigation */}
                            {property.forSale && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/properties/buy");
                                  setShowSuggestions(false);
                                  setSearchQuery("");
                                }}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  color: "#4CAF50",
                                  textTransform: "none",
                                  p: 0.5,
                                  mb: 0.5,
                                  borderRadius: "4px",
                                  "&:hover": {
                                    bgcolor: "rgba(76, 175, 80, 0.08)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, mr: 0.5 }}
                                >
                                  {property.salePrice}
                                </Typography>
                                <Chip
                                  size="small"
                                  label="Buy"
                                  sx={{
                                    bgcolor: "rgba(76, 175, 80, 0.1)",
                                    color: "#4CAF50",
                                    height: 20,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                  }}
                                />
                              </Button>
                            )}
                            <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/properties/rent");
                                setShowSuggestions(false);
                                setSearchQuery("");
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                color: "#2196F3",
                                textTransform: "none",
                                p: 0.5,
                                borderRadius: "4px",
                                "&:hover": {
                                  bgcolor: "rgba(33, 150, 243, 0.08)",
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mr: 0.5 }}
                              >
                                {property.price}
                              </Typography>
                              <Chip
                                size="small"
                                label="Rent"
                                sx={{
                                  bgcolor: "rgba(33, 150, 243, 0.1)",
                                  color: "#2196F3",
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      ))}
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            navigate("/properties/rent");
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                          sx={{
                            color: "#2B7B8C",
                            textTransform: "none",
                            "&:hover": {
                              bgcolor: "rgba(43, 123, 140, 0.05)",
                            },
                          }}
                        >
                          View all properties{" "}
                          <ArrowForwardIcon
                            sx={{ fontSize: "0.9rem", ml: 0.5 }}
                          />
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        No properties found matching your search.
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          navigate("/properties/rent");
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        sx={{
                          color: "#2B7B8C",
                          textTransform: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        Browse all properties
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Location field that opens the map */}
            <TextField
              placeholder="Any location"
              variant="outlined"
              fullWidth
              value={selectedLocation}
              onClick={handleOpenMap}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon
                      sx={{ color: "#2B7B8C", fontSize: "1.3rem" }}
                    />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "8px",
                  cursor: "pointer",
                  py: 0.5, // Add padding to make input field larger
                  "& fieldset": { borderColor: "rgba(43, 123, 140, 0.1)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(43, 123, 140, 0.2)",
                  },
                  "& input": { cursor: "pointer" },
                  fontSize: "1.05rem", // Slightly larger font
                },
                readOnly: true,
              }}
              sx={{ bgcolor: "#F9FDFE", flex: 1 }}
            />

            <Button
              variant="contained"
              sx={{
                bgcolor: "#2B7B8C",
                borderRadius: "8px",
                py: 2,
                px: { xs: 4, md: 5 }, // Increased padding
                height: { xs: "auto", md: "56px" }, // Match height with text fields
                flex: { xs: "1 1 100%", md: "0 0 auto" },
                fontSize: "1.05rem", // Slightly larger font
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#246A77",
                },
              }}
              onClick={handleSearch}
            >
              SEARCH
            </Button>
          </Box>

          {/* Map Dialog */}
          <Dialog
            open={mapOpen}
            onClose={handleCloseMap}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "#EFF9FE",
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#2B7B8C",
                color: "white",
                px: 3,
                py: 2,
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Select Location in Bangladesh
              </Typography>
              <IconButton onClick={handleCloseMap} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, height: "70vh" }}>
              <BangladeshMap
                onLocationSelected={handleLocationSelected}
                mapCenter={[23.8103, 90.4125]} // Dhaka
                mapZoom={7}
              />
            </DialogContent>
          </Dialog>
        </Container>
      </Box>

      {/* Featured Properties */}
      <SectionBox bgColor="#F9FDFE">
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "start", md: "center" },
              mb: 5,
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  mb: 1,
                  color: "#0B1F23",
                }}
              >
                Featured Properties
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#0B1F23",
                  opacity: 0.7,
                }}
              >
                Handpicked properties for you to explore
              </Typography>
            </Box>

            <StyledButton
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/properties/rent")}
            >
              View All Properties
            </StyledButton>
          </Box>

          <Grid container spacing={3}>
            {featuredProperties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <PropertyCard>
                  <Box sx={{ position: "relative" }}>
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                      }}
                      onClick={() => toggleWishlist(property.id)}
                    >
                      {wishlist.includes(property.id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <CardMedia
                      component="img"
                      height="200"
                      image={property.image}
                      alt={property.title}
                      sx={{ objectFit: "cover" }}
                    />
                  </Box>
                  {/* Property Label */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      bgcolor: "#2B7B8C",
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: "50px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(43, 123, 140, 0.3)",
                    }}
                  >
                    {property.status}
                  </Box>

                  <CardMedia
                    component="img"
                    height="200"
                    image={property.image}
                    alt={property.title}
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {property.title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LocationOnIcon
                        sx={{ color: "#2B7B8C", fontSize: "1rem", mr: 0.5 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#0B1F23", opacity: 0.7 }}
                      >
                        {property.location}
                      </Typography>
                    </Box>

                    {/* Features */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BedIcon
                          sx={{ color: "#2B7B8C", fontSize: "1.1rem", mr: 0.5 }}
                        />
                        <Typography variant="body2">
                          {property.beds} Beds
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BathtubIcon
                          sx={{ color: "#2B7B8C", fontSize: "1.1rem", mr: 0.5 }}
                        />
                        <Typography variant="body2">
                          {property.baths} Baths
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SquareFootIcon
                          sx={{ color: "#2B7B8C", fontSize: "1.1rem", mr: 0.5 }}
                        />
                        <Typography variant="body2">
                          {property.sqft} sqft
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "#2B7B8C", fontWeight: 700 }}
                      >
                        {property.price}
                      </Typography>

                      <Chip
                        icon={
                          property.type === "house" ? (
                            <HouseIcon />
                          ) : (
                            <ApartmentIcon />
                          )
                        }
                        label={
                          property.type === "house" ? "House" : "Apartment"
                        }
                        size="small"
                        sx={{
                          bgcolor: alpha("#2B7B8C", 0.1),
                          color: "#2B7B8C",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </CardContent>
                </PropertyCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </SectionBox>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "#2B7B8C",
          py: { xs: 6, md: 8 },
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            top: -150,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            bottom: -100,
            left: -50,
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.8rem" },
                }}
              >
                Start Your Property Journey Today
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  mb: 3,
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                }}
              >
                Whether you're looking to buy, sell, or rent, BanglaGhor is here
                to make your experience seamless.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/contact")}
                sx={{
                  bgcolor: "white",
                  color: "#2B7B8C",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: "8px",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 15px rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                Contact Us
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
