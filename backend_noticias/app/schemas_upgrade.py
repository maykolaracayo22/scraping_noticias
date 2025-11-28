from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class SolicitudUpgradeBase(BaseModel):
    plan_solicitado: str
    codigo_yape: str

class SolicitudUpgradeCreate(BaseModel):
    plan_solicitado: str
    codigo_yape: str

class SolicitudUpgradeUpdate(BaseModel):
    estado: str
    notas_admin: Optional[str] = None

class SolicitudUpgradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # ← Esto reemplaza la clase Config
    
    id: int
    usuario_id: int
    plan_solicitado: str
    codigo_yape: str
    monto: int
    estado: str
    fecha_solicitud: datetime
    fecha_revision: Optional[datetime] = None
    notas_admin: Optional[str] = None
    usuario_nombre: str
    usuario_email: str

class PagoCreate(BaseModel):
    solicitud_upgrade_id: int
    codigo_confirmacion: str

class PagoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    solicitud_upgrade_id: int
    monto: int
    moneda: str
    metodo_pago: str
    estado: str
    fecha_pago: datetime
    codigo_confirmacion: str