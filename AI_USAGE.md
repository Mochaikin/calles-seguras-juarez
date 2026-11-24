@"
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
"@ | Set-Content -Path "AI_USAGE.md" -Encoding UTF8

New-Item -ItemType Directory -Force -Path "docs" | Out-Null

@"
# Autoevaluacion del Proyecto - Calles Seguras Juarez

| # | Criterio | Peso | Nivel autoasignado | % | Puntos | Evidencia (enlace) |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | Planeacion y arquitectura | 6 | Notable | 90% | 5.4 | Tablero GitHub Projects y README.md |
| 2 | HTML, CSS y responsividad | 8 | Excelente | 100% | 8.0 | index.html, styles.css y galaxia.png |
| 3 | Frontend | 14 | Notable | 90% | 12.6 | app.js (filtros, creacion, cambio de estado, confirmaciones, Open-Meteo, GPS, CSV) |
| 4 | Backend en FastAPI | 14 | Notable | 90% | 12.6 | backend/app/main.py, backend/app/api/reportes.py, backend/app/api/colonias.py |
| 5 | Base de datos | 12 | Notable | 90% | 10.8 | backend/app/models/models.py, backend/app/seed.py |
| 6 | Seguridad e interoperabilidad | 10 | Bueno | 80% | 8.0 | CORS configurado, privacidad de datos personales y Open-Meteo |
| 7 | Contenedores y despliegue | 10 | Excelente | 100% | 10.0 | backend/Dockerfile, frontend/Dockerfile, infra/docker-compose.yml y URLs publicas |
| 8 | Calidad y DevOps | 8 | Notable | 90% | 7.2 | backend/tests/test_api.py, .github/workflows/ci.yml, Conventional Commits y tag v1.0.0 |
| 9 | Declaracion de uso de IA | 5 | Excelente | 100% | 5.0 | AI_USAGE.md |
| 10 | Reporte tecnico | 5 | Excelente | 100% | 5.0 | docs/REPORTE.pdf y docs/AUTOEVALUACION.md |
| 11 | Demo y defensa (Marlene Marrufo Guccio) | 8 | Excelente | 100% | 8.0 | Demo en vivo en GitHub Pages y Render |
| Extra | Puntos extra (Geolocalizacion / OpenStreetMap) | +5 | Aplicado | - | +2.0 | Geolocalizacion GPS y enlace OpenStreetMap en app.js |
| **Total** | | **100** | | | **94.6** | |

## Reflexion Individual (Marlene Marrufo Guccio)
El criterio con mayor complejidad fue la integracion entre el frontend estatico en GitHub Pages y la API desplegada en Render, resolviendo diferencias de identificadores en el DOM, estados de carga y rutas entre entornos. Si reiniciara el proyecto, definiria desde el inicio las convenciones de nombres entre capas y mantendria el pipeline de CI y contenedores desde los primeros commits. Considero haber alcanzado un nivel sobresaliente al desarrollar, probar y desplegar una aplicacion web completa orientada a un problema real de Ciudad Juarez.
"@ | Set-Content -Path "docs\AUTOEVALUACION.md" -Encoding UTF8