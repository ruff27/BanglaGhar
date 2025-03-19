import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Card, 
  CardContent, 
  Divider,
  IconButton,
  useMediaQuery,
  Snackbar,
  Alert,
  styled,
  CircularProgress
} from '@mui/material';
import { 
  Phone, 
  Email, 
  LocationOn, 
  WhatsApp, 
  Facebook, 
  Instagram, 
  LinkedIn,
  Send
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Custom styled components
const ContactCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(43, 123, 140, 0.2)',
  },
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
}));

const ContactTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  margin: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.15)',
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.light}`,
    outlineOffset: '2px',
  },
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: '12px 24px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const MapContainer = styled(Box)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
  height: '100%',
  minHeight: '300px',
}));

const WavePattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100px',
  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='0.25' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='0.5' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%232B7B8C'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundSize: 'cover',
  opacity: 0.1,
}));

// Social media links with proper aria labels
const socialLinks = [
  { 
    icon: <Facebook />, 
    label: 'Facebook', 
    url: 'https://facebook.com/banglaghor' 
  },
  { 
    icon: <Instagram />, 
    label: 'Instagram', 
    url: 'https://instagram.com/banglaghor' 
  },
  { 
    icon: <LinkedIn />, 
    label: 'LinkedIn', 
    url: 'https://linkedin.com/company/banglaghor' 
  },
  { 
    icon: <WhatsApp />, 
    label: 'WhatsApp', 
    url: 'https://wa.me/8801234567890' 
  },
];

// FAQ content separated for better management
const faqContent = [
  {
    question: 'How do I schedule a property viewing?',
    answer: 'You can schedule a property viewing by filling out our contact form, calling our office, or sending us an email with your preferred date and time.'
  },
  {
    question: 'What areas do you serve in Bangladesh?',
    answer: 'We currently serve major cities including Dhaka, Chittagong, Sylhet, Rajshahi, and Khulna, with plans to expand to other regions soon.'
  },
  {
    question: 'Do you handle commercial properties?',
    answer: 'Yes, we handle both residential and commercial properties. Our experts can help you find the perfect space for your business needs.'
  },
  {
    question: 'What documents do I need for property registration?',
    answer: 'Property registration typically requires national ID, TIN certificate, passport-sized photos, and property documents. Our team will guide you through the process.'
  }
];

// Main Contact component
const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: '',
  });
  
  // Memoized form change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    return errors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Form submission logic would go here
      
      // Show success message
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Thank you for contacting BanglaGhor! We will get back to you soon.',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        py: 8,
        overflow: 'hidden',
      }}
    >
      <WavePattern />
      
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              color: theme.palette.primary.main,
              position: 'relative',
              display: 'inline-block',
              mb: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '2px',
              },
            }}
          >
            Get in Touch
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Find your perfect home in Bangladesh. Our real estate experts are ready to assist you every step of the way.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3} direction="column">
              <Grid item>
                <ContactCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Phone color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Call Us</Typography>
                    </Box>
                    <Box 
                      component="a" 
                      href="tel:+8801234567890" 
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        +880 1234-567890
                      </Typography>
                    </Box>
                    
                    <Box 
                      component="a" 
                      href="tel:+8801987654321" 
                      sx={{ textDecoration: 'none', color: 'inherit', mt: 0.5, display: 'block' }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        +880 1987-654321
                      </Typography>
                    </Box>
                  </CardContent>
                </ContactCard>
              </Grid>
              
              <Grid item>
                <ContactCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Email color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Email Us</Typography>
                    </Box>
                    <Box 
                      component="a" 
                      href="mailto:info@banglaghor.com" 
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        info@banglaghor.com
                      </Typography>
                    </Box>
                    
                    <Box 
                      component="a" 
                      href="mailto:sales@banglaghor.com" 
                      sx={{ textDecoration: 'none', color: 'inherit', mt: 0.5, display: 'block' }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        sales@banglaghor.com
                      </Typography>
                    </Box>
                  </CardContent>
                </ContactCard>
              </Grid>
              
              <Grid item>
                <ContactCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Visit Us</Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                      House #42, Road #11, Banani
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Dhaka 1213, Bangladesh
                    </Typography>
                  </CardContent>
                </ContactCard>
              </Grid>
              
              <Grid item>
                <ContactCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="h6">Connect With Us</Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                      {socialLinks.map((social) => (
                        <AnimatedIconButton 
                          key={social.label}
                          aria-label={social.label}
                          component="a"
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.icon}
                        </AnimatedIconButton>
                      ))}
                    </Box>
                  </CardContent>
                </ContactCard>
              </Grid>
            </Grid>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(239, 249, 254, 0.9) 100%)`,
                boxShadow: '0 10px 30px rgba(43, 123, 140, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: `linear-gradient(
                    135deg, 
                    transparent 0%, 
                    ${theme.palette.primary.main}22 100%
                  )`,
                  borderRadius: '0 0 0 100%',
                }}
              />
              
              <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
                Send Us a Message
              </Typography>
              
              <form 
                onSubmit={handleSubmit} 
                noValidate
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ContactTextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      inputProps={{
                        'aria-label': 'Your Name',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactTextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      inputProps={{
                        'aria-label': 'Email Address',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactTextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      inputProps={{
                        'aria-label': 'Phone Number',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactTextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!formErrors.subject}
                      helperText={formErrors.subject}
                      inputProps={{
                        'aria-label': 'Subject',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      fullWidth
                      label="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                      inputProps={{
                        'aria-label': 'Your Message',
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box 
                  display="flex" 
                  justifyContent="flex-end" 
                  mt={3}
                >
                  <StyledSubmitButton
                    type="submit"
                    variant="contained"
                    endIcon={isSubmitting ? 
                      <CircularProgress size={20} color="inherit" /> : 
                      <Send />
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </StyledSubmitButton>
                </Box>
              </form>
            </Paper>

            {/* Office Location Map */}
            <Box mt={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 0,
                  borderRadius: '12px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  height: '350px',
                  overflow: 'hidden',
                }}
              >
                <MapContainer>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14602.254272231177!2d90.39594383955077!3d23.794774899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c15010fcb%3A0x97b01827b13ad346!2sBanani%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1711413114183!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BanglaGhor Office Location"
                  ></iframe>
                </MapContainer>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* FAQs Section */}
        <Box mt={8}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="medium" sx={{ mb: 4 }}>
            Frequently Asked Questions
          </Typography>
          
          <Grid container spacing={3}>
            {faqContent.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ContactCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      {faq.question}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </ContactCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Office Hours */}
        <Box mt={8} textAlign="center">
          <Typography 
            variant="h5" 
            gutterBottom 
            fontWeight="medium"
          >
            Our Office Hours
          </Typography>
          
          <Divider 
            sx={{ 
              width: '60px', 
              height: '3px', 
              backgroundColor: theme.palette.primary.main, 
              margin: '12px auto 24px' 
            }} 
          />
          
          <Grid container justifyContent="center" spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Weekdays
                </Typography>
                <Typography variant="body1">
                  9:00 AM - 6:00 PM
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Saturdays
                </Typography>
                <Typography variant="body1">
                  10:00 AM - 5:00 PM
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Fridays & Holidays
                </Typography>
                <Typography variant="body1">
                  Closed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      {/* Success Message Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;