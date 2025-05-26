import React, { useEffect, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import PlaceIcon from '@mui/icons-material/Place';
import { renderToString } from 'react-dom/server';

/**
 * Helper function to normalize position data
 */
const normalizePosition = (position) => {
  if (!position || typeof position !== 'object') {
    return null;
  }

  // Handle {lat, lng} format
  if (typeof position.lat === 'number' && typeof position.lng === 'number') {
    return {
      lat: parseFloat(position.lat.toFixed(6)),
      lng: parseFloat(position.lng.toFixed(6))
    };
  }

  // Handle array format [lat, lng]
  if (Array.isArray(position) && position.length === 2) {
    if (typeof position[0] === 'number' && typeof position[1] === 'number') {
      return {
        lat: parseFloat(position[0].toFixed(6)),
        lng: parseFloat(position[1].toFixed(6))
      };
    }
  }

  return null;
};

/**
 * Helper to extract position from property using multiple possible data formats
 */
const getPropertyPosition = (property) => {
  if (!property) return null;

  // First try position.lat/lng format
  if (property.position &&
    typeof property.position.lat === 'number' &&
    typeof property.position.lng === 'number') {
    return normalizePosition(property.position);
  }

  // Then try latitude/longitude format
  if (typeof property.latitude === 'number' &&
    typeof property.longitude === 'number') {
    return normalizePosition({
      lat: property.latitude,
      lng: property.longitude
    });
  }

  console.warn("Invalid property position data:", property);
  return null;
};

/**
 * Create map icon based on property data
 */
const createMUIIcon = (property, isSelected) => {
  const iconHtml = renderToString(
    <PlaceIcon
      style={{
        fontSize: isSelected ? "40px" : "32px",
        color: isSelected ? "#d32f2f" : "#1976d2",
        transform: "translate(-50%, -100%)",
      }}
    />
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};



/**
 * Helper to format price for display on marker
 */
const formatPriceForMarker = (price, listingType) => {
  if (!price) return null;
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return null;

  // Format based on price range
  if (numericPrice >= 1000000) {
    return `৳${(numericPrice / 1000000).toFixed(1)}M`;
  } else if (numericPrice >= 1000) {
    return `৳${(numericPrice / 1000).toFixed(0)}K`;
  } else {
    return `৳${numericPrice}`;
  }
};

/**
 * MapMarker Component Wrapper
 */
const MapMarker = (props) => {
  // Early validation to avoid rendering invalid markers
  const position = getPropertyPosition(props.property);

  if (!position) {
    console.warn("Invalid property position, skipping marker:", props.property);
    return null;
  }

  return <MapMarkerInner {...props} position={position} />;
};

/**
 * Inner MapMarker component where all hooks are safely called
 */
const MapMarkerInner = ({
  property,
  position,
  isSelected = false,
  onClick,
  children,
  showPrice = false,
}) => {
  const navigate = useNavigate();
  // Create a stable position array for Leaflet
  const stablePosition = useMemo(() => {
    return [
      parseFloat(position.lat.toFixed(6)),
      parseFloat(position.lng.toFixed(6))
    ];
  }, [position]);

  // Format price label
  const priceLabel = useMemo(() => {
    return showPrice ? formatPriceForMarker(property.price, property.listingType) : null;
  }, [property.price, property.listingType, showPrice]);

  // Create icon options
  const iconOptions = { price: priceLabel };

  // Create custom SVG icon
  const icon = useMemo(() => {
    return createMUIIcon(property, isSelected);
  }, [property, isSelected]);

  // Handle marker click
   const handleMarkerClick = () => {
    if (property && property._id) {
      navigate(`/properties/details/${property._id}`);
    }
  };

  // CSS for animated markers
  const markerStyle = `
    .property-marker {
      transition: transform 0.2s ease-out;
    }
    .selected-marker {
      z-index: 1000 !important;
      transform: scale(1.1);
    }
  `;

  return (
    <>
      {/* Add style for custom markers */}
      <style>{markerStyle}</style>

      <Marker
        position={stablePosition}
        icon={icon}
        eventHandlers={{
          click: handleMarkerClick
        }}
        zIndexOffset={isSelected ? 1000 : property.price ? Math.floor(property.price / 10000) : 0}
      >
        {children}
      </Marker>
    </>
  );
};

export default MapMarker;