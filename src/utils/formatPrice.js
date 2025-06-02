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
  if (price == null || typeof price !== "number" || isNaN(price)) {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.error("Error formatting price:", error);
    return `${currency} ${price.toLocaleString(locale)}`; 
  }
};
