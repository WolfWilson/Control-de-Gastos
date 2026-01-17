// API client for backend communication
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    /**
     * Create a new expense
     * @param {Object} expenseData - Expense data
     * @returns {Promise<Object>} Created expense
     */
    async createExpense(expenseData) {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create expense');
        }

        return response.json();
    },

    /**
     * Get expenses with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} List of expenses
     */
    async getExpenses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
            ? `${API_BASE_URL}/expenses?${queryString}`
            : `${API_BASE_URL}/expenses`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }

        return response.json();
    },

    /**
     * Get a specific expense by ID
     * @param {number} expenseId - Expense ID
     * @returns {Promise<Object>} Expense data
     */
    async getExpense(expenseId) {
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`);

        if (!response.ok) {
            throw new Error('Expense not found');
        }

        return response.json();
    },

    /**
     * Delete an expense
     * @param {number} expenseId - Expense ID
     * @returns {Promise<void>}
     */
    async deleteExpense(expenseId) {
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }
    },

    /**
     * Get monthly summary
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {Promise<Object>} Monthly summary
     */
    async getMonthlySummary(year = null, month = null) {
        let url = `${API_BASE_URL}/expenses/dashboard/monthly`;

        if (year && month) {
            url += `?year=${year}&month=${month}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch monthly summary');
        }

        return response.json();
    },

    /**
     * Get all categories
     * @param {boolean} activeOnly - Filter only active categories
     * @returns {Promise<Array>} List of categories
     */
    async getCategories(activeOnly = true) {
        const url = activeOnly
            ? `${API_BASE_URL}/categories?active_only=true`
            : `${API_BASE_URL}/categories`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        return response.json();
    },

    /**
     * Create a new category
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async createCategory(categoryData) {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create category');
        }

        return response.json();
    }
};
