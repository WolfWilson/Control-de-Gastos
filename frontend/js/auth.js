/**
 * Authentication Manager - Simple PIN-based authentication
 */

const AUTH_KEY = 'expense_tracker_auth';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    /**
     * Load user from localStorage
     */
    loadUser() {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
            this.currentUser = JSON.parse(stored);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Register new user
     */
    register(nombre, pin) {
        // Validate PIN
        if (!this.validatePIN(pin)) {
            throw new Error('El PIN debe contener exactamente 4 dígitos');
        }

        // Validate nombre
        if (!nombre || nombre.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }

        // Check if user already exists
        if (this.currentUser) {
            throw new Error('Ya existe un usuario registrado. Debes cerrar sesión primero.');
        }

        // Create user
        const user = {
            nombre: nombre.trim(),
            pin: pin,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        this.currentUser = user;

        return user;
    }

    /**
     * Login user
     */
    login(pin) {
        if (!this.currentUser) {
            throw new Error('No hay un usuario registrado');
        }

        if (this.currentUser.pin !== pin) {
            throw new Error('PIN incorrecto');
        }

        return this.currentUser;
    }

    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        // Note: We don't remove from localStorage, just clear the current session
        // This allows the user to login again without re-registering
    }

    /**
     * Delete user account (for testing/reset)
     */
    deleteAccount() {
        localStorage.removeItem(AUTH_KEY);
        this.currentUser = null;
    }

    /**
     * Validate PIN format (4 digits)
     */
    validatePIN(pin) {
        return /^\d{4}$/.test(pin);
    }

    /**
     * Check if user needs to register
     */
    needsRegistration() {
        const stored = localStorage.getItem(AUTH_KEY);
        return !stored;
    }
}

// Create singleton instance
const auth = new AuthManager();

export default auth;
