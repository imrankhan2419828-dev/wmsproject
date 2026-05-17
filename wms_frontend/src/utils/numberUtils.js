/**
 * Number Utility Functions
 * NO CURRENCY SYMBOLS - Plain numbers only
 */

/**
 * Format number with thousand separators
 * @param {number|string} value - Number to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted number (e.g., 1,234.56)
 */
export const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return '';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

/**
 * Format number without decimals
 * @param {number|string} value - Number to format
 * @returns {string} Formatted number (e.g., 1,234)
 */
export const formatInteger = (value) => {
    return formatNumber(value, 0);
};

/**
 * Parse formatted number string to number
 * @param {string} value - Formatted number string
 * @returns {number} Parsed number
 */
export const parseNumber = (value) => {
    if (!value) return 0;

    // Remove all commas and other formatting
    const cleanValue = String(value).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanValue);

    return isNaN(num) ? 0 : num;
};

/**
 * Round number to specified decimals
 * @param {number} value - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded number
 */
export const roundNumber = (value, decimals = 2) => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {string} Percentage string (e.g., 25.50)
 */
export const calculatePercentage = (value, total, decimals = 2) => {
    if (!total || total === 0) return '0';
    const percentage = (value / total) * 100;
    return formatNumber(percentage, decimals);
};

/**
 * Sum array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Sum
 */
export const sumNumbers = (numbers) => {
    if (!Array.isArray(numbers)) return 0;
    return numbers.reduce((sum, num) => sum + (parseFloat(num) || 0), 0);
};

/**
 * Calculate average of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Average
 */
export const averageNumbers = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    return sumNumbers(numbers) / numbers.length;
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., 1.5 MB)
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate if string is a valid number
 * @param {string} value - String to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
    if (!value && value !== 0) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
};

/**
 * Format quantity (always integer)
 * @param {number|string} value - Quantity to format
 * @returns {string} Formatted quantity
 */
export const formatQuantity = (value) => {
    return formatInteger(value);
};

/**
 * Parse quantity string to integer
 * @param {string} value - Quantity string
 * @returns {number} Parsed quantity
 */
export const parseQuantity = (value) => {
    return Math.floor(parseNumber(value));
};

/**
 * Format rate/price (2 decimals)
 * @param {number|string} value - Rate to format
 * @returns {string} Formatted rate
 */
export const formatRate = (value) => {
    return formatNumber(value, 2);
};

/**
 * Format amount/total (2 decimals)
 * @param {number|string} value - Amount to format
 * @returns {string} Formatted amount
 */
export const formatAmount = (value) => {
    return formatNumber(value, 2);
};

export default {
    formatNumber,
    formatInteger,
    parseNumber,
    roundNumber,
    calculatePercentage,
    sumNumbers,
    averageNumbers,
    formatFileSize,
    isValidNumber,
    formatQuantity,
    parseQuantity,
    formatRate,
    formatAmount
};