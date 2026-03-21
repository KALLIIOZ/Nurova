#!/usr/bin/env python3
"""
Script para ejecutar servicios individuales
Uso: python run_service.py [worker|psychologist|manager|gateway]
"""

import sys
import subprocess
import os

services = {
    "worker": {
        "port": 8001,
        "module": "services.worker_service.main"
    },
    "psychologist": {
        "port": 8002,
        "module": "services.psychologist_service.main"
    },
    "manager": {
        "port": 8003,
        "module": "services.manager_service.main"
    },
    "gateway": {
        "port": 8000,
        "module": "api_gateway"
    }
}


def main():
    if len(sys.argv) < 2:
        print("❌ Uso: python run_service.py [worker|psychologist|manager|gateway]")
        print("\nServicios disponibles:")
        for name, config in services.items():
            print(f"  • {name} (puerto {config['port']})")
        sys.exit(1)
    
    service_name = sys.argv[1].lower()
    
    if service_name not in services:
        print(f"❌ Servicio desconocido: {service_name}")
        print(f"Servicios disponibles: {', '.join(services.keys())}")
        sys.exit(1)
    
    service = services[service_name]
    
    print(f"🚀 Iniciando {service_name.upper()} Service en puerto {service['port']}...")
    print()
    
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        f"{service['module']}:app",
        "--reload",
        "--port",
        str(service['port'])
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print(f"\n\n🛑 {service_name.upper()} Service detenido.")


if __name__ == "__main__":
    main()
