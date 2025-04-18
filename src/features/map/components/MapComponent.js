import React, { useEffect, useRef } from "react"; // Added useRef
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
    // Check if center and zoom are valid numbers before setting view
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
 * Renders the Leaflet map, markers, popups, and user location.
 */
const MapComponent = ({
  properties,
  mapCenter,
  mapZoom,
  userLocation,
  selectedProperty, // To potentially highlight selected marker
  onMarkerClick, // Callback when a marker is clicked
  onMapMove, // Optional: Callback when map moves/zooms
}) => {
  const mapRef = useRef(); // Use ref for map instance if needed elsewhere

  // Handler for map move/zoom events
  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      if (!onMapMove) return; // Only attach if handler provided

      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapMove([center.lat, center.lng], zoom);
      };

      map.on("moveend", handleMoveEnd);
      map.on("zoomend", handleMoveEnd); // Also trigger on zoom end

      return () => {
        map.off("moveend", handleMoveEnd);
        map.off("zoomend", handleMoveEnd);
      };
      // Removed onMapMove from dependency array to address exhaustive-deps warning
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);
    return null;
  };

  return (
    // Ensure MapContainer receives valid center/zoom initially
    <MapContainer
      ref={mapRef}
      center={
        Array.isArray(mapCenter) && mapCenter.length === 2
          ? mapCenter
          : [23.8103, 90.4125]
      } // Default center if invalid
      zoom={typeof mapZoom === "number" ? mapZoom : 7} // Default zoom if invalid
      scrollWheelZoom={true} // Enable scroll wheel zoom
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }} // Inherit border radius
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
            radius={8} // Adjust size
            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.6 }}
          >
            <Tooltip>Your Location</Tooltip>
          </CircleMarker>
        )}

      {/* Render Property Markers */}
      {properties &&
        properties.map((property) => {
          // Ensure position exists and has valid lat/lng
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
              // Optionally change icon style for selected marker
              // icon={selectedProperty?._id === property._id ? customSelectedIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(property); // Call handler passed from parent
                },
              }}
            >
              <Popup>
                {/* Basic Popup Content - Can be customized */}
                <b>{property.title}</b>
                <br />
                {property.location}
                <br />
                Price: ৳ {property.price?.toLocaleString()}
                {property.mode === "rent" ? "/mo" : ""}
              </Popup>
            </Marker>
          );
        })}

      {/* Attach map event listeners if needed */}
      {onMapMove && <MapEvents />}
    </MapContainer>
  );
};

export default MapComponent;
