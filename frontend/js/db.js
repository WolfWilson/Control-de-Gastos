/**
 * IndexedDB Manager - Local database for offline functionality
 * Version 4.0 - Includes subscriptions, installments and savings management
 */

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 4;

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

                // === INSTALLMENTS STORE ===
                if (!db.objectStoreNames.contains('installments')) {
                    const installmentStore = db.createObjectStore('installments', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    installmentStore.createIndex('activo', 'activo', { unique: false });
                    installmentStore.createIndex('categoria_id', 'categoria_id', { unique: false });
                    installmentStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
                }

                // === INSTALLMENT CATEGORIES STORE ===
                if (!db.objectStoreNames.contains('installment_categories')) {
                    const installmentCategoryStore = db.createObjectStore('installment_categories', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    installmentCategoryStore.createIndex('nombre', 'nombre', { unique: true });

                    // Insert default installment categories IMMEDIATELY
                    const defaultInstallmentCategories = [
                        { nombre: 'Electrónica', icono: 'fa-laptop', color: '#6366F1', activo: true, tipo: 'installment' },
                        { nombre: 'Electrodomésticos', icono: 'fa-kitchen-set', color: '#10B981', activo: true, tipo: 'installment' },
                        { nombre: 'Muebles', icono: 'fa-couch', color: '#F59E0B', activo: true, tipo: 'installment' },
                        { nombre: 'Vehículos', icono: 'fa-car', color: '#3B82F6', activo: true, tipo: 'installment' },
                        { nombre: 'Educación', icono: 'fa-graduation-cap', color: '#8B5CF6', activo: true, tipo: 'installment' },
                        { nombre: 'Viajes', icono: 'fa-plane', color: '#EC4899', activo: true, tipo: 'installment' },
                        { nombre: 'Otros', icono: 'fa-box', color: '#6B7280', activo: true, tipo: 'installment' }
                    ];

                    // Insert immediately using the same transaction
                    defaultInstallmentCategories.forEach(cat => installmentCategoryStore.add(cat));
                }

                // === INSTALLMENT PAYMENTS STORE ===
                if (!db.objectStoreNames.contains('installment_payments')) {
                    const paymentsStore = db.createObjectStore('installment_payments', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    paymentsStore.createIndex('installment_id', 'installment_id', { unique: false });
                    paymentsStore.createIndex('numero_cuota', 'numero_cuota', { unique: false });
                    paymentsStore.createIndex('pagado', 'pagado', { unique: false });
                }

                // === SAVINGS STORE ===
                if (!db.objectStoreNames.contains('savings')) {
                    const savingsStore = db.createObjectStore('savings', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    savingsStore.createIndex('tipo', 'tipo', { unique: false });
                    savingsStore.createIndex('activo', 'activo', { unique: false });
                    savingsStore.createIndex('fecha_actualizacion', 'fecha_actualizacion', { unique: false });
                }

                // === SAVING MOVEMENTS STORE ===
                if (!db.objectStoreNames.contains('saving_movements')) {
                    const movementsStore = db.createObjectStore('saving_movements', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    movementsStore.createIndex('saving_id', 'saving_id', { unique: false });
                    movementsStore.createIndex('tipo_movimiento', 'tipo_movimiento', { unique: false });
                    movementsStore.createIndex('fecha', 'fecha', { unique: false });
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
     * Create subscription (with initial price history)
     */
    async createSubscription(subscriptionData) {
        const transaction = this.db.transaction(['subscriptions', 'subscription_price_history'], 'readwrite');
        const store = transaction.objectStore('subscriptions');
        const historyStore = transaction.objectStore('subscription_price_history');

        const subscription = {
            ...subscriptionData,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: null
        };

        return new Promise((resolve, reject) => {
            const request = store.add(subscription);
            request.onsuccess = () => {
                subscription.id = request.result;
                
                // Create initial price history entry
                const historyEntry = {
                    subscription_id: subscription.id,
                    monto: subscription.monto,
                    fecha_inicio: subscription.fecha_inicio || new Date().toISOString().split('T')[0],
                    fecha_fin: null, // null = vigente
                    fecha_cambio: new Date().toISOString()
                };
                historyStore.add(historyEntry);
                
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

                // Check if monto changed - update history
                if (subscriptionData.monto && subscriptionData.monto !== subscription.monto) {
                    // Close current price period (set fecha_fin)
                    const index = historyStore.index('subscription_id');
                    const historyRequest = index.getAll(id);
                    
                    historyRequest.onsuccess = () => {
                        const history = historyRequest.result;
                        
                        // Find current active price (fecha_fin = null)
                        const currentPrice = history.find(h => h.fecha_fin === null);
                        
                        if (currentPrice) {
                            // Close current period (yesterday)
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            currentPrice.fecha_fin = yesterday.toISOString().split('T')[0];
                            historyStore.put(currentPrice);
                        }
                        
                        // Create new price entry starting today
                        const newHistoryEntry = {
                            subscription_id: id,
                            monto: subscriptionData.monto,
                            fecha_inicio: new Date().toISOString().split('T')[0],
                            fecha_fin: null, // null = vigente
                            fecha_cambio: new Date().toISOString()
                        };
                        historyStore.add(newHistoryEntry);
                    };
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
     * @param {number} subscriptionId - Subscription ID
     * @returns {Promise<Array>} Array of price history entries
     */
    async getSubscriptionPriceHistory(subscriptionId) {
        const transaction = this.db.transaction(['subscription_price_history'], 'readonly');
        const store = transaction.objectStore('subscription_price_history');
        const index = store.index('subscription_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(subscriptionId);
            request.onsuccess = () => {
                // Sort by fecha_inicio descending (most recent first)
                const history = request.result.sort((a, b) => {
                    return b.fecha_inicio.localeCompare(a.fecha_inicio);
                });
                resolve(history);
            };
            request.onerror = () => reject(request.error);
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
     * Get subscription price for a specific date from history
     * @param {number} subscriptionId - Subscription ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<number>} Price at that date
     */
    async _getSubscriptionPriceForDate(subscriptionId, date) {
        const transaction = this.db.transaction(['subscription_price_history'], 'readonly');
        const store = transaction.objectStore('subscription_price_history');
        const index = store.index('subscription_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(subscriptionId);
            
            request.onsuccess = () => {
                const history = request.result;
                
                if (history.length === 0) {
                    // No history, fallback to current monto from subscription
                    const subTransaction = this.db.transaction(['subscriptions'], 'readonly');
                    const subStore = subTransaction.objectStore('subscriptions');
                    const subRequest = subStore.get(subscriptionId);
                    
                    subRequest.onsuccess = () => {
                        resolve(parseFloat(subRequest.result?.monto || 0));
                    };
                    subRequest.onerror = () => resolve(0);
                    return;
                }
                
                // Find price valid for this date
                const validPrice = history.find(h => {
                    const inicio = h.fecha_inicio;
                    const fin = h.fecha_fin;
                    
                    if (date < inicio) return false;
                    if (fin === null) return true; // Current price
                    return date <= fin;
                });
                
                resolve(parseFloat(validPrice?.monto || 0));
            };
            
            request.onerror = () => resolve(0);
        });
    }

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
     * Calculate subscription cost for a specific month (using price history)
     * @param {Object} subscription - Subscription object
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {Promise<number>} Cost for that month
     */
    async _getSubscriptionCostForMonth(subscription, year, month) {
        if (!this._shouldCountSubscriptionForMonth(subscription, year, month)) {
            return 0;
        }
        
        // Get price for mid-month (day 15)
        const targetDate = `${year}-${String(month).padStart(2, '0')}-15`;
        const price = await this._getSubscriptionPriceForDate(subscription.id, targetDate);
        return price;
    }

    /**
     * Calculate subscription cost for a year (only actual payments, no projections) - WITH HISTORY
     * @param {Object} subscription - Subscription object
     * @param {number} year - Year
     * @returns {Promise<number>} Total cost for that year UP TO CURRENT MONTH
     */
    async _getSubscriptionCostForYear(subscription, year) {
        if (!subscription.activo) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        // Future years: 0 (no projections)
        if (year > currentYear) return 0;

        if (!subscription.fecha_inicio) {
            // No start date: count only up to current month if current year
            if (subscription.periodicidad === 'anual') {
                // Get price for mid-year
                return await this._getSubscriptionPriceForDate(subscription.id, `${year}-06-15`);
            } else {
                // Monthly: sum each month with historical prices
                const monthsToCount = year === currentYear ? currentMonth : 12;
                let total = 0;
                for (let m = 1; m <= monthsToCount; m++) {
                    total += await this._getSubscriptionCostForMonth(subscription, year, m);
                }
                return total;
            }
        }

        const startDate = new Date(subscription.fecha_inicio + 'T00:00:00');
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;

        // If subscription hasn't started this year, return 0
        if (year < startYear) return 0;

        if (subscription.periodicidad === 'anual') {
            // Annual: count once per year (only if payment month has passed)
            if (year === currentYear && currentMonth < startMonth) {
                return 0; // Annual payment hasn't happened yet this year
            }
            // Get price for that year's payment month
            return await this._getSubscriptionPriceForDate(subscription.id, `${year}-${String(startMonth).padStart(2, '0')}-15`);
        } else {
            // Monthly: sum each month with historical prices
            let firstMonth = (year === startYear) ? startMonth : 1;
            let lastMonth = (year === currentYear) ? currentMonth : 12;
            
            let total = 0;
            for (let m = firstMonth; m <= lastMonth; m++) {
                total += await this._getSubscriptionCostForMonth(subscription, year, m);
            }
            return total;
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

        // Calculate subscriptions total (only if they should be counted this month) - WITH HISTORY
        let subscriptionsTotal = 0;
        for (const sub of activeSubscriptions) {
            subscriptionsTotal += await this._getSubscriptionCostForMonth(sub, year, month);
        }

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

        // Add subscriptions to categories (only if they should be counted this month) - WITH HISTORY
        for (const sub of activeSubscriptions) {
            const cost = await this._getSubscriptionCostForMonth(sub, year, month);
            if (cost > 0) {
                const category = subscriptionCategories.find(c => c.id === sub.categoria_id);
                const categoryName = category ? category.nombre : 'Suscripciones';

                if (!porCategoria[categoryName]) {
                    porCategoria[categoryName] = 0;
                }
                porCategoria[categoryName] += cost;
            }
        }

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
        let subscriptionsTotal = 0;
        for (const sub of activeSubscriptions) {
            subscriptionsTotal += await this._getSubscriptionCostForYear(sub, year);
        }

        const total = expensesTotal + subscriptionsTotal;

        // Group by month (expenses + subscriptions for each month) - WITH HISTORY
        const byMonth = {};
        for (let i = 1; i <= 12; i++) {
            // Initialize with subscriptions cost for this month
            let monthlySubCost = 0;
            for (const sub of activeSubscriptions) {
                monthlySubCost += await this._getSubscriptionCostForMonth(sub, year, i);
            }
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

        // Monthly total: subscriptions that apply this month - WITH HISTORY
        let monthlyTotal = 0;
        for (const sub of activeSubscriptions) {
            monthlyTotal += await this._getSubscriptionCostForMonth(sub, currentYear, currentMonth);
        }

        // Yearly total: actual cost for current year
        let yearlyTotal = 0;
        for (const sub of activeSubscriptions) {
            yearlyTotal += await this._getSubscriptionCostForYear(sub, currentYear);
        }

        // Group by category (using current month cost) - WITH HISTORY
        const porCategoria = {};
        for (const sub of activeSubscriptions) {
            const cost = await this._getSubscriptionCostForMonth(sub, currentYear, currentMonth);
            if (cost > 0) {
                const category = subscriptionCategories.find(c => c.id === sub.categoria_id);
                const categoryName = category ? category.nombre : 'Sin categoría';

                if (!porCategoria[categoryName]) {
                    porCategoria[categoryName] = 0;
                }
                porCategoria[categoryName] += cost;
            }
        }

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

        // WITH HISTORY: calculate each month with historical prices
        for (let i = 1; i <= maxMonth; i++) {
            let monthTotal = 0;
            for (const sub of activeSubscriptions) {
                monthTotal += await this._getSubscriptionCostForMonth(sub, year, i);
            }
            byMonth[i] = monthTotal;
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
            
            // WITH HISTORY: calculate subscriptions cost with historical prices
            let subscriptionsTotal = 0;
            for (const sub of activeSubscriptions) {
                subscriptionsTotal += await this._getSubscriptionCostForMonth(sub, year, i);
            }

            comparison.byMonth[i] = {
                expenses: expensesTotal,
                subscriptions: subscriptionsTotal,
                total: expensesTotal + subscriptionsTotal
            };
        }

        return comparison;
    }

    // ========================================
    // INSTALLMENTS METHODS
    // ========================================

    /**
     * Get all installments
     */
    async getAllInstallments() {
        const transaction = this.db.transaction(['installments'], 'readonly');
        const store = transaction.objectStore('installments');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active installments
     */
    async getActiveInstallments() {
        const allInstallments = await this.getAllInstallments();
        return allInstallments.filter(inst => inst.activo);
    }

    /**
     * Get installment by ID
     */
    async getInstallmentById(id) {
        const transaction = this.db.transaction(['installments'], 'readonly');
        const store = transaction.objectStore('installments');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Create installment
     */
    async createInstallment(installmentData) {
        const transaction = this.db.transaction(['installments', 'installment_payments'], 'readwrite');
        const installmentStore = transaction.objectStore('installments');
        const paymentsStore = transaction.objectStore('installment_payments');

        const installment = {
            ...installmentData,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: null
        };

        return new Promise((resolve, reject) => {
            const request = installmentStore.add(installment);
            request.onsuccess = () => {
                const installmentId = request.result;
                installment.id = installmentId;

                // Create payment records for each installment
                const totalCuotas = installmentData.total_cuotas;
                const montoCuota = parseFloat(installmentData.monto_cuota);
                let fechaPago = new Date(installmentData.fecha_inicio);

                for (let i = 1; i <= totalCuotas; i++) {
                    const payment = {
                        installment_id: installmentId,
                        numero_cuota: i,
                        monto: montoCuota,
                        fecha_vencimiento: fechaPago.toISOString().split('T')[0],
                        pagado: false,
                        fecha_pago: null
                    };
                    paymentsStore.add(payment);

                    // Increment date based on frequency
                    if (installmentData.periodicidad === 'mensual') {
                        fechaPago.setMonth(fechaPago.getMonth() + 1);
                    } else if (installmentData.periodicidad === 'quincenal') {
                        fechaPago.setDate(fechaPago.getDate() + 15);
                    }
                }

                resolve(installment);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update installment
     */
    async updateInstallment(id, installmentData) {
        const transaction = this.db.transaction(['installments'], 'readwrite');
        const store = transaction.objectStore('installments');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const installment = getRequest.result;
                if (!installment) {
                    reject(new Error('Installment not found'));
                    return;
                }

                const updatedInstallment = {
                    ...installment,
                    ...installmentData,
                    id: id,
                    fecha_actualizacion: new Date().toISOString()
                };

                const updateRequest = store.put(updatedInstallment);
                updateRequest.onsuccess = () => resolve(updatedInstallment);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Delete installment (and its payments)
     */
    async deleteInstallment(id) {
        const transaction = this.db.transaction(['installments', 'installment_payments'], 'readwrite');
        const installmentStore = transaction.objectStore('installments');
        const paymentsStore = transaction.objectStore('installment_payments');
        const paymentsIndex = paymentsStore.index('installment_id');

        return new Promise((resolve, reject) => {
            // Delete installment
            const deleteInstRequest = installmentStore.delete(id);

            deleteInstRequest.onsuccess = () => {
                // Delete all payment records for this installment
                const paymentsRequest = paymentsIndex.getAllKeys(id);
                paymentsRequest.onsuccess = () => {
                    const paymentKeys = paymentsRequest.result;
                    paymentKeys.forEach(key => paymentsStore.delete(key));
                    resolve(true);
                };
                paymentsRequest.onerror = () => reject(paymentsRequest.error);
            };

            deleteInstRequest.onerror = () => reject(deleteInstRequest.error);
        });
    }

    /**
     * Toggle installment active status
     */
    async toggleInstallmentActive(id) {
        const installment = await this.getInstallmentById(id);
        if (!installment) {
            throw new Error('Installment not found');
        }

        return this.updateInstallment(id, {
            activo: !installment.activo
        });
    }

    /**
     * Get payments for an installment
     */
    async getInstallmentPayments(installmentId) {
        const transaction = this.db.transaction(['installment_payments'], 'readonly');
        const store = transaction.objectStore('installment_payments');
        const index = store.index('installment_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(installmentId);
            request.onsuccess = () => {
                const payments = request.result;
                // Sort by installment number
                payments.sort((a, b) => a.numero_cuota - b.numero_cuota);
                resolve(payments);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Mark an installment payment as paid
     */
    async markPaymentAsPaid(paymentId, fechaPago = null) {
        const transaction = this.db.transaction(['installment_payments'], 'readwrite');
        const store = transaction.objectStore('installment_payments');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(paymentId);

            getRequest.onsuccess = () => {
                const payment = getRequest.result;
                if (!payment) {
                    reject(new Error('Payment not found'));
                    return;
                }

                payment.pagado = true;
                payment.fecha_pago = fechaPago || new Date().toISOString().split('T')[0];

                const updateRequest = store.put(payment);
                updateRequest.onsuccess = () => resolve(payment);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Mark an installment payment as unpaid
     */
    async markPaymentAsUnpaid(paymentId) {
        const transaction = this.db.transaction(['installment_payments'], 'readwrite');
        const store = transaction.objectStore('installment_payments');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(paymentId);

            getRequest.onsuccess = () => {
                const payment = getRequest.result;
                if (!payment) {
                    reject(new Error('Payment not found'));
                    return;
                }

                payment.pagado = false;
                payment.fecha_pago = null;

                const updateRequest = store.put(payment);
                updateRequest.onsuccess = () => resolve(payment);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Get installment categories
     */
    async getInstallmentCategories() {
        const transaction = this.db.transaction(['installment_categories'], 'readonly');
        const store = transaction.objectStore('installment_categories');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active installment categories
     */
    async getActiveInstallmentCategories() {
        const allCategories = await this.getInstallmentCategories();
        return allCategories.filter(cat => cat.activo);
    }

    /**
     * Get installments summary
     */
    async getInstallmentsSummary() {
        const activeInstallments = await this.getActiveInstallments();
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        let monthlyTotal = 0;
        let pendingCount = 0;
        let totalRemaining = 0;

        for (const installment of activeInstallments) {
            const payments = await this.getInstallmentPayments(installment.id);

            // Count pending payments
            const pending = payments.filter(p => !p.pagado);
            pendingCount += pending.length;

            // Calculate total remaining
            totalRemaining += pending.reduce((sum, p) => sum + parseFloat(p.monto), 0);

            // Calculate this month's payment
            const thisMonthPayment = payments.find(p => {
                const paymentDate = new Date(p.fecha_vencimiento);
                return paymentDate.getMonth() + 1 === currentMonth &&
                       paymentDate.getFullYear() === currentYear;
            });

            if (thisMonthPayment && !thisMonthPayment.pagado) {
                monthlyTotal += parseFloat(thisMonthPayment.monto);
            }
        }

        return {
            monthlyTotal,
            pendingCount,
            totalRemaining,
            count: activeInstallments.length
        };
    }

    // ========================================
    // SAVINGS METHODS
    // ========================================

    /**
     * Get all savings
     */
    async getAllSavings() {
        const transaction = this.db.transaction(['savings'], 'readonly');
        const store = transaction.objectStore('savings');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get active savings
     */
    async getActiveSavings() {
        const allSavings = await this.getAllSavings();
        return allSavings.filter(saving => saving.activo);
    }

    /**
     * Get saving by ID
     */
    async getSavingById(id) {
        const transaction = this.db.transaction(['savings'], 'readonly');
        const store = transaction.objectStore('savings');

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Create saving
     */
    async createSaving(savingData) {
        const transaction = this.db.transaction(['savings'], 'readwrite');
        const store = transaction.objectStore('savings');

        const saving = {
            ...savingData,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(saving);
            request.onsuccess = () => {
                saving.id = request.result;
                resolve(saving);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update saving
     */
    async updateSaving(id, savingData) {
        const transaction = this.db.transaction(['savings'], 'readwrite');
        const store = transaction.objectStore('savings');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const saving = getRequest.result;
                if (!saving) {
                    reject(new Error('Saving not found'));
                    return;
                }

                const updatedSaving = {
                    ...saving,
                    ...savingData,
                    id: id,
                    fecha_actualizacion: new Date().toISOString()
                };

                const updateRequest = store.put(updatedSaving);
                updateRequest.onsuccess = () => resolve(updatedSaving);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Delete saving (and its movements)
     */
    async deleteSaving(id) {
        const transaction = this.db.transaction(['savings', 'saving_movements'], 'readwrite');
        const savingsStore = transaction.objectStore('savings');
        const movementsStore = transaction.objectStore('saving_movements');
        const movementsIndex = movementsStore.index('saving_id');

        return new Promise((resolve, reject) => {
            // Delete saving
            const deleteSavingRequest = savingsStore.delete(id);

            deleteSavingRequest.onsuccess = () => {
                // Delete all movements for this saving
                const movementsRequest = movementsIndex.getAllKeys(id);
                movementsRequest.onsuccess = () => {
                    const movementKeys = movementsRequest.result;
                    movementKeys.forEach(key => movementsStore.delete(key));
                    resolve(true);
                };
                movementsRequest.onerror = () => reject(movementsRequest.error);
            };

            deleteSavingRequest.onerror = () => reject(deleteSavingRequest.error);
        });
    }

    /**
     * Toggle saving active status
     */
    async toggleSavingActive(id) {
        const saving = await this.getSavingById(id);
        if (!saving) {
            throw new Error('Saving not found');
        }

        return this.updateSaving(id, {
            activo: !saving.activo
        });
    }

    /**
     * Add money to saving (creates movement)
     */
    async addToSaving(savingId, monto, descripcion = null) {
        const saving = await this.getSavingById(savingId);
        if (!saving) {
            throw new Error('Saving not found');
        }

        const transaction = this.db.transaction(['savings', 'saving_movements'], 'readwrite');
        const savingsStore = transaction.objectStore('savings');
        const movementsStore = transaction.objectStore('saving_movements');

        return new Promise((resolve, reject) => {
            // Create movement
            const movement = {
                saving_id: savingId,
                tipo_movimiento: 'ingreso',
                monto: parseFloat(monto),
                descripcion: descripcion || `Ingreso de ${this._formatCurrency(monto)}`,
                fecha: new Date().toISOString()
            };

            const addMovementRequest = movementsStore.add(movement);

            addMovementRequest.onsuccess = () => {
                // Update saving monto
                const newMonto = parseFloat(saving.monto) + parseFloat(monto);
                saving.monto = newMonto;
                saving.fecha_actualizacion = new Date().toISOString();

                const updateSavingRequest = savingsStore.put(saving);
                updateSavingRequest.onsuccess = () => resolve(saving);
                updateSavingRequest.onerror = () => reject(updateSavingRequest.error);
            };

            addMovementRequest.onerror = () => reject(addMovementRequest.error);
        });
    }

    /**
     * Withdraw money from saving (creates movement)
     */
    async withdrawFromSaving(savingId, monto, descripcion = null) {
        const saving = await this.getSavingById(savingId);
        if (!saving) {
            throw new Error('Saving not found');
        }

        const transaction = this.db.transaction(['savings', 'saving_movements'], 'readwrite');
        const savingsStore = transaction.objectStore('savings');
        const movementsStore = transaction.objectStore('saving_movements');

        return new Promise((resolve, reject) => {
            // Create movement
            const movement = {
                saving_id: savingId,
                tipo_movimiento: 'egreso',
                monto: parseFloat(monto),
                descripcion: descripcion || `Retiro de ${this._formatCurrency(monto)}`,
                fecha: new Date().toISOString()
            };

            const addMovementRequest = movementsStore.add(movement);

            addMovementRequest.onsuccess = () => {
                // Update saving monto
                const newMonto = parseFloat(saving.monto) - parseFloat(monto);
                saving.monto = newMonto;
                saving.fecha_actualizacion = new Date().toISOString();

                const updateSavingRequest = savingsStore.put(saving);
                updateSavingRequest.onsuccess = () => resolve(saving);
                updateSavingRequest.onerror = () => reject(updateSavingRequest.error);
            };

            addMovementRequest.onerror = () => reject(addMovementRequest.error);
        });
    }

    /**
     * Get movements for a saving
     */
    async getSavingMovements(savingId) {
        const transaction = this.db.transaction(['saving_movements'], 'readonly');
        const store = transaction.objectStore('saving_movements');
        const index = store.index('saving_id');

        return new Promise((resolve, reject) => {
            const request = index.getAll(savingId);
            request.onsuccess = () => {
                const movements = request.result;
                // Sort by date descending
                movements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                resolve(movements);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get savings summary
     */
    async getSavingsSummary() {
        const activeSavings = await this.getActiveSavings();

        let totalActivo = 0;
        const byType = {};

        activeSavings.forEach(saving => {
            const monto = parseFloat(saving.monto) || 0;
            totalActivo += monto;

            if (!byType[saving.tipo]) {
                byType[saving.tipo] = 0;
            }
            byType[saving.tipo] += monto;
        });

        return {
            totalActivo,
            count: activeSavings.length,
            byType
        };
    }

    /**
     * Helper method to format currency (for movement descriptions)
     */
    _formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
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
            'subscription_price_history',
            'installments',
            'installment_categories',
            'installment_payments',
            'savings',
            'saving_movements'
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
