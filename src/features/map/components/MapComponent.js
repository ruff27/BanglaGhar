// src/features/map/components/MapComponent.js
import React, { useEffect, useRef } from "react"; // Removed useState if mapReady not strictly needed
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Removed MapLibre-GL specific imports as TileLayer is used for OpenStreetMap directly.
// If you intend to use MapLibre GL as the renderer for vector tiles,
// ensure '@maplibre/maplibre-gl-leaflet' is correctly configured and used.
// For simplicity with OpenStreetMap raster tiles, those are not needed.

import { Box, Typography, Alert, CircularProgress } from "@mui/material"; // Kept for exports
import { useTranslation } from "react-i18next"; // Kept for exports
// Removed divisionCenters and normalizePositionArray, assuming properties are pre-processed by useMapData

import { MapContainer, TileLayer, useMap } from "react-leaflet"; // Added useMap
import MapMarker from "./MapMarker";

const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka
const DEFAULT_ZOOM = 7;
const BANGLADESH_BOUNDS = L.latLngBounds(
  L.latLng(20.0, 88.0), // Southwest
  L.latLng(26.75, 92.75) // Northeast
);

// Component to handle map view updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      center.length === 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number"
    ) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const MapComponent = ({
  properties = [], // Expects properties with pre-processed .position objects
  mapCenter = DEFAULT_CENTER, // Expected as [lat, lng]
  mapZoom = DEFAULT_ZOOM,
  // userLocation, // userLocation prop is available if you want to show a marker for it
  selectedProperty,
  onMarkerClick, // This is onPropertySelect from MapPage
  onMapMove, // This is handleMapMove from useMapData via MapPage
  // showLocationAccuracy prop removed, as MapMarker doesn't need it if icon is generic
}) => {
  const mapRef = useRef(null); // To store the map instance if needed outside react-leaflet context

  // Ensure mapCenter is always a valid array for <MapContainer/>
  const currentCenter =
    Array.isArray(mapCenter) &&
    mapCenter.length === 2 &&
    typeof mapCenter[0] === "number" &&
    typeof mapCenter[1] === "number"
      ? mapCenter
      : DEFAULT_CENTER;

  console.log("MapComponent: Rendering with", properties.length, "properties.");
  console.log("MapComponent: Center:", currentCenter, "Zoom:", mapZoom);

  const handleLeafletMapMove = (event) => {
    if (onMapMove) {
      const map = event.target;
      onMapMove(map.getCenter(), map.getZoom()); // Pass {lat, lng} and zoom
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={currentCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(instance) => {
          mapRef.current = instance;
        }} // Store map instance
        maxBounds={BANGLADESH_BOUNDS}
        minZoom={6} // Set a reasonable min zoom for Bangladesh
        onMoveend={handleLeafletMapMove} // Use onMoveend for less frequent updates
        onZoomend={handleLeafletMapMove}
      >
        <ChangeView center={currentCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => {
          // property.position should be {lat, lng} from useMapData
          if (property && property._id && property.position) {
            return (
              <MapMarker
                key={property._id}
                property={property} // Pass the whole property object
                // position prop is now derived inside MapMarker from property.position
                isSelected={selectedProperty?._id === property._id}
                onClick={onMarkerClick} // This will call onPropertySelect(property) in MapPage
                // showPrice can be a prop for MapMarker if needed
              />
            );
          }
          return null;
        })}
        {/* Example: User Location Marker if you pass userLocation */}
        {/* {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={L.icon({ iconUrl: '/path/to/user-marker.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>Your Location</Popup>
          </Marker>
        )} */}
      </MapContainer>
    </Box>
  );
};

// Loading state and Error state components remain the same as in your provided file
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
