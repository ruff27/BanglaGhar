// src/features/map/components/MapMarker.js
import React, { useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet"; // Added useMap
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Removed useNavigate as direct navigation is handled by onMarkerClick -> handleSelectProperty -> PropertyInfoPanel
import PlaceIcon from "@mui/icons-material/Place"; // Default MUI icon
import { renderToString } from "react-dom/server";
import MapPopupContent from "./MapPopup"; // Assuming MapPopup.js is renamed or this is the content component

// Helper to create Leaflet icon from MUI icon based on selection and accuracy
const createLeafletIcon = (property, isSelected) => {
  let iconColor;
  let iconSize = isSelected ? 38 : 30; // Slightly larger when selected

  if (isSelected) {
    iconColor = "#E91E63"; // Pink/Magenta for selected (or your preferred selected color)
  } else {
    iconColor = "#1976D2"; // Default Blue for all unselected pins (or your preferred default color)
    // The original accuracy-based coloring for unselected pins is removed to meet the new requirement.
    // switch (property?.locationAccuracy) {
    //   case "approximate":
    //     iconColor = "#FFA000";
    //     break;
    //   case "district-level":
    //     iconColor = "#D32F2F";
    //     break;
    //   case "precise":
    //   default:
    //     iconColor = "#1976D2";
    //     break;
    // }
  }

  const iconHtml = renderToString(
    <PlaceIcon
      style={{
        fontSize: `${iconSize}px`,
        color: iconColor,
      }}
    />
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-div-icon",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize + iconSize / 4],
  });
};

// MapMarker expects property.position to be {lat, lng}
const MapMarker = ({ property, isSelected, onClick }) => {
  const map = useMap(); // Get map instance for flyTo

  // Position should be directly from property.position (which is {lat, lng})
  const position = property?.position;

  // Memoize icon creation
  const icon = useMemo(() => {
    return createLeafletIcon(property, isSelected);
  }, [property, isSelected]);

  if (
    !position ||
    typeof position.lat !== "number" ||
    typeof position.lng !== "number"
  ) {
    console.warn(
      `MapMarker: Skipping marker for property ID ${property?._id} due to invalid or missing position. Position:`,
      position,
      "Property:",
      property
    );
    return null;
  }

  const handleMarkerClick = () => {
    if (onClick) {
      onClick(property); // This is onPropertySelect from MapPage
    }
    // Fly to the marker's position smoothly
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <Marker
      position={[position.lat, position.lng]} // Leaflet expects [lat, lng] array
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
      zIndexOffset={isSelected ? 1000 : 0} // Bring selected marker to front
    >
      {/* The MapPopup component will be rendered by PropertyInfoPanel or similar, not directly here for this design
          If you want a direct leaflet popup on click without the panel, you can add it here.
          For now, clicking selects it, and PropertyInfoPanel shows details.
      */}
      {/* Example of how you might use MapPopupContent if you want a direct Leaflet Popup */}
      {/* <Popup>
        <MapPopupContent property={property} onViewDetails={() => handleMarkerClick()} />
      </Popup> */}
    </Marker>
  );
};

export default MapMarker;
