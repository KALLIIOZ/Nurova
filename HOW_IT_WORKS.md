# 🎯 Guía Completa - Cómo Funciona NUROVA Backend

## 🔄 Flujo Inicio a Fin

### 1️⃣ Usuario Abre la App

```
┌─────────────────────────┐
│   Usuario abre App      │
│   (LoginScreen)         │
└────────────┬────────────┘
             │
             ▼
    Frontend realiza:
    loginUser(email, password)
             │
             ▼
    POST /auth/login
             │
             ▼
┌─────────────────────────────────────┐
│    API Gateway (8000)               │
│    - Verifica CORS                  │
│    - Redirige a Worker Service      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│    Worker Service (8001)            │
│    - Busca usuario en SQLite        │
│    - Verifica password (bcrypt)     │
│    - Crea JWT Token                 │
│    - Crea Redis cache del usuario   │
└────────────┬────────────────────────┘
             │
             ▼
    ✅ Response: {access_token, user}
             │
             ▼
    Frontend guarda en AsyncStorage:
    - userToken
    - userRole
    - userId
    - userName
             │
             ▼
    Usuario entra a MainTabs
```

### 2️⃣ Usuario Abre Chat (Psychologist)

```
┌─────────────────────────┐
│  Usuario abre Chat      │
│  Escribe: "¿Ansiedad?"  │
└────────────┬────────────┘
             │
             ▼
    Frontend realiza:
    sendChatMessage("¿Ansiedad?")
    
    Incluye header:
    Authorization: Bearer {JWT_TOKEN}
             │
             ▼
    POST /chat/message
    
        API Gateway (8000)
             │
             ▼
    POST /chat/message → Psychologist Service
             │
             ▼
┌─────────────────────────────────────┐
│  Psychologist Service (8002)        │
│  1. Verifica JWT token              │
│  2. Obtiene historial desde Redis   │
│  3. Llama a Gemini API              │
│  4. Recibe respuesta IA             │
│  5. Guarda en SQLite                │
│  6. Actualiza Redis cache           │
│  7. Publica evento en Redis         │
└────────────┬────────────────────────┘
             │
             ▼
    ✅ Response con mensaje de IA
             │
             ▼
    Frontend muestra:
    - Mensaje del usuario
    - Respuesta de la IA (Gemini)
```

### 3️⃣ Usuario Responde Encuesta

```
┌──────────────────────────────┐
│ Usuario ve menú (3 puntitos) │
│ Selecciona: "Encuestas"      │
└────────────┬─────────────────┘
             │
             ▼
    Frontend realiza:
    getSurveys()
             │
             ▼
    GET /surveys
        API Gateway (8000)
             │
             ▼
    Consulta SQLite:
    SELECT * FROM surveys
             │
             ▼
    ✅ Retorna lista de encuestas
             │
             ▼
    Usuario selecciona una
    
    Frontend realiza:
    getSurveyDetails(surveyId)
    
    Google Forms API
             │
             ▼
    Usuario completa encuesta
             │
             ▼
    Frontend realiza:
    submitSurveyResponse(surveyId, data)
             │
             ▼
    POST /surveys/{id}/responses
        API Gateway (8000)
             │
             ▼
    Guarda en SQLite:
    INSERT INTO survey_responses
    
    Publica evento Redis
             │
             ▼
    ✅ Respuesta guardada
```

### 4️⃣ Manager Ver Analytics

```
┌──────────────────────┐
│ Manager abre app     │
│ Accede a Dashboard   │
└────────────┬─────────┘
             │
             ▼
    Frontend realiza:
    getDashboard()
             │
             ▼
    GET /dashboard
        API Gateway (8000)
             │
             ▼
    Manager Service (8003)
             │
    ┌────────┴─────────────┐
    │                      │
    ▼                      ▼
WiFi Worker Service:  Consulta SQLite:
- /patients         SELECT appointments
- /appointments     WHERE status = 'completado'
             │
             ▼
    Calcula:
    - Total de pacientes
    - Sesiones completadas
    - Sesiones pendientes
    - Por departamento
             │
             ▼
    Crea Redis cache
    Publica evento
             │
             ▼
    ✅ Retorna Dashboard
             │
             ▼
    Frontend muestra gráficos
```

## 🏛️ Estructura de Datos

### Cuando Usuario Login

SQLite:
```sql
-- users table
id: 1
email: test@example.com
name: Juan
role: worker
hashed_password: $2b$12$...

-- Redis cache
user:1 {
  "id": 1,
  "email": "test@example.com",
  "name": "Juan",
  "role": "worker"
}
```

### Cuando Usuario Chatea

SQLite:
```sql
-- chat_messages table
id: 1, user_id: 1, content: "¿Ansiedad?", sender: "user"
id: 2, user_id: 1, content: "Puedo ayudarte...", sender: "assistant"

-- chat_history in Redis
chat_history:1 [
  {"role": "user", "parts": ["¿Ansiedad?"]},
  {"role": "model", "parts": ["Puedo ayudarte..."]}
]
```

### Cuando Usuario Responde Encuesta

SQLite:
```sql
-- surveys table
id: 1, title: "Satisfacción", google_form_id: "abc123"

-- survey_responses table
id: 1, survey_id: 1, user_id: 1, response_data: "{...}"
```

## 🔐 Seguridad en Acción

```
Frontend envía:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

API Gateway:
1. Extrae token del header
2. Decodifica JWT
3. Verifica firma (HS256, SECRET_KEY)
4. Obtiene user_id del token
5. Continúa o rechaza (401)

Si válido:
- current_user = await get_current_user(token)
- Operación continúa

Si inválido:
✗ 401 Unauthorized
✗ "Invalid credentials"
```

## 🌐 Comunicación Entre Servicios

```
Cuando Psychologist necesita datos de Worker:

┌──────────────────────────┐
│ Psychologist Service     │
│ async def get_patients() │
└────────────┬─────────────┘
             │
             ▼
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://worker_service:8001/patients"
        )
             │
             ▼
    Nota: En LOCAL usa localhost:8001
           En DOCKER usa worker_service:8001
             │
             ▼
    Retorna JSON
```

## 📡 Eventos en Tiempo Real (Redis Pub/Sub)

```
Cuando se crea un paciente:

Worker Service:
└─ await RedisClient.publish(
     "patient_events",
     json.dumps({"event": "patient_created", "patient_id": 1})
   )
         │
         ▼
    Redis recibe el evento
         │
         ▼
    Servicios suscritos (Manager, Psychologist):
    └─ Pueden actuar sobre el evento
       - Actualizar caché
       - Recalcular analytics
       - WebSocket push a frontend
```

## 🗄️ Ciclo de Vida de la BD

```
1. Inicio
   ├─ database/db.py: init_db()
   ├─ Crea tablas en SQLite
   └─ data/app.db creada

2. Operación
   ├─ Usuario hace login
   ├─ Worker inserta en users
   ├─ SQLite guarda
   └─ Redis crea caché

3. Consulta
   ├─ Manager pide analytics
   ├─ SQLite consulta appointments
   ├─ Procesa datos
   └─ Redis cachea resultados

4. Actualización
   ├─ Psychologist actualiza paciente
   ├─ PUT /patients/{id}
   ├─ SQLite actualiza
   ├─ Redis invalida caché
   ├─ Publica evento
   └─ Manager se entera automáticamente
```

## 📊 Flujo de Datos: Patient Creation

```
User Input
    │
    ▼
Frontend: createPatient(data)
    │
    ▼
POST /patients
    (API Gateway 8000)
    │
    ▼
Worker Service (8001)
├─ Verifica autenticación (JWT)
├─ Valida datos (Pydantic)
├─ Inserta en SQLite
│  └─ INSERT INTO patients
├─ Commit transaction
└─ Publica evento
   └─ Redis publish("patient_events", ...)
    │
    ▼
Psychologist Service se entera:
├─ Suscrita a patient_events
├─ Actualiza caché local
└─ Notifica si necesario

Manager Service se entera:
├─ Suscrita a patient_events
├─ Recalcula total_patients
├─ Actualiza analytics
└─ WebSocket push a usuario
```

## 🔄 Ciclo de Chat

```
User types: "Hola"
    │
    ▼
Frontend: sendChatMessage("Hola")
    │
    ▼
POST /chat/message?message=Hola
    │
    ▼
Psychologist Service:
├─ Get conversation history from Redis
│  └─ key: chat_history:1
├─ Call Gemini API
│  ├─ System prompt (psicólogo empático)
│  ├─ Message history
│  └─ New message
├─ Get response
│  └─ "Hola, ¿cómo te sientes hoy?"
├─ Save to SQLite
│  ├─ INSERT INTO chat_messages (user message)
│  └─ INSERT INTO chat_messages (assistant response)
├─ Update Redis
│  └─ SET chat_history:1 [...]
└─ Publish event
   └─ Redis publish("chat_events", ...)
    │
    ▼
Frontend receives response
    │
    ▼
Display on screen
```

## 🎯 Ejemplo: Completo Pet-to-End

### 1. Usuario registra

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "name": "Juan",
    "password": "secure123",
    "role": "worker"
  }'
```

Flujo:
1. API Gateway recibe
2. Redirige a Worker Service
3. Worker inserta en SQLite
4. Crea caché en Redis
5. Publica evento user_registered
6. Retorna usuario

### 2. Usuario hace login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "secure123"
  }'
```

Respuesta:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "name": "Juan",
    "role": "worker"
  }
}
```

### 3. Frontend guarda token

```javascript
const { access_token } = response
await AsyncStorage.setItem('userToken', access_token)
```

### 4. Todas las llamadas posteriores incluyen token

```bash
curl -X GET http://localhost:8000/patients \
  -H "Authorization: Bearer eyJhbGc..."
```

Worker Service verifica token y retorna datos.

## 💡 Conceptos Clave

### API Gateway
- Punto único de entrada
- Valida CORS
- Redirige a servicios correctos
- Maneja autenticación centralizada

### Microservicios
- **Worker**: Fuente única de verdad (datos)
- **Psychologist**: Especializado en IA/chat
- **Manager**: Especializado en reportes
- Cada uno puede escalar independientemente

### Redis
- **Cache**: Evita consultas repetidas a BD
- **Pub/Sub**: Eventos entre servicios
- **Session**: Historial de chat

### Base de Datos
- **SQLite**: Local, fácil desarrollo
- **Async**: No bloquea operaciones
- **Relaciones**: Foreign keys entre tablas

## 🚀 Escalabilidad

```
Producción:
├─ Load Balancer (haproxy/nginx)
├─ API Gateway cluster (múltiples instancias)
├─ Worker Service cluster
├─ Psychologist Service cluster
├─ Manager Service cluster
├─ PostgreSQL (reemplaza SQLite)
├─ Redis cluster
├─ Elasticsearch (para logs)
└─ Monitoring (Prometheus/Grafana)
```

## 📝 Resumen

NUROVA Backend es una **arquitectura escalable de microservicios** donde:

1. ✅ Cada servicio tiene responsabilidad clara
2. ✅ Datos centralizados en Worker
3. ✅ Redis para sinc en tiempo real
4. ✅ JWT + Bcrypt para seguridad
5. ✅ Integraciones (Gemini, Google Forms)
6. ✅ Documentación completa
7. ✅ Ready para producción

**Listo para comenzar** 🚀
