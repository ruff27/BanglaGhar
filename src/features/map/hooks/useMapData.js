import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { divisionCenters } from "../../../constants/divisionCenters"; 

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const DEFAULT_CENTER = [23.8103, 90.4125]; 
const DEFAULT_ZOOM = 7;

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
    return null;
  }

  if (typeof lat === "number" && typeof lng === "number") {
    return {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    };
  }
  return null;
};

const getProcessedPositionAndAccuracy = (property) => {
  if (!property) return { position: null, accuracy: "unknown" };

  let pos = null;
  let acc = property.locationAccuracy || "unknown";

  
  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    pos = { lat: property.position.lat, lng: property.position.lng };
    if (acc === "unknown" && property.locationAccuracy)
      acc = property.locationAccuracy; 
    else if (acc === "unknown") acc = "precise";
  }
  
  else if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    pos = { lat: property.latitude, lng: property.longitude };
    if (acc === "unknown" && property.locationAccuracy)
      acc = property.locationAccuracy;
    else if (acc === "unknown") acc = "precise";
  }

  else {
    const lowerDistrict = property.district?.toLowerCase() || "";
    const lowerDivision = property.division?.toLowerCase() || ""; 
    const fallbackKey = Object.keys(divisionCenters).find(
      (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
    );
    if (fallbackKey) {
      const coords = divisionCenters[fallbackKey];
      pos = { lat: coords[0], lng: coords[1] };
      acc = "district-level"; 
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
  const isCenteringRef = useRef(false); 

  const createStableProperty = useCallback((property) => {
    if (!property || !property._id) return null;
    const stableProp = { ...property };
    const { position, accuracy } = getProcessedPositionAndAccuracy(stableProp);

    stableProp.position = position; 
    stableProp.locationAccuracy = accuracy;

    
    if (position) {
      stableProp.latitude = position.lat;
      stableProp.longitude = position.lng;
    } else {
      
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
      isCenteringRef.current = true; 

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
        setMapZoom(15); 

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
        }, 300); 
      }
    },
    [createStableProperty]
  );

  useEffect(() => {
    if (initialPropertyCode) {
      fetchPropertyByCode(initialPropertyCode);
    } else {
      const fetchAllMapProperties = async () => {
        if (isCenteringRef.current) return; 
        console.log("useMapData: Fetching all map properties");
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/properties?includeUnavailable=true`
          ); 
          const mappableProperties = (response.data || [])
            .map(createStableProperty)
            .filter((p) => p && p.position); 
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
            setUserLocation(normLocation); 
            setMapCenter([normLocation.lat, normLocation.lng]); // Set map center as [lat, lng]
            setMapZoom(13);
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
    if (prevSelectedIdRef.current === property._id) return; 

    console.log(`useMapData: Selecting property: ${property._id}`);
    isCenteringRef.current = true;
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
    
  }, []);

  const handleMapMove = useCallback((center, zoom) => {
    if (isCenteringRef.current) return; // 
    const normCenter = normalizeToLatLngObject(center);
      setMapCenter([normCenter.lat, normCenter.lng]);
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
