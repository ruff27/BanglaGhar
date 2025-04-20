import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api"; // Use environment variable

/**
 * Custom Hook to manage user's wishlist state and actions.
 * Returns wishlist IDs and functions to interact with it.
 */
const useWishlist = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  // Stores only the IDs of wishlisted properties for quick checking
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Function to fetch wishlist IDs
  const fetchWishlistIds = useCallback(async () => {
    if (isLoggedIn && user?.email) {
      setLoadingWishlist(true);
      setWishlistError(null);
      try {
        console.log(`Fetching wishlist for ${user.email}`); // Debug log
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.email}/wishlist`
        );
        // Expect response.data.wishlist to be an array of objects or strings
        if (response.data && Array.isArray(response.data.wishlist)) {
          // Extract only the IDs into a Set for efficient lookup
          const ids = response.data.wishlist.map((item) => item?._id || item); // Handle object or string IDs
          setWishlistIds(new Set(ids));
          console.log("Fetched wishlist IDs:", ids); // Debug log
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
        setWishlistIds(new Set()); // Clear wishlist on error
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      setWishlistIds(new Set()); // Clear wishlist if user logs out
    }
  }, [isLoggedIn, user]); // Dependencies

  // Fetch wishlist on initial load or auth change
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]); // Depend on the memoized fetch function

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

      // Optimistic UI update
      const originalWishlistIds = new Set(wishlistIds); // Keep backup
      let updatedWishlistIds;
      if (isInWishlist) {
        updatedWishlistIds = new Set(wishlistIds);
        updatedWishlistIds.delete(propertyId);
      } else {
        updatedWishlistIds = new Set(wishlistIds);
        updatedWishlistIds.add(propertyId);
      }
      setWishlistIds(updatedWishlistIds); // Update UI immediately

      try {
        if (isInWishlist) {
          // --- Remove from Wishlist ---
          console.log(`Removing ${propertyId} for ${username}`); // Debug log
          await axios.delete(`${API_BASE_URL}/users/${username}/wishlist`, {
            data: { propertyId }, // Send propertyId in request body
          });
          console.log(`Removed ${propertyId} successfully`); // Debug log
          if (callback) callback("Removed from wishlist", "info");
        } else {
          // --- Add to Wishlist ---
          console.log(`Adding ${propertyId} for ${username}`); // Debug log
          await axios.post(`${API_BASE_URL}/users/${username}/wishlist`, {
            propertyId, // Send propertyId in request body
          });
          console.log(`Added ${propertyId} successfully`); // Debug log
          if (callback) callback("Added to wishlist", "success");
        }
        // No need to set state again if API call was successful
      } catch (error) {
        console.error(
          "Error updating wishlist via API:",
          error.response?.data || error.message
        );
        // *** Revert optimistic update on error ***
        setWishlistIds(originalWishlistIds);
        if (callback)
          callback("Failed to update wishlist. Please try again.", "error");
      }
    },
    [isLoggedIn, user, navigate, wishlistIds] // Include wishlistIds
  );

  // Function to explicitly refetch wishlist IDs (can be used after login/logout or manual refresh)
  const refreshWishlist = useCallback(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  // Return the Set of IDs and the toggle function
  return {
    wishlistIds,
    toggleWishlist,
    loadingWishlist,
    wishlistError,
    refreshWishlist,
  };
};

export default useWishlist;
