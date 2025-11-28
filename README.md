# 📰 News Aggregator – Sistema de Scraping y Gestión de Noticias

Sistema completo para **scraping, gestión y análisis de noticias peruanas**, con autenticación de usuarios, planes de servicio, análisis con IA y un panel administrativo completo.

---

## 📋 Descripción General

Este proyecto integra:

- Scraping automatizado de múltiples portales de noticias.
- API backend con FastAPI + MySQL.
- Frontend moderno construido con React + TypeScript.
- Modo Usuario y Modo Administrador.
- Planes Free y Plus.
- ChatBot con IA (Gemini AI).
- Exportación a Excel y filtros avanzados.

Ideal para aplicaciones de monitoreo de noticias, análisis informativo y automatización de recolección de datos.

---

## 🚀 Características Principales

### 🔧 Funciones Técnicas
- ✅ Scraping automático y manual de noticias peruanas  
- ✅ Autenticación JWT con roles (Admin / Usuario)  
- ✅ Sistema de planes (Free y Plus)  
- ✅ Análisis de noticias con Google Gemini AI  
- ✅ ChatBot inteligente integrado  
- ✅ Exportación a Excel con filtros  
- ✅ API RESTful documentada (FastAPI Docs)  
- ✅ Panel administrativo completo  
- ✅ Frontend responsivo y moderno  

---

# 🛠️ Instalación y Configuración

## 📌 Prerrequisitos

Asegúrate de tener instalado:

- **Python 3.10+**
- **Node.js 16+**
- **MySQL 8.0+**
- **Git**

---

## 📥 1. Clonar el Repositorio

```bash
git clone https://github.com/maykolaracayo22/scraping_noticias.git
cd scraping_noticias
🗄️ 2. Configuración de la Base de Datos (MySQL)
Crear base de datos manualmente:
sql
Copiar código
CREATE DATABASE news_aggregator_reddit;
O usar el script automático:
bash
Copiar código
cd backend_noticias
python create_database.py
🔧 3. Configuración del Backend (FastAPI)
Navegar al backend:
bash
Copiar código
cd backend_noticias
Instalar dependencias:
bash
Copiar código
pip install -r requirements.txt
Crear archivo .env:
env
Copiar código
# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_aggregator_reddit
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# Google AI (Gemini)
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI

# JWT
SECRET_KEY=tu_clave_secreta_muy_segura
ALGORITHM=HS256
Ejecutar el backend
bash
Copiar código
python main.py
Backend disponible en:
👉 http://localhost:8000
👉 Documentación API: http://localhost:8000/docs

🎨 4. Configuración del Frontend (React + TypeScript)
Navegar al frontend:
bash
Copiar código
cd frontend_noticias
Instalar dependencias:
bash
Copiar código
npm install
Ejecutar frontend:
bash
Copiar código
npm run dev
Frontend disponible en:
👉 http://localhost:5173

👤 5. Credenciales de Acceso
Administrador (por defecto):
makefile
Copiar código
Email: admin@newsperu.com  
Password: 123456
Usuarios Free:
Se registran desde el sistema

Obtienen automáticamente el plan Free

Pueden actualizar a Plus mediante Yape

🔑 6. Configuración Opcional – Google Gemini AI
Para activar el análisis de noticias con IA:

Obtener tu API Key desde Google AI Studio

Añadirla en el archivo .env:

env
Copiar código
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI
📁 Estructura del Proyecto
bash
Copiar código
scraping_noticias/
├── backend_noticias/          # FastAPI Backend
│   ├── app/
│   │   ├── models.py          # Modelos de la BD
│   │   ├── main.py            # Aplicación principal
│   │   ├── crud.py            # Operaciones de BD
│   │   └── scraper.py         # Lógica de scraping
│   ├── requirements.txt
│   └── .env
│
├── frontend_noticias/         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── api/
│   └── package.json
│
└── README.md
🎯 Funcionalidades por Plan
🆓 Plan Free
Lectura de todas las noticias

Scraping básico

Búsqueda y filtros

Reportar noticias

Registro con correo

⭐ Plan Plus (S/ 19.90 mensual)
Incluye todo lo del Free y además:

Análisis de noticias con IA

ChatBot inteligente

Exportación avanzada a Excel

Scraping avanzado

Más velocidad y más fuentes

🐛 Solución de Problemas Comunes
❌ Error de conexión a MySQL
Verifica que MySQL está corriendo

Confirma usuario y contraseña en .env

Asegura que la BD news_aggregator_reddit existe

❌ Puerto en uso
Cambiar puerto backend (main.py):

python
Copiar código
uvicorn.run(app, host="0.0.0.0", port=8001)
Cambiar puerto frontend (vite.config.ts):

ts
Copiar código
server: { port: 5174 }
❌ Error de dependencias
bash
Copiar código
pip install -r requirements.txt --force-reinstall

rm -rf node_modules package-lock.json
npm install
🚀 Comandos Rápidos de Despliegue
Terminal 1 — Backend
bash
Copiar código
cd backend_noticias
python main.py
Terminal 2 — Frontend
bash
Copiar código
cd frontend_noticias
npm run dev
Sistema activo en:
👉 http://localhost:5173 🎉

📞 Soporte
Si encuentras problemas:

Verifica prerrequisitos

Confirma que backend y frontend están activos

Revisa el archivo .env

Revisa logs de consola

🏁 Estado del Proyecto
✔ Proyecto funcional
✔ Scraping operativo
✔ Sistema de usuarios completo
✔ IA integrada
✔ Listo para producción y demostraciones
