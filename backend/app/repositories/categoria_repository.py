from sqlalchemy.orm import Session
from ..models.categoria import Categoria
from .base import BaseRepository


class CategoriaRepository(BaseRepository[Categoria]):
    """Repository for Categoria model"""

    def __init__(self, db: Session):
        super().__init__(Categoria, db)

    def find_active(self) -> list[Categoria]:
        """Find all active categories"""
        return (
            self.db.query(Categoria)
            .filter(Categoria.activo == True)
            .order_by(Categoria.nombre)
            .all()
        )

    def find_by_nombre(self, nombre: str) -> Categoria | None:
        """Find category by name"""
        return self.db.query(Categoria).filter(Categoria.nombre == nombre).first()
