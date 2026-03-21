# 📚 Índice de Documentación - NUROVA Backend

## 🎯 Guía de Lectura Recomendada

### Principiantes: Empezar Aquí ↓

1. **[backend/START_HERE.txt](backend/START_HERE.txt)** (3 min)
   - Bienvenida y contexto general
   - Comandos básicos
   - Solución rápida de problemas

2. **[QUICK_START.md](QUICK_START.md)** (10 min)
   - Instalación paso a paso
   - Ejecución de servicios
   - Verificación rápida

3. **[HOW_IT_WORKS.md](HOW_IT_WORKS.md)** (15 min)
   - Explicación visual del flujo
   - Arquitectura de microservicios
   - Ejemplos de inicio a fin

### Desarrolladores: Integración ↓

4. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** (20 min)
   - Cómo conectar React Native
   - Ejemplos de uso de endpoints
   - Manejo de errores

5. **[TESTING_API.md](TESTING_API.md)** (15 min)
   - Ejemplos de cURL
   - Testing manual de endpoints
   - Scripts de prueba

### Arquitectos: Referencia Técnica ↓

6. **[README.md](backend/README.md)** (30 min)
   - Documentación técnica completa
   - Todos los endpoints
   - Configuración avanzada

7. **[BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)** (20 min)
   - Estructura de carpetas
   - Modelos de BD
   - Flujo de datos

### Resumen Ejecutivo ↓

8. **[BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)** (10 min)
   - Checklist de funcionalidades
   - Estadísticas del proyecto
   - Stack tecnológico

---

## 🗂️ Documentación por Tema

### 🔐 Autenticación y Seguridad
- [README.md - Autenticación](backend/README.md#-autenticación)
- [HOW_IT_WORKS.md - Security en Acción](HOW_IT_WORKS.md#-seguridad-en-acción)
- [FRONTEND_INTEGRATION_GUIDE.md - Autenticación](FRONTEND_INTEGRATION_GUIDE.md#-autenticación)

### 💬 Chat y IA (Gemini)
- [README.md - Integración Gemini](backend/README.md#-integración-gemini-chatbot)
- [HOW_IT_WORKS.md - Ciclo de Chat](HOW_IT_WORKS.md#-ciclo-de-chat)
- [FRONTEND_INTEGRATION_GUIDE.md - Chat](FRONTEND_INTEGRATION_GUIDE.md#-chat-con-ia-gemini)
- [TESTING_API.md - Chat Endpoints](TESTING_API.md#-chat-gemini-ia)

### 📋 Encuestas (Google Forms)
- [README.md - Google Forms](backend/README.md#-integración-google-docsforms)
- [HOW_IT_WORKS.md - Responder Encuesta](HOW_IT_WORKS.md#3️⃣-usuario-responde-encuesta)
- [FRONTEND_INTEGRATION_GUIDE.md - Encuestas](FRONTEND_INTEGRATION_GUIDE.md#-encuestas-google-forms)
- [TESTING_API.md - Encuestas](TESTING_API.md#-encuestas-google-forms)

### 📊 Analytics y Dashboard
- [README.md - Manager](backend/README.md#3-manager-service-puerto-8003---servicio-de-gerentes)
- [HOW_IT_WORKS.md - Manager Ver Analytics](HOW_IT_WORKS.md#4️⃣-manager-ver-analytics)
- [FRONTEND_INTEGRATION_GUIDE.md - Dashboard](FRONTEND_INTEGRATION_GUIDE.md#-dashboard-para-managers)
- [TESTING_API.md - Analytics](TESTING_API.md#-dashboard-y-analytics)

### 👥 Gestión de Pacientes
- [README.md - Pacientes](backend/README.md#--patient-routes--)
- [FRONTEND_INTEGRATION_GUIDE.md - Pacientes](FRONTEND_INTEGRATION_GUIDE.md#-gestión-de-pacientes)
- [TESTING_API.md - Pacientes](TESTING_API.md#-pacientes)
- [BACKEND_STRUCTURE.md - Patient Model](BACKEND_STRUCTURE.md#-base-de-datos-models-modelspy)

### 📅 Citas/Sesiones
- [README.md - Appointments](backend/README.md#--appointment-routes--)
- [TESTING_API.md - Appointments](TESTING_API.md#-citas)

### 🏗️ Arquitectura
- [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)
- [HOW_IT_WORKS.md - Arquitectura](HOW_IT_WORKS.md#-estructura-de-datos)
- [BACKEND_SUMMARY.md - Arquitectura](BACKEND_SUMMARY.md#-arquitectura-implementada)

### 🚀 Deployment
- [README.md - Instalación](backend/README.md#-instalación)
- [QUICK_START.md - Instalación](QUICK_START.md#-inicio-rápido-en-5-minutos)
- [README.md - Docker](backend/README.md#opción-2-con-docker-compose)

### 🐛 Solución de Problemas
- [QUICK_START.md - Troubleshooting](QUICK_START.md#-solución-de-problemas)
- [README.md - Troubleshooting](backend/README.md#-solución-de-problemas)
- [START_HERE.txt - Troubleshooting](backend/START_HERE.txt#-solución-de-problemas)

---

## 📋 Cliente API React Native

**Actualizado**: `src/api/client.js`

Funciones disponibles:
- `registerUser()`
- `loginUser()`
- `getPatients()`, `createPatient()`, etc.
- `sendChatMessage()`, `getChatHistory()`
- `getSurveys()`, `submitSurveyResponse()`
- `getDashboard()`, `generateAnalytics()`

Ver: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)

---

## 🎯 Flujos Típicos

### 1. Usuario Registra e Inicia Sesión
1. Leer: [HOW_IT_WORKS.md #1️⃣](HOW_IT_WORKS.md#1️⃣-usuario-abre-la-app)
2. Probar: [TESTING_API.md #Autenticación](TESTING_API.md#-autenticación)
3. Integrar: [FRONTEND_INTEGRATION_GUIDE.md #Autenticación](FRONTEND_INTEGRATION_GUIDE.md#-autenticación)

### 2. Usuario Chatea con IA
1. Leer: [HOW_IT_WORKS.md #2️⃣](HOW_IT_WORKS.md#2️⃣-usuario-abre-chat-psychologist)
2. Probar: [TESTING_API.md #Chat](TESTING_API.md#-chat-gemini-ia)
3. Integrar: [FRONTEND_INTEGRATION_GUIDE.md #Chat](FRONTEND_INTEGRATION_GUIDE.md#-chat-con-ia-gemini)

### 3. Usuario Responde Encuesta
1. Leer: [HOW_IT_WORKS.md #3️⃣](HOW_IT_WORKS.md#3️⃣-usuario-responde-encuesta)
2. Probar: [TESTING_API.md #Encuestas](TESTING_API.md#-encuestas-google-forms)
3. Integrar: [FRONTEND_INTEGRATION_GUIDE.md #Encuestas](FRONTEND_INTEGRATION_GUIDE.md#-encuestas-google-forms)

### 4. Manager Ver Analytics
1. Leer: [HOW_IT_WORKS.md #4️⃣](HOW_IT_WORKS.md#4️⃣-manager-ver-analytics)
2. Probar: [TESTING_API.md #Analytics](TESTING_API.md#-dashboard-y-analytics)
3. Integrar: [FRONTEND_INTEGRATION_GUIDE.md #Dashboard](FRONTEND_INTEGRATION_GUIDE.md#-dashboard-para-managers)

---

## 🔗 URLs Importantes

### Acceso Local
- **API Gateway**: http://localhost:8000
- **Documentación (Swagger)**: http://localhost:8000/docs
- **Worker Service**: http://localhost:8001
- **Psychologist Service**: http://localhost:8002
- **Manager Service**: http://localhost:8003

### APIs Externas
- **Gemini API**: https://makersuite.google.com/app/apikey
- **Google Forms**: https://docs.google.com/forms

---

## 📦 Archivos Principales

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `backend/README.md` | Docs | 300+ | Documentación completa |
| `QUICK_START.md` | Docs | 250+ | Inicio rápido |
| `HOW_IT_WORKS.md` | Docs | 400+ | Explicación visual |
| `FRONTEND_INTEGRATION_GUIDE.md` | Docs | 350+ | Integración frontend |
| `TESTING_API.md` | Docs | 400+ | Ejemplos de prueba |
| `BACKEND_STRUCTURE.md` | Docs | 250+ | Estructura del proyecto |
| `BACKEND_SUMMARY.md` | Docs | 300+ | Resumen ejecutivo |
| `backend/api_gateway.py` | Code | 400 | API Gateway |
| `backend/services/worker_service/main.py` | Code | 380 | Worker Service |
| `backend/services/psychologist_service/main.py` | Code | 320 | Psychologist Service |
| `backend/services/manager_service/main.py` | Code | 350 | Manager Service |
| `backend/models/models.py` | Code | 280 | Modelos SQLAlchemy |
| `backend/models/schemas.py` | Code | 200 | Schemas Pydantic |
| `src/api/client.js` | Code | 240+ | Cliente React Native |

---

## ✅ Checklist de Verificación

- [ ] Leer `START_HERE.txt`
- [ ] Leer `QUICK_START.md`
- [ ] Copiar `.env.example` a `.env`
- [ ] Agregar API keys
- [ ] Instalar dependencias
- [ ] Iniciar Redis
- [ ] Ejecutar 4 servicios
- [ ] Verificar `http://localhost:8000/health`
- [ ] Leer `HOW_IT_WORKS.md`
- [ ] Probar endpoints en `http://localhost:8000/docs`
- [ ] Leer `FRONTEND_INTEGRATION_GUIDE.md`
- [ ] Actualizar `src/api/config.js`
- [ ] Integrar endpoints en frontend

---

## 🎯 Resumen Rápido

```
┌─────────────────────────────────────────────────────────────┐
│  NUROVA Backend - Arquitectura de Microservicios            │
│                                                               │
│  ✅ 4 Servicios independientes (Worker, Psychologist, etc)  │
│  ✅ Base de datos centralizada en Worker                    │
│  ✅ Chat con IA (Gemini)                                    │
│  ✅ Encuestas (Google Forms)                                │
│  ✅ Analytics y Dashboard                                   │
│  ✅ Redis para caché y eventos                              │
│  ✅ JWT + Bcrypt seguridad                                  │
│  ✅ Docker support                                          │
│  ✅ Documentación completa                                  │
│  ✅ 40+ endpoints funcionales                               │
│                                                               │
│  Todo listo para producción 🚀                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 ¿Dónde Encontrar Qué?

**¿Cómo inicio todo?**
→ [QUICK_START.md](QUICK_START.md)

**¿Cómo funciona internamente?**
→ [HOW_IT_WORKS.md](HOW_IT_WORKS.md)

**¿Cómo integro con mi React Native?**
→ [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)

**¿Cómo pruebo un endpoint?**
→ [TESTING_API.md](TESTING_API.md)

**¿Cuál es la estructura del proyecto?**
→ [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)

**¿Qué endpoints hay disponibles?**
→ [backend/README.md](backend/README.md)

**¿Qué se implementó?**
→ [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)

---

## 🎉 ¡Listo para Comenzar!

1. Abre: `backend/START_HERE.txt`
2. Sigue: `QUICK_START.md`
3. Comprende: `HOW_IT_WORKS.md`
4. Integra: `FRONTEND_INTEGRATION_GUIDE.md`
5. Prueba: `TESTING_API.md`

**¡Bienvenido a NUROVA!** 🚀
