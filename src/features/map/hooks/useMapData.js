import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api"; // Use environment variable
const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka coordinates
const DEFAULT_ZOOM = 7;

/**
 * Custom Hook to manage map data, including properties, user location,
 * map state (center, zoom), and selected property.
 */
const useMapData = () => {
  const [properties, setProperties] = useState([]); // All fetched properties for the map
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // [lat, lng]
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selectedProperty, setSelectedProperty] = useState(null); // Holds the currently selected property object

  // Fetch all properties suitable for map display (need lat/lng)
  useEffect(() => {
    const fetchMapProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch properties - ensure your API returns lat/lng or position field
        const response = await axios.get(`${API_BASE_URL}/properties`);
        // Filter properties that have valid coordinates
        const mapProperties = response.data.filter(
          (p) =>
            p.position &&
            typeof p.position.lat === "number" &&
            typeof p.position.lng === "number"
        );
        setProperties(mapProperties || []);
      } catch (err) {
        console.error("Error fetching map properties:", err);
        setError("Failed to load property locations.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMapProperties();
  }, []);

  // Get user's current location
  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newUserLocation = [latitude, longitude];
          setUserLocation(newUserLocation);
          setMapCenter(newUserLocation); // Center map on user
          setMapZoom(13); // Zoom in closer
          setSelectedProperty(null); // Clear selection when locating user
          console.log("User located:", newUserLocation);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(
            "Could not get your location. Please ensure location services are enabled."
          );
          setUserLocation(null); // Clear location on error
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Geolocation options
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []); // Empty dependency array - function doesn't change

  // Handler for selecting a property (e.g., when marker is clicked)
  const handleSelectProperty = useCallback((property) => {
    setSelectedProperty(property);
    // Optionally center the map on the selected property
    if (property?.position?.lat && property?.position?.lng) {
      setMapCenter([property.position.lat, property.position.lng]);
      // setMapZoom(15); // Optionally zoom in closer
    }
  }, []);

  // Handler to clear selected property
  const clearSelectedProperty = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  // Handlers to update map state if needed (e.g., on map move/zoom)
  const handleMapMove = useCallback((center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  return {
    properties,
    loading,
    error,
    userLocation,
    mapCenter,
    mapZoom,
    selectedProperty,
    locateUser,
    handleSelectProperty,
    clearSelectedProperty,
    handleMapMove, // Expose if MapComponent needs to update state externally
  };
};

export default useMapData;
