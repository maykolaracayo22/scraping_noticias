📰 News Aggregator – Sistema de Scraping y Gestión de Noticias
Sistema completo para scraping, gestión y análisis de noticias peruanas, con autenticación de usuarios, planes de servicio, análisis con IA y un panel administrativo completo.

📋 Descripción General
Este proyecto integra:

Scraping automatizado de múltiples portales de noticias.

API backend con FastAPI + MySQL.

Frontend moderno construido con React + TypeScript.

Modo Usuario y Modo Administrador.

Planes Free y Plus.

ChatBot con IA (Gemini AI).

Exportación a Excel y filtros avanzados.

Ideal para aplicaciones de monitoreo de noticias, análisis informativo y automatización de recolección de datos.

🚀 Características Principales
🔧 Funciones Técnicas
✅ Scraping automático y manual de noticias peruanas

✅ Autenticación JWT con roles (Admin / Usuario)

✅ Sistema de planes (Free y Plus)

✅ Análisis de noticias con Google Gemini AI

✅ ChatBot inteligente integrado

✅ Exportación a Excel con filtros

✅ API RESTful documentada (FastAPI Docs)

✅ Panel administrativo completo

✅ Frontend responsivo y moderno

🛠️ Instalación y Configuración
📌 Prerrequisitos
Asegúrate de tener instalado:

Python 3.10+

Node.js 16+

MySQL 8.0+

Git

📥 1. Clonar el Repositorio
bash
git clone https://github.com/maykolaracayo22/scraping_noticias.git
cd scraping_noticias
🗄️ 2. Configuración de la Base de Datos (MySQL)
Crear base de datos:

sql
CREATE DATABASE news_aggregator_reddit;
O usar script automático:

bash
cd backend_noticias
python create_database.py
🔧 3. Configuración del Backend (FastAPI)
Navegar al backend:

bash
cd backend_noticias
Instalar dependencias:

bash
pip install -r requirements.txt
Configurar variables de entorno:
Crear archivo .env:

env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_aggregator_reddit
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI
SECRET_KEY=tu_clave_secreta_muy_segura
ALGORITHM=HS256
Ejecutar backend:

bash
python main.py
Disponible en: http://localhost:8000

🎨 4. Configuración del Frontend (React + TypeScript)
Navegar al frontend:

bash
cd frontend_noticias
Instalar dependencias:

bash
npm install
Ejecutar frontend:

bash
npm run dev
Disponible en: http://localhost:5173

👤 5. Credenciales de Acceso
Administrador:

Email: admin@newsperu.com

Password: 123456

Usuarios Free:

Registro automático con plan Free

Actualización a Plus mediante Yape

🔑 6. Configuración Opcional - Google AI (Gemini)
Para habilitar análisis con IA:

Obtener API key de Google AI Studio

Agregar en .env:

env
GOOGLE_AI_API_KEY=TU_API_KEY_AQUI
📁 Estructura del Proyecto
text
scraping_noticias/
├── backend_noticias/
│   ├── app/
│   │   ├── models.py
│   │   ├── main.py
│   │   ├── crud.py
│   │   └── scraper.py
│   ├── requirements.txt
│   └── .env
├── frontend_noticias/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── api/
│   └── package.json
└── README.md
🎯 Funcionalidades por Plan
🆓 Plan Free
✅ Lectura de todas las noticias

✅ Scraping básico

✅ Búsqueda y filtros

✅ Reportar noticias

⭐ Plan Plus (S/ 19.90 mensual)
✅ Todo lo del plan Free

✅ Análisis con IA de noticias

✅ ChatBot inteligente

✅ Exportación a Excel

✅ Scraping avanzado

🐛 Solución de Problemas Comunes
Error de conexión a MySQL:

Verificar que MySQL esté ejecutándose

Confirmar credenciales en .env

Asegurar que la base de datos existe

Error de puertos ocupados:

bash
# Backend - cambiar puerto en main.py
# Frontend - cambiar puerto en vite.config.ts
Error de dependencias:

bash
# Backend
pip install -r requirements.txt --force-reinstall

# Frontend
rm -rf node_modules package-lock.json
npm install
🚀 Comandos Rápidos de Despliegue
Terminal 1 - Backend:

bash
cd backend_noticias && python main.py
Terminal 2 - Frontend:

bash
cd frontend_noticias && npm run dev
¡Sistema funcionando en: http://localhost:5173 ✅

📞 Soporte
Si encuentras problemas:

Revisa prerrequisitos instalados

Verifica credenciales de base de datos

Confirma que ambos servicios estén ejecutándose

