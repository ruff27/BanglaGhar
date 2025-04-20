// src/features/Properties/hooks/usePropertyFilters.js
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import _debounce from "lodash/debounce";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Default filter state remains the same for now
const initialFilters = {
  priceRange: [0, 50000000],
  bedrooms: "any",
  bathrooms: "any",
  propertyType: "any",
};

// --- Updated Fuse.js options ---
// Search in new relevant fields. Adjust weights as needed.
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.3 },
    // Use new address fields instead of 'location'
    { name: "addressLine1", weight: 0.2 }, // Search primary address line
    { name: "cityTown", weight: 0.15 }, // Search city/town
    { name: "upazila", weight: 0.1 }, // Search upazila
    { name: "district", weight: 0.15 }, // Search district
    { name: "description", weight: 0.05 },
    { name: "propertyType", weight: 0.05 },
    // Optionally add more searchable fields
  ],
  threshold: 0.3,
  ignoreLocation: true,
};
// --- End of Fuse.js options update ---

const usePropertyFilters = (mode) => {
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc"); // Default sort to newest first

  // Fetching logic remains largely the same
  useEffect(() => {
    const fetchProperties = async () => {
      // *** IMPORTANT: Ensure backend GET /api/properties returns the *new* fields ***
      // (addressLine1, cityTown, district, upazila, postalCode, features object, bangladeshDetails object etc.)
      const fetchUrl = mode
        ? `${API_BASE_URL}/properties?listingType=${mode}`
        : `${API_BASE_URL}/properties`;

      console.log(`Fetching properties from: ${fetchUrl}`);

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(fetchUrl);
        // Add validation: ensure response.data is an array
        if (Array.isArray(response.data)) {
          setAllProperties(response.data);
          console.log(`Fetched ${response.data.length} properties.`);
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
  }, [mode]);

  // Debounce Search Term logic remains the same
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

  // Filtering, Searching, Sorting logic
  const fuse = useMemo(() => {
    // Ensure allProperties is an array before initializing Fuse
    if (!Array.isArray(allProperties) || allProperties.length === 0)
      return null;
    return new Fuse(allProperties, fuseOptions);
  }, [allProperties]);

  const filteredAndSortedProperties = useMemo(() => {
    // Ensure allProperties is an array
    let result = Array.isArray(allProperties) ? [...allProperties] : [];

    // 1. Apply Standard Filters
    result = result.filter((p) => {
      // Basic check for valid property structure
      if (!p || typeof p !== "object") return false;

      // Price Filter (check price exists)
      const priceMatch =
        p.price !== null && p.price !== undefined
          ? (() => {
              const [minPrice, maxPrice] = filters.priceRange;
              return (
                p.price >= minPrice &&
                (maxPrice === 50000000
                  ? p.price >= minPrice
                  : p.price <= maxPrice)
              );
            })()
          : true; // Include if price is missing? Or exclude (return false)? Decide based on requirements. Let's exclude for now.
      // if (p.price === null || p.price === undefined) return false;

      // Bed/Bath Filter (handle 'any' and 'X+')
      let bedMatch = true;
      if (
        filters.bedrooms !== "any" &&
        p.bedrooms !== null &&
        p.bedrooms !== undefined
      ) {
        const requiredBeds = parseInt(filters.bedrooms);
        bedMatch =
          filters.bedrooms === "5"
            ? p.bedrooms >= requiredBeds
            : p.bedrooms === requiredBeds;
      } else if (filters.bedrooms !== "any") {
        bedMatch = false; // Exclude if filter is set but property field is missing
      }

      let bathMatch = true;
      if (
        filters.bathrooms !== "any" &&
        p.bathrooms !== null &&
        p.bathrooms !== undefined
      ) {
        const requiredBaths = parseInt(filters.bathrooms);
        bathMatch =
          filters.bathrooms === "3"
            ? p.bathrooms >= requiredBaths
            : p.bathrooms === requiredBaths;
      } else if (filters.bathrooms !== "any") {
        bathMatch = false; // Exclude if filter is set but property field is missing
      }

      // Type Filter (handle 'any' and case-insensitivity)
      const typeMatch =
        filters.propertyType === "any" ||
        (p.propertyType &&
          p.propertyType.toLowerCase() === filters.propertyType.toLowerCase());

      return priceMatch && bedMatch && bathMatch && typeMatch;
    });

    // 2. Apply Fuzzy Search if term exists
    if (debouncedSearchTerm.trim() && fuse) {
      // Important: Fuse needs to be initialized with the *original* list to find matches
      // Then we filter the *original* list based on the IDs found by Fuse
      // OR re-initialize fuse with the filtered subset as before (simpler for now)
      const tempFuse = new Fuse(result, fuseOptions); // Search within the filtered results
      result = tempFuse
        .search(debouncedSearchTerm.trim())
        .map((fuseResult) => fuseResult.item);
    }

    // 3. Apply Sorting
    const sortedResult = [...result]; // Sort the final list
    sortedResult.sort((a, b) => {
      // Add null/undefined checks for robustness
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
  }, [allProperties, filters, debouncedSearchTerm, sortBy, fuse]); // Use debouncedSearchTerm

  // Handlers remain the same
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSortBy("date_desc"); // Reset to default sort
  }, []);

  return {
    properties: filteredAndSortedProperties,
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    resetFilters,
  };
};

export default usePropertyFilters;
