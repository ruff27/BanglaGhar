import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-leaflet";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { divisionCenters } from "../../../constants/divisionCenters";
// Default center coordinates (Dhaka)
const DEFAULT_CENTER = [23.8103, 90.4125];
const DEFAULT_ZOOM = 7;

// Helper: Check if property has valid coordinates
const hasValidPosition = (property) => {
  if (property?.position?.lat && property?.position?.lng) return true;
  if (property?.latitude !== undefined && property?.longitude !== undefined)
    return true;
  return false;
};

// Normalize position to [lat, lng]
const normalizePositionArray = (property) => {
  if (!property) return null;

  // Direct lat/lng
  if (
    property.position?.lat !== undefined &&
    property.position?.lng !== undefined
  ) {
    return [
      parseFloat(property.position.lat.toFixed(6)),
      parseFloat(property.position.lng.toFixed(6)),
    ];
  }

  if (property.latitude !== undefined && property.longitude !== undefined) {
    return [
      parseFloat(property.latitude.toFixed(6)),
      parseFloat(property.longitude.toFixed(6)),
    ];
  }

  // Fallback: match district/division to known centers
  const lowerDistrict = property.district?.toLowerCase() || "";
  const lowerDivision = property.division?.toLowerCase() || "";

  const fallbackKey = Object.keys(divisionCenters).find(
    (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
  );

  if (fallbackKey) {
    property.locationAccuracy = "district-level";
    return divisionCenters[fallbackKey];
  }

  return null;
};

const MapComponent = ({
  properties = [],
  mapCenter = DEFAULT_CENTER,
  mapZoom = DEFAULT_ZOOM,
  selectedProperty,
}) => {
  const mapRef = useRef(null);
  const [, setMapReady] = useState(false);

  const normalizedCenter =
    Array.isArray(mapCenter) && mapCenter.length === 2
      ? mapCenter
      : DEFAULT_CENTER;
  const normalizedZoom =
    typeof mapZoom === "number" && !isNaN(mapZoom) ? mapZoom : DEFAULT_ZOOM;
  const validProperties = properties.filter((property) =>
    hasValidPosition(property)
  );
  console.log(
    "🧪 Valid Properties With Marker Coordinates:",
    validProperties.map((p) => ({
      title: p.title,
      coords: normalizePositionArray(p),
    }))
  );

  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent double initialization
    if (mapRef.current._leaflet_id) return;

    const map = L.map(mapRef.current).setView(normalizedCenter, normalizedZoom);

    // Lock to Bangladesh bounds
    map.setMaxBounds([
      [20.5, 87], // Southwest
      [26.7, 92], // Northeast
    ]);

    // Add OpenFreeMap vector tiles
    L.maplibreGL({
      style: "https://tiles.openfreemap.org/styles/liberty",
      attribution: "© OpenStreetMap contributors | Style: OpenFreeMap Liberty",
    }).addTo(map);

    const bounds = [];

    // Add property markers and collect their positions
    validProperties.forEach((property) => {
      console.log("📌 Adding marker for:", {
        title: property.title,
        pos: normalizePositionArray(property),
        raw: property,
      });
      const position = normalizePositionArray(property);
      if (!position) return;
      console.log("📍 Adding marker:", {
        title: property.title,
        position: normalizePositionArray(property),
        division: property.division,
        district: property.district,
      });

      const marker = L.marker(position).addTo(map);
      marker.bindPopup(`<b>${property.title || "Property"}</b>`);
      bounds.push(position);
    });

    // Fit bounds if there are markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    } else {
      map.setView(normalizedCenter, normalizedZoom); // fallback
    }

    setMapReady(true);
  }, [normalizedCenter, normalizedZoom, validProperties, selectedProperty]);

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      />
    </Box>
  );
};

// Loading state (optional)
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

// Error state (optional)
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
