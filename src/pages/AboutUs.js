import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider,
  Paper,
  Button,
  Avatar,
  Stack,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VerifiedIcon from '@mui/icons-material/Verified';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import images
import dhaka2 from '../pictures/dhaka2.jpg';
import logo from '../pictures/logo.png';
import person1 from '../pictures/Person1.jpg';
import person2 from '../pictures/Person2.jpg';
import person3 from '../pictures/Person3.jpg';

// Styled components for animated elements
const AnimatedBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(43, 123, 140, 0.8), rgba(43, 123, 140, 0))',
  zIndex: 1,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 20px rgba(43, 123, 140, 0.3)',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const TeamCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(11, 31, 35, 0.1)',
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.background.default}, ${theme.palette.primary.main}, ${theme.palette.background.default})`,
  height: '3px',
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'visible',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(11, 31, 35, 0.1)',
  height: '100%',
}));

const QuoteAvatar = styled(Avatar)(({ theme }) => ({
  position: 'absolute',
  top: -20,
  left: 20,
  width: 60,
  height: 60,
  boxShadow: '0 4px 12px rgba(43, 123, 140, 0.3)',
  backgroundColor: theme.palette.primary.main,
  zIndex: 2,
}));

function AboutUs() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Team members data
  const teamMembers = [
    {
      name: 'Rahim Ahmed',
      position: 'Founder & CEO',
      bio: 'With over 15 years in Bangladeshi real estate, Rahim brings unparalleled market knowledge and a vision for connecting homebuyers with their perfect properties.',
      image: person1,
    },
    {
      name: 'Nusrat Jahan',
      position: 'Chief Operations Officer',
      bio: 'Nusrat ensures our client-focused approach is seamlessly implemented across all operations, maintaining our commitment to exceptional service.',
      image: person2,
    },
    {
      name: 'Kamal Hossain',
      position: 'Head of Property Acquisition',
      bio: 'Leveraging deep connections throughout Bangladesh, Kamal sources the finest properties while maintaining our standards for quality and value.',
      image: person3,
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Asif Rahman',
      location: 'Gulshan, Dhaka',
      quote: 'BanglaGhor found me the perfect apartment in Gulshan when other agencies said my requirements were impossible. Their dedication is unmatched!',
      image: person1,
    },
    {
      name: 'Fatima Begum',
      location: 'Chittagong',
      quote: "The BanglaGhor team made my first home purchase stress-free and exciting. They guided me through financing options I didn't know existed.",
      image: person2,
    },
    {
      name: 'Mohammed Haque',
      location: 'Dhanmondi, Dhaka',
      quote: "As a property investor, I appreciate BanglaGhor's market insights and professional approach. They've helped me build a profitable portfolio.",
      image: person3,
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative', 
          height: { xs: '50vh', md: '70vh' }, 
          overflow: 'hidden',
          mb: 6 
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${dhaka2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(rgba(11, 31, 35, 0.6), rgba(43, 123, 140, 0.8))',
            }
          }}
        />
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <Box sx={{ 
            textAlign: 'center',
            p: { xs: 2, md: 4 },
            backgroundColor: 'rgba(11, 31, 35, 0.5)',
            backdropFilter: 'blur(5px)',
            borderRadius: 4,
            maxWidth: { xs: '100%', md: '80%' },
            mx: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(20px)',
            animation: 'fadeInUp 0.8s ease-out forwards',
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(40px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}>
            <Typography 
              variant="h1" 
              component="h1" 
              color="white" 
              fontWeight="bold"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  width: '100px',
                  height: '4px',
                  backgroundColor: theme.palette.secondary.main,
                  transform: 'translateX(-50%)'
                }
              }}
            >
              About BanglaGhor
            </Typography>
            <Typography 
              variant="h5" 
              color="white"
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                fontWeight: 300,
                lineHeight: 1.6,
                textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)',
                mb: 4
              }}
            >
              Connecting Bangladeshis with the homes of their dreams since 2010
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(43, 123, 140, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(43, 123, 140, 0.6)',
                }
              }}
              onClick={() => navigate('/properties/rent')}
            >
              Explore Properties
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" color="primary" fontWeight="bold" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2010 in the heart of Dhaka, BanglaGhor was born from a simple observation: finding the perfect home in Bangladesh's dynamic real estate landscape was unnecessarily complex and frustrating.
            </Typography>
            <Typography variant="body1" paragraph>
              Our founder, Rahim Ahmed, envisioned a different approach—one that combined deep local expertise with modern technology and unwavering commitment to client satisfaction. From our humble beginnings with just three employees, we've grown to become Bangladesh's most trusted real estate partner.
            </Typography>
            <Typography variant="body1" paragraph>
              Today, BanglaGhor proudly serves communities across Dhaka, Chittagong, Sylhet, and beyond. We've helped thousands of families find not just houses, but homes where their futures can flourish. Our journey continues as we innovate and expand, but our core mission remains unchanged: making the joy of home ownership accessible to every Bangladeshi family.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <AnimatedBox>
              <Box
                component="img"
                src={logo}
                alt="BanglaGhor Logo"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 12px 24px rgba(11, 31, 35, 0.15)',
                }}
              />
              <GradientOverlay />
            </AnimatedBox>
          </Grid>
        </Grid>

        {/* Values Section */}
        <GradientDivider />

        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" color="primary" fontWeight="bold" gutterBottom>
            Our Values
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            These principles guide everything we do at BanglaGhor
          </Typography>

          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <LocationOnIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Local Expertise
                </Typography>
                <Typography variant="body2">
                  Our deep understanding of Bangladesh's neighborhoods, market trends, and cultural nuances ensures we match you with properties that truly meet your needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <HandshakeIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Client First
                </Typography>
                <Typography variant="body2">
                  We measure success by your satisfaction. Our approach is consultative, not transactional, focusing on long-term relationships over quick sales.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <VerifiedIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Transparency
                </Typography>
                <Typography variant="body2">
                  Clear communication, honest advice, and no hidden fees. We believe in building trust through complete transparency at every step.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <ApartmentIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Quality Assurance
                </Typography>
                <Typography variant="body2">
                  Every property in our portfolio undergoes rigorous verification for legal compliance, structural integrity, and fair valuation.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <HomeWorkIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Innovation
                </Typography>
                <Typography variant="body2">
                  We continually embrace new technologies and approaches to make your property journey smoother, faster, and more enjoyable.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(43, 123, 140, 0.05)', borderRadius: 2 }}>
                <StyledAvatar>
                  <FavoriteIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="medium">
                  Community Impact
                </Typography>
                <Typography variant="body2">
                  We're committed to sustainable development and giving back to Bangladeshi communities through various social initiatives.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box 
          sx={{ 
            py: 6, 
            px: { xs: 2, md: 6 },
            borderRadius: 4,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            mb: 8
          }}
        >
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h2" fontWeight="bold">
                13+
              </Typography>
              <Typography variant="body1">
                Years in Business
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" fontWeight="bold">
                5,200+
              </Typography>
              <Typography variant="body1">
                Properties Sold
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" fontWeight="bold">
                98%
              </Typography>
              <Typography variant="body1">
                Client Satisfaction
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" fontWeight="bold">
                7
              </Typography>
              <Typography variant="body1">
                Offices Nationwide
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Team Section */}
        <GradientDivider />
        
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" color="primary" fontWeight="bold" gutterBottom>
            Our Leadership Team
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            Meet the experts dedicated to your property success
          </Typography>

          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TeamCard>
                  <CardMedia
                    component="img"
                    height="280"
                    image={member.image}
                    alt={member.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.position}
                    </Typography>
                    <Typography variant="body2">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </TeamCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials */}
        <GradientDivider />
        
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" color="primary" fontWeight="bold" gutterBottom>
            Client Experiences
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            What our clients say about working with BanglaGhor
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialCard>
                  <QuoteAvatar src={testimonial.image} alt={testimonial.name} />
                  <CardContent sx={{ pt: 5, pb: 3 }}>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', minHeight: '120px' }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.location}
                    </Typography>
                  </CardContent>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(43, 123, 140, 0.05)',
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Find Your Dream Property?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Take the first step toward your next home with Bangladesh's most trusted real estate partner
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              size="large" 
              color="primary"
              onClick={() => navigate('/properties/rent')}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem'
              }}
            >
              Browse Properties
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              color="primary"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem'
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutUs;