import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5001/api"; // Use environment variable

/**
 * Custom Hook to manage user's wishlist state and actions.
 */
const useWishlist = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]); // Stores IDs of wishlisted properties
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Fetch wishlist on auth state change
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isLoggedIn && user?.email) {
        setLoadingWishlist(true);
        setWishlistError(null);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/users/${user.email}/wishlist`
          );
          setWishlist(response.data.wishlist.map((item) => item._id || item));
        } catch (error) {
          console.error("Error fetching wishlist:", error);
          setWishlistError("Could not load wishlist.");
          setWishlist([]); // Clear wishlist on error
        } finally {
          setLoadingWishlist(false);
        }
      } else {
        setWishlist([]); // Clear wishlist if user logs out or is not available
      }
    };
    fetchWishlist();
  }, [isLoggedIn, user]);

  // Function to toggle wishlist status for a property
  const toggleWishlist = useCallback(
    async (propertyId, callback) => {
      if (!isLoggedIn || !user?.email) {
        navigate("/login"); // Redirect if not logged in
        return;
      }

      const isInWishlist = wishlist.includes(propertyId);
      const username = user.email;
      let updatedWishlist;

      try {
        if (isInWishlist) {
          // Remove
          await axios.delete(`${API_BASE_URL}/users/${username}/wishlist`, {
            data: { propertyId },
          });
          updatedWishlist = wishlist.filter((id) => id !== propertyId);
          if (callback) callback("Removed from wishlist", "info");
        } else {
          // Add
          await axios.post(`${API_BASE_URL}/users/${username}/wishlist`, {
            propertyId,
          });
          updatedWishlist = [...wishlist, propertyId];
          if (callback) callback("Added to wishlist", "success");
        }
        setWishlist(updatedWishlist);
      } catch (error) {
        console.error("Error updating wishlist:", error);
        if (callback) callback("Failed to update wishlist", "error");
      }
    },
    [isLoggedIn, user, navigate, wishlist]
  ); // Include wishlist in dependencies

  return { wishlist, toggleWishlist, loadingWishlist, wishlistError };
};

export default useWishlist;
