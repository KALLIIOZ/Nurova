# 🚀 QUICK START - Backend NUROVA

## ⚡ Inicio Rápido en 5 minutos

### 1️⃣ Requisitos Previos

Instalar:
- Python 3.11+ → https://www.python.org/downloads/
- Redis → https://redis.io/download o `choco install redis` (Windows)
- Git → https://git-scm.com/

### 2️⃣ Clonar y Configurar

```bash
# Entrar a la carpeta del backend
cd backend

# Copiar variables de entorno
cp .env.example .env  # En Windows: copy .env.example .env

# Editar .env y agregar tus API keys
# Necesitas:
# - GEMINI_API_KEY (de https://makersuite.google.com/app/apikey)
# - GOOGLE_FORMS_API_KEY (opcional)
# - SECRET_KEY (generada, algo como: "tu_clave_secreta_super_larga")
```

### 3️⃣ Instalar Dependencias

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar paquetes
pip install -r requirements.txt
```

### 4️⃣ Iniciar Redis (Necesario)

En una terminal separada:

```bash
# Windows (si está instalado):
redis-server

# O si usas WSL:
wsl redis-server

# Mac:
redis-server

# Linux:
redis-server
```

Verificar con:
```bash
redis-cli ping
# Debe responder: PONG
```

### 5️⃣ Ejecutar los Servicios

Abrir **4 TERMINALES DIFERENTES** en la carpeta `backend` y ejecutar en cada una:

```bash
# Terminal 1 - Worker Service (Base de datos centralizada)
python run_service.py worker
# O: uvicorn services.worker_service.main:app --reload --port 8001

# Terminal 2 - Psychologist Service (Chat con IA)
python run_service.py psychologist
# O: uvicorn services.psychologist_service.main:app --reload --port 8002

# Terminal 3 - Manager Service (Analytics)
python run_service.py manager
# O: uvicorn services.manager_service.main:app --reload --port 8003

# Terminal 4 - API Gateway (Punto de entrada)
python run_service.py gateway
# O: uvicorn api_gateway:app --reload --port 8000
```

### ✅ Verificar que funciona

Abrir en navegador:
```
http://localhost:8000/health
```

Debe mostrar:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "services": {
    "worker": "http://localhost:8001/health",
    "psychologist": "http://localhost:8002/health",
    "manager": "http://localhost:8003/health"
  }
}
```

### 🎯 Probar Endpoints

#### 1. Registrar usuario

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "last_name": "User",
    "password": "password123",
    "role": "worker"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copiar el `access_token` de la respuesta.

#### 3. Usar token en siguientes llamadas

```bash
curl -X GET http://localhost:8000/patients \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

## 🔧 Configurar en Frontend (React Native)

Actualizar `src/api/config.js`:

```javascript
// Para desarrollo local:
export const BASE_URL = 'http://localhost:8000';

// Para Android emulador:
export const BASE_URL = 'http://10.0.2.2:8000';

// Para dispositivo físico, usar IP de tu máquina:
export const BASE_URL = 'http://192.168.x.x:8000';
```

## 📚 Documentación Swagger

Cada servicio tiene documentación interactiva:
- API Gateway: http://localhost:8000/docs
- Worker: http://localhost:8001/docs
- Psychologist: http://localhost:8002/docs
- Manager: http://localhost:8003/docs

## 🆘 Solución de Problemas

### ❌ "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### ❌ "Error: can't connect to Redis"
Asegurarse que Redis está corriendo:
```bash
redis-cli ping  # Debe responder PONG
```

### ❌ "Port 8000 already in use"
Cambiar puerto en el comando:
```bash
uvicorn api_gateway:app --port 8010
```

### ❌ "Database is locked"
Cerrar todas las instancias de los servicios y reiniciar.

## 🐳 Alternativa: Usar Docker

Si prefieres no instalar todo:

```bash
# Asegurarse que Docker está instalado
docker --version

# Ejecutar todo con compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

## 📊 Arquitectura

```
┌─────────────────────┐
│   Frontend (React)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│   API Gateway (8000)            │
│   - Auth, Surveys, Proxy        │
└──────────────┬──────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌─────────┐┌──────────┐┌────────┐
│Worker   ││Psycholog ││Manager │
│(8001)   ││(8002)    ││(8003)  │
│-Auth    ││-Chat IA  ││-Analys │
│-Patients││-Histroy  ││-Dashbrd│
│-Citas   ││...       ││...     │
└────┬────┘└────┬─────┘└────┬───┘
     │          │           │
     └──────────┼───────────┘
                ▼
        ┌──────────────┐
        │ SQLite (Datos)
        │ Redis (Cache)│
        └──────────────┘
```

## 🎉 ¡Listo!

Ahora puedes:
1. ✅ Registrar usuarios
2. ✅ Login
3. ✅ Chat con IA (Gemini)
4. ✅ Encuestas (Google Forms)
5. ✅ Ver analytics
6. ✅ Todas las funcionalidades del backend

## 📞 Endpoints Principales

```
POST   /auth/register          Registrar
POST   /auth/login             Login
GET    /patients               Listar pacientes
POST   /chat/message           Enviar mensaje
GET    /surveys                Encuestas
POST   /surveys/{id}/responses Responder encuesta
GET    /dashboard              Dashboard
```

Más en http://localhost:8000/docs

## 💡 Notas

- **Token JWT**: Se incluye automáticamente en todas las llamadas
- **Base de datos**: SQLite en `data/app.db`
- **Redis**: Necesario para cache y eventos en tiempo real
- **Gemini API**: Necesaria para el chatbot
- **Entorno de desarrollo**: Todos los logs se muestran en la terminal
