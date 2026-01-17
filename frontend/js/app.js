import { api } from './api.js';
import { formatCurrency, formatDate, getTodayDate, showError, showSuccess, confirm } from './utils.js';

class ExpenseApp {
    constructor() {
        this.expenses = [];
        this.categories = [];
        this.modal = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupElements();
        this.setupEventListeners();
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
            addExpenseBtn: document.getElementById('addExpenseBtn'),
            modal: document.getElementById('addExpenseModal'),
            cancelBtn: document.getElementById('cancelBtn'),
            expenseForm: document.getElementById('expenseForm'),
            expensesList: document.getElementById('expensesList'),
            monthlyTotal: document.getElementById('monthlyTotal'),
            categoriaSelect: document.getElementById('categoria_id'),
            fechaInput: document.getElementById('fecha')
        };

        // Set default date to today
        this.elements.fechaInput.value = getTodayDate();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Open modal
        this.elements.addExpenseBtn.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        this.elements.cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on overlay click
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });

        // Form submission
        this.elements.expenseForm.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    }

    /**
     * Open add expense modal
     */
    openModal() {
        this.elements.modal.classList.remove('hidden');
        this.elements.expenseForm.reset();
        this.elements.fechaInput.value = getTodayDate();
    }

    /**
     * Close add expense modal
     */
    closeModal() {
        this.elements.modal.classList.add('hidden');
        this.elements.expenseForm.reset();
    }

    /**
     * Load categories from API
     */
    async loadCategories() {
        try {
            this.categories = await api.getCategories();
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

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Selecciona una categoría</option>';

        // Add category options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icono} ${category.nombre}`;
            select.appendChild(option);
        });
    }

    /**
     * Load dashboard data (monthly summary)
     */
    async loadDashboard() {
        try {
            const summary = await api.getMonthlySummary();
            this.elements.monthlyTotal.textContent = formatCurrency(summary.total);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.elements.monthlyTotal.textContent = formatCurrency(0);
        }
    }

    /**
     * Load expenses from API
     */
    async loadExpenses() {
        try {
            this.expenses = await api.getExpenses({ limit: 10 });
            this.renderExpenses();
        } catch (error) {
            console.error('Error loading expenses:', error);
            showError('Error al cargar los gastos');
            this.renderEmptyState();
        }
    }

    /**
     * Render expenses list
     */
    renderExpenses() {
        const container = this.elements.expensesList;

        if (this.expenses.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = '';

        this.expenses.forEach(expense => {
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

        item.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${expense.descripcion}</div>
                <div class="expense-meta">
                    <span class="expense-category">
                        ${category ? category.icono : '📦'} ${category ? category.nombre : 'Sin categoría'}
                    </span>
                    <span>${formatDate(expense.fecha)}</span>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(expense.monto)}</div>
            <div class="expense-actions">
                <button class="btn btn-danger btn-sm" data-expense-id="${expense.id}" title="Eliminar">
                    🗑️
                </button>
            </div>
        `;

        // Add delete handler
        const deleteBtn = item.querySelector('[data-expense-id]');
        deleteBtn.addEventListener('click', () => {
            this.handleDelete(expense.id);
        });

        return item;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.elements.expensesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No hay gastos registrados</p>
                <p style="font-size: var(--font-size-sm);">Haz clic en el botón + para agregar tu primer gasto</p>
            </div>
        `;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.elements.expenseForm);
        const expenseData = {
            monto: parseFloat(formData.get('monto')),
            descripcion: formData.get('descripcion'),
            categoria_id: parseInt(formData.get('categoria_id')),
            fecha: formData.get('fecha'),
            notas: formData.get('notas') || null
        };

        try {
            await api.createExpense(expenseData);
            showSuccess('Gasto creado exitosamente');
            this.closeModal();
            await this.loadDashboard();
            await this.loadExpenses();
        } catch (error) {
            console.error('Error creating expense:', error);
            showError(error.message || 'Error al crear el gasto');
        }
    }

    /**
     * Handle expense deletion
     */
    async handleDelete(expenseId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            return;
        }

        try {
            await api.deleteExpense(expenseId);
            showSuccess('Gasto eliminado exitosamente');
            await this.loadDashboard();
            await this.loadExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            showError('Error al eliminar el gasto');
        }
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
