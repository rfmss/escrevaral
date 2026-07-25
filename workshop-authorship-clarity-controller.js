// workshop-authorship-clarity-controller.js
// Reorganiza a apresentação no desktop preservando nós, listeners e contratos existentes.
(() => {
  "use strict";

  const DESKTOP_MIN = 821;
  const scriptVersion = (() => {
    try {
      return new URL(document.currentScript?.src || location.href).searchParams.get("v") || "20260725-clarity-final-v1";
    } catch {
      return "20260725-clarity-final-v1";
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

  function makeStep(index, title, description, startsOpen = false) {
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
    const tablist = document.querySelector('[data-view-panel="academia"] .academy-tools-tabs');
    const tabs = [...document.querySelectorAll('[data-view-panel="academia"] .academy-tool-tab')];
    if (!tablist || !tabs.length) return;

    function inputFor(tab) {
      return document.getElementById(tab.getAttribute("for") || "");
    }

    function activeIndex() {
      const index = tabs.findIndex((tab) => inputFor(tab)?.checked);
      return index >= 0 ? index : 0;
    }

    function syncSelection() {
      const selectedIndex = activeIndex();
      tabs.forEach((tab, index) => {
        const selected = index === selectedIndex;
        tab.setAttribute("aria-selected", String(selected));
        tab.toggleAttribute("data-active", selected);
        if (window.innerWidth >= DESKTOP_MIN) tab.tabIndex = selected ? 0 : -1;
      });
    }

    function activate(index, { focus = true } = {}) {
      const normalized = (index + tabs.length) % tabs.length;
      const tab = tabs[normalized];
      tab.click();
      syncSelection();
      if (focus) tab.focus({ preventScroll: true });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (event) => {
        if (window.innerWidth < DESKTOP_MIN) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(index, { focus: false });
          return;
        }
        const destinations = {
          ArrowDown: index + 1,
          ArrowRight: index + 1,
          ArrowUp: index - 1,
          ArrowLeft: index - 1,
          Home: 0,
          End: tabs.length - 1,
        };
        if (!(event.key in destinations)) return;
        event.preventDefault();
        activate(destinations[event.key]);
      });
      inputFor(tab)?.addEventListener("change", syncSelection);
    });

    function syncViewport() {
      if (window.innerWidth >= DESKTOP_MIN) {
        tablist.setAttribute("role", "tablist");
        tablist.setAttribute("aria-label", "Ferramentas do Ateliê");
        tabs.forEach((tab) => tab.setAttribute("role", "tab"));
        syncSelection();
        return;
      }
      tablist.removeAttribute("role");
      tablist.removeAttribute("aria-label");
      tabs.forEach((tab) => {
        tab.removeAttribute("role");
        tab.removeAttribute("aria-selected");
        tab.removeAttribute("data-active");
        tab.removeAttribute("tabindex");
      });
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