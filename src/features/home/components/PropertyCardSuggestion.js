import React from "react";
import { Box, Typography } from "@mui/material"; 
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next"; 


const PropertyCardSuggestion = ({ property, onSelect }) => {
  const { t } = useTranslation(); 
  const placeholderImg = `${process.env.PUBLIC_URL}/pictures/placeholder.png`;
  const imgSrc = property?.images?.[0] 
    ? `${process.env.PUBLIC_URL}/pictures/${property.images[0]}`
    : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = placeholderImg;
  };

  if (!property || !property.title) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:last-child": { borderBottom: 0 },
      }}
      onClick={onSelect} 
    >
      <Box
        component="img"
        src={imgSrc}
        alt={property.title}
        onError={handleImageError} 
        sx={{
          width: 50,
          height: 50,
          borderRadius: "4px",
          mr: 1.5,
          objectFit: "cover",
          flexShrink: 0, 
        }}
      />
      <Box sx={{ overflow: "hidden" }}>
        {" "}
        <Typography variant="body2" fontWeight="500" noWrap>
          {property.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center" }}
          noWrap
        >
          <LocationOnIcon sx={{ fontSize: "0.8rem", mr: 0.5, flexShrink: 0 }} />
          {property.location || "Location not specified"}
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertyCardSuggestion;
