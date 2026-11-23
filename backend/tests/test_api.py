from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models.models import Colonia

SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    colonia = Colonia(
        nombre="Partido Romero",
        sector="Centro",
        activa=True,
    )
    db.add(colonia)
    db.commit()
    db.close()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_listar_colonias():
    response = client.get("/colonias/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["nombre"] == "Partido Romero"


def test_crear_y_confirmar_reporte():
    payload = {
        "tipo": "bache",
        "latitud": 31.7385,
        "longitud": -106.4850,
        "calle": "Av. Vicente Guerrero #1200",
        "colonia_id": 1,
        "severidad_o_nivel": "Alta",
        "descripcion": "Bache profundo en carril de circulación",
    }
    res_crear = client.post("/reportes/", json=payload)
    assert res_crear.status_code == 201
    creado = res_crear.json()
    assert creado["folio"].startswith("BCH-")
    assert creado["estado"] == "recibido"

    reporte_id = creado["id"]
    res_confirmar = client.post(
        f"/reportes/{reporte_id}/confirmar",
        json={"comentario": "Confirmado en prueba automatizada"},
    )
    assert res_confirmar.status_code == 201
    assert res_confirmar.json()["total_confirmaciones"] == 1