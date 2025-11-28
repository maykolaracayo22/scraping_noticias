from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Schemas para Reportes
class ReporteBase(BaseModel):
    noticia_id: int
    motivo: str

class ReporteCreate(ReporteBase):
    pass

class ReporteUpdate(BaseModel):
    estado: str
    notas_admin: Optional[str] = None

class Reporte(ReporteBase):
    id: int
    estado: str
    fecha_reporte: datetime
    fecha_revision: Optional[datetime]
    notas_admin: Optional[str]
    
    class Config:
        from_attributes = True

class ReporteConNoticia(Reporte):
    titulo_noticia: str
    fuente_noticia: str
    enlace_noticia: str

class EstadisticasReportes(BaseModel):
    total_reportes: int
    reportes_pendientes: int
    reportes_revisados: int
    reportes_por_estado: dict
    noticias_mas_reportadas: List[dict]