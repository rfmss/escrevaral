// ── CRONOGRAMA ────────────────────────────────────────
const PLANNER_KEY = "vrda-planner";

const CRONO_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const CRONO_MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const CRONO_WEEKDAYS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const CRONO_MOON_PHASES = [
  { key: "nova", label: "NOVA", icon: "●", offset: 0 },
  { key: "cresc", label: "CRESC", icon: "◐", offset: 0.25 },
  { key: "cheia", label: "CHEIA", icon: "○", offset: 0.5 },
  { key: "ming", label: "MING", icon: "◑", offset: 0.75 },
];

const FIXED_HOLIDAYS = { "01-01":"Confraternização Universal","21-04":"Tiradentes","01-05":"Dia do Trabalhador","07-09":"Independência do Brasil","12-10":"Nossa Senhora Aparecida","02-11":"Finados","15-11":"Proclamação da República","20-11":"Dia da Consciência Negra","25-12":"Natal" };

function getEaster(year) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  return new Date(year,Math.floor((h+l-7*m+114)/31)-1,((h+l-7*m+114)%31)+1);
}

function getHolidays(year) {
  const h = { ...FIXED_HOLIDAYS };
  const easter = getEaster(year);
  [[-47,"Carnaval"],[-2,"Sexta-feira Santa"],[60,"Corpus Christi"]].forEach(([d,name]) => {
    const dt = new Date(easter); dt.setDate(dt.getDate()+d);
    h[`${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`] = name;
  });
  return h;
}

function getMoonPhasesForMonth(year, month) {
  const synodicMonth = 29.530588853;
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const monthStart = Date.UTC(year, month, 1, 12);
  const monthEnd = Date.UTC(year, month + 1, 1, 12);
  const dayMs = 24 * 60 * 60 * 1000;
  const firstCycle = Math.floor((monthStart - referenceNewMoon) / (synodicMonth * dayMs)) - 1;
  const phases = [];

  for (let cycle = firstCycle; cycle < firstCycle + 4; cycle++) {
    CRONO_MOON_PHASES.forEach((phase) => {
      const phaseTime = referenceNewMoon + (cycle + phase.offset) * synodicMonth * dayMs;
      if (phaseTime < monthStart - dayMs || phaseTime >= monthEnd + dayMs) return;
      const date = new Date(phaseTime);
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      phases.push({ ...phase, day: date.getDate(), time: phaseTime });
    });
  }

  return phases.sort((a, b) => a.time - b.time);
}

function loadPlannerData() {
  try { return JSON.parse(localStorage.getItem(PLANNER_KEY) || "{}"); } catch { return {}; }
}

function savePlannerData(data) {
  localStorage.setItem(PLANNER_KEY, JSON.stringify(data));
}

const FOLDER_CRONO_COLOR = {
  "Ficção":      { bg: "color-mix(in srgb, var(--primary) 10%, transparent)",  text: "var(--primary)",                                  border: "color-mix(in srgb, var(--primary) 20%, transparent)"  },
  "Roteiro":     { bg: "color-mix(in srgb, var(--sage) 16%, transparent)",     text: "color-mix(in srgb, var(--sage) 80%, var(--ink))",  border: "color-mix(in srgb, var(--sage) 24%, transparent)"    },
  "Poesia":      { bg: "color-mix(in srgb, var(--cedar) 14%, transparent)",    text: "color-mix(in srgb, var(--cedar) 70%, var(--ink))", border: "color-mix(in srgb, var(--cedar) 22%, transparent)"   },
  "Não-ficção":  { bg: "color-mix(in srgb, var(--ochre) 14%, transparent)",    text: "color-mix(in srgb, var(--ochre) 75%, var(--ink))", border: "color-mix(in srgb, var(--ochre) 22%, transparent)"   },
  "Vestibular":  { bg: "color-mix(in srgb, var(--sienna) 13%, transparent)",   text: "color-mix(in srgb, var(--sienna) 65%, var(--ink))",border: "color-mix(in srgb, var(--sienna) 20%, transparent)"  },
  "Comercial":   { bg: "color-mix(in srgb, var(--muted) 14%, transparent)",    text: "var(--muted)",                                    border: "color-mix(in srgb, var(--muted) 22%, transparent)"    },
  "Notas":       { bg: "var(--surface-low)",                                   text: "var(--muted)",                                    border: "var(--line)"                                          },
};

let cronoYear  = new Date().getFullYear();
let cronoMonth = new Date().getMonth();
let cronoSelectedDay = null;
let cronoShortcutOpen = false;

function getCronoDayKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

function toggleCronoDateShortcut(forceOpen) {
  cronoShortcutOpen = typeof forceOpen === "boolean" ? forceOpen : !cronoShortcutOpen;
  const shortcut = document.querySelector("[data-crono-date-shortcut]");
  const toggle = document.querySelector("[data-crono-month-toggle]");
  if (shortcut) shortcut.hidden = !cronoShortcutOpen;
  if (toggle) toggle.setAttribute("aria-expanded", String(cronoShortcutOpen));
  if (cronoShortcutOpen) renderCronoDateShortcut();
}

function moveCronogramaByMonths(delta) {
  const next = new Date(cronoYear, cronoMonth + delta, 1);
  if (next.getFullYear() > 2036) return;
  cronoYear = next.getFullYear();
  cronoMonth = next.getMonth();
  renderCronograma();
}

function moveCronogramaByYears(delta) {
  const nextYear = cronoYear + delta;
  if (nextYear > 2036) return;
  cronoYear = nextYear;
  renderCronograma();
}

function renderCronoDateShortcut() {
  const shortcut = document.querySelector("[data-crono-date-shortcut]");
  if (!shortcut) return;

  const TODAY = new Date();
  const holidays = getHolidays(cronoYear);
  const firstDay = new Date(cronoYear, cronoMonth, 1);
  const daysInMonth = new Date(cronoYear, cronoMonth + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < leadingDays; i++) cells.push(`<span class="crono-shortcut-empty"></span>`);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(cronoYear, cronoMonth, day);
    const dayKey = getCronoDayKey(cronoYear, cronoMonth, day);
    const hmKey = `${String(cronoMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const isToday = TODAY.toDateString() === date.toDateString();
    const isSelected = cronoSelectedDay === dayKey;
    const isSunday = date.getDay() === 0;
    const isHoliday = Boolean(holidays[hmKey]);
    cells.push(`
      <button class="crono-shortcut-day${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}${(isSunday || isHoliday) ? " is-red" : ""}" type="button" data-crono-day-jump="${day}" title="${isHoliday ? escapeHtml(holidays[hmKey]) : `Ir para ${day}/${cronoMonth + 1}/${cronoYear}`}">
        ${day}
      </button>`);
  }

  const holidayList = Object.entries(holidays)
    .filter(([key]) => Number(key.slice(0, 2)) === cronoMonth + 1)
    .map(([key, label]) => `${Number(key.slice(3))} - ${escapeHtml(label)}`)
    .join(" / ");
  const holidayHtml = holidayList || "Sem feriados nacionais";
  const moonPhases = getMoonPhasesForMonth(cronoYear, cronoMonth);
  const moonHtml = moonPhases.map((phase) => `
    <span class="crono-moon-phase crono-moon-${phase.key}">
      <span class="crono-moon-icon" aria-hidden="true">${phase.icon}</span>
      <strong>${phase.day}</strong>
      <small>${phase.label}</small>
    </span>`).join("");

  shortcut.innerHTML = `
    <div class="crono-shortcut-card" role="dialog" aria-label="Atalho para data do cronograma">
      <div class="crono-shortcut-nav" aria-label="Navegar por meses e anos">
        <button class="crono-shortcut-nav-btn" type="button" data-crono-shortcut-year="-1" aria-label="Ano anterior" title="Ano anterior">
          <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
        </button>
        <button class="crono-shortcut-nav-btn" type="button" data-crono-shortcut-month="-1" aria-label="Mês anterior" title="Mês anterior">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <div class="crono-shortcut-title">${CRONO_MONTHS[cronoMonth]} ${cronoYear}</div>
        <button class="crono-shortcut-nav-btn" type="button" data-crono-shortcut-month="1" aria-label="Próximo mês" title="Próximo mês">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
        <button class="crono-shortcut-nav-btn" type="button" data-crono-shortcut-year="1" aria-label="Próximo ano" title="Próximo ano">
          <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
        </button>
      </div>
      <div class="crono-shortcut-weekdays" aria-hidden="true">
        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
      </div>
      <div class="crono-shortcut-grid">${cells.join("")}</div>
      <div class="crono-shortcut-holidays${holidayList ? "" : " is-empty"}">${holidayHtml}</div>
      ${moonHtml ? `<div class="crono-moon-row" aria-label="Fases da lua do mês">${moonHtml}</div>` : ""}
    </div>`;
}

function jumpCronogramaToDay(day) {
  cronoSelectedDay = getCronoDayKey(cronoYear, cronoMonth, day);
  toggleCronoDateShortcut(false);
  renderCronograma();
  requestAnimationFrame(() => {
    const target = document.querySelector(`[data-crono-day-anchor="${cronoSelectedDay}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function renderCronograma() {
  const timeline    = document.querySelector("[data-crono-timeline]");
  const heatmap     = document.querySelector("[data-crono-heatmap]");
  const titleEl     = document.querySelector("[data-crono-title]");
  const monthLabel  = document.querySelector("[data-crono-month]");
  const hint        = document.querySelector("[data-crono-hint]");
  const emptyActions = document.querySelector("[data-crono-empty-actions]");
  if (!timeline) return;

  const TODAY       = new Date();
  const holidays    = getHolidays(cronoYear);
  const plannerData = loadPlannerData();

  // Title + month label
  if (titleEl)    titleEl.textContent   = `Seu ritmo em ${cronoYear}`;
  if (monthLabel) monthLabel.textContent = CRONO_MONTHS[cronoMonth];
  renderCronoDateShortcut();

  // Auto-entries from manuscripts (grouped by createdAt or updatedAt)
  const autoByDay = {};
  state.manuscripts.forEach(m => {
    const stamp = m.createdAt || m.updatedAt;
    if (!stamp) return;
    const key = stamp.slice(0, 10);
    if (!autoByDay[key]) autoByDay[key] = [];
    autoByDay[key].push(m);
  });

  // Hint: aparece quando o mês atual não tem nenhuma sessão
  const monthPrefix = `${cronoYear}-${String(cronoMonth+1).padStart(2,"0")}`;
  const monthHasAuto   = Object.keys(autoByDay).some(k => k.startsWith(monthPrefix));
  const monthHasManual = Object.keys(plannerData).some(k => k.startsWith(monthPrefix));
  const monthHasActivity = monthHasAuto || monthHasManual;
  if (hint) {
    hint.hidden = monthHasActivity;
  }
  if (emptyActions) {
    const day = TODAY.getFullYear() === cronoYear && TODAY.getMonth() === cronoMonth ? TODAY.getDate() : 1;
    const dayKey = `${monthPrefix}-${String(day).padStart(2,"0")}`;
    emptyActions.hidden = monthHasActivity;
    emptyActions.querySelectorAll("[data-day]").forEach(btn => { btn.dataset.day = dayKey; });
  }

  // Heatmap
  if (heatmap) {
    heatmap.innerHTML = CRONO_MONTHS_SHORT.map((label, i) => {
      const prefix = `${cronoYear}-${String(i+1).padStart(2,"0")}`;
      const hasAuto   = Object.keys(autoByDay).some(k => k.startsWith(prefix));
      const hasManual = Object.keys(plannerData).some(k => k.startsWith(prefix));
      const hasAny = hasAuto || hasManual;
      const isCurrent = i === cronoMonth;
      return `
        <button class="crono-month-btn${isCurrent ? " is-current" : ""}" data-crono-month-jump="${i}">
          <span>${label}</span>
          <span class="crono-month-dot${hasAny ? " has-data" : ""}${isCurrent ? " is-today" : ""}"></span>
        </button>`;
    }).join("");
  }

  // Days in month
  const firstDay  = new Date(cronoYear, cronoMonth, 1);
  const days      = [];
  const d = new Date(firstDay);
  while (d.getMonth() === cronoMonth) { days.push(new Date(d)); d.setDate(d.getDate()+1); }

  timeline.innerHTML = days.map(date => {
    const dayKey   = `${cronoYear}-${String(cronoMonth+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const hmKey    = `${String(cronoMonth+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const holiday  = holidays[hmKey];
    const autoMs   = autoByDay[dayKey] || [];
    const manualItems = plannerData[dayKey] || [];
    const isToday  = TODAY.toDateString() === date.toDateString();
    const isSelected = cronoSelectedDay === dayKey;

    const isPast = date < TODAY && !isToday;
    // Mostra dias com conteúdo, hoje e dias futuros deste mês (para tarefas)
    if (!autoMs.length && !manualItems.length && !holiday && !isToday && !isSelected && isPast) return "";

    const hasActivity = autoMs.length > 0 || manualItems.length > 0;

    const autoHtml = autoMs.map(m => {
      const col = FOLDER_CRONO_COLOR[m.folder] || FOLDER_CRONO_COLOR["Notas"];
      const words = countWords(m.text || "");
      const wordsLabel = words > 0 ? `${words} pal` : "rascunho";
      const time  = new Date(m.createdAt || m.updatedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      return `<div class="crono-item crono-item-auto" style="--ci-bg:${col.bg};--ci-text:${col.text};--ci-border:${col.border}" data-crono-ms="${m.id}">
        <span class="material-symbols-outlined">auto_stories</span>
        <span class="crono-item-title">${escapeHtml(m.title)}</span>
        <span class="crono-item-meta"><span>${escapeHtml(m.kind || m.folder || "")}</span>${(m.kind || m.folder) ? " · " : ""}<span>${wordsLabel} · ${time}</span></span>
      </div>`;
    }).join("");

    const manualHtml = manualItems.map(item => `
      <div class="crono-item crono-item-manual${item.completed ? " is-done" : ""}${item.type === "note" ? " is-note" : ""}" data-crono-item="${item.id}" data-crono-day="${dayKey}">
        <button class="crono-check" data-action="crono-toggle" data-day="${dayKey}" data-item="${item.id}" title="${item.completed ? "Desmarcar" : "Concluir"}">
          <span class="material-symbols-outlined">${item.completed ? "check_circle" : "circle"}</span>
        </button>
        <span class="crono-item-title">${escapeHtml(item.text)}</span>
        <button class="crono-delete" data-action="crono-delete" data-day="${dayKey}" data-item="${item.id}" title="Remover">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>`).join("");

    const emptyFutureHtml = !hasActivity && !isToday && !isPast
      ? `<p class="crono-day-empty"><button class="crono-add-inline crono-add-btn" data-action="crono-add-task" data-day="${dayKey}">+ planejar</button></p>`
      : "";

    return `
      <div class="crono-day${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}${hasActivity ? " has-activity" : ""}" data-crono-day-anchor="${dayKey}">
        <div class="crono-day-dot${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"></div>
        <div class="crono-day-header">
          <span class="crono-day-num">${date.getDate()}</span>
          <span class="crono-day-name">${CRONO_WEEKDAYS[date.getDay()]}</span>
          ${holiday ? `<span class="crono-holiday">${escapeHtml(holiday)}</span>` : ""}
        </div>
        <div class="crono-items">
          ${autoHtml}
          ${manualHtml}
          ${emptyFutureHtml}
          <div class="crono-add-row">
            <button class="crono-add-btn" data-action="crono-add-task" data-day="${dayKey}">
              <span class="material-symbols-outlined">add</span> Tarefa
            </button>
            ${(isToday || isPast) ? `<button class="crono-add-btn crono-add-note" data-action="crono-add-note" data-day="${dayKey}">
              <span class="material-symbols-outlined">add</span> Nota
            </button>` : ""}
          </div>
        </div>
      </div>`;
  }).join("")  || `<p class="crono-empty">Nenhuma nota criada em ${CRONO_MONTHS[cronoMonth]}. Que tal começar uma?</p>`;
}

function cronoHandleAction(action, e, t) {
  e.preventDefault();
  if (action === "add-task" || action === "add-note") {
    const label = action === "add-task" ? "Nova tarefa:" : "Nova nota:";
    const type  = action === "add-task" ? "task" : "note";
    vrdaPrompt(label, "", (text) => {
      if (!text?.trim()) return;
      const d = loadPlannerData();
      (d[t.dataset.day] = d[t.dataset.day] || []).push({ id: Date.now(), text: text.trim(), type, completed: false });
      savePlannerData(d);
      renderCronograma();
    });
  } else if (action === "toggle") {
    const d = loadPlannerData();
    d[t.dataset.day] = (d[t.dataset.day] || []).map(i => i.id === Number(t.dataset.item) ? { ...i, completed: !i.completed } : i);
    savePlannerData(d); renderCronograma();
  } else if (action === "delete") {
    const d = loadPlannerData();
    d[t.dataset.day] = (d[t.dataset.day] || []).filter(i => i.id !== Number(t.dataset.item));
    savePlannerData(d); renderCronograma();
  }
}
