# 🎯 EXPENSE TRACKER PWA - DOCUMENTO INICIAL

## 📋 TABLA DE CONTENIDOS
1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Convenciones y Estándares](#convenciones-y-estándares)
4. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Backend - Buenas Prácticas](#backend---buenas-prácticas)
7. [Frontend - Estructura](#frontend---estructura)
8. [MVP - Features Iniciales](#mvp---features-iniciales)
9. [Setup y Desarrollo](#setup-y-desarrollo)
10. [Entregables](#entregables)

---

## CONTEXTO DEL PROYECTO

### Objetivo
Desarrollar una Progressive Web App (PWA) para control de gastos personales con enfoque mobile-first, arquitectura modular y escalable. Uso personal y para círculo cercano (no comercial).

### Perfil del Desarrollador
- Experiencia en Python (backend/scripting)
- Primera experiencia en desarrollo web
- Entorno: VSCode + GitHub Copilot + Claude Code
- Enfoque: aprender haciendo, código limpio y profesional

### Filosofía de Desarrollo
1. **Empezar simple, escalar inteligentemente**
2. **Código limpio > código clever**
3. **Modularidad desde el inicio**
4. **Testing como parte del desarrollo**
5. **Documentación solo de lo esencial**

---

## STACK TECNOLÓGICO

### Backend
```
- Python 3.11+
- FastAPI 0.104+ (framework async)
- SQLAlchemy 2.0+ (ORM)
- Pydantic 2.0+ (validación de datos)
- SQLite 3 (base de datos)
- pytest + pytest-asyncio (testing)
- uvicorn (ASGI server)
```

### Frontend
```
- HTML5 semántico
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript Vanilla ES6+
- Service Workers (PWA offline)
- Web Manifest (instalación PWA)
```

### Desarrollo
```
- Git (control de versiones)
- .env para configuración
- Virtual environment (venv)
```

---

## CONVENCIONES Y ESTÁNDARES

### 🗃️ BASE DE DATOS

#### Nomenclatura
- **Idioma**: Español
- **Formato**: `snake_case`
- **Tablas**: Plural, descriptivo (`gastos`, `categorias`, `suscripciones`)
- **Columnas**: Singular, descriptivo (`monto`, `descripcion`, `fecha_creacion`)
- **PKs**: Siempre `id` (INTEGER, AUTOINCREMENT)
- **FKs**: `{tabla_singular}_id` (ej: `categoria_id`, `usuario_id`)
- **Timestamps**: `fecha_creacion`, `fecha_actualizacion` (DATETIME, UTC)

#### Tipos de Datos
```sql
- IDs: INTEGER (PRIMARY KEY AUTOINCREMENT)
- Montos: DECIMAL(10, 2) o REAL
- Textos cortos: VARCHAR(255)
- Textos largos: TEXT
- Fechas: DATE
- Timestamps: DATETIME
- Booleanos: BOOLEAN (0/1 en SQLite)
```

#### Restricciones
- `NOT NULL` en campos obligatorios
- `DEFAULT` para valores predeterminados
- `CHECK` para validaciones a nivel DB
- Índices en columnas de búsqueda frecuente

#### Ejemplo de Tabla
```sql
CREATE TABLE gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monto REAL NOT NULL CHECK(monto > 0),
    descripcion VARCHAR(255) NOT NULL,
    categoria_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE INDEX idx_gastos_fecha ON gastos(fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
```

---

### 💻 BACKEND - CONVENCIONES

#### Nomenclatura Python
```python
# Clases: PascalCase
class ExpenseService:
    pass

class ExpenseRepository:
    pass

# Funciones/Métodos: snake_case, verbos descriptivos
def create_expense(data: ExpenseCreate) -> Expense:
    pass

def get_expenses_by_month(year: int, month: int) -> list[Expense]:
    pass

def calculate_monthly_total(expenses: list[Expense]) -> Decimal:
    pass

# Variables: snake_case, sustantivos descriptivos
expense_data = {...}
monthly_total = 0.0
active_subscriptions = []

# Constantes: UPPER_SNAKE_CASE
DATABASE_URL = "sqlite:///./expenses.db"
MAX_DESCRIPTION_LENGTH = 255
DEFAULT_CURRENCY = "ARS"
```

#### Estructura de Archivos
```python
# models.py - SQLAlchemy Models
class Gasto(Base):
    __tablename__ = "gastos"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    monto: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    # ...

# schemas.py - Pydantic Schemas
class ExpenseBase(BaseModel):
    monto: Decimal
    descripcion: str
    categoria_id: int
    fecha: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

# services.py - Business Logic
class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_expense(self, data: ExpenseCreate) -> Expense:
        """Create a new expense record"""
        # Implementation
    
    def get_monthly_summary(self, year: int, month: int) -> MonthlySummary:
        """Calculate monthly expense summary"""
        # Implementation

# routers.py - API Endpoints
@router.post("/expenses", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db)
) -> ExpenseResponse:
    """
    Create a new expense
    
    - **monto**: Amount spent (must be positive)
    - **descripcion**: Expense description
    - **categoria_id**: Category ID
    - **fecha**: Expense date
    """
    service = ExpenseService(db)
    return service.create_expense(expense)
```

#### Principios SOLID Aplicados

**Single Responsibility**
```python
# ✅ CORRECTO - Cada clase tiene una responsabilidad
class ExpenseRepository:
    """Handle database operations for expenses"""
    def save(self, expense: Expense) -> Expense:
        pass
    
    def find_by_id(self, expense_id: int) -> Expense | None:
        pass

class ExpenseValidator:
    """Validate expense business rules"""
    def validate_amount(self, amount: Decimal) -> bool:
        pass

class ExpenseService:
    """Orchestrate expense operations"""
    def __init__(self, repo: ExpenseRepository, validator: ExpenseValidator):
        self.repo = repo
        self.validator = validator
```

**Dependency Injection**
```python
# ✅ CORRECTO - Inyección de dependencias
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/expenses")
async def get_expenses(db: Session = Depends(get_db)):
    service = ExpenseService(db)
    return service.get_all_expenses()
```

**Polimorfismo cuando sea necesario**
```python
# Ejemplo: Diferentes calculadores de totales
from abc import ABC, abstractmethod

class TotalCalculator(ABC):
    @abstractmethod
    def calculate(self, expenses: list[Expense]) -> Decimal:
        pass

class SimpleTotalCalculator(TotalCalculator):
    def calculate(self, expenses: list[Expense]) -> Decimal:
        return sum(e.monto for e in expenses)

class TaxIncludedCalculator(TotalCalculator):
    def __init__(self, tax_rate: Decimal):
        self.tax_rate = tax_rate
    
    def calculate(self, expenses: list[Expense]) -> Decimal:
        total = sum(e.monto for e in expenses)
        return total * (1 + self.tax_rate)
```

#### Type Hints Obligatorios
```python
# ✅ CORRECTO
def create_expense(
    db: Session,
    data: ExpenseCreate
) -> Expense:
    pass

def get_expenses_by_date_range(
    db: Session,
    start_date: date,
    end_date: date
) -> list[Expense]:
    pass

# ❌ INCORRECTO
def create_expense(db, data):
    pass
```

#### Manejo de Errores
```python
from fastapi import HTTPException, status

class ExpenseNotFoundError(Exception):
    """Raised when expense is not found"""
    pass

class InvalidAmountError(Exception):
    """Raised when amount is invalid"""
    pass

# En el service
def get_expense_by_id(self, expense_id: int) -> Expense:
    expense = self.repo.find_by_id(expense_id)
    if not expense:
        raise ExpenseNotFoundError(f"Expense {expense_id} not found")
    return expense

# En el router
@router.get("/expenses/{expense_id}")
async def get_expense(expense_id: int, db: Session = Depends(get_db)):
    try:
        service = ExpenseService(db)
        return service.get_expense_by_id(expense_id)
    except ExpenseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
```

---

### 🎨 FRONTEND - CONVENCIONES

#### HTML Semántico
```html
<!-- ✅ CORRECTO -->
<main class="app">
    <header class="app-header">
        <h1>Control de Gastos</h1>
    </header>
    
    <nav class="app-nav">
        <ul>
            <li><a href="#gastos">Gastos</a></li>
            <li><a href="#dashboard">Dashboard</a></li>
        </ul>
    </nav>
    
    <section class="expense-form">
        <form id="expenseForm">
            <!-- Form fields -->
        </form>
    </section>
    
    <section class="expense-list">
        <article class="expense-item">
            <!-- Expense details -->
        </article>
    </section>
</main>
```

#### CSS - Mobile First
```css
/* variables.css - Custom Properties */
:root {
    /* Colors */
    --color-primary: #4F46E5;
    --color-secondary: #10B981;
    --color-danger: #EF4444;
    --color-text: #1F2937;
    --color-text-light: #6B7280;
    --color-bg: #FFFFFF;
    --color-bg-secondary: #F9FAFB;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Typography */
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    
    /* Borders */
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 1rem;
}

/* base.css - Mobile First */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--font-size-base);
    color: var(--color-text);
    background-color: var(--color-bg);
    line-height: 1.5;
}

/* Mobile (320px+) - Base styles */
.container {
    padding: var(--spacing-md);
    max-width: 100%;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
    .container {
        padding: var(--spacing-lg);
        max-width: 768px;
        margin: 0 auto;
    }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
    .container {
        max-width: 1024px;
    }
}
```

#### JavaScript - Modular
```javascript
// api.js - API calls
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    async createExpense(expenseData) {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create expense');
        }
        
        return response.json();
    },
    
    async getExpenses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${API_BASE_URL}/expenses?${queryString}`
        );
        return response.json();
    }
};

// utils.js - Helper functions
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
};

// app.js - Main application
import { api } from './api.js';
import { formatCurrency, formatDate } from './utils.js';

class ExpenseApp {
    constructor() {
        this.expenses = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadExpenses();
    }
    
    setupEventListeners() {
        document.getElementById('expenseForm')
            .addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        // Implementation
    }
    
    async loadExpenses() {
        try {
            this.expenses = await api.getExpenses();
            this.renderExpenses();
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }
    
    renderExpenses() {
        // Implementation
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
});
```

---

## ARQUITECTURA DEL PROYECTO

### Estructura de Directorios
```
expense-tracker/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration settings
│   │   ├── database.py             # Database connection & session
│   │   │
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── base.py            # Base model class
│   │   │   ├── gasto.py           # Expense model
│   │   │   └── categoria.py       # Category model
│   │   │
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── gasto.py           # Expense schemas
│   │   │   └── categoria.py       # Category schemas
│   │   │
│   │   ├── repositories/           # Data access layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py            # Base repository
│   │   │   └── gasto_repository.py
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   └── expense_service.py
│   │   │
│   │   ├── routers/                # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── gastos.py          # Expense endpoints
│   │   │   └── categorias.py      # Category endpoints
│   │   │
│   │   └── utils/                  # Utilities
│   │       ├── __init__.py
│   │       └── exceptions.py       # Custom exceptions
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py            # Pytest fixtures
│   │   ├── test_models.py
│   │   ├── test_services.py
│   │   └── test_routers.py
│   │
│   ├── alembic/                    # Database migrations (futuro)
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── index.html
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   │
│   ├── css/
│   │   ├── variables.css           # CSS custom properties
│   │   ├── base.css               # Reset & base styles
│   │   ├── layout.css             # Layout components
│   │   └── components.css         # UI components
│   │
│   ├── js/
│   │   ├── app.js                 # Main application
│   │   ├── api.js                 # API client
│   │   ├── utils.js               # Helper functions
│   │   └── components/            # UI components (futuro)
│   │
│   ├── assets/
│   │   └── icons/                 # PWA icons
│   │
│   └── README.md
│
├── docs/
│   ├── prompt_inicial.md          # Este documento
│   ├── api_docs.md               # API documentation
│   └── database_schema.md        # Database schema
│
├── .gitignore
├── README.md
└── docker-compose.yml            # Para desarrollo (futuro)
```

---

## BASE DE DATOS

### Schema Inicial

#### Tabla: categorias
```sql
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50),
    color VARCHAR(7),
    activo BOOLEAN NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO categorias (nombre, icono, color) VALUES
    ('Comida', '🍔', '#10B981'),
    ('Transporte', '🚗', '#3B82F6'),
    ('Servicios', '💡', '#F59E0B'),
    ('Compras', '🛍️', '#8B5CF6'),
    ('Entretenimiento', '🎬', '#EC4899'),
    ('Salud', '⚕️', '#EF4444'),
    ('Otros', '📦', '#6B7280');
```

#### Tabla: gastos
```sql
CREATE TABLE gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monto REAL NOT NULL CHECK(monto > 0),
    descripcion VARCHAR(255) NOT NULL,
    categoria_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    notas TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_gastos_fecha ON gastos(fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_fecha_creacion ON gastos(fecha_creacion DESC);
```

### Modelos SQLAlchemy

```python
# models/base.py
from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    """Mixin for timestamp fields"""
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    fecha_actualizacion: Mapped[datetime | None] = mapped_column(
        DateTime,
        onupdate=datetime.utcnow
    )

# models/categoria.py
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Categoria(Base, TimestampMixin):
    __tablename__ = "categorias"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True)
    icono: Mapped[str | None] = mapped_column(String(50))
    color: Mapped[str | None] = mapped_column(String(7))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    gastos: Mapped[list["Gasto"]] = relationship(back_populates="categoria")

# models/gasto.py
from datetime import date
from decimal import Decimal
from sqlalchemy import String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Gasto(Base, TimestampMixin):
    __tablename__ = "gastos"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    monto: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    descripcion: Mapped[str] = mapped_column(String(255))
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"))
    fecha: Mapped[date] = mapped_column(Date)
    notas: Mapped[str | None] = mapped_column(Text)
    
    # Relationships
    categoria: Mapped["Categoria"] = relationship(back_populates="gastos")
```

---

## MVP - FEATURES INICIALES

### 🎯 Funcionalidades Core

#### 1. Gestión de Gastos (CRUD)
- ✅ **Crear gasto**: formulario con monto, descripción, categoría, fecha
- ✅ **Listar gastos**: ordenados por fecha (más recientes primero)
- ✅ **Ver detalle**: modal o página de detalle
- ✅ **Eliminar gasto**: con confirmación

#### 2. Categorías
- ✅ **Lista predefinida**: 7 categorías iniciales
- ✅ **Iconos y colores**: visualización clara
- ✅ **Selector**: dropdown en formulario

#### 3. Dashboard Básico
- ✅ **Total mes actual**: suma de gastos del mes
- ✅ **Últimos gastos**: lista de 10 items recientes
- ✅ **Navegación simple**: entre vistas

### 🔌 API Endpoints - MVP

```
POST   /api/expenses          # Crear gasto
GET    /api/expenses          # Listar gastos (con filtros opcionales)
GET    /api/expenses/{id}     # Obtener gasto por ID
DELETE /api/expenses/{id}     # Eliminar gasto

GET    /api/categories        # Listar categorías
GET    /api/dashboard/monthly # Resumen mensual
```

### 📱 Vistas Frontend - MVP

1. **Vista Principal (Dashboard)**
   - Header con título y navegación
   - Card con total del mes
   - Lista de últimos gastos
   - Botón flotante "Agregar gasto"

2. **Vista Agregar Gasto**
   - Formulario con validación
   - Campos: monto, descripción, categoría, fecha
   - Botones: Guardar, Cancelar

3. **Vista Lista de Gastos**
   - Lista completa de gastos
   - Filtro por mes
   - Ordenamiento por fecha

---

## SETUP Y DESARROLLO

### Requisitos Previos
```bash
- Python 3.11+
- pip
- Git
- Editor: VSCode (recomendado)
- Extensions: Python, Pylance, SQLite Viewer
```

### Instalación Inicial

#### 1. Crear estructura del proyecto
```bash
mkdir expense-tracker
cd expense-tracker
mkdir -p backend/app/{models,schemas,routers,services,repositories,utils}
mkdir -p backend/tests
mkdir -p frontend/{css,js,assets/icons}
mkdir docs
```

#### 2. Backend Setup
```bash
cd backend

# Crear virtual environment
python -m venv venv

# Activar virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Crear requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-dotenv==1.0.0

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
EOF

# Instalar dependencias
pip install -r requirements.txt
```

#### 3. Configuración Inicial

**backend/.env**
```env
# Application
APP_NAME="Expense Tracker API"
APP_VERSION="0.1.0"
DEBUG=True

# Database
DATABASE_URL="sqlite:///./expenses.db"

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# Server
HOST="0.0.0.0"
PORT=8000
```

**backend/app/config.py**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Expense Tracker API"
    app_version: str = "0.1.0"
    debug: bool = True
    
    database_url: str = "sqlite:///./expenses.db"
    
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### 4. Database Setup

**backend/app/database.py**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with tables"""
    from .models.base import Base
    Base.metadata.create_all(bind=engine)
```

#### 5. Ejecutar aplicación

```bash
# Desde backend/
uvicorn app.main:app --reload

# La API estará disponible en:
# http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend Setup

**frontend/index.html** (estructura básica)
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Control de Gastos Personal">
    <meta name="theme-color" content="#4F46E5">
    
    <title>Control de Gastos</title>
    
    <!-- PWA -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/css/variables.css">
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
</head>
<body>
    <main class="app" id="app">
        <header class="app-header">
            <h1>Control de Gastos</h1>
        </header>
        
        <!-- Content will be rendered here -->
        <div id="content"></div>
    </main>
    
    <!-- Scripts -->
    <script type="module" src="/js/app.js"></script>
</body>
</html>
```

**Servir frontend**
```bash
# Opción 1: Python simple server
cd frontend
python -m http.server 3000

# Opción 2: Live Server (VSCode extension)
# Click derecho en index.html -> Open with Live Server
```

### Git Setup

**.gitignore**
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.egg-info/
dist/
build/

# Database
*.db
*.sqlite
*.sqlite3

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

```bash
git init
git add .
git commit -m "Initial commit: Project structure"
```

---

## TESTING

### Estructura de Tests
```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.main import app
from app.database import get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """Create test client"""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    from fastapi.testclient import TestClient
    return TestClient(app)

# tests/test_expenses.py
def test_create_expense(client):
    response = client.post(
        "/api/expenses",
        json={
            "monto": 1500.50,
            "descripcion": "Almuerzo",
            "categoria_id": 1,
            "fecha": "2024-01-15"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["monto"] == 1500.50
    assert data["descripcion"] == "Almuerzo"
```

### Ejecutar Tests
```bash
# Todos los tests
pytest

# Con coverage
pytest --cov=app --cov-report=html

# Test específico
pytest tests/test_expenses.py::test_create_expense -v
```

---

## ENTREGABLES - MVP

### ✅ Checklist

#### Backend
- [ ] Estructura de proyecto creada
- [ ] FastAPI configurado y funcionando
- [ ] Base de datos SQLite creada
- [ ] Modelos SQLAlchemy (Gasto, Categoria)
- [ ] Schemas Pydantic
- [ ] Endpoints CRUD gastos
- [ ] Endpoint listar categorías
- [ ] CORS configurado
- [ ] Tests básicos (>60% coverage)
- [ ] requirements.txt completo

#### Frontend
- [ ] HTML estructura básica
- [ ] CSS variables y base styles
- [ ] JavaScript modular (app.js, api.js, utils.js)
- [ ] Formulario crear gasto funcional
- [ ] Lista de gastos con datos reales
- [ ] Dashboard con total mensual
- [ ] Responsive mobile-first
- [ ] PWA manifest.json básico

#### Documentación
- [ ] README.md con instrucciones
- [ ] .gitignore configurado
- [ ] .env.example
- [ ] Comentarios en código crítico

#### Funcionalidad
- [ ] Crear gasto desde frontend → backend
- [ ] Listar gastos en frontend
- [ ] Ver total del mes
- [ ] Eliminar gasto
- [ ] Validación de formularios

---

## PRÓXIMOS PASOS (Post-MVP)

### Fase 2 - Mejoras
- [ ] Editar gastos
- [ ] Filtros avanzados (por categoría, rango de fechas)
- [ ] Gráficos básicos (Chart.js)
- [ ] Exportar a CSV
- [ ] Búsqueda de gastos

### Fase 3 - Features Avanzadas
- [ ] Suscripciones recurrentes
- [ ] Multi-moneda
- [ ] Presupuestos por categoría
- [ ] Notificaciones PWA
- [ ] Autenticación de usuarios

### Fase 4 - Optimización
- [ ] Service Worker completo (offline)
- [ ] Cache estratégico
- [ ] Optimización de queries
- [ ] Migraciones con Alembic
- [ ] Deploy (Railway, Vercel, etc.)

---

## RECURSOS Y REFERENCIAS

### Documentación Oficial
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/
- PWA: https://web.dev/progressive-web-apps/

### Tutoriales Recomendados
- FastAPI Full Stack: https://fastapi.tiangolo.com/tutorial/
- SQLAlchemy ORM: https://docs.sqlalchemy.org/en/20/orm/
- CSS Grid: https://css-tricks.com/snippets/css/complete-guide-grid/
- JavaScript Modules: https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules

### Herramientas
- DB Browser for SQLite: https://sqlitebrowser.org/
- Postman/Insomnia: Para testing de API
- Chrome DevTools: Para debug de PWA

---

## 🚀 COMANDO PARA INICIAR

```bash
# 1. Clonar/crear estructura
# (seguir pasos en Setup y Desarrollo)

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Frontend (nueva terminal)
cd frontend
python -m http.server 3000

# 4. Abrir navegador
# Backend API: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

---

## NOTAS FINALES

### Principios a Recordar
1. **Empezar simple**: MVP primero, features después
2. **Código limpio**: Mejor legible que clever
3. **Testing**: Tests desde el inicio
4. **Documentar lo justo**: No sobre-documentar
5. **Git commits**: Commits pequeños y descriptivos
6. **Mobile-first**: Diseñar para mobile, escalar a desktop

### Cuando Tienes Dudas
1. Consultar documentación oficial
2. Revisar ejemplos en este documento
3. Usar GitHub Copilot para boilerplate
4. Preguntar a Claude Code para refactoring

### Métricas de Éxito MVP
- ✅ Backend responde en <100ms
- ✅ Frontend responsive 320px-1920px
- ✅ Tests >60% coverage
- ✅ Código cumple PEP 8
- ✅ Sin console.errors en producción
- ✅ PWA instala correctamente

---

**Versión:** 1.0.0  
**Fecha:** 2024  
**Autor:** Expense Tracker Team  
**Licencia:** Uso Personal

---

