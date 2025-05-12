import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { divisionCenters } from "../../../constants/divisionCenters";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka coordinates
const DEFAULT_ZOOM = 7;

/**
 * Normalizes coordinates to prevent position drift
 * @param {Object|Array} position - Position as {lat, lng} or [lat, lng]
 * @returns {Object|Array|null} - Normalized position in the same format
 */
const normalizePosition = (position) => {
  // Handle array format [lat, lng]
  if (Array.isArray(position) && position.length === 2) {
    if (typeof position[0] === "number" && typeof position[1] === "number") {
      return [
        parseFloat(position[0].toFixed(6)),
        parseFloat(position[1].toFixed(6)),
      ];
    }
    return null;
  }

  // Handle object format {lat, lng}
  if (position && typeof position === "object") {
    if (typeof position.lat === "number" && typeof position.lng === "number") {
      return {
        lat: parseFloat(position.lat.toFixed(6)),
        lng: parseFloat(position.lng.toFixed(6)),
      };
    }
  }

  return null;
};

/**
 * Validates a property's position data from multiple potential formats
 * @param {Object} property - Property object to validate
 * @returns {boolean} - Whether the property has valid position data
 */
const hasValidPosition = (property) => {
  if (!property) return false;

  // Check position.lat/lng format
  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    return true;
  }

  // Check latitude/longitude format
  if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    return true;
  }

  return false;
};

/**
 * Get position data from a property in a consistent format
 * @param {Object} property - Property object
 * @returns {Object|null} - Position object in {lat, lng} format or null
 */
const getPropertyPosition = (property) => {
  if (!property) return null;

  // ✅ Primary: position.lat/lng
  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    return {
      lat: property.position.lat,
      lng: property.position.lng,
    };
  }

  // ✅ Secondary: latitude/longitude fields
  if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    return {
      lat: property.latitude,
      lng: property.longitude,
    };
  }

  // 🧭 Fallback: use division center if known
  const lowerDistrict = property.district?.toLowerCase() || "";
  const lowerDivision = property.division?.toLowerCase() || "";

  const fallbackKey = Object.keys(divisionCenters).find(
    (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
  );

  if (fallbackKey) {
    property.locationAccuracy = "district-level"; // so popup will say 📍 Approximate
    return {
      lat: divisionCenters[fallbackKey][0],
      lng: divisionCenters[fallbackKey][1],
    };
  }

  // ❌ No valid data
  return null;
};

/**
 * Custom Hook to manage map data, including properties, user location,
 * map state (center, zoom), and selected property.
 * Enhanced for position stability and state management.
 */
const useMapData = (propertyCode = null) => {
  const [properties, setProperties] = useState([]); // All fetched properties for the map
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // [lat, lng]
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selectedProperty, setSelectedProperty] = useState(null); // Holds the currently selected property object

  // Refs to track changes and prevent unnecessary updates
  const prevSelectedRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const specificPropertyLoadedRef = useRef(false);

  /**
   * Stabilizes a property object by creating a new object with normalized positions
   * to prevent position drift across renders - enhanced to handle multiple position formats
   * @param {Object} property - Original property object
   * @returns {Object} - New property object with stable positions
   */
  const createStableProperty = useCallback((property) => {
    if (!property) return null;

    // Create a stable copy to prevent mutations
    const stableProperty = { ...property };

    // Get position data in consistent format
    const positionData = getPropertyPosition(property);

    if (positionData) {
      // Normalize position
      const normalizedPosition = {
        lat: parseFloat(positionData.lat.toFixed(6)),
        lng: parseFloat(positionData.lng.toFixed(6)),
      };

      // Update both formats for consistency
      stableProperty.position = normalizedPosition;
      stableProperty.latitude = normalizedPosition.lat;
      stableProperty.longitude = normalizedPosition.lng;
    }

    return stableProperty;
  }, []);

  /**
   * Stabilizes an array of properties by creating new objects with normalized positions
   * @param {Array} propertiesArray - Array of property objects
   * @returns {Array} - New array of properties with stable positions
   */
  const createStableProperties = useCallback(
    (propertiesArray) => {
      if (!Array.isArray(propertiesArray)) return [];

      return propertiesArray
        .filter((p) => p && p._id) // Filter out invalid properties
        .map(createStableProperty);
    },
    [createStableProperty]
  );

  /**
   * Fetch a specific property by code
   * Enhanced with position normalization for stability
   */
  const fetchPropertyByCode = useCallback(
    async (code) => {
      if (!code) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/properties/${code}`);
        const property = response.data;

        if (!property) {
          setError(`Property with code ${code} not found.`);
          return null;
        }

        // Check if property has valid coordinates
        if (!hasValidPosition(property)) {
          setError(`Property with code ${code} has invalid location data.`);
          return null;
        }

        // Create a stable property with normalized position
        const stableProperty = createStableProperty(property);

        // Set this property as the selected one
        setSelectedProperty(stableProperty);

        // Get position data in array format for map center
        const positionData = getPropertyPosition(stableProperty);
        const normalizedCenter = [positionData.lat, positionData.lng];

        setMapCenter(normalizedCenter);
        setMapZoom(15); // Zoom in to property level

        // Mark as navigating to prevent interference from other updates
        isNavigatingRef.current = true;
        specificPropertyLoadedRef.current = true;

        // Store previous selection
        prevSelectedRef.current = stableProperty._id;

        // Add this property to the properties array if it's not already there
        setProperties((prev) => {
          const exists = prev.some((p) => p._id === stableProperty._id);
          if (exists) {
            // Update the existing property to ensure position consistency
            return prev.map((p) =>
              p._id === stableProperty._id ? stableProperty : p
            );
          }
          return [...prev, stableProperty];
        });

        console.log(
          `Property loaded: ${stableProperty._id}, position: ${JSON.stringify(
            stableProperty.position
          )}`
        );

        // Reset navigation flag after a short delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 300);

        return stableProperty;
      } catch (err) {
        console.error(`Error fetching property ${code}:`, err);
        setError(`Failed to load property: ${err.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [createStableProperty]
  );

  /**
   * Fetch properties - either all properties or just the specific one
   */
  useEffect(() => {
    if (propertyCode) {
      // If a property code is provided, fetch just that property
      fetchPropertyByCode(propertyCode);
    } else {
      // Otherwise fetch all properties for the map
      const fetchMapProperties = async () => {
        // Skip if we're currently navigating to a specific property
        if (isNavigatingRef.current) return;

        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${API_BASE_URL}/properties`);

          // Filter properties that have valid coordinates
          const validProperties = (response.data || []).filter(
            hasValidPosition
          );

          if (validProperties.length < response.data.length) {
            console.warn(
              `Filtered out ${
                response.data.length - validProperties.length
              } properties with invalid coordinates`
            );
          }

          // Create stable copies with normalized positions
          const stableProperties = createStableProperties(validProperties);

          setProperties(stableProperties);

          console.log(`Loaded ${stableProperties.length} properties for map`);
        } catch (err) {
          console.error("Error fetching map properties:", err);
          setError("Failed to load property locations.");
          setProperties([]);
        } finally {
          setLoading(false);
        }
      };

      fetchMapProperties();
    }
  }, [propertyCode, fetchPropertyByCode, createStableProperties]);

  /**
   * Get user's current location with position normalization
   */
  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Normalize coordinates for consistency
          const normalizedLocation = normalizePosition([latitude, longitude]);

          setUserLocation(normalizedLocation);

          // Only center map on user if not viewing a specific property
          if (!specificPropertyLoadedRef.current) {
            setMapCenter(normalizedLocation);
            setMapZoom(13); // Zoom in closer

            // Clear selection only if not looking at a specific property
            if (!propertyCode) {
              setSelectedProperty(null);
              prevSelectedRef.current = null;
            }
          }

          console.log("User located:", normalizedLocation);
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
  }, [propertyCode]);

  /**
   * Handler for selecting a property (e.g., when marker is clicked)
   * Enhanced with position stability and selection tracking
   */
  const handleSelectProperty = useCallback(
    (property) => {
      if (!property || !property._id) return;

      // Prevent reselection of the same property
      if (prevSelectedRef.current === property._id) {
        console.log(
          "Property already selected, skipping update:",
          property._id
        );
        return;
      }

      console.log("Selecting property:", property._id);
      prevSelectedRef.current = property._id;

      // Create a stable copy with normalized position
      const stableProperty = createStableProperty(property);

      // Update selected property with stable position
      setSelectedProperty(stableProperty);

      // Mark as navigating to prevent interference
      isNavigatingRef.current = true;

      // Center the map on the selected property with stable coordinates
      const positionData = getPropertyPosition(stableProperty);
      if (positionData) {
        const normalizedCenter = [positionData.lat, positionData.lng];

        setMapCenter(normalizedCenter);
        setMapZoom(15); // Zoom in closer

        console.log(
          `Centered map on property: ${JSON.stringify(normalizedCenter)}`
        );
      }

      // Reset navigation flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    },
    [createStableProperty]
  );

  /**
   * Handler to clear selected property
   */
  const clearSelectedProperty = useCallback(() => {
    setSelectedProperty(null);
    prevSelectedRef.current = null;
    specificPropertyLoadedRef.current = false;
  }, []);

  /**
   * Handlers to update map state if needed (e.g., on map move/zoom)
   * Enhanced with debouncing and position normalization
   */
  const handleMapMove = useCallback((center, zoom) => {
    // Skip updates if we're currently navigating to a property
    if (isNavigatingRef.current) return;

    // Normalize coordinates for consistency
    const normalizedCenter = normalizePosition(center);

    if (normalizedCenter) {
      setMapCenter(normalizedCenter);
    }

    if (typeof zoom === "number" && !isNaN(zoom)) {
      setMapZoom(zoom);
    }
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
    handleMapMove,
    fetchPropertyByCode,
  };
};

export default useMapData;
