// workshop-authorship-clarity-controller.js
// Reorganiza a apresentação no desktop preservando nós, listeners e contratos existentes.
(() => {
  "use strict";

  const DESKTOP_MIN = 821;
  const scriptVersion = (() => {
    try {
      return new URL(document.currentScript?.src || location.href).searchParams.get("v") || "20260725-clarity-workshop-v1";
    } catch {
      return "20260725-clarity-workshop-v1";
    }
  })();

  function ensureRefinementStyles() {
    if (document.querySelector('link[data-workshop-clarity-refine="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `./css/22-product-clarity-workshop-refine.css?v=${encodeURIComponent(scriptVersion)}`;
    link.dataset.workshopClarityRefine = "true";
    document.head.appendChild(link);
  }

  function makeStep(index, title, description, nodes, startsOpen = false) {
    const details = document.createElement("details");
    details.className = "proof-clarity-step";
    details.open = startsOpen;

    const summary = document.createElement("summary");
    summary.className = "proof-clarity-summary";

    const number = document.createElement("span");
    number.className = "proof-clarity-number";
    number.textContent = String(index).padStart(2, "0");

    const copy = document.createElement("span");
    const heading = document.createElement("span");
    heading.className = "proof-clarity-title";
    heading.textContent = title;
    const support = document.createElement("span");
    support.className = "proof-clarity-description";
    support.textContent = description;
    copy.append(heading, support);

    const chevron = document.createElement("span");
    chevron.className = "material-symbols-outlined proof-clarity-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "expand_more";

    const body = document.createElement("div");
    body.className = "proof-clarity-body";

    summary.append(number, copy, chevron);
    details.append(summary, body);
    return details;
  }

  function initAuthorshipJourney() {
    const paper = document.querySelector('[data-view-panel="autoria"] .certificate-paper');
    if (!paper || paper.dataset.clarityJourney === "true") return;

    const definitions = [
      ["Registrar o processo", "Ritmo, sessão e assinatura do texto ativo.", [
        ".certificate-grid", ".proof-session-bar", ".proof-sessions-history", ".proof-author-section"
      ], true],
      ["Guardar ou enviar", "Baixe a prova ou prepare o envio para uma editora.", [
        ".proof-actions"
      ], false],
      ["Carimbar no tempo", "Registro público opcional com OpenTimestamps.", [
        ".proof-blockchain-section"
      ], false],
      ["Verificar autoria", "Confira um arquivo recebido sem precisar de conta.", [
        ".proof-validate-section"
      ], false],
      ["Entender e preservar", "Privacidade, histórico do processo e versões do manuscrito.", [
        ".proof-scope-note", ".timeline", ".version-panel", ".version-list"
      ], false],
    ];

    const groups = definitions.map(([title, description, selectors, startsOpen]) => ({
      title,
      description,
      selectors,
      startsOpen,
      nodes: selectors.map((selector) => paper.querySelector(selector)).filter(Boolean),
    }));
    if (groups.some((group) => group.nodes.length !== group.selectors.length)) return;

    const markers = new Map();
    groups.flatMap((group) => group.nodes).forEach((node, index) => {
      const marker = document.createComment(`proof-clarity-marker-${index}`);
      node.before(marker);
      markers.set(node, marker);
    });

    const journey = document.createElement("section");
    journey.className = "proof-clarity-journey";
    journey.setAttribute("aria-label", "Etapas da prova de autoria");
    journey.hidden = true;

    const steps = groups.map((group, index) => makeStep(
      index + 1,
      group.title,
      group.description,
      group.nodes,
      group.startsOpen,
    ));
    steps.forEach((step) => journey.appendChild(step));
    markers.get(groups[0].nodes[0]).before(journey);

    let mounted = false;

    function mountDesktop() {
      if (mounted) return;
      mounted = true;
      journey.hidden = false;
      groups.forEach((group, index) => {
        const body = steps[index].querySelector(".proof-clarity-body");
        group.nodes.forEach((node) => body.appendChild(node));
      });
      if (!steps.some((step) => step.open)) steps[0].open = true;
    }

    function restoreOriginal() {
      if (!mounted) return;
      groups.forEach((group) => group.nodes.forEach((node) => markers.get(node).after(node)));
      journey.hidden = true;
      mounted = false;
    }

    steps.forEach((step) => {
      step.addEventListener("toggle", () => {
        if (!mounted || !step.open) return;
        steps.forEach((other) => {
          if (other !== step) other.open = false;
        });
      });
    });

    function syncViewport() {
      if (window.innerWidth >= DESKTOP_MIN) mountDesktop();
      else restoreOriginal();
    }

    window.addEventListener("resize", syncViewport, { passive: true });
    paper.dataset.clarityJourney = "true";
    syncViewport();
  }

  function initAtelierKeyboard() {
    const tabs = [...document.querySelectorAll('[data-view-panel="academia"] .academy-tool-tab')];
    if (!tabs.length) return;

    function syncSelection() {
      tabs.forEach((tab) => {
        const input = document.getElementById(tab.getAttribute("for") || "");
        if (input?.checked) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("keydown", (event) => {
        if (window.innerWidth < DESKTOP_MIN || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        tab.click();
      });
      const input = document.getElementById(tab.getAttribute("for") || "");
      input?.addEventListener("change", syncSelection);
    });

    function syncViewport() {
      tabs.forEach((tab) => {
        if (window.innerWidth >= DESKTOP_MIN) tab.setAttribute("tabindex", "0");
        else tab.removeAttribute("tabindex");
      });
      syncSelection();
    }

    window.addEventListener("resize", syncViewport, { passive: true });
    syncViewport();
  }

  function init() {
    ensureRefinementStyles();
    initAuthorshipJourney();
    initAtelierKeyboard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
