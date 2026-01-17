from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from ..models.gasto import Gasto
from .base import BaseRepository


class GastoRepository(BaseRepository[Gasto]):
    """Repository for Gasto model"""

    def __init__(self, db: Session):
        super().__init__(Gasto, db)

    def find_by_date_range(self, start_date: date, end_date: date) -> list[Gasto]:
        """Find expenses within a date range"""
        return (
            self.db.query(Gasto)
            .filter(Gasto.fecha >= start_date, Gasto.fecha <= end_date)
            .order_by(Gasto.fecha.desc())
            .all()
        )

    def find_by_month(self, year: int, month: int) -> list[Gasto]:
        """Find expenses for a specific month"""
        return (
            self.db.query(Gasto)
            .filter(
                extract('year', Gasto.fecha) == year,
                extract('month', Gasto.fecha) == month
            )
            .order_by(Gasto.fecha.desc())
            .all()
        )

    def find_by_categoria(self, categoria_id: int) -> list[Gasto]:
        """Find expenses by category"""
        return (
            self.db.query(Gasto)
            .filter(Gasto.categoria_id == categoria_id)
            .order_by(Gasto.fecha.desc())
            .all()
        )

    def find_recent(self, limit: int = 10) -> list[Gasto]:
        """Find most recent expenses"""
        return (
            self.db.query(Gasto)
            .order_by(Gasto.fecha.desc(), Gasto.fecha_creacion.desc())
            .limit(limit)
            .all()
        )

    def get_monthly_total(self, year: int, month: int) -> float:
        """Get total expenses for a specific month"""
        result = (
            self.db.query(func.sum(Gasto.monto))
            .filter(
                extract('year', Gasto.fecha) == year,
                extract('month', Gasto.fecha) == month
            )
            .scalar()
        )
        return float(result) if result else 0.0
