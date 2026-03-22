# 🏗️ Arquitectura de NUROVA

## Visión General

NUROVA es una plataforma integral de salud mental que combina una **app móvil React Native** con un **backend de microservicios** escalable y moderno.

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Native Mobile App                      │
│                  (iOS, Android, Web via Expo)                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (FastAPI)                        │
│              - Enrutamiento de solicitudes                       │
│              - Autenticación JWT                                 │
│              - Rate limiting                                     │
│              - CORS handling                                     │
└─────────────────────────────────────────────────────────────────┘
                              ▼
        ┌─────────────────────────────────────────┐
        │         Redis (Message Broker)          │
        │  - Cache en tiempo real                 │
        │  - Pub/Sub para eventos                 │
        │  - Sesiones temporales                  │
        └─────────────────────────────────────────┘
        ▼                    ▼                    ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │   Worker   │      │Psychologist│      │  Manager   │
   │  Service   │      │  Service   │      │  Service   │
   │ (Database) │      │  (AI Chat) │      │(Analytics) │
   └────────────┘      └────────────┘      └────────────┘
        ▼                    ▼                    ▼
   ┌──────────────────────────────────────────────────────┐
   │          SQLite Database (Centralizado)              │
   │    - Usuarios y autenticación                        │
   │    - Citas y reservas                                │
   │    - Chat y mensajes                                 │
   │    - Datos de analytics                              │
   └──────────────────────────────────────────────────────┘
```

---

## Por qué FastAPI? ⚡

### 1. **Rendimiento Nativo**
- Entre los frameworks más rápidos de Python (comparable a Node.js y Go)
- Basado en Starlette (ASGI) para manejo asincrónico
- Perfecto para microservicios de alta concurrencia

### 2. **Async/Await Nativos**
```python
@app.get("/appointments/{user_id}")
async def get_appointments(user_id: int):
    # Sin bloqueo de I/O
    appointments = await db.fetch_appointments(user_id)
    return appointments
```
- Manejo eficiente de múltiples solicitudes simultáneas
- Ideal para integración con APIs externas (Gemini, Google Forms)

### 3. **Documentación Automática**
- Swagger UI integrado: `http://localhost:8000/docs`
- ReDoc integrado: `http://localhost:8000/redoc`
- Autodescubrimiento de endpoints y parámetros
- Facilita tanto desarrollo como testing

### 4. **Type Hints y Validación**
```python
from pydantic import BaseModel

class User(BaseModel):
    email: str
    password: str
    role: str  # "patient", "psychologist", "manager", "worker"
    
# FastAPI valida automáticamente
@app.post("/auth/register")
async def register(user: User):  # Validación automática
    ...
```

### 5. **Escalabilidad**
- Diseño modular por servicios
- Fácil de containerizar con Docker
- Compatible con Kubernetes
- Ideal para deployments en la nube

---

## Por qué Redis? 🚀

### 1. **Cache de Alta Velocidad**
```python
# Sin Redis: Consulta a BD (100-500ms)
# Con Redis: Datos en memoria (1-5ms)

async def get_user_profile(user_id: int):
    # Intenta desde cache
    cached = await redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)  # Retorna inmediatamente
    
    # Si no está en cache, consulta BD
    user = await db.get_user(user_id)
    await redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
```

### 2. **Pub/Sub en Tiempo Real**
Para chat en vivo y notificaciones instantáneas:
```python
# Servicio de Chat publica
await redis.publish("chat:room:123", {
    "user": "Dr. García",
    "message": "Hola, ¿cómo estás?",
    "timestamp": datetime.now()
})

# App móvil se suscribe
await redis.subscribe("chat:room:123")
# Recibe mensajes instantáneamente
```

### 3. **Manejo de Sesiones**
```python
# Sesiones JWT + Redis para revokable tokens
# Logout real: Remover token del Redis
await redis.delete(f"token:{user_id}:{jwt_token}")

# Verificación rápida en cada request:
@app.get("/protected")
async def protected_endpoint(token: str = Header(...)):
    if not await redis.exists(f"token:{token}"):
        raise HTTPException(status_code=401)
```

### 4. **Rate Limiting**
```python
# Limitar 100 requests por minuto por usuario
async def rate_limit(user_id: int):
    key = f"ratelimit:{user_id}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 60)
    
    if count > 100:
        raise HTTPException(status_code=429, detail="Too many requests")
```

### 5. **Colas de Tareas**
```python
# Tarea asincrónica: generar reporte PDF
await redis.lpush("tasks:reports", json.dumps({
    "user_id": 123,
    "type": "monthly_analytics"
}))

# Worker procesa en background
while True:
    task = await redis.rpop("tasks:reports")
    if task:
        generate_pdf(json.loads(task))
```

---

## Arquitectura de Microservicios 🎯

### **1. API Gateway (Puerto 8000)**
```
Gateway → Autenticación → Validación → Enrutamiento
  ↓
  ├→ /auth/* → Valida Tokens JWT
  ├→ /appointments/* → Rutas Worker Service
  ├→ /chat/* → Rutas Psychologist Service
  └→ /analytics/* → Rutas Manager Service
```

**Responsabilidades:**
- Punto de entrada único
- Validación de autenticación
- CORS (Cross-Origin Resource Sharing)
- Rate limiting
- Routers a servicios específicos

### **2. Worker Service (Puerto 8001) - Base de Datos**
```
"Cerebro Central"
- Gestión de usuarios
- Variables de sesión
- Citas y reservas
- Almacenamiento persistente
```

**Por qué separado:**
- Garantiza integridad de datos
- Evita race conditions
- Facilita backups
- Punto central de verdad

### **3. Psychologist Service (Puerto 8002) - Chat con IA**
```
Chat Endpoints → Gemini API ↔ Cache Redis
- Análisis de sentimientos
- Recomendaciones personalizadas
- Integración con Google Forms
```

**Por qué separado:**
- Llamadas API a Gemini son lentas (500-2000ms)
- No bloquea otras solicitudes
- Cache de respuestas frecuentes
- Escalable independientemente

### **4. Manager Service (Puerto 8003) - Analytics**
```
Dashboard → Leetcode de datos → Gráficos
- Estadísticas por departamento
- KPIs de satisfacción
- Reportes mensuales
- Trends de problemas más comunes
```

**Por qué separado:**
- Consultas complejas y costosas
- Cachea agresivamente resultados
- Puede escalar solo en horarios específicos
- Independiente de operaciones críticas

---

## Stack Tecnológico 📚

| Componente | Tecnología | Por qué |
|---|---|---|
| **Backend** | FastAPI + Python 3.11 | Async, rápido, tipado |
| **Cache/Pub-Sub** | Redis | Velocidad, tiempo real |
| **BD Principal** | SQLite Async | Ligero, sin servidor externo |
| **Auth** | JWT + Bcrypt | Seguro, stateless |
| **IA/Chat** | Google Gemini API | Chat natural, multimodal |
| **Encuestas** | Google Forms API | Integración nativa |
| **Container** | Docker | Reproducibilidad, deployment |
| **Orquestación** | Docker Compose | Desarrollo local |
| **Frontend** | React Native + Expo | iOS, Android, Web |
| **Client HTTP** | Axios | Promesas, interceptores |

---

## Flujo de Datos Típico 🔄

### **Caso: Usuario inicia sesión**

```
1. App envía: POST /auth/login {email, password}
   ↓
2. Gateway valida headers, forwarea a Worker Service
   ↓
3. Worker Service:
   - Hash password con bcrypt
   - Compara con BD
   - Genera JWT token
   ↓
4. Redis almacena: token:{user_id} = {token_info}
   ↓
5. Gateway retorna: {token, user_data, expires_in}
   ↓
6. App guarda token en AsyncStorage
   ↓
7. App agrega token en headers siguientes: Authorization: Bearer {token}
```

### **Caso: Usuario envía mensaje en chat**

```
1. App envía: POST /chat/send {room_id, message}
   ↓
2. Gateway valida JWT desde Redis
   ↓
3. Pyschologist Service recibe
   ↓
4. Almacena en BD (Worker Service)
   - INSERT INTO messages (...)
   ↓
5. Publica en Redis: chat:room:{room_id}
   ↓
6. Otros usuarios suscritos reciben instantáneamente
   ↓
7. Llama Gemini API para análisis de sentimiento
   ↓
8. Cachea respuesta en Redis para futuras consultas similares
```

---

## Ventajas de esta Arquitectura ✨

| Ventaja | Beneficio |
|---|---|
| **Independencia de servicios** | Escala solo lo que necesitas |
| **Resiliencia** | Si Psychologist cae, Worker y Manager siguen funcionando |
| **Cache distribuido** | Respuestas ultra-rápidas |
| **Real-time comunicación** | Chat y notificaciones sin latencia |
| **Fácil testing** | Mockear Redis, cambiar BD |
| **Debugging** | Logs separados por servicio |
| **Deployment flexible** | Deploy solo el servicio que cambió |
| **Seguridad por capas** | JWT + Rate Limiting + Bcrypt |

---

## Cómo Corre Todo Junto ⚙️

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Worker Service (BD)
python run_service.py worker

# Terminal 3: Psychologist Service (IA)
python run_service.py psychologist

# Terminal 4: Manager Service (Analytics)
python run_service.py manager

# Terminal 5: API Gateway (Punto de entrada)
python run_service.py gateway

# Terminal 6: App móvil
cd mobile && npm start
```

Ahora tienes:
- `localhost:8000` - Frontend móvil conecta aquí
- `localhost:8001` - Worker (internamente accesible)
- `localhost:8002` - Psychologist (internamente accesible)
- `localhost:8003` - Manager (internamente accesible)

---

## Comparación: Alternativas Rechazadas ❌

### **Monolítico (Todo en un solo servicio)**
```javascript
❌ Si /chat endpoint cuelga, todo cuelga
❌ Escalas todo o nada
❌ Código desorganizado
❌ Difícil mantener
```

### **Express.js en lugar de FastAPI**
```javascript
❌ Node.js menos performante para I/O pesado
❌ Sin types nativos (TypeScript opcional)
❌ Documentación no automática
```

### **PostgreSQL en lugar de SQLite**
```javascript
❌ Requiere servidor externo
❌ Komplejo para desarrollo local
❌ SQLite suficiente para tráfico inicial
✓ Fácil migración futura
```

### **Sin Redis**
```javascript
❌ BD consultas en cada request
❌ Chat no en tiempo real
❌ Lento y costoso en escala
```

---

## Roadmap Futuro 🚀

1. **Escalabilidad Horizontal**
   - Múltiples instancias de Psychologist Service
   - Load balancer (Nginx)
   - Replicas de Redis

2. **Persistencia de Redis**
   - AOF (Append-Only File)
   - RDB (Redis Database)

3. **Message Queues**
   - RabbitMQ para tareas asincrónicas
   - Celery para jobs diarios

4. **Microservicios Adicionales**
   - Notification Service
   - Analytics Worker
   - Media Service (fotos/videos)

5. **Production Ready**
   - Prometheus para métricas
   - ELK Stack para logs
   - Sentry para error tracking
   - CI/CD (GitHub Actions)

---

## Conclusión 🎓

Esta arquitectura es **escalable**, **resiliente** y **moderna**. Combina:

- ✅ **FastAPI**: Framework web más rápido de Python
- ✅ **Redis**: Cache y pub/sub de alta velocidad
- ✅ **Microservicios**: Independencia y escalabilidad
- ✅ **Async/Await**: Máxima eficiencia
- ✅ **Separación de concerns**: Código limpio y mantenible

El resultado es una plataforma que puede crecer desde MVP hasta aplicación con millones de usuarios.

---

**Para más información, consulta:**
- [QUICK_START.md](QUICK_START.md) - Cómo empezar
- [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md) - Estructura de archivos
- [TESTING_API.md](TESTING_API.md) - Ejemplos de endpoints
- [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Integración móvil
