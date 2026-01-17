# 💰 Control de Gastos - PWA Offline

Progressive Web App **completamente offline** para control de gastos personales con autenticación simple, gráficos interactivos y diseño moderno.

## ✨ Características

### Funcionalidades Principales
- ✅ **100% Offline** - Funciona sin conexión a internet usando IndexedDB
- ✅ **Autenticación Simple** - Nombre + PIN de 4 dígitos para proteger tus datos
- ✅ **CRUD Completo** - Crear, leer, editar y eliminar gastos
- ✅ **Categorías Predefinidas** - 7 categorías con iconos y colores
- ✅ **Resúmenes Múltiples** - Semanal, mensual y anual
- ✅ **Gráficos Interactivos** - Visualización con Chart.js
- ✅ **Diseño Moderno** - UI mejorada con Font Awesome y Montserrat
- ✅ **PWA Instalable** - Instálala como app nativa en tu dispositivo

### Nuevas Funcionalidades (v2.0)
- 🎨 Diseño completamente renovado con paleta de colores moderna
- 📊 Dashboard con 3 tarjetas de resumen (semanal, mensual, anual)
- 📈 Estadísticas con gráficos de dona (categorías) y línea (evolución anual)
- ✏️ Edición de gastos existentes
- 🔐 Sistema de login/registro con PIN
- 🚪 Botón de logout
- 📱 Pestañas de navegación (Dashboard, Gastos, Estadísticas)
- 🔍 Filtro de gastos por mes
- 🎯 Mobile-first completamente responsive

## 🛠️ Stack Tecnológico

**Frontend (100% offline)**:
- HTML5 Semántico
- CSS3 con Custom Properties
- JavaScript Vanilla ES6+ con módulos
- IndexedDB para almacenamiento local
- Chart.js para gráficos
- Font Awesome 6.5 para iconos
- Google Fonts (Montserrat)
- Service Worker para PWA

**Herramientas de Desarrollo**:
- VSCode
- Live Server o `python -m http.server`

## 📁 Arquitectura del Proyecto

```
frontend/
├── index.html              # Aplicación de página única
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker con cache
├── css/
│   ├── variables.css       # Variables CSS (colores, espaciado)
│   ├── base.css           # Estilos base y reset
│   ├── layout.css         # Layouts y containers
│   └── components.css     # Componentes UI
└── js/
    ├── app.js             # Aplicación principal
    ├── db.js              # Gestor de IndexedDB
    ├── auth.js            # Sistema de autenticación
    └── utils.js           # Funciones de utilidad
```

## 🚀 Cómo Usar

### Instalación y Ejecución

1. **Clonar el repositorio**:
```bash
git clone <url-del-repo>
cd "Control de Gastos"
```

2. **Servir la aplicación**:

**Opción 1: Python**
```bash
cd frontend
python -m http.server 3000
```

**Opción 2: Live Server (VSCode)**
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

3. **Abrir en el navegador**:
```
http://localhost:3000
```

### Primer Uso

1. **Registro**: Al abrir la app por primera vez, se te pedirá:
   - Tu nombre (para personalizar la UI)
   - Un PIN de 4 dígitos (para proteger tus datos)
   - Confirmar el PIN

2. **Login Subsecuente**: En futuras visitas, solo necesitarás ingresar tu PIN

3. **Agregar Gastos**: Click en el botón `+` flotante para agregar un nuevo gasto

### Funcionalidades

#### Dashboard
- **Resumen Semanal**: Total de gastos de los últimos 7 días
- **Resumen Mensual**: Total del mes actual
- **Resumen Anual**: Total del año en curso
- **Últimos Gastos**: Lista de los 10 gastos más recientes

#### Pestaña Gastos
- Ver todos los gastos registrados
- Filtrar por mes específico
- Editar cualquier gasto (click en el ícono de lápiz)
- Eliminar gastos (click en el ícono de basura)

#### Pestaña Estadísticas
- **Gráfico de Dona**: Distribución de gastos por categoría (mes actual)
- **Gráfico de Línea**: Evolución de gastos durante el año

#### Gestión de Gastos
- **Crear**: Click en `+` → Completar formulario → Guardar
- **Editar**: Click en ícono de lápiz en cualquier gasto
- **Eliminar**: Click en ícono de basura (requiere confirmación)

#### Logout
- Click en el ícono de salida en el header
- Cierra sesión sin eliminar tus datos

## 🗄️ Almacenamiento de Datos

### IndexedDB
Los datos se almacenan **localmente en tu navegador** usando IndexedDB:

**Base de Datos**: `ExpenseTrackerDB`

**Stores (Tablas)**:
1. **expenses** - Almacena todos los gastos
   - id, monto, descripcion, categoria_id, fecha, notas
   - fecha_creacion, fecha_actualizacion

2. **categories** - Categorías predefinidas
   - id, nombre, icono, color, activo

**Categorías Incluidas**:
- 🍔 Comida (#10B981)
- 🚗 Transporte (#3B82F6)
- 💡 Servicios (#F59E0B)
- 🛍️ Compras (#8B5CF6)
- 🎬 Entretenimiento (#EC4899)
- ⚕️ Salud (#EF4444)
- 📦 Otros (#6B7280)

### LocalStorage
Se usa solo para almacenar la autenticación:
- Nombre del usuario
- PIN (almacenado como texto plano - es un soft lock, no seguridad real)

**Nota de Seguridad**: Esta es una aplicación de uso personal. El PIN es solo para evitar accesos accidentales, **no** es seguridad criptográfica real.

## 🎨 Diseño y UI

### Paleta de Colores
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #10B981 (Green)
- **Danger**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)

### Tipografía
- **Fuente**: Montserrat (300, 400, 500, 600, 700)
- **Iconos**: Font Awesome 6.5.1

### Responsive
- **Mobile**: 320px+ (diseño base)
- **Tablet**: 768px+
- **Desktop**: 1024px+

## 🔧 Desarrollo

### Estructura del Código

**app.js** - Clase principal `ExpenseApp`:
- Manejo de autenticación
- Navegación entre pestañas
- CRUD de gastos
- Renderizado de gráficos
- Gestión del Service Worker

**db.js** - Clase `DatabaseManager`:
- Inicialización de IndexedDB
- Operaciones CRUD
- Consultas y agregaciones
- Resúmenes (semanal, mensual, anual)

**auth.js** - Clase `AuthManager`:
- Registro de usuarios
- Login/Logout
- Validación de PIN
- Gestión de sesión

**utils.js** - Funciones de utilidad:
- Formateo de moneda
- Formateo de fechas
- Alertas y confirmaciones

### Service Worker

El Service Worker implementa tres estrategias de cache:

1. **Cache-First**: Para recursos estáticos (CSS, JS, fonts)
2. **Network-First**: Para llamadas API (futuro)
3. **Stale-While-Revalidate**: Para contenido dinámico

**Caches**:
- `static-v2.0`: App shell y recursos críticos
- `dynamic-v2.0`: Recursos cargados dinámicamente

## 📱 Instalar como PWA

### Android (Chrome)
1. Abre la app en Chrome
2. Menú → "Agregar a pantalla de inicio"
3. La app se instalará como nativa

### iOS (Safari)
1. Abre la app en Safari
2. Botón compartir → "Agregar a pantalla de inicio"
3. La app se instalará como nativa

### Desktop (Chrome/Edge)
1. Click en el ícono de instalación en la barra de direcciones
2. O Menú → "Instalar Control de Gastos"

## 🔐 Privacidad y Seguridad

- ✅ **100% Local**: Todos los datos se almacenan en tu dispositivo
- ✅ **Sin Internet**: No envía datos a ningún servidor
- ✅ **Sin Tracking**: No hay analytics ni telemetría
- ✅ **Sin Cuentas Cloud**: Cada dispositivo tiene su propia base de datos
- ⚠️ **Backup Manual**: Tus datos solo existen en este navegador/dispositivo
- ⚠️ **Soft Security**: El PIN es solo para evitar accesos accidentales

## 🐛 Troubleshooting

### La app no carga
1. Verifica que el servidor está corriendo
2. Abre las DevTools → Console para ver errores
3. Limpia la cache del navegador (Ctrl+Shift+Delete)

### Los datos no se guardan
1. Verifica que IndexedDB está habilitado en tu navegador
2. No uses modo incógnito/privado
3. Revisa que tienes espacio disponible

### Service Worker no funciona
1. Asegúrate de servir la app via HTTP/HTTPS (no `file://`)
2. En DevTools → Application → Service Workers → Unregister
3. Recarga la página

### Quiero borrar todos los datos
1. Abre DevTools → Application
2. Storage → IndexedDB → Elimina `ExpenseTrackerDB`
3. Storage → Local Storage → Elimina el dominio
4. Recarga la página

## 🚧 Futuras Mejoras

- [ ] Exportar/Importar datos (JSON/CSV)
- [ ] Desbloqueo con huella dactilar (Web Authentication API)
- [ ] Sincronización entre dispositivos (opcional)
- [ ] Más tipos de gráficos
- [ ] Presupuestos por categoría
- [ ] Búsqueda avanzada de gastos
- [ ] Modo oscuro
- [ ] Múltiples usuarios en el mismo dispositivo

## 📄 Licencia

Uso personal y círculo cercano (no comercial)

## 🤝 Contribuciones

Este es un proyecto personal de aprendizaje. No se aceptan contribuciones externas en este momento.

---

**Versión**: 2.0.0 (Offline Complete)
**Última actualización**: Enero 2026
