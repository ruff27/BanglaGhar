import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Slide,
  IconButton,
  useTheme,
  Chip
} from '@mui/material';
import { 
  Home as HomeIcon, 
  LocationOn as LocationIcon, 
  BedOutlined as BedIcon, 
  BathtubOutlined as BathIcon, 
  SquareFootOutlined as AreaIcon,
  FavoriteOutlined as FavoriteIcon,
  Close as CloseIcon,
  CheckCircleOutline as SoldIcon
} from '@mui/icons-material';

// Import house images
// Note: In a real application, you would handle these imports differently
// or use a backend API to get the image URLs
import house1 from '../pictures/house1.png';
import house2 from '../pictures/house2.png';
import house3 from '../pictures/house3.png';

// Transition for dialog opening
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// House data - in a real app this would come from an API
const housesData = [
  {
    id: 1,
    title: "Modern Family Home",
    address: "123 Riverside Drive, Dhaka",
    price: "৳1,85,00,000",
    sold: "January 15, 2025",
    image: house1,
    beds: 4,
    baths: 3,
    area: 2400,
    description: "This elegantly designed modern family home offers spacious living areas with high ceilings and abundant natural light. Features include a gourmet kitchen with premium appliances, master suite with luxury bath, and a beautifully landscaped garden.",
    features: ["Smart Home System", "Solar Panels", "Garden"]
  },
  {
    id: 2,
    title: "Luxury Villa with Pool",
    address: "456 Palm Avenue, Gulshan",
    price: "৳2,50,00,000",
    sold: "December 20, 2024",
    image: house2,
    beds: 5,
    baths: 4,
    area: 3200,
    description: "An exquisite luxury villa featuring an infinity pool with stunning city views. This property boasts a grand entrance, marble flooring throughout, chef's kitchen, home theater, and an expansive outdoor entertainment area perfect for hosting gatherings.",
    features: ["Infinity Pool", "Home Theater", "Parking"]
  },
  {
    id: 3,
    title: "Contemporary Urban Townhouse",
    address: "789 Central Avenue, Dhanmondi",
    price: "৳1,20,00,000",
    sold: "February 3, 2025",
    image: house3,
    beds: 3,
    baths: 2,
    area: 1800,
    description: "Stylish townhouse in prime urban location, offering modern design with an open concept floor plan. Features include floor-to-ceiling windows, custom cabinetry, rooftop terrace with city views, and energy-efficient appliances.",
    features: ["Rooftop Terrace", "Hardwood Floors", "Washer/Dryer"]
  }
];

const Sold = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [animate, setAnimate] = useState(false);
  
  // Add animation effect when component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);

  const handleOpenDialog = (house) => {
    setSelectedHouse(house);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ py: 6, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box mb={5} sx={{ 
          textAlign: 'center',
          position: 'relative',
          pb: 3,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '3px',
            background: 'linear-gradient(to right, transparent, #2B7B8C, transparent)',
            borderRadius: '50px',
          }
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold" 
            color="text.primary"
            sx={{ 
              position: 'relative',
              display: 'inline-block',
              mb: 2,
              opacity: animate ? 1 : 0,
              transform: animate ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              letterSpacing: '1px'
            }}
          >
            Recently Sold Properties
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            mb={1}
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              opacity: animate ? 1 : 0,
              transform: animate ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              transitionDelay: '150ms'
            }}
          >
            Explore our collection of recently sold premium properties showcasing the latest market trends
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {housesData.map((house) => (
            <Grid item xs={12} sm={6} md={4} key={house.id}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.5s ease-in-out, box-shadow 0.5s ease-in-out, opacity 0.8s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(43, 123, 140, 0.15)',
                  },
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${house.id * 150}ms`,
                  backgroundColor: 'white'
                }}
              >
                {/* Type Badge */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    left: 16, 
                    zIndex: 2,
                    backgroundColor: 'white',
                    color: '#2B7B8C',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 5,
                    fontWeight: 'medium',
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                    border: '1px solid rgba(43, 123, 140, 0.2)'
                  }}
                >
                  {house.id === 2 ? 'HOUSE' : 'APARTMENT'}
                </Box>

                {/* Favorite Button */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 2,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <FavoriteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Main image with price overlay */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={house.image}
                    alt={house.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  {/* Price overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      color: 'white',
                      padding: 2,
                      paddingBottom: 1.5,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                      textAlign: 'left'
                    }}
                  >
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 'bold', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
                      {house.id === 1 ? '৳12,000/mo' : house.id === 2 ? '৳24,000/mo' : '৳15,000/mo'}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, pb: 2 }}>
                  {/* Title and location */}
                  <Typography variant="h6" component="h2" fontWeight="bold" mb={0.5} color="text.primary" sx={{
                    fontSize: '1.1rem',
                    lineHeight: 1.3
                  }}>
                    {house.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="flex-start" mb={3}>
                    <LocationIcon fontSize="small" sx={{ color: theme.palette.primary.main, mr: 0.5, mt: 0.3, fontSize: '1rem' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      {house.address}
                    </Typography>
                  </Box>

                  {/* Property details */}
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    backgroundColor: '#f7f9fa',
                    borderRadius: 2,
                    p: 2
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        Bedrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="medium" color="text.primary" sx={{ fontSize: '1.25rem' }}>
                        {house.beds}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        Bathrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="medium" color="text.primary" sx={{ fontSize: '1.25rem' }}>
                        {house.baths}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        Area
                      </Typography>
                      <Typography variant="h6" fontWeight="medium" color="text.primary" sx={{ fontSize: '1.25rem' }}>
                        {house.area} ft²
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {house.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(239, 249, 254, 1)',
                          color: '#2B7B8C',
                          fontWeight: 'medium',
                          fontSize: '0.75rem',
                          borderRadius: '20px',
                          height: '28px'
                        }}
                      />
                    ))}
                  </Box>

                  {/* View details button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenDialog(house)}
                    sx={{
                      backgroundColor: '#2B7B8C',
                      color: 'white',
                      py: 1.5,
                      borderRadius: 1,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#1d5966',
                      },
                      fontWeight: 'medium',
                      boxShadow: 'none',
                      height: '48px'
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Property Detail Dialog */}
      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          }
        }}
      >
        {selectedHouse && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: { xs: 2, sm: 3 },
              py: 2
            }}>
              <Box>
                <Typography variant="h6" component="h2" fontWeight="bold">
                  {selectedHouse.title}
                </Typography>
                <Box display="flex" alignItems="center">
                  <LocationIcon fontSize="small" sx={{ color: theme.palette.primary.main, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {selectedHouse.address}
                  </Typography>
                </Box>
              </Box>
              <IconButton edge="end" color="inherit" onClick={handleCloseDialog} aria-label="close">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box 
                    component="img" 
                    src={selectedHouse.image} 
                    alt={selectedHouse.title}
                    sx={{ 
                      width: '100%', 
                      borderRadius: 2,
                      objectFit: 'cover',
                      mb: 2,
                      maxHeight: { xs: '300px', md: '400px' }
                    }}
                  />
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip 
                      icon={<SoldIcon fontSize="small" />} 
                      label={`Sold on ${selectedHouse.sold}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {selectedHouse.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom fontWeight="bold" mt={3}>
                    Key Features
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedHouse.features.map((feature, index) => (
                      <Chip 
                        key={index} 
                        label={feature} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(43, 123, 140, 0.1)',
                          color: theme.palette.primary.main,
                          borderRadius: 1
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Card elevation={0} sx={{ 
                    backgroundColor: 'rgba(43, 123, 140, 0.05)', 
                    p: 2,
                    borderRadius: 2,
                    mb: 3
                  }}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main" mb={2}>
                      {selectedHouse.price}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Bedrooms
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <BedIcon sx={{ color: theme.palette.primary.main, mr: 0.5 }} />
                            <Typography variant="body1" fontWeight="medium">
                              {selectedHouse.beds}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Bathrooms
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <BathIcon sx={{ color: theme.palette.primary.main, mr: 0.5 }} />
                            <Typography variant="body1" fontWeight="medium">
                              {selectedHouse.baths}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Area
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <AreaIcon sx={{ color: theme.palette.primary.main, mr: 0.5 }} />
                            <Typography variant="body1" fontWeight="medium">
                              {selectedHouse.area} ft²
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                  
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Contact Agent
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'white', 
                    p: 2, 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box 
                        component="div"
                        sx={{ 
                          backgroundColor: 'rgba(43, 123, 140, 0.1)',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <HomeIcon sx={{ color: theme.palette.primary.main }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          BanglaGhar Realty
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Premier Property Specialists
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ 
                        mb: 1.5,
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: '#1d5966',
                        },
                        borderRadius: 2
                      }}
                    >
                      Call Agent
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      sx={{ 
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: '#1d5966',
                          backgroundColor: 'rgba(43, 123, 140, 0.05)',
                        },
                        borderRadius: 2
                      }}
                    >
                      Email Agent
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Sold;