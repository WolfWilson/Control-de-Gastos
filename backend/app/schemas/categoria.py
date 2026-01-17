from datetime import datetime
from pydantic import BaseModel, Field


class CategoriaBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    icono: str | None = Field(None, max_length=50)
    color: str | None = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    activo: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaResponse(CategoriaBase):
    id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True
