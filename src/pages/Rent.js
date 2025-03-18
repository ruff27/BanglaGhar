import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  InputAdornment, 
  Chip, 
  IconButton, 
  Paper, 
  Drawer, 
  Divider,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';

import { 
  Search as SearchIcon, 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon, 
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Bathtub as BathtubIcon,
  Bed as BedIcon,
  SquareFoot as SquareFootIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import House1 from '../pictures/house1.png';
import House2 from '../pictures/house2.png';
import House3 from '../pictures/house3.png';

// Updated property data - ensuring bedrooms are at least 1 and bathrooms are at least 1
const properties = [
  {
    id: 1,
    title: "Modern 1-Bedroom Apartment",
    location: "Downtown Dhaka",
    price: 12000,
    bedrooms: 1, // Changed from 0 to 1
    bathrooms: 1,
    area: 450,
    type: "apartment",
    image: House1,
    rating: 4.7,
    features: ["Pet Friendly", "Gym", "Parking"]
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
    image: House2,
    rating: 4.3,
    features: ["Garden", "Parking", "Washer/Dryer"]
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
    image: House3,
    rating: 4.5,
    features: ["Balcony", "Hardwood Floors"]
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
    image: House1,
    rating: 4.9,
    features: ["Doorman", "Gym", "Pool", "Pet Friendly"]
  },
  {
    id: 5,
    title: "Modern 1-Bedroom Loft",
    location: "Old Dhaka",
    price: 13500,
    bedrooms: 1, // Changed from 0 to 1
    bathrooms: 1,
    area: 500,
    type: "loft",
    image: House2,
    rating: 4.2,
    features: ["High Ceilings", "Exposed Brick"]
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
    image: House3,
    rating: 4.8,
    features: ["Lake View", "Balcony", "Parking"]
  }
];

const Rent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([5000, 40000]);
  const [propertyType, setPropertyType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // New states for bedroom and bathroom filters
  const [bedroomFilter, setBedroomFilter] = useState(0); // 0 means any
  const [bathroomFilter, setBathroomFilter] = useState(0); // 0 means any
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  const handlePropertyTypeChange = (event) => {
    setPropertyType(event.target.value);
  };
  
  const handleBedroomFilterChange = (value) => {
    setBedroomFilter(value === bedroomFilter ? 0 : value);
  };
  
  const handleBathroomFilterChange = (value) => {
    setBathroomFilter(value === bathroomFilter ? 0 : value);
  };
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setDetailsDialogOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
  };
  
  const filteredProperties = properties
    .filter(property => property.price >= priceRange[0] && property.price <= priceRange[1])
    .filter(property => propertyType === 'all' || property.type === propertyType)
    .filter(property => 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Filter by number of bedrooms
    .filter(property => bedroomFilter === 0 || property.bedrooms === bedroomFilter)
    // Filter by number of bathrooms
    .filter(property => bathroomFilter === 0 || property.bathrooms === bathroomFilter);
    
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    // Rating sort option removed
    return 0; // recommended - no specific sort
  });
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      pt: 2
    }}>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        {/* Modern Enhanced Search & Filter Bar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 4, 
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 15px 50px rgba(0,0,0,0.08)',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Search Input with Enhanced Styling */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search locations, properties..."
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
                      <IconButton 
                        size="small" 
                        onClick={() => setSearchTerm('')}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    height: 56,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 1,
                    },
                  },
                }}
              />
            </Grid>
            
            {/* Enhanced Property Type Selector */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="property-type-label">Property Type</InputLabel>
                <Select
                  labelId="property-type-label"
                  id="property-type"
                  value={propertyType}
                  onChange={handlePropertyTypeChange}
                  label="Property Type"
                  sx={{
                    borderRadius: 3,
                    height: 56,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Properties</MenuItem>
                  <MenuItem value="apartment">Apartments</MenuItem>
                  <MenuItem value="house">Houses</MenuItem>
                  <MenuItem value="condo">Condos</MenuItem>
                  <MenuItem value="loft">Lofts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Enhanced Bedroom Selector */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="bedroom-label">Bedrooms</InputLabel>
                <Select
                  labelId="bedroom-label"
                  id="bedroom-select"
                  value={bedroomFilter}
                  onChange={(e) => setBedroomFilter(e.target.value)}
                  label="Bedrooms"
                  sx={{
                    borderRadius: 3,
                    height: 56,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value={0}>Any</MenuItem>
                  <MenuItem value={1}>1 Bedroom</MenuItem>
                  <MenuItem value={2}>2 Bedrooms</MenuItem>
                  <MenuItem value={3}>3 Bedrooms</MenuItem>
                  <MenuItem value={4}>4+ Bedrooms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Enhanced Bathroom Selector */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="bathroom-label">Bathrooms</InputLabel>
                <Select
                  labelId="bathroom-label"
                  id="bathroom-select"
                  value={bathroomFilter}
                  onChange={(e) => setBathroomFilter(e.target.value)}
                  label="Bathrooms"
                  sx={{
                    borderRadius: 3,
                    height: 56,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value={0}>Any</MenuItem>
                  <MenuItem value={1}>1 Bathroom</MenuItem>
                  <MenuItem value={2}>2 Bathrooms</MenuItem>
                  <MenuItem value={3}>3+ Bathrooms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Search Button */}
            <Grid item xs={6} md={3}>
              <Button 
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  height: 56,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          {/* Improved Price Slider and Sort */}
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box sx={{ width: { xs: '100%', md: '70%' } }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Price Range: ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                min={5000}
                max={40000}
                step={1000}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `৳${value.toLocaleString()}`}
                sx={{
                  color: theme.palette.primary.main,
                  height: 8,
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    border: `2px solid ${theme.palette.primary.main}`,
                    '&:focus, &:hover': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                  '& .MuiSlider-track': {
                    height: 8,
                    borderRadius: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.24),
                  },
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
              <Typography 
                variant="subtitle1" 
                fontWeight="medium" 
                color="text.secondary"
                sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
              >
                Sort By:
              </Typography>
              
              <FormControl fullWidth sx={{ maxWidth: { xs: '100%', md: 200 } }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: 3,
                    height: 48,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value="recommended">Recommended</MenuItem>
                  <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                  <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Active Filters Section - Optional */}
          {(searchTerm || propertyType !== 'all' || bedroomFilter !== 0 || bathroomFilter !== 0 || priceRange[0] !== 5000 || priceRange[1] !== 40000) && (
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Active Filters:
              </Typography>
              
              {searchTerm && (
                <Chip 
                  label={`Search: ${searchTerm}`}
                  onDelete={() => setSearchTerm('')}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
              
              {propertyType !== 'all' && (
                <Chip 
                  label={propertyType.charAt(0).toUpperCase() + propertyType.slice(1) + 's'}
                  onDelete={() => setPropertyType('all')}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
              
              {bedroomFilter !== 0 && (
                <Chip 
                  label={`${bedroomFilter} Bedroom${bedroomFilter > 1 ? 's' : ''}`}
                  onDelete={() => setBedroomFilter(0)}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
              
              {bathroomFilter !== 0 && (
                <Chip 
                  label={`${bathroomFilter} Bathroom${bathroomFilter > 1 ? 's' : ''}`}
                  onDelete={() => setBathroomFilter(0)}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
              
              {(priceRange[0] !== 5000 || priceRange[1] !== 40000) && (
                <Chip 
                  label={`৳${priceRange[0].toLocaleString()} - ৳${priceRange[1].toLocaleString()}`}
                  onDelete={() => setPriceRange([5000, 40000])}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
              
              <Button 
                size="small"
                sx={{ 
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                }}
                onClick={() => {
                  setSearchTerm('');
                  setPropertyType('all');
                  setBedroomFilter(0);
                  setBathroomFilter(0);
                  setPriceRange([5000, 40000]);
                }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Paper>
        
        {/* Results Section */}
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            {sortedProperties.length} Properties Available
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 1 }}>
              View:
            </Typography>
            <IconButton 
              size="small" 
              sx={{ color: theme.palette.primary.main }}
              onClick={toggleDrawer}
            >
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Enhanced Property Grid */}
        <Grid container spacing={3}>
          {sortedProperties.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.08),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': { 
                    transform: 'translateY(-10px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiCardMedia-root': {
                      transform: 'scale(1.05)',
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={property.image}
                    alt={property.title}
                    sx={{ 
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12, 
                      bgcolor: 'white',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                      '&:hover': { 
                        bgcolor: 'white',
                        transform: 'scale(1.1)',
                      },
                      transition: 'transform 0.2s ease',
                    }}
                    onClick={() => toggleFavorite(property.id)}
                  >
                    {favorites.includes(property.id) ? (
                      <FavoriteIcon sx={{ color: theme.palette.secondary.main }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: theme.palette.text.secondary }} />
                    )}
                  </IconButton>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: alpha('#fff', 0.9),
                      borderRadius: '8px',
                      px: 1.5,
                      py: 0.5,
                      fontWeight: 'bold',
                      color: property.type === 'apartment' ? '#4CAF50' : 
                             property.type === 'house' ? '#FF9800' : 
                             property.type === 'condo' ? '#2196F3' : 
                             property.type === 'loft' ? '#9C27B0' : '#757575',
                      border: '2px solid',
                      borderColor: property.type === 'apartment' ? '#4CAF50' : 
                                  property.type === 'house' ? '#FF9800' : 
                                  property.type === 'condo' ? '#2196F3' : 
                                  property.type === 'loft' ? '#9C27B0' : '#757575',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      p: 2,
                      pt: 4,
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
                      ৳{property.price.toLocaleString()}/mo
                    </Typography>
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      }
                    }}
                  >
                    {property.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOnIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.location}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 2,
                      my: 3,
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Bedrooms
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {property.bedrooms}
                      </Typography>
                    </Box>

                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Bathrooms
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {property.bathrooms}
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Area
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {property.area} ft²
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {property.features.map((feature, index) => (
                      <Chip 
                        key={index} 
                        label={feature} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={() => handleViewDetails(property)}
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      py: 1.5,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* No Results */}
        {sortedProperties.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No properties match your search criteria
            </Typography>
            <Button 
              startIcon={<FilterListIcon />}
              onClick={() => {
                setPriceRange([5000, 40000]);
                setPropertyType('all');
                setSearchTerm('');
                setBedroomFilter(0);
                setBathroomFilter(0);
              }}
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}10`
                }
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Container>
      
      {/* Filter Drawer - slides in from right */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 280, p: 3 }}
          role="presentation"
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
            Filter Properties
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Property Type
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={propertyType}
                onChange={handlePropertyTypeChange}
                displayEmpty
              >
                <MenuItem value="all">All Properties</MenuItem>
                <MenuItem value="apartment">Apartments</MenuItem>
                <MenuItem value="house">Houses</MenuItem>
                <MenuItem value="condo">Condos</MenuItem>
                <MenuItem value="loft">Lofts</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Price Range
            </Typography>
            <Typography variant="body2" gutterBottom>
              ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              min={5000}
              max={40000}
              step={1000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `৳${value.toLocaleString()}`}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Bedrooms
            </Typography>
            <Box display="flex" gap={1}>
              {[1, 2, 3, 4].map((num) => (
                <Chip 
                  key={num} 
                  label={num}
                  sx={{ 
                    bgcolor: bedroomFilter === num ? theme.palette.primary.main : theme.palette.background.default,
                    color: bedroomFilter === num ? 'white' : 'inherit',
                    '&:hover': { 
                      bgcolor: bedroomFilter === num ? theme.palette.primary.dark : theme.palette.primary.light,
                      color: 'white' 
                    }
                  }}
                  onClick={() => handleBedroomFilterChange(num)}
                  clickable
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Bathrooms
            </Typography>
            <Box display="flex" gap={1}>
              {[1, 2, 3, 4].map((num) => (
                <Chip 
                  key={num} 
                  label={num}
                  sx={{ 
                    bgcolor: bathroomFilter === num ? theme.palette.primary.main : theme.palette.background.default,
                    color: bathroomFilter === num ? 'white' : 'inherit',
                    '&:hover': { 
                      bgcolor: bathroomFilter === num ? theme.palette.primary.dark : theme.palette.primary.light,
                      color: 'white' 
                    }
                  }}
                  onClick={() => handleBathroomFilterChange(num)}
                  clickable
                />
              ))}
            </Box>
          </Box>
          
          <Box display="flex" gap={2} mt={4}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setPriceRange([5000, 40000]);
                setPropertyType('all');
                setSearchTerm('');
                setBedroomFilter(0);
                setBathroomFilter(0);
              }}
              sx={{ 
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderRadius: 2
              }}
            >
              Reset
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={toggleDrawer}
              sx={{ 
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.main
                },
                borderRadius: 2
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>
      
      {/* Property Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          } 
        }}
        sx={{ 
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2, md: 3 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)', md: 'calc(100% - 48px)' },
            maxWidth: '900px',
          }
        }}
      >
        {selectedProperty && (
          <>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="300"
                image={selectedProperty.image}
                alt={selectedProperty.title}
                sx={{ 
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                  {selectedProperty.title}
                </Typography>
                <Box display="flex" alignItems="center">
                  <LocationOnIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{selectedProperty.location}</Typography>
                </Box>
              </Box>
              <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bgcolor: alpha('#fff', 0.9),
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  fontWeight: 'bold',
                  color: selectedProperty.type === 'apartment' ? '#4CAF50' : 
                         selectedProperty.type === 'house' ? '#FF9800' : 
                         selectedProperty.type === 'condo' ? '#2196F3' : 
                         selectedProperty.type === 'loft' ? '#9C27B0' : '#757575',
                  border: '2px solid',
                  borderColor: selectedProperty.type === 'apartment' ? '#4CAF50' : 
                              selectedProperty.type === 'house' ? '#FF9800' : 
                              selectedProperty.type === 'condo' ? '#2196F3' : 
                              selectedProperty.type === 'loft' ? '#9C27B0' : '#757575',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <HomeIcon sx={{ mr: 1 }} />
                {selectedProperty.type.charAt(0).toUpperCase() + selectedProperty.type.slice(1)}
              </Box>
            </Box>
            
            <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    ৳{selectedProperty.price.toLocaleString()}<Typography component="span" variant="h6" color="text.secondary">/month</Typography>
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={favorites.includes(selectedProperty.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => toggleFavorite(selectedProperty.id)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      backgroundColor: favorites.includes(selectedProperty.id) ? theme.palette.secondary.main : theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: favorites.includes(selectedProperty.id) ? theme.palette.secondary.dark : theme.palette.primary.dark,
                      }
                    }}
                  >
                    {favorites.includes(selectedProperty.id) ? 'Saved' : 'Save'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Property Overview</Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                        gap: 3,
                        mb: 4,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BedIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Bedrooms</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedProperty.bedrooms}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BathtubIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedProperty.bathrooms}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SquareFootIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Area</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedProperty.area} ft²</Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Description</Typography>
                    <Typography paragraph>
                      This beautiful {selectedProperty.bedrooms} bedroom {selectedProperty.type} is located in the heart of {selectedProperty.location}. 
                      Enjoy modern amenities and a spacious layout with {selectedProperty.area} square feet of living space.
                      The property features {selectedProperty.bathrooms} well-appointed bathroom{selectedProperty.bathrooms > 1 ? 's' : ''} and 
                      is close to shopping, dining, and entertainment options.
                    </Typography>
                    <Typography paragraph>
                      Perfect for {selectedProperty.bedrooms > 1 ? 'families or roommates' : 'individuals or couples'}, 
                      this {selectedProperty.type} offers comfort and convenience in one of the most desirable neighborhoods in Dhaka.
                    </Typography>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, mt: 4 }}>Features & Amenities</Typography>
                    <Grid container spacing={2}>
                      {selectedProperty.features.map((feature, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                            <Typography>{feature}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Contact Agent</Typography>
                      
                      <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        margin="normal"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Your Email"
                        variant="outlined"
                        margin="normal"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Your Phone"
                        variant="outlined"
                        margin="normal"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Message"
                        variant="outlined"
                        multiline
                        rows={4}
                        margin="normal"
                        defaultValue={`I'm interested in this ${selectedProperty.bedrooms} bedroom ${selectedProperty.type} in ${selectedProperty.location}.`}
                        sx={{ mb: 3 }}
                      />
                      
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                          }
                        }}
                      >
                        Contact Agent
                      </Button>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                        <InfoIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Your information will not be shared with third parties
                        </Typography>
                      </Box>
                    </Paper>
                    
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), mt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Location</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {selectedProperty.location}, Dhaka, Bangladesh
                      </Typography>
                      <Box 
                        sx={{ 
                          height: 150, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px dashed',
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        }}
                      >
                        <Typography color="text.secondary">Map Preview</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                variant="outlined" 
                onClick={handleCloseDetails}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  mr: 'auto',
                }}
              >
                Back to Results
              </Button>
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                  }
                }}
              >
                Schedule a Tour
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Rent;