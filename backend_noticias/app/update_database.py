import sys
import os
from sqlalchemy import inspect

# Agregar el directorio padre al path de Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Ahora importar los módulos
from app.database import engine
from app.models import ReporteNoticia

def update_database():
    """Agrega las tablas nuevas a la base de datos existente de forma segura"""
    try:
        # Verificar si la tabla ya existe
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        print("📋 Tablas existentes:", existing_tables)
        
        if 'reportes_noticias' not in existing_tables:
            print("🆕 Creando tabla de reportes...")
            ReporteNoticia.__table__.create(bind=engine)
            print("✅ Tabla de reportes creada exitosamente")
        else:
            print("ℹ️ La tabla de reportes ya existe, no se realizaron cambios")
            
        print("🎉 Base de datos actualizada correctamente")
        print("💾 Tus datos existentes están seguros")
        
    except Exception as e:
        print(f"❌ Error actualizando base de datos: {e}")

if __name__ == "__main__":
    update_database()