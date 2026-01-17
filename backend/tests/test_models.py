from decimal import Decimal
from datetime import date
from app.models.categoria import Categoria
from app.models.gasto import Gasto


def test_create_categoria(db_session):
    """Test creating a category"""
    categoria = Categoria(
        nombre="Comida",
        icono="🍔",
        color="#10B981",
        activo=True
    )

    db_session.add(categoria)
    db_session.commit()
    db_session.refresh(categoria)

    assert categoria.id is not None
    assert categoria.nombre == "Comida"
    assert categoria.icono == "🍔"
    assert categoria.color == "#10B981"
    assert categoria.activo is True
    assert categoria.fecha_creacion is not None


def test_create_gasto(db_session, sample_categoria):
    """Test creating an expense"""
    gasto = Gasto(
        monto=Decimal("1500.50"),
        descripcion="Almuerzo",
        categoria_id=sample_categoria.id,
        fecha=date(2024, 1, 15),
        notas="Test note"
    )

    db_session.add(gasto)
    db_session.commit()
    db_session.refresh(gasto)

    assert gasto.id is not None
    assert gasto.monto == Decimal("1500.50")
    assert gasto.descripcion == "Almuerzo"
    assert gasto.categoria_id == sample_categoria.id
    assert gasto.fecha == date(2024, 1, 15)
    assert gasto.notas == "Test note"
    assert gasto.fecha_creacion is not None


def test_gasto_categoria_relationship(db_session, sample_categoria):
    """Test relationship between Gasto and Categoria"""
    gasto = Gasto(
        monto=Decimal("100.00"),
        descripcion="Test",
        categoria_id=sample_categoria.id,
        fecha=date.today()
    )

    db_session.add(gasto)
    db_session.commit()
    db_session.refresh(gasto)

    # Test relationship
    assert gasto.categoria.nombre == sample_categoria.nombre
    assert len(sample_categoria.gastos) == 1
    assert sample_categoria.gastos[0].id == gasto.id
