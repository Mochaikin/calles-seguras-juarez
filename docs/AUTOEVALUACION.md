### 6. `docs/AUTOEVALUACION.md` (completo de principio a fin)

```markdown
# Autoevaluación del Proyecto — Calles Seguras Juárez

## 1. Resumen Ejecutivo
**Calles Seguras Juárez** es una aplicación web para el reporte y seguimiento ciudadano de daños en la vía pública (baches, hundimientos, grietas, alcantarillas sin tapa) y encharcamientos en Ciudad Juárez. Está estructurada como un monorepo con backend en **FastAPI**, persistencia con **SQLAlchemy** y **Pydantic**, interfaz web con **HTML5, CSS3 y JavaScript**, y pruebas automatizadas con **pytest**.

## 2. Logros Técnicos Implementados
- **API REST en FastAPI:** Verificación de salud (`/health`), consulta de colonias (`/colonias/`), listado con filtros múltiples (`tipo`, `estado`, `colonia_id`, `buscar`, paginación), consulta por ID, creación de reportes con folio automático e historial de estados, actualización de estado (`PATCH /{reporte_id}/estado`) con validación de estados permitidos (`400 Bad Request` ante estados inválidos) y confirmaciones ciudadanas (`POST /{reporte_id}/confirmar`).
- **Interfaz Web (`frontend/`):** Tablero con métricas, filtros, modal para registrar reportes, selector rápido de estado en cada tarjeta (`PATCH /reportes/{id}/estado`) y confirmación en vivo conectada a la API.
- **Pruebas y Control de Versiones:** Suite automatizada de 4 pruebas con `pytest` y `TestClient` (`4 passed`) sobre base de datos aislada en memoria, con historial de commits siguiendo **Conventional Commits** en `main`.

## 3. URL Pública y Despliegue
- **URL pública del frontend:** https://mochaikin.github.io/calles-seguras-juarez/frontend/
- **URL pública del backend / API:** https://calles-seguras-juarez-api-8e6q.onrender.com
- **Entorno local de desarrollo:** Backend en `http://127.0.0.1:8000` (`uvicorn backend.app.main:app --reload`) y frontend con Live Server en `http://127.0.0.1:5500/frontend/`.

## 4. Evidencias Capturadas (`docs/`)
- `docs/confirmar-reporte-docs.png`: Respuesta `201 Created` de `POST /reportes/{reporte_id}/confirmar` en `/docs`.
- `docs/github-commit-seguimiento.png`: Flujo de `git add`, `git commit` con Conventional Commits y `git push` hacia `origin main`.
- `docs/frontend-interfaz-web.png`: Interfaz web de **Calles Seguras Juárez** con estado `API Conectada` y reportes cargados.
- `docs/pytest-resultados.png`: Ejecución de `python -m pytest -v` con pruebas aprobadas.
- `docs/github-commit-docs.png`: Commit y push de la documentación (`docs/AUTOEVALUACION.md` y `README.md`).
- `docs/url-publica-web.png`: Despliegue público en HTTPS funcionando.
- `docs/bloque3-estado-selector.png`: Validación de estados (`4 passed` en `pytest`) y selector rápido de estado en tarjetas.

## 5. Áreas de Mejora y Próximos Pasos
- Verificar conexión y CORS entre el frontend en GitHub Pages y la API en Render.
- Integrar vista de mapa interactivo con coordenadas georreferenciadas de Ciudad Juárez.
- Ampliar la suite de pruebas con `pytest` (filtros combinados, casos `404` y reglas de severidad/estado inicial).

