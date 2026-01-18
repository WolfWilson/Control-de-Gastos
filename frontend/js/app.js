import db from './db.js';
import auth from './auth.js';
import dataBackup from './data-backup.js';
import { formatCurrency, formatDate, getTodayDate, showError, showSuccess, confirm, confirmDanger } from './utils.js';

class ExpenseApp {
    constructor() {
        this.expenses = [];
        this.subscriptions = [];
        this.installments = [];
        this.savings = [];
        this.expenseCategories = [];
        this.subscriptionCategories = [];
        this.installmentCategories = [];
        this.currentEditExpenseId = null;
        this.currentEditSubscriptionId = null;
        this.currentEditInstallmentId = null;
        this.currentEditSavingId = null;
        this.currentSavingId = null; // For quick actions (add/withdraw)
        this.categoryChart = null;
        this.subscriptionsCategoryChart = null;
        this.comparisonChart = null;
        this.yearlyChart = null;
        this.subscriptionsYearlyChart = null;
        this.currentTab = 'dashboard';
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize database
            await db.init();

            // Check authentication
            if (auth.needsRegistration()) {
                this.showRegistration();
            } else if (!auth.isAuthenticated()) {
                this.showLogin();
            } else {
                await this.showMainApp();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            showError('Error al inicializar la aplicación');
        }
    }

    /**
     * Show registration form
     */
    showRegistration() {
        const authScreen = document.getElementById('authScreen');
        const registerForm = document.getElementById('registerForm');
        const loginForm = document.getElementById('loginForm');
        const registerFormElement = document.getElementById('registerFormElement');

        authScreen.classList.remove('hidden');

        // Hide login, show register
        if (loginForm) {
            loginForm.classList.remove('active');
        }
        if (registerForm) {
            registerForm.classList.add('active');
        }

        // Set register tab as active
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        const registerTab = document.querySelector('[data-auth-tab="register"]');
        if (registerTab) {
            registerTab.classList.add('active');
        }

        // Setup auth tab switching
        this.setupAuthTabs();

        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('registerNombre').value;
            const pin = document.getElementById('registerPin').value;
            const confirmPin = document.getElementById('confirmPin').value;

            if (pin !== confirmPin) {
                showError('Los PINs no coinciden');
                return;
            }

            try {
                auth.register(nombre, pin);
                authScreen.classList.add('hidden');
                await this.showMainApp();
            } catch (error) {
                showError(error.message);
            }
        });
    }

    /**
     * Show login form
     */
    showLogin() {
        const authScreen = document.getElementById('authScreen');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginFormElement = document.getElementById('loginFormElement');
        const user = auth.getCurrentUser();

        authScreen.classList.remove('hidden');

        // Hide register, show login
        if (registerForm) {
            registerForm.classList.remove('active');
        }
        loginForm.classList.add('active');

        // Set login tab as active
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        const loginTab = document.querySelector('[data-auth-tab="login"]');
        if (loginTab) {
            loginTab.classList.add('active');
        }

        document.getElementById('loginUserName').textContent = user.nombre;

        // Setup auth tab switching
        this.setupAuthTabs();

        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();

            const pin = document.getElementById('loginPin').value;

            try {
                auth.login(pin);
                authScreen.classList.add('hidden');
                await this.showMainApp();
            } catch (error) {
                showError(error.message);
                document.getElementById('loginPin').value = '';
            }
        });
    }

    /**
     * Setup auth tab switching
     */
    setupAuthTabs() {
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.authTab;
                this.switchAuthTab(targetTab);
            });
        });
    }

    /**
     * Show main application
     */
    async showMainApp() {
        const mainApp = document.getElementById('mainApp');
        const user = auth.getCurrentUser();

        // Update user name in header
        document.getElementById('headerUserName').textContent = user.nombre;

        // Show main app
        mainApp.classList.remove('hidden');

        // Setup all functionality
        this.setupElements();
        this.setupEventListeners();
        this.setupTabs();
        this.setupUserMenu();
        await this.loadCategories();
        await this.loadDashboard();
        await this.loadExpenses();
        this.updateFABIcon();
        this.registerServiceWorker();
    }

    /**
     * Setup DOM element references
     */
    setupElements() {
        this.elements = {
            // Main screens
            mainApp: document.getElementById('mainApp'),
            authScreen: document.getElementById('authScreen'),

            // Tabs
            tabBtns: document.querySelectorAll('.tab-btn'),
            dashboardTab: document.getElementById('dashboardTab'),
            subscriptionsTab: document.getElementById('subscriptionsTab'),
            expensesTab: document.getElementById('expensesTab'),
            statsTab: document.getElementById('statsTab'),

            // Dashboard
            weeklyTotal: document.getElementById('weeklyTotal'),
            monthlyTotal: document.getElementById('monthlyTotal'),
            yearlyTotal: document.getElementById('yearlyTotal'),
            expensesList: document.getElementById('expensesList'),

            // Subscriptions tab
            subscriptionsMonthlyTotal: document.getElementById('subscriptionsMonthlyTotal'),
            subscriptionsYearlyTotal: document.getElementById('subscriptionsYearlyTotal'),
            subscriptionsActiveCount: document.getElementById('subscriptionsActiveCount'),
            subscriptionsList: document.getElementById('subscriptionsList'),

            // Expenses tab
            allExpensesList: document.getElementById('allExpensesList'),
            monthFilter: document.getElementById('monthFilter'),

            // FAB (contextual)
            addBtn: document.getElementById('addBtn'),

            // Expense Modal
            expenseModal: document.getElementById('expenseModal'),
            expenseModalTitle: document.getElementById('expenseModalTitle'),
            closeExpenseModalBtn: document.getElementById('closeExpenseModalBtn'),
            expenseForm: document.getElementById('expenseForm'),
            cancelExpenseBtn: document.getElementById('cancelExpenseBtn'),
            saveExpenseBtn: document.getElementById('saveExpenseBtn'),

            // Expense Form fields
            expenseId: document.getElementById('expenseId'),
            expenseMonto: document.getElementById('expenseMonto'),
            expenseDescripcion: document.getElementById('expenseDescripcion'),
            expenseCategoriaId: document.getElementById('expenseCategoriaId'),
            expenseFecha: document.getElementById('expenseFecha'),
            expenseNotas: document.getElementById('expenseNotas'),

            // Subscription Modal
            subscriptionModal: document.getElementById('subscriptionModal'),
            subscriptionModalTitle: document.getElementById('subscriptionModalTitle'),
            closeSubscriptionModalBtn: document.getElementById('closeSubscriptionModalBtn'),
            subscriptionForm: document.getElementById('subscriptionForm'),
            cancelSubscriptionBtn: document.getElementById('cancelSubscriptionBtn'),
            saveSubscriptionBtn: document.getElementById('saveSubscriptionBtn'),

            // Subscription Form fields
            subscriptionId: document.getElementById('subscriptionId'),
            subscriptionNombre: document.getElementById('subscriptionNombre'),
            subscriptionMonto: document.getElementById('subscriptionMonto'),
            subscriptionCategoriaId: document.getElementById('subscriptionCategoriaId'),
            subscriptionPeriodicidad: document.getElementById('subscriptionPeriodicidad'),
            subscriptionFechaInicio: document.getElementById('subscriptionFechaInicio'),
            subscriptionActivo: document.getElementById('subscriptionActivo'),
            subscriptionNotas: document.getElementById('subscriptionNotas'),

            // Installments tab
            installmentsMonthlyTotal: document.getElementById('installmentsMonthlyTotal'),
            installmentsPendingCount: document.getElementById('installmentsPendingCount'),
            installmentsTotalRemaining: document.getElementById('installmentsTotalRemaining'),
            installmentsList: document.getElementById('installmentsList'),

            // Installment Modal
            installmentModal: document.getElementById('installmentModal'),
            installmentModalTitle: document.getElementById('installmentModalTitle'),
            closeInstallmentModalBtn: document.getElementById('closeInstallmentModalBtn'),
            installmentForm: document.getElementById('installmentForm'),
            cancelInstallmentBtn: document.getElementById('cancelInstallmentBtn'),
            saveInstallmentBtn: document.getElementById('saveInstallmentBtn'),

            // Installment Form fields
            installmentId: document.getElementById('installmentId'),
            installmentNombre: document.getElementById('installmentNombre'),
            installmentMontoTotal: document.getElementById('installmentMontoTotal'),
            installmentTotalCuotas: document.getElementById('installmentTotalCuotas'),
            installmentMontoCuota: document.getElementById('installmentMontoCuota'),
            installmentCategoriaId: document.getElementById('installmentCategoriaId'),
            installmentPeriodicidad: document.getElementById('installmentPeriodicidad'),
            installmentFechaInicio: document.getElementById('installmentFechaInicio'),
            installmentActivo: document.getElementById('installmentActivo'),
            installmentNotas: document.getElementById('installmentNotas'),

            // Savings tab
            savingsTotalActive: document.getElementById('savingsTotalActive'),
            savingsActiveCount: document.getElementById('savingsActiveCount'),
            savingsList: document.getElementById('savingsList'),

            // Saving Modal
            savingModal: document.getElementById('savingModal'),
            savingModalTitle: document.getElementById('savingModalTitle'),
            closeSavingModalBtn: document.getElementById('closeSavingModalBtn'),
            savingForm: document.getElementById('savingForm'),
            cancelSavingBtn: document.getElementById('cancelSavingBtn'),
            saveSavingBtn: document.getElementById('saveSavingBtn'),

            // Saving Form fields
            savingId: document.getElementById('savingId'),
            savingNombre: document.getElementById('savingNombre'),
            savingMonto: document.getElementById('savingMonto'),
            savingTipo: document.getElementById('savingTipo'),
            savingActivo: document.getElementById('savingActivo'),
            savingNotas: document.getElementById('savingNotas'),

            // Charts
            categoryChart: document.getElementById('categoryChart'),
            subscriptionsCategoryChart: document.getElementById('subscriptionsCategoryChart'),
            comparisonChart: document.getElementById('comparisonChart'),
            yearlyChart: document.getElementById('yearlyChart'),
            subscriptionsYearlyChart: document.getElementById('subscriptionsYearlyChart')
        };

        // Set default date to today
        this.elements.expenseFecha.value = getTodayDate();
        this.elements.subscriptionFechaInicio.value = getTodayDate();
        this.elements.installmentFechaInicio.value = getTodayDate();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // FAB contextual (opens expense or subscription modal based on current tab)
        this.elements.addBtn.addEventListener('click', () => this.handleFABClick());

        // Expense Modal
        this.elements.closeExpenseModalBtn.addEventListener('click', () => this.closeExpenseModal());
        this.elements.cancelExpenseBtn.addEventListener('click', () => this.closeExpenseModal());
        this.elements.expenseModal.addEventListener('click', (e) => {
            if (e.target === this.elements.expenseModal) {
                this.closeExpenseModal();
            }
        });
        this.elements.expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));

        // Subscription Modal
        this.elements.closeSubscriptionModalBtn.addEventListener('click', () => this.closeSubscriptionModal());
        this.elements.cancelSubscriptionBtn.addEventListener('click', () => this.closeSubscriptionModal());
        this.elements.subscriptionModal.addEventListener('click', (e) => {
            if (e.target === this.elements.subscriptionModal) {
                this.closeSubscriptionModal();
            }
        });
        this.elements.subscriptionForm.addEventListener('submit', (e) => this.handleSubscriptionSubmit(e));

        // Installment Modal
        this.elements.closeInstallmentModalBtn.addEventListener('click', () => this.closeInstallmentModal());
        this.elements.cancelInstallmentBtn.addEventListener('click', () => this.closeInstallmentModal());
        this.elements.installmentModal.addEventListener('click', (e) => {
            if (e.target === this.elements.installmentModal) {
                this.closeInstallmentModal();
            }
        });
        this.elements.installmentForm.addEventListener('submit', (e) => this.handleInstallmentSubmit(e));

        // Auto-calculate installment amount when changing total or cuotas
        this.elements.installmentMontoTotal.addEventListener('input', () => this.calculateInstallmentAmount());
        this.elements.installmentTotalCuotas.addEventListener('input', () => this.calculateInstallmentAmount());

        // Saving Modal
        this.elements.closeSavingModalBtn.addEventListener('click', () => this.closeSavingModal());
        this.elements.cancelSavingBtn.addEventListener('click', () => this.closeSavingModal());
        this.elements.savingModal.addEventListener('click', (e) => {
            if (e.target === this.elements.savingModal) {
                this.closeSavingModal();
            }
        });
        this.elements.savingForm.addEventListener('submit', (e) => this.handleSavingSubmit(e));

        // Month filter
        this.elements.monthFilter.addEventListener('change', () => this.filterExpensesByMonth());
    }

    /**
     * Switch between login and register tabs
     */
    switchAuthTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-auth-tab="${tabName}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        if (tabName === 'login') {
            document.getElementById('loginForm').classList.add('active');
        } else {
            document.getElementById('registerForm').classList.add('active');
        }
    }

    /**
     * Setup tabs navigation
     */
    setupTabs() {
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Switch between tabs
     */
    async switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.elements.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabName}Tab`);
        activeTab.classList.add('active');

        // Update FAB icon
        this.updateFABIcon();

        // Load tab-specific data
        if (tabName === 'subscriptions') {
            await this.loadSubscriptions();
        } else if (tabName === 'installments') {
            await this.loadInstallments();
        } else if (tabName === 'savings') {
            await this.loadSavings();
        } else if (tabName === 'expenses') {
            await this.loadAllExpenses();
            this.populateMonthFilter();
        } else if (tabName === 'stats') {
            await this.loadStatistics();
        }
    }

    /**
     * Update FAB icon based on current tab
     */
    updateFABIcon() {
        const icon = this.elements.addBtn.querySelector('i');

        if (this.currentTab === 'subscriptions') {
            icon.className = 'fas fa-sync-alt';
            this.elements.addBtn.title = 'Agregar suscripción';
        } else if (this.currentTab === 'installments') {
            icon.className = 'fas fa-credit-card';
            this.elements.addBtn.title = 'Agregar cuota';
        } else if (this.currentTab === 'savings') {
            icon.className = 'fas fa-piggy-bank';
            this.elements.addBtn.title = 'Agregar ahorro';
        } else {
            icon.className = 'fas fa-plus';
            this.elements.addBtn.title = 'Agregar gasto';
        }
    }

    /**
     * Handle FAB click (contextual)
     */
    handleFABClick() {
        if (this.currentTab === 'subscriptions') {
            this.openSubscriptionModal();
        } else if (this.currentTab === 'installments') {
            this.openInstallmentModal();
        } else if (this.currentTab === 'savings') {
            this.openSavingModal();
        } else {
            this.openExpenseModal();
        }
    }

    /**
     * Load categories from database
     */
    async loadCategories() {
        try {
            this.expenseCategories = await db.getActiveExpenseCategories();
            this.subscriptionCategories = await db.getActiveSubscriptionCategories();
            this.installmentCategories = await db.getActiveInstallmentCategories();
            this.renderExpenseCategoriesSelect();
            this.renderSubscriptionCategoriesSelect();
            this.renderInstallmentCategoriesSelect();
        } catch (error) {
            console.error('Error loading categories:', error);
            showError('Error al cargar las categorías');
        }
    }

    /**
     * Render expense categories in select dropdown
     */
    renderExpenseCategoriesSelect() {
        const select = this.elements.expenseCategoriaId;
        select.innerHTML = '<option value="">Selecciona una categoría</option>';

        this.expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icono} ${category.nombre}`;
            select.appendChild(option);
        });
    }

    /**
     * Render subscription categories in select dropdown
     */
    renderSubscriptionCategoriesSelect() {
        const select = this.elements.subscriptionCategoriaId;
        select.innerHTML = '<option value="">Selecciona una categoría</option>';

        this.subscriptionCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            // For Font Awesome icons, just show name
            option.textContent = category.nombre;
            select.appendChild(option);
        });
    }

    /**
     * Render installment categories in select dropdown
     */
    renderInstallmentCategoriesSelect() {
        const select = this.elements.installmentCategoriaId;
        select.innerHTML = '<option value="">Selecciona una categoría</option>';

        this.installmentCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.nombre;
            select.appendChild(option);
        });
    }

    /**
     * Load dashboard data
     */
    async loadDashboard() {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;

            // Weekly summary (last 7 days) - includes active subscriptions
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - 7);
            const weeklySummary = await db.getWeeklySummary(weekStart, today);
            this.elements.weeklyTotal.textContent = formatCurrency(weeklySummary.total);

            // Monthly summary - includes active subscriptions
            const monthlySummary = await db.getMonthlySummary(currentYear, currentMonth);
            this.elements.monthlyTotal.textContent = formatCurrency(monthlySummary.total);

            // Yearly summary - includes active subscriptions
            const yearlySummary = await db.getYearlySummary(currentYear);
            this.elements.yearlyTotal.textContent = formatCurrency(yearlySummary.total);

            // Recent expenses (only expenses, not subscriptions)
            await this.loadExpenses();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.elements.weeklyTotal.textContent = formatCurrency(0);
            this.elements.monthlyTotal.textContent = formatCurrency(0);
            this.elements.yearlyTotal.textContent = formatCurrency(0);
        }
    }

    /**
     * Load recent expenses
     */
    async loadExpenses() {
        try {
            this.expenses = await db.getRecentExpenses(10);
            this.renderExpenses(this.elements.expensesList, this.expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
            this.renderEmptyState(this.elements.expensesList, 'gastos');
        }
    }

    /**
     * Load all expenses
     */
    async loadAllExpenses() {
        try {
            const allExpenses = await db.getAllExpenses();
            this.renderExpenses(this.elements.allExpensesList, allExpenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
            this.renderEmptyState(this.elements.allExpensesList, 'gastos');
        }
    }

    /**
     * Load subscriptions
     */
    async loadSubscriptions() {
        try {
            this.subscriptions = await db.getAllSubscriptions();

            // Update summary cards
            const summary = await db.getSubscriptionsSummary();
            this.elements.subscriptionsMonthlyTotal.textContent = formatCurrency(summary.monthlyTotal);
            this.elements.subscriptionsYearlyTotal.textContent = formatCurrency(summary.yearlyTotal);
            this.elements.subscriptionsActiveCount.textContent = summary.count;

            // Render subscriptions list
            this.renderSubscriptions(this.elements.subscriptionsList, this.subscriptions);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            this.renderEmptyState(this.elements.subscriptionsList, 'suscripciones');
        }
    }

    /**
     * Render expenses list
     */
    renderExpenses(container, expenses) {
        if (expenses.length === 0) {
            this.renderEmptyState(container, 'gastos');
            return;
        }

        container.innerHTML = '';

        expenses.forEach(expense => {
            const category = this.expenseCategories.find(c => c.id === expense.categoria_id);
            const item = this.createExpenseItem(expense, category);
            container.appendChild(item);
        });
    }

    /**
     * Create expense list item element
     */
    createExpenseItem(expense, category) {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.dataset.expenseId = expense.id;

        item.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${expense.descripcion}</div>
                <div class="expense-meta">
                    <span class="expense-category">
                        ${category ? category.icono : '📦'} ${category ? category.nombre : 'Sin categoría'}
                    </span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(expense.fecha)}</span>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(expense.monto)}</div>
            <div class="expense-actions">
                <button class="btn-icon" data-action="edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" data-action="delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openExpenseModal(expense);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeleteExpense(expense.id);
        });

        return item;
    }

    /**
     * Render subscriptions list
     */
    renderSubscriptions(container, subscriptions) {
        if (subscriptions.length === 0) {
            this.renderEmptyState(container, 'suscripciones');
            return;
        }

        container.innerHTML = '';

        subscriptions.forEach(subscription => {
            const category = this.subscriptionCategories.find(c => c.id === subscription.categoria_id);
            const item = this.createSubscriptionItem(subscription, category);
            container.appendChild(item);
        });
    }

    /**
     * Create subscription list item element
     */
    createSubscriptionItem(subscription, category) {
        const item = document.createElement('div');
        item.className = 'expense-item subscription-item';
        item.dataset.subscriptionId = subscription.id;

        // Add class for inactive subscriptions
        if (!subscription.activo) {
            item.classList.add('subscription-inactive');
        }

        // Calculate monthly cost for display
        const monthlyMonto = subscription.periodicidad === 'anual'
            ? subscription.monto / 12
            : subscription.monto;

        item.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">
                    ${subscription.nombre}
                    ${!subscription.activo ? '<span class="badge badge-inactive">Inactiva</span>' : ''}
                </div>
                <div class="expense-meta">
                    <span class="expense-category">
                        <i class="${category ? category.icono : 'fas fa-question'} fa-sm"></i> ${category ? category.nombre : 'Sin categoría'}
                    </span>
                    <span><i class="fas fa-clock"></i> ${subscription.periodicidad === 'anual' ? 'Anual' : 'Mensual'}</span>
                </div>
            </div>
            <div class="expense-amount">
                ${formatCurrency(subscription.monto)}${subscription.periodicidad === 'anual' ? '/año' : '/mes'}
                ${subscription.periodicidad === 'anual' ? `<div class="expense-amount-small">${formatCurrency(monthlyMonto)}/mes</div>` : ''}
            </div>
            <div class="expense-actions">
                <button class="btn-icon ${subscription.activo ? 'btn-success' : 'btn-secondary'}"
                        data-action="toggle"
                        title="${subscription.activo ? 'Desactivar' : 'Activar'}">
                    <i class="fas ${subscription.activo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                </button>
                <button class="btn-icon" data-action="edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" data-action="delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const toggleBtn = item.querySelector('[data-action="toggle"]');
        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleToggleSubscription(subscription.id);
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSubscriptionModal(subscription);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeleteSubscription(subscription.id);
        });

        return item;
    }

    /**
     * Render empty state
     */
    renderEmptyState(container, type = 'gastos') {
        let icon = 'fa-receipt';
        let message = 'No hay gastos registrados';
        let hint = 'Haz clic en el botón + para agregar tu primer gasto';

        if (type === 'suscripciones') {
            icon = 'fa-sync-alt';
            message = 'No hay suscripciones registradas';
            hint = 'Haz clic en el botón + para agregar tu primera suscripción';
        } else if (type === 'installments') {
            icon = 'fa-credit-card';
            message = 'No hay cuotas registradas';
            hint = 'Haz clic en el botón + para agregar tu primera compra en cuotas';
        } else if (type === 'savings') {
            icon = 'fa-piggy-bank';
            message = 'No hay ahorros registrados';
            hint = 'Haz clic en el botón + para registrar tu primer ahorro';
        }

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas ${icon}"></i></div>
                <p>${message}</p>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-lighter);">
                    ${hint}
                </p>
            </div>
        `;
    }

    // ========================================
    // EXPENSE MODAL METHODS
    // ========================================

    /**
     * Open modal for add/edit expense
     */
    openExpenseModal(expense = null) {
        this.currentEditExpenseId = expense ? expense.id : null;

        if (expense) {
            // Edit mode
            this.elements.expenseModalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Gasto';
            this.elements.expenseId.value = expense.id;
            this.elements.expenseMonto.value = expense.monto;
            this.elements.expenseDescripcion.value = expense.descripcion;
            this.elements.expenseCategoriaId.value = expense.categoria_id;
            this.elements.expenseFecha.value = expense.fecha;
            this.elements.expenseNotas.value = expense.notas || '';
        } else {
            // Create mode
            this.elements.expenseModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo Gasto';
            this.elements.expenseForm.reset();
            this.elements.expenseFecha.value = getTodayDate();
        }

        this.elements.expenseModal.classList.remove('hidden');
    }

    /**
     * Close expense modal
     */
    closeExpenseModal() {
        this.elements.expenseModal.classList.add('hidden');
        this.elements.expenseForm.reset();
        this.currentEditExpenseId = null;
    }

    /**
     * Handle expense form submission
     */
    async handleExpenseSubmit(event) {
        event.preventDefault();

        const expenseData = {
            monto: parseFloat(this.elements.expenseMonto.value),
            descripcion: this.elements.expenseDescripcion.value.trim(),
            categoria_id: parseInt(this.elements.expenseCategoriaId.value),
            fecha: this.elements.expenseFecha.value,
            notas: this.elements.expenseNotas.value.trim() || null
        };

        try {
            if (this.currentEditExpenseId) {
                // Update expense
                await db.updateExpense(this.currentEditExpenseId, expenseData);
                showSuccess('Gasto actualizado exitosamente');
            } else {
                // Create expense
                await db.createExpense(expenseData);
                showSuccess('Gasto creado exitosamente');
            }

            this.closeExpenseModal();
            await this.loadDashboard();

            // Refresh current tab
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error saving expense:', error);
            showError('Error al guardar el gasto');
        }
    }

    /**
     * Handle expense deletion
     */
    async handleDeleteExpense(expenseId) {
        const confirmed = await confirmDanger(
            '¿Estás seguro de que quieres eliminar este gasto?',
            'Eliminar Gasto'
        );

        if (!confirmed) {
            return;
        }

        try {
            await db.deleteExpense(expenseId);
            showSuccess('Gasto eliminado exitosamente');
            await this.loadDashboard();
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error deleting expense:', error);
            showError('Error al eliminar el gasto');
        }
    }

    // ========================================
    // SUBSCRIPTION MODAL METHODS
    // ========================================

    /**
     * Open modal for add/edit subscription
     */
    openSubscriptionModal(subscription = null) {
        this.currentEditSubscriptionId = subscription ? subscription.id : null;

        if (subscription) {
            // Edit mode
            this.elements.subscriptionModalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Suscripción';
            this.elements.subscriptionId.value = subscription.id;
            this.elements.subscriptionNombre.value = subscription.nombre;
            this.elements.subscriptionMonto.value = subscription.monto;
            this.elements.subscriptionCategoriaId.value = subscription.categoria_id;
            this.elements.subscriptionPeriodicidad.value = subscription.periodicidad;
            this.elements.subscriptionFechaInicio.value = subscription.fecha_inicio || getTodayDate();
            this.elements.subscriptionActivo.checked = subscription.activo;
            this.elements.subscriptionNotas.value = subscription.notas || '';
        } else {
            // Create mode
            this.elements.subscriptionModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Suscripción';
            this.elements.subscriptionForm.reset();
            this.elements.subscriptionFechaInicio.value = getTodayDate();
            this.elements.subscriptionActivo.checked = true;
            this.elements.subscriptionPeriodicidad.value = 'mensual';
        }

        this.elements.subscriptionModal.classList.remove('hidden');
    }

    /**
     * Close subscription modal
     */
    closeSubscriptionModal() {
        this.elements.subscriptionModal.classList.add('hidden');
        this.elements.subscriptionForm.reset();
        this.currentEditSubscriptionId = null;
    }

    /**
     * Handle subscription form submission
     */
    async handleSubscriptionSubmit(event) {
        event.preventDefault();

        const subscriptionData = {
            nombre: this.elements.subscriptionNombre.value.trim(),
            monto: parseFloat(this.elements.subscriptionMonto.value),
            categoria_id: parseInt(this.elements.subscriptionCategoriaId.value),
            periodicidad: this.elements.subscriptionPeriodicidad.value,
            fecha_inicio: this.elements.subscriptionFechaInicio.value || null,
            activo: this.elements.subscriptionActivo.checked,
            notas: this.elements.subscriptionNotas.value.trim() || null
        };

        try {
            if (this.currentEditSubscriptionId) {
                // Update subscription
                await db.updateSubscription(this.currentEditSubscriptionId, subscriptionData);
                showSuccess('Suscripción actualizada exitosamente');
            } else {
                // Create subscription
                await db.createSubscription(subscriptionData);
                showSuccess('Suscripción creada exitosamente');
            }

            this.closeSubscriptionModal();
            await this.loadDashboard(); // Refresh dashboard totals
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error saving subscription:', error);
            showError('Error al guardar la suscripción');
        }
    }

    /**
     * Handle subscription toggle (active/inactive)
     */
    async handleToggleSubscription(subscriptionId) {
        try {
            await db.toggleSubscriptionActive(subscriptionId);
            showSuccess('Estado actualizado');
            await this.loadDashboard(); // Refresh dashboard totals
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error toggling subscription:', error);
            showError('Error al cambiar el estado');
        }
    }

    /**
     * Handle subscription deletion
     */
    async handleDeleteSubscription(subscriptionId) {
        const confirmed = await confirmDanger(
            '¿Estás seguro de que quieres eliminar esta suscripción? Se eliminará también su historial de precios.',
            'Eliminar Suscripción'
        );

        if (!confirmed) {
            return;
        }

        try {
            await db.deleteSubscription(subscriptionId);
            showSuccess('Suscripción eliminada exitosamente');
            await this.loadDashboard();
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error deleting subscription:', error);
            showError('Error al eliminar la suscripción');
        }
    }

    // ========================================
    // INSTALLMENT MODAL METHODS
    // ========================================

    /**
     * Load installments
     */
    async loadInstallments() {
        try {
            this.installments = await db.getAllInstallments();

            // Update summary cards
            const summary = await db.getInstallmentsSummary();
            this.elements.installmentsMonthlyTotal.textContent = formatCurrency(summary.monthlyTotal);
            this.elements.installmentsPendingCount.textContent = summary.pendingCount;
            this.elements.installmentsTotalRemaining.textContent = formatCurrency(summary.totalRemaining);

            // Render installments list
            this.renderInstallments(this.elements.installmentsList, this.installments);
        } catch (error) {
            console.error('Error loading installments:', error);
            this.renderEmptyState(this.elements.installmentsList, 'cuotas');
        }
    }

    /**
     * Render installments list
     */
    renderInstallments(container, installments) {
        if (installments.length === 0) {
            this.renderEmptyState(container, 'cuotas');
            return;
        }

        container.innerHTML = '';

        installments.forEach(installment => {
            const category = this.installmentCategories.find(c => c.id === installment.categoria_id);
            const item = this.createInstallmentItem(installment, category);
            container.appendChild(item);
        });
    }

    /**
     * Create installment list item element
     */
    createInstallmentItem(installment, category) {
        const item = document.createElement('div');
        item.className = 'expense-item installment-item';
        item.dataset.installmentId = installment.id;

        // Add class for inactive installments
        if (!installment.activo) {
            item.classList.add('installment-inactive');
        }

        // Calculate progress
        const totalCuotas = installment.total_cuotas;
        const cuotasPagadas = Math.floor(Math.random() * totalCuotas); // TODO: Get real paid count
        const progreso = Math.round((cuotasPagadas / totalCuotas) * 100);

        item.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">
                    ${installment.nombre}
                    ${!installment.activo ? '<span class="badge badge-inactive">Inactiva</span>' : ''}
                </div>
                <div class="expense-meta">
                    <span class="expense-category">
                        <i class="${category ? category.icono : 'fas fa-question'} fa-sm"></i> ${category ? category.nombre : 'Sin categoría'}
                    </span>
                    <span><i class="fas fa-list-ol"></i> ${cuotasPagadas}/${totalCuotas} cuotas</span>
                    <span><i class="fas fa-percent"></i> ${progreso}% completado</span>
                </div>
            </div>
            <div class="expense-amount">
                ${formatCurrency(installment.monto_cuota)}/${installment.periodicidad === 'quincenal' ? 'quinc' : 'mes'}
                <div class="expense-amount-small">Total: ${formatCurrency(installment.monto_total)}</div>
            </div>
            <div class="expense-actions">
                <button class="btn-icon ${installment.activo ? 'btn-success' : 'btn-secondary'}"
                        data-action="toggle"
                        title="${installment.activo ? 'Desactivar' : 'Activar'}">
                    <i class="fas ${installment.activo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                </button>
                <button class="btn-icon" data-action="edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" data-action="delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const toggleBtn = item.querySelector('[data-action="toggle"]');
        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleToggleInstallment(installment.id);
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openInstallmentModal(installment);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeleteInstallment(installment.id);
        });

        return item;
    }

    /**
     * Open modal for add/edit installment
     */
    openInstallmentModal(installment = null) {
        this.currentEditInstallmentId = installment ? installment.id : null;

        if (installment) {
            // Edit mode
            this.elements.installmentModalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Cuota';
            this.elements.installmentId.value = installment.id;
            this.elements.installmentNombre.value = installment.nombre;
            this.elements.installmentMontoTotal.value = installment.monto_total;
            this.elements.installmentTotalCuotas.value = installment.total_cuotas;
            this.elements.installmentMontoCuota.value = installment.monto_cuota;
            this.elements.installmentCategoriaId.value = installment.categoria_id;
            this.elements.installmentPeriodicidad.value = installment.periodicidad;
            this.elements.installmentFechaInicio.value = installment.fecha_inicio || getTodayDate();
            this.elements.installmentActivo.checked = installment.activo;
            this.elements.installmentNotas.value = installment.notas || '';
        } else {
            // Create mode
            this.elements.installmentModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Cuota';
            this.elements.installmentForm.reset();
            this.elements.installmentFechaInicio.value = getTodayDate();
            this.elements.installmentActivo.checked = true;
            this.elements.installmentPeriodicidad.value = 'mensual';
        }

        this.elements.installmentModal.classList.remove('hidden');
    }

    /**
     * Close installment modal
     */
    closeInstallmentModal() {
        this.elements.installmentModal.classList.add('hidden');
        this.elements.installmentForm.reset();
        this.currentEditInstallmentId = null;
    }

    /**
     * Calculate installment amount automatically
     */
    calculateInstallmentAmount() {
        const montoTotal = parseFloat(this.elements.installmentMontoTotal.value) || 0;
        const totalCuotas = parseInt(this.elements.installmentTotalCuotas.value) || 1;

        if (montoTotal > 0 && totalCuotas > 0) {
            const montoCuota = (montoTotal / totalCuotas).toFixed(2);
            this.elements.installmentMontoCuota.value = montoCuota;
        }
    }

    /**
     * Handle installment form submission
     */
    async handleInstallmentSubmit(event) {
        event.preventDefault();

        const installmentData = {
            nombre: this.elements.installmentNombre.value.trim(),
            monto_total: parseFloat(this.elements.installmentMontoTotal.value),
            total_cuotas: parseInt(this.elements.installmentTotalCuotas.value),
            monto_cuota: parseFloat(this.elements.installmentMontoCuota.value),
            categoria_id: parseInt(this.elements.installmentCategoriaId.value),
            periodicidad: this.elements.installmentPeriodicidad.value,
            fecha_inicio: this.elements.installmentFechaInicio.value || null,
            activo: this.elements.installmentActivo.checked,
            notas: this.elements.installmentNotas.value.trim() || null
        };

        try {
            if (this.currentEditInstallmentId) {
                // Update installment
                await db.updateInstallment(this.currentEditInstallmentId, installmentData);
                showSuccess('Cuota actualizada exitosamente');
            } else {
                // Create installment
                await db.createInstallment(installmentData);
                showSuccess('Cuota creada exitosamente');
            }

            this.closeInstallmentModal();
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error saving installment:', error);
            showError('Error al guardar la cuota');
        }
    }

    /**
     * Handle installment toggle (active/inactive)
     */
    async handleToggleInstallment(installmentId) {
        try {
            await db.toggleInstallmentActive(installmentId);
            showSuccess('Estado actualizado');
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error toggling installment:', error);
            showError('Error al cambiar el estado');
        }
    }

    /**
     * Handle installment deletion
     */
    async handleDeleteInstallment(installmentId) {
        const confirmed = await confirmDanger(
            '¿Estás seguro de que quieres eliminar esta cuota? Se eliminará también el registro de pagos.',
            'Eliminar Cuota'
        );

        if (!confirmed) {
            return;
        }

        try {
            await db.deleteInstallment(installmentId);
            showSuccess('Cuota eliminada exitosamente');
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error deleting installment:', error);
            showError('Error al eliminar la cuota');
        }
    }

    // ========================================
    // SAVING MODAL METHODS
    // ========================================

    /**
     * Load savings
     */
    async loadSavings() {
        try {
            this.savings = await db.getAllSavings();

            // Update summary cards
            const summary = await db.getSavingsSummary();
            this.elements.savingsTotalActive.textContent = formatCurrency(summary.totalActivo);
            this.elements.savingsActiveCount.textContent = summary.count;

            // Render savings list
            this.renderSavings(this.elements.savingsList, this.savings);
        } catch (error) {
            console.error('Error loading savings:', error);
            this.renderEmptyState(this.elements.savingsList, 'savings');
        }
    }

    /**
     * Render savings list
     */
    renderSavings(container, savings) {
        if (savings.length === 0) {
            this.renderEmptyState(container, 'savings');
            return;
        }

        container.innerHTML = '';

        savings.forEach(saving => {
            const item = this.createSavingItem(saving);
            container.appendChild(item);
        });
    }

    /**
     * Create saving list item element
     */
    createSavingItem(saving) {
        const item = document.createElement('div');
        item.className = 'expense-item saving-item';
        item.dataset.savingId = saving.id;

        // Add class for inactive savings
        if (!saving.activo) {
            item.classList.add('saving-inactive');
        }

        // Get tipo icon and label
        const tipoInfo = {
            'efectivo': { icon: 'fas fa-money-bill-wave', label: 'Efectivo' },
            'banco': { icon: 'fas fa-university', label: 'Banco' },
            'inversion': { icon: 'fas fa-chart-line', label: 'Inversión' },
            'otro': { icon: 'fas fa-piggy-bank', label: 'Otro' }
        };
        const tipo = tipoInfo[saving.tipo] || tipoInfo['otro'];

        item.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">
                    ${saving.nombre}
                    ${!saving.activo ? '<span class="badge badge-inactive">Inactiva</span>' : ''}
                </div>
                <div class="expense-meta">
                    <span class="expense-category">
                        <i class="${tipo.icon} fa-sm"></i> ${tipo.label}
                    </span>
                </div>
            </div>
            <div class="expense-amount">
                ${formatCurrency(saving.monto)}
            </div>
            <div class="expense-actions">
                <button class="btn-icon" data-action="edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" data-action="delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Event listeners for actions
        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editSaving(saving.id);
        });

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.deleteSaving(saving.id);
        });

        return item;
    }

    /**
     * Edit saving
     */
    editSaving(savingId) {
        const saving = this.savings.find(s => s.id === savingId);
        if (saving) {
            this.openSavingModal(saving);
        }
    }

    /**
     * Delete saving
     */
    async deleteSaving(savingId) {
        const confirmed = await confirmDanger(
            '¿Estás seguro de que deseas eliminar este ahorro? Esta acción no se puede deshacer.',
            'Eliminar Ahorro'
        );

        if (!confirmed) {
            return;
        }

        try {
            await db.deleteSaving(savingId);
            showSuccess('Ahorro eliminado exitosamente');
            await this.loadDashboard();
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error deleting saving:', error);
            showError('Error al eliminar el ahorro');
        }
    }

    /**
     * Open modal for add/edit saving
     */
    openSavingModal(saving = null) {
        this.currentEditSavingId = saving ? saving.id : null;

        if (saving) {
            // Edit mode
            this.elements.savingModalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Ahorro';
            this.elements.savingId.value = saving.id;
            this.elements.savingNombre.value = saving.nombre;
            this.elements.savingMonto.value = saving.monto;
            this.elements.savingTipo.value = saving.tipo;
            this.elements.savingActivo.checked = saving.activo;
            this.elements.savingNotas.value = saving.notas || '';
        } else {
            // Create mode
            this.elements.savingModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo Ahorro';
            this.elements.savingForm.reset();
            this.elements.savingActivo.checked = true;
            this.elements.savingTipo.value = 'efectivo';
            this.elements.savingMonto.value = '0';
        }

        this.elements.savingModal.classList.remove('hidden');
    }

    /**
     * Close saving modal
     */
    closeSavingModal() {
        this.elements.savingModal.classList.add('hidden');
        this.elements.savingForm.reset();
        this.currentEditSavingId = null;
    }

    /**
     * Handle saving form submit
     */
    async handleSavingSubmit(e) {
        e.preventDefault();

        const savingData = {
            nombre: this.elements.savingNombre.value,
            monto: parseFloat(this.elements.savingMonto.value),
            tipo: this.elements.savingTipo.value,
            activo: this.elements.savingActivo.checked,
            notas: this.elements.savingNotas.value || null
        };

        try {
            if (this.currentEditSavingId) {
                // Update existing saving
                await db.updateSaving(this.currentEditSavingId, savingData);
                showSuccess('Ahorro actualizado exitosamente');
            } else {
                // Create new saving
                await db.createSaving(savingData);
                showSuccess('Ahorro creado exitosamente');
            }

            this.closeSavingModal();
            await this.loadDashboard();
            await this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Error saving saving:', error);
            showError('Error al guardar el ahorro');
        }
    }

    // ========================================
    // OTHER METHODS
    // ========================================

    /**
     * Populate month filter dropdown
     */
    populateMonthFilter() {
        const select = this.elements.monthFilter;
        select.innerHTML = '<option value="">Todos los meses</option>';

        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const currentYear = new Date().getFullYear();

        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = `${currentYear}-${index + 1}`;
            option.textContent = `${month} ${currentYear}`;
            select.appendChild(option);
        });
    }

    /**
     * Filter expenses by selected month
     */
    async filterExpensesByMonth() {
        const filterValue = this.elements.monthFilter.value;

        if (!filterValue) {
            await this.loadAllExpenses();
            return;
        }

        const [year, month] = filterValue.split('-').map(Number);

        try {
            const expenses = await db.getExpensesByMonth(year, month);
            this.renderExpenses(this.elements.allExpensesList, expenses);
        } catch (error) {
            console.error('Error filtering expenses:', error);
        }
    }

    /**
     * Load statistics and render charts
     */
    async loadStatistics() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        try {
            // 1. Monthly expenses by category (includes subscriptions)
            const monthlySummary = await db.getMonthlySummary(currentYear, currentMonth);
            this.renderCategoryChart(monthlySummary.porCategoria);

            // 2. Monthly subscriptions by category
            const subscriptionsSummary = await db.getSubscriptionsSummary();
            this.renderSubscriptionsCategoryChart(subscriptionsSummary.porCategoria);

            // 3. Expenses vs Subscriptions comparison
            const comparison = await db.getExpensesVsSubscriptionsComparison(currentYear);
            this.renderComparisonChart(comparison.byMonth);

            // 4. Yearly evolution (all expenses + subscriptions)
            const yearlySummary = await db.getYearlySummary(currentYear);
            this.renderYearlyChart(yearlySummary.byMonth);

            // 5. Subscriptions yearly evolution
            const subscriptionsEvolution = await db.getSubscriptionsYearlyEvolution(currentYear);
            this.renderSubscriptionsYearlyChart(subscriptionsEvolution.byMonth, subscriptionsEvolution.maxMonth);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    /**
     * Render category pie chart
     */
    renderCategoryChart(categoryData) {
        // Check if canvas exists
        if (!this.elements.categoryChart) {
            console.log('[Chart] Category chart canvas not found, skipping render');
            return;
        }

        const ctx = this.elements.categoryChart.getContext('2d');

        // Destroy existing chart
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        // Get colors from categories (both expense and subscription categories)
        const colors = labels.map(categoryName => {
            const expCategory = this.expenseCategories.find(c => c.nombre === categoryName);
            if (expCategory) return expCategory.color;

            const subCategory = this.subscriptionCategories.find(c => c.nombre === categoryName);
            if (subCategory) return subCategory.color;

            return '#6B7280'; // Default gray
        });

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Montserrat',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render yearly line chart (only up to current month)
     */
    renderYearlyChart(monthlyData) {
        // Check if canvas exists
        if (!this.elements.yearlyChart) {
            console.log('[Chart] Yearly chart canvas not found, skipping render');
            return;
        }

        const ctx = this.elements.yearlyChart.getContext('2d');

        // Destroy existing chart
        if (this.yearlyChart) {
            this.yearlyChart.destroy();
        }

        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        // Get only the months that have data (up to current month)
        const today = new Date();
        const currentMonth = today.getMonth() + 1;

        const labels = months.slice(0, currentMonth);
        const data = Object.keys(monthlyData)
            .sort((a, b) => Number(a) - Number(b))
            .slice(0, currentMonth)
            .map(key => monthlyData[key]);

        this.yearlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gastos Mensuales',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: '#6366F1',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#6366F1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Total: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            },
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            color: '#F3F4F6'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Render subscriptions by category pie chart
     */
    renderSubscriptionsCategoryChart(categoryData) {
        // Check if canvas exists (stats tab might not be loaded yet)
        if (!this.elements.subscriptionsCategoryChart) {
            console.log('[Chart] Subscriptions category chart canvas not found, skipping render');
            return;
        }

        const ctx = this.elements.subscriptionsCategoryChart.getContext('2d');

        // Destroy existing chart
        if (this.subscriptionsCategoryChart) {
            this.subscriptionsCategoryChart.destroy();
        }

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        // Check if there's data
        if (labels.length === 0 || data.every(v => v === 0)) {
            // Show empty state
            ctx.canvas.parentElement.innerHTML = `
                <div class="empty-state" style="padding: var(--spacing-2xl);">
                    <p style="color: var(--color-text-tertiary);">No hay suscripciones activas este mes</p>
                </div>
            `;
            return;
        }

        // Get colors from subscription categories
        const colors = labels.map(categoryName => {
            const subCategory = this.subscriptionCategories.find(c => c.nombre === categoryName);
            return subCategory ? subCategory.color : '#6B7280';
        });

        this.subscriptionsCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Montserrat',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render expenses vs subscriptions comparison bar chart
     */
    renderComparisonChart(comparisonData) {
        // Check if canvas exists
        if (!this.elements.comparisonChart) {
            console.log('[Chart] Comparison chart canvas not found, skipping render');
            return;
        }

        const ctx = this.elements.comparisonChart.getContext('2d');

        // Destroy existing chart
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }

        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const monthNumbers = Object.keys(comparisonData).map(Number);
        const labels = monthNumbers.map(m => months[m - 1]);

        const expensesData = monthNumbers.map(m => comparisonData[m].expenses);
        const subscriptionsData = monthNumbers.map(m => comparisonData[m].subscriptions);

        this.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Gastos',
                        data: expensesData,
                        backgroundColor: '#6366F1',
                        borderColor: '#6366F1',
                        borderWidth: 1
                    },
                    {
                        label: 'Suscripciones',
                        data: subscriptionsData,
                        backgroundColor: '#10B981',
                        borderColor: '#10B981',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Montserrat',
                                size: 12
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            },
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            color: '#F3F4F6'
                        }
                    },
                    x: {
                        stacked: false,
                        ticks: {
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Render subscriptions yearly evolution line chart
     */
    renderSubscriptionsYearlyChart(monthlyData, maxMonth) {
        // Check if canvas exists
        if (!this.elements.subscriptionsYearlyChart) {
            console.log('[Chart] Subscriptions yearly chart canvas not found, skipping render');
            return;
        }

        const ctx = this.elements.subscriptionsYearlyChart.getContext('2d');

        // Destroy existing chart
        if (this.subscriptionsYearlyChart) {
            this.subscriptionsYearlyChart.destroy();
        }

        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        // Only show months up to current month
        const labels = months.slice(0, maxMonth);
        const data = Object.keys(monthlyData)
            .sort((a, b) => Number(a) - Number(b))
            .map(key => monthlyData[key]);

        this.subscriptionsYearlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Suscripciones',
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10B981',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Suscripciones: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            },
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            color: '#F3F4F6'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Setup user menu functionality (Side Drawer)
     */
    setupUserMenu() {
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const sideDrawer = document.getElementById('sideDrawer');
        const drawerCloseBtn = document.getElementById('drawerCloseBtn');
        const drawerExportBtn = document.getElementById('drawerExportBtn');
        const drawerImportBtn = document.getElementById('drawerImportBtn');
        const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
        const importFileInput = document.getElementById('importFileInput');
        const drawerUserName = document.getElementById('drawerUserName');

        // Set user name in drawer
        const user = auth.getCurrentUser();
        drawerUserName.textContent = user.nombre;

        // Open drawer
        const openDrawer = () => {
            sideDrawer.classList.add('open');
            drawerOverlay.classList.remove('hidden');
        };

        // Close drawer
        const closeDrawer = () => {
            sideDrawer.classList.remove('open');
            drawerOverlay.classList.add('hidden');
        };

        // Toggle drawer
        menuToggleBtn.addEventListener('click', openDrawer);
        drawerCloseBtn.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);

        // Navigation items (Cuotas, Ahorros, Estadísticas)
        const navItems = document.querySelectorAll('[data-navigate]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabName = item.getAttribute('data-navigate');
                this.switchTab(tabName);
                closeDrawer();
            });
        });

        // Export data
        drawerExportBtn.addEventListener('click', async () => {
            try {
                await dataBackup.exportData();
                showSuccess('Datos exportados exitosamente');
                closeDrawer();
            } catch (error) {
                showError(error.message);
            }
        });

        // Import data
        drawerImportBtn.addEventListener('click', () => {
            importFileInput.click();
            closeDrawer();
        });

        // Handle file selection
        importFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const confirmed = await confirmDanger(
                '¿Estás seguro? Esto reemplazará TODOS tus datos actuales con los del archivo.',
                'Importar Datos'
            );

            if (!confirmed) {
                importFileInput.value = '';
                return;
            }

            try {
                await dataBackup.importData(file);
                showSuccess('Datos importados exitosamente. Recargando...');

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                showError(error.message);
                importFileInput.value = '';
            }
        });

        // Logout
        drawerLogoutBtn.addEventListener('click', () => {
            closeDrawer();
            this.handleLogout();
        });
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        const confirmed = await confirm(
            '¿Seguro que quieres cerrar sesión?',
            'Cerrar Sesión'
        );

        if (!confirmed) {
            return;
        }

        auth.logout();
        this.elements.mainApp.classList.add('hidden');
        this.showLogin();
    }

    /**
     * Register service worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.error('Service Worker registration failed:', err));
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
});
