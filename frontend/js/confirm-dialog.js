/**
 * Confirm Dialog - Elegant confirmation modals
 * Replaces native browser confirm() with a beautiful custom modal
 */

class ConfirmDialog {
    constructor() {
        this.overlay = null;
        this.dialog = null;
        this.resolveCallback = null;
        this.init();
    }

    /**
     * Initialize the confirm dialog structure
     */
    init() {
        // Create overlay and dialog if they don't exist
        if (!document.getElementById('confirm-overlay')) {
            this.createDialogElements();
        } else {
            this.overlay = document.getElementById('confirm-overlay');
            this.dialog = document.getElementById('confirm-dialog');
        }
    }

    /**
     * Create dialog DOM elements
     */
    createDialogElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'confirm-overlay';
        this.overlay.className = 'confirm-overlay hidden';

        // Create dialog
        this.dialog = document.createElement('div');
        this.dialog.id = 'confirm-dialog';
        this.dialog.className = 'confirm-dialog';

        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide(false);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!this.overlay.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hide(false);
                } else if (e.key === 'Enter') {
                    this.hide(true);
                }
            }
        });
    }

    /**
     * Show confirmation dialog
     * @param {Object} options - Configuration options
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
     */
    show(options = {}) {
        const {
            title = '¿Estás seguro?',
            message = '¿Deseas continuar con esta acción?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning', // 'danger', 'warning', 'info'
            icon = null
        } = options;

        return new Promise((resolve) => {
            this.resolveCallback = resolve;

            // Get icon
            const dialogIcon = icon || this.getIcon(type);

            // Build dialog content
            this.dialog.innerHTML = `
                <div class="confirm-header">
                    <div class="confirm-icon confirm-icon-${type}">
                        <i class="${dialogIcon}"></i>
                    </div>
                    <h3 class="confirm-title">${title}</h3>
                </div>
                <div class="confirm-body">
                    <p class="confirm-message">${message}</p>
                </div>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" id="confirm-cancel">
                        ${cancelText}
                    </button>
                    <button class="btn btn-${type === 'danger' ? 'danger' : 'primary'}" id="confirm-ok">
                        ${confirmText}
                    </button>
                </div>
            `;

            // Add event listeners
            document.getElementById('confirm-cancel').addEventListener('click', () => {
                this.hide(false);
            });

            document.getElementById('confirm-ok').addEventListener('click', () => {
                this.hide(true);
            });

            // Show dialog
            this.overlay.classList.remove('hidden');
            this.dialog.classList.add('animate-scale-in');

            // Focus on confirm button
            setTimeout(() => {
                document.getElementById('confirm-ok').focus();
            }, 100);
        });
    }

    /**
     * Hide dialog
     */
    hide(confirmed) {
        this.dialog.classList.remove('animate-scale-in');
        this.dialog.classList.add('animate-scale-out');

        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.dialog.classList.remove('animate-scale-out');

            if (this.resolveCallback) {
                this.resolveCallback(confirmed);
                this.resolveCallback = null;
            }
        }, 200);
    }

    /**
     * Get icon for dialog type
     */
    getIcon(type) {
        const icons = {
            danger: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle'
        };
        return icons[type] || icons.warning;
    }

    /**
     * Shorthand methods
     */
    async danger(message, title = '¡Cuidado!') {
        return this.show({
            title,
            message,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });
    }

    async warning(message, title = 'Advertencia') {
        return this.show({
            title,
            message,
            type: 'warning'
        });
    }

    async info(message, title = 'Información') {
        return this.show({
            title,
            message,
            type: 'info'
        });
    }
}

// Create singleton instance
const confirmDialog = new ConfirmDialog();

// Export both the instance and a helper function
export default confirmDialog;

// Helper function to replace native confirm()
export const confirm = async (message, title) => {
    return confirmDialog.show({ message, title });
};
