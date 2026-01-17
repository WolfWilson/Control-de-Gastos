from datetime import date
from decimal import Decimal
from sqlalchemy import String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .categoria import Categoria


class Gasto(Base, TimestampMixin):
    __tablename__ = "gastos"

    id: Mapped[int] = mapped_column(primary_key=True)
    monto: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    descripcion: Mapped[str] = mapped_column(String(255))
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"))
    fecha: Mapped[date] = mapped_column(Date)
    notas: Mapped[str | None] = mapped_column(Text)

    # Relationships
    categoria: Mapped["Categoria"] = relationship(back_populates="gastos")
