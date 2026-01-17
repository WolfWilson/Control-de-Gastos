/**
 * IndexedDB Manager - Local database for offline functionality
 */

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create expenses store
                if (!db.objectStoreNames.contains('expenses')) {
                    const expenseStore = db.createObjectStore('expenses', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    expenseStore.createIndex('fecha', 'fecha', { unique: false });
                    expenseStore.createIndex('categoria_id', 'categoria_id', { unique: false });
                    expenseStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
                }

                // Create categories store
                if (!db.objectStoreNames.contains('categories')) {
                    const categoryStore = db.createObjectStore('categories', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    categoryStore.createIndex('nombre', 'nombre', { unique: true });

                    // Insert default categories
                    const defaultCategories = [
                        { nombre: 'Comida', icono: '🍔', color: '#10B981', activo: true },
                        { nombre: 'Transporte', icono: '🚗', color: '#3B82F6', activo: true },
                        { nombre: 'Servicios', icono: '💡', color: '#F59E0B', activo: true },
                        { nombre: 'Compras', icono: '🛍️', color: '#8B5CF6', activo: true },
                        { nombre: 'Entretenimiento', icono: '🎬', color: '#EC4899', activo: true },
                        { nombre: 'Salud', icono: '⚕️', color: '#EF4444', activo: true },
                        { nombre: 'Otros', icono: '📦', color: '#6B7280', activo: true }
                    ];

                    categoryStore.transaction.oncomplete = () => {
                        const transaction = db.transaction(['categories'], 'readwrite');
                        const store = transaction.objectStore('categories');
                        defaultCategories.forEach(cat => store.add(cat));
                    };
                }
            };
        });
    }

    /**
     * Get all expenses
     */
    async getAllExpenses() {
        const transaction = this.db.transaction(['expenses'], 'readonly');
        const store = transaction.objectStore('expenses');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get expenses by date range
     */
    async getExpensesByDateRange(startDate, endDate) {
        const allExpenses = await this.getAllExpenses();
        return allExpenses.filter(expense => {
            const expenseDate = new Date(expense.fecha);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }

    /**
     * Get expenses by month
     */
    async getExpensesByMonth(year, month) {
        const allExpenses = await this.getAllExpenses();
        return allExpenses.filter(expense => {
            const expenseDate = new Date(expense.fecha);
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
        });
    }

    /**
     * Get expenses by category
     */
    async getExpensesByCategory(categoryId) {
        const transaction = this.db.transaction(['expenses'], 'readonly');
        const store = transaction.objectStore('expenses');
        const index = store.index('categoria_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(categoryId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get recent expenses
     */
    async getRecentExpenses(limit = 10) {
        const allExpenses = await this.getAllExpenses();
        return allExpenses
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, limit);
    }

    /**
     * Create expense
     */
    async createExpense(expenseData) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');

        const expense = {
            ...expenseData,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: null
        };

        return new Promise((resolve, reject) => {
            const request = store.add(expense);
            request.onsuccess = () => {
                expense.id = request.result;
                resolve(expense);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update expense
     */
    async updateExpense(id, expenseData) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const expense = getRequest.result;
                if (!expense) {
                    reject(new Error('Expense not found'));
                    return;
                }

                const updatedExpense = {
                    ...expense,
                    ...expenseData,
                    id: id,
                    fecha_actualizacion: new Date().toISOString()
                };

                const updateRequest = store.put(updatedExpense);
                updateRequest.onsuccess = () => resolve(updatedExpense);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Delete expense
     */
    async deleteExpense(id) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');

        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all categories
     */
    async getAllCategories() {
        const transaction = this.db.transaction(['categories'], 'readonly');
        const store = transaction.objectStore('categories');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active categories
     */
    async getActiveCategories() {
        const allCategories = await this.getAllCategories();
        return allCategories.filter(cat => cat.activo);
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id) {
        const transaction = this.db.transaction(['categories'], 'readonly');
        const store = transaction.objectStore('categories');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get monthly summary
     */
    async getMonthlySummary(year, month) {
        const expenses = await this.getExpensesByMonth(year, month);
        const categories = await this.getAllCategories();

        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);
        const count = expenses.length;

        const porCategoria = {};
        expenses.forEach(expense => {
            const category = categories.find(c => c.id === expense.categoria_id);
            const categoryName = category ? category.nombre : 'Sin categoría';

            if (!porCategoria[categoryName]) {
                porCategoria[categoryName] = 0;
            }
            porCategoria[categoryName] += parseFloat(expense.monto);
        });

        return {
            year,
            month,
            total,
            count,
            porCategoria
        };
    }

    /**
     * Get weekly summary
     */
    async getWeeklySummary(startDate, endDate) {
        const expenses = await this.getExpensesByDateRange(startDate, endDate);
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);
        return { total, count: expenses.length, expenses };
    }

    /**
     * Get yearly summary
     */
    async getYearlySummary(year) {
        const allExpenses = await this.getAllExpenses();
        const expenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.fecha);
            return expenseDate.getFullYear() === year;
        });

        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

        // Group by month
        const byMonth = {};
        for (let i = 0; i < 12; i++) {
            byMonth[i + 1] = 0;
        }

        expenses.forEach(expense => {
            const month = new Date(expense.fecha).getMonth() + 1;
            byMonth[month] += parseFloat(expense.monto);
        });

        return {
            year,
            total,
            count: expenses.length,
            byMonth
        };
    }
}

// Create singleton instance
const db = new DatabaseManager();

export default db;
