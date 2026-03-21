@echo off
REM Script para ejecutar todos los servicios localmente en Windows

echo 🚀  Iniciando NUROVA Backend Services...
echo.

REM Verificar que Python está disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no encontrado. Instala Python 3.11+
    exit /b 1
)

REM Crear y activar venv si no existe
if not exist venv (
    echo 📦  Creando entorno virtual...
    python -m venv venv
)

REM Activar venv
call venv\Scripts\activate.bat

REM Instalar dependencias
echo 📚  Instalando dependencias...
pip install -q -r requirements.txt

REM Crear directorio de datos
if not exist data mkdir data

echo.
echo ✅  Entorno listo
echo.
echo 🔄  Para ejecutar los servicios, abre 4 terminales diferentes (PowerShell o CMD) y ejecuta:
echo.
echo Terminal 1: venv\Scripts\activate ^& uvicorn services.worker_service.main:app --reload --port 8001
echo Terminal 2: venv\Scripts\activate ^& uvicorn services.psychologist_service.main:app --reload --port 8002
echo Terminal 3: venv\Scripts\activate ^& uvicorn services.manager_service.main:app --reload --port 8003
echo Terminal 4: venv\Scripts\activate ^& uvicorn api_gateway:app --reload --port 8000
echo.
echo O ejecuta en cada terminal después de activar venv:
echo python run_service.py worker (o psychologist, manager, gateway)
