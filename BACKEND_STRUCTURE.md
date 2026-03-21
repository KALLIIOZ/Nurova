Backend/
├── 📄 api_gateway.py              # API Gateway - Punto de entrada (8000)
├── 📄 requirements.txt             # Dependencias Python
├── 📄 .env.example                 # Ejemplo de variables de entorno
├── 📄 README.md                    # Documentación completa
├── 📄 run_service.py               # Script para ejecutar servicios
├── 📄 setup.bat                    # Setup Windows
├── 📄 setup.sh                     # Setup Linux/Mac
├── 📄 docker-compose.yml           # Orquestación de contenedores
├── 📄 Dockerfile.gateway           # Docker para API Gateway
├── 📄 Dockerfile.worker            # Docker para Worker Service
├── 📄 Dockerfile.psychologist      # Docker para Psychologist Service
├── 📄 Dockerfile.manager           # Docker para Manager Service
│
├── 📁 core/                        # Configuración Central
│   ├── 📄 __init__.py
│   ├── 📄 config.py                # Configuración app (env, puertos, etc)
│   └── 📄 security.py              # JWT, hashing de passwords
│
├── 📁 database/                    # Base de Datos
│   ├── 📄 __init__.py
│   └── 📄 db.py                    # Conexión SQLite async + init_db()
│
├── 📁 models/                      # ORM y Schemas
│   ├── 📄 __init__.py
│   ├── 📄 models.py                # 9 modelos SQLAlchemy (User, Patient, etc)
│   └── 📄 schemas.py               # Pydantic schemas para validación
│
├── 📁 utils/                       # Utilidades
│   ├── 📄 __init__.py
│   ├── 📄 redis_client.py          # Cliente Redis para cache/pub-sub
│   ├── 📄 gemini_client.py         # Cliente Gemini API
│   └── 📄 google_forms_client.py   # Cliente Google Forms
│
├── 📁 services/                    # Microservicios
│   ├── 📄 __init__.py
│   │
│   ├── 📁 worker_service/          # 🔴 SERVICIO CENTRAL
│   │   ├── 📄 __init__.py
│   │   └── 📄 main.py              # Puerto 8001
│   │       ├─ Auth (login/register)
│   │       ├─ Patients CRUD
│   │       ├─ Appointments CRUD
│   │       └─ Medical Records CRUD
│   │
│   ├── 📁 psychologist_service/    # 🟣 SERVICIO PSICÓLOGO
│   │   ├── 📄 __init__.py
│   │   └── 📄 main.py              # Puerto 8002
│   │       ├─ Chat Gemini IA
│   │       ├─ Historial de chat
│   │       ├─ Datos desde Worker
│   │       └─ Actualización en tiempo real
│   │
│   ├── 📁 manager_service/         # 🟢 SERVICIO GERENTE
│   │   ├── 📄 __init__.py
│   │   └── 📄 main.py              # Puerto 8003
│   │       ├─ Dashboard
│   │       ├─ Analytics
│   │       ├─ Estadísticas
│   │       └─ Datos consolidados
│   │
│   └── 📁 data/                    # 📊 Datos
│       └── 📄 app.db               # Base de datos SQLite
│
└── 📁 .../                         # Otras carpetas

═══════════════════════════════════════════════════════════════

🗄️ BASE DE DATOS (models/models.py)

┌─────────────────────────────────────────────────────────────┐
│                    MODELOS SQL ALCHEMY                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1️⃣  User                                                    │
│     - id, email, name, last_name                             │
│     - role (worker/psychologist/manager)                     │
│     - hashed_password, is_active                             │
│                                                               │
│  2️⃣  Patient                                                 │
│     - id, name, last_name, email, phone                      │
│     - department, position, health_issue                     │
│     - observation                                            │
│                                                               │
│  3️⃣  Appointment                                             │
│     - id, patient_id, worker_id, psychologist_id             │
│     - appointment_date, status                               │
│     - notes, transcript, summary                             │
│                                                               │
│  4️⃣  MedicalRecord                                           │
│     - id, patient_id                                         │
│     - diagnosis, treatment_plan, notes                       │
│                                                               │
│  5️⃣  ChatMessage                                             │
│     - id, user_id, content, sender                           │
│     - timestamp                                              │
│                                                               │
│  6️⃣  Survey                                                  │
│     - id, title, description                                 │
│     - google_form_id, google_form_url                        │
│                                                               │
│  7️⃣  SurveyResponse                                          │
│     - id, survey_id, user_id                                 │
│     - response_data (JSON), submitted_at                     │
│                                                               │
│  8️⃣  Analytics                                               │
│     - id, department                                         │
│     - total_patients, completed_sessions, pending_sessions   │
│     - average_satisfaction, data (JSON)                      │
│                                                               │
│  9️⃣  Document + Comment                                      │
│     - Para gestión de documentos colaborativos               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

🔄 FLUJO DE DATOS

Frontend (React Native)
        │
        ├─→ POST /auth/register
        ├─→ POST /auth/login -----------[JWT Token]
        │
        ├─→ GET /patients
        │
        ├─→ POST /chat/message -------→ Gemini API
        │
        ├─→ GET /surveys
        ├─→ POST /surveys/{id}/responses
        │
        └─→ GET /dashboard

                    ▼
          ┌─────────────────────┐
          │   API GATEWAY       │
          │   (8000)            │
          │   - Routing         │
          │   - Auth Check      │
          │   - CORS            │
          └────┬────┬────┬──────┘
               │    │    │
    ┌──────────┘    │    └──────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐  ┌──────────┐  ┌────────┐
│WORKER   │  │PSYCOLOGO │  │MANAGER │
│(8001)   │  │(8002)    │  │(8003)  │
│         │  │          │  │        │
│Auth     │  │Chat+IA   │  │Analytics
│Patients ├─>│<-Data    │  │<-Data
│Citas    │  │          │  │
└────┬────┘  └┬─────────┘  └────┬───┘
     │       │                  │
     └───────┼──────────────────┘
             │
             ▼
      ┌────────────────┐
      │  SQLite DB     │
      │  (app.db)      │
      └────────────────┘

         Redis (Cache + Pub/Sub)
         - Usuarios en caché
         - Eventos en tiempo real
         - Historial de chat

═══════════════════════════════════════════════════════════════

📍 ENDPOINTS POR SERVICIO

WORKER SERVICE (8001) - Datos Centralizados
├─ POST   /auth/register
├─ POST   /auth/login
├─ GET    /patients
├─ POST   /patients
├─ GET    /patients/{id}
├─ PUT    /patients/{id}
├─ POST   /appointments
├─ GET    /appointments
├─ GET    /appointments/{id}
├─ POST   /medical-records
├─ GET    /patients/{id}/medical-records
└─ GET    /health

PSYCHOLOGIST SERVICE (8002) - Chat + IA
├─ POST   /chat/message
├─ GET    /chat/history
├─ DELETE /chat/history
├─ GET    /patients
├─ GET    /patients/{id}
├─ GET    /patients/{id}/medical-records
└─ GET    /health

MANAGER SERVICE (8003) - Analytics
├─ GET    /dashboard/overview
├─ GET    /analytics/departments
├─ POST   /analytics/generate
├─ GET    /patients
├─ GET    /appointments
├─ WS     /ws/analytics/{user_id}
└─ GET    /health

API GATEWAY (8000) - Punto Central
├─ POST   /auth/register
├─ POST   /auth/login
├─ GET    /patients
├─ POST   /appointments
├─ POST   /chat/message
├─ GET    /surveys
├─ POST   /surveys
├─ GET    /surveys/{id}
├─ POST   /surveys/{id}/responses
├─ GET    /dashboard
└─ GET    /health

═══════════════════════════════════════════════════════════════

🎨 INTEGRACIONES EXTERNAS

1. Gemini API (Chatbot IA)
   - Cliente: utils/gemini_client.py
   - Endpoint: /chat/message
   - Config: GEMINI_API_KEY en .env

2. Google Forms/Docs
   - Cliente: utils/google_forms_client.py
   - Endpoints: /surveys/*
   - Config: GOOGLE_FORMS_API_KEY en .env

3. Redis
   - Cliente: utils/redis_client.py
   - Uso: Cache, Pub/Sub, eventos en tiempo real
   - Config: REDIS_URL en .env

═══════════════════════════════════════════════════════════════

🔒 SEGURIDAD

- JWT Token (HS256)
- Password Hashing (bcrypt)
- CORS habilitado para frontend
- Autenticación requerida en endpoints (excepto /auth/*)
- Variables de entorno sensibles en .env

═══════════════════════════════════════════════════════════════

📦 MODIFICACIONES EN FRONTEND

src/api/client.js fue actualizado con:
├─ Funciones de chat
├─ Funciones de encuestas
├─ Mejor manejo de tokens JWT
├─ Funciones de analytics
└─ Todas las operaciones CRUD

═══════════════════════════════════════════════════════════════
