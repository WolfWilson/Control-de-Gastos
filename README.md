# 💰 Control de Gastos - PWA Offline

Progressive Web App **completamente offline** para control de gastos personales con autenticación simple, gráficos interactivos, exportación de datos y diseño moderno con alta accesibilidad.

## ✨ Características

### Funcionalidades Principales
- ✅ **100% Offline** - Funciona sin conexión a internet usando IndexedDB
- ✅ **Autenticación Simple** - Nombre + PIN de 4 dígitos para proteger tus datos
- ✅ **CRUD Completo** - Crear, leer, editar y eliminar gastos
- ✅ **Categorías Predefinidas** - 7 categorías con iconos emoji y colores personalizados
- ✅ **Resúmenes Múltiples** - Semanal, mensual y anual
- ✅ **Gráficos Interactivos** - Visualización con Chart.js (dona y línea)
- ✅ **Exportar/Importar Datos** - Respaldo completo en formato JSON
- ✅ **Diseño Moderno** - UI mejorada con Font Awesome y Montserrat
- ✅ **Accesibilidad WCAG AA** - Contraste mejorado y navegación por teclado
- ✅ **PWA Instalable** - Instálala como app nativa en cualquier dispositivo

### Interfaz de Usuario
- 🎨 **Diseño Moderno con Glassmorphism** - Efectos de cristal esmerilado y sombras suaves
- 📱 **Mobile-First Responsive** - Optimizado para dispositivos desde 320px
- 🎭 **Animaciones Fluidas** - Transiciones y micro-interacciones elegantes
- 🎯 **Navegación por Pestañas** - Dashboard, Gastos y Estadísticas
- 🍔 **Side Drawer Menu** - Menú lateral con perfil de usuario y opciones
- 🔔 **Toast Notifications** - Notificaciones elegantes no intrusivas
- 💬 **Diálogos de Confirmación** - Modales personalizados para acciones críticas
- 🎨 **Paleta de Colores Coherente** - Sistema de diseño con CSS Custom Properties

### Experiencia de Usuario
- ✏️ **Edición In-Place** - Modifica gastos existentes fácilmente
- 🔍 **Filtros Inteligentes** - Filtra gastos por mes específico
- 📊 **Dashboard Informativo** - Vista rápida de resúmenes y últimos gastos
- 🔐 **Login/Registro con Tabs** - Interfaz unificada para autenticación
- 🚪 **Logout Seguro** - Cierra sesión sin perder datos
- 💾 **Backup/Restore** - Exporta e importa todos tus datos
- ⚠️ **Confirmaciones de Seguridad** - Diálogos de confirmación para eliminaciones

## 🛠️ Stack Tecnológico

**Frontend (100% offline)**:
- HTML5 Semántico
- CSS3 con Custom Properties y Glassmorphism
- JavaScript Vanilla ES6+ con módulos
- IndexedDB para almacenamiento local persistente
- Chart.js 4.4.1 para gráficos interactivos
- Font Awesome 6.5.1 para iconos vectoriales
- Google Fonts - Montserrat (300, 400, 500, 600, 700)
- Service Worker con estrategias de cache avanzadas

**Herramientas de Desarrollo**:
- VSCode
- Live Server o `python -m http.server`
- Chrome DevTools (Application tab para IndexedDB)

## 📁 Arquitectura del Proyecto

```
frontend/
├── index.html                  # SPA con auth screens, tabs y modales
├── manifest.json              # PWA manifest con shortcuts
├── sw.js                      # Service Worker con cache strategies
│
├── css/
│   ├── variables.css          # Design system (colores, espaciado, tipografía)
│   ├── base.css              # Reset, estilos base y utilidades
│   ├── layout.css            # Layouts, containers y grids
│   ├── components.css        # Todos los componentes UI
│   ├── animations.css        # Keyframes y transiciones
│   ├── auth-tabs.css         # Estilos para tabs de login/registro
│   ├── user-menu.css         # Side drawer y menú de usuario
│   └── debug-contrast.css    # Debugging de accesibilidad (WCAG AA)
│
└── js/
    ├── app.js                # Aplicación principal (ExpenseApp class)
    ├── db.js                 # IndexedDB manager (DatabaseManager class)
    ├── auth.js               # Autenticación (AuthManager class)
    ├── utils.js              # Utilidades (formateo, notificaciones)
    ├── toast.js              # Sistema de notificaciones toast
    ├── confirm-dialog.js     # Diálogos de confirmación personalizados
    └── data-backup.js        # Exportación/importación de datos
```

## 🚀 Cómo Usar

### Instalación y Ejecución

1. **Clonar el repositorio**:
```bash
git clone <url-del-repo>
cd "Control de Gastos"
```

2. **Servir la aplicación**:

**Opción 1: Python** (Recomendado)
```bash
cd frontend
python -m http.server 3000
```

**Opción 2: Live Server (VSCode)**
- Instala la extensión "Live Server"
- Click derecho en `frontend/index.html` → "Open with Live Server"

**Opción 3: Node.js**
```bash
cd frontend
npx serve -p 3000
```

3. **Abrir en el navegador**:
```
http://localhost:3000
```

### Primer Uso

1. **Registro**: Al abrir la app por primera vez:
   - Ingresa tu nombre (se usará para personalizar la UI)
   - Crea un PIN de 4 dígitos
   - Confirma el PIN
   - Click en "Crear Cuenta"

2. **Login Subsecuente**:
   - La app te saludará por tu nombre
   - Solo necesitarás ingresar tu PIN de 4 dígitos
   - Usa las tabs para cambiar entre Login y Registro

3. **Agregar Primer Gasto**:
   - Click en el botón flotante `+` (esquina inferior derecha)
   - Completa el formulario
   - Click en "Guardar"

### Funcionalidades Detalladas

#### Dashboard
- **Resumen Semanal**: Total de gastos de los últimos 7 días
- **Resumen Mensual**: Total del mes actual completo
- **Resumen Anual**: Total del año en curso
- **Últimos Gastos**: Lista de los 10 gastos más recientes con acciones rápidas

#### Pestaña Gastos
- Ver **todos** los gastos registrados en orden cronológico inverso
- **Filtrar por mes** específico usando el selector
- **Editar** cualquier gasto (click en ícono de lápiz)
- **Eliminar** gastos con confirmación de seguridad (click en ícono de basura)

#### Pestaña Estadísticas
- **Gráfico de Dona**: Distribución porcentual de gastos por categoría (mes actual)
  - Colores correspondientes a cada categoría
  - Tooltips con montos formateados
- **Gráfico de Línea**: Evolución mensual de gastos durante el año
  - Visualiza tendencias y patrones
  - Área rellena para mejor legibilidad

#### Gestión de Gastos
- **Crear**:
  1. Click en botón flotante `+`
  2. Completar formulario (monto, descripción, categoría, fecha, notas)
  3. Click en "Guardar"
  4. Ver notificación de éxito

- **Editar**:
  1. Click en ícono de lápiz en cualquier gasto
  2. Modal se abre con datos precargados
  3. Modificar campos necesarios
  4. Click en "Guardar"

- **Eliminar**:
  1. Click en ícono de basura
  2. Confirmar en diálogo de seguridad
  3. Gasto eliminado permanentemente

#### Menú de Usuario (Side Drawer)
Accede al menú hamburguesa (☰) en el header para:

- **Exportar Datos**:
  - Descarga archivo JSON con todos tus gastos y categorías
  - Nombre: `gastos_backup_YYYYMMDD_HHMMSS.json`
  - Útil para respaldo o transferencia entre dispositivos

- **Importar Datos**:
  - Selecciona archivo JSON previamente exportado
  - **⚠️ ADVERTENCIA**: Reemplaza TODOS los datos actuales
  - Confirmación de seguridad requerida
  - Recarga automática tras importación exitosa

- **Cerrar Sesión**:
  - Logout sin eliminar datos locales
  - Requiere confirmación
  - Regresa a pantalla de login

## 🗄️ Almacenamiento de Datos

### IndexedDB (Base de Datos Principal)

**Base de Datos**: `ExpenseTrackerDB` v1

**Object Stores**:

1. **expenses** - Almacena todos los gastos
   ```javascript
   {
     id: number (autoIncrement),
     monto: number,
     descripcion: string,
     categoria_id: number,
     fecha: string (YYYY-MM-DD),
     notas: string | null,
     fecha_creacion: string (ISO 8601),
     fecha_actualizacion: string | null (ISO 8601)
   }
   ```
   - **Índices**: `fecha`, `categoria_id`, `fecha_creacion`

2. **categories** - Categorías predefinidas
   ```javascript
   {
     id: number (autoIncrement),
     nombre: string,
     icono: string (emoji),
     color: string (hex),
     activo: boolean
   }
   ```
   - **Índice único**: `nombre`

**Categorías Incluidas**:
| Nombre | Emoji | Color |
|--------|-------|-------|
| Comida | 🍔 | #10B981 (Green) |
| Transporte | 🚗 | #3B82F6 (Blue) |
| Servicios | 💡 | #F59E0B (Orange) |
| Compras | 🛍️ | #8B5CF6 (Purple) |
| Entretenimiento | 🎬 | #EC4899 (Pink) |
| Salud | ⚕️ | #EF4444 (Red) |
| Otros | 📦 | #6B7280 (Gray) |

### LocalStorage (Autenticación)

Se usa **únicamente** para almacenar datos de autenticación:
```javascript
{
  nombre: string,
  pin: string (4 dígitos),
  createdAt: string (ISO 8601)
}
```

**Nota de Seguridad**:
- El PIN se almacena como texto plano en LocalStorage
- Esta es una aplicación de **uso personal local**
- El PIN es un "soft lock" para evitar accesos **accidentales**
- **NO** es seguridad criptográfica real
- **NO** apta para datos sensibles o uso multi-usuario

## 🎨 Diseño y UI

### Paleta de Colores

**Colores Primarios**:
- **Primary**: `#6366F1` (Indigo) - Botones principales, enlaces
- **Secondary**: `#10B981` (Green) - Éxito, categoría Comida
- **Danger**: `#EF4444` (Red) - Alertas, eliminaciones
- **Warning**: `#F59E0B` (Orange) - Advertencias

**Colores de Texto (WCAG AA Compliant)**:
- **Primary**: `#111827` (ratio 16:1)
- **Secondary**: `#374151` (ratio 10:1)
- **Tertiary**: `#6B7280` (ratio 4.6:1)
- **Muted**: `#9CA3AF` (ratio 3.2:1)

**Efectos Glassmorphism**:
- Background: `rgba(255, 255, 255, 0.7)`
- Backdrop Filter: `blur(10px)`
- Border: `rgba(255, 255, 255, 0.3)`

### Tipografía
- **Familia**: Montserrat, system-ui, sans-serif
- **Pesos**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Tamaños**: Sistema escalable desde 0.75rem (12px) hasta 3rem (48px)
- **Iconos**: Font Awesome 6.5.1 (solid)

### Sistema de Espaciado
Escala modular basada en múltiplos de 8px:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)

### Responsive Design
- **Mobile Small**: 320px+ (diseño base)
- **Mobile**: 375px+
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Desktop Large**: 1440px+

Enfoque **mobile-first**: estilos base para móvil, media queries para pantallas más grandes.

### Animaciones
- **Duración**: 150ms (rápida), 200ms (base), 300ms (lenta)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out personalizado)
- **Efectos**: fadeIn, fadeInUp, slideInDown, slideInRight, pulse
- **Reducción de movimiento**: Respeta `prefers-reduced-motion`

## 🔧 Arquitectura del Código

### Módulos JavaScript

**app.js** - Clase principal `ExpenseApp`:
```javascript
class ExpenseApp {
  init()                    // Inicialización y routing de autenticación
  showRegistration()        // Pantalla de registro
  showLogin()              // Pantalla de login
  setupAuthTabs()          // Tabs login/registro
  showMainApp()            // Cargar aplicación principal
  setupElements()          // Referencias DOM
  setupEventListeners()    // Event delegation
  setupTabs()              // Navegación entre pestañas
  setupUserMenu()          // Side drawer y menú
  openModal()              // Abrir modal agregar/editar
  handleSubmit()           // Guardar gasto (crear/actualizar)
  handleDelete()           // Eliminar gasto con confirmación
  loadDashboard()          // Cargar resúmenes y gastos recientes
  loadStatistics()         // Renderizar gráficos
  renderCategoryChart()    // Gráfico de dona (Chart.js)
  renderYearlyChart()      // Gráfico de línea (Chart.js)
  handleLogout()           // Cerrar sesión
  registerServiceWorker()  // Registrar SW para PWA
}
```

**db.js** - Clase `DatabaseManager`:
```javascript
class DatabaseManager {
  init()                           // Crear/actualizar IndexedDB
  getAllExpenses()                 // Obtener todos los gastos
  getExpensesByDateRange()         // Filtrar por rango de fechas
  getExpensesByMonth()             // Filtrar por mes específico
  getExpensesByCategory()          // Filtrar por categoría
  getRecentExpenses(limit)         // Últimos N gastos
  createExpense(data)              // Crear nuevo gasto
  updateExpense(id, data)          // Actualizar gasto existente
  deleteExpense(id)                // Eliminar gasto
  getAllCategories()               // Todas las categorías
  getActiveCategories()            // Solo categorías activas
  getMonthlySummary(year, month)   // Resumen mensual con categorías
  getWeeklySummary(start, end)     // Resumen semanal
  getYearlySummary(year)           // Resumen anual por meses
  clearAllData()                   // Limpiar todo (para import)
}
```

**auth.js** - Clase `AuthManager`:
```javascript
class AuthManager {
  needsRegistration()     // Verificar si necesita registro inicial
  getCurrentUser()        // Obtener usuario actual
  isAuthenticated()       // Verificar si hay sesión activa
  register(nombre, pin)   // Registrar nuevo usuario
  login(pin)             // Login con PIN
  logout()               // Cerrar sesión
  validatePIN(pin)       // Validar formato PIN (4 dígitos)
}
```

**utils.js** - Funciones de utilidad:
```javascript
formatCurrency(amount)           // Formatear a ARS con Intl
formatDate(dateString)           // Formatear fecha legible
getTodayDate()                   // Fecha actual YYYY-MM-DD
showError(message)               // Toast de error
showSuccess(message)             // Toast de éxito
showWarning(message)             // Toast de advertencia
showInfo(message)                // Toast informativo
confirm(message, title)          // Diálogo de confirmación
confirmDanger(message, title)    // Diálogo de confirmación peligrosa
```

**toast.js** - Sistema de notificaciones:
```javascript
class ToastManager {
  show(message, type, duration)  // Mostrar toast
  success(message)               // Toast verde
  error(message)                 // Toast rojo
  warning(message)               // Toast naranja
  info(message)                  // Toast azul
}
```

**confirm-dialog.js** - Diálogos de confirmación:
```javascript
class ConfirmDialog {
  show(options)                  // Mostrar diálogo
  danger(message, title)         // Diálogo de acción peligrosa
}
```

**data-backup.js** - Exportar/Importar datos:
```javascript
class DataBackup {
  exportData()                   // Exportar a JSON
  importData(file)               // Importar desde JSON
}
```

### Service Worker (sw.js)

**Caches**:
- `static-v2.0`: App shell (HTML, CSS, JS, fonts)
- `dynamic-v2.0`: Recursos cargados dinámicamente

**Estrategias**:
1. **Cache First**: Recursos estáticos (CSS, JS, fuentes)
   - Intenta cache primero, fallback a red
   - Actualiza cache en background

2. **Network First**: APIs futuras
   - Intenta red primero, fallback a cache
   - Útil para datos dinámicos

3. **Stale While Revalidate**: Imágenes y assets
   - Sirve cache inmediatamente
   - Actualiza en background

## 📱 Instalar como PWA

### Android (Chrome/Samsung Internet)
1. Abre la app en el navegador
2. Toca el menú (⋮) → "Agregar a pantalla de inicio" o "Instalar app"
3. Confirma instalación
4. La app aparecerá en tu drawer de aplicaciones

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón compartir (□↑)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Personaliza el nombre (opcional)
5. Toca "Agregar"

### Desktop (Chrome/Edge/Brave)
1. Abre la app en el navegador
2. Click en el ícono de instalación (⊕) en la barra de direcciones
3. O ve a Menú → "Instalar Control de Gastos"
4. La app se abrirá en ventana independiente

### Beneficios de la Instalación
- ✅ Icono en pantalla de inicio/escritorio
- ✅ Ventana independiente (sin barra del navegador)
- ✅ Arranque más rápido
- ✅ Funciona offline completo
- ✅ Apariencia nativa

## 🔐 Privacidad y Seguridad

### Privacidad Total
- ✅ **100% Local**: Todos los datos se almacenan en tu dispositivo
- ✅ **Sin Internet**: No envía datos a ningún servidor externo
- ✅ **Sin Tracking**: No hay analytics, telemetría ni cookies de terceros
- ✅ **Sin Cuentas Cloud**: Cada dispositivo es independiente
- ✅ **Código Abierto**: Puedes auditar todo el código

### Consideraciones de Seguridad
- ⚠️ **Backup Manual**: Tus datos solo existen en este navegador/dispositivo
  - Usa "Exportar Datos" regularmente para respaldos
- ⚠️ **Soft Security**: El PIN es solo para evitar accesos accidentales
  - No es encriptación criptográfica
  - Accesible desde DevTools por usuarios avanzados
- ⚠️ **Navegador Privado**: No uses modo incógnito, los datos se borrarán
- ⚠️ **Limpieza de Datos**: Limpiar datos del navegador borrará todo

### Recomendaciones
1. **Exporta regularmente** tus datos como respaldo
2. **No compartas** tu PIN con otras personas
3. **Usa en dispositivo personal**, no público
4. **No almacenes** información sensible en las notas
5. **Considera encriptación** si necesitas seguridad real (fuera del alcance de esta app)

## 🐛 Troubleshooting

### La app no carga / Pantalla en blanco
1. Verifica que el servidor está corriendo (puerto 3000)
2. Abre DevTools → Console para ver errores específicos
3. Verifica que usas un navegador moderno (Chrome 90+, Firefox 88+, Safari 14+)
4. Intenta en modo incógnito para descartar extensiones

### Los datos no se guardan
1. Verifica que **IndexedDB está habilitado** en configuración del navegador
2. **No uses modo incógnito/privado** - los datos se borran al cerrar
3. Revisa que tienes **espacio disponible** en el dispositivo
4. Abre DevTools → Application → IndexedDB → ExpenseTrackerDB para inspeccionar

### Service Worker no funciona
1. Asegúrate de servir vía **HTTP/HTTPS** (no `file://`)
2. En DevTools → Application → Service Workers → Click "Unregister"
3. Recarga la página con Ctrl+F5 (hard reload)
4. Revisa la consola para errores del SW

### Los gráficos no se muestran
1. Verifica que **Chart.js se cargó** (DevTools → Network)
2. Asegúrate de tener **gastos en el mes/año actual**
3. Cambia a pestaña Estadísticas para forzar renderizado
4. Revisa errores en consola relacionados con Chart

### El Side Drawer no abre
1. Verifica que hiciste login correctamente
2. Revisa la consola para errores en `setupUserMenu()`
3. Asegúrate que el botón hamburguesa (☰) está visible
4. Intenta hacer hard reload (Ctrl+F5)

### Error al importar datos
1. Verifica que el archivo JSON es válido
2. Asegúrate que fue exportado desde esta app
3. Revisa que el archivo no está corrupto
4. El formato debe ser: `{expenses: [...], categories: [...]}`

### Quiero borrar todos los datos / Resetear app
**Opción 1: Desde DevTools**
1. F12 → Application → Storage
2. IndexedDB → Click derecho → Delete `ExpenseTrackerDB`
3. Local Storage → Click derecho → Clear
4. Recarga la página (F5)

**Opción 2: Desde Configuración del Navegador**
1. Configuración → Privacidad → Borrar datos de navegación
2. Selecciona solo este sitio
3. Marca "Cookies y datos de sitios" y "Archivos en caché"
4. Confirma

### El PIN no funciona / Olvidé mi PIN
**⚠️ No hay recuperación de PIN**. Para resetear:
1. Sigue los pasos de "Quiero borrar todos los datos"
2. Esto eliminará TODO incluyendo tus gastos
3. **Exporta tus datos primero** si quieres conservarlos
4. Luego podrás crear un nuevo usuario con nuevo PIN

## 🚧 Futuras Mejoras

### Planeadas
- [ ] Desbloqueo con huella dactilar (Web Authentication API)
- [ ] Presupuestos por categoría con alertas
- [ ] Búsqueda avanzada de gastos (por texto, rango de montos)
- [ ] Más tipos de gráficos (barras, radar, heatmap)
- [ ] Exportar a CSV y Excel
- [ ] Modo oscuro automático (según sistema)
- [ ] Múltiples usuarios en el mismo dispositivo
- [ ] Recordatorios de gastos recurrentes
- [ ] Calculadora integrada en formulario

### Consideradas (Opcional)
- [ ] Sincronización entre dispositivos (requiere backend)
- [ ] Categorías personalizadas por usuario
- [ ] Adjuntar fotos de recibos
- [ ] Soporte multi-moneda con tasas de cambio
- [ ] Internacionalización (i18n) - inglés, portugués
- [ ] Widgets para pantalla de inicio (Android)

### Completadas ✅
- ✅ Exportar/Importar datos (JSON)
- ✅ Edición de gastos existentes
- ✅ Sistema de autenticación con PIN
- ✅ Gráficos interactivos (Chart.js)
- ✅ Resúmenes temporales (semanal, mensual, anual)
- ✅ Diseño responsive mobile-first
- ✅ PWA instalable
- ✅ Modo completamente offline

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~2,500 líneas
- **Módulos JavaScript**: 7 archivos
- **Hojas de estilo**: 7 archivos CSS
- **Tamaño total**: ~150 KB (sin dependencias CDN)
- **Dependencias externas**: 3 (Chart.js, Font Awesome, Montserrat)
- **Soporte navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Versión**: 2.1.0 (Offline Complete + Backup)

## 📄 Licencia

Uso personal y educativo. No comercial.

## 🤝 Contribuciones

Este es un proyecto personal de aprendizaje creado con Claude Code.

**No se aceptan contribuciones externas** en este momento, pero puedes:
- Fork el proyecto para uso personal
- Reportar bugs vía Issues
- Compartir ideas y sugerencias

## 💡 Créditos

- **Desarrollado con**: [Claude Code](https://claude.ai/code) - Anthropic
- **Gráficos**: [Chart.js](https://www.chartjs.org/)
- **Iconos**: [Font Awesome](https://fontawesome.com/)
- **Fuente**: [Google Fonts - Montserrat](https://fonts.google.com/specimen/Montserrat)

---

**Versión**: 2.1.0 (Offline + Backup + Side Drawer)
**Última actualización**: Enero 2026
**Estado**: Producción (listo para uso personal)
