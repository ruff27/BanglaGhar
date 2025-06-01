import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; 
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api"; 

/**
 * Custom Hook to manage user's wishlist state and actions.
 * Returns wishlist IDs and functions to interact with it.
 */
const useWishlist = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  const fetchWishlistIds = useCallback(async () => {
    if (isLoggedIn && user?.email) {
      setLoadingWishlist(true);
      setWishlistError(null);
      try {
        console.log(`Fetching wishlist for ${user.email}`); // Debug log
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.email}/wishlist`
        );
        if (response.data && Array.isArray(response.data.wishlist)) {
          const ids = response.data.wishlist.map((item) => item?._id || item); 
          setWishlistIds(new Set(ids));
          console.log("Fetched wishlist IDs:", ids); 
        } else {
          console.warn(
            "Unexpected response structure for wishlist IDs:",
            response.data
          );
          setWishlistIds(new Set());
        }
      } catch (error) {
        console.error("Error fetching wishlist IDs:", error);
        setWishlistError("Could not load wishlist status.");
        setWishlistIds(new Set()); 
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      setWishlistIds(new Set()); 
    }
  }, [isLoggedIn, user]); 

  
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]); 

  /**
   * Toggles the wishlist status for a given property ID.
   * @param {string} propertyId - The ID of the property to toggle.
   * @param {function} [callback] - Optional callback function for feedback (message, severity).
   */
  const toggleWishlist = useCallback(
    async (propertyId, callback) => {
      if (!isLoggedIn || !user?.email) {
        // Optionally provide feedback before redirecting
        if (callback) callback("Please log in to save properties", "warning");
        navigate("/login");
        return;
      }

      if (!propertyId) {
        console.error("toggleWishlist called without propertyId");
        if (callback)
          callback("Cannot update wishlist: Invalid property", "error");
        return;
      }

      const isInWishlist = wishlistIds.has(propertyId);
      const username = user.email;

  
      const originalWishlistIds = new Set(wishlistIds); 
      let updatedWishlistIds;
      if (isInWishlist) {
        updatedWishlistIds = new Set(wishlistIds);
        updatedWishlistIds.delete(propertyId);
      } else {
        updatedWishlistIds = new Set(wishlistIds);
        updatedWishlistIds.add(propertyId);
      }
      setWishlistIds(updatedWishlistIds); 

      try {
        if (isInWishlist) {
          console.log(`Removing ${propertyId} for ${username}`); // Debug log
          await axios.delete(`${API_BASE_URL}/users/${username}/wishlist`, {
            data: { propertyId }, 
          });
          console.log(`Removed ${propertyId} successfully`); // Debug log
          if (callback) callback("Removed from wishlist", "info");
        } else {
          // --- Add to Wishlist ---
          console.log(`Adding ${propertyId} for ${username}`); // Debug log
          await axios.post(`${API_BASE_URL}/users/${username}/wishlist`, {
            propertyId,
          });
          console.log(`Added ${propertyId} successfully`);
          if (callback) callback("Added to wishlist", "success");
        }
      } catch (error) {
        console.error(
          "Error updating wishlist via API:",
          error.response?.data || error.message
        );
        setWishlistIds(originalWishlistIds);
        if (callback)
          callback("Failed to update wishlist. Please try again.", "error");
      }
    },
    [isLoggedIn, user, navigate, wishlistIds]
  );

  const refreshWishlist = useCallback(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);
  return {
    wishlistIds,
    toggleWishlist,
    loadingWishlist,
    wishlistError,
    refreshWishlist,
  };
};

export default useWishlist;
