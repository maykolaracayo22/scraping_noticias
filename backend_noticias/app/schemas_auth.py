from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Schemas para autenticación
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioResponse(UsuarioBase):
    id: int
    rol: str
    plan: str
    activo: bool
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[str] = None

# Schemas para planes
class PlanInfo(BaseModel):
    plan_actual: str
    puede_exportar: bool
    puede_scraping_avanzado: bool