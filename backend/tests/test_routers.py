from decimal import Decimal
from datetime import date


def test_create_expense(client, sample_categoria):
    """Test POST /api/expenses"""
    categoria_id = sample_categoria.id  # Get ID before session closes

    response = client.post(
        "/api/expenses",
        json={
            "monto": 1500.50,
            "descripcion": "Almuerzo",
            "categoria_id": categoria_id,
            "fecha": "2024-01-15",
            "notas": "Test"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["monto"] == "1500.50"
    assert data["descripcion"] == "Almuerzo"
    assert data["categoria_id"] == categoria_id


def test_create_expense_invalid_category(client):
    """Test creating expense with invalid category"""
    response = client.post(
        "/api/expenses",
        json={
            "monto": 100.00,
            "descripcion": "Test",
            "categoria_id": 999,
            "fecha": "2024-01-15"
        }
    )

    assert response.status_code == 404


def test_get_expenses(client, sample_categoria):
    """Test GET /api/expenses"""
    # Create an expense first
    client.post(
        "/api/expenses",
        json={
            "monto": 100.00,
            "descripcion": "Test",
            "categoria_id": sample_categoria.id,
            "fecha": str(date.today())
        }
    )

    response = client.get("/api/expenses")

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["descripcion"] == "Test"


def test_get_expense_by_id(client, sample_categoria):
    """Test GET /api/expenses/{id}"""
    # Create expense
    create_response = client.post(
        "/api/expenses",
        json={
            "monto": 100.00,
            "descripcion": "Test",
            "categoria_id": sample_categoria.id,
            "fecha": str(date.today())
        }
    )
    expense_id = create_response.json()["id"]

    # Get expense
    response = client.get(f"/api/expenses/{expense_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == expense_id


def test_delete_expense(client, sample_categoria):
    """Test DELETE /api/expenses/{id}"""
    # Create expense
    create_response = client.post(
        "/api/expenses",
        json={
            "monto": 100.00,
            "descripcion": "Test",
            "categoria_id": sample_categoria.id,
            "fecha": str(date.today())
        }
    )
    expense_id = create_response.json()["id"]

    # Delete expense
    response = client.delete(f"/api/expenses/{expense_id}")

    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/expenses/{expense_id}")
    assert get_response.status_code == 404


def test_get_monthly_summary(client):
    """Test GET /api/expenses/dashboard/monthly"""
    response = client.get("/api/expenses/dashboard/monthly")

    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "count" in data
    assert "year" in data
    assert "month" in data


def test_get_categories(client, sample_categoria):
    """Test GET /api/categories"""
    response = client.get("/api/categories?active_only=true")

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0


def test_create_category(client):
    """Test POST /api/categories"""
    response = client.post(
        "/api/categories",
        json={
            "nombre": "Nueva Categoría",
            "icono": "🎯",
            "color": "#FF5733",
            "activo": True
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Nueva Categoría"


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
