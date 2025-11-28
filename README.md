# 📰 News Aggregator – Sistema de Scraping y Gestión de Noticias

Sistema completo para **scraping, gestión y análisis de noticias peruanas**, con autenticación de usuarios, planes de servicio, análisis con IA y un panel administrativo completo.

---

## 📋 Descripción General

Este proyecto integra:

- Scraping automatizado de múltiples portales de noticias.  
- API backend con **FastAPI + MySQL**.  
- Frontend moderno construido con **React + TypeScript**.  
- Modo **Usuario** y modo **Administrador**.  
- Planes **Free** y **Plus**.  
- ChatBot con IA (Gemini AI).  
- Exportación a Excel y filtros avanzados.

Ideal para aplicaciones de monitoreo de noticias, análisis informativo y automatización de recolección de datos.

---

## 🚀 Características Principales

**Funciones Técnicas**
- ✅ Scraping automático y manual de noticias peruanas  
- ✅ Autenticación JWT con roles (Admin / Usuario)  
- ✅ Sistema de planes (Free y Plus)  
- ✅ Análisis de noticias con Google Gemini AI (opcional)  
- ✅ ChatBot inteligente integrado  
- ✅ Exportación a Excel con filtros  
- ✅ API RESTful documentada (FastAPI Docs)  
- ✅ Panel administrativo completo  
- ✅ Frontend responsivo y moderno

---

## 🛠️ Instalación y Configuración

### 📌 Prerrequisitos

Asegúrate de tener instalados:
- **Python 3.10+**  
- **Node.js 16+** (o superior)  
- **MySQL 8.0+**  
- **Git**

---

### 📥 1. Clonar el Repositorio

```bash
git clone https://github.com/maykolaracayo22/scraping_noticias.git
cd scraping_noticias
🗄️ 2. Configuración de la Base de Datos (MySQL)
Opción A — Crear la base de datos manualmente
Conéctate a tu servidor MySQL (MySQL Workbench, línea de comandos o Laragon) y ejecuta:

sql
Copiar código
CREATE DATABASE news_aggregator_reddit;
Opción B — Usar el script automático (si existe)
Si incluiste un script para crear la BD:

bash
Copiar código
cd backend_noticias
python create_database.py
Nota: verifica el contenido de create_database.py y asegúrate de que use las credenciales correctas o lee variables desde .env.

🔧 3. Configuración del Backend (FastAPI)
Entrar al directorio del backend

bash
Copiar código
cd backend_noticias
Instalar dependencias de Python

Si usas Python del sistema (no venv), ejecuta:

bash
Copiar código
pip install -r requirements.txt
Crear archivo .env en backend_noticias/

Crea un archivo .env con las variables necesarias. Ejemplo:

env
Copiar código
# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_aggregator_reddit
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# Google AI (Gemini) - opcional
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI

# JWT
SECRET_KEY=tu_clave_secreta_muy_segura
ALGORITHM=HS256
Ejecutar el backend

Si el entrypoint es main.py que arranca uvicorn:

bash
Copiar código
python main.py
o, si usas uvicorn directamente:

bash
Copiar código
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Backend disponible en: http://localhost:8000

Documentación automática de FastAPI: http://localhost:8000/docs

🎨 4. Configuración del Frontend (React + TypeScript)
Abrir nueva terminal y navegar al frontend

bash
Copiar código
cd frontend_noticias
Instalar dependencias Node.js

bash
Copiar código
npm install
Configurar variables del frontend (si aplica)

Si el frontend usa un archivo .env (ej. .env.local) añade la URL del backend:

env
Copiar código
VITE_API_BASE_URL=http://localhost:8000
Ejecutar el frontend (modo desarrollo)

bash
Copiar código
npm run dev
Frontend disponible en: http://localhost:5173 (o el puerto que Vite asigne)

👤 5. Credenciales de Acceso (ejemplo)
Administrador (por defecto):

makefile
Copiar código
Email: admin@newsperu.com  
Password: 123456
Usuarios Free:

Se registran desde la interfaz (registro público).

Se les asigna el plan Free por defecto.

Pueden actualizar a Plus mediante el método de pago configurado (ej. Yape).

➤ Importante: cambia la contraseña por defecto antes de desplegar en producción.

🔑 6. Configuración Opcional – Google Gemini AI
Para activar funciones de IA (análisis automático de noticias, ChatBot), necesitas:

Obtener una API Key de Google AI Studio (Gemini).

Añadirla a .env:

env
Copiar código
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI
Reiniciar el backend para que lea las nuevas variables.

📁 Estructura del Proyecto
bash
Copiar código
scraping_noticias/
├── backend_noticias/          # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Aplicación principal (uvicorn / FastAPI)
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   ├── database.py        # Conexión a MySQL
│   │   ├── crud.py            # Funciones CRUD
│   │   ├── scraper.py         # Lógica de scraping
│   │   └── routers/           # Endpoints API (noticias, usuarios, admin, etc.)
│   ├── requirements.txt
│   └── .env
│
├── frontend_noticias/         # React Frontend (Vite / CRA)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── assets/
│   └── package.json
│
└── README.md
🎯 Funcionalidades por Plan
🆓 Plan Free
Lectura de todas las noticias

Scraping básico (fuentes predefinidas)

Búsqueda y filtros

Reporte de noticias

Registro con correo

⭐ Plan Plus (S/ 19.90 mensual)
Incluye todo lo del Free y además:

Análisis de noticias con IA (Gemini)

ChatBot inteligente

Exportación avanzada a Excel

Scraping avanzado (más frecuencia / más fuentes)

Prioridad en soporte

🐛 Solución de Problemas Comunes
❌ Error de conexión a MySQL
Verifica que MySQL esté en ejecución (Laragon / servicio local).

Confirma credenciales en backend_noticias/.env.

Asegúrate que la base de datos news_aggregator_reddit exista.

❌ Puerto en uso
Cambiar puerto backend (ejemplo en main.py o al invocar uvicorn):

python
Copiar código
uvicorn.run(app, host="0.0.0.0", port=8001)
Cambiar puerto frontend (Vite — vite.config.ts):

ts
Copiar código
export default defineConfig({
  server: {
    port: 5174
  }
})
❌ Problemas con dependencias
Reinstalar dependencias Python:

bash
Copiar código
pip install -r requirements.txt --force-reinstall
Reinstalar dependencias Node:

bash
Copiar código
rm -rf node_modules package-lock.json
npm install
🚀 Comandos Rápidos de Despliegue
Terminal 1 — Backend

bash
Copiar código
cd backend_noticias
python main.py
# o
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Terminal 2 — Frontend

bash
Copiar código
cd frontend_noticias
npm run dev
Luego abre: http://localhost:5173

📞 Soporte
Si encuentras problemas:

Revisa que hayas cumplido los prerrequisitos.

Asegúrate de que el archivo .env esté configurado correctamente.

Verifica que backend y frontend estén corriendo.

Revisa logs de backend (consola donde ejecutaste python main.py o uvicorn).

🏁 Estado del Proyecto
✔ Proyecto funcional (desarrollo)

✔ Scraping operativo

✔ Sistema de usuarios completo (roles Admin/Usuario)

✔ IA integrada (opcional)

✔ Listo para pruebas y demostraciones

✨ Contribuciones
Si quieres contribuir:

Haz fork del repositorio.

Crea una rama: git checkout -b feature/nueva-funcionalidad.

Haz commit de tus cambios y sube tu PR.
