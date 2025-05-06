import React, { useEffect, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
 * Create SVG marker for different property types with location accuracy indicator
 */
const createPropertyMarkerSvg = (property, isSelected, options = {}) => {
  if (!property) return null;
  
  // Define colors for different property types
  let color, label, price;
  const propertyType = property.propertyType?.toLowerCase();
  
  // Set color and label based on property type
  switch (propertyType) {
    case 'apartment':
      color = '#FF5722'; // Orange
      label = 'A';
      break;
    case 'house':
      color = '#4CAF50'; // Green
      label = 'H';
      break;
    case 'villa':
      color = '#9C27B0'; // Purple
      label = 'V';
      break;
    case 'land':
      color = '#795548'; // Brown
      label = 'L';
      break;
    case 'commercial':
      color = '#2196F3'; // Blue
      label = 'C';
      break;
    default:
      color = '#607D8B'; // Blue-gray
      label = 'P'; // Property
      break;
  }
  
  // Apply price label if provided
  if (options.price) {
    price = options.price;
  }
  
  // Adjust marker based on location accuracy
  let accuracyIndicator = '';
  let borderColor = '#ffffff';
  let borderWidth = 1.5;
  
  if (property.locationAccuracy) {
    if (property.locationAccuracy === 'district-level') {
      // Add a hashed border for district-level accuracy
      borderColor = '#FF0000';
      borderWidth = 2;
      accuracyIndicator = `
        <g>
          <circle cx="16" cy="12" r="11" fill="none" stroke="#FF0000" stroke-width="1" stroke-dasharray="2,2" />
        </g>
      `;
    } else if (property.locationAccuracy === 'approximate') {
      // Add a dotted border for approximate accuracy
      borderColor = '#FFA500';
      borderWidth = 2;
      accuracyIndicator = `
        <g>
          <circle cx="16" cy="12" r="11" fill="none" stroke="#FFA500" stroke-width="1" stroke-dasharray="1,1" />
        </g>
      `;
    }
  }
  
  // Calculate size and shadow size based on selection state
  const size = isSelected ? 1.2 : 1;
  const baseSize = { width: 32, height: 42 };
  const actualSize = {
    width: baseSize.width * size,
    height: baseSize.height * size
  };
  
  // Create SVG marker icon
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${actualSize.width}" height="${actualSize.height}">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      ${accuracyIndicator}
      
      <!-- Marker pin shape with shadow effect -->
      <g filter="url(#shadow)">
        <path fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}" d="M16 2 C10.477 2 6 6.477 6 12 C6 17.523 10.477 22 16 22 C21.523 22 26 17.523 26 12 C26 6.477 21.523 2 16 2 z M16 0 C22.627 0 28 5.373 28 12 C28 15 26 21 16 40 C6 21 4 15 4 12 C4 5.373 9.373 0 16 0 z"/>
      </g>
      
      <!-- Property type label -->
      <text x="16" y="16" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#ffffff">${label}</text>
      
      <!-- Selection indicator with glow effect -->
      ${isSelected ? '<circle cx="16" cy="12" r="14" fill="none" stroke="#1976d2" stroke-width="3" opacity="0.8" filter="url(#glow)" />' : ''}
      
      <!-- Price label if provided -->
      ${price ? `
        <g transform="translate(16, 28)">
          <rect x="-20" y="-8" width="40" height="16" rx="8" fill="white" opacity="0.9" stroke="#555" stroke-width="1"/>
          <text x="0" y="2" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold" fill="#333">${price}</text>
        </g>` : ''}
    </svg>
  `;
  
  // Create a Blob from the SVG string
  const blob = new Blob([svgTemplate], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  // Return the icon with proper sizing and anchoring
  return new L.Icon({
    iconUrl: url,
    iconSize: [actualSize.width, actualSize.height],
    iconAnchor: [actualSize.width / 2, actualSize.height],
    popupAnchor: [0, -actualSize.height + 10],
    className: isSelected ? 'property-marker selected-marker' : 'property-marker',
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
    return createPropertyMarkerSvg(property, isSelected, iconOptions);
  }, [property, isSelected, iconOptions]);
  
  // Cleanup SVG URL on unmount
  useEffect(() => {
    return () => {
      if (icon && icon.options && icon.options.iconUrl) {
        URL.revokeObjectURL(icon.options.iconUrl);
      }
    };
  }, [icon]);

  // Handle marker click
  const handleMarkerClick = () => {
    if (onClick) {
      // Create a stable copy of the property with validated position
      const stableProperty = {
        ...property,
        position: {
          lat: stablePosition[0],
          lng: stablePosition[1]
        }
      };
      onClick(stableProperty);
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