📘 README COMPLETO – News Aggregator
📰 News Aggregator – Sistema de Scraping y Gestión de Noticias

Sistema completo para scraping, gestión y análisis de noticias peruanas, con autenticación de usuarios, planes de servicio, análisis con IA y un panel administrativo moderno.

📋 1. Descripción General

Este proyecto integra:

🔍 Scraping automatizado y manual de múltiples portales de noticias peruanas

🧠 Análisis de noticias con Inteligencia Artificial (Google Gemini AI)

👤 Autenticación con roles (Usuario / Admin)

📊 Panel administrativo completo

🔐 Sistema de planes Free y Plus

🧾 Exportación de datos a Excel

🌐 API RESTful documentada con Swagger

🎨 Frontend moderno en React + TypeScript

Ideal para:

Monitoreo de noticias

Empresas de marketing digital

Prensa

Investigación académica

Automatización informativa

⚙️ 2. Tecnologías Usadas
Backend

FastAPI

Python 3.10+

MySQL 8.0

SQLAlchemy ORM

JWT (Autenticación)

BeautifulSoup + Requests (Scraping)

Google Gemini AI

Frontend

React + TypeScript

Vite

Axios

TailwindCSS

Zustand (estado global)

🛠️ 3. Instalación y Configuración
📥 3.1 Clonar el Repositorio
git clone https://github.com/maykolaracayo22/scraping_noticias.git
cd scraping_noticias

🔧 3.2 Backend – Instalación
📌 Entrar a la carpeta backend
cd backend

📌 Crear entorno virtual
python -m venv venv
source venv/bin/activate   # Linux
venv\Scripts\activate      # Windows

📌 Instalar dependencias
pip install -r requirements.txt

🔑 3.3 Configurar Variables de Entorno

Crea un archivo .env dentro de /backend:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=scrapingdb

SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

GEMINI_API_KEY=TU_API_KEY

🗄️ 3.4 Configurar Base de Datos MySQL
CREATE DATABASE scrapingdb;

CREATE USER 'scraping_user'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON scrapingdb.* TO 'scraping_user';
FLUSH PRIVILEGES;

▶️ 3.5 Ejecutar Backend
uvicorn main:app --reload


La API estará en:

👉 http://localhost:8000

👉 Documentación Swagger: http://localhost:8000/docs

🎨 3.6 Frontend – Instalación
📌 Entrar a la carpeta
cd frontend

📌 Instalar dependencias
npm install

📌 Ejecutar en modo desarrollo
npm run dev


Frontend en:
👉 http://localhost:5173

📁 4. Estructura del Proyecto
scraping_noticias/
│
├── backend/
│   ├── main.py
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── scraping/
│   ├── database.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.ts

🔐 5. Funcionalidades del Sistema
👤 Modo Usuario

Registro e inicio de sesión con JWT

Panel personal de noticias

Scraping manual

Análisis de noticias con IA

Exportación de datos a Excel

ChatBot integrado

🛡️ Modo Administrador

Ver lista de usuarios

Cambiar roles

Ver scraping ejecutado por usuarios

Gestionar noticias globales

Monitoreo de planes (Free / Plus)

🧠 Funciones de IA

Clasificación automática de noticias

Resúmenes automáticos

Detección de sentimiento

ChatBot con contexto

📡 6. Endpoints Principales (Backend)
👤 Autenticación
POST /auth/register
POST /auth/login

🔍 Scraping
POST /scraping/run       # Ejecuta scraping manual
GET  /scraping/history   # Historial del usuario

🧠 Inteligencia Artificial
POST /ai/analyze          # Analiza noticia con IA
POST /ai/summarize        # Genera resumen
POST /ai/chat             # ChatBot

📰 Noticias
GET   /news/
GET   /news/{id}
DELETE /news/{id}

🛡️ Admin
GET /admin/users
PUT /admin/users/{id}/role

🧪 7. Scripts de Scraping
Ejecutar scraping automático
python scraping/cron_scraper.py

Ejecutar scraping manual (modo desarrollo)
python scraping/scrape_rpp.py

🧾 8. Exportación a Excel

El usuario puede exportar toda su data:

Por categoría

Por fecha

Por portal

Por palabras clave

El backend envía archivo .xlsx.

🔒 9. Sistema de Planes
Plan	Límite	Funciones
Free	20 noticias por día	Scraping manual, exportación
Plus	Ilimitado	IA, scraping avanzado, chatbot
💼 10. Idea de Negocio (Business Model)

Tu proyecto es un SaaS de monitoreo y análisis inteligente de noticias, enfocado en:

🟦 Tipo de negocio:

Plataforma de análisis informativo (News Intelligence Platform)

🎯 Cliente objetivo:

Periodistas

Empresas de marketing

Politólogos

Universidades

Agencias de noticias

Analistas digitales

💰 Fuentes de ingresos:

Suscripción mensual (Free → Plus)

Plan empresarial

API de datos

Servicios de análisis avanzado con IA

📄 11. Licencia

MIT License.

🙌 12. Autor

Milton Edward Humpiri Flores
UPeU – 2025
