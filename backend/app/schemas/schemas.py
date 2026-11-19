from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    correo: str = Field(..., max_length=150)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    acepto_privacidad: bool = True


class UserResponse(UserBase):
    id: int
    rol: str
    activo: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ColoniaBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    sector: str = Field(..., min_length=2, max_length=100)


class ColoniaCreate(ColoniaBase):
    pass


class ColoniaResponse(ColoniaBase):
    id: int
    activa: bool
    model_config = ConfigDict(from_attributes=True)


class ReporteBase(BaseModel):
    tipo: str = Field(..., description="bache, hundimiento, grieta, alcantarilla_sin_tapa, encharcamiento")
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)
    calle: str = Field(..., min_length=2, max_length=200)
    colonia_id: Optional[int] = None
    severidad_o_nivel: Optional[str] = Field(default=None, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)


class ReporteCreate(ReporteBase):
    pass


class ReporteResponse(ReporteBase):
    id: int
    folio: str
    estado: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)