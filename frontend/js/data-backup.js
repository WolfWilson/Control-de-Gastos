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
            const categories = await db.getAllCategories();

            // Create backup object
            const backup = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                user: user,
                expenses: expenses,
                categories: categories
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

            // Validate backup structure
            if (!backup.version || !backup.user || !backup.expenses || !backup.categories) {
                throw new Error('Archivo de respaldo inválido');
            }

            // Clear existing data
            await db.clearAllData();

            // Restore user
            localStorage.setItem('user', JSON.stringify(backup.user));

            // Restore categories
            for (const category of backup.categories) {
                await db.createCategory(category);
            }

            // Restore expenses
            for (const expense of backup.expenses) {
                await db.createExpense(expense);
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
