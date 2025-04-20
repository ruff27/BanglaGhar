import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material"; // Added Tooltip
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { alpha } from "@mui/material/styles"; // Import alpha for background

/**
 * WishlistButton Component
 * Renders a heart icon button to add/remove items from the wishlist.
 * Handles click events and stops propagation.
 * @param {object} props - Component props
 * @param {boolean} props.isWishlisted - Whether the item is currently in the wishlist
 * @param {function} props.onClick - Function to call when the button is clicked
 * @param {object} [props.sx] - Optional sx props to customize styling
 */
const WishlistButton = ({ isWishlisted, onClick, sx = {} }) => {
  const handleClick = (event) => {
    event.stopPropagation(); // Stop event bubbling up to parent (e.g., CardActionArea)
    event.preventDefault(); // Prevent any default action if wrapped in a link
    onClick(); // Call the passed handler
  };

  return (
    <Tooltip
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      arrow
    >
      {/* Apply default styling + any passed sx props */}
      <IconButton
        aria-label={isWishlisted ? "remove from favorites" : "add to favorites"}
        onClick={handleClick}
        sx={{
          // Default styles (can be overridden by sx prop)
          color: isWishlisted ? "error.main" : "action.active", // Red when wishlisted
          bgcolor: alpha("#ffffff", 0.7), // Semi-transparent white background
          "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
          ...sx, // Apply passed sx props last
        }}
      >
        {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

// Define prop types for better component usage understanding
WishlistButton.propTypes = {
  isWishlisted: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default WishlistButton;
