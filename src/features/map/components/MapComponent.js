import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Fix for default Leaflet marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom hook to update map view when center or zoom changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number" &&
      typeof zoom === "number"
    ) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * MapComponent
 */
const MapComponent = ({
  properties,
  mapCenter,
  mapZoom,
  userLocation,
  selectedProperty,
  onMarkerClick,
  onMapMove,
}) => {
  const { t } = useTranslation(); // Initialize translation
  const mapRef = useRef();

  // Handler for map move/zoom events
  const MapEvents = () => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);
    return null;
  };

  return (
    <MapContainer
      ref={mapRef}
      center={
        Array.isArray(mapCenter) && mapCenter.length === 2
          ? mapCenter
          : [23.8103, 90.4125]
      }
      zoom={typeof mapZoom === "number" ? mapZoom : 7}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
    >
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render User Location Marker */}
      {userLocation &&
        Array.isArray(userLocation) &&
        userLocation.length === 2 && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.6 }}
          >
            <Tooltip>Your Location</Tooltip>{" "}
            {/* <-- Kept as is, no key found */}
          </CircleMarker>
        )}

      {/* Render Property Markers */}
      {properties &&
        properties.map((property) => {
          if (
            !property?.position ||
            typeof property.position.lat !== "number" ||
            typeof property.position.lng !== "number"
          ) {
            console.warn(
              "Skipping property marker due to invalid position:",
              property
            );
            return null;
          }
          return (
            <Marker
              key={property._id}
              position={[property.position.lat, property.position.lng]}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(property);
                },
              }}
            >
              <Popup>
                <b>{property.title}</b>
                <br />
                {property.location}
                <br />
                {/* Applied translation for "Price" */}
                {t("price")}: ৳ {property.price?.toLocaleString()}
                {property.mode === "rent" ? "/mo" : ""} {/* Keep suffix */}
              </Popup>
            </Marker>
          );
        })}

      {onMapMove && <MapEvents />}
    </MapContainer>
  );
};

export default MapComponent;
