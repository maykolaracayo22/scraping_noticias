import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from app.database import engine, SessionLocal
from app.models import Base

def actualizar_tabla_noticias():
    """Agregar columnas de resumen a la tabla noticias"""
    try:
        # Usar ALTER TABLE para agregar las columnas
        with engine.connect() as conn:
            # Verificar si las columnas ya existen
            conn.execute("""
                ALTER TABLE noticias 
                ADD COLUMN IF NOT EXISTS resumen TEXT NULL,
                ADD COLUMN IF NOT EXISTS resumen_ia BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS fecha_resumen DATETIME NULL
            """)
            print("✅ Columnas de resumen agregadas/verificadas exitosamente")
            
    except Exception as e:
        print(f"❌ Error actualizando tabla noticias: {e}")

if __name__ == "__main__":
    actualizar_tabla_noticias()