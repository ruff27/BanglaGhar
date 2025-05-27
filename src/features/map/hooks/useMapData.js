// src/features/map/hooks/useMapData.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { divisionCenters } from "../../../constants/divisionCenters"; // Adjust path if needed

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka coordinates
const DEFAULT_ZOOM = 7;

// Helper to normalize {lat, lng} or [lat, lng] to {lat, lng} with fixed precision
const normalizeToLatLngObject = (positionInput) => {
  let lat, lng;
  if (Array.isArray(positionInput) && positionInput.length === 2) {
    [lat, lng] = positionInput;
  } else if (
    positionInput &&
    typeof positionInput.lat === "number" &&
    typeof positionInput.lng === "number"
  ) {
    ({ lat, lng } = positionInput);
  } else {
    return null; // Invalid input
  }

  if (typeof lat === "number" && typeof lng === "number") {
    return {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    };
  }
  return null;
};

// Helper to get processed position and accuracy for a property
const getProcessedPositionAndAccuracy = (property) => {
  if (!property) return { position: null, accuracy: "unknown" };

  let pos = null;
  let acc = property.locationAccuracy || "unknown";

  // 1. Check explicit position object
  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    pos = { lat: property.position.lat, lng: property.position.lng };
    if (acc === "unknown" && property.locationAccuracy)
      acc = property.locationAccuracy; // Use existing if present
    else if (acc === "unknown") acc = "precise"; // Default to precise if coords exist
  }
  // 2. Check separate latitude/longitude fields
  else if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    pos = { lat: property.latitude, lng: property.longitude };
    if (acc === "unknown" && property.locationAccuracy)
      acc = property.locationAccuracy;
    else if (acc === "unknown") acc = "precise";
  }
  // 3. Try fallback to division centers
  else {
    const lowerDistrict = property.district?.toLowerCase() || "";
    const lowerDivision = property.division?.toLowerCase() || ""; // Assuming you might have division data
    const fallbackKey = Object.keys(divisionCenters).find(
      (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
    );
    if (fallbackKey) {
      const coords = divisionCenters[fallbackKey];
      pos = { lat: coords[0], lng: coords[1] };
      acc = "district-level"; // Fallback is always district-level
    }
  }

  const normalizedPos = pos ? normalizeToLatLngObject(pos) : null;
  return { position: normalizedPos, accuracy: normalizedPos ? acc : "unknown" };
};

const useMapData = (initialPropertyCode = null) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // [lat, lng] object
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const prevSelectedIdRef = useRef(null);
  const isCenteringRef = useRef(false); // To manage map centering operations

  const createStableProperty = useCallback((property) => {
    if (!property || !property._id) return null;
    const stableProp = { ...property };
    const { position, accuracy } = getProcessedPositionAndAccuracy(stableProp);

    stableProp.position = position; // Now {lat, lng} or null
    stableProp.locationAccuracy = accuracy;

    // For compatibility if other components use these directly
    if (position) {
      stableProp.latitude = position.lat;
      stableProp.longitude = position.lng;
    } else {
      // If no position, ensure these are not misleading
      delete stableProp.latitude;
      delete stableProp.longitude;
    }
    return stableProp;
  }, []);

  const fetchPropertyByCode = useCallback(
    async (code) => {
      if (!code) return;
      console.log(`useMapData: Fetching property by code: ${code}`);
      setLoading(true);
      setError(null);
      isCenteringRef.current = true; // Indicate an operation that will set center/zoom

      try {
        const response = await axios.get(`${API_BASE_URL}/properties/${code}`);
        const propertyFromServer = response.data;

        if (!propertyFromServer) {
          setError(`Property with ID ${code} not found.`);
          setSelectedProperty(null);
          prevSelectedIdRef.current = null;
          setLoading(false);
          isCenteringRef.current = false;
          return;
        }

        const processedProperty = createStableProperty(propertyFromServer);

        if (!processedProperty || !processedProperty.position) {
          setError(`Property ${code} has no derivable location.`);
          setSelectedProperty(null);
          prevSelectedIdRef.current = null;
          setLoading(false);
          isCenteringRef.current = false;
          return;
        }

        setSelectedProperty(processedProperty);
        prevSelectedIdRef.current = processedProperty._id;
        setMapCenter([
          processedProperty.position.lat,
          processedProperty.position.lng,
        ]);
        setMapZoom(15); // Zoom in for a single property

        // Ensure this property is in the main list if not already
        setProperties((prevProps) => {
          const exists = prevProps.some((p) => p._id === processedProperty._id);
          if (exists) {
            return prevProps.map((p) =>
              p._id === processedProperty._id ? processedProperty : p
            );
          }
          return [...prevProps, processedProperty];
        });
      } catch (err) {
        console.error(`Error fetching property ${code}:`, err);
        setError(`Failed to load property ${code}: ${err.message}`);
        setSelectedProperty(null);
        prevSelectedIdRef.current = null;
      } finally {
        setLoading(false);
        setTimeout(() => {
          isCenteringRef.current = false;
        }, 300); // Allow map to settle
      }
    },
    [createStableProperty]
  );

  useEffect(() => {
    if (initialPropertyCode) {
      fetchPropertyByCode(initialPropertyCode);
    } else {
      const fetchAllMapProperties = async () => {
        if (isCenteringRef.current) return; // Don't fetch all if centering on specific
        console.log("useMapData: Fetching all map properties");
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/properties?includeUnavailable=true`
          ); // Fetch all statuses for map initially
          const mappableProperties = (response.data || [])
            .map(createStableProperty)
            .filter((p) => p && p.position); // Only include properties with a valid final position
          setProperties(mappableProperties);
          console.log(
            `useMapData: Loaded ${mappableProperties.length} mappable properties.`
          );
        } catch (err) {
          console.error("Error fetching all map properties:", err);
          setError("Failed to load property locations.");
          setProperties([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAllMapProperties();
    }
  }, [initialPropertyCode, createStableProperty, fetchPropertyByCode]);

  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      isCenteringRef.current = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const normLocation = normalizeToLatLngObject([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          if (normLocation) {
            setUserLocation(normLocation); // Store as {lat, lng}
            setMapCenter([normLocation.lat, normLocation.lng]); // Set map center as [lat, lng]
            setMapZoom(13);
            // Optionally clear selected property if not viewing a specific one by URL
            if (!initialPropertyCode) {
              setSelectedProperty(null);
              prevSelectedIdRef.current = null;
            }
          }
          setTimeout(() => {
            isCenteringRef.current = false;
          }, 300);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Could not get your location.");
          isCenteringRef.current = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported.");
    }
  }, [initialPropertyCode]);

  const handleSelectProperty = useCallback((property) => {
    if (!property || !property._id || !property.position) {
      console.warn(
        "handleSelectProperty: Invalid property or missing position",
        property
      );
      return;
    }
    if (prevSelectedIdRef.current === property._id) return; // Already selected

    console.log(`useMapData: Selecting property: ${property._id}`);
    isCenteringRef.current = true;
    // Property should already be processed by createStableProperty
    setSelectedProperty(property);
    prevSelectedIdRef.current = property._id;
    setMapCenter([property.position.lat, property.position.lng]);
    setMapZoom(15);
    setTimeout(() => {
      isCenteringRef.current = false;
    }, 300);
  }, []);

  const clearSelectedProperty = useCallback(() => {
    setSelectedProperty(null);
    prevSelectedIdRef.current = null;
    // Do not reset map center/zoom here unless intended
    // if a specific property was loaded via URL, map should stay there
    // if (!initialPropertyCode) {
    //   setMapCenter(DEFAULT_CENTER);
    //   setMapZoom(DEFAULT_ZOOM);
    // }
  }, []);

  const handleMapMove = useCallback((center, zoom) => {
    if (isCenteringRef.current) return; // If we are programmatically centering, ignore move events

    const normCenter = normalizeToLatLngObject(center); // center is expected as {lat, lng} from Leaflet
    if (normCenter) {
      setMapCenter([normCenter.lat, normCenter.lng]); // Keep mapCenter as [lat, lng]
    }
    if (typeof zoom === "number" && !isNaN(zoom)) {
      setMapZoom(zoom);
    }
  }, []);

  return {
    properties, // These are now all processed and have .position if mappable
    loading,
    error,
    userLocation, // This is {lat, lng}
    mapCenter, // This is [lat, lng]
    mapZoom,
    selectedProperty, // This is a processed property object
    locateUser,
    handleSelectProperty,
    clearSelectedProperty,
    handleMapMove,
    fetchPropertyByCode, // Expose if MapPage needs to re-fetch
  };
};

export default useMapData;
