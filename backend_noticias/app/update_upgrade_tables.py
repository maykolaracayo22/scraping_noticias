import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from app.database import engine
from app.models import SolicitudUpgrade, Pago

def crear_tablas_upgrade():
    """Crear las tablas nuevas de upgrade"""
    try:
        # Crear solo las tablas nuevas
        SolicitudUpgrade.__table__.create(bind=engine, checkfirst=True)
        Pago.__table__.create(bind=engine, checkfirst=True)
        print("✅ Tablas de upgrade creadas/verificadas exitosamente")
        
        # Verificar que se crearon
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tablas = inspector.get_table_names()
        print("📋 Tablas existentes:", [t for t in tablas if 'solicitud' in t or 'pago' in t])
        
    except Exception as e:
        print(f"❌ Error creando tablas de upgrade: {e}")

if __name__ == "__main__":
    crear_tablas_upgrade()