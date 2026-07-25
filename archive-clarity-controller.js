// archive-clarity-controller.js — revelação progressiva dos filtros do Acervo.
(() => {
  "use strict";

  const DESKTOP_MIN = 821;

  function initArchiveClarity() {
    const controls = document.querySelector(".archive-controls");
    const filterBar = controls?.querySelector("[data-archive-filter-bar]");
    const statusBar = controls?.querySelector("[data-archive-status-bar]");
    if (!controls || !filterBar || !statusBar || controls.dataset.archiveClarity === "true") return;

    const filterMarker = document.createComment("archive-filter-original-position");
    const statusMarker = document.createComment("archive-status-original-position");
    filterBar.before(filterMarker);
    statusBar.before(statusMarker);

    const details = document.createElement("details");
    details.className = "archive-filter-disclosure";
    details.hidden = true;

    const summary = document.createElement("summary");
    summary.className = "archive-filter-summary";
    summary.innerHTML = [
      '<span class="material-symbols-outlined" aria-hidden="true">filter_list</span>',
      '<span class="archive-filter-summary-label">Filtrar</span>',
      '<span class="archive-filter-summary-count" aria-label="Filtros ativos"></span>',
      '<span class="material-symbols-outlined archive-filter-chevron" aria-hidden="true">expand_more</span>',
    ].join("");

    const panel = document.createElement("div");
    panel.className = "archive-filter-panel";

    const typeGroup = document.createElement("section");
    typeGroup.className = "archive-filter-group";
    typeGroup.setAttribute("aria-label", "Filtrar por formato");
    const typeLabel = document.createElement("span");
    typeLabel.className = "archive-filter-group-label";
    typeLabel.textContent = "Formato";

    const statusGroup = document.createElement("section");
    statusGroup.className = "archive-filter-group";
    statusGroup.setAttribute("aria-label", "Filtrar por situação");
    const statusLabel = document.createElement("span");
    statusLabel.className = "archive-filter-group-label";
    statusLabel.textContent = "Situação";

    typeGroup.append(typeLabel);
    statusGroup.append(statusLabel);
    panel.append(typeGroup, statusGroup);
    details.append(summary, panel);
    controls.appendChild(details);

    const countElement = summary.querySelector(".archive-filter-summary-count");
    let mounted = false;

    function countActiveFilters() {
      const activeType = filterBar.querySelector('.archive-filter.is-active[data-archive-filter]:not([data-archive-filter="all"])');
      const activeStatus = statusBar.querySelector('.archive-filter.is-active[data-archive-status-filter]:not([data-archive-status-filter="all"])');
      const count = Number(Boolean(activeType)) + Number(Boolean(activeStatus));
      countElement.textContent = count ? String(count) : "";
      summary.setAttribute("aria-label", count ? `Filtrar o acervo, ${count} filtro${count > 1 ? "s" : ""} ativo${count > 1 ? "s" : ""}` : "Filtrar o acervo");
    }

    function mountDesktop() {
      if (mounted) return;
      mounted = true;
      details.hidden = false;
      typeGroup.appendChild(filterBar);
      statusGroup.appendChild(statusBar);
      countActiveFilters();
    }

    function restoreOriginal() {
      if (!mounted) return;
      details.open = false;
      filterMarker.after(filterBar);
      statusMarker.after(statusBar);
      details.hidden = true;
      mounted = false;
    }

    function syncViewport() {
      if (window.innerWidth >= DESKTOP_MIN) mountDesktop();
      else restoreOriginal();
    }

    const observer = new MutationObserver(countActiveFilters);
    observer.observe(filterBar, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    observer.observe(statusBar, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    controls.addEventListener("click", (event) => {
      if (!event.target.closest("[data-archive-filter], [data-archive-status-filter]")) return;
      queueMicrotask(countActiveFilters);
    });

    window.addEventListener("resize", syncViewport, { passive: true });
    controls.dataset.archiveClarity = "true";
    syncViewport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArchiveClarity, { once: true });
  } else {
    initArchiveClarity();
  }
})();
