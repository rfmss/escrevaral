// oficina-navigation-controller.js — reduz competição na topbar sem remover views.
(() => {
  "use strict";

  const GROUP_VIEWS = new Set(["academia", "biblioteca", "autoria", "cronograma"]);
  const ITEM_COPY = {
    academia: ["Visão geral", "Revisão, guias e publicação"],
    biblioteca: ["Palavras", "Léxico e contexto do manuscrito"],
    autoria: ["Autoria", "Prova do processo humano"],
    cronograma: ["Plano", "Metas, calendário e rotina"],
  };

  const scriptVersion = (() => {
    try {
      return new URL(document.currentScript?.src || location.href).searchParams.get("v") || "20260725-oficina-nav";
    } catch {
      return "20260725-oficina-nav";
    }
  })();

  function ensureStyles() {
    if (document.querySelector('link[data-oficina-navigation-style="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `./css/19-oficina-navigation.css?v=${encodeURIComponent(scriptVersion)}`;
    link.dataset.oficinaNavigationStyle = "true";
    document.head.appendChild(link);
  }

  function makeItemCopy(button, view) {
    const [title, description] = ITEM_COPY[view] || [button.textContent.trim(), ""];
    button.dataset.oficinaOriginalLabel = button.textContent.trim();
    button.innerHTML = "";
    const titleElement = document.createElement("span");
    titleElement.className = "oficina-navigation-item-title";
    titleElement.textContent = title;
    const descriptionElement = document.createElement("span");
    descriptionElement.className = "oficina-navigation-item-description";
    descriptionElement.textContent = description;
    button.append(titleElement, descriptionElement);
  }

  function initOficinaNavigation() {
    ensureStyles();
    const tabs = document.querySelector(".module-tabs");
    const shell = document.querySelector(".app-shell");
    if (!tabs || !shell || tabs.dataset.oficinaNavigation === "true") return;

    const editor = tabs.querySelector('[data-view-target="editor"]');
    const archive = tabs.querySelector('[data-view-target="arquivo"]');
    const grouped = [...GROUP_VIEWS]
      .map((view) => tabs.querySelector(`[data-view-target="${view}"]`))
      .filter(Boolean);
    if (!editor || !archive || grouped.length !== GROUP_VIEWS.size) return;

    const details = document.createElement("details");
    details.className = "oficina-navigation";
    const summary = document.createElement("summary");
    summary.setAttribute("aria-label", "Abrir ferramentas da Oficina");
    summary.innerHTML = [
      '<span>Oficina</span>',
      '<span class="material-symbols-outlined oficina-navigation-chevron" aria-hidden="true">expand_more</span>',
    ].join("");
    const menu = document.createElement("div");
    menu.className = "oficina-navigation-menu";
    menu.setAttribute("aria-label", "Ferramentas da Oficina");

    grouped.forEach((button) => {
      const view = button.dataset.viewTarget;
      makeItemCopy(button, view);
      button.addEventListener("click", () => {
        details.open = false;
      });
      menu.appendChild(button);
    });

    details.append(summary, menu);
    tabs.replaceChildren(editor, archive, details);
    tabs.dataset.oficinaNavigation = "true";

    function syncActive() {
      const current = shell.dataset.view || "editor";
      const inGroup = GROUP_VIEWS.has(current);
      details.classList.toggle("is-active", inGroup);
      summary.setAttribute("aria-current", inGroup ? "page" : "false");
      grouped.forEach((button) => {
        const active = button.dataset.viewTarget === current;
        button.setAttribute("aria-current", active ? "page" : "false");
      });
    }

    new MutationObserver(syncActive).observe(shell, {
      attributes: true,
      attributeFilter: ["data-view"],
    });
    syncActive();

    details.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", String(details.open));
    });
    summary.setAttribute("aria-expanded", "false");

    document.addEventListener("pointerdown", (event) => {
      if (details.open && !details.contains(event.target)) details.open = false;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      details.open = false;
      summary.focus();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOficinaNavigation, { once: true });
  } else {
    initOficinaNavigation();
  }
})();
