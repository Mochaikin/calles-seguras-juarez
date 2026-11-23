from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import Reporte, Colonia, HistorialEstado, Confirmacion
from backend.app.schemas.schemas import ReporteCreate, ReporteResponse

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def _generar_folio(db: Session, tipo: str) -> str:
    anio = datetime.now(timezone.utc).year
    prefijo = "ENC" if tipo == "encharcamiento" else "BCH"
    total_tipo = db.query(Reporte).filter(Reporte.folio.like(f"{prefijo}-{anio}-%")).count()
    consecutivo = total_tipo + 1
    return f"{prefijo}-{anio}-{consecutivo:06d}"


@router.get("/", response_model=List[ReporteResponse])
def listar_reportes(
    tipo: Optional[str] = Query(default=None, description="bache, hundimiento, grieta, alcantarilla_sin_tapa, encharcamiento"),
    estado: Optional[str] = Query(default=None, description="recibido, validado, programado, en_reparacion, reparado, activo, historico"),
    colonia_id: Optional[int] = Query(default=None, description="ID de la colonia"),
    buscar: Optional[str] = Query(default=None, description="Buscar por folio o calle"),
    limite: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Reporte)

    if tipo:
        query = query.filter(Reporte.tipo == tipo)

    if estado:
        query = query.filter(Reporte.estado == estado)

    if colonia_id:
        query = query.filter(Reporte.colonia_id == colonia_id)

    if buscar:
        patron = f"%{buscar}%"
        query = query.filter(
            (Reporte.folio.ilike(patron)) | (Reporte.calle.ilike(patron))
        )

    return query.order_by(Reporte.created_at.desc()).offset(offset).limit(limite).all()


@router.get("/{reporte_id}", response_model=ReporteResponse)
def obtener_reporte(reporte_id: int, db: Session = Depends(get_db)):
    reporte = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte no encontrado",
        )
    return reporte


@router.post("/", response_model=ReporteResponse, status_code=status.HTTP_201_CREATED)
def crear_reporte(payload: ReporteCreate, db: Session = Depends(get_db)):
    if payload.colonia_id is not None:
        colonia = db.query(Colonia).filter(Colonia.id == payload.colonia_id).first()
        if not colonia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La colonia indicada no existe",
            )

    # Regla de negocio: encharcamientos inician activos; daños en pavimento inician recibidos
    estado_inicial = "activo" if payload.tipo == "encharcamiento" else "recibido"
    severidad_final = "Alta" if payload.tipo == "alcantarilla_sin_tapa" else payload.severidad_o_nivel
    folio = _generar_folio(db, payload.tipo)
    ahora = datetime.now(timezone.utc).replace(tzinfo=None)

    nuevo_reporte = Reporte(
        folio=folio,
        tipo=payload.tipo,
        latitud=payload.latitud,
        longitud=payload.longitud,
        calle=payload.calle,
        colonia_id=payload.colonia_id,
        estado=estado_inicial,
        severidad_o_nivel=severidad_final,
        descripcion=payload.descripcion,
        user_id=None,
        created_at=ahora,
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)

    historial = HistorialEstado(
        reporte_id=nuevo_reporte.id,
        user_id=None,
        estado_anterior="ninguno",
        estado_nuevo=estado_inicial,
        comentario="Reporte registrado vía API",
        created_at=ahora,
    )
    db.add(historial)
    db.commit()

    return nuevo_reporte


@router.patch("/{reporte_id}/estado", response_model=ReporteResponse)
def actualizar_estado_reporte(
    reporte_id: int,
    nuevo_estado: str = Body(..., embed=True, min_length=2, max_length=50),
    comentario: Optional[str] = Body(default=None, embed=True, max_length=300),
    db: Session = Depends(get_db),
):
    reporte = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte no encontrado",
        )

    estado_anterior = reporte.estado
    reporte.estado = nuevo_estado
    db.commit()
    db.refresh(reporte)

    ahora = datetime.now(timezone.utc).replace(tzinfo=None)
    historial = HistorialEstado(
        reporte_id=reporte.id,
        user_id=None,
        estado_anterior=estado_anterior,
        estado_nuevo=nuevo_estado,
        comentario=comentario or "Actualización de estado vía API",
        created_at=ahora,
    )
    db.add(historial)
    db.commit()

    return reporte


@router.post("/{reporte_id}/confirmar", status_code=status.HTTP_201_CREATED)
def confirmar_reporte(
    reporte_id: int,
    comentario: Optional[str] = Body(default=None, embed=True, max_length=300),
    db: Session = Depends(get_db),
):
    reporte = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte no encontrado",
        )

    ahora = datetime.now(timezone.utc).replace(tzinfo=None)
    confirmacion = Confirmacion(
        reporte_id=reporte.id,
        user_id=None,
        tipo_respuesta="confirmar",
        created_at=ahora,
    )
    db.add(confirmacion)
    db.commit()
    db.refresh(confirmacion)

    total_confirmaciones = db.query(Confirmacion).filter(Confirmacion.reporte_id == reporte.id).count()

    return {
        "mensaje": "Confirmación registrada con éxito",
        "reporte_id": reporte.id,
        "folio": reporte.folio,
        "confirmacion_id": confirmacion.id,
        "total_confirmaciones": total_confirmaciones,
    }