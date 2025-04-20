import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

/**
 * WishlistButton Component
 */
const WishlistButton = ({ isWishlisted, onClick, sx = {} }) => {
  const { t } = useTranslation(); // Initialize translation
  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    onClick();
  };

  return (
    <Tooltip
      // Tooltip titles kept as is, no keys found
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      arrow
    >
      <IconButton
        // Aria labels kept as is, no keys found
        aria-label={isWishlisted ? "remove from favorites" : "add to favorites"}
        onClick={handleClick}
        sx={{
          color: isWishlisted ? "error.main" : "action.active",
          bgcolor: alpha("#ffffff", 0.7),
          "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
          ...sx,
        }}
      >
        {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

WishlistButton.propTypes = {
  isWishlisted: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default WishlistButton;
