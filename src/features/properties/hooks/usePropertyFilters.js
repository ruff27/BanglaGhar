// src/features/Properties/hooks/usePropertyFilters.js
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import _debounce from "lodash/debounce";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Default state for client-side filters
const initialClientFiltersState = {
  priceRange: [0, 50000000],
  bedrooms: "any",
  bathrooms: "any",
  propertyType: "any",
};

// Fuse.js options for client-side search
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.3 },
    { name: "addressLine1", weight: 0.2 },
    { name: "cityTown", weight: 0.15 },
    { name: "upazila", weight: 0.1 },
    { name: "district", weight: 0.15 },
    { name: "description", weight: 0.05 },
    { name: "propertyType", weight: 0.05 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
};

/**
 * Custom hook for fetching, filtering, and sorting properties.
 * @param {object} apiQueryParams - An object containing key-value pairs for API query parameters (e.g., { listingStatus: 'sold' }).
 */
const usePropertyFilters = (apiQueryParams = {}) => {
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Client-side filters state
  const [clientFilters, setClientFilters] = useState(initialClientFiltersState);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc"); // Default sort

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct query string from apiQueryParams
        const queryString = new URLSearchParams(apiQueryParams).toString();
        const fetchUrl = `${API_BASE_URL}/properties${
          queryString ? "?" + queryString : ""
        }`;

        console.log(`Workspaceing properties from: ${fetchUrl}`); // For debugging

        const response = await axios.get(fetchUrl);
        if (Array.isArray(response.data)) {
          setAllProperties(response.data);
          console.log(`Workspaceed ${response.data.length} properties.`);
        } else {
          console.error("API did not return an array:", response.data);
          setError("Received invalid data from server.");
          setAllProperties([]);
        }
      } catch (err) {
        console.error(`Error fetching properties:`, err);
        setError(`Failed to load properties. ${err.message}`);
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [JSON.stringify(apiQueryParams)]); // Re-fetch when apiQueryParams change

  // Debounce Search Term
  const debouncedSetSearch = useCallback(
    _debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = useCallback(
    (term) => {
      setSearchTerm(term);
      debouncedSetSearch(term);
    },
    [debouncedSetSearch]
  );

  // Initialize Fuse.js instance
  const fuse = useMemo(() => {
    if (!Array.isArray(allProperties) || allProperties.length === 0)
      return null;
    return new Fuse(allProperties, fuseOptions);
  }, [allProperties]);

  // Apply client-side filters and search to the fetched properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = Array.isArray(allProperties) ? [...allProperties] : [];

    // 1. Apply Client-Side Filters (price, bedrooms, bathrooms, propertyType)
    result = result.filter((p) => {
      if (!p || typeof p !== "object") return false;

      const priceMatch =
        p.price !== null && p.price !== undefined
          ? (() => {
              const [minPrice, maxPrice] = clientFilters.priceRange;
              // Ensure maxPrice check considers it as an upper bound unless it's the max possible value
              return (
                p.price >= minPrice &&
                (maxPrice === 50000000 ? true : p.price <= maxPrice)
              );
            })()
          : true; // Or decide how to handle items with no price

      let bedMatch = true;
      if (
        clientFilters.bedrooms !== "any" &&
        p.bedrooms !== null &&
        p.bedrooms !== undefined
      ) {
        const requiredBeds = parseInt(clientFilters.bedrooms, 10);
        bedMatch =
          clientFilters.bedrooms === "5"
            ? p.bedrooms >= requiredBeds
            : p.bedrooms === requiredBeds;
      } else if (
        clientFilters.bedrooms !== "any" &&
        (p.bedrooms === null || p.bedrooms === undefined)
      ) {
        bedMatch = false; // If filter is set but property has no bedroom info
      }

      let bathMatch = true;
      if (
        clientFilters.bathrooms !== "any" &&
        p.bathrooms !== null &&
        p.bathrooms !== undefined
      ) {
        const requiredBaths = parseInt(clientFilters.bathrooms, 10);
        bathMatch =
          clientFilters.bathrooms === "3"
            ? p.bathrooms >= requiredBaths
            : p.bathrooms === requiredBaths;
      } else if (
        clientFilters.bathrooms !== "any" &&
        (p.bathrooms === null || p.bathrooms === undefined)
      ) {
        bathMatch = false; // If filter is set but property has no bathroom info
      }

      const typeMatch =
        clientFilters.propertyType === "any" ||
        (p.propertyType &&
          p.propertyType.toLowerCase() ===
            clientFilters.propertyType.toLowerCase());

      return priceMatch && bedMatch && bathMatch && typeMatch;
    });

    // 2. Apply Fuzzy Search (on the already client-filtered list)
    if (debouncedSearchTerm.trim() && result.length > 0) {
      // If you want to search within the already filtered `result`:
      const tempFuse = new Fuse(result, fuseOptions);
      result = tempFuse
        .search(debouncedSearchTerm.trim())
        .map((fuseResult) => fuseResult.item);
      // If you want to search on `allProperties` and then re-apply client filters, it's more complex.
      // The current approach searches within the client-filtered set.
    }

    // 3. Apply Sorting
    const sortedResult = [...result]; // Create a new array for sorting
    sortedResult.sort((a, b) => {
      const priceA = a?.price ?? 0;
      const priceB = b?.price ?? 0;
      const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      const areaA = a?.area ?? 0;
      const areaB = b?.area ?? 0;

      switch (sortBy) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "date_asc":
          return dateA - dateB;
        case "date_desc":
          return dateB - dateA;
        case "area_asc":
          return areaA - areaB;
        case "area_desc":
          return areaB - areaA;
        default:
          return 0;
      }
    });

    return sortedResult;
  }, [allProperties, clientFilters, debouncedSearchTerm, sortBy, fuse]);

  // Handlers for client-side filters and sort
  const handleClientFilterChange = useCallback((newFilters) => {
    setClientFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
  }, []);

  const resetClientFilters = useCallback(() => {
    setClientFilters(initialClientFiltersState);
    setSearchTerm(""); // Also reset search term
    setDebouncedSearchTerm("");
    setSortBy("date_desc"); // Reset sort to default
  }, []);

  return {
    properties: filteredAndSortedProperties,
    loading,
    error,
    filters: clientFilters, // Expose client-side filters state
    searchTerm,
    sortBy,
    handleFilterChange: handleClientFilterChange, // Expose handler for client-side filters
    handleSearchChange,
    handleSortChange,
    resetFilters: resetClientFilters, // Expose handler for resetting client-side filters
  };
};

export default usePropertyFilters;
