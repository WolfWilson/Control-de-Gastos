from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from ..models.gasto import Gasto
from ..schemas.gasto import GastoCreate, MonthlySummary
from ..repositories.gasto_repository import GastoRepository
from ..repositories.categoria_repository import CategoriaRepository
from ..utils.exceptions import ExpenseNotFoundError, CategoryNotFoundError


class ExpenseService:
    """Service for expense business logic"""

    def __init__(self, db: Session):
        self.db = db
        self.gasto_repo = GastoRepository(db)
        self.categoria_repo = CategoriaRepository(db)

    def create_expense(self, data: GastoCreate) -> Gasto:
        """Create a new expense"""
        # Validate that category exists
        categoria = self.categoria_repo.find_by_id(data.categoria_id)
        if not categoria:
            raise CategoryNotFoundError(f"Category {data.categoria_id} not found")

        # Create expense
        expense = Gasto(
            monto=data.monto,
            descripcion=data.descripcion,
            categoria_id=data.categoria_id,
            fecha=data.fecha,
            notas=data.notas
        )
        return self.gasto_repo.save(expense)

    def get_expense_by_id(self, expense_id: int) -> Gasto:
        """Get expense by ID"""
        expense = self.gasto_repo.find_by_id(expense_id)
        if not expense:
            raise ExpenseNotFoundError(f"Expense {expense_id} not found")
        return expense

    def get_all_expenses(self) -> list[Gasto]:
        """Get all expenses"""
        return self.gasto_repo.find_all()

    def get_recent_expenses(self, limit: int = 10) -> list[Gasto]:
        """Get most recent expenses"""
        return self.gasto_repo.find_recent(limit)

    def get_expenses_by_month(self, year: int, month: int) -> list[Gasto]:
        """Get expenses for a specific month"""
        return self.gasto_repo.find_by_month(year, month)

    def get_expenses_by_categoria(self, categoria_id: int) -> list[Gasto]:
        """Get expenses by category"""
        return self.gasto_repo.find_by_categoria(categoria_id)

    def delete_expense(self, expense_id: int) -> bool:
        """Delete expense by ID"""
        expense = self.get_expense_by_id(expense_id)
        self.gasto_repo.delete(expense)
        return True

    def get_monthly_summary(self, year: int, month: int) -> MonthlySummary:
        """Calculate monthly expense summary"""
        expenses = self.gasto_repo.find_by_month(year, month)

        total = sum(expense.monto for expense in expenses)
        count = len(expenses)

        # Group by category
        por_categoria: dict[str, Decimal] = {}
        for expense in expenses:
            categoria_nombre = expense.categoria.nombre
            if categoria_nombre not in por_categoria:
                por_categoria[categoria_nombre] = Decimal(0)
            por_categoria[categoria_nombre] += expense.monto

        return MonthlySummary(
            year=year,
            month=month,
            total=Decimal(total),
            count=count,
            por_categoria=por_categoria
        )

    def get_current_month_summary(self) -> MonthlySummary:
        """Get summary for current month"""
        today = datetime.now()
        return self.get_monthly_summary(today.year, today.month)
