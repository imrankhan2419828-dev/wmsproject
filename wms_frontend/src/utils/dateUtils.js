/**
 * Date Utility Functions
 * Format: 18-Apr-2026 (DD-MMM-YYYY)
 */

// Month names array
const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format date to DD-MMM-YYYY (18-Apr-2026)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

/**
 * Format date to display in input field (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string
 * @returns {Date|null} Date object
 */
export const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Get today's date formatted
 * @returns {string} Today's date in DD-MMM-YYYY format
 */
export const getTodayFormatted = () => {
    return formatDate(new Date());
};

/**
 * Get today's date for input
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayForInput = () => {
    return formatDateForInput(new Date());
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

/**
 * Subtract days from a date
 * @param {Date|string} date - Base date
 * @param {number} days - Days to subtract
 * @returns {Date} New date
 */
export const subtractDays = (date, days) => {
    return addDays(date, -days);
};

/**
 * Add months to a date
 * @param {Date|string} date - Base date
 * @param {number} months - Months to add
 * @returns {Date} New date
 */
export const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d > today;
};

/**
 * Get date range for filters (default: last 30 days)
 * @returns {Object} { startDate, endDate }
 */
export const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = subtractDays(endDate, 30);
    return {
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate)
    };
};

/**
 * Compare two dates (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
};

/**
 * Format date range for display
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) return `From ${formatDate(startDate)}`;
    if (!startDate && endDate) return `Until ${formatDate(endDate)}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export default {
    formatDate,
    formatDateForInput,
    parseDate,
    getTodayFormatted,
    getTodayForInput,
    addDays,
    subtractDays,
    addMonths,
    isToday,
    isPast,
    isFuture,
    getDefaultDateRange,
    compareDates,
    formatDateRange
};