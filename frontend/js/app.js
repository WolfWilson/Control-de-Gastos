import db from './db.js';
import auth from './auth.js';
import dataBackup from './data-backup.js';
import { formatCurrency, formatDate, getTodayDate, showError, showSuccess, confirm, confirmDanger } from './utils.js';

class ExpenseApp {
    constructor() {
        this.expenses = [];
        this.categories = [];
        this.currentEditId = null;
        this.categoryChart = null;
        this.yearlyChart = null;
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

        // Hide login, show register (only if loginForm exists)
        if (loginForm) {
            loginForm.classList.remove('active');
        }
        registerForm.classList.add('active');

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

        // Hide register, show login (only if registerForm exists)
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
            expensesTab: document.getElementById('expensesTab'),
            statsTab: document.getElementById('statsTab'),

            // Dashboard
            weeklyTotal: document.getElementById('weeklyTotal'),
            monthlyTotal: document.getElementById('monthlyTotal'),
            yearlyTotal: document.getElementById('yearlyTotal'),
            expensesList: document.getElementById('expensesList'),

            // Expenses tab
            allExpensesList: document.getElementById('allExpensesList'),
            monthFilter: document.getElementById('monthFilter'),

            // Modal
            modal: document.getElementById('expenseModal'),
            modalTitle: document.getElementById('modalTitle'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            expenseForm: document.getElementById('expenseForm'),
            addExpenseBtn: document.getElementById('addExpenseBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            saveExpenseBtn: document.getElementById('saveExpenseBtn'),

            // Form fields
            expenseId: document.getElementById('expenseId'),
            monto: document.getElementById('monto'),
            descripcion: document.getElementById('descripcion'),
            categoriaSelect: document.getElementById('categoria_id'),
            fechaInput: document.getElementById('fecha'),
            notasInput: document.getElementById('notas'),

            // Charts
            categoryChart: document.getElementById('categoryChart'),
            yearlyChart: document.getElementById('yearlyChart')
        };

        // Set default date to today
        this.elements.fechaInput.value = getTodayDate();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Open modal for new expense
        this.elements.addExpenseBtn.addEventListener('click', () => this.openModal());

        // Close modal
        this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.elements.cancelBtn.addEventListener('click', () => this.closeModal());

        // Close modal on overlay click
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });

        // Form submission
        this.elements.expenseForm.addEventListener('submit', (e) => this.handleSubmit(e));

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

        // Load tab-specific data
        if (tabName === 'expenses') {
            await this.loadAllExpenses();
            this.populateMonthFilter();
        } else if (tabName === 'stats') {
            await this.loadStatistics();
        }
    }

    /**
     * Load categories from database
     */
    async loadCategories() {
        try {
            this.categories = await db.getActiveCategories();
            this.renderCategoriesSelect();
        } catch (error) {
            console.error('Error loading categories:', error);
            showError('Error al cargar las categorías');
        }
    }

    /**
     * Render categories in select dropdown
     */
    renderCategoriesSelect() {
        const select = this.elements.categoriaSelect;
        select.innerHTML = '<option value="">Selecciona una categoría</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icono} ${category.nombre}`;
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

            // Weekly summary (last 7 days)
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - 7);
            const weeklySummary = await db.getWeeklySummary(weekStart, today);
            this.elements.weeklyTotal.textContent = formatCurrency(weeklySummary.total);

            // Monthly summary
            const monthlySummary = await db.getMonthlySummary(currentYear, currentMonth);
            this.elements.monthlyTotal.textContent = formatCurrency(monthlySummary.total);

            // Yearly summary
            const yearlySummary = await db.getYearlySummary(currentYear);
            this.elements.yearlyTotal.textContent = formatCurrency(yearlySummary.total);

            // Recent expenses
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
            this.renderEmptyState(this.elements.expensesList);
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
            this.renderEmptyState(this.elements.allExpensesList);
        }
    }

    /**
     * Render expenses list
     */
    renderExpenses(container, expenses) {
        if (expenses.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        container.innerHTML = '';

        expenses.forEach(expense => {
            const category = this.categories.find(c => c.id === expense.categoria_id);
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
            this.openModal(expense);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDelete(expense.id);
        });

        return item;
    }

    /**
     * Render empty state
     */
    renderEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-receipt"></i></div>
                <p>No hay gastos registrados</p>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-lighter);">
                    Haz clic en el botón + para agregar tu primer gasto
                </p>
            </div>
        `;
    }

    /**
     * Open modal for add/edit expense
     */
    openModal(expense = null) {
        this.currentEditId = expense ? expense.id : null;

        if (expense) {
            // Edit mode
            this.elements.modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Gasto';
            this.elements.expenseId.value = expense.id;
            this.elements.monto.value = expense.monto;
            this.elements.descripcion.value = expense.descripcion;
            this.elements.categoriaSelect.value = expense.categoria_id;
            this.elements.fechaInput.value = expense.fecha;
            this.elements.notasInput.value = expense.notas || '';
        } else {
            // Create mode
            this.elements.modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo Gasto';
            this.elements.expenseForm.reset();
            this.elements.fechaInput.value = getTodayDate();
        }

        this.elements.modal.classList.remove('hidden');
    }

    /**
     * Close modal
     */
    closeModal() {
        this.elements.modal.classList.add('hidden');
        this.elements.expenseForm.reset();
        this.currentEditId = null;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        const expenseData = {
            monto: parseFloat(this.elements.monto.value),
            descripcion: this.elements.descripcion.value.trim(),
            categoria_id: parseInt(this.elements.categoriaSelect.value),
            fecha: this.elements.fechaInput.value,
            notas: this.elements.notasInput.value.trim() || null
        };

        try {
            if (this.currentEditId) {
                // Update expense
                await db.updateExpense(this.currentEditId, expenseData);
                showSuccess('Gasto actualizado exitosamente');
            } else {
                // Create expense
                await db.createExpense(expenseData);
                showSuccess('Gasto creado exitosamente');
            }

            this.closeModal();
            await this.loadDashboard();

            // Refresh current tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                await this.switchTab(activeTab.dataset.tab);
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            showError('Error al guardar el gasto');
        }
    }

    /**
     * Handle expense deletion
     */
    async handleDelete(expenseId) {
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

            // Refresh current tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                await this.switchTab(activeTab.dataset.tab);
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            showError('Error al eliminar el gasto');
        }
    }

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
            // Monthly summary by category
            const monthlySummary = await db.getMonthlySummary(currentYear, currentMonth);
            this.renderCategoryChart(monthlySummary.porCategoria);

            // Yearly summary
            const yearlySummary = await db.getYearlySummary(currentYear);
            this.renderYearlyChart(yearlySummary.byMonth);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    /**
     * Render category pie chart
     */
    renderCategoryChart(categoryData) {
        const ctx = this.elements.categoryChart.getContext('2d');

        // Destroy existing chart
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = labels.map(categoryName => {
            const category = this.categories.find(c => c.nombre === categoryName);
            return category ? category.color : '#6B7280';
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
     * Render yearly line chart
     */
    renderYearlyChart(monthlyData) {
        const ctx = this.elements.yearlyChart.getContext('2d');

        // Destroy existing chart
        if (this.yearlyChart) {
            this.yearlyChart.destroy();
        }

        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const data = Object.values(monthlyData);

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
