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
Crear base de datos manualmente:

sql
CREATE DATABASE news_aggregator_reddit;
O usar el script automático:

bash
cd backend_noticias
python create_database.py
🔧 3. Configuración del Backend (FastAPI)
Navegar al directorio del backend:

bash
cd backend_noticias
Instalar dependencias de Python:

bash
pip install -r requirements.txt
Configurar variables de entorno:
Crear archivo .env en la carpeta backend_noticias:

env
# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_aggregator_reddit
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# Google AI (Gemini) - Opcional para análisis IA
GOOGLE_AI_API_KEY=tu_api_key_de_google_ai

# JWT Secret Key
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
ALGORITHM=HS256
Ejecutar el backend:

bash
python main.py
El backend estará disponible en: http://localhost:8000

🎨 4. Configuración del Frontend (React + TypeScript)
Abrir nueva terminal y navegar al frontend:

bash
cd frontend_noticias
Instalar dependencias de Node.js:

bash
npm install
Ejecutar el frontend:

bash
npm run dev
El frontend estará disponible en: http://localhost:5173

👤 5. Credenciales de Acceso
Usuario Administrador por defecto:

Email: admin@newsperu.com

Password: 123456

Usuario Free:

Registro automático con plan Free

Puede actualizar a Plus mediante Yape

🔑 6. Configuración Opcional - Google AI (Gemini)
Para habilitar el análisis con IA:

Obtener API key de Google AI Studio

Agregar la API key en el archivo .env del backend:

env
GOOGLE_AI_API_KEY=AIzaSyAqgMpcMmR4_vWJRM5X7mcp2rEtB5YEeZ8
📁 Estructura del Proyecto
text
scraping_noticias/
├── backend_noticias/          # FastAPI Backend
│   ├── app/
│   │   ├── models.py         # Modelos de base de datos
│   │   ├── main.py           # Aplicación principal
│   │   ├── crud.py           # Operaciones de base de datos
│   │   └── scraper.py        # Scraping de noticias
│   ├── requirements.txt      # Dependencias Python
│   └── .env                 # Variables de entorno
├── frontend_noticias/        # React Frontend
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── types/          # Definiciones TypeScript
│   │   └── api/            # Cliente API
│   └── package.json        # Dependencias Node.js
└── README.md               # Este archivo
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

Confirmar credenciales en el archivo .env

Asegurar que la base de datos existe

Error de puertos ocupados:

Backend: Cambiar puerto en main.py (línea 730)

Frontend: Cambiar puerto en vite.config.ts

Error de dependencias:

bash
# Reinstalar dependencias del backend
pip install -r requirements.txt --force-reinstall

# Reinstalar dependencias del frontend
rm -rf node_modules package-lock.json
npm install
🚀 Comandos Rápidos de Despliegue
Inicio rápido (después de la primera instalación):

bash
# Terminal 1 - Backend
cd backend_noticias && python main.py

# Terminal 2 - Frontend  
cd frontend_noticias && npm run dev
¡Listo! El sistema estará funcionando en http://localhost:5173 🎉

📞 Soporte
Si encuentras problemas durante la instalación:

Revisa que todos los prerrequisitos estén instalados

Verifica las credenciales de la base de datos

Asegúrate de que ambos servicios (backend y frontend) estén ejecutándose

🏁 Estado del Proyecto
✅ Proyecto funcional

✅ Scraping operativo

✅ Sistema de usuarios completo

✅ IA integrada

✅ Listo para producción y demostraciones
