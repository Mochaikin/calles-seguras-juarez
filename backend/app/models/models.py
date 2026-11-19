from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="ciudadano") # ciudadano, moderador, coordinador, enlace_municipal
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reportes = relationship("Reporte", back_populates="autor")
    confirmaciones = relationship("Confirmacion", back_populates="usuario")

class Colonia(Base):
    __tablename__ = "colonias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    sector = Column(String, nullable=False)
    activa = Column(Boolean, default=True)

    reportes = relationship("Reporte", back_populates="colonia")

class Reporte(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String, unique=True, index=True, nullable=False) # BCH-2026-000123 o ENC-2026-000045
    tipo = Column(String, nullable=False) # bache, hundimiento, grieta, alcantarilla_sin_tapa, encharcamiento
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    calle = Column(String, nullable=False)
    colonia_id = Column(Integer, ForeignKey("colonias.id"))
    estado = Column(String, default="recibido") # recibido, validado, programado, en_reparacion, reparado, rechazado
    severidad_o_nivel = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    colonia = relationship("Colonia", back_populates="reportes")
    autor = relationship("User", back_populates="reportes")
    confirmaciones = relationship("Confirmacion", back_populates="reporte")
    historial = relationship("HistorialEstado", back_populates="reporte")

class Confirmacion(Base):
    __tablename__ = "confirmaciones"

    id = Column(Integer, primary_key=True, index=True)
    reporte_id = Column(Integer, ForeignKey("reportes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    tipo_respuesta = Column(String, nullable=False) # confirma_sigue, desmiente_ya_no_hay
    created_at = Column(DateTime, default=datetime.utcnow)

    reporte = relationship("Reporte", back_populates="confirmaciones")
    usuario = relationship("User", back_populates="confirmaciones")

class HistorialEstado(Base):
    __tablename__ = "historial_estados"

    id = Column(Integer, primary_key=True, index=True)
    reporte_id = Column(Integer, ForeignKey("reportes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    estado_anterior = Column(String, nullable=False)
    estado_nuevo = Column(String, nullable=False)
    comentario = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reporte = relationship("Reporte", back_populates="historial")