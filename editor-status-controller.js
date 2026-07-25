// editor-status-controller.js — composição progressiva da faixa do editor.
// Move controles existentes; não cria estado paralelo para meta, timer ou salvamento.
(() => {
  "use strict";

  function classifySaveStatus(text) {
    const normalized = String(text || "").trim().toLocaleLowerCase("pt-BR");
    if (/não salvo|recuperação necessária|gravação bloqueada|erro|falh/.test(normalized)) {
      return { state: "error", compact: "Não salvo" };
    }
    if (/versões preservadas|conflito/.test(normalized)) {
      return { state: "conflict", compact: "Conflito" };
    }
    if (/salvando/.test(normalized)) {
      return { state: "saving", compact: "Salvando" };
    }
    if (/salvo/.test(normalized)) {
      return { state: "saved", compact: "Salvo" };
    }
    return { state: "ready", compact: "Pronto" };
  }

  function parseCount(text) {
    const normalized = String(text || "");
    const words = normalized.match(/([\d.]+)\s+palavra/i)?.[1] || "0";
    const paragraphs = normalized.match(/([\d.]+)\s+parágrafo/i)?.[1] || "0";
    const characters = normalized.match(/([\d.]+)\s+car\./i)?.[1] || "0";
    return { words, paragraphs, characters };
  }

  function makeElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    element.className = className;
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    return element;
  }

  function createSessionSection(name) {
    const section = makeElement("div", "statusbar-session-section");
    const label = makeElement("span", "statusbar-session-name");
    label.textContent = name;
    const control = makeElement("div", "statusbar-session-control");
    section.append(label, control);
    return { section, control };
  }

  function initEditorStatus() {
    const statusbar = document.querySelector(".statusbar");
    if (!statusbar || statusbar.dataset.statusArgila === "true") return;

    const count = statusbar.querySelector('[data-stat="count"]');
    const save = statusbar.querySelector("[data-save-status]");
    const pageCount = statusbar.querySelector("[data-page-count]");
    const goal = statusbar.querySelector("[data-goal-bar]");
    const goalButton = statusbar.querySelector("[data-goal-set-btn]");
    const timer = statusbar.querySelector("[data-pomodoro]");

    if (!count || !save || !goal || !goalButton || !timer) return;

    statusbar.dataset.statusArgila = "true";
    statusbar.setAttribute("aria-label", "Situação do texto");

    count.classList.add("statusbar-count");
    save.classList.add("statusbar-save");
    save.setAttribute("role", "status");
    save.setAttribute("aria-live", "polite");

    const writing = makeElement("div", "statusbar-writing", {
      "aria-label": "Contagem e salvamento",
    });
    writing.append(count, save);
    if (pageCount) writing.append(pageCount);

    const session = makeElement("details", "statusbar-session");
    const summary = makeElement("summary", "statusbar-session-toggle", {
      "aria-label": "Abrir meta e temporizador da sessão",
    });
    summary.innerHTML = [
      '<span class="material-symbols-outlined" aria-hidden="true">timer</span>',
      '<span class="statusbar-session-label">Sessão</span>',
    ].join("");

    const panel = makeElement("div", "statusbar-session-panel", {
      "aria-label": "Meta e temporizador",
    });
    const goalSection = createSessionSection("Meta");
    goalSection.control.append(goal, goalButton);
    const timerSection = createSessionSection("Temporizador");
    timerSection.control.append(timer);
    panel.append(goalSection.section, timerSection.section);
    session.append(summary, panel);

    const community = makeElement("div", "statusbar-community", {
      "aria-label": "Informações do Escrevaral",
    });
    const institutionalSelectors = [
      "[data-visitors-count]",
      ".statusbar-social",
      "[data-offline-note]",
      "[data-visitors]",
      "#levar-mesa-anchor",
      ".statusbar-copyright",
    ];
    institutionalSelectors.forEach((selector) => {
      statusbar.querySelectorAll(selector).forEach((node) => community.append(node));
    });

    statusbar.replaceChildren(writing, session, community);

    function syncCount() {
      const full = count.textContent.trim();
      const parsed = parseCount(full);
      count.dataset.wordCount = parsed.words;
      count.dataset.paragraphCount = parsed.paragraphs;
      count.dataset.characterCount = parsed.characters;
      count.setAttribute("aria-label", full || "0 palavras");
      count.title = full || "0 palavras";
    }

    function syncSave() {
      const full = save.textContent.trim();
      const meta = classifySaveStatus(full);
      save.dataset.saveState = meta.state;
      save.dataset.compactLabel = meta.compact;
      save.setAttribute("aria-label", full || meta.compact);
    }

    const countObserver = new MutationObserver(syncCount);
    countObserver.observe(count, { childList: true, characterData: true, subtree: true });
    const saveObserver = new MutationObserver(syncSave);
    saveObserver.observe(save, { childList: true, characterData: true, subtree: true });
    syncCount();
    syncSave();

    session.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", String(session.open));
    });
    summary.setAttribute("aria-expanded", "false");

    document.addEventListener("pointerdown", (event) => {
      if (session.open && !session.contains(event.target)) session.open = false;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !session.open) return;
      event.preventDefault();
      session.open = false;
      summary.focus();
    });

    const shell = document.querySelector(".app-shell");
    if (shell) {
      new MutationObserver(() => {
        if (shell.dataset.view !== "editor") session.open = false;
      }).observe(shell, { attributes: true, attributeFilter: ["data-view"] });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditorStatus, { once: true });
  } else {
    initEditorStatus();
  }
})();
