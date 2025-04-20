import React, { useState, useCallback, useEffect } from "react"; // Added useEffect import back
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
import { useTranslation } from "react-i18next"; // Import useTranslation

/**
 * Step4_Images Component
 */
const Step4_Images = ({ images, handleImageUpload, errors }) => {
  const { t } = useTranslation(); // Initialize translation
  const [previews, setPreviews] = useState([]);

  // Generate previews when images change
  useEffect(() => {
    const newPreviews = images
      .map((file) => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        if (typeof file === "string" && file.startsWith("http")) {
          return file;
        }
        if (typeof file === "string") {
          // Use PUBLIC_URL if images are in public folder
          return `${process.env.PUBLIC_URL}/pictures/${file}`;
        }
        return null;
      })
      .filter((url) => url !== null);

    setPreviews(newPreviews);

    // Cleanup object URLs
    return () => {
      newPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const onFileChange = useCallback(
    (event) => {
      if (event.target.files) {
        const newFiles = Array.from(event.target.files);
        const combined = [...images, ...newFiles].slice(0, 10);
        handleImageUpload(combined);
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
        Upload Photos {/* <-- Kept as is, no key found */}
      </Typography>
      <Button
        variant="outlined"
        component="label"
        startIcon={<PhotoCameraIcon />}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Select Images {/* <-- Kept as is, no key found */}
        <input
          type="file"
          hidden
          multiple
          accept="image/png, image/jpeg, image/webp"
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
                alt={`Property Preview ${index + 1}`} // <-- Kept as is
                sx={{ height: "100%", objectFit: "cover" }}
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
        {/* Kept as is, no key found */}
        Upload up to 10 images (JPEG, PNG, WEBP). The first image will be the
        main cover.
      </Typography>
    </Box>
  );
};

export default Step4_Images;
