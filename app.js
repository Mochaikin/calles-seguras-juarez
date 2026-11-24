const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://calles-seguras-juarez-api-8e6q.onrender.com";

let coloniasMap = {};
let reportesActuales = [];

document.addEventListener("DOMContentLoaded", async () => {
  inicializarModal();
  inicializarFiltros();
  inicializarExportacion();
  await verificarConexion();
  await cargarPronosticoLluvia();
  await cargarColonias();
  await cargarReportes();
});

function mostrarToast(mensaje) {
  const toastEl = document.getElementById("toast");
  if (!toastEl) return;
  toastEl.textContent = mensaje;
  toastEl.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 3200);
}

async function verificarConexion() {
  const statusEl = document.getElementById("api-status");
  if (!statusEl) return;

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("API no disponible");
    statusEl.textContent = "API Conectada";
    statusEl.classList.remove("status-loading", "status-offline", "status-error");
    statusEl.classList.add("status-online", "status-connected");
    statusEl.style.setProperty("background-color", "#16a34a", "important");
    statusEl.style.setProperty("color", "#ffffff", "important");
  } catch (err) {
    statusEl.textContent = "API Desconectada";
    statusEl.classList.remove("status-loading", "status-online", "status-connected");
    statusEl.classList.add("status-offline", "status-error");
    statusEl.style.setProperty("background-color", "#dc2626", "important");
    statusEl.style.setProperty("color", "#ffffff", "important");
  }
}

async function cargarPronosticoLluvia() {
  const banner = document.getElementById("banner-lluvia");
  const titulo = document.getElementById("rain-titulo");
  const detalle = document.getElementById("rain-detalle");
  const btnVerEncharcamientos = document.getElementById("btn-filtrar-encharcamientos");

  if (!banner || !titulo || !detalle) return;

  if (btnVerEncharcamientos) {
    btnVerEncharcamientos.addEventListener("click", () => {
      const filtroTipo = document.getElementById("filtro-tipo");
      const filtroEstado = document.getElementById("filtro-estado");
      if (filtroTipo) filtroTipo.value = "encharcamiento";
      if (filtroEstado) filtroEstado.value = "activo";
      cargarReportes();
    });
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=31.7385&longitude=-106.4850&hourly=precipitation_probability&forecast_hours=12&timezone=America%2FCiudad_Juarez";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Clima no disponible");

    const data = await res.json();
    const probs = data?.hourly?.precipitation_probability || [];
    const maxProb = probs.length ? Math.max(...probs) : 0;

    banner.classList.remove("hidden");
    if (maxProb >= 30) {
      banner.classList.add("rain-alert");
      titulo.textContent = `Aviso de lluvia en Ciudad Juárez (${maxProb}% de probabilidad en 12 h)`;
      detalle.textContent =
        "Revisa los encharcamientos activos antes de salir y evita pasos a desnivel inundables.";
    } else {
      banner.classList.remove("rain-alert");
      titulo.textContent = `Clima estable en Ciudad Juárez (${maxProb}% prob. de lluvia en 12 h)`;
      detalle.textContent =
        "Monitoreo meteorológico activo vía Open-Meteo. Consulta encharcamientos históricos o reportes viales.";
    }
  } catch (err) {
    banner.classList.remove("hidden");
    titulo.textContent = "Pronóstico no disponible";
    detalle.textContent = "La plataforma sigue operando con normalidad.";
  }
}

async function cargarColonias() {
  try {
    const res = await fetch(`${API_BASE}/colonias/`);
    if (!res.ok) return;
    const colonias = await res.json();

    coloniasMap = {};
    const filtroColonia = document.getElementById("filtro-colonia");
    const modalColonia = document.getElementById("rep-colonia");

    if (filtroColonia) {
      filtroColonia.innerHTML = '<option value="">Todas las colonias</option>';
    }
    if (modalColonia) {
      modalColonia.innerHTML = '<option value="">Selecciona una colonia...</option>';
    }

    colonias.forEach((c) => {
      coloniasMap[c.id] = c.nombre;

      if (filtroColonia) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        filtroColonia.appendChild(opt);
      }

      if (modalColonia) {
        const opt2 = document.createElement("option");
        opt2.value = c.id;
        opt2.textContent = c.nombre;
        modalColonia.appendChild(opt2);
      }
    });

    const statColonias = document.getElementById("stat-colonias");
    if (statColonias) statColonias.textContent = colonias.length;
  } catch (err) {
    console.error("Error al cargar colonias:", err);
  }
}

async function cargarReportes() {
  const listaEl = document.getElementById("reportes-grid");
  const countLabel = document.getElementById("resultados-texto");

  const buscar = document.getElementById("filtro-buscar")?.value.trim() || "";
  const coloniaId = document.getElementById("filtro-colonia")?.value || "";
  const tipo = document.getElementById("filtro-tipo")?.value || "";
  const estado = document.getElementById("filtro-estado")?.value || "";

  const params = new URLSearchParams();
  if (buscar) params.append("buscar", buscar);
  if (coloniaId) params.append("colonia_id", coloniaId);
  if (tipo) params.append("tipo", tipo);
  if (estado) params.append("estado", estado);

  try {
    const queryString = params.toString();
    const url = `${API_BASE}/reportes/${queryString ? `?${queryString}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al consultar reportes");

    const reportes = await res.json();
    reportesActuales = reportes;
    actualizarEstadisticas(reportes);
    renderizarReportes(reportes);
    if (countLabel) {
      countLabel.textContent = `Mostrando ${reportes.length} reporte(s)`;
    }
  } catch (err) {
    console.error("Error al cargar reportes:", err);
    if (listaEl) {
      listaEl.innerHTML =
        '<div class="empty-state">No se pudieron cargar los reportes desde la API.</div>';
    }
    if (countLabel) countLabel.textContent = "Error de conexión";
  }
}

function actualizarEstadisticas(reportes) {
  const total = reportes.length;
  const encharcamientos = reportes.filter((r) => r.tipo === "encharcamiento").length;
  const baches = total - encharcamientos;

  const statTotal = document.getElementById("stat-total");
  const statBaches = document.getElementById("stat-baches");
  const statEncharcamientos = document.getElementById("stat-encharcamientos");

  if (statTotal) statTotal.textContent = total;
  if (statBaches) statBaches.textContent = baches;
  if (statEncharcamientos) statEncharcamientos.textContent = encharcamientos;
}

function formatearEtiqueta(valor) {
  if (!valor) return "";
  return valor
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function renderizarReportes(reportes) {
  const listaEl = document.getElementById("reportes-grid");
  if (!listaEl) return;

  if (!reportes || reportes.length === 0) {
    listaEl.innerHTML =
      '<div class="empty-state">No hay reportes que coincidan con los filtros seleccionados.</div>';
    return;
  }

  const estadosOpciones = [
    { val: "recibido", label: "Recibido" },
    { val: "validado", label: "Validado" },
    { val: "programado", label: "Programado" },
    { val: "en_reparacion", label: "En reparación" },
    { val: "reparado", label: "Reparado" },
    { val: "activo", label: "Activo" },
    { val: "historico", label: "Histórico" },
  ];

  listaEl.innerHTML = reportes
    .map((r) => {
      const nombreColonia = coloniasMap[r.colonia_id] || "Sin colonia asignada";
      const fecha = r.created_at
        ? new Date(r.created_at).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Fecha reciente";

      const opcionesHtml = estadosOpciones
        .map(
          (opt) =>
            `<option value="${opt.val}" ${r.estado === opt.val ? "selected" : ""}>${opt.label}</option>`
        )
        .join("");

      const mapaUrl = `https://www.openstreetmap.org/?mlat=${r.latitud}&mlon=${r.longitud}#map=16/${r.latitud}/${r.longitud}`;

      return `
        <article class="report-card">
          <div class="card-top">
            <span class="folio-badge">${r.folio}</span>
            <span class="status-pill">${formatearEtiqueta(r.estado)}</span>
          </div>

          <h3 class="card-title">${formatearEtiqueta(r.tipo)} — ${r.calle}</h3>

          <div class="card-meta">
            <span><strong>Colonia:</strong> ${nombreColonia}</span>
            <span><strong>Severidad / Nivel:</strong> ${r.severidad_o_nivel || "No especificada"}</span>
            <span><strong>Registrado:</strong> ${fecha}</span>
            <span><a href="${mapaUrl}" target="_blank" rel="noopener noreferrer" class="map-link">📍 Ver ubicación (${Number(r.latitud).toFixed(4)}, ${Number(r.longitud).toFixed(4)})</a></span>
          </div>

          <p class="card-desc">${r.descripcion || "Sin descripción adicional."}</p>

          <div class="card-actions">
            <select
              class="estado-select"
              aria-label="Cambiar estado de ${r.folio}"
              onchange="cambiarEstadoReporte(${r.id}, this.value)"
            >
              ${opcionesHtml}
            </select>
            <button class="btn-confirm" onclick="confirmarReporte(${r.id}, this)">
              👍 Confirmar reporte
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function cambiarEstadoReporte(reporteId, nuevoEstado) {
  try {
    const res = await fetch(`${API_BASE}/reportes/${reporteId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nuevo_estado: nuevoEstado,
        comentario: "Estado actualizado desde la interfaz web",
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "No se pudo actualizar el estado");
    }

    mostrarToast(`Estado actualizado a ${formatearEtiqueta(nuevoEstado)}`);
    await cargarReportes();
  } catch (err) {
    alert(`Error: ${err.message}`);
    await cargarReportes();
  }
}

async function confirmarReporte(reporteId, btnEl) {
  try {
    if (btnEl) btnEl.disabled = true;
    const res = await fetch(`${API_BASE}/reportes/${reporteId}/confirmar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comentario: "Confirmado desde la plataforma ciudadana",
      }),
    });

    if (!res.ok) throw new Error("No se pudo registrar la confirmación");
    const data = await res.json();
    if (btnEl) {
      btnEl.textContent = `👍 Confirmado (${data.total_confirmaciones})`;
    }
    mostrarToast("Confirmación registrada");
  } catch (err) {
    alert(`Error: ${err.message}`);
    if (btnEl) btnEl.disabled = false;
  }
}

function inicializarFiltros() {
  const btnAplicar = document.getElementById("btn-filtrar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  if (btnAplicar) {
    btnAplicar.addEventListener("click", cargarReportes);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      const buscar = document.getElementById("filtro-buscar");
      const colonia = document.getElementById("filtro-colonia");
      const tipo = document.getElementById("filtro-tipo");
      const estado = document.getElementById("filtro-estado");

      if (buscar) buscar.value = "";
      if (colonia) colonia.value = "";
      if (tipo) tipo.value = "";
      if (estado) estado.value = "";
      cargarReportes();
    });
  }
}

function inicializarExportacion() {
  const btnCsv = document.getElementById("btn-exportar-csv");
  if (!btnCsv) return;

  btnCsv.addEventListener("click", () => {
    if (!reportesActuales.length) {
      mostrarToast("No hay reportes visibles para exportar");
      return;
    }
    const encabezados = ["Folio", "Tipo", "Calle", "Colonia", "Severidad_Nivel", "Estado", "Latitud", "Longitud", "Fecha"];
    const filas = reportesActuales.map((r) => [
      r.folio,
      r.tipo,
      `"${(r.calle || "").replace(/"/g, '""')}"`,
      `"${(coloniasMap[r.colonia_id] || "Sin colonia").replace(/"/g, '""')}"`,
      `"${(r.severidad_o_nivel || "").replace(/"/g, '""')}"`,
      r.estado,
      r.latitud,
      r.longitud,
      r.created_at || "",
    ]);

    const contenido = [encabezados.join(","), ...filas.map((f) => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reportes_calles_seguras_juarez.csv";
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("CSV exportado sin datos personales (RN-04)");
  });
}

function inicializarModal() {
  const modal = document.getElementById("modal-reporte");
  const btnAbrir = document.getElementById("btn-abrir-modal");
  const btnCerrar = document.getElementById("btn-cerrar-modal");
  const btnCancelar = document.getElementById("btn-cancelar-modal");
  const form = document.getElementById("form-nuevo-reporte");
  const tipoSelect = document.getElementById("rep-tipo");
  const severidadInput = document.getElementById("rep-severidad");
  const labelSeveridad = document.getElementById("label-severidad");
  const btnGps = document.getElementById("btn-usar-gps");
  const gpsEstado = document.getElementById("gps-estado");

  if (tipoSelect && severidadInput && labelSeveridad) {
    tipoSelect.addEventListener("change", () => {
      const val = tipoSelect.value;
      if (val === "alcantarilla_sin_tapa") {
        labelSeveridad.textContent = "Severidad (asignada automáticamente) *";
        severidadInput.value = "Alta";
        severidadInput.readOnly = true;
      } else if (val === "encharcamiento") {
        labelSeveridad.textContent = "Nivel de agua *";
        severidadInput.readOnly = false;
        severidadInput.value = "cubre un carril";
        severidadInput.placeholder = "a un lado de la calle, cubre un carril, a media llanta, intransitable";
      } else {
        labelSeveridad.textContent = "Severidad *";
        severidadInput.readOnly = false;
        severidadInput.value = "Media";
        severidadInput.placeholder = "Baja, Media o Alta";
      }
    });
  }

  if (btnGps) {
    btnGps.addEventListener("click", () => {
      if (!navigator.geolocation) {
        if (gpsEstado) gpsEstado.textContent = "Tu navegador no soporta geolocalización.";
        return;
      }
      if (gpsEstado) gpsEstado.textContent = "Obteniendo coordenadas...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          document.getElementById("rep-lat").value = pos.coords.latitude.toFixed(6);
          document.getElementById("rep-lon").value = pos.coords.longitude.toFixed(6);
          if (gpsEstado) gpsEstado.textContent = "Ubicación GPS cargada correctamente.";
        },
        () => {
          if (gpsEstado) gpsEstado.textContent = "No se pudo obtener GPS; usa coordenadas de Juárez.";
        }
      );
    });
  }

  if (btnAbrir && modal) {
    btnAbrir.addEventListener("click", () => modal.classList.remove("hidden"));
  }

  const cerrar = () => {
    if (modal) modal.classList.add("hidden");
  };

  if (btnCerrar) btnCerrar.addEventListener("click", cerrar);
  if (btnCancelar) btnCancelar.addEventListener("click", cerrar);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const lat = Number(document.getElementById("rep-lat").value);
      const lon = Number(document.getElementById("rep-lon").value);

      if (lat < 31.3 || lat > 31.9 || lon < -106.9 || lon > -106.1) {
        alert("Las coordenadas deben ubicarse dentro del municipio de Ciudad Juárez, Chihuahua (RN-01).");
        return;
      }

      const coloniaVal = document.getElementById("rep-colonia")?.value;
      const payload = {
        tipo: document.getElementById("rep-tipo").value,
        calle: document.getElementById("rep-calle").value.trim(),
        colonia_id: coloniaVal ? Number(coloniaVal) : null,
        severidad_o_nivel: document.getElementById("rep-severidad").value,
        latitud: lat,
        longitud: lon,
        descripcion: document.getElementById("rep-descripcion").value.trim() || null,
      };

      try {
        const res = await fetch(`${API_BASE}/reportes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "No se pudo guardar el reporte");
        }

        form.reset();
        severidadInput.readOnly = false;
        cerrar();
        mostrarToast("Reporte registrado correctamente");
        await cargarReportes();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }
}