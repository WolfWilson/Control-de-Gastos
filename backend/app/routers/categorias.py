from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.categoria import CategoriaCreate, CategoriaResponse
from ..services.category_service import CategoryService
from ..utils.exceptions import CategoryNotFoundError, DuplicateCategoryError

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.post("", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoriaCreate,
    db: Session = Depends(get_db)
) -> CategoriaResponse:
    """
    Create a new category

    - **nombre**: Category name (must be unique)
    - **icono**: Optional emoji icon
    - **color**: Optional hex color (e.g., #10B981)
    - **activo**: Whether category is active (default: true)
    """
    try:
        service = CategoryService(db)
        return service.create_category(category)
    except DuplicateCategoryError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=list[CategoriaResponse])
async def get_categories(
    active_only: bool = False,
    db: Session = Depends(get_db)
) -> list[CategoriaResponse]:
    """
    Get all categories

    - **active_only**: If true, only return active categories
    """
    service = CategoryService(db)

    if active_only:
        return service.get_active_categories()
    else:
        return service.get_all_categories()


@router.get("/{category_id}", response_model=CategoriaResponse)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
) -> CategoriaResponse:
    """Get a specific category by ID"""
    try:
        service = CategoryService(db)
        return service.get_category_by_id(category_id)
    except CategoryNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
