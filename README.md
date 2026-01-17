# 💰 Control de Gastos - PWA

Progressive Web App para control de gastos personales con enfoque mobile-first.

## Stack Tecnológico

**Backend:**
- Python 3.11+
- FastAPI 0.104+
- SQLAlchemy 2.0+
- SQLite 3
- pytest

**Frontend:**
- HTML5 Semántico
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript Vanilla ES6+
- PWA (Service Worker, Web Manifest)

## Instalación

### Requisitos Previos
- Python 3.11+
- pip
- Git

### Backend Setup

1. Activar el entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

3. Crear archivo de configuración:
```bash
cp .env.example .env
```

4. Inicializar la base de datos y crear categorías por defecto:
```bash
# Desde la carpeta backend/
python init_categories.py
```

5. Ejecutar el servidor:
```bash
uvicorn app.main:app --reload
```

La API estará disponible en:
- API: http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs

### Frontend Setup

En una terminal separada:

```bash
cd frontend
python -m http.server 3000
```

La aplicación estará disponible en: http://localhost:3000

## Estructura del Proyecto

```
Control de Gastos/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Esquemas Pydantic
│   │   ├── repositories/    # Capa de acceso a datos
│   │   ├── services/        # Lógica de negocio
│   │   ├── routers/         # Endpoints API
│   │   ├── utils/           # Utilidades y excepciones
│   │   ├── config.py        # Configuración
│   │   ├── database.py      # Conexión a BD
│   │   └── main.py          # Aplicación FastAPI
│   ├── tests/               # Tests con pytest
│   ├── init_categories.py   # Script de inicialización
│   └── requirements.txt
│
├── frontend/
│   ├── css/                 # Estilos (variables, base, layout, components)
│   ├── js/                  # JavaScript modular
│   │   ├── api.js          # Cliente API
│   │   ├── utils.js        # Funciones helper
│   │   └── app.js          # Aplicación principal
│   ├── index.html
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
│
├── .gitignore
├── CLAUDE.md               # Documentación para Claude Code
└── README.md
```

## Testing

Ejecutar todos los tests:
```bash
cd backend
pytest
```

Con coverage:
```bash
pytest --cov=app --cov-report=html
```

Test específico:
```bash
pytest tests/test_routers.py::test_create_expense -v
```

## API Endpoints

### Gastos (Expenses)
- `POST /api/expenses` - Crear gasto
- `GET /api/expenses` - Listar gastos (con filtros opcionales)
- `GET /api/expenses/{id}` - Obtener gasto por ID
- `DELETE /api/expenses/{id}` - Eliminar gasto
- `GET /api/expenses/dashboard/monthly` - Resumen mensual

### Categorías (Categories)
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/{id}` - Obtener categoría por ID

## Características MVP

- ✅ CRUD de gastos (Create, Read, Delete)
- ✅ 7 categorías predefinidas con iconos
- ✅ Dashboard con total mensual
- ✅ Lista de últimos gastos
- ✅ Interfaz responsive mobile-first
- ✅ PWA instalable
- ✅ Tests automatizados (>60% coverage)

## Próximas Funcionalidades (Post-MVP)

- [ ] Editar gastos
- [ ] Filtros avanzados
- [ ] Gráficos y estadísticas
- [ ] Exportar a CSV
- [ ] Suscripciones recurrentes
- [ ] Modo offline completo

## Convenciones

- **Base de datos**: Nombres en español (snake_case)
- **Código Python**: Nombres en inglés, type hints obligatorios
- **Frontend**: JavaScript ES6+ con módulos
- **CSS**: Mobile-first, custom properties
- **Git**: Commits descriptivos en español

## Licencia

Uso personal y círculo cercano (no comercial)

---

**Versión**: 0.1.0 (MVP)
