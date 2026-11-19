from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.models import User, Colonia, Reporte, HistorialEstado

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

COLONIAS_JUAREZ = [
    ("Partido Romero", "Centro"),
    ("Zona Pronaf", "Centro"),
    ("Las Misiones", "Poniente"),
    ("Campos Elíseos", "Poniente"),
    ("San Lorenzo", "Norte"),
    ("Anáhuac", "Centro"),
    ("Parajes del Sur", "Sur"),
    ("Riveras del Bravo", "Oriente"),
    ("Héroes de México", "Suroriente"),
    ("Altavista", "Centro"),
    ("Fovissste Chamizal", "Norte"),
    ("Granjas de Chapultepec", "Poniente"),
    ("Valle del Sol", "Suroriente"),
    ("Pradera Dorada", "Norponiente"),
    ("Chaveña", "Centro"),
    ("Lomas de San José", "Poniente"),
    ("Misiones del Real", "Suroriente"),
    ("El Jarudo", "Centro"),
    ("Oasis Revolución", "Sur"),
    ("Infónavit Casas Grandes", "Norte"),
    ("Senderos de San Isidro", "Suroriente"),
    ("La Cuesta", "Poniente"),
    # Zonas residenciales / fraccionamientos de acceso controlado (áreas exclusivas)
    ("Fraccionamiento Bosques de Juárez", "Acceso Controlado - Poniente"),
    ("Residencial Campestre", "Acceso Controlado - Norte"),
    ("Club Campestre Juárez", "Acceso Controlado - Suroriente"),
]


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def seed_data(db: Session):
    Base.metadata.create_all(bind=engine)

    # 1. Usuarios base por rol (si no existen)
    usuarios_demo = [
        ("Coord. Calles Seguras", "coordinador@callesseguras.mx", "Coord2026!", "coordinador"),
        ("Mod. Voluntario Juárez", "moderador@callesseguras.mx", "Mod2026!", "moderador"),
        ("Enlace Obras Públicas", "enlace@callesseguras.mx", "Enlace2026!", "enlace_municipal"),
        ("Marlene Ciudadana", "ciudadano@callesseguras.mx", "Ciud2026!", "ciudadano"),
    ]

    users_creados = []
    for nombre, correo, clave, rol in usuarios_demo:
        existente = db.query(User).filter(User.correo == correo).first()
        if not existente:
            u = User(
                nombre=nombre,
                correo=correo,
                password_hash=get_password_hash(clave),
                rol=rol,
                activo=True,
            )
            db.add(u)
            db.commit()
            db.refresh(u)
            users_creados.append(u)
        else:
            users_creados.append(existente)

    ciudadano_user = next((u for u in users_creados if u.rol == "ciudadano"), users_creados[0])
    moderador_user = next((u for u in users_creados if u.rol == "moderador"), users_creados[0])

    # 2. Colonias reales de Ciudad Juárez y zonas de acceso controlado
    colonias_creadas = []
    for nombre_col, sector in COLONIAS_JUAREZ:
        col = db.query(Colonia).filter(Colonia.nombre == nombre_col).first()
        if not col:
            col = Colonia(nombre=nombre_col, sector=sector, activa=True)
            db.add(col)
            db.commit()
            db.refresh(col)
        colonias_creadas.append(col)

    # 3. Reportes de ejemplo (baches y encharcamientos con folios BCH / ENC)
    if db.query(Reporte).count() == 0:
        tipos_danio = ["bache", "hundimiento", "grieta", "alcantarilla_sin_tapa", "encharcamiento"]
        estados_bache = ["recibido", "validado", "programado", "en_reparacion", "reparado"]
        calles_ejemplo = [
            "Av. Tecnológico",
            "Blvd. Teófilo Borunda",
            "Av. Ejército Nacional",
            "Calle Ignacio Zaragoza",
            "Av. Paseo Triunfo de la República",
            "Blvd. Independencia",
            "Av. de las Torres",
        ]
        costos_referencia_mxn = [1800, 3500, 5200, 8900, 12400]

        ahora = datetime.utcnow()
        consecutivo_bch = 1
        consecutivo_enc = 1

        for i in range(1, 31):
            tipo = tipos_danio[i % len(tipos_danio)]
            col = colonias_creadas[i % len(colonias_creadas)]
            calle = calles_ejemplo[i % len(calles_ejemplo)]
            lat = 31.65 + (i % 12) * 0.01
            lon = -106.48 + (i % 10) * 0.01
            fecha_creacion = ahora - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
            costo_ref = costos_referencia_mxn[i % len(costos_referencia_mxn)]

            if tipo == "encharcamiento":
                folio = f"ENC-2026-{consecutivo_enc:06d}"
                consecutivo_enc += 1
                estado = "activo" if i % 3 != 0 else "historico"
                sev_o_nivel = ["a un lado de la calle", "cubre un carril", "a media llanta", "intransitable"][i % 4]
            else:
                folio = f"BCH-2026-{consecutivo_bch:06d}"
                consecutivo_bch += 1
                estado = estados_bache[i % len(estados_bache)]
                sev_o_nivel = "Alta" if tipo == "alcantarilla_sin_tapa" else ["Baja", "Media", "Alta"][i % 3]

            rep = Reporte(
                folio=folio,
                tipo=tipo,
                latitud=lat,
                longitud=lon,
                calle=f"{calle} #{100 + i * 15}",
                colonia_id=col.id,
                estado=estado,
                severidad_o_nivel=sev_o_nivel,
                descripcion=(
                    f"Reporte #{i} de {tipo} en {col.nombre} "
                    f"(costo estimado de referencia: ${costo_ref:,} MXN)."
                ),
                user_id=ciudadano_user.id,
                created_at=fecha_creacion,
            )
            db.add(rep)
            db.commit()
            db.refresh(rep)

            hist = HistorialEstado(
                reporte_id=rep.id,
                user_id=moderador_user.id,
                estado_anterior="ninguno",
                estado_nuevo=estado,
                comentario="Registro inicial de semilla",
                created_at=fecha_creacion,
            )
            db.add(hist)
            db.commit()

    print("Seed completado con éxito: colonias, zonas de acceso controlado, usuarios y reportes de prueba.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()