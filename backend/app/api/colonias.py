from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import Colonia
from backend.app.schemas.schemas import ColoniaResponse

router = APIRouter(prefix="/colonias", tags=["Colonias"])


@router.get("/", response_model=List[ColoniaResponse])
def listar_colonias(
    sector: Optional[str] = Query(default=None, description="Filtrar por sector o zona"),
    buscar: Optional[str] = Query(default=None, description="Buscar por nombre de colonia"),
    solo_activas: bool = Query(default=True, description="Mostrar solo colonias activas"),
    db: Session = Depends(get_db),
):
    query = db.query(Colonia)

    if solo_activas:
        query = query.filter(Colonia.activa.is_(True))

    if sector:
        query = query.filter(Colonia.sector.ilike(f"%{sector}%"))

    if buscar:
        query = query.filter(Colonia.nombre.ilike(f"%{buscar}%"))

    return query.order_by(Colonia.nombre.asc()).all()