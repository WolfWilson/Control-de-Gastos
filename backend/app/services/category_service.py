from sqlalchemy.orm import Session
from ..models.categoria import Categoria
from ..schemas.categoria import CategoriaCreate
from ..repositories.categoria_repository import CategoriaRepository
from ..utils.exceptions import CategoryNotFoundError, DuplicateCategoryError


class CategoryService:
    """Service for category business logic"""

    def __init__(self, db: Session):
        self.db = db
        self.categoria_repo = CategoriaRepository(db)

    def create_category(self, data: CategoriaCreate) -> Categoria:
        """Create a new category"""
        # Check if category with same name already exists
        existing = self.categoria_repo.find_by_nombre(data.nombre)
        if existing:
            raise DuplicateCategoryError(f"Category '{data.nombre}' already exists")

        categoria = Categoria(
            nombre=data.nombre,
            icono=data.icono,
            color=data.color,
            activo=data.activo
        )
        return self.categoria_repo.save(categoria)

    def get_category_by_id(self, category_id: int) -> Categoria:
        """Get category by ID"""
        categoria = self.categoria_repo.find_by_id(category_id)
        if not categoria:
            raise CategoryNotFoundError(f"Category {category_id} not found")
        return categoria

    def get_all_categories(self) -> list[Categoria]:
        """Get all categories"""
        return self.categoria_repo.find_all()

    def get_active_categories(self) -> list[Categoria]:
        """Get all active categories"""
        return self.categoria_repo.find_active()
