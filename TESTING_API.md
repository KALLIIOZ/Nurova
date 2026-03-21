# 🧪 Testing API - Ejemplos cURL

Conjunto de ejemplos para probar todos los endpoints del backend.

## ⚙️ Variables

```bash
# Configurar estas variables según tu entorno
API_URL="http://localhost:8000"
EMAIL="test@example.com"
PASSWORD="test123456"
TOKEN=""  # Se llena después del login
PATIENT_ID=""  # Se llena después de crear paciente
SURVEY_ID=""  # Se llena después de crear encuesta
```

## 🔐 Autenticación

### Registrar usuario

```bash
curl -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Juan",
    "last_name": "Pérez",
    "password": "test123456",
    "role": "worker"
  }'
```

### Iniciar sesión

```bash
curl -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }' | jq -r '.access_token'
```

Guardar el token:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 👥 Pacientes

### Crear paciente

```bash
curl -X POST ${API_URL}/patients \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María",
    "last_name": "García",
    "email": "maria@example.com",
    "phone": "+34123456789",
    "department": "Recursos Humanos",
    "position": "Coordinadora",
    "health_issue": "Estrés laboral"
  }'
```

### Listar pacientes

```bash
curl -X GET "${API_URL}/patients?skip=0&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Obtener detalles de paciente

```bash
curl -X GET ${API_URL}/patients/1 \
  -H "Authorization: Bearer ${TOKEN}"
```

### Actualizar paciente

```bash
curl -X PUT ${API_URL}/patients/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "observation": "Paciente mejorando después del tratamiento",
    "health_issue": "Mejora en estrés laboral"
  }'
```

## 📅 Citas

### Crear cita

```bash
curl -X POST ${API_URL}/appointments \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "appointment_date": "2025-12-15T10:30:00Z",
    "status": "pendiente"
  }'
```

### Listar citas

```bash
curl -X GET "${API_URL}/appointments?skip=0&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Obtener detalles de cita

```bash
curl -X GET ${API_URL}/appointments/1 \
  -H "Authorization: Bearer ${TOKEN}"
```

### Listar citas de un paciente

```bash
curl -X GET "${API_URL}/appointments?patient_id=1&skip=0&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"
```

## 💬 Chat (Gemini IA)

### Enviar mensaje

```bash
curl -X POST "${API_URL}/chat/message?message=Hola,%20estoy%20sintiendo%20ansiedad" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

Con JSON más complejo:
```bash
curl -X POST ${API_URL}/chat/message \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Qué puedo hacer para manejar mi ansiedad?"
  }'
```

### Obtener historial de chat

```bash
curl -X GET "${API_URL}/chat/history?skip=0&limit=50" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Limpiar historial

```bash
curl -X DELETE ${API_URL}/chat/history \
  -H "Authorization: Bearer ${TOKEN}"
```

## 📋 Encuestas (Google Forms)

### Crear encuesta

```bash
curl -X POST ${API_URL}/surveys \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Encuesta de Satisfacción",
    "description": "Evaluación del servicio psicológico",
    "google_form_id": "1hIBEqsq5zAMzYy7j7kLJ7s8sZgUq0h",
    "google_form_url": "https://docs.google.com/forms/d/1hIBEqsq5zAMzYy7j7kLJ7s8sZgUq0h/edit"
  }'
```

### Listar encuestas

```bash
curl -X GET "${API_URL}/surveys?skip=0&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Obtener detalles de encuesta

```bash
curl -X GET ${API_URL}/surveys/1 \
  -H "Authorization: Bearer ${TOKEN}"
```

### Enviar respuesta a encuesta

```bash
curl -X POST ${API_URL}/surveys/1/responses \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "satisfaction": 5,
    "comments": "Muy buena experiencia",
    "would_recommend": true
  }'
```

### Obtener respuestas a encuesta

```bash
curl -X GET ${API_URL}/surveys/1/responses \
  -H "Authorization: Bearer ${TOKEN}"
```

## 📊 Dashboard y Analytics

### Obtener resumen del dashboard

```bash
curl -X GET ${API_URL}/dashboard \
  -H "Authorization: Bearer ${TOKEN}"
```

### Obtener analytics por departamento

```bash
curl -X GET ${API_URL}/analytics/departments \
  -H "Authorization: Bearer ${TOKEN}"
```

### Generar análisis

```bash
curl -X POST ${API_URL}/analytics/generate \
  -H "Authorization: Bearer ${TOKEN}"
```

## 📝 Historiales Médicos

### Crear registro médico

```bash
curl -X POST ${API_URL}/medical-records \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "diagnosis": "Ansiedad generalizada",
    "treatment_plan": "Terapia cognitivo-conductual + sesiones semanales",
    "notes": "Paciente responde bien al tratamiento"
  }'
```

### Obtener registros médicos de paciente

```bash
curl -X GET ${API_URL}/patients/1/medical-records \
  -H "Authorization: Bearer ${TOKEN}"
```

## 🏥 Health Check

### Verificar estado global

```bash
curl -X GET ${API_URL}/health
```

Respuesta esperada:
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

### Verificar servicio específico

```bash
curl -X GET http://localhost:8001/health  # Worker
curl -X GET http://localhost:8002/health  # Psychologist
curl -X GET http://localhost:8003/health  # Manager
```

## 🐚 Script Completo de Ejemplo

```bash
#!/bin/bash

API_URL="http://localhost:8000"

# 1. Registrar usuario
echo "1️⃣  Registrando usuario..."
curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "last_name": "User",
    "password": "test123",
    "role": "worker"
  }' | jq .

# 2. Login
echo -e "\n2️⃣  Iniciando sesión..."
TOKEN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' | jq -r '.access_token')

echo "Token: ${TOKEN:0:20}..."

# 3. Crear paciente
echo -e "\n3️⃣  Creando paciente..."
curl -s -X POST ${API_URL}/patients \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María",
    "email": "maria@example.com",
    "department": "HR"
  }' | jq .

# 4. Listar pacientes
echo -e "\n4️⃣  Listando pacientes..."
curl -s -X GET "${API_URL}/patients?limit=5" \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# 5. Enviar mensaje de chat
echo -e "\n5️⃣  Enviando mensaje de chat..."
curl -s -X POST "${API_URL}/chat/message?message=Hola" \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# 6. Health check
echo -e "\n6️⃣  Verificando salud de servicios..."
curl -s -X GET ${API_URL}/health | jq .
```

## 📊 Procesar Respuestas con jq

```bash
# Solo obtener el token
curl ... | jq -r '.access_token'

# Obtener lista de pacientes
curl ... | jq '.[] | {id, name, email}'

# Contar elementos
curl ... | jq 'length'

# Filtrar
curl ... | jq '.[] | select(.role == "psychologist")'
```

## 🔗 URLs Interactivas (Swagger)

```
http://localhost:8000/docs      # API Gateway
http://localhost:8001/docs      # Worker Service
http://localhost:8002/docs      # Psychologist Service
http://localhost:8003/docs      # Manager Service
```

## 💡 Tips

1. **Guardar token en variable**: `TOKEN=$(curl ... | jq -r '.access_token')`
2. **Pretty print JSON**: Agregar `| jq .` al final
3. **Ver headers**: Agregar `-i` a la llamada
4. **Ver todo (headers + body)**: Agregar `-v` a la llamada
5. **Post data como archivo**: `-d @file.json`
6. **Timeout**: `-m 30` para 30 segundos

## ⏱️ Flujo Típico

```bash
# 1. Health check
curl ${API_URL}/health

# 2. Registrar
curl -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{...}'

# 3. Login y guardar token
TOKEN=$(curl -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.access_token')

# 4. Usar token en llamadas posteriores
curl ${API_URL}/patients \
  -H "Authorization: Bearer ${TOKEN}"
```
