const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://calles-seguras-juarez-api-8e6q.onrender.com";

function renderizarReportes(reportes) {
  const listaEl = document.getElementById("listaReportes");

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

    await cargarReportes();
  } catch (err) {
    alert(`Error: ${err.message}`);
    await cargarReportes();
  }
}