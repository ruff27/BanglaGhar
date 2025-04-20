import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Fuse from "fuse.js"; // Keep Fuse.js
import _debounce from "lodash/debounce"; // Import debounce utility

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Default filter state - Adjust price range if needed based on your data
const initialFilters = {
  priceRange: [0, 50000000], // Example: 0 to 5 Cr
  bedrooms: "any",
  bathrooms: "any",
  propertyType: "any",
};

// Fuse.js options (adjust keys and threshold as needed)
const fuseOptions = {
  keys: ["title", "location", "description", "propertyType"],
  threshold: 0.1, // Lower value means stricter matching
  // includeScore: true, // Include score if needed for relevance sorting later
};

/**
 * Custom Hook to manage fetching, filtering, searching, and sorting of properties.
 */
const usePropertyFilters = (mode) => {
  const [allProperties, setAllProperties] = useState([]); // Store the original fetched list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // State for debounced search term
  const [sortBy, setSortBy] = useState("price_asc"); // Default sort

  // --- Fetching ---
  useEffect(() => {
    const fetchProperties = async () => {
      // Fetch based on mode only if mode is provided (e.g., 'rent', 'buy', 'sold')
      // If mode is undefined/null, you might fetch all or handle differently
      const fetchUrl = mode
        ? `${API_BASE_URL}/properties?mode=${mode}`
        : `${API_BASE_URL}/properties`; // Example: fetch all if no mode

      console.log(`Fetching properties from: ${fetchUrl}`); // Debug log

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(fetchUrl);
        setAllProperties(response.data || []);
        console.log(`Fetched ${response.data?.length || 0} properties.`); // Debug log
      } catch (err) {
        console.error(`Error fetching properties:`, err);
        setError(`Failed to load properties. ${err.message}`);
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [mode]); // Re-fetch only when mode changes

  // --- Debounce Search Term ---
  // Debounce function - updates the actual search term used for filtering after a delay
  const debouncedSetSearch = useCallback(
    _debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300), // 300ms delay - adjust as needed
    [] // Empty dependency array means debounce function is created once
  );

  // Update search term immediately for input field, but debounce the filtering trigger
  const handleSearchChange = useCallback(
    (term) => {
      setSearchTerm(term); // Update input field value immediately
      debouncedSetSearch(term); // Trigger debounced update for filtering
    },
    [debouncedSetSearch]
  );

  // --- Filtering, Searching, Sorting ---
  const fuse = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return null;
    // Initialize Fuse with the original full list
    return new Fuse(allProperties, fuseOptions);
  }, [allProperties]); // Re-initialize only when the original list changes

  const filteredAndSortedProperties = useMemo(() => {
    let result = allProperties;

    // 1. Apply Standard Filters first
    result = result.filter((p) => {
      // Ensure property and price exist
      if (p?.price === null || p?.price === undefined) return false;

      const [minPrice, maxPrice] = filters.priceRange;
      // Handle edge case where maxPrice might be the absolute max
      const priceMatch =
        p.price >= minPrice &&
        (maxPrice === 50000000 ? p.price >= minPrice : p.price <= maxPrice); // Adjust max value if needed

      // --- Robust Bed/Bath/Type Matching ---
      let bedMatch = true;
      if (filters.bedrooms !== "any") {
        const requiredBeds = parseInt(filters.bedrooms); // e.g., 3 or 5 for '5+'
        if (filters.bedrooms === "5") {
          // Handle '5+' specifically
          bedMatch = p.bedrooms >= requiredBeds;
        } else {
          bedMatch = p.bedrooms === requiredBeds;
        }
      }

      let bathMatch = true;
      if (filters.bathrooms !== "any") {
        const requiredBaths = parseInt(filters.bathrooms); // e.g., 3 for '3+'
        if (filters.bathrooms === "3") {
          // Handle '3+' specifically
          bathMatch = p.bathrooms >= requiredBaths;
        } else {
          bathMatch = p.bathrooms === requiredBaths;
        }
      }

      const typeMatch =
        filters.propertyType === "any" ||
        p.propertyType?.toLowerCase() === filters.propertyType.toLowerCase(); // Case-insensitive match

      return priceMatch && bedMatch && bathMatch && typeMatch;
    });

    // 2. Apply Fuzzy Search (Fuse.js) on the *filtered* results if debouncedSearchTerm exists
    if (debouncedSearchTerm.trim() && fuse) {
      console.log(
        `Searching within ${result.length} properties for: ${debouncedSearchTerm}`
      ); // Debug log
      // Re-initialize Fuse with the currently filtered subset for searching *within* it
      const tempFuse = new Fuse(result, fuseOptions);
      result = tempFuse
        .search(debouncedSearchTerm.trim())
        .map((fuseResult) => fuseResult.item);
      console.log(`Found ${result.length} properties after search.`); // Debug log
    }
    // else { // No search term, result remains the filtered list
    //     console.log(`No search term, using ${result.length} filtered properties.`); // Debug log
    // }

    // 3. Apply Sorting to the final list
    const sortedResult = [...result]; // Create a new array for sorting
    sortedResult.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price_desc":
          return (b.price ?? 0) - (a.price ?? 0);
        // Ensure createdAt exists and handle potential nulls/invalid dates
        case "date_asc":
          return (
            (a.createdAt ? new Date(a.createdAt) : 0) -
            (b.createdAt ? new Date(b.createdAt) : 0)
          );
        case "date_desc":
          return (
            (b.createdAt ? new Date(b.createdAt) : 0) -
            (a.createdAt ? new Date(a.createdAt) : 0)
          );
        case "area_asc":
          return (a.area ?? 0) - (b.area ?? 0);
        case "area_desc":
          return (b.area ?? 0) - (a.area ?? 0);
        default:
          return 0;
      }
    });

    return sortedResult;
  }, [allProperties, filters, debouncedSearchTerm, sortBy, fuse]); // Use debouncedSearchTerm here

  // --- Handlers ---
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // handleSearchChange is already defined above with debounce

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm(""); // Reset immediate search term
    setDebouncedSearchTerm(""); // Reset debounced search term
    setSortBy("price_asc");
  }, []);

  return {
    properties: filteredAndSortedProperties, // Return the final processed list
    loading,
    error,
    filters,
    searchTerm, // Still return immediate term for input field binding
    sortBy,
    handleFilterChange,
    handleSearchChange, // Return the non-debounced handler for the input field
    handleSortChange,
    resetFilters,
  };
};

export default usePropertyFilters;
