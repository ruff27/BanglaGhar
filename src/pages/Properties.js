import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom"; // to read :mode from the URL
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
  InputAdornment,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import axios from "axios"; // Corrected path
import { useAuth } from "./AuthContext";

function Properties() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 1) We'll read the URL param to see which mode we want
  const { mode } = useParams(); // "rent", "buy", or "sold"

  // 2) State for all properties fetched from the server
  const [allProperties, setAllProperties] = useState([]);

  // 3) UI filter states (shared logic for rent/buy/sold)
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [bathroomFilter, setBathroomFilter] = useState(0);

  // different default price ranges
  // For rent: [5000, 40000]
  const defaultPriceRange =
    mode === "rent"
      ? [0, 400000] // For rent
      : mode === "buy"
      ? [0, 200] // For buy
      : [0, 300]; // For sold (or any range that covers the highest sold price)

  const [priceRange, setPriceRange] = useState(defaultPriceRange);

  // Sorting
  const [sortBy, setSortBy] = useState("recommended");

  // 4) Fetch from /api/properties once
  useEffect(() => {
    fetch("http://localhost:5001/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setAllProperties(data);
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  // 5) Filter the properties by mode first, then apply user filters
  const filteredByMode = allProperties.filter((prop) => prop.mode === mode);

  const filteredProperties = filteredByMode
    // Price range
    .filter((property) => {
      const price = property.price;
      return price >= priceRange[0] && price <= priceRange[1];
    })
    // Property type
    .filter((property) => {
      return propertyType === "all" || property.type === propertyType;
    })
    // Search term
    .filter((property) => {
      const lowerTitle = property.title.toLowerCase();
      const lowerLoc = property.location.toLowerCase();
      const lowerSearch = searchTerm.toLowerCase();
      return lowerTitle.includes(lowerSearch) || lowerLoc.includes(lowerSearch);
    })
    // Bedrooms
    .filter((property) => {
      return bedroomFilter === 0 || property.bedrooms === bedroomFilter;
    })
    // Bathrooms
    .filter((property) => {
      return bathroomFilter === 0 || property.bathrooms === bathroomFilter;
    });

  // 6) Sorting logic
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "priceDesc") return b.price - a.price;
    return 0;
  });

  // 7) Example price formatting (for buy, we might show Lakh/Crore, for rent, just show numbers)
  const formatPrice = (price) => {
    if (mode === "rent") {
      // e.g. "৳12,000/mo"
      return `৳${price.toLocaleString()}/mo`;
    } else if (mode === "buy") {
      // e.g. 45 => "45 Lakh", or if > 100 => "1.2 Crore"
      if (price >= 100) {
        const crore = price / 100;
        return `৳${crore.toFixed(crore % 1 === 0 ? 0 : 2)} Crore`;
      } else {
        return `৳${price} Lakh`;
      }
    } else {
      // 'sold' or default
      return `৳${price.toLocaleString() + " Lakh"}`;
    }
  };

  const [wishlist, setWishlist] = useState([]);
  const { isLoggedIn, user } = useAuth(); // Get user ID from context

  // Fetch the initial wishlist state
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5001/api/users/${user}/wishlist`)
        .then((res) => {
          setWishlist(res.data.wishlist);
        })
        .catch((err) => console.error("Error fetching wishlist:", err));
    }
  }, [user]);

  const toggleWishlist = async (propertyId) => {
    if (!user) {
      console.error("User ID is required to modify the wishlist.");
      return;
    }

    const isWishlisted = isPropertyWishlisted(propertyId);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await axios.delete(`http://localhost:5001/api/users/${user}/wishlist`, {
          data: { propertyId },
        });
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item._id !== propertyId)
        );
      } else {
        // Add to wishlist
        const response = await axios.post(
          `http://localhost:5001/api/users/${user}/wishlist`,
          { propertyId }
        );
        const updatedWishlistIds = response.data.wishlist;

        // Fetch the updated wishlist details for consistency
        const updatedWishlist = allProperties.filter((property) =>
          updatedWishlistIds.includes(property._id)
        );

        setWishlist(updatedWishlist);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  // Debugging: Add console logs to ensure the function is called
  const handleWishlistClick = (propertyId) => {
    toggleWishlist(propertyId);
  };

  const isPropertyWishlisted = (propertyId) => {
    return wishlist?.some((item) => item._id === propertyId);
  };

  // 8) The UI
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Title - depends on mode */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          {mode === "buy" && "Properties for Sale"}
          {mode === "rent" && "Properties for Rent"}
          {mode === "sold" && "Recently Sold Properties"}
        </Typography>

        {/* Example search bar */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* 
            You can add more UI for propertyType, bedroomFilter, bathroomFilter, 
            priceRange sliders, etc. from your old code 
          */}
        </Paper>

        {/* Show results */}
        <Grid container spacing={3}>
          {sortedProperties.map((property) => (
            <Grid item key={property._id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    property.images && property.images[0]
                      ? `/pictures/${property.images[0]}`
                      : "/pictures/placeholder.png"
                  }
                  alt={property.title}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {property.title}
                    </Typography>
                    <IconButton
                      onClick={() => handleWishlistClick(property._id)}
                      color="primary"
                    >
                      {wishlist?.length > 0 &&
                      isPropertyWishlisted(property._id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 1 }}
                  >
                    {property.location}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    {formatPrice(property.price)}
                  </Typography>
                  <Typography variant="body2">
                    Bedrooms: {property.bedrooms}, Bathrooms:{" "}
                    {property.bathrooms}, Area: {property.area} ft²
                  </Typography>
                  {/* ... any other info ... */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Properties;
