import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for navigation
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SellIcon from "@mui/icons-material/Sell";
import HotelIcon from "@mui/icons-material/Hotel";

// Import property images
import House1 from '../pictures/house1.png';
import House2 from '../pictures/house2.png';
import House3 from '../pictures/house3.png';

// Fix for Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Custom theme based on provided colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#2B7B8C",
    },
    secondary: {
      main: "#8FBFBF",
    },
    background: {
      default: "#EFF9FE",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0B1F23",
      secondary: "#BFBBB8",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
  },
});

// Custom marker icons for different property types
const createCustomMarkerIcon = (propertyType, propertyMode) => {
  // Different colors for different property types
  const markerColor = 
    propertyType === 'apartment' ? '#4CAF50' : 
    propertyType === 'house' ? '#FF9800' : 
    propertyType === 'condo' ? '#2196F3' : 
    propertyType === 'loft' ? '#9C27B0' : 
    '#2B7B8C'; // default color
  
  // Different border color for rent vs buy
  const borderColor = propertyMode === 'buy' ? '#E91E63' : 'white';
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${markerColor}; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      color: white;
      font-weight: bold;
      border: 3px solid ${borderColor};
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${propertyType.charAt(0).toUpperCase()}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Component to change map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Property data - hardcoded locations for rent
const rentalProperties = [
  {
    id: 1,
    title: "Modern 1-Bedroom Apartment",
    location: "Downtown Dhaka",
    price: 12000,
    bedrooms: 1,
    bathrooms: 1,
    area: 450,
    type: "apartment",
    position: [23.7104, 90.4074], // Downtown Dhaka
    image: House1,
    features: ["Pet Friendly", "Gym", "Parking"],
    mode: "rent"
  },
  {
    id: 2,
    title: "Spacious 2-Bedroom House",
    location: "Gulshan",
    price: 24000,
    bedrooms: 2,
    bathrooms: 2,
    area: 850,
    type: "house",
    position: [23.7925, 90.4078], // Gulshan
    image: House2,
    features: ["Garden", "Parking", "Washer/Dryer"],
    mode: "rent"
  },
  {
    id: 3,
    title: "Cozy 1-Bedroom Apartment",
    location: "Dhanmondi",
    price: 15000,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    type: "apartment",
    position: [23.7461, 90.3742], // Dhanmondi
    image: House3,
    features: ["Balcony", "Hardwood Floors"],
    mode: "rent"
  },
  {
    id: 4,
    title: "Luxury 3-Bedroom Condo",
    location: "Banani",
    price: 32000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1100,
    type: "condo",
    position: [23.7937, 90.4065], // Banani
    image: House1,
    features: ["Doorman", "Gym", "Pool", "Pet Friendly"],
    mode: "rent"
  },
  {
    id: 5,
    title: "Modern 1-Bedroom Loft",
    location: "Old Dhaka",
    price: 13500,
    bedrooms: 1,
    bathrooms: 1,
    area: 500,
    type: "loft",
    position: [23.7104, 90.3896], // Old Dhaka
    image: House2,
    features: ["High Ceilings", "Exposed Brick"],
    mode: "rent"
  },
  {
    id: 6,
    title: "Waterfront 2-Bedroom",
    location: "Uttara",
    price: 28000,
    bedrooms: 2,
    bathrooms: 2,
    area: 900,
    type: "apartment",
    position: [23.8759, 90.3795], // Uttara
    image: House3,
    features: ["Lake View", "Balcony", "Parking"],
    mode: "rent"
  }
];

// Properties for sale - adjusted positions slightly to prevent overlap
const propertiesForSale = [
  {
    id: 101,
    title: "Modern 1-Bedroom Apartment",
    location: "Downtown Dhaka",
    price: 45, // price in lakh taka
    bedrooms: 1,
    bathrooms: 1,
    area: 450,
    type: "apartment",
    position: [23.7114, 90.4084], // Slightly adjusted
    image: House1,
    features: ["Pet Friendly", "Gym", "Parking"],
    mode: "buy"
  },
  {
    id: 102,
    title: "Spacious 2-Bedroom House",
    location: "Gulshan",
    price: 120,
    bedrooms: 2,
    bathrooms: 2,
    area: 850,
    type: "house",
    position: [23.7915, 90.4068], // Slightly adjusted
    image: House2,
    features: ["Garden", "Parking", "Washer/Dryer"],
    mode: "buy"
  },
  {
    id: 103,
    title: "Cozy 1-Bedroom Apartment",
    location: "Dhanmondi",
    price: 60,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    type: "apartment",
    position: [23.7471, 90.3752], // Slightly adjusted
    image: House3,
    features: ["Balcony", "Hardwood Floors"],
    mode: "buy"
  },
  {
    id: 104,
    title: "Luxury 3-Bedroom Condo",
    location: "Banani",
    price: 180,
    bedrooms: 3,
    bathrooms: 2,
    area: 1100,
    type: "condo",
    position: [23.7927, 90.4055], // Slightly adjusted
    image: House1,
    features: ["Doorman", "Gym", "Pool", "Pet Friendly"],
    mode: "buy"
  },
  {
    id: 105,
    title: "Modern 1-Bedroom Loft",
    location: "Old Dhaka",
    price: 55,
    bedrooms: 1,
    bathrooms: 1,
    area: 500,
    type: "loft",
    position: [23.7124, 90.3886], // Slightly adjusted
    image: House2,
    features: ["High Ceilings", "Exposed Brick"],
    mode: "buy"
  },
  {
    id: 106,
    title: "Waterfront 2-Bedroom",
    location: "Uttara",
    price: 150,
    bedrooms: 2,
    bathrooms: 2,
    area: 900,
    type: "apartment",
    position: [23.8769, 90.3785], // Slightly adjusted
    image: House3,
    features: ["Lake View", "Balcony", "Parking"],
    mode: "buy"
  }
];

const BangladeshMap = ({ onLocationSelected, mapCenter = [23.8103, 90.4125], mapZoom = 10, showProperties = true }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentMapCenter, setCurrentMapCenter] = useState(mapCenter);
  const [currentMapZoom, setCurrentMapZoom] = useState(mapZoom);
  const [propertyMode, setPropertyMode] = useState("both"); // "rent", "buy", or "both"
  const mapRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate(); // Initialize navigation hook

  // Bangladesh bounds
  const bangladeshBounds = [
    [20.5, 88.0], // Southwest boundary
    [26.5, 92.5], // Northeast boundary
  ];

  // Function to handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a location to search");
      return;
    }

    try {
      setSearchError("");
      // Make sure to only query OpenStreetMap with English language preference
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Bangladesh"
        )}&limit=1&accept-language=en`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
        
        // Check if the location is within Bangladesh bounds
        if (
          lat >= bangladeshBounds[0][0] && 
          lat <= bangladeshBounds[1][0] && 
          lon >= bangladeshBounds[0][1] && 
          lon <= bangladeshBounds[1][1]
        ) {
          setCurrentMapCenter([lat, lon]);
          setCurrentMapZoom(14);
          setSelectedLocation({
            position: [lat, lon],
            name: location.display_name,
          });
        } else {
          setSearchError("Location must be within Bangladesh");
        }
      } else {
        setSearchError("Location not found in Bangladesh");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      setSearchError("Error searching for location. Please try again.");
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Function to get directions via Google Maps
  const getDirections = (position) => {
    if (position) {
      const [lat, lng] = position;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank"
      );
    }
  };

  // Function to select location and pass it to parent component
  const handleSelectLocation = () => {
    if (selectedLocation && typeof onLocationSelected === 'function') {
      onLocationSelected(selectedLocation.name);
    }
  };

  // Function to handle property selection
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setCurrentMapCenter(property.position);
    setCurrentMapZoom(16);
  };

  // NEW FUNCTION: Handle navigation to appropriate page based on property mode
  const navigateToPropertyPage = (property) => {
    // Pass property ID and other necessary data via state or URL params
    if (property.mode === "rent") {
      navigate(`/properties/rent`, { state: { propertyId: property.id } });
    } else if (property.mode === "buy") {
      navigate(`/properties/buy`, { state: { propertyId: property.id } });
    }
  };

  // Handle property mode change (rent, buy, or both)
  const handlePropertyModeChange = (event, newMode) => {
    if (newMode !== null) {
      setPropertyMode(newMode);
    }
  };

  // Function to filter properties based on current mode
  const getFilteredProperties = () => {
    let properties = [];
    
    if (propertyMode === "rent" || propertyMode === "both") {
      properties = properties.concat(rentalProperties);
    }
    
    if (propertyMode === "buy" || propertyMode === "both") {
      properties = properties.concat(propertiesForSale);
    }
    
    return properties;
  };

  // Format price based on mode (rental or sale)
  const formatPrice = (price, mode) => {
    if (mode === "rent") {
      return `৳${price.toLocaleString()}/month`;
    } else {
      // For buy mode, format in lakh/crore 
      if (price >= 100) {
        const crore = price / 100;
        return `৳${crore.toFixed(crore % 1 === 0 ? 0 : 2)} Crore`;
      } else {
        return `৳${price} Lakh`;
      }
    }
  };

  // Get the type icon based on property type
  const getPropertyTypeIcon = (type) => {
    switch(type) {
      case 'apartment':
        return <ApartmentIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'house':
        return <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {/* Search section */}
        <Paper elevation={0} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search for a location in Bangladesh"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                error={Boolean(searchError)}
                helperText={searchError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                startIcon={<MyLocationIcon />}
                fullWidth
                sx={{ height: '56px' }}
              >
                Find Location
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSelectLocation}
                disabled={!selectedLocation}
                fullWidth
                sx={{ height: '56px' }}
              >
                Select Location
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <ToggleButtonGroup
                value={propertyMode}
                exclusive
                onChange={handlePropertyModeChange}
                fullWidth
                sx={{ height: '56px' }}
                color="primary"
              >
                <ToggleButton value="both" aria-label="both" sx={{ fontWeight: 'bold' }}>
                  All
                </ToggleButton>
                <ToggleButton value="rent" aria-label="rent">
                  <HotelIcon sx={{ mr: 1 }} />
                  Rent
                </ToggleButton>
                <ToggleButton value="buy" aria-label="buy">
                  <SellIcon sx={{ mr: 1 }} />
                  Buy
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        {/* Map section */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <MapContainer
            center={currentMapCenter}
            zoom={currentMapZoom}
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
            maxBounds={bangladeshBounds}
            maxBoundsViscosity={1.0}
            ref={mapRef}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" 
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='https://carto.com/attributions'>CARTO</a>"
            />
            <ChangeView center={currentMapCenter} zoom={currentMapZoom} />
            
            {/* Show the searched location marker */}
            {selectedLocation && (
              <Marker position={selectedLocation.position}>
                <Popup>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {selectedLocation.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<DirectionsIcon />}
                    onClick={() => getDirections(selectedLocation.position)}
                    fullWidth
                  >
                    Get Directions
                  </Button>
                </Popup>
              </Marker>
            )}
            
            {/* Show property markers based on mode */}
            {showProperties && getFilteredProperties().map((property) => (
              <Marker 
                key={property.id} 
                position={property.position}
                icon={createCustomMarkerIcon(property.type, property.mode)}
                eventHandlers={{
                  click: () => handlePropertySelect(property),
                }}
              >
                <Popup>
                  <Card sx={{ maxWidth: 300, boxShadow: 'none', border: 'none' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={property.image} 
                      alt={property.title}
                      sx={{ 
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0'
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x140?text=Property"; // Fallback image
                      }}
                    />
                    <CardContent sx={{ px: 1, py: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {property.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {property.location}, Bangladesh
                      </Typography>
                      
                      {/* Price badge that indicates rent/buy */}
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, 
                        py: 0.5, 
                        mb: 1.5,
                        borderRadius: '8px',
                        bgcolor: property.mode === 'buy' ? 'rgba(233, 30, 99, 0.1)' : 'rgba(43, 123, 140, 0.1)',
                        border: '1px solid',
                        borderColor: property.mode === 'buy' ? 'rgba(233, 30, 99, 0.3)' : 'rgba(43, 123, 140, 0.3)',
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: property.mode === 'buy' ? '#E91E63' : theme.palette.primary.main
                          }}
                        >
                          {formatPrice(property.price, property.mode)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1.5,
                        fontSize: '0.875rem'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{property.bedrooms}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BathtubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{property.bathrooms}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SquareFootIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{property.area} ft²</Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          icon={getPropertyTypeIcon(property.type)}
                          label={property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.primary.light
                          }}
                        />
                        
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<DirectionsIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            getDirections(property.position);
                          }}
                        >
                          Directions
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>

        {/* Info section for selected properties */}
        {selectedProperty && (
          <Paper elevation={0} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedProperty.title}
                  </Typography>
                  <Chip 
                    label={selectedProperty.mode === 'buy' ? 'For Sale' : 'For Rent'} 
                    size="small" 
                    color={selectedProperty.mode === 'buy' ? 'secondary' : 'primary'} 
                    sx={{ 
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      height: '22px'
                    }}
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  {selectedProperty.location}, Bangladesh • {formatPrice(selectedProperty.price, selectedProperty.mode)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                  <Chip icon={<BedIcon />} label={`${selectedProperty.bedrooms} Beds`} size="small" />
                  <Chip icon={<BathtubIcon />} label={`${selectedProperty.bathrooms} Baths`} size="small" />
                  <Chip icon={<SquareFootIcon />} label={`${selectedProperty.area} ft²`} size="small" />
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DirectionsIcon />}
                  onClick={() => getDirections(selectedProperty.position)}
                  fullWidth
                >
                  Get Directions
                </Button>
              </Grid>
              <Grid item xs={6} md={2}>
                {/* Changed this button to navigate to the appropriate page */}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigateToPropertyPage(selectedProperty)}
                  fullWidth
                >
                  View Details
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default BangladeshMap;