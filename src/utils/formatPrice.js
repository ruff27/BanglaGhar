// src/utils/formatPrice.js

/**
 * Formats a number as a price string (e.g., ৳1,200,000).
 * Adapts based on locale (currently uses BDT formatting).
 *
 * @param {number} price The numerical price value.
 * @param {string} currency The currency code (default: 'BDT').
 * @param {string} locale The locale string (default: 'en-BD' or 'en-IN' which often have similar grouping).
 * @returns {string} The formatted price string or an empty string if price is invalid.
 */
export const formatPrice = (price, currency = "BDT", locale = "en-IN") => {
  // Handle null, undefined, or non-numeric input gracefully
  if (price == null || typeof price !== "number" || isNaN(price)) {
    // Return 'N/A', an empty string, or '৳0' based on preference
    return "N/A";
  }

  try {
    // Use Intl.NumberFormat for locale-aware formatting
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0, // Adjust if you need decimal places
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.error("Error formatting price:", error);
    // Fallback formatting if Intl fails
    return `${currency} ${price.toLocaleString(locale)}`; // Simple fallback
  }
};

// Example usage:
// formatPrice(1200000) === "৳12,00,000" (depending on exact locale support)
// formatPrice(50000) === "৳50,000"
