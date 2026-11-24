const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://calles-seguras-juarez-api-8e6q.onrender.com";

let coloniasMap = {};

document.addEventListener("DOMContentLoaded", async () => {
  inicializarModal();
  inicializarFiltros();
  await verificarConexion();
  await cargarColonias();
  await cargarReportes();
});

function buscarInsigniaApi() {
  const porId =
    document.getElementById("apiStatus") ||
    document.getElementById("estadoApi") ||
    document.getElementById("api-status");
  if (porId) return porId;

  return Array.from(document.querySelectorAll("span, div, button, p")).find(
    (el) =>
      el.children.length === 0 &&
      (el.textContent.includes("Conectando API") ||
        el.textContent.includes("API Conectada") ||
        el.textContent.includes("API Desconectada"))
  );
}

async function verificarConexion() {
  const statusEl = buscarInsigniaApi();

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("API no disponible");
    if (statusEl) {
      statusEl.textContent = "API Conectada";
      statusEl.style.backgroundColor = "#dcfce7";
      statusEl.style.color = "#166534";
      statusEl.style.borderColor = "#86efac";
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "API Desconectada";
      statusEl.style.backgroundColor = "#fee2e2";
      statusEl.style.color = "#991b1b";
      statusEl.style.borderColor = "#fca5a5";
    }
  }
}

async function cargarColonias() {
  try {
    const res = await fetch(`${API_BASE}/colonias/`);
    if (!res.ok) return;
    const colonias = await res.json();

    coloniasMap = {};
    const filtroColonia = document.getElementById("filtroColonia");
    const modalColonia = document.getElementById("colonia_id");

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

    const statColonias = document.getElementById("statColonias");
    if (statColonias) statColonias.textContent = colonias.length;
  } catch (err) {
    console.error("Error al cargar colonias:", err);
  }
}

async function cargarReportes() {
  const listaEl = document.getElementById("listaReportes");
  const countLabel = document.getElementById("resultadosCount");

  const buscar = document.getElementById("filtroBuscar")?.value.trim() || "";
  const coloniaId = document.getElementById("filtroColonia")?.value || "";
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const estado = document.getElementById("filtroEstado")?.value || "";

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
    await verificarConexion();
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
  const pavimento = total - encharcamientos;

  const statTotal = document.getElementById("statTotal");
  const statPavimento = document.getElementById("statPavimento");
  const statEncharcamientos = document.getElementById("statEncharcamientos");

  if (statTotal) statTotal.textContent = total;
  if (statPavimento) statPavimento.textContent = pavimento;
  if (statEncharcamientos) statEncharcamientos.textContent = encharcamientos;
}

function formatearEtiqueta(valor) {
  if (!valor) return "";
  return valor
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function renderizarReportes(reportes) {
  let listaEl = document.getElementById("listaReportes");

  if (!listaEl) {
    const cargandoEl = Array.from(document.querySelectorAll("*")).find(
      (el) => el.children.length === 0 && el.textContent.trim() === "Cargando registros..."
    );
    if (cargandoEl && cargandoEl.parentElement) {
      listaEl = cargandoEl.parentElement;
    }
  }

  if (!listaEl) {
    console.warn("No se encontró contenedor para renderizar reportes");
    return;
  }

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
               Confirmar reporte
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
      btnEl.textContent = ` Confirmado (${data.total_confirmaciones})`;
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
    if (btnEl) btnEl.disabled = false;
  }
}

function inicializarFiltros() {
  const btnAplicar = document.getElementById("btnAplicarFiltros");
  const btnLimpiar = document.getElementById("btnLimpiarFiltros");

  if (btnAplicar) {
    btnAplicar.addEventListener("click", cargarReportes);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      const buscar = document.getElementById("filtroBuscar");
      const colonia = document.getElementById("filtroColonia");
      const tipo = document.getElementById("filtroTipo");
      const estado = document.getElementById("filtroEstado");

      if (buscar) buscar.value = "";
      if (colonia) colonia.value = "";
      if (tipo) tipo.value = "";
      if (estado) estado.value = "";
      cargarReportes();
    });
  }
}

function inicializarModal() {
  const modal = document.getElementById("modalReporte");
  const btnAbrir = document.getElementById("btnAbrirModal");
  const btnCerrar = document.getElementById("btnCerrarModal");
  const btnCancelar = document.getElementById("btnCancelarModal");
  const form = document.getElementById("formNuevoReporte");

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
      const coloniaVal = document.getElementById("colonia_id")?.value;
      const payload = {
        tipo: document.getElementById("tipo").value,
        calle: document.getElementById("calle").value.trim(),
        colonia_id: coloniaVal ? Number(coloniaVal) : null,
        severidad_o_nivel: document.getElementById("severidad_o_nivel").value,
        latitud: Number(document.getElementById("latitud").value),
        longitud: Number(document.getElementById("longitud").value),
        descripcion: document.getElementById("descripcion").value.trim() || null,
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
        cerrar();
        await cargarReportes();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }
}