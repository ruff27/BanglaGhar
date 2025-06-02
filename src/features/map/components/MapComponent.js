import React, { useEffect, useRef } from "react"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";


import { Box, Typography, Alert, CircularProgress } from "@mui/material"; 
import { useTranslation } from "react-i18next"; 


import { MapContainer, TileLayer, useMap } from "react-leaflet"; 
import MapMarker from "./MapMarker";

const DEFAULT_CENTER = [23.8103, 90.4125]; 
const DEFAULT_ZOOM = 7;
const BANGLADESH_BOUNDS = L.latLngBounds(
  L.latLng(20.0, 88.0), 
  L.latLng(26.75, 92.75) 
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
  properties = [], 
  mapCenter = DEFAULT_CENTER, 
  mapZoom = DEFAULT_ZOOM,
  
  selectedProperty,
  onMarkerClick, 
  onMapMove, 
 
}) => {
  const mapRef = useRef(null); 


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
      onMapMove(map.getCenter(), map.getZoom()); 
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
        }} 
        maxBounds={BANGLADESH_BOUNDS}
        minZoom={6} 
        onMoveend={handleLeafletMapMove} 
        onZoomend={handleLeafletMapMove}
      >
        <ChangeView center={currentCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => {
          if (property && property._id && property.position) {
            return (
              <MapMarker
                key={property._id}
                property={property} 
                isSelected={selectedProperty?._id === property._id}
                onClick={onMarkerClick} 
                
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
