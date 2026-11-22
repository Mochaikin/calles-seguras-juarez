from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api import colonias, reportes

app = FastAPI(
    title="Calles Seguras Juárez API",
    version="1.0.0",
    description="API REST para el reporte y seguimiento de baches y encharcamientos en Ciudad Juárez.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "mensaje": "Bienvenido a la API de Calles Seguras Juárez",
        "documentacion": "/docs",
        "estado": "activo",
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "servicio": "calles-seguras-juarez-api"}


app.include_router(colonias.router)
app.include_router(reportes.router)