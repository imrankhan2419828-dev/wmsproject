/**
 * Format number with commas and 2 decimal places
 * Example: 25000 -> "25,000.00"
 * Example: 100000 -> "100,000.00"
 * Example: 1250500.75 -> "1,250,500.75"
 */
export const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') {
        return '0.00';
    }

    // Convert to number
    let num = typeof value === 'string' ? parseFloat(value) : value;

    // Check if valid number
    if (isNaN(num)) {
        return '0.00';
    }

    // Format with commas and decimals
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

/**
 * Parse formatted number back to number
 * Example: "25,000.00" -> 25000
 */
export const parseFormattedNumber = (value) => {
    if (!value) return 0;

    // Remove commas and convert to number
    const num = parseFloat(value.toString().replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
};

/**
 * Format for input fields (without commas)
 * Example: 25000 -> "25000.00"
 */
export const formatForInput = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    let num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '';
    }

    return num.toFixed(decimals);
};