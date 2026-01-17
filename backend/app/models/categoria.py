from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .gasto import Gasto


class Categoria(Base, TimestampMixin):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True)
    icono: Mapped[str | None] = mapped_column(String(50))
    color: Mapped[str | None] = mapped_column(String(7))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    gastos: Mapped[list["Gasto"]] = relationship(back_populates="categoria")
