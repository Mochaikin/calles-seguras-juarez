# Declaracion de Uso de Inteligencia Artificial (AI_USAGE.md)

De conformidad con la politica de autoria de la ACM y las normas academicas de la asignatura **Programacion Web**, se declara el uso de herramientas de Inteligencia Artificial generativa durante el desarrollo del proyecto **Calles Seguras Juarez**.

## 1. Herramientas y Modelos Utilizados
- **Gemini (Google):** Asistente conversacional utilizado por **Marlene Marrufo Guccio** para diseno de arquitectura, estructuracion de endpoints en FastAPI, redaccion de pruebas automatizadas con pytest, depuracion de integracion frontend-backend, aviso de lluvia Open-Meteo, contenedores/CI y documentacion tecnica.
- **GitHub Copilot / VS Code:** Autocompletado asistido en editor para sintaxis de Python, HTML5, CSS3 y JavaScript.

## 2. Harness y Modo de Uso
- **Modo chat iterativo:** Generacion de codigo, revision de trazas de error en PowerShell y consola del navegador, y validacion de resultados.
- **IDE y terminal local:** Visual Studio Code en Windows con terminal PowerShell y entorno virtual Python (.venv).

## 3. Archivos de Contexto e Instrucciones
- Documentos y requerimientos del proyecto Calles Seguras Juarez en Ciudad Juarez, Chihuahua.
- Reglas del dominio: folios BCH- y ENC-, catalogo de colonias de Ciudad Juarez, validacion territorial y privacidad de datos personales.

## 4. Bitacora de Prompts Significativos

| Fecha | Integrante | Herramienta / Modelo | Prompt (resumen fiel) | Archivos afectados | Ajustes humanos realizados |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-11-18 | Marlene Marrufo | Gemini | "Estructura modelos SQLAlchemy, esquemas Pydantic y seed con colonias de Ciudad Juarez y reportes." | backend/app/models/models.py, backend/app/schemas/schemas.py, backend/app/seed.py | Validacion de relaciones, datos de Ciudad Juarez y ejecucion en .venv. |
| 2026-11-22 | Marlene Marrufo | Gemini | "Crea endpoints REST en FastAPI para listar reportes con filtros, crear reportes, cambiar estado y confirmar." | backend/app/api/reportes.py, backend/app/api/colonias.py, backend/app/main.py | Revision de respuestas HTTP, reglas de estado y despliegue en Render. |
| 2026-11-23 | Marlene Marrufo | Gemini | "Conecta app.js con index.html, agrega aviso de lluvia Open-Meteo, GPS, CSV y fondo galaxia.png." | index.html, app.js, styles.css, galaxia.png | Colocacion de galaxia.png, copia a la raiz para GitHub Pages y verificacion en vivo. |
| 2026-11-24 | Marlene Marrufo | Gemini | "Genera AI_USAGE.md, Docker Compose, GitHub Actions CI, autoevaluacion y reporte." | AI_USAGE.md, .github/workflows/ci.yml, infra/docker-compose.yml, docs/AUTOEVALUACION.md | Revision de archivos y preparacion del tag v1.0.0. |

## 5. Marcado en Commits
Los commits del repositorio siguen el estandar Conventional Commits (feat:, fix:, docs:, style:, test:, chore:).

## 6. Estimacion de Codigo Generado por IA por Carpeta
- frontend / raiz web: ~65% asistido por IA, ~35% ajuste manual de selectores, estetica con galaxia.png y pruebas.
- backend: ~60% asistido por IA, ~40% validacion de endpoints, modelos y despliegue.
- db: ~50% asistido por IA, ~50% curaduria de datos de Ciudad Juarez.
- infra y .github: ~70% asistido por IA, ~30% configuracion y verificacion en entorno local/CI.

## 7. Reflexion Critica
Durante la integracion del frontend con el backend desplegado en Render, el codigo inicial utilizaba nombres en camelCase mientras el HTML empleaba identificadores con guiones, impidiendo actualizar el estado visual a "API Conectada". Revisar el HTML real y la consola permitio alinear todos los selectores y comprobar la respuesta real de la API. Esto evidencio la importancia de contrastar siempre los contratos entre capas y respaldar los cambios con pruebas automatizadas (pytest).
