/**
 * IndexedDB Manager - Local database for offline functionality
 * Version 2.0 - Includes subscriptions management
 */

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 2;

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
                const oldVersion = event.oldVersion;

                // === EXPENSES STORE ===
                if (!db.objectStoreNames.contains('expenses')) {
                    const expenseStore = db.createObjectStore('expenses', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    expenseStore.createIndex('fecha', 'fecha', { unique: false });
                    expenseStore.createIndex('categoria_id', 'categoria_id', { unique: false });
                    expenseStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
                }

                // === EXPENSE CATEGORIES STORE ===
                if (!db.objectStoreNames.contains('expense_categories')) {
                    const categoryStore = db.createObjectStore('expense_categories', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    categoryStore.createIndex('nombre', 'nombre', { unique: true });

                    // Insert default expense categories IMMEDIATELY (not in oncomplete)
                    const defaultExpenseCategories = [
                        { nombre: 'Comida', icono: '🍔', color: '#10B981', activo: true, tipo: 'expense' },
                        { nombre: 'Transporte', icono: '🚗', color: '#3B82F6', activo: true, tipo: 'expense' },
                        { nombre: 'Servicios', icono: '💡', color: '#F59E0B', activo: true, tipo: 'expense' },
                        { nombre: 'Súper/Despensa', icono: '🛒', color: '#059669', activo: true, tipo: 'expense' },
                        { nombre: 'Shopping/Online', icono: '🛍️', color: '#8B5CF6', activo: true, tipo: 'expense' },
                        { nombre: 'Restaurantes/Salidas', icono: '🍽️', color: '#F59E0B', activo: true, tipo: 'expense' },
                        { nombre: 'Entretenimiento', icono: '🎬', color: '#EC4899', activo: true, tipo: 'expense' },
                        { nombre: 'Salud', icono: '⚕️', color: '#EF4444', activo: true, tipo: 'expense' },
                        { nombre: 'Otros', icono: '📦', color: '#6B7280', activo: true, tipo: 'expense' }
                    ];

                    // Insert immediately using the same transaction
                    defaultExpenseCategories.forEach(cat => categoryStore.add(cat));
                }

                // === SUBSCRIPTIONS STORE ===
                if (!db.objectStoreNames.contains('subscriptions')) {
                    const subscriptionStore = db.createObjectStore('subscriptions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    subscriptionStore.createIndex('activo', 'activo', { unique: false });
                    subscriptionStore.createIndex('categoria_id', 'categoria_id', { unique: false });
                    subscriptionStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
                }

                // === SUBSCRIPTION CATEGORIES STORE ===
                if (!db.objectStoreNames.contains('subscription_categories')) {
                    const subCategoryStore = db.createObjectStore('subscription_categories', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    subCategoryStore.createIndex('nombre', 'nombre', { unique: true });

                    // Insert default subscription categories IMMEDIATELY (not in oncomplete)
                    const defaultSubCategories = [
                        { nombre: 'IA & Productividad', icono: 'fa-robot', color: '#6366F1', activo: true, tipo: 'subscription' },
                        { nombre: 'Streaming Video', icono: 'fa-film', color: '#EF4444', activo: true, tipo: 'subscription' },
                        { nombre: 'Streaming Música', icono: 'fa-headphones', color: '#10B981', activo: true, tipo: 'subscription' },
                        { nombre: 'Infraestructura/Cloud', icono: 'fa-cloud', color: '#3B82F6', activo: true, tipo: 'subscription' },
                        { nombre: 'Bienestar & Salud', icono: 'fa-heart-pulse', color: '#EC4899', activo: true, tipo: 'subscription' },
                        { nombre: 'Educación & Conocimiento', icono: 'fa-graduation-cap', color: '#F59E0B', activo: true, tipo: 'subscription' }
                    ];

                    // Insert immediately using the same transaction
                    defaultSubCategories.forEach(cat => subCategoryStore.add(cat));
                }

                // === SUBSCRIPTION PRICE HISTORY STORE ===
                if (!db.objectStoreNames.contains('subscription_price_history')) {
                    const historyStore = db.createObjectStore('subscription_price_history', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    historyStore.createIndex('subscription_id', 'subscription_id', { unique: false });
                    historyStore.createIndex('fecha_cambio', 'fecha_cambio', { unique: false });
                }

                // Migration from v1 to v2
                if (oldVersion < 2 && oldVersion > 0) {
                    // Migrate old 'categories' to 'expense_categories' if exists
                    if (db.objectStoreNames.contains('categories')) {
                        console.log('🔄 Migrating categories from v1 to v2...');

                        const oldCategoriesStore = event.target.transaction.objectStore('categories');
                        const newCategoriesStore = event.target.transaction.objectStore('expense_categories');

                        // Copy all old categories to new store
                        const getAllRequest = oldCategoriesStore.getAll();
                        getAllRequest.onsuccess = () => {
                            const oldCategories = getAllRequest.result;
                            oldCategories.forEach(cat => {
                                // Add tipo field for compatibility
                                newCategoriesStore.add({
                                    ...cat,
                                    tipo: 'expense'
                                });
                            });
                            console.log('✅ Migration complete. Old categories preserved.');
                        };
                    }
                }
            };
        });
    }

    // ========================================
    // EXPENSES METHODS
    // ========================================

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

    // ========================================
    // SUBSCRIPTIONS METHODS
    // ========================================

    /**
     * Get all subscriptions
     */
    async getAllSubscriptions() {
        const transaction = this.db.transaction(['subscriptions'], 'readonly');
        const store = transaction.objectStore('subscriptions');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active subscriptions
     */
    async getActiveSubscriptions() {
        const allSubscriptions = await this.getAllSubscriptions();
        return allSubscriptions.filter(sub => sub.activo);
    }

    /**
     * Get subscription by ID
     */
    async getSubscriptionById(id) {
        const transaction = this.db.transaction(['subscriptions'], 'readonly');
        const store = transaction.objectStore('subscriptions');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Create subscription
     */
    async createSubscription(subscriptionData) {
        const transaction = this.db.transaction(['subscriptions'], 'readwrite');
        const store = transaction.objectStore('subscriptions');

        const subscription = {
            ...subscriptionData,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: null
        };

        return new Promise((resolve, reject) => {
            const request = store.add(subscription);
            request.onsuccess = () => {
                subscription.id = request.result;
                resolve(subscription);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update subscription (with price history tracking)
     */
    async updateSubscription(id, subscriptionData) {
        const transaction = this.db.transaction(['subscriptions', 'subscription_price_history'], 'readwrite');
        const store = transaction.objectStore('subscriptions');
        const historyStore = transaction.objectStore('subscription_price_history');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);

            getRequest.onsuccess = async () => {
                const subscription = getRequest.result;
                if (!subscription) {
                    reject(new Error('Subscription not found'));
                    return;
                }

                // Check if monto changed - save to history
                if (subscriptionData.monto && subscriptionData.monto !== subscription.monto) {
                    const historyEntry = {
                        subscription_id: id,
                        monto_anterior: subscription.monto,
                        monto_nuevo: subscriptionData.monto,
                        fecha_cambio: new Date().toISOString()
                    };
                    historyStore.add(historyEntry);
                }

                const updatedSubscription = {
                    ...subscription,
                    ...subscriptionData,
                    id: id,
                    fecha_actualizacion: new Date().toISOString()
                };

                const updateRequest = store.put(updatedSubscription);
                updateRequest.onsuccess = () => resolve(updatedSubscription);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Delete subscription (and its price history)
     */
    async deleteSubscription(id) {
        const transaction = this.db.transaction(['subscriptions', 'subscription_price_history'], 'readwrite');
        const subStore = transaction.objectStore('subscriptions');
        const historyStore = transaction.objectStore('subscription_price_history');
        const historyIndex = historyStore.index('subscription_id');

        return new Promise((resolve, reject) => {
            // Delete subscription
            const deleteSubRequest = subStore.delete(id);

            deleteSubRequest.onsuccess = () => {
                // Delete all price history entries for this subscription
                const historyRequest = historyIndex.getAllKeys(id);
                historyRequest.onsuccess = () => {
                    const historyKeys = historyRequest.result;
                    historyKeys.forEach(key => historyStore.delete(key));
                    resolve(true);
                };
                historyRequest.onerror = () => reject(historyRequest.error);
            };

            deleteSubRequest.onerror = () => reject(deleteSubRequest.error);
        });
    }

    /**
     * Toggle subscription active status
     */
    async toggleSubscriptionActive(id) {
        const subscription = await this.getSubscriptionById(id);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        return this.updateSubscription(id, {
            activo: !subscription.activo
        });
    }

    /**
     * Get price history for a subscription
     */
    async getSubscriptionPriceHistory(subscriptionId) {
        const transaction = this.db.transaction(['subscription_price_history'], 'readonly');
        const store = transaction.objectStore('subscription_price_history');
        const index = store.index('subscription_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(subscriptionId);
            request.onsuccess = () => {
                const history = request.result;
                // Sort by date descending
                history.sort((a, b) => new Date(b.fecha_cambio) - new Date(a.fecha_cambio));
                resolve(history);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // CATEGORIES METHODS
    // ========================================

    /**
     * Get all expense categories
     */
    async getExpenseCategories() {
        const transaction = this.db.transaction(['expense_categories'], 'readonly');
        const store = transaction.objectStore('expense_categories');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active expense categories
     */
    async getActiveExpenseCategories() {
        const allCategories = await this.getExpenseCategories();
        return allCategories.filter(cat => cat.activo);
    }

    /**
     * Get all subscription categories
     */
    async getSubscriptionCategories() {
        const transaction = this.db.transaction(['subscription_categories'], 'readonly');
        const store = transaction.objectStore('subscription_categories');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active subscription categories
     */
    async getActiveSubscriptionCategories() {
        const allCategories = await this.getSubscriptionCategories();
        return allCategories.filter(cat => cat.activo);
    }

    /**
     * Get expense category by ID
     */
    async getExpenseCategoryById(id) {
        const transaction = this.db.transaction(['expense_categories'], 'readonly');
        const store = transaction.objectStore('expense_categories');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get subscription category by ID
     */
    async getSubscriptionCategoryById(id) {
        const transaction = this.db.transaction(['subscription_categories'], 'readonly');
        const store = transaction.objectStore('subscription_categories');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * LEGACY: Get all categories (for backward compatibility)
     * Returns expense categories by default
     */
    async getAllCategories() {
        return this.getExpenseCategories();
    }

    /**
     * LEGACY: Get active categories (for backward compatibility)
     */
    async getActiveCategories() {
        return this.getActiveExpenseCategories();
    }

    /**
     * LEGACY: Get category by ID (for backward compatibility)
     */
    async getCategoryById(id) {
        return this.getExpenseCategoryById(id);
    }

    // ========================================
    // SUMMARY METHODS (includes subscriptions)
    // ========================================

    /**
     * Check if subscription should be counted for a specific month
     * @param {Object} subscription - Subscription object
     * @param {number} year - Year to check
     * @param {number} month - Month to check (1-12)
     * @returns {boolean} True if subscription should be counted
     */
    _shouldCountSubscriptionForMonth(subscription, year, month) {
        if (!subscription.activo) return false;
        if (!subscription.fecha_inicio) return true; // If no start date, count it

        const startDate = new Date(subscription.fecha_inicio + 'T00:00:00');
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;

        // Check if subscription has started
        if (year < startYear || (year === startYear && month < startMonth)) {
            return false;
        }

        if (subscription.periodicidad === 'anual') {
            // Annual: only count in the same month as start date
            return month === startMonth;
        } else {
            // Monthly: count every month since start date
            return true;
        }
    }

    /**
     * Calculate subscription cost for a specific month
     * @param {Object} subscription - Subscription object
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {number} Cost for that month
     */
    _getSubscriptionCostForMonth(subscription, year, month) {
        if (!this._shouldCountSubscriptionForMonth(subscription, year, month)) {
            return 0;
        }
        return parseFloat(subscription.monto);
    }

    /**
     * Calculate subscription cost for a year (only actual payments, no projections)
     * @param {Object} subscription - Subscription object
     * @param {number} year - Year
     * @returns {number} Total cost for that year UP TO CURRENT MONTH
     */
    _getSubscriptionCostForYear(subscription, year) {
        if (!subscription.activo) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        if (!subscription.fecha_inicio) {
            // No start date: count only up to current month if current year
            if (year > currentYear) return 0; // Future years: 0

            if (subscription.periodicidad === 'anual') {
                return parseFloat(subscription.monto);
            } else {
                // Monthly: only up to current month
                const monthsToCount = year === currentYear ? currentMonth : 12;
                return parseFloat(subscription.monto) * monthsToCount;
            }
        }

        const startDate = new Date(subscription.fecha_inicio + 'T00:00:00');
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;

        // If subscription hasn't started this year, return 0
        if (year < startYear) return 0;

        // Future years: 0 (no projections)
        if (year > currentYear) return 0;

        if (subscription.periodicidad === 'anual') {
            // Annual: count once per year (only if payment month has passed)
            if (year === currentYear && currentMonth < startMonth) {
                return 0; // Annual payment hasn't happened yet this year
            }
            return parseFloat(subscription.monto);
        } else {
            // Monthly: count only REAL payments (up to current month)
            let monthsToCount = 0;

            if (year === startYear && year === currentYear) {
                // Started this year and we're in the same year: from start to current
                monthsToCount = Math.max(0, currentMonth - startMonth + 1);
            } else if (year === startYear) {
                // Started this year, but we're in a future year: from start to December
                monthsToCount = 13 - startMonth;
            } else if (year === currentYear) {
                // Started in a previous year, we're in current year: from Jan to current
                monthsToCount = currentMonth;
            } else {
                // Year between start and current: full 12 months
                monthsToCount = 12;
            }

            return parseFloat(subscription.monto) * monthsToCount;
        }
    }

    /**
     * Get monthly summary (expenses + active subscriptions)
     */
    async getMonthlySummary(year, month) {
        const expenses = await this.getExpensesByMonth(year, month);
        const expenseCategories = await this.getExpenseCategories();
        const activeSubscriptions = await this.getActiveSubscriptions();
        const subscriptionCategories = await this.getSubscriptionCategories();

        // Calculate expenses total
        const expensesTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

        // Calculate subscriptions total (only if they should be counted this month)
        const subscriptionsTotal = activeSubscriptions.reduce((sum, sub) => {
            return sum + this._getSubscriptionCostForMonth(sub, year, month);
        }, 0);

        const total = expensesTotal + subscriptionsTotal;
        const count = expenses.length;

        // Group expenses by category
        const porCategoria = {};
        expenses.forEach(expense => {
            const category = expenseCategories.find(c => c.id === expense.categoria_id);
            const categoryName = category ? category.nombre : 'Sin categoría';

            if (!porCategoria[categoryName]) {
                porCategoria[categoryName] = 0;
            }
            porCategoria[categoryName] += parseFloat(expense.monto);
        });

        // Add subscriptions to categories (only if they should be counted this month)
        activeSubscriptions.forEach(sub => {
            const cost = this._getSubscriptionCostForMonth(sub, year, month);
            if (cost > 0) {
                const category = subscriptionCategories.find(c => c.id === sub.categoria_id);
                const categoryName = category ? category.nombre : 'Suscripciones';

                if (!porCategoria[categoryName]) {
                    porCategoria[categoryName] = 0;
                }
                porCategoria[categoryName] += cost;
            }
        });

        return {
            year,
            month,
            total,
            expensesTotal,
            subscriptionsTotal,
            count,
            porCategoria
        };
    }

    /**
     * Get weekly summary (only expenses, subscriptions don't make sense weekly)
     */
    async getWeeklySummary(startDate, endDate) {
        const expenses = await this.getExpensesByDateRange(startDate, endDate);
        const expensesTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

        return {
            total: expensesTotal,
            expensesTotal,
            subscriptionsTotal: 0,
            count: expenses.length,
            expenses
        };
    }

    /**
     * Get yearly summary (expenses + active subscriptions)
     */
    async getYearlySummary(year) {
        const allExpenses = await this.getAllExpenses();
        const expenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.fecha);
            return expenseDate.getFullYear() === year;
        });
        const activeSubscriptions = await this.getActiveSubscriptions();

        const expensesTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

        // Calculate yearly cost of subscriptions (actual payments in this year)
        const subscriptionsTotal = activeSubscriptions.reduce((sum, sub) => {
            return sum + this._getSubscriptionCostForYear(sub, year);
        }, 0);

        const total = expensesTotal + subscriptionsTotal;

        // Group by month (expenses + subscriptions for each month)
        const byMonth = {};
        for (let i = 1; i <= 12; i++) {
            // Initialize with subscriptions cost for this month
            const monthlySubCost = activeSubscriptions.reduce((sum, sub) => {
                return sum + this._getSubscriptionCostForMonth(sub, year, i);
            }, 0);
            byMonth[i] = monthlySubCost;
        }

        // Add expenses to each month
        expenses.forEach(expense => {
            const month = new Date(expense.fecha).getMonth() + 1;
            byMonth[month] += parseFloat(expense.monto);
        });

        return {
            year,
            total,
            expensesTotal,
            subscriptionsTotal,
            count: expenses.length,
            byMonth
        };
    }

    /**
     * Get subscriptions summary (active subscriptions total)
     */
    async getSubscriptionsSummary() {
        const activeSubscriptions = await this.getActiveSubscriptions();
        const subscriptionCategories = await this.getSubscriptionCategories();

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        // Monthly total: subscriptions that apply this month
        const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
            return sum + this._getSubscriptionCostForMonth(sub, currentYear, currentMonth);
        }, 0);

        // Yearly total: actual cost for current year
        const yearlyTotal = activeSubscriptions.reduce((sum, sub) => {
            return sum + this._getSubscriptionCostForYear(sub, currentYear);
        }, 0);

        // Group by category (using current month cost)
        const porCategoria = {};
        activeSubscriptions.forEach(sub => {
            const cost = this._getSubscriptionCostForMonth(sub, currentYear, currentMonth);
            if (cost > 0) {
                const category = subscriptionCategories.find(c => c.id === sub.categoria_id);
                const categoryName = category ? category.nombre : 'Sin categoría';

                if (!porCategoria[categoryName]) {
                    porCategoria[categoryName] = 0;
                }
                porCategoria[categoryName] += cost;
            }
        });

        return {
            monthlyTotal,
            yearlyTotal,
            count: activeSubscriptions.length,
            porCategoria
        };
    }

    /**
     * Get subscriptions yearly evolution (month by month)
     */
    async getSubscriptionsYearlyEvolution(year) {
        const activeSubscriptions = await this.getActiveSubscriptions();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        const byMonth = {};

        // Only calculate up to current month if it's current year
        const maxMonth = (year === currentYear) ? currentMonth : 12;

        for (let i = 1; i <= maxMonth; i++) {
            byMonth[i] = activeSubscriptions.reduce((sum, sub) => {
                return sum + this._getSubscriptionCostForMonth(sub, year, i);
            }, 0);
        }

        return {
            year,
            byMonth,
            maxMonth
        };
    }

    /**
     * Get comparison of expenses vs subscriptions for current year
     */
    async getExpensesVsSubscriptionsComparison(year) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        const maxMonth = (year === currentYear) ? currentMonth : 12;

        const comparison = {
            byMonth: {}
        };

        for (let i = 1; i <= maxMonth; i++) {
            const expenses = await this.getExpensesByMonth(year, i);
            const expensesTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

            const activeSubscriptions = await this.getActiveSubscriptions();
            const subscriptionsTotal = activeSubscriptions.reduce((sum, sub) => {
                return sum + this._getSubscriptionCostForMonth(sub, year, i);
            }, 0);

            comparison.byMonth[i] = {
                expenses: expensesTotal,
                subscriptions: subscriptionsTotal,
                total: expensesTotal + subscriptionsTotal
            };
        }

        return comparison;
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Clear all data from database (for import/restore)
     */
    async clearAllData() {
        const storeNames = [
            'expenses',
            'expense_categories',
            'subscriptions',
            'subscription_categories',
            'subscription_price_history'
        ];

        const transaction = this.db.transaction(storeNames, 'readwrite');

        storeNames.forEach(storeName => {
            if (this.db.objectStoreNames.contains(storeName)) {
                const store = transaction.objectStore(storeName);
                store.clear();
            }
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Create singleton instance
const db = new DatabaseManager();

export default db;
