/**
 * Data Backup System - Export/Import functionality
 * Allows users to backup and restore all app data
 */

import db from './db.js';
import auth from './auth.js';

class DataBackup {
    /**
     * Export all data to JSON file
     */
    async exportData() {
        try {
            // Get all data
            const user = auth.getCurrentUser();
            const expenses = await db.getAllExpenses();
            const expenseCategories = await db.getExpenseCategories();
            const subscriptions = await db.getAllSubscriptions();
            const subscriptionCategories = await db.getSubscriptionCategories();
            const installments = await db.getAllInstallments();
            const installmentCategories = await db.getInstallmentCategories();

            // Create backup object
            const backup = {
                version: '3.0',
                exportDate: new Date().toISOString(),
                user: user,
                expenses: expenses,
                expenseCategories: expenseCategories,
                subscriptions: subscriptions,
                subscriptionCategories: subscriptionCategories,
                installments: installments,
                installmentCategories: installmentCategories
            };

            // Convert to JSON
            const jsonString = JSON.stringify(backup, null, 2);

            // Create download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `control-gastos-backup-${new Date().toISOString().split('T')[0]}.json`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Error al exportar datos');
        }
    }

    /**
     * Import data from JSON file
     * @param {File} file - The JSON file to import
     */
    async importData(file) {
        try {
            // Read file
            const text = await file.text();
            const backup = JSON.parse(text);

            // Validate backup structure (support both old and new versions)
            if (!backup.version || !backup.user) {
                throw new Error('Archivo de respaldo inválido');
            }

            // Clear existing data
            await db.clearAllData();

            // Restore user
            localStorage.setItem('user', JSON.stringify(backup.user));

            // Restore expenses (support both old 'categories' and new 'expenseCategories')
            if (backup.expenses && backup.expenses.length > 0) {
                for (const expense of backup.expenses) {
                    await db.createExpense(expense);
                }
            }

            // Restore subscriptions (v2.0+)
            if (backup.subscriptions && backup.subscriptions.length > 0) {
                for (const subscription of backup.subscriptions) {
                    await db.createSubscription(subscription);
                }
            }

            // Restore installments (v3.0+)
            if (backup.installments && backup.installments.length > 0) {
                for (const installment of backup.installments) {
                    // Don't use createInstallment as it auto-creates payments
                    // Just restore the installment record directly
                    const transaction = db.db.transaction(['installments'], 'readwrite');
                    const store = transaction.objectStore('installments');
                    await new Promise((resolve, reject) => {
                        const request = store.add(installment);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Error al importar datos: ' + error.message);
        }
    }
}

// Create singleton instance
const dataBackup = new DataBackup();

export default dataBackup;
