from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class GastoBase(BaseModel):
    monto: Decimal = Field(..., gt=0, decimal_places=2)
    descripcion: str = Field(..., max_length=255)
    categoria_id: int = Field(..., gt=0)
    fecha: date
    notas: str | None = None


class GastoCreate(GastoBase):
    pass


class GastoResponse(GastoBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime | None = None

    class Config:
        from_attributes = True


class MonthlySummary(BaseModel):
    """Resumen mensual de gastos"""
    year: int
    month: int
    total: Decimal
    count: int
    por_categoria: dict[str, Decimal] = {}
