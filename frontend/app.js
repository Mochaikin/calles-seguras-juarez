const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://TU-URL-DE-API-PUBLICA.com";

let coloniasMap = {};

const statusPill = document.getElementById("api-status");
const reportesGrid = document.getElementById("reportes-grid");
const resultadosTexto = document.getElementById("resultados-texto");

const filtroBuscar = document.getElementById("filtro-buscar");
const filtroColonia = document.getElementById("filtro-colonia");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroEstado = document.getElementById("filtro-estado");

const modalReporte = document.getElementById("modal-reporte");
const formNuevoReporte = document.getElementById("form-nuevo-reporte");
const toast = document.getElementById("toast");

function mostrarToast(mensaje) {
  toast.textContent = mensaje;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

async function verificarSaludAPI() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("API no disponible");
    statusPill.textContent = "API Conectada";
    statusPill.className = "status-pill status-online";
  } catch (err) {
    statusPill.textContent = "API Desconectada";
    statusPill.className = "status-pill status-offline";
  }
}

async function cargarColonias() {
  try {
    const res = await fetch(`${API_BASE}/colonias/`);
    const colonias = await res.json();

    document.getElementById("stat-colonias").textContent = colonias.length;
    const selectForm = document.getElementById("rep-colonia");

    colonias.forEach((col) => {
      coloniasMap[col.id] = `${col.nombre} (${col.sector})`;

      const optFiltro = document.createElement("option");
      optFiltro.value = col.id;
      optFiltro.textContent = `${col.nombre} — ${col.sector}`;
      filtroColonia.appendChild(optFiltro);

      const optForm = document.createElement("option");
      optForm.value = col.id;
      optForm.textContent = `${col.nombre} — ${col.sector}`;
      selectForm.appendChild(optForm);
    });
  } catch (err) {
    console.error("Error cargando colonias:", err);
  }
}

function formatearTipo(tipo) {
  const nombres = {
    bache: "Bache",
    hundimiento: "Hundimiento",
    grieta: "Grieta",
    alcantarilla_sin_tapa: "Alcantarilla sin tapa",
    encharcamiento: "Encharcamiento",
  };
  return nombres[tipo] || tipo;
}

async function cargarReportes() {
  const params = new URLSearchParams({ limite: "50" });

  if (filtroBuscar.value.trim()) params.append("buscar", filtroBuscar.value.trim());
  if (filtroColonia.value) params.append("colonia_id", filtroColonia.value);
  if (filtroTipo.value) params.append("tipo", filtroTipo.value);
  if (filtroEstado.value) params.append("estado", filtroEstado.value);

  try {
    const res = await fetch(`${API_BASE}/reportes/?${params.toString()}`);
    const reportes = await res.json();

    actualizarEstadisticas(reportes);
    renderizarReportes(reportes);
  } catch (err) {
    resultadosTexto.textContent = "No se pudo conectar con el servidor FastAPI.";
    reportesGrid.innerHTML = "";
  }
}

function actualizarEstadisticas(reportes) {
  const total = reportes.length;
  const encharcamientos = reportes.filter((r) => r.tipo === "encharcamiento").length;
  const baches = total - encharcamientos;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-baches").textContent = baches;
  document.getElementById("stat-encharcamientos").textContent = encharcamientos;
  resultadosTexto.textContent = `Mostrando ${total} reporte(s)`;
}

function renderizarReportes(reportes) {
  if (reportes.length === 0) {
    reportesGrid.innerHTML = `<p class="muted-text">No se encontraron reportes con los filtros seleccionados.</p>`;
    return;
  }

  reportesGrid.innerHTML = reportes
    .map((rep) => {
      const esEncharcamiento = rep.tipo === "encharcamiento";
      const coloniaNombre = coloniasMap[rep.colonia_id] || "Ciudad Juárez";
      const fecha = new Date(rep.created_at).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `
        <article class="report-card">
          <div>
            <div class="report-top">
              <span class="folio-tag">${rep.folio}</span>
              <span class="badge ${esEncharcamiento ? "badge-encharcamiento" : "badge-danio"}">
                ${formatearTipo(rep.tipo)}
              </span>
            </div>
            <h3 class="report-title" style="margin-top: 0.65rem;">${rep.calle}</h3>
            <p class="report-meta">${coloniaNombre} · Severidad/Nivel: <strong>${rep.severidad_o_nivel}</strong></p>
            <p class="report-desc" style="margin-top: 0.55rem;">${rep.descripcion}</p>
          </div>
          <div class="report-footer">
            <div>
              <span class="badge badge-estado">${rep.estado.replace("_", " ")}</span>
              <span class="report-meta" style="margin-left: 0.4rem;">${fecha}</span>
            </div>
            <button class="btn btn-outline" onclick="confirmarIncidencia(${rep.id}, '${rep.folio}')">
              Confirmar
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function confirmarIncidencia(id, folio) {
  try {
    const res = await fetch(`${API_BASE}/reportes/${id}/confirmar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentario: "Confirmado desde la interfaz web ciudadana" }),
    });
    if (!res.ok) throw new Error("Error al confirmar");
    const data = await res.json();
    mostrarToast(`Folio ${folio} confirmado (Total: ${data.total_confirmaciones})`);
  } catch (err) {
    mostrarToast("No se pudo registrar la confirmación.");
  }
}

// Eventos de filtros y modal
document.getElementById("btn-filtrar").addEventListener("click", cargarReportes);
document.getElementById("btn-limpiar").addEventListener("click", () => {
  filtroBuscar.value = "";
  filtroColonia.value = "";
  filtroTipo.value = "";
  filtroEstado.value = "";
  cargarReportes();
});

document.getElementById("btn-abrir-modal").addEventListener("click", () => {
  modalReporte.classList.remove("hidden");
});

function cerrarModal() {
  modalReporte.classList.add("hidden");
  formNuevoReporte.reset();
}

document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar-modal").addEventListener("click", cerrarModal);

formNuevoReporte.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    tipo: document.getElementById("rep-tipo").value,
    colonia_id: Number(document.getElementById("rep-colonia").value),
    calle: document.getElementById("rep-calle").value.trim(),
    severidad_o_nivel: document.getElementById("rep-severidad").value.trim(),
    latitud: parseFloat(document.getElementById("rep-lat").value),
    longitud: parseFloat(document.getElementById("rep-lon").value),
    descripcion: document.getElementById("rep-descripcion").value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/reportes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error creando reporte");
    const creado = await res.json();

    cerrarModal();
    mostrarToast(`Reporte ${creado.folio} registrado con éxito`);
    cargarReportes();
  } catch (err) {
    mostrarToast("Revisa los campos e intenta guardar de nuevo.");
  }
});

// Inicialización
(async function init() {
  await verificarSaludAPI();
  await cargarColonias();
  await cargarReportes();
})();