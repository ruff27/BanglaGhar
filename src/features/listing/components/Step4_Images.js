// src/features/ListPropertyPage/components/Step4_Images.js
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  FormHelperText,
  CircularProgress, // Added for potential upload progress later
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

/**
 * Step4_Images Component - Handles image uploads and previews
 * Now uses handleImageUpload to add files and removeImageByIndex to remove
 */
const Step4_Images = ({
  images,
  handleImageUpload,
  removeImageByIndex,
  errors,
}) => {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState(null); // Local error state for immediate feedback

  // Generate previews when images (File objects) change
  useEffect(() => {
    const objectUrls = [];
    const newPreviews = images
      .map((file) => {
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          objectUrls.push(url); // Keep track to revoke later
          return url;
        }
        // Handle cases where 'images' might contain existing URLs (e.g., during edit)
        if (typeof file === "string" && file.startsWith("http")) {
          return file;
        }
        return null; // Ignore other types or invalid entries
      })
      .filter(Boolean); // Remove nulls

    setPreviews(newPreviews);

    // Cleanup object URLs when component unmounts or images change
    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [images]); // Re-run only when the images array changes

  const onFileChange = useCallback(
    (event) => {
      setImageErrors(null); // Clear previous local errors
      if (event.target.files) {
        const newFiles = Array.from(event.target.files);
        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        const maxSize = 5 * 1024 * 1024; // 5 MB limit per image (example)

        const validFiles = [];
        const currentErrors = [];

        newFiles.forEach((file) => {
          if (!allowedTypes.includes(file.type)) {
            currentErrors.push(`${file.name}: Invalid file type.`);
          } else if (file.size > maxSize) {
            currentErrors.push(`${file.name}: File size exceeds 5MB.`);
          } else {
            validFiles.push(file);
          }
        });

        if (currentErrors.length > 0) {
          setImageErrors(currentErrors.join(" "));
        }

        // Calculate how many new images can be added without exceeding the limit (e.g., 10)
        const availableSlots = 10 - images.length;
        const filesToAdd = validFiles.slice(0, availableSlots);

        if (filesToAdd.length < validFiles.length) {
          setImageErrors(
            (prev) =>
              (prev ? prev + " " : "") +
              `Maximum 10 images allowed. Some files were not added.`
          );
        }

        if (filesToAdd.length > 0) {
          handleImageUpload(filesToAdd); // Pass only the *new* valid files to the hook
        }

        // Clear the input value to allow selecting the same file again if needed
        event.target.value = null;
      }
    },
    [handleImageUpload, images.length] // Depend on hook function and current image count
  );

  // Use the remove handler passed from the hook
  const handleRemoveImage = useCallback(
    (indexToRemove) => {
      removeImageByIndex(indexToRemove);
    },
    [removeImageByIndex]
  );

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_upload_photos", "Upload Photos")}
      </Typography> */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<PhotoCameraIcon />}
        sx={{ mb: 2, textTransform: "none" }}
        disabled={images.length >= 10} // Disable button if max images reached
      >
        {t("select_images", "Select Images")}
        <input
          type="file"
          hidden
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={onFileChange}
        />
      </Button>
      {/* Display hook-level errors (e.g., 'at least one image recommended') */}
      {errors.images && (
        <FormHelperText error sx={{ mb: 1 }}>
          {errors.images}
        </FormHelperText>
      )}
      {/* Display local validation errors */}
      {imageErrors && (
        <FormHelperText error sx={{ mb: 2 }}>
          {imageErrors}
        </FormHelperText>
      )}

      <Grid container spacing={2}>
        {previews.map((previewUrl, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            {" "}
            {/* Use index as key for dynamic list */}
            <Card sx={{ position: "relative", height: 150 }}>
              <CardMedia
                component="img"
                image={previewUrl}
                alt={t(
                  "property_preview_alt",
                  `Property Preview ${index + 1}`,
                  { index: index + 1 }
                )}
                sx={{ height: "100%", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(index)} // Use the passed handler
                aria-label={t("remove_image_aria", `Remove image ${index + 1}`)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
        sx={{ mt: 2, color: "text.secondary" }}
      >
        {t(
          "image_upload_caption",
          "Upload up to 10 images (JPEG, PNG, WEBP, max 5MB each). The first image will be the main cover."
        )}
      </Typography>
    </Box>
  );
};

export default Step4_Images;
