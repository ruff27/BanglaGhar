// src/features/profile/hooks/useMyListings.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const useMyListings = () => {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, idToken } = useAuth(); // Get token and login status

  const fetchListings = useCallback(async () => {
    if (!isLoggedIn || !idToken) {
      setMyListings([]);
      setLoading(false); // Not loading if not logged in
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Fetching user listings for MyListingsPage...");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-profiles/me/listings`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setMyListings(response.data || []);
    } catch (err) {
      console.error("Error fetching user listings:", err.response || err);
      setError(err.response?.data?.error || "Failed to load your listings.");
      setMyListings([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, idToken]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]); // Re-fetch if login status or token changes

  return { myListings, loading, error, refetchListings: fetchListings }; // Expose listings, loading, error, and a refetch function
};

export default useMyListings;
