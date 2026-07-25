// product-clarity-controller.js — clareza desktop sem alterar contratos do produto.
(() => {
  "use strict";

  const DESKTOP_MIN = 821;
  const root = document.documentElement;
  let lastModality = "keyboard";

  const scriptVersion = (() => {
    try {
      return new URL(document.currentScript?.src || location.href).searchParams.get("v") || "20260725-clarity-desktop-v1";
    } catch {
      return "20260725-clarity-desktop-v1";
    }
  })();

  function ensureStyles() {
    if (document.querySelector('link[data-product-clarity-controls="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `./css/20-product-clarity-desktop-controls.css?v=${encodeURIComponent(scriptVersion)}`;
    link.dataset.productClarityControls = "true";
    document.head.appendChild(link);
  }

  function setModality(next) {
    if (next === lastModality && root.dataset.inputModality === next) return;
    lastModality = next;
    root.dataset.inputModality = next;
  }

  // Campos de texto normalmente correspondem a :focus-visible mesmo após clique.
  // Registrar a modalidade permite manter o anel inequívoco para teclado e
  // deixar cursor/seleção protagonizarem o foco por ponteiro.
  document.addEventListener("pointerdown", () => setModality("pointer"), true);
  document.addEventListener("mousedown", () => setModality("pointer"), true);
  document.addEventListener("touchstart", () => setModality("pointer"), { capture: true, passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    setModality("keyboard");
  }, true);
  setModality("keyboard");
  ensureStyles();

  function initUtilityMenu() {
    const actions = document.querySelector(".topbar-actions");
    if (!actions || actions.dataset.clarityUtilities === "true") return;

    const candidates = [
      actions.querySelector(".topbar-share-btn"),
      actions.querySelector('[data-action="toggle-dark-mode"]'),
      actions.querySelector('[data-action="toggle-focus"]'),
      actions.querySelector('[data-action="toggle-fullscreen"]'),
    ].filter(Boolean);
    if (candidates.length !== 4) return;

    const placeholders = candidates.map((element) => {
      const marker = document.createComment(`clarity-utility-${element.dataset.action || "share"}`);
      element.before(marker);
      return { element, marker };
    });

    const details = document.createElement("details");
    details.className = "clarity-utility-menu";
    details.hidden = true;

    const summary = document.createElement("summary");
    summary.className = "clarity-utility-trigger icon-button";
    summary.setAttribute("aria-label", "Abrir opções do ambiente");
    summary.setAttribute("aria-controls", "clarity-utility-panel");
    summary.setAttribute("aria-expanded", "false");
    summary.title = "Opções do ambiente";
    summary.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">tune</span>';
    details.appendChild(summary);
    actions.appendChild(details);

    const panel = document.createElement("div");
    panel.id = "clarity-utility-panel";
    panel.className = "clarity-utility-panel";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Opções do ambiente");
    panel.hidden = true;
    document.body.appendChild(panel);

    let mounted = false;

    function positionPanel() {
      if (!mounted || panel.hidden || !details.open) return;
      const anchor = summary.getBoundingClientRect();
      const width = Math.min(250, window.innerWidth - 32);
      const left = Math.min(window.innerWidth - width - 16, Math.max(16, anchor.right - width));
      panel.style.width = `${width}px`;
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(anchor.bottom + 10)}px`;
    }

    function closeMenu({ restoreFocus = false } = {}) {
      panel.hidden = true;
      summary.setAttribute("aria-expanded", "false");
      if (details.open) details.open = false;
      if (restoreFocus && !details.hidden) summary.focus({ preventScroll: true });
    }

    function mountDesktop() {
      if (mounted) return;
      mounted = true;
      details.hidden = false;
      placeholders.forEach(({ element }) => {
        element.classList.add("clarity-utility-item");
        panel.appendChild(element);
      });
    }

    function restoreOriginal() {
      if (!mounted) return;
      closeMenu();
      placeholders.forEach(({ element, marker }) => {
        element.classList.remove("clarity-utility-item");
        marker.after(element);
      });
      details.hidden = true;
      mounted = false;
    }

    function syncViewport() {
      if (window.innerWidth >= DESKTOP_MIN) mountDesktop();
      else restoreOriginal();
      positionPanel();
    }

    details.addEventListener("toggle", () => {
      if (!mounted || !details.open) {
        panel.hidden = true;
        summary.setAttribute("aria-expanded", "false");
        return;
      }
      panel.hidden = false;
      summary.setAttribute("aria-expanded", "true");
      positionPanel();
      if (lastModality === "keyboard") {
        panel.querySelector("button")?.focus({ preventScroll: true });
      }
      requestAnimationFrame(positionPanel);
    });

    panel.addEventListener("click", (event) => {
      if (!event.target.closest("button")) return;
      closeMenu({ restoreFocus: lastModality === "keyboard" });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!details.open) return;
      if (!details.contains(event.target) && !panel.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    });

    window.addEventListener("resize", syncViewport, { passive: true });
    window.addEventListener("scroll", positionPanel, { passive: true, capture: true });

    actions.dataset.clarityUtilities = "true";
    syncViewport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUtilityMenu, { once: true });
  } else {
    initUtilityMenu();
  }
})();