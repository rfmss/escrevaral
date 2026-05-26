(function () {
  "use strict";

  const TIP_ID = "vrda-tooltip";
  let tip = null;
  let current = null;

  function ensureTip() {
    if (tip) return;
    tip = document.getElementById(TIP_ID);
    if (!tip) {
      tip = document.createElement("div");
      tip.id = TIP_ID;
      tip.setAttribute("role", "tooltip");
      tip.setAttribute("aria-hidden", "true");
      document.body.appendChild(tip);
    }
  }

  // Move title → data-vrda-tooltip e preserva aria-label
  function migrateTitle(el) {
    const t = el.getAttribute("title");
    if (!t) return;
    el.removeAttribute("title");
    el.dataset.vrdaTooltip = t;
    if (!el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) {
      el.setAttribute("aria-label", t);
    }
  }

  function show(el) {
    const text = el.dataset.vrdaTooltip;
    if (!text || !tip) return;
    current = el;
    tip.textContent = text;
    // Posiciona antes de exibir para medir offsetWidth correto
    position(el);
    tip.removeAttribute("aria-hidden");
    tip.classList.add("is-visible");
  }

  function hide() {
    if (!tip) return;
    tip.classList.remove("is-visible");
    tip.setAttribute("aria-hidden", "true");
    current = null;
  }

  function position(el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = tip.offsetWidth || 160;
    const th = tip.offsetHeight || 28;
    const gap = 7;
    // Prefere abaixo; sobe se não couber
    let top = r.bottom + gap;
    if (top + th > vh - 8) top = r.top - th - gap;
    top = Math.max(8, Math.min(top, vh - th - 8));
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, vw - tw - 8));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
  }

  function onOver(e) {
    const el = e.target.closest("[data-vrda-tooltip],[title]");
    if (!el) return;
    if (el.hasAttribute("title")) migrateTitle(el);
    if (!el.dataset.vrdaTooltip) return;
    if (el !== current) show(el);
  }

  function onOut(e) {
    if (!current) return;
    // Não esconde ao mover para filho do elemento
    if (!current.contains(e.relatedTarget)) hide();
  }

  function onFocusIn(e) {
    const el = e.target.closest("[data-vrda-tooltip],[title]");
    if (!el) return;
    if (el.hasAttribute("title")) migrateTitle(el);
    if (el.dataset.vrdaTooltip) show(el);
  }

  function onFocusOut(e) {
    if (current && !current.contains(e.relatedTarget)) hide();
  }

  function onKey(e) { if (e.key === "Escape") hide(); }

  function scanAndMigrate(root) {
    root.querySelectorAll("[title]").forEach(migrateTitle);
  }

  function init() {
    ensureTip();
    scanAndMigrate(document.body);

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", hide, { capture: true, passive: true });
    window.addEventListener("resize", hide, { passive: true });

    // Intercepta títulos adicionados dinamicamente (archive, cronograma, academia…)
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.hasAttribute && n.hasAttribute("title")) migrateTitle(n);
          if (n.querySelectorAll) scanAndMigrate(n);
        });
        if (m.type === "attributes" && m.target.nodeType === 1 && m.target.hasAttribute("title")) {
          migrateTitle(m.target);
        }
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["title"],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
