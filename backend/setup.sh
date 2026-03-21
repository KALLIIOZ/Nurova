#!/bin/bash

# Script para ejecutar todos los servicios localmente

echo "🚀 Iniciando NUROVA Backend Services..."
echo ""

# Verificar que Python está disponible
if ! command -v python &> /dev/null; then
    echo "❌ Python no encontrado. Instala Python 3.11+"
    exit 1
fi

# Verificar que Redis está disponible
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis CLI no encontrado. Asegúrate que Redis está corriendo."
    echo "En Windows, instala WSL2 o ejecuta Redis directamente."
    echo ""
fi

# Crear y activar venv si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python -m venv venv
fi

# Activar venv
source venv/bin/activate

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -q -r requirements.txt

# Crear directorio de datos
mkdir -p data

echo ""
echo "✅ Entorno listo"
echo ""
echo "🔄 Para ejecutar los servicios, abre 4 terminales diferentes y ejecuta:"
echo ""
echo "Terminal 1: uvicorn services.worker_service.main:app --reload --port 8001"
echo "Terminal 2: uvicorn services.psychologist_service.main:app --reload --port 8002"
echo "Terminal 3: uvicorn services.manager_service.main:app --reload --port 8003"
echo "Terminal 4: uvicorn api_gateway:app --reload --port 8000"
echo ""
echo "O ejecuta este script en cada terminal (luego de activar venv):"
echo "./run_service.sh [worker|psychologist|manager|gateway]"
