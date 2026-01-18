/**
 * Price Formatting Utilities
 * Functions for formatting currency and prices
 */

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "₹1,299")
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return "₹0";
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

/**
 * Format price with decimals
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "₹1,299.00")
 */
export const formatPriceWithDecimals = (price) => {
  if (price === null || price === undefined) return "₹0.00";
  return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format number with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1.5K", "2M")
 */
export const formatNumberShort = (num) => {
  if (num === null || num === undefined) return "0";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate discount percentage
 * @param {number} original - Original price
 * @param {number} discounted - Discounted price
 * @returns {string} Discount percentage (e.g., "20%")
 */
export const calculateDiscount = (original, discounted) => {
  if (!original || !discounted) return "0%";
  const discount = ((original - discounted) / original) * 100;
  return `${Math.round(discount)}%`;
};
