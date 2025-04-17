import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Fuse from "fuse.js"; // Import Fuse.js

const API_BASE_URL = "http://localhost:5001/api"; // Use environment variable

// Default filter state
const initialFilters = {
  priceRange: [0, 5000000], // Example range, adjust as needed
  bedrooms: "any",
  bathrooms: "any",
  propertyType: "any",
};

// Fuse.js options
const fuseOptions = {
  keys: ["title", "location", "description", "propertyType"], // Fields to search
  threshold: 0.4, // Adjust sensitivity (0 = exact match, 1 = match anything)
  includeScore: true,
};

/**
 * Custom Hook to manage fetching, filtering, searching, and sorting of properties.
 */
const usePropertyFilters = (mode) => {
  // Accept mode ('rent', 'buy', 'sold') as argument
  const [properties, setProperties] = useState([]); // Original fetched properties
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price_asc"); // Default sort

  // Fetch properties based on mode whenever mode changes
  useEffect(() => {
    const fetchProperties = async () => {
      if (!mode) return; // Don't fetch if mode isn't set yet
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/properties?mode=${mode}`
        );
        setProperties(response.data || []);
      } catch (err) {
        console.error(`Error fetching ${mode} properties:`, err);
        setError(`Failed to load properties for ${mode}.`);
        setProperties([]); // Clear properties on error
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [mode]); // Re-fetch when mode changes

  // Initialize Fuse.js instance when properties load/change
  const fuse = useMemo(() => {
    if (!properties || properties.length === 0) return null;
    return new Fuse(properties, fuseOptions);
  }, [properties]);

  // Memoized function to filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = properties;

    // Apply search term using Fuse.js if searchTerm exists
    if (searchTerm.trim() && fuse) {
      result = fuse
        .search(searchTerm.trim())
        .map((fuseResult) => fuseResult.item);
    } else {
      // Apply standard filters if no search term
      result = properties.filter((p) => {
        const [minPrice, maxPrice] = filters.priceRange;
        const priceMatch = p.price >= minPrice && p.price <= maxPrice;
        const bedMatch =
          filters.bedrooms === "any" ||
          p.bedrooms === parseInt(filters.bedrooms);
        const bathMatch =
          filters.bathrooms === "any" ||
          p.bathrooms === parseInt(filters.bathrooms);
        const typeMatch =
          filters.propertyType === "any" ||
          p.propertyType?.toLowerCase() === filters.propertyType; // Handle potential missing propertyType
        return priceMatch && bedMatch && bathMatch && typeMatch;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "area_asc":
          return a.area - b.area;
        case "area_desc":
          return b.area - a.area;
        default:
          return 0;
      }
    });

    return result;
  }, [properties, filters, searchTerm, sortBy, fuse]);

  // Handlers for updating state
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm("");
    setSortBy("price_asc");
  }, []);

  return {
    properties: filteredAndSortedProperties, // Return filtered/sorted list
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
