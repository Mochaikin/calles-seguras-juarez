# Calles Seguras Juárez

Plataforma ciudadana para reportar y dar seguimiento a baches, daños en pavimento y encharcamientos en Ciudad Juárez.

## URL Pública
- **Sitio web:** https://mochaikin.github.io/calles-seguras-juarez/frontend/[cite: 3]
- **API / Documentación:** https://calles-seguras-juarez-api-8e6q.onrender.com[cite: 5]

## Stack Tecnológico
- **Backend:** FastAPI, SQLAlchemy, Pydantic, Python 3.13
- **Base de Datos:** SQLite (`calles_seguras.db`) / compatible con PostgreSQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Pruebas:** `pytest`, `httpx2`, FastAPI `TestClient`

## Ejecución Local

### 1. Backend (FastAPI)
Desde la raíz del proyecto con el entorno virtual activo:

```powershell
uvicorn backend.app.main:app --reload