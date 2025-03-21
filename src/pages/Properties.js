// src/pages/Properties.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import Fuse from "fuse.js";
import axios from "axios";
import { useAuth } from "./AuthContext";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";

function Properties() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Read the URL param to see which mode we want: "rent", "buy", or "sold"
  const { mode } = useParams();

  // State for all properties from the backend
  const [allProperties, setAllProperties] = useState([]);

  // States for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState(0); // 0 => Any
  const [bathroomFilter, setBathroomFilter] = useState(0); // 0 => Any

  // Price range: if "rent", treat price as Taka; if "buy"/"sold", treat as Lakh
  const defaultPriceRange =
    mode === "rent"
      ? [0, 100000] // up to 100,000 Taka for rent
      : [0, 300]; // up to 300 Lakh for buy/sold
  const [priceRange, setPriceRange] = useState(defaultPriceRange);

  // Sorting
  // "recommended" (no special sort), "priceAsc", "priceDesc", "bedroomsAsc", "bedroomsDesc"
  const [sortBy, setSortBy] = useState("recommended");

  // Auth/wishlist
  const { isLoggedIn, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Fetch all properties once
  useEffect(() => {
    fetch("http://localhost:5001/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setAllProperties(data);
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  // Fetch wishlist if user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      axios
        .get(`http://localhost:5001/api/users/${user}/wishlist`)
        .then((res) => {
          setWishlist(res.data.wishlist); // array of property documents
        })
        .catch((err) => console.error("Error fetching wishlist:", err));
    }
  }, [isLoggedIn, user]);

  // Helper: is a property already in wishlist?
  const isPropertyWishlisted = (propertyId) => {
    return wishlist.some((prop) => prop._id === propertyId);
  };

  // Toggle wishlist
  const toggleWishlist = async (propertyId) => {
    if (!isLoggedIn || !user) {
      console.error("User must be logged in to modify wishlist.");
      return;
    }

    const alreadyInWishlist = isPropertyWishlisted(propertyId);

    try {
      if (alreadyInWishlist) {
        // Remove from wishlist
        await axios.delete(`http://localhost:5001/api/users/${user}/wishlist`, {
          data: { propertyId },
        });
        setWishlist((prev) => prev.filter((p) => p._id !== propertyId));
      } else {
        // Add to wishlist
        await axios.post(`http://localhost:5001/api/users/${user}/wishlist`, {
          propertyId,
        });
        // Find that property in allProperties
        const addedProp = allProperties.find((p) => p._id === propertyId);
        setWishlist((prev) => [...prev, addedProp]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  // 1) Filter by mode first
  const filteredByMode = allProperties.filter((prop) => prop.mode === mode);

  // 2) Fuzzy search with Fuse.js
  const fuse = new Fuse(filteredByMode, {
    keys: ["title", "location"], // fields to fuzzy match
    threshold: 0.3, // stricter matching
  });
  const fuseResults = searchTerm
    ? fuse.search(searchTerm)
    : filteredByMode.map((item) => ({ item }));
  const fuzzyFiltered = fuseResults.map((result) => result.item);

  // 3) Numeric filters (price, bedrooms, bathrooms)
  const numericFiltered = fuzzyFiltered
    .filter((property) => {
      const p = property.price;
      // If "rent", interpret as Taka; if "buy"/"sold", interpret as Lakh
      return p >= priceRange[0] && p <= priceRange[1];
    })
    .filter((property) => {
      return bedroomFilter === 0 || property.bedrooms === bedroomFilter;
    })
    .filter((property) => {
      return bathroomFilter === 0 || property.bathrooms === bathroomFilter;
    });

  // 4) Sorting
  let sortedProperties = [...numericFiltered];
  if (sortBy === "priceAsc") {
    sortedProperties.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceDesc") {
    sortedProperties.sort((a, b) => b.price - a.price);
  } else if (sortBy === "bedroomsAsc") {
    sortedProperties.sort((a, b) => a.bedrooms - b.bedrooms);
  } else if (sortBy === "bedroomsDesc") {
    sortedProperties.sort((a, b) => b.bedrooms - a.bedrooms);
  }
  // "recommended" => no change

  // Helper to format price display
  const formatPrice = (price) => {
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

  return (
    <Container sx={{ py: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {mode === "rent" && "Properties for Rent"}
        {mode === "buy" && "Properties for Sale"}
        {mode === "sold" && "Recently Sold Properties"}
      </Typography>

      {/* ADVANCED SEARCH FORM */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box
          sx={{
            display: "flex",
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
            sx={{ width: 220 }}
          />

          {/* Bedrooms */}
          <FormControl size="small" sx={{ width: 120 }}>
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
              <MenuItem value={5}>5</MenuItem>
            </Select>
          </FormControl>

          {/* Bathrooms */}
          <FormControl size="small" sx={{ width: 120 }}>
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
              <MenuItem value={4}>4</MenuItem>
            </Select>
          </FormControl>

          {/* Price Slider */}
          <Box sx={{ width: 200 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Max Price: {priceRange[1]}
              {mode === "rent" ? " Taka" : " Lakh"}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(e, newVal) => setPriceRange(newVal)}
              valueLabelDisplay="auto"
              min={0}
              max={mode === "rent" ? 100000 : 300}
            />
          </Box>

          {/* Sort By Dropdown */}
          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="priceAsc">Price (Low to High)</MenuItem>
              <MenuItem value="priceDesc">Price (High to Low)</MenuItem>
              <MenuItem value="bedroomsAsc">Bedrooms (Few to Many)</MenuItem>
              <MenuItem value="bedroomsDesc">Bedrooms (Many to Few)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Property Grid */}
      <Grid container spacing={3}>
        {sortedProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Card>
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
                <Typography variant="h6" gutterBottom>
                  {property.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.location}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                  {formatPrice(property.price)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {property.bedrooms} bed &bull; {property.bathrooms} bath
                  &bull; {property.area} sqft
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      (window.location.href = `/properties/${property._id}`)
                    }
                  >
                    Details
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => toggleWishlist(property._id)}
                    sx={{ ml: 2 }}
                  >
                    {isPropertyWishlisted(property._id) ? (
                      <FavoriteIcon sx={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Properties;
