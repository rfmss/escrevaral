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
      return new URL(document.currentScript?.src || location.href).searchParams.get("v") || "20260725-clarity-desktop-v1";
    } catch {
      return "20260725-clarity-desktop-v1";
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

  function ensureProductClarityController() {
    if (document.querySelector('script[data-product-clarity-controller="true"]')) return;
    const script = document.createElement("script");
    script.src = `./product-clarity-controller.js?v=${encodeURIComponent(scriptVersion)}`;
    script.defer = true;
    script.dataset.productClarityController = "true";
    document.body.appendChild(script);
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
    summary.setAttribute("aria-controls", "oficina-navigation-menu");
    summary.innerHTML = [
      '<span>Oficina</span>',
      '<span class="material-symbols-outlined oficina-navigation-chevron" aria-hidden="true">expand_more</span>',
    ].join("");

    // O menu vive no body para não ser recortado por contêineres responsivos do editor.
    const menu = document.createElement("div");
    menu.id = "oficina-navigation-menu";
    menu.className = "oficina-navigation-menu";
    menu.setAttribute("aria-label", "Ferramentas da Oficina");
    menu.hidden = true;

    function positionMenu() {
      if (!details.open || menu.hidden || window.innerWidth < 820) return;
      const anchor = summary.getBoundingClientRect();
      const width = Math.min(330, Math.max(240, window.innerWidth - 32));
      const desiredLeft = anchor.left + anchor.width / 2 - width / 2;
      const left = Math.min(window.innerWidth - width - 16, Math.max(16, desiredLeft));
      menu.style.width = `${width}px`;
      menu.style.left = `${left}px`;
      menu.style.top = `${Math.round(anchor.bottom + 9)}px`;
    }

    function closeMenu({ restoreFocus = false } = {}) {
      // Oculta primeiro para não depender da ordem assíncrona do evento toggle.
      menu.hidden = true;
      summary.setAttribute("aria-expanded", "false");
      if (details.open) details.open = false;
      if (restoreFocus) summary.focus();
    }

    grouped.forEach((button) => {
      const view = button.dataset.viewTarget;
      makeItemCopy(button, view);
      button.addEventListener("click", () => closeMenu());
      menu.appendChild(button);
    });

    details.append(summary);
    tabs.replaceChildren(editor, archive, details);
    document.body.appendChild(menu);
    tabs.dataset.oficinaNavigation = "true";

    function syncActive() {
      const current = shell.dataset.view || "editor";
      const inGroup = GROUP_VIEWS.has(current);
      details.classList.toggle("is-active", inGroup);
      if (inGroup) summary.setAttribute("aria-current", "page");
      else summary.removeAttribute("aria-current");
      grouped.forEach((button) => {
        const active = button.dataset.viewTarget === current;
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
    }

    new MutationObserver(syncActive).observe(shell, {
      attributes: true,
      attributeFilter: ["data-view"],
    });
    syncActive();

    details.addEventListener("toggle", () => {
      if (details.open && window.innerWidth >= 820) {
        menu.hidden = false;
        summary.setAttribute("aria-expanded", "true");
        requestAnimationFrame(positionMenu);
        return;
      }
      menu.hidden = true;
      summary.setAttribute("aria-expanded", "false");
    });
    summary.setAttribute("aria-expanded", "false");

    window.addEventListener("resize", () => {
      if (window.innerWidth < 820) {
        closeMenu();
        return;
      }
      positionMenu();
    }, { passive: true });
    window.addEventListener("scroll", positionMenu, { passive: true, capture: true });

    document.addEventListener("pointerdown", (event) => {
      if (!details.open) return;
      if (!details.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    });
  }

  function init() {
    initOficinaNavigation();
    ensureProductClarityController();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
