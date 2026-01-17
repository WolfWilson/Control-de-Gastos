from decimal import Decimal
from datetime import date
import pytest
from app.services.expense_service import ExpenseService
from app.services.category_service import CategoryService
from app.schemas.gasto import GastoCreate
from app.schemas.categoria import CategoriaCreate
from app.utils.exceptions import ExpenseNotFoundError, CategoryNotFoundError, DuplicateCategoryError


def test_create_expense(db_session, sample_categoria):
    """Test creating an expense through service"""
    service = ExpenseService(db_session)

    expense_data = GastoCreate(
        monto=Decimal("1500.50"),
        descripcion="Almuerzo",
        categoria_id=sample_categoria.id,
        fecha=date(2024, 1, 15),
        notas="Test"
    )

    expense = service.create_expense(expense_data)

    assert expense.id is not None
    assert expense.monto == Decimal("1500.50")
    assert expense.descripcion == "Almuerzo"


def test_create_expense_invalid_category(db_session):
    """Test creating expense with non-existent category"""
    service = ExpenseService(db_session)

    expense_data = GastoCreate(
        monto=Decimal("100.00"),
        descripcion="Test",
        categoria_id=999,
        fecha=date.today()
    )

    with pytest.raises(CategoryNotFoundError):
        service.create_expense(expense_data)


def test_get_expense_by_id(db_session, sample_categoria):
    """Test getting expense by ID"""
    service = ExpenseService(db_session)

    # Create expense first
    expense_data = GastoCreate(
        monto=Decimal("100.00"),
        descripcion="Test",
        categoria_id=sample_categoria.id,
        fecha=date.today()
    )
    created = service.create_expense(expense_data)

    # Get expense
    expense = service.get_expense_by_id(created.id)

    assert expense.id == created.id
    assert expense.descripcion == "Test"


def test_get_expense_not_found(db_session):
    """Test getting non-existent expense"""
    service = ExpenseService(db_session)

    with pytest.raises(ExpenseNotFoundError):
        service.get_expense_by_id(999)


def test_delete_expense(db_session, sample_categoria):
    """Test deleting expense"""
    service = ExpenseService(db_session)

    # Create expense
    expense_data = GastoCreate(
        monto=Decimal("100.00"),
        descripcion="Test",
        categoria_id=sample_categoria.id,
        fecha=date.today()
    )
    created = service.create_expense(expense_data)

    # Delete expense
    result = service.delete_expense(created.id)

    assert result is True

    # Verify deletion
    with pytest.raises(ExpenseNotFoundError):
        service.get_expense_by_id(created.id)


def test_create_category(db_session):
    """Test creating a category"""
    service = CategoryService(db_session)

    category_data = CategoriaCreate(
        nombre="Comida",
        icono="🍔",
        color="#10B981",
        activo=True
    )

    category = service.create_category(category_data)

    assert category.id is not None
    assert category.nombre == "Comida"


def test_create_duplicate_category(db_session):
    """Test creating category with duplicate name"""
    service = CategoryService(db_session)

    category_data = CategoriaCreate(
        nombre="Comida",
        icono="🍔",
        color="#10B981"
    )

    service.create_category(category_data)

    # Try to create duplicate
    with pytest.raises(DuplicateCategoryError):
        service.create_category(category_data)


def test_get_active_categories(db_session):
    """Test getting only active categories"""
    service = CategoryService(db_session)

    # Create active and inactive categories
    service.create_category(CategoriaCreate(nombre="Active", activo=True))
    service.create_category(CategoriaCreate(nombre="Inactive", activo=False))

    active = service.get_active_categories()

    assert len(active) == 1
    assert active[0].nombre == "Active"
