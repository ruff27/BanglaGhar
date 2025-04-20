import React from "react";
import { useState } from "react";
import { alpha } from "@mui/material/styles";
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  Badge,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

const Input = styled("input")({
  display: "none",
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  fontSize: "3.5rem",
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const UploadIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: 5,
  right: 5,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  boxShadow: theme.shadows[1],
  padding: theme.spacing(0.75),
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ProfilePicture = ({
  picture,
  name,
  onPictureChange,
  isUpdating,
  onError,
}) => {
  const { t } = useTranslation(); // Initialize translation

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        // Error message kept as is, no key found
        if (onError) onError(`Image size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        event.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onPictureChange(reader.result);
      };
      reader.onerror = () => {
        // Error message kept as is, no key found
        if (onError) onError("Failed to read image file.");
      };
      reader.readAsDataURL(file);
    } else if (file) {
      // Error message kept as is, no key found
      if (onError)
        onError("Please select a valid image file (JPEG, PNG, GIF, etc.).");
    }
    event.target.value = null;
  };

  const fallbackInitial = name?.charAt(0).toUpperCase() || (
    <PersonIcon sx={{ fontSize: "inherit" }} />
  );

  return (
    <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
      <StyledAvatar src={picture || undefined}>
        {!picture && fallbackInitial}
      </StyledAvatar>
      {/* Tooltip kept as is, no key found */}
      <Tooltip title="Change profile picture" arrow>
        <span style={{ position: "absolute", bottom: 5, right: 5 }}>
          <UploadIconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            size="small"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={22} />
            ) : (
              <PhotoCamera sx={{ fontSize: 20 }} />
            )}
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </UploadIconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default ProfilePicture;
