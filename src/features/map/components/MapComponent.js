import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import MapMarker from "./MapMarker";
import MapPopup from "./MapPopup";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";

// Fix for default Leaflet marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Bangladesh default center coordinates
const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka
const DEFAULT_ZOOM = 7;

// Helper function to validate position data
const hasValidPosition = (property) => {
  // Check if property has position in the expected format
  if (property?.position?.lat && property?.position?.lng) {
    return true;
  }
  
  // Check if property has latitude/longitude directly
  if (property?.latitude !== undefined && property?.longitude !== undefined) {
    return true;
  }
  
  return false;
};

// Helper function to normalize position data into [lat, lng] array format for Leaflet
const normalizePositionArray = (property) => {
  if (!property) return null;
  
  // If property has position in the expected format
  if (property.position?.lat !== undefined && property.position?.lng !== undefined) {
    return [
      parseFloat(property.position.lat.toFixed(6)),
      parseFloat(property.position.lng.toFixed(6))
    ];
  }
  
  // If property has latitude/longitude directly
  if (property.latitude !== undefined && property.longitude !== undefined) {
    return [
      parseFloat(property.latitude.toFixed(6)),
      parseFloat(property.longitude.toFixed(6))
    ];
  }
  
  console.warn("Property missing valid position data:", property);
  return null;
};

// Custom hook to update map view when center or zoom changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number" &&
      typeof zoom === "number" &&
      !isNaN(zoom)
    ) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle map events
const MapEvents = ({ onMapMove }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!onMapMove) return;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapMove([center.lat, center.lng], zoom);
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
    };
  }, [map, onMapMove]);
  
  return null;
};

/**
 * Enhanced MapComponent with improved handling of property locations
 */
const MapComponent = ({
  properties,
  mapCenter = DEFAULT_CENTER,
  mapZoom = DEFAULT_ZOOM,
  userLocation,
  selectedProperty,
  onMarkerClick,
  onMapMove,
  showLocationAccuracy = true,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Normalize map center if needed
  const normalizedCenter = Array.isArray(mapCenter) && mapCenter.length === 2
    ? mapCenter
    : DEFAULT_CENTER;

  // Normalize zoom if needed
  const normalizedZoom = typeof mapZoom === "number" && !isNaN(mapZoom)
    ? mapZoom
    : DEFAULT_ZOOM;

  // Process the properties to ensure they all have valid positions
  const validProperties = properties.filter(property => hasValidPosition(property));
  
  if (validProperties.length !== properties.length) {
    console.warn(`Filtered out ${properties.length - validProperties.length} properties with invalid positions`);
  }

  // Effect to set map as ready after mounting
  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        ref={mapRef}
        center={normalizedCenter}
        zoom={normalizedZoom}
        scrollWheelZoom={true}
        zoomControl={false} // We'll add custom position zoom control
        style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      >
        {/* Reposition zoom control to right top */}
        <ZoomControl position="topright" />
        
        {/* Update view when center/zoom props change */}
        <ChangeView center={normalizedCenter} zoom={normalizedZoom} />
        
        {/* Base tile layer */}
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show user's location if available */}
        {userLocation &&
          Array.isArray(userLocation) &&
          userLocation.length === 2 && (
            <CircleMarker
              center={userLocation}
              radius={8}
              pathOptions={{ 
                color: "blue", 
                fillColor: "blue", 
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                {t("your_location", "Your Location")}
              </Tooltip>
            </CircleMarker>
          )}

        {/* Render property markers */}
        {validProperties.map((property) => {
          // Get position as [lat, lng] array for Leaflet
          const position = normalizePositionArray(property);
          
          if (!position) return null;
          
          const isSelected = selectedProperty && selectedProperty._id === property._id;
          
          // Determine if we should show price on marker
          const showPrice = mapZoom >= 13;
          
          return (
            <MapMarker
              key={property._id}
              property={property}
              isSelected={isSelected}
              onClick={onMarkerClick}
              showPrice={showPrice}
            >
              <MapPopup
                property={property}
                onViewDetails={() => onMarkerClick && onMarkerClick(property)}
              />
            </MapMarker>
          );
        })}

        {/* Show location accuracy indicators if enabled */}
        {showLocationAccuracy && mapReady && selectedProperty && selectedProperty.locationAccuracy && (
          <>
            {selectedProperty.locationAccuracy === "approximate" && (
              <CircleMarker
                center={normalizePositionArray(selectedProperty)}
                radius={50}
                pathOptions={{ 
                  color: "rgba(255, 165, 0, 0.5)", 
                  fillColor: "rgba(255, 165, 0, 0.1)",
                  fillOpacity: 0.3,
                  weight: 1, 
                  dashArray: "5, 5"
                }}
              >
                <Tooltip direction="top" permanent>
                  {t("approximate_location", "Approximate Location")}
                </Tooltip>
              </CircleMarker>
            )}
            
            {selectedProperty.locationAccuracy === "district-level" && (
              <CircleMarker
                center={normalizePositionArray(selectedProperty)}
                radius={100}
                pathOptions={{ 
                  color: "rgba(255, 0, 0, 0.5)", 
                  fillColor: "rgba(255, 0, 0, 0.1)",
                  fillOpacity: 0.2,
                  weight: 1, 
                  dashArray: "10, 5"
                }}
              >
                <Tooltip direction="top" permanent>
                  {t("district_level_location", "District Level Location")}
                </Tooltip>
              </CircleMarker>
            )}
          </>
        )}

        {/* Handle map move events */}
        {onMapMove && <MapEvents onMapMove={onMapMove} />}
      </MapContainer>
      
      {/* Location accuracy warning for selected property */}
      {showLocationAccuracy && selectedProperty && selectedProperty.locationAccuracy === "district-level" && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: "absolute", 
            top: 10, 
            left: "50%", 
            transform: "translateX(-50%)",
            maxWidth: "90%",
            zIndex: 1000,
            opacity: 0.9
          }}
        >
          {t("location_approximate_warning", "This location is approximate. The exact property may be elsewhere in this district.")}
        </Alert>
      )}
    </Box>
  );
};

// Loading state component
export const MapLoadingState = () => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "rgba(0,0,0,0.03)",
        borderRadius: "12px",
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography sx={{ mt: 2 }}>
        {t("loading_map", "Loading map data...")}
      </Typography>
    </Box>
  );
};

// Error state component
export const MapErrorState = ({ message }) => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "rgba(0,0,0,0.03)",
        borderRadius: "12px",
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ maxWidth: "500px" }}>
        {message || t("map_error", "Error loading map data")}
      </Alert>
    </Box>
  );
};

export default MapComponent;