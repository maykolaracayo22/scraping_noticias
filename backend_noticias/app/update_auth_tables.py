import sys
import os
from sqlalchemy import inspect

# Agregar el directorio padre al path para imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal
from app.models import Usuario
from app.crud_auth import crear_usuario_admin_inicial

def crear_tablas_autenticacion():
    """Crear solo las tablas nuevas de autenticación de forma segura"""
    try:
        # Verificar si la tabla ya existe
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        print("📋 Tablas existentes:", existing_tables)
        
        if 'usuarios' not in existing_tables:
            print("🆕 Creando tabla de usuarios...")
            Usuario.__table__.create(bind=engine)
            print("✅ Tabla de usuarios creada exitosamente")
        else:
            print("ℹ️ La tabla de usuarios ya existe, no se realizaron cambios")
        
        # Crear usuario admin inicial
        db = SessionLocal()
        try:
            crear_usuario_admin_inicial(db)
            print("✅ Usuario admin verificado: admin@newsperu.com / 123456")
        except Exception as e:
            print(f"⚠️  Usuario admin ya existe: {e}")
        finally:
            db.close()
            
        print("🎉 Base de datos de autenticación actualizada correctamente")
        print("💾 Tus datos de noticias están seguros")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    crear_tablas_autenticacion()