# NUROVA Backend - Microservicios con FastAPI

Arquitectura de microservicios para la aplicación NUROVA de atención de salud mental empresarial.

## 🏗️ Arquitectura

El backend está compuesto por 4 servicios principales:

### 1. **Worker Service (Puerto 8001)** - Servicio Central
- Gestión de usuarios (autenticación y registro)
- Gestión de pacientes
- Registro de citas y sesiones
- Historiales médicos
- **Centro centralizado de datos** que alimenta a los otros servicios

### 2. **Psychologist Service (Puerto 8002)** - Servicio de Psicólogos
- Acceso a datos de pacientes (desde Worker Service)
- Chat impulsado por IA (Gemini API)
- Historial de mensajes de chat
- Acceso a historiales médicos de pacientes

### 3. **Manager Service (Puerto 8003)** - Servicio de Gerentes
- Dashboard de análisis
- Estadísticas por departamento
- Métricas de sesiones completadas/pendientes
- Datos consolidados desde Worker Service

### 4. **API Gateway (Puerto 8000)** - Punto de entrada
- Autenticación centralizada
- Proxy de solicitudes a los servicios
- Gestión de encuestas (Google Forms)
- CORS habilitado para el front-end
- **Punto de conexión único para el cliente React Native**

## 🔄 Flujo de Datos

```
Frontend (React Native)
    │
    ├─→ API Gateway (8000)
    │   ├─→ Worker Service (8001) [Autenticación, Pacientes, Citas]
    │   ├─→ Psychologist Service (8002) [Chat, Historial]
    │   ├─→ Manager Service (8003) [Analytics]
    │   └─→ Redis (Caché y Pub/Sub)
```

## 📋 Requisitos

- Python 3.11+
- Redis 7+
- Docker y Docker Compose (opcional, para contenedorización)
- APIs:
  - Gemini API Key (para chatbot)
  - Google Forms API Key (para encuestas)

## 🚀 Instalación

### Opción 1: Ejecución Local (sin Docker)

1. **Clonar el proyecto y navegar al backend:**
```bash
cd backend
```

2. **Crear archivo .env:**
```bash
cp .env.example .env
```

3. **Editar .env y agregar tus API keys:**
```env
GEMINI_API_KEY=tu_api_key_aqui
GOOGLE_FORMS_API_KEY=tu_google_api_key_aqui
SECRET_KEY=tu_clave_secreta_aqui
```

4. **Crear entorno virtual e instalar dependencias:**
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

5. **Asegurarse de que Redis está corriendo:**
```bash
# En Windows (si tiene WSL2):
# O instalar Redis directamente

# En macOS:
brew install redis
redis-server

# En Linux:
sudo apt-get install redis-server
redis-server
```

6. **Ejecutar los servicios en terminales separadas:**

**Terminal 1 - Worker Service:**
```bash
uvicorn services.worker_service.main:app --reload --port 8001
```

**Terminal 2 - Psychologist Service:**
```bash
uvicorn services.psychologist_service.main:app --reload --port 8002
```

**Terminal 3 - Manager Service:**
```bash
uvicorn services.manager_service.main:app --reload --port 8003
```

**Terminal 4 - API Gateway:**
```bash
uvicorn api_gateway:app --reload --port 8000
```

### Opción 2: Con Docker Compose

1. **Crear archivo .env en el directorio backend:**
```bash
cp .env.example .env
```

2. **Editar .env con tus API keys**

3. **Ejecutar con Docker Compose:**
```bash
docker-compose up -d
```

Esto iniciará:
- Redis
- Worker Service
- Psychologist Service
- Manager Service
- API Gateway

## 🔌 Endpoints Principales

### Autenticación
```
POST   /auth/register           - Registrar nuevo usuario
POST   /auth/login              - Iniciar sesión
```

### Pacientes
```
GET    /patients                - Listar pacientes
POST   /patients                - Crear paciente
GET    /patients/{id}           - Obtener detalles del paciente
PUT    /patients/{id}           - Actualizar paciente
```

### Citas
```
GET    /appointments            - Listar citas
POST   /appointments            - Crear cita
GET    /appointments/{id}       - Obtener detalles de cita
```

### Chat (impulsado por Gemini)
```
POST   /chat/message            - Enviar mensaje
GET    /chat/history            - Obtener historial
DELETE /chat/history            - Limpiar historial
```

### Encuestas (Google Forms)
```
GET    /surveys                 - Listar encuestas
POST   /surveys                 - Crear encuesta
GET    /surveys/{id}            - Obtener detalles
POST   /surveys/{id}/responses  - Enviar respuesta
GET    /surveys/{id}/responses  - Obtener respuestas
```

### Dashboard
```
GET    /dashboard               - Obtener resumen del dashboard
GET    /analytics/departments   - Estadísticas por departamento
POST   /analytics/generate      - Generar análisis
```

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren autenticación mediante JWT.

**Encabezado requerido:**
```
Authorization: Bearer {access_token}
```

El token se obtiene del endpoint de login y debe incluirse en todas las solicitudes posteriores.

## 🗄️ Base de Datos

El sistema usa **SQLite** con async support (aiosqlite).

La base de datos se crea automáticamente en `data/app.db`.

### Modelos principales:
- **User** - Usuarios del sistema
- **Patient** - Pacientes
- **Appointment** - Citas/Sesiones
- **MedicalRecord** - Historiales médicos
- **ChatMessage** - Mensajes de chat
- **Survey** - Encuestas
- **SurveyResponse** - Respuestas de encuestas
- **Analytics** - Datos analíticos

## 🤖 Integración Gemini (Chatbot)

El servicio de Psicólogo utiliza la API de Gemini para un chatbot de IA.

**Configuración:**
1. Obtener API Key en: https://makersuite.google.com/app/apikey
2. Agregar a `.env`:
```env
GEMINI_API_KEY=tu_api_key
```

El prompt del chatbot está configurado para actuar como asistente psicológico empático.

## 📋 Integración Google Docs/Forms

Para agregar encuestas desde Google Forms:

1. Tener el ID del formulario
2. Crear encuesta con endpoint `POST /surveys`
3. El sistema mostrará la encuesta en el chat
4. Usuarios pueden responder y las respuestas se guardan en la BD

## 📊 Redis para Actualizaciones en Tiempo Real

Redis se utiliza para:
- **Caché**: Almacenamiento temporal de datos frecuentes
- **Pub/Sub**: Eventos en tiempo real
- **Historial de Chat**: Contexto de conversaciones

Eventos publicados:
- `user_events` - Evento de usuario registrado
- `patient_events` - Eventos de pacientes
- `appointment_events` - Eventos de citas
- `medical_events` - Eventos médicos
- `chat_events` - Eventos de chat
- `survey_events` - Eventos de encuestas
- `analytics_events` - Eventos de análisis

## 🔄 Flujo de Chat con Encuestas

1. Usuario abre chat (Psychologist Service)
2. En el menú (3 puntitos) aparece opción "Encuestas"
3. Se muestran encuestas disponibles
4. Usuario completa la encuesta
5. Respuesta se guarda en BD (`survey_responses`)
6. Evento se publica en Redis para actualización en tiempo real

## 🧪 Prueba de Servicios

```bash
# Ver estado de los servicios
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

## 📝 Logs

Ver logs de los servicios en tiempo real:

Con Docker:
```bash
docker-compose logs -f
```

Sin Docker:
Ver la salida de la terminal donde se ejecutó el servicio.

## 🐛 Solución de Problemas

### Error: "Can't connect to Redis"
- Verificar que Redis está corriendo: `redis-cli ping`
- Verificar URL de Redis en `.env`

### Error: "GEMINI_API_KEY is missing"
- Agregar API key a `.env`
- Obtener en: https://makersuite.google.com/app/apikey

### Error: "Database locked"
- Asegurarse de tener una sola instancia escribiendo a la BD
- SQLite no soporta múltiples escrituras simultáneas

### Los servicios no se comunican
- Verificar que todos están en la red correcta
- Verificar URLs de los servicios en `.env`

## 📚 Documentación de Swagger

La documentación interactiva está disponible en:
- API Gateway: http://localhost:8000/docs
- Worker Service: http://localhost:8001/docs
- Psychologist Service: http://localhost:8002/docs
- Manager Service: http://localhost:8003/docs
