import React, { useState, useCallback } from "react";
// Need useEffect for preview generation
import { useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  FormHelperText,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * Step4_Images Component
 * Handles image uploads and previews for the property listing.
 * Note: This is a basic example. Actual implementation might involve direct uploads
 * to S3 or another service and storing URLs instead of just file names.
 */
const Step4_Images = ({ images, handleImageUpload, errors }) => {
  const [previews, setPreviews] = useState([]);

  // Generate previews when images change
  // This assumes 'images' passed down contains File objects initially
  useEffect(() => {
    const newPreviews = images
      .map((file) => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        // If it's already a URL (e.g., from editing), use it directly
        if (typeof file === "string" && file.startsWith("http")) {
          return file;
        }
        // If it's just a filename (from initial load maybe), construct path
        if (typeof file === "string") {
          return `${process.env.PUBLIC_URL}/pictures/${file}`; // Adjust path as needed
        }
        return null; // Handle unexpected types
      })
      .filter((url) => url !== null); // Filter out nulls

    setPreviews(newPreviews);

    // Cleanup object URLs on unmount or when images change
    return () => {
      newPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          // Only revoke blob URLs
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const onFileChange = useCallback(
    (event) => {
      if (event.target.files) {
        // Convert FileList to array and append to existing images
        const newFiles = Array.from(event.target.files);
        // You might want to limit the number of images
        const combined = [...images, ...newFiles].slice(0, 10); // Example limit of 10 images
        handleImageUpload(combined); // Pass the array of File objects up
      }
    },
    [handleImageUpload, images]
  );

  const removeImage = useCallback(
    (indexToRemove) => {
      const updatedImages = images.filter(
        (_, index) => index !== indexToRemove
      );
      handleImageUpload(updatedImages);
    },
    [handleImageUpload, images]
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Photos
      </Typography>
      <Button
        variant="outlined"
        component="label" // Makes the button act like a file input label
        startIcon={<PhotoCameraIcon />}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Select Images
        <input
          type="file"
          hidden
          multiple // Allow multiple file selection
          accept="image/png, image/jpeg, image/webp" // Specify accepted types
          onChange={onFileChange}
        />
      </Button>
      {errors.images && (
        <FormHelperText error sx={{ mb: 2 }}>
          {errors.images}
        </FormHelperText>
      )}

      <Grid container spacing={2}>
        {previews.map((previewUrl, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card sx={{ position: "relative", height: 150 }}>
              <CardMedia
                component="img"
                image={previewUrl}
                alt={`Property Preview ${index + 1}`}
                sx={{ height: "100%", objectFit: "cover" }}
                // Add onError for previews too?
              />
              <IconButton
                size="small"
                onClick={() => removeImage(index)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography
        variant="caption"
        display="block"
        sx={{ mt: 1, color: "text.secondary" }}
      >
        Upload up to 10 images (JPEG, PNG, WEBP). The first image will be the
        main cover.
      </Typography>
    </Box>
  );
};

export default Step4_Images;
