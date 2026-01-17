/**
 * Format number as currency (ARS)
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date string to locale date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

/**
 * Show error message to user
 * @param {string} message - Error message
 */
export const showError = (message) => {
    // Simple alert for MVP, can be replaced with toast notification
    alert(`Error: ${message}`);
};

/**
 * Show success message to user
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
    // Simple alert for MVP, can be replaced with toast notification
    alert(message);
};

/**
 * Confirm action with user
 * @param {string} message - Confirmation message
 * @returns {boolean} User confirmation
 */
export const confirm = (message) => {
    return window.confirm(message);
};
