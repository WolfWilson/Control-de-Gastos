# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Progressive Web App (PWA) for personal expense tracking. Mobile-first architecture, modular design, Spanish language for database/backend, English for code identifiers.

**Stack**: FastAPI + SQLAlchemy + SQLite (backend), Vanilla JS + CSS3 + HTML5 (frontend)

## Project Structure

The project follows a clear separation between backend and frontend:

```
backend/
  app/
    models/          # SQLAlchemy models (DB tables: gastos, categorias)
    schemas/         # Pydantic validation schemas
    repositories/    # Data access layer
    services/        # Business logic (orchestration)
    routers/         # API endpoints
    utils/           # Custom exceptions, helpers
  tests/             # pytest tests

frontend/
  css/               # variables.css, base.css, layout.css, components.css
  js/                # app.js (main), api.js (fetch), utils.js (formatters)
  assets/icons/      # PWA icons
  index.html         # Single page app entry
  manifest.json      # PWA manifest
  sw.js              # Service worker
```

## Architecture Patterns

**Backend follows layered architecture**:
- **Models** (SQLAlchemy): DB table definitions with Spanish column names (`monto`, `descripcion`, `categoria_id`, `fecha_creacion`)
- **Schemas** (Pydantic): Request/response validation with English class names (`ExpenseCreate`, `ExpenseResponse`)
- **Repositories**: Database operations only (`save()`, `find_by_id()`)
- **Services**: Business logic orchestration, uses repositories
- **Routers**: HTTP endpoints, thin layer that delegates to services

**Dependency Injection**: Use FastAPI's `Depends()` for database sessions and service instances.

**SOLID Principles**: Single Responsibility is critical - repositories handle data, validators handle rules, services orchestrate.

## Naming Conventions

**Database** (Spanish, snake_case):
- Tables: Plural (`gastos`, `categorias`, `suscripciones`)
- Columns: Singular (`monto`, `descripcion`, `fecha_creacion`)
- PKs: Always `id` (INTEGER AUTOINCREMENT)
- FKs: `{tabla_singular}_id` (`categoria_id`, `usuario_id`)
- Timestamps: `fecha_creacion`, `fecha_actualizacion` (DATETIME UTC)

**Python** (English, PEP 8):
- Classes: `PascalCase` (`ExpenseService`, `ExpenseRepository`)
- Functions: `snake_case` with verbs (`create_expense`, `get_expenses_by_month`)
- Variables: `snake_case` (`expense_data`, `monthly_total`)
- Constants: `UPPER_SNAKE_CASE` (`DATABASE_URL`, `MAX_DESCRIPTION_LENGTH`)
- **Type hints are mandatory** on all functions

**Frontend**:
- CSS: BEM-like naming, mobile-first (base styles for 320px+, media queries for 768px+, 1024px+)
- JavaScript: `camelCase` for functions/variables, ES6+ modules

## Database Schema

**categorias**:
- 7 predefined categories with emoji icons and hex colors
- Fields: `id`, `nombre`, `icono`, `color`, `activo`, `fecha_creacion`

**gastos**:
- Core expense tracking table
- Fields: `id`, `monto` (REAL, must be > 0), `descripcion`, `categoria_id` (FK), `fecha` (DATE), `notas` (TEXT), `fecha_creacion`, `fecha_actualizacion`
- Indexes on: `fecha DESC`, `categoria_id`, `fecha_creacion DESC`

## Development Workflow

**Environment Setup**:
```bash
# Backend (from project root)
cd backend
python -m venv venv
venv\Scripts\activate              # Windows
source venv/bin/activate           # Linux/Mac
pip install -r requirements.txt

# Frontend (separate terminal)
cd frontend
python -m http.server 3000
```

**Run Backend**:
```bash
cd backend
uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

**Database Initialization**:
Database tables are created automatically via `init_db()` in `database.py` using SQLAlchemy's `Base.metadata.create_all()`. Initial categories are inserted via SQL in schema.

**Testing**:
```bash
cd backend
pytest                                    # All tests
pytest --cov=app --cov-report=html       # With coverage
pytest tests/test_expenses.py::test_create_expense -v  # Single test
```
Target: >60% coverage for MVP.

## Key Configuration

**backend/.env** (create from .env.example):
- `DATABASE_URL`: SQLite path (default: `sqlite:///./expenses.db`)
- `CORS_ORIGINS`: Frontend URLs for CORS
- `DEBUG`: Boolean for development mode

**backend/app/config.py**: Pydantic Settings class that loads from .env

## API Design

REST endpoints follow pattern: `/api/{resource}` with standard HTTP methods.

**Response models**: Always use Pydantic schemas in `response_model` parameter.

**Error handling**: Custom exceptions in `utils/exceptions.py` (e.g., `ExpenseNotFoundError`), caught in routers and converted to HTTPException with appropriate status codes.

## MVP Scope

Current phase focuses on:
1. CRUD for expenses (Create, Read, Delete - no Update yet)
2. List predefined categories
3. Monthly dashboard summary
4. Mobile-first responsive UI
5. Basic PWA support (manifest, service worker stub)

**Out of scope for MVP**: Edit expenses, advanced filters, charts, subscriptions, multi-currency, authentication.

## Code Quality Standards

- **Type hints required**: All function signatures must include parameter and return types
- **Docstrings**: Only on complex business logic, not obvious CRUD operations
- **Error handling**: Validate at system boundaries (user input, external APIs), trust internal code
- **No over-engineering**: Don't add abstractions, error handling, or features beyond current requirements
- **Mobile-first CSS**: Base styles for small screens, progressive enhancement for larger viewports
- **JavaScript modules**: Use ES6 `import`/`export`, no bundler needed

## Spanish-English Hybrid Approach

- **Database layer** (models, SQL): Spanish (`Gasto`, `monto`, `descripcion`)
- **API layer** (schemas, services, routers): English class names, Spanish in docstrings when helpful
- **Frontend**: Spanish for user-facing text, English for code identifiers
- **Comments/docs**: Primarily Spanish as developer is Spanish speaker

This hybrid approach maintains clarity at each layer while respecting the bilingual development context.
