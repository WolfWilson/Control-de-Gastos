# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Progressive Web App (PWA)** for personal expense tracking - **100% offline-first architecture**.

The app runs entirely in the browser with no backend server. All data is stored locally using IndexedDB. Mobile-first design with **cyberpunk-inspired UI** featuring glassmorphism, gradient effects, and subtle animations. Fixed light theme for consistent user experience.

**Stack**: Vanilla JavaScript ES6+ modules, CSS3 Custom Properties, HTML5, IndexedDB, Service Worker

**Language**: Spanish for UI text and user-facing content, English for code identifiers and technical documentation.

**Design Style**: Cyberpunk/futuristic with cyan-purple-pink color palette, glass-morphic components, neon glow effects, and animated gradients.

## Project Structure

```
frontend/
├── index.html              # Single Page Application entry point
├── manifest.json          # PWA manifest (icons, theme, shortcuts)
├── sw.js                  # Service Worker (cache strategies)
│
├── css/
│   ├── variables.css      # Design system (colors, spacing, typography, glassmorphism)
│   ├── base.css          # CSS reset, base styles, utility classes
│   ├── layout.css        # Layouts, containers, responsive grids
│   ├── components.css    # All UI components (cards, buttons, forms, modals, etc.)
│   ├── animations.css    # Keyframe animations and transitions
│   ├── auth-tabs.css     # Authentication tabs (login/register switcher)
│   ├── user-menu.css     # Side drawer menu and user profile styles
│   └── debug-contrast.css # Accessibility debugging (WCAG AA contrast checker)
│
└── js/
    ├── app.js            # Main application class (ExpenseApp)
    ├── db.js             # IndexedDB manager (DatabaseManager)
    ├── auth.js           # Authentication manager (AuthManager)
    ├── utils.js          # Utility functions (formatters, notifications)
    ├── toast.js          # Toast notification system (ToastManager)
    ├── confirm-dialog.js # Custom confirmation dialogs (ConfirmDialog)
    └── data-backup.js    # Export/import functionality (DataBackup)
```

**Note**: There is NO backend directory. The original FastAPI backend was completely removed and replaced with IndexedDB for offline-first functionality.

## Architecture Patterns

### Offline-First Architecture

**Client-Side Only**: All code runs in the browser
- No HTTP requests to backend servers
- No API endpoints or REST calls
- All data operations via IndexedDB
- Service Worker provides offline caching

**Data Storage**:
- **IndexedDB**: Primary storage for expenses and categories
- **LocalStorage**: Authentication data only (user name + PIN)
- **Cache API**: Static assets via Service Worker

### Module Organization

**ES6+ Modules**: All JavaScript uses native browser modules
```javascript
// Import pattern
import db from './db.js';
import auth from './auth.js';
import { formatCurrency, showError } from './utils.js';

// Export pattern
export default class MyClass { }
export const myFunction = () => { };
```

**Singleton Pattern**: Database and Auth managers are singletons
```javascript
// db.js
const db = new DatabaseManager();
export default db;

// auth.js
const auth = new AuthManager();
export default auth;
```

**Class-Based**: Main logic in ES6 classes
- `ExpenseApp` - Application controller
- `DatabaseManager` - IndexedDB operations
- `AuthManager` - Authentication logic
- `ToastManager` - UI notifications
- `ConfirmDialog` - Modal dialogs
- `DataBackup` - Import/export

### Dependency Injection

**No formal DI container**, but follows pattern:
```javascript
// app.js uses imported singletons
import db from './db.js';
import auth from './auth.js';

// Instead of instantiating directly
async loadExpenses() {
  this.expenses = await db.getRecentExpenses(10);
}
```

### Event Handling

**Event Delegation**: Used for dynamic content
```javascript
// Attach listeners to parent, filter by target
container.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'edit') {
    this.handleEdit(e.target.dataset.id);
  }
});
```

**Direct Listeners**: For static elements
```javascript
this.elements.addExpenseBtn.addEventListener('click', () => this.openModal());
```

## Naming Conventions

### Database Layer (IndexedDB)

**Object Stores** (Spanish, camelCase in code):
- `expenses` - Store name
- `categories` - Store name

**Fields** (Spanish, snake_case for consistency with original schema):
- `id` - Auto-increment primary key
- `monto` - Amount (number)
- `descripcion` - Description (string)
- `categoria_id` - Foreign key to categories
- `fecha` - Date (YYYY-MM-DD string)
- `notas` - Notes (string | null)
- `fecha_creacion` - Created timestamp (ISO 8601)
- `fecha_actualizacion` - Updated timestamp (ISO 8601 | null)

**Indexes**:
- Primary keys: Always `id`
- Foreign keys: `{entity}_id` pattern
- Date indexes: For efficient range queries

### JavaScript (English, PEP-8 style adapted to JS)

**Classes**: `PascalCase`
```javascript
class ExpenseApp { }
class DatabaseManager { }
class AuthManager { }
```

**Functions/Methods**: `camelCase` with verbs
```javascript
async createExpense(data) { }
async getMonthlySummary(year, month) { }
handleSubmit(event) { }
```

**Variables**: `camelCase`, descriptive
```javascript
const expenseData = { };
const monthlyTotal = 0;
const currentEditId = null;
```

**Constants**: `UPPER_SNAKE_CASE`
```javascript
const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;
const AUTH_KEY = 'expense_tracker_user';
```

**Private-ish members**: Prefix with `_` (convention only, not enforced)
```javascript
_initDatabase() { }  // "Private" method
```

**Type Annotations**: Use JSDoc for complex structures
```javascript
/**
 * @param {Object} expenseData
 * @param {number} expenseData.monto
 * @param {string} expenseData.descripcion
 * @param {number} expenseData.categoria_id
 * @returns {Promise<Object>}
 */
async createExpense(expenseData) { }
```

### CSS (BEM-like naming)

**Block**: Component name
```css
.expense-item { }
.summary-card { }
.modal-overlay { }
```

**Element**: Child element (double underscore)
```css
.expense-item__description { }
.summary-card__title { }
```

**Modifier**: Variant (double dash)
```css
.btn--primary { }
.toast--error { }
.modal--danger { }
```

**State classes**: Prefix with `is-` or direct
```css
.active { }
.hidden { }
.is-loading { }
```

**Utility classes**: Descriptive, single purpose
```css
.text-center { }
.mt-4 { }
.flex-between { }
```

### File Naming

- `kebab-case.js` for multi-word modules: `confirm-dialog.js`, `data-backup.js`
- `lowercase.js` for single-word modules: `app.js`, `db.js`, `auth.js`, `utils.js`, `toast.js`
- Same convention for CSS: `auth-tabs.css`, `user-menu.css`, `variables.css`

## Database Schema (IndexedDB)

### `categories` Object Store

**Purpose**: Predefined expense categories with icons and colors

```javascript
{
  id: number,              // Auto-increment primary key
  nombre: string,          // Category name (unique)
  icono: string,          // Emoji icon (🍔, 🚗, etc.)
  color: string,          // Hex color (#10B981, #3B82F6, etc.)
  activo: boolean         // Is active (always true for defaults)
}
```

**Indexes**:
- `nombre` (unique)

**Default Categories** (7 total):
1. Comida 🍔 #10B981
2. Transporte 🚗 #3B82F6
3. Servicios 💡 #F59E0B
4. Compras 🛍️ #8B5CF6
5. Entretenimiento 🎬 #EC4899
6. Salud ⚕️ #EF4444
7. Otros 📦 #6B7280

### `expenses` Object Store

**Purpose**: All expense records

```javascript
{
  id: number,                      // Auto-increment primary key
  monto: number,                   // Amount (must be > 0)
  descripcion: string,             // Description (max 255 chars)
  categoria_id: number,            // FK to categories.id
  fecha: string,                   // Date YYYY-MM-DD
  notas: string | null,            // Optional notes
  fecha_creacion: string,          // ISO 8601 timestamp
  fecha_actualizacion: string | null  // ISO 8601 timestamp or null
}
```

**Indexes**:
- `fecha` (for date range queries)
- `categoria_id` (for filtering by category)
- `fecha_creacion` (for recent expenses)

### `savings` Object Store

**Purpose**: Savings accounts tracking

```javascript
{
  id: number,                      // Auto-increment primary key
  nombre: string,                  // Savings account name
  monto: number,                   // Current amount saved
  tipo: string,                    // Type: 'efectivo', 'banco', 'inversion', 'otro'
  activo: boolean,                 // Is active
  notas: string | null,            // Optional notes
  fecha_creacion: string,          // ISO 8601 timestamp
  fecha_actualizacion: string | null  // ISO 8601 timestamp or null
}
```

**Indexes**:
- `tipo` (for filtering by type)
- `activo` (for active savings)
- `fecha_actualizacion` (for recent updates)

### `saving_movements` Object Store

**Purpose**: Track deposits and withdrawals from savings accounts

```javascript
{
  id: number,                      // Auto-increment primary key
  saving_id: number,               // FK to savings.id
  tipo_movimiento: string,         // 'deposito' or 'retiro'
  monto: number,                   // Amount of movement
  descripcion: string,             // Description
  fecha: string,                   // Date YYYY-MM-DD
  fecha_creacion: string           // ISO 8601 timestamp
}
```

**Indexes**:
- `saving_id` (for movements by saving account)
- `tipo_movimiento` (for filtering deposits/withdrawals)
- `fecha` (for date range queries)

## Development Workflow

### Local Development

**Start Development Server**:
```bash
cd frontend
python -m http.server 3000
# Or: npx serve -p 3000
# Or: Use VSCode Live Server extension
```

**Access App**:
```
http://localhost:3000
```

**DevTools Debugging**:
- **Console**: General JavaScript errors and logs
- **Application → IndexedDB**: Inspect `ExpenseTrackerDB` data
- **Application → Local Storage**: Check auth data
- **Application → Service Workers**: Manage SW lifecycle
- **Network**: Monitor resource loading (should be minimal/cached)

### Database Initialization

**Auto-initialization**: Database and tables created automatically on first run
```javascript
// db.js init() method
request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Create stores
  const expenseStore = db.createObjectStore('expenses', {
    keyPath: 'id',
    autoIncrement: true
  });

  // Create indexes
  expenseStore.createIndex('fecha', 'fecha', { unique: false });

  // Insert default categories
  // (see db.js lines 48-63)
};
```

**No migration scripts needed**: IndexedDB version is managed automatically

### Testing Strategy

**Current state**: No formal test suite (MVP phase)

**Manual testing checklist**:
- [ ] Register new user
- [ ] Login with correct/incorrect PIN
- [ ] Add new expense
- [ ] Edit existing expense
- [ ] Delete expense (with confirmation)
- [ ] Add new subscription
- [ ] Edit/delete subscription
- [ ] Add new installment
- [ ] Edit/delete installment
- [ ] Add new saving account
- [ ] Edit/delete saving account
- [ ] Filter expenses by month
- [ ] View statistics charts
- [ ] Export data (downloads JSON)
- [ ] Import data (replaces all data)
- [ ] Logout and login again
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Test all tabs (Dashboard, Gastos, Suscripciones, Cuotas, Ahorros, Estadísticas)
- [ ] Verify FAB button changes icon per tab (plus, sync, credit-card, piggy-bank)

**Future**: Consider Playwright or Cypress for E2E testing

## Key Configuration

### PWA Manifest (`manifest.json`)

```json
{
  "name": "Control de Gastos",
  "short_name": "Gastos",
  "theme_color": "#6366F1",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait-primary",
  "icons": [ /* 192x192, 512x512 */ ],
  "shortcuts": [
    {
      "name": "Agregar Gasto",
      "url": "/?action=add",
      "icons": [{ "src": "/assets/icons/add-expense-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker (`sw.js`)

**Cache Names**:
```javascript
const STATIC_CACHE = 'static-v2.0';
const DYNAMIC_CACHE = 'dynamic-v2.0';
```

**Cached URLs**:
- App shell: HTML, CSS, JS
- External fonts: Google Fonts (Montserrat)
- External libs: Chart.js, Font Awesome

**Strategies**:
- **Cache First**: Static assets (CSS, JS, fonts)
- **Network First**: Dynamic content (future API calls)
- **Stale While Revalidate**: Images and icons

**Update Process**: Increment version number to invalidate old caches

### CSS Custom Properties (`variables.css`)

**Design Tokens - Cyberpunk Theme**:
```css
:root {
  /* Cyberpunk Color Palette */
  --color-primary: #06B6D4;        /* Cyan 500 - Main accent */
  --color-primary-dark: #0891B2;   /* Cyan 600 */
  --color-primary-light: #22D3EE;  /* Cyan 400 */
  --color-secondary: #8B5CF6;      /* Purple 500 - Secondary accent */
  --color-secondary-dark: #7C3AED; /* Purple 600 */
  --color-accent: #EC4899;         /* Pink 500 - Vibrant accent */

  /* Gradient Definitions */
  --gradient-primary: linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%);
  --gradient-secondary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  --gradient-accent: linear-gradient(135deg, #22D3EE 0%, #A78BFA 50%, #F472B6 100%);

  /* Neon Glow Effects */
  --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3);
  --glow-purple: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
  --glow-pink: 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3);

  /* Text Colors */
  --color-text-primary: #0F172A;   /* Slate 900 - Main text */
  --color-text-secondary: #334155; /* Slate 700 - Secondary */
  --color-text-tertiary: #64748B;  /* Slate 500 - Tertiary */
  --color-text-muted: #94A3B8;     /* Slate 400 - Muted */

  /* Background */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F8FAFC;
  --color-bg-gradient: linear-gradient(180deg, #F8FAFC 0%, #E0F2FE 100%);

  /* Enhanced Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-bg-strong: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-shadow: 0 8px 32px 0 rgba(6, 182, 212, 0.2);
  --glass-blur: blur(12px);
  --glass-blur-strong: blur(20px);

  /* Spacing (8px scale) */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */

  /* Typography */
  --font-family: 'Montserrat', system-ui, sans-serif;
  --font-size-base: 1rem;

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
}
```

**IMPORTANT - Dark Mode**: The dark mode `@media (prefers-color-scheme: dark)` is **DISABLED** (commented out) to maintain a consistent light theme across all devices and browsers. The app uses a fixed light cyberpunk theme.

## Code Quality Standards

### JavaScript Best Practices

**Async/Await**: Prefer over Promises chains
```javascript
// Good
async loadExpenses() {
  try {
    const expenses = await db.getAllExpenses();
    this.renderExpenses(expenses);
  } catch (error) {
    showError('Error al cargar gastos');
  }
}

// Avoid
loadExpenses() {
  db.getAllExpenses()
    .then(expenses => this.renderExpenses(expenses))
    .catch(error => showError('Error al cargar gastos'));
}
```

**Error Handling**: At system boundaries (user input, DB operations)
```javascript
// Validate user input
if (!auth.validatePIN(pin)) {
  throw new Error('El PIN debe contener exactamente 4 dígitos');
}

// Handle DB errors
try {
  await db.createExpense(data);
  showSuccess('Gasto creado');
} catch (error) {
  console.error('DB error:', error);
  showError('Error al guardar');
}
```

**No Over-Engineering**:
- Don't add abstractions until needed (YAGNI)
- Don't handle errors that can't happen
- Keep functions focused and simple
- Avoid premature optimization

**Dynamic Imports**: For optional dependencies
```javascript
// utils.js - avoids circular dependencies
export const showError = (message) => {
  import('./toast.js').then(module => {
    module.default.error(message);
  });
};
```

### CSS Best Practices

**Mobile-First**: Base styles for smallest screens, enhance for larger
```css
/* Base: 320px+ */
.card {
  padding: 1rem;
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}
```

**Custom Properties**: For consistency and theming
```css
/* Use */
.btn-primary {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

/* Avoid hardcoding */
.btn-primary {
  background: #6366F1;
  padding: 16px;
}
```

**Accessibility**:
- Minimum contrast ratio 4.5:1 (WCAG AA)
- Focus states for keyboard navigation
- Respect `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance

**Minimize DOM Manipulations**: Batch updates
```javascript
// Good: Single innerHTML update
container.innerHTML = expenses.map(exp => `<div>...</div>`).join('');

// Avoid: Multiple appendChild calls in loop
expenses.forEach(exp => {
  const div = document.createElement('div');
  container.appendChild(div); // Triggers reflow each time
});
```

**Event Delegation**: For lists with many items
```javascript
// Good: Single listener on parent
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    this.handleDelete(e.target.dataset.id);
  }
});

// Avoid: Listener on each item
items.forEach(item => {
  item.addEventListener('click', () => { }); // Memory leak risk
});
```

**Lazy Loading**: Load modules when needed
```javascript
// Only load Chart.js when viewing statistics
async loadStatistics() {
  if (typeof Chart === 'undefined') {
    await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.1');
  }
  this.renderCharts();
}
```

## User Experience Patterns

### Notifications

**Toast for Info**: Non-blocking, auto-dismiss
```javascript
showSuccess('Gasto creado exitosamente');
showError('Error al guardar');
showWarning('PIN incorrecto');
```

**Dialogs for Actions**: Requires user decision
```javascript
const confirmed = await confirm('¿Cerrar sesión?', 'Confirmar');
if (confirmed) {
  auth.logout();
}

const confirmed = await confirmDanger(
  '¿Eliminar este gasto?',
  'Eliminar Gasto'
);
```

### Form Validation

**HTML5 First**: Use native validation
```html
<input type="number" min="0.01" step="0.01" required>
<input type="date" required>
<input type="password" pattern="\d{4}" maxlength="4" required>
```

**JavaScript Enhancement**: For complex rules
```javascript
if (pin !== confirmPin) {
  showError('Los PINs no coinciden');
  return;
}
```

### Loading States

**Skeleton Screens**: For initial load
```html
<div class="loading">
  <i class="fas fa-spinner fa-spin"></i> Cargando gastos...
</div>
```

**Empty States**: When no data
```html
<div class="empty-state">
  <div class="empty-state-icon"><i class="fas fa-receipt"></i></div>
  <p>No hay gastos registrados</p>
</div>
```

## Common Tasks

### Adding a New Feature

1. **Plan**: Determine if it needs UI, DB changes, or both
2. **Database**: Update `db.js` if new queries needed
3. **UI**: Add HTML structure to `index.html`
4. **Styles**: Add CSS to appropriate file (components, layout, etc.)
5. **Logic**: Update `app.js` with event handlers and methods
6. **Test**: Manual testing checklist
7. **Update Docs**: Update README.md and CLAUDE.md

### Modifying the Database Schema

**⚠️ Warning**: Changing schema requires version bump and migration

```javascript
// db.js
const DB_VERSION = 2; // Increment version

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;

  if (oldVersion < 2) {
    // Migration from v1 to v2
    const transaction = event.target.transaction;
    const expenseStore = transaction.objectStore('expenses');

    // Add new field (example)
    // Note: IndexedDB doesn't enforce schema, just add to objects
  }
};
```

**Better approach for MVP**: Use `notas` field for extensibility

### Debugging IndexedDB

**Chrome DevTools**:
1. F12 → Application tab
2. IndexedDB → ExpenseTrackerDB
3. Expand stores (expenses, categories)
4. Double-click to edit values
5. Right-click to delete entries

**Console queries**:
```javascript
// Get reference to DB (in console)
const request = indexedDB.open('ExpenseTrackerDB');
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('expenses', 'readonly');
  const store = tx.objectStore('expenses');
  const req = store.getAll();
  req.onsuccess = () => console.table(req.result);
};
```

## Gotchas and Common Issues

### IndexedDB Quirks

**Transactions are auto-commit**: Can't keep reference
```javascript
// Bad
const tx = db.transaction('expenses', 'readwrite');
await someAsyncOperation(); // Transaction may close!
const store = tx.objectStore('expenses'); // May fail
```

**Promises and IndexedDB**: Wrap requests
```javascript
// Good pattern
return new Promise((resolve, reject) => {
  const request = store.get(id);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
```

### Service Worker Caching

**Old cache persists**: Must increment version
```javascript
// sw.js - Change this to force update
const STATIC_CACHE = 'static-v2.1'; // Was v2.0
```

**Update not applying**: Hard reload
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### CSS Specificity

**Utility classes may be overridden**: Use `!important` sparingly or increase specificity
```css
/* If .hidden is not working */
.hidden {
  display: none !important;
}

/* Or increase specificity */
.modal-overlay.hidden {
  display: none;
}
```

### Date Handling

**Timezone issues**: Always use YYYY-MM-DD strings, avoid `new Date()`
```javascript
// Good
const dateString = '2026-01-15';
const date = new Date(dateString + 'T00:00:00'); // Explicit time

// Avoid
const date = new Date('2026-01-15'); // May parse as UTC or local
```

## Spanish-English Hybrid Strategy

### When to Use Spanish

- **Database field names**: `monto`, `descripcion`, `fecha_creacion`
- **UI text**: All user-facing strings
- **Comments**: When explaining business logic
- **Logs**: User-facing error messages

### When to Use English

- **Code identifiers**: `class ExpenseApp`, `function handleSubmit`
- **Technical comments**: Architecture, patterns, TODOs
- **Git commits**: English convention for broader audience
- **Documentation**: Technical docs (like this file)

### Example

```javascript
/**
 * Obtiene el resumen mensual de gastos por categoría
 * Gets monthly expense summary grouped by category
 *
 * @param {number} year - Año (year)
 * @param {number} month - Mes 1-12 (month)
 * @returns {Promise<Object>} Resumen con total y categorías
 */
async getMonthlySummary(year, month) {
  const expenses = await this.getExpensesByMonth(year, month);
  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);

  // Agrupar por categoría (group by category)
  const porCategoria = {};
  expenses.forEach(expense => {
    const categoryName = category ? category.nombre : 'Sin categoría';
    porCategoria[categoryName] = (porCategoria[categoryName] || 0) + parseFloat(expense.monto);
  });

  return { year, month, total, count: expenses.length, porCategoria };
}
```

This bilingual approach maintains technical clarity while respecting the user's language and original requirements.

---

## Design System & Critical Fixes

### Cyberpunk Visual Design

The app features a **cyberpunk/futuristic aesthetic** with the following characteristics:

**Color Scheme**:
- **Primary**: Cyan (#06B6D4) - Main interactive elements
- **Secondary**: Purple (#8B5CF6) - Accents and secondary actions
- **Accent**: Pink (#EC4899) - Highlights and special elements
- **Gradients**: Smooth transitions between cyan → purple → pink

**Visual Effects**:
- **Glassmorphism**: Translucent backgrounds with backdrop blur on cards, modals, and navigation
- **Neon Glows**: Subtle glow effects on interactive elements (buttons, FAB, active tabs)
- **Animated Gradients**: Slow-moving radial gradients in the background
- **Subtle Animations**: Hover effects, shimmer on FAB button, smooth transitions

**Key Components Styling**:
- **Summary Cards**: Glass-morphic with gradient overlay on hover, animated entrance
- **FAB (Floating Action Button)**: Gradient background with pulsing glow effect and rotating shimmer
- **Buttons**: Primary buttons use gradient backgrounds with sweep light effect on hover
- **Forms**: Glass-morphic inputs with cyan glow on focus
- **Header**: Translucent glass background with gradient text logo
- **Tabs**: Glass background with animated gradient underline on active tab
- **Auth Screen**: Full gradient background with floating particle effects

### CRITICAL: Input Text Visibility Fix

**Problem**: Input and textarea text was invisible (white text on white background) due to browser autofill styles overriding CSS variables.

**Solution Applied** (in `base.css` and `components.css`):

```css
/* MUST use hardcoded colors, not CSS variables, for autofill compatibility */
input, textarea, select {
    color: #0F172A !important;              /* Dark text */
    background-color: #FFFFFF !important;   /* White background */
}

/* Critical: Override browser autofill styles */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
select:-webkit-autofill {
    -webkit-text-fill-color: #0F172A !important;
    -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
    box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
    background-color: #FFFFFF !important;
    transition: background-color 5000s ease-in-out 0s;
}
```

**Why This Works**:
- Browser autofill has very high CSS specificity
- The `box-shadow inset` trick forces white background even with autofill
- `-webkit-text-fill-color` overrides the browser's default text color
- Hardcoded hex colors (#0F172A, #FFFFFF) instead of CSS variables work reliably across all browsers

**DO NOT**:
- ❌ Remove `!important` flags - they are necessary
- ❌ Replace hardcoded colors with CSS variables - browsers don't respect variables in autofill pseudo-selectors
- ❌ Remove the box-shadow hack - it's the only way to override autofill background

### Animation Guidelines

**Subtle Animations**: All animations should be subtle and non-intrusive:
- ✅ Background gradient shifts (20s duration)
- ✅ FAB pulse and shimmer (3s+ durations)
- ✅ Hover effects on cards
- ❌ **AVOID** shimmer effects on static icons (removed as it was too distracting)

### Contextual FAB Button

The Floating Action Button (FAB) changes its **icon and action** based on the current active tab:

| Tab | Icon | Action | Method Called |
|-----|------|--------|---------------|
| Dashboard | `fa-plus` | Add expense | `openExpenseModal()` |
| Gastos (Expenses) | `fa-plus` | Add expense | `openExpenseModal()` |
| Suscripciones | `fa-sync-alt` | Add subscription | `openSubscriptionModal()` |
| Cuotas (Installments) | `fa-credit-card` | Add installment | `openInstallmentModal()` |
| Ahorros (Savings) | `fa-piggy-bank` | Add saving | `openSavingModal()` |
| Estadísticas | `fa-plus` | Add expense | `openExpenseModal()` |

**Implementation** (in `app.js`):
- `updateFABIcon()`: Updates icon when switching tabs
- `handleFABClick()`: Routes to correct modal based on `this.currentTab`

### Browser Compatibility Notes

**Tested on**: Chrome, Firefox, Edge, Safari
**Known Issues**: None currently
**Performance**: All animations use CSS transforms and opacity for GPU acceleration

---

**Last Updated**: January 2026
**Project Version**: 2.2.0 (Cyberpunk Design + Input Visibility Fix)
**Architecture**: 100% Frontend Offline-First PWA
