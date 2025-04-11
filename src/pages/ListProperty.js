import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  FormHelperText,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SellIcon from "@mui/icons-material/Sell";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAuth } from "./AuthContext";
import axios from "axios";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.12)",
  backgroundColor: "#FFFFFF",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  position: "relative",
  paddingBottom: theme.spacing(1),
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "40px",
    height: "3px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "10px",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: "8px",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 4px 10px rgba(43, 123, 140, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 14px rgba(43, 123, 140, 0.3)",
  },
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 6px 16px rgba(43, 123, 140, 0.1)",
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 24px rgba(43, 123, 140, 0.15)",
  },
}));

const ImageUpload = styled(Box)(({ theme }) => ({
  border: "2px dashed rgba(43, 123, 140, 0.3)",
  borderRadius: "12px",
  padding: theme.spacing(3),
  backgroundColor: "rgba(43, 123, 140, 0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginBottom: theme.spacing(2),
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.08)",
    borderColor: theme.palette.primary.main,
  },
}));

// Step labels for stepper
const steps = [
  "Property Details",
  "Location & Features",
  "Images & Description",
];

// Main component
const ListProperty = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    listingType: "sell",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    features: {
      parking: false,
      garden: false,
      airConditioning: false,
      furnished: false,
      pool: false,
    },
    description: "",
    photos: [],
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Manage the snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when value changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle feature toggles
  const handleFeatureToggle = (feature) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features[feature],
      },
    });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Step 1 validation
    if (activeStep === 0) {
      if (!formData.title) newErrors.title = "Title is required";
      if (!formData.propertyType)
        newErrors.propertyType = "Property type is required";
      if (!formData.price) {
        newErrors.price = "Price is required";
      } else {
        const numberPrice = Number(formData.price);
        if (isNaN(numberPrice) || numberPrice <= 0) {
          newErrors.price = "Price must be a positive number";
        } else if (numberPrice >= 1000000000) {
          newErrors.price = "Price is too high";
        }
      }
    }

    // Step 2 validation
    else if (activeStep === 1) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
      if (!formData.bedrooms)
        newErrors.bedrooms = "Number of bedrooms is required";
      if (!formData.bathrooms)
        newErrors.bathrooms = "Number of bathrooms is required";
      if (!formData.area) newErrors.area = "Area is required";
      else if (isNaN(formData.area) || formData.area <= 0)
        newErrors.area = "Area must be a positive number";
    }

    // Step 3 validation
    else if (activeStep === 2) {
      if (!formData.description)
        newErrors.description = "Description is required";
      if (formData.description && formData.description.length < 50)
        newErrors.description = "Description should be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      if (activeStep === steps.length - 1) {
        // Submit form
        handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Clean up the price field: remove commas and any non-digit (except dot)
    const rawPrice = formData.price || "";
    const cleanedPrice = parseFloat(rawPrice.replace(/[^\d.]/g, ""));

    // Construct the propertyData object
    const propertyData = {
      title: formData.title,
      price: cleanedPrice,
      location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      mode: formData.listingType === "rent" ? "rent" : "buy",
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
      description: formData.description,
      images:
        formData.photos && formData.photos.length > 0
          ? formData.photos
          : ["house1.png"],
      // Updated createdBy assignment:
      createdBy: typeof user === "string" ? user : user.username || user._id,
    };

    console.log("Submitting property data:", propertyData);
    console.log("Type of price:", typeof propertyData.price); // Should log "number"

    try {
      await axios.post("http://localhost:5001/api/properties", propertyData);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error submitting property:", error);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    // Discard the uploaded file and use a default seed image.
    setFormData((prevData) => ({
      ...prevData,
      photos: ["house1.png"],
    }));
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
  };

  // Image placeholder function
  const renderImageUpload = () => (
    <ImageUpload
      onClick={() => document.getElementById("photo-upload").click()}
    >
      <input
        id="photo-upload"
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{ display: "none" }}
      />
      <PhotoCameraIcon sx={{ fontSize: 48, color: "#2B7B8C", mb: 2 }} />
      <Typography variant="body1" align="center" fontWeight={500}>
        Click to upload property photos
      </Typography>
      <Typography
        variant="body2"
        align="center"
        color="textSecondary"
        sx={{ mt: 1 }}
      >
        You can select multiple images
      </Typography>

      {formData.photos.length > 0 && (
        <Box sx={{ mt: 2, width: "100%" }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Selected photos ({formData.photos.length}):
          </Typography>
          <Grid container spacing={1}>
            {formData.photos.map((photo, index) => (
              <Grid item xs={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    backgroundColor: "rgba(43, 123, 140, 0.1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography variant="caption" noWrap>
                    {photo}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </ImageUpload>
  );

  // Property type options
  const propertyTypes = [
    "Apartment",
    "House",
    "Villa",
    "Condo",
    "Townhouse",
    "Land",
    "Commercial",
  ];

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Property Title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
                error={Boolean(errors.title)}
                helperText={errors.title}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeWorkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(errors.propertyType)}>
                <InputLabel id="property-type-label">Property Type</InputLabel>
                <Select
                  labelId="property-type-label"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  label="Property Type"
                  sx={{ borderRadius: "10px" }}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.propertyType && (
                  <FormHelperText>{errors.propertyType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="listing-type-label">Listing Type</InputLabel>
                <Select
                  labelId="listing-type-label"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  label="Listing Type"
                  sx={{ borderRadius: "10px" }}
                >
                  <MenuItem value="sell">For Sale</MenuItem>
                  <MenuItem value="rent">For Rent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="price"
                label={
                  formData.listingType === "rent"
                    ? "Monthly Rent (৳)"
                    : "Price (৳)"
                }
                fullWidth
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={Boolean(errors.price)}
                helperText={errors.price}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SellIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
                error={Boolean(errors.address)}
                helperText={errors.address}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="city"
                label="City"
                fullWidth
                value={formData.city}
                onChange={handleChange}
                error={Boolean(errors.city)}
                helperText={errors.city}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="state"
                label="State"
                fullWidth
                value={formData.state}
                onChange={handleChange}
                error={Boolean(errors.state)}
                helperText={errors.state}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="zipCode"
                label="ZIP Code"
                fullWidth
                value={formData.zipCode}
                onChange={handleChange}
                error={Boolean(errors.zipCode)}
                helperText={errors.zipCode}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="bedrooms"
                label="Bedrooms"
                fullWidth
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                error={Boolean(errors.bedrooms)}
                helperText={errors.bedrooms}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BedIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="bathrooms"
                label="Bathrooms"
                fullWidth
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                error={Boolean(errors.bathrooms)}
                helperText={errors.bathrooms}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BathtubIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="area"
                label="Area (sq.ft)"
                fullWidth
                value={formData.area}
                onChange={handleChange}
                error={Boolean(errors.area)}
                helperText={errors.area}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SquareFootIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <SectionTitle variant="h6">Features</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.features.parking}
                        onChange={() => handleFeatureToggle("parking")}
                        color="primary"
                      />
                    }
                    label="Parking"
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.features.garden}
                        onChange={() => handleFeatureToggle("garden")}
                        color="primary"
                      />
                    }
                    label="Garden"
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.features.airConditioning}
                        onChange={() => handleFeatureToggle("airConditioning")}
                        color="primary"
                      />
                    }
                    label="Air Conditioning"
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.features.furnished}
                        onChange={() => handleFeatureToggle("furnished")}
                        color="primary"
                      />
                    }
                    label="Furnished"
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.features.pool}
                        onChange={() => handleFeatureToggle("pool")}
                        color="primary"
                      />
                    }
                    label="Swimming Pool"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderImageUpload()}
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Property Description"
                multiline
                rows={6}
                fullWidth
                value={formData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
                variant="outlined"
                placeholder="Describe your property in detail. Include special features, recent renovations, nearby amenities, etc."
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1.5 }}
                    >
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Grid>
            {formData.title && formData.price && (
              <Grid item xs={12}>
                <SectionTitle variant="h6">Preview</SectionTitle>
                <PreviewCard>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight={600}
                      color="primary"
                    >
                      {formData.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.address}, {formData.city}, {formData.state}{" "}
                      {formData.zipCode}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ৳{Number(formData.price).toLocaleString()}
                      {formData.listingType === "rent" ? "/month" : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Typography variant="body2">
                        <BedIcon
                          fontSize="small"
                          sx={{ mr: 0.5, verticalAlign: "middle" }}
                        />
                        {formData.bedrooms} Beds
                      </Typography>
                      <Typography variant="body2">
                        <BathtubIcon
                          fontSize="small"
                          sx={{ mr: 0.5, verticalAlign: "middle" }}
                        />
                        {formData.bathrooms} Baths
                      </Typography>
                      <Typography variant="body2">
                        <SquareFootIcon
                          fontSize="small"
                          sx={{ mr: 0.5, verticalAlign: "middle" }}
                        />
                        {formData.area} sq.ft
                      </Typography>
                    </Box>
                  </CardContent>
                </PreviewCard>
              </Grid>
            )}
          </Grid>
        );
      default:
        return "Unknown step";
    }
  };

  // Don't render the page content if not logged in (redirect will happen)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <HomeWorkIcon sx={{ fontSize: 36, mr: 2, color: "#2B7B8C" }} />
        <Typography variant="h4" fontWeight={700} color="#2B7B8C">
          List Your Property
        </Typography>
      </Box>

      {submitted ? (
        <StyledPaper>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SellIcon sx={{ fontSize: 64, color: "#2B7B8C", mb: 3 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Property Submitted Successfully!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Your property has been submitted for review. Our team will contact
              you shortly.
            </Typography>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ mt: 2 }}
            >
              Return to Home
            </StyledButton>
          </Box>
        </StyledPaper>
      ) : (
        <StyledPaper>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box>
            {getStepContent(activeStep)}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  borderWidth: "2px",
                  "&:hover": {
                    borderWidth: "2px",
                  },
                }}
              >
                Back
              </Button>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1
                  ? "Submit Property"
                  : "Continue"}
              </StyledButton>
            </Box>
          </Box>
        </StyledPaper>
      )}

      <Snackbar
        open={openSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(43, 123, 140, 0.2)",
          }}
        >
          Your property has been submitted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListProperty;
