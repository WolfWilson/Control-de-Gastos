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
 * Show error message to user (using toast notification)
 * @param {string} message - Error message
 */
export const showError = (message) => {
    // Import toast dynamically to avoid circular dependencies
    import('./toast.js').then(module => {
        module.default.error(message);
    });
};

/**
 * Show success message to user (using toast notification)
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
    // Import toast dynamically to avoid circular dependencies
    import('./toast.js').then(module => {
        module.default.success(message);
    });
};

/**
 * Show warning message to user (using toast notification)
 * @param {string} message - Warning message
 */
export const showWarning = (message) => {
    import('./toast.js').then(module => {
        module.default.warning(message);
    });
};

/**
 * Show info message to user (using toast notification)
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
    import('./toast.js').then(module => {
        module.default.info(message);
    });
};

/**
 * Confirm action with user (using elegant dialog)
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (optional)
 * @returns {Promise<boolean>} User confirmation
 */
export const confirm = async (message, title = '¿Estás seguro?') => {
    // Import confirm dialog dynamically
    const module = await import('./confirm-dialog.js');
    return module.default.show({ message, title, type: 'warning' });
};

/**
 * Confirm dangerous action (delete, etc.)
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (optional)
 * @returns {Promise<boolean>} User confirmation
 */
export const confirmDanger = async (message, title = '¡Cuidado!') => {
    const module = await import('./confirm-dialog.js');
    return module.default.danger(message, title);
};
