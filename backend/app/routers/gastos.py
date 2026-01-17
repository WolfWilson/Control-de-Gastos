from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.gasto import GastoCreate, GastoResponse, MonthlySummary
from ..services.expense_service import ExpenseService
from ..utils.exceptions import ExpenseNotFoundError, CategoryNotFoundError

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.post("", response_model=GastoResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense: GastoCreate,
    db: Session = Depends(get_db)
) -> GastoResponse:
    """
    Create a new expense

    - **monto**: Amount spent (must be positive)
    - **descripcion**: Expense description
    - **categoria_id**: Category ID
    - **fecha**: Expense date
    - **notas**: Optional notes
    """
    try:
        service = ExpenseService(db)
        return service.create_expense(expense)
    except CategoryNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("", response_model=list[GastoResponse])
async def get_expenses(
    year: int | None = Query(None, description="Filter by year"),
    month: int | None = Query(None, ge=1, le=12, description="Filter by month"),
    categoria_id: int | None = Query(None, description="Filter by category ID"),
    limit: int | None = Query(None, ge=1, le=100, description="Limit results"),
    db: Session = Depends(get_db)
) -> list[GastoResponse]:
    """
    Get expenses with optional filters

    - **year**: Filter by year
    - **month**: Filter by month (1-12)
    - **categoria_id**: Filter by category
    - **limit**: Maximum number of results
    """
    service = ExpenseService(db)

    if year and month:
        return service.get_expenses_by_month(year, month)
    elif categoria_id:
        return service.get_expenses_by_categoria(categoria_id)
    elif limit:
        return service.get_recent_expenses(limit)
    else:
        return service.get_all_expenses()


@router.get("/{expense_id}", response_model=GastoResponse)
async def get_expense(
    expense_id: int,
    db: Session = Depends(get_db)
) -> GastoResponse:
    """Get a specific expense by ID"""
    try:
        service = ExpenseService(db)
        return service.get_expense_by_id(expense_id)
    except ExpenseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    """Delete an expense"""
    try:
        service = ExpenseService(db)
        service.delete_expense(expense_id)
    except ExpenseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/dashboard/monthly", response_model=MonthlySummary)
async def get_monthly_summary(
    year: int | None = Query(None, description="Year"),
    month: int | None = Query(None, ge=1, le=12, description="Month (1-12)"),
    db: Session = Depends(get_db)
) -> MonthlySummary:
    """
    Get monthly expense summary

    If year and month are not provided, returns current month summary
    """
    service = ExpenseService(db)

    if year and month:
        return service.get_monthly_summary(year, month)
    else:
        return service.get_current_month_summary()
