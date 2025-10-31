import pymysql
from app.config import settings

def create_database():
    """Crea la base de datos si no existe"""
    try:
        # Conectar sin especificar base de datos
        connection = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=int(settings.DB_PORT)
        )
        
        with connection.cursor() as cursor:
            # Crear base de datos si no existe
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME}")
            print(f"Base de datos '{settings.DB_NAME}' verificada/creada")
        
        connection.close()
        
    except Exception as e:
        print(f"Error creando base de datos: {e}")

if __name__ == "__main__":
    create_database()