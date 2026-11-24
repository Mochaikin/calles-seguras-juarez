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
