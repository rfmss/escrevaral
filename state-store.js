// countWords definido aqui pois state-store.js carrega antes de app.js
function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

const STORAGE_KEY = "vereda.manuscripts.v1";
const CHECKLIST_STORAGE_KEY = "vereda.checklists.v1";
const BACKUP_META_STORAGE_KEY = "vereda.backup-meta.v1";
const RIMALAB_STORAGE_KEY = "vereda.rimalab.v1";
const RIMALAB_SAVED_AT_KEY = "vereda.rimalab-saved-at.v1";
const FIRST_VISIT_KEY = "vrda-first-visit";
const FIRST_WRITING_DONE_KEY = "escrevaral-primeira-mesa-concluida-v1";
const FIRST_WRITING_STARTED_KEY = "escrevaral-primeira-mesa-iniciada-v1";
const TERMS_KEY       = "escrevaral-termos-v1";

if (new URLSearchParams(window.location.search).get("reset") === "true") {
  localStorage.clear();
  window.history.replaceState({}, "Escrevaral", window.location.pathname);
}

const _IS_FIRST_VISIT = !localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(FIRST_VISIT_KEY);
const BACKUP_WARNING_DAYS = 7;
const VIEW_ROUTES = new Set(["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"]);

// Estado de fallback vazio — estado corrompido inicia limpo, não com conteúdo de exemplo
const starterManuscripts = [];

// Guard: falha explicitamente se seletor obrigatório não existir no HTML
function requireEl(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`[Vereda] elemento obrigatório ausente: "${selector}"`);
  return el;
}

const shell = requireEl(".app-shell");
const contentStage = requireEl(".content-stage");
const nav          = requireEl("[data-nav]");
const titleInput   = requireEl(".title-input");
const writingArea  = requireEl(".writing-area");
const pagedEditor   = document.querySelector("[data-paged-editor]");
const formatBar     = document.querySelector("[data-format-bar]");
const formatBarWrap = document.querySelector("[data-format-bar-wrap]");
const fmtBlockSel   = document.querySelector("[data-fmt-block]");
const pagePresetSel  = document.querySelector("[data-page-preset]");
const pageCountEl    = document.querySelector("[data-page-count]");
const manuscriptList = document.querySelector("[data-manuscript-list]");
const projectGrid = document.querySelector("[data-project-grid]");
const countStat = document.querySelector('[data-stat="count"]');
const wpmStat = document.querySelector('[data-stat="wpm"]');
const saveStatus = document.querySelector("[data-save-status]");
const focusCount = document.querySelector("[data-focus-count]");
const focusSettingControls = document.querySelectorAll("[data-focus-setting]");
const rulerToggle = document.querySelector('[data-action="toggle-ruler"]');
const lexicalTitle = document.querySelector("[data-lexical-title]");
const lexicalContext = document.querySelector("[data-lexical-context]");
const lexicalCard = document.querySelector("[data-lexical-card]");
const lexicalSearch = document.querySelector("[data-lexical-search]");
const offlineStatus = document.querySelector("[data-offline-status]");
const installButton = document.querySelector('[data-action="install-app"]');
const proofIntegrity = document.querySelector("[data-proof-integrity]");
const proofStatus = document.querySelector("[data-proof-status]");
const proofOrganic = document.querySelector("[data-proof-organic]");
const proofRejected = document.querySelector("[data-proof-rejected]");
const proofCadence = document.querySelector("[data-proof-cadence]");
const proofSessionName = document.querySelector("[data-proof-session-name]");
const proofTimeline = document.querySelector("[data-proof-timeline]");
const proofValidateInput = document.querySelector("[data-proof-validate-input]");
const proofValidationResult = document.querySelector("[data-proof-validation]");
const WORD_GOAL_KEY = "vrda-word-goal";
let wordGoal = parseInt(localStorage.getItem(WORD_GOAL_KEY) || "0");
let goalCelebrated = false;
const backupInput = document.querySelector("[data-backup-input]");
const backupWarning = document.querySelector("[data-backup-warning]");
const backupWarningCopy = document.querySelector("[data-backup-warning-copy]");
const filesystemBackup = document.querySelector("[data-filesystem-backup]");
const filesystemBackupStatus = document.querySelector("[data-filesystem-backup-status]");
const filesystemBackupDetail = document.querySelector("[data-filesystem-backup-detail]");
const filesystemBackupInterval = document.querySelector("[data-filesystem-backup-interval]");
const filesystemBackupIntervalLabel = document.querySelector("[data-filesystem-backup-interval-label]");
const filesystemBackupSaveButton   = document.querySelector('[data-action="save-filesystem-backup"]');
const filesystemBackupStopButton   = document.querySelector('[data-action="stop-filesystem-backup"]');
const filesystemBackupForgetButton = document.querySelector('[data-action="forget-filesystem-backup"]');
const metadataForm = document.querySelector("[data-metadata-form]");
const metadataFields = document.querySelectorAll("[data-metadata-field]");
const progressReadout = document.querySelector("[data-progress-readout]");
const versionList = document.querySelector("[data-version-list]");
const archiveFilterBar = document.querySelector("[data-archive-filter-bar]");
const archiveStatusBar = document.querySelector("[data-archive-status-bar]");
const archiveSearch = document.querySelector("[data-archive-search]");
const archiveSort = document.querySelector("[data-archive-sort]");
const resumeDocuments = document.querySelector("[data-resume-documents]");
const craftTabs = document.querySelector("[data-craft-tabs]");
const templateTabs = document.querySelector("[data-template-tabs]");
const templateStudio = document.querySelector(".template-studio");
const templateSearch = document.querySelector("[data-template-search]");
const templateScreen = document.querySelector("[data-template-screen]");
const templateStepLabel = document.querySelector("[data-template-step-label]");
const editorSplit = document.querySelector(".editor-split");
const referenceTitle = document.querySelector("[data-reference-title]");
const referenceTabs = document.querySelector("[data-reference-tabs]");
const referenceBody = document.querySelector("[data-reference-body]");
const precisionCard = document.querySelector("[data-precision-card]");
const templateResizer = document.querySelector("[data-template-resizer]");
const templatePanelToggles = document.querySelectorAll("[data-template-panel-toggle]");
const createNoteOverlay = document.querySelector("[data-create-note-overlay]");
const welcomeOverlay = document.querySelector("[data-welcome-overlay]");
const createNoteTypes = document.querySelector("[data-create-note-types]");
const companionNotesSection = document.querySelector("[data-companion-notes]");
const specializedEditor = document.querySelector("[data-specialized-editor]");
const voiceInput = document.querySelector("[data-voice-input]");
const voiceCount = document.querySelector("[data-voice-count]");
const voiceResult = document.querySelector("[data-voice-result]");
const rimalabInput = document.querySelector("[data-rimalab-input]");
const rimalabCount = document.querySelector("[data-rimalab-count]");
const rimalabSave = document.querySelector("[data-rimalab-save]");
const rimalabIsometry = document.querySelector("[data-rimalab-isometry]");
const rimalabIsometryTitle = document.querySelector("[data-rimalab-isometry-title]");
const rimalabIsometryCopy = document.querySelector("[data-rimalab-isometry-copy]");
const rimalabMetrics = document.querySelector("[data-rimalab-metrics]");
const rimalabRhymes = document.querySelector("[data-rimalab-rhymes]");
const rimalabScheme = document.querySelector("[data-rimalab-scheme]");
const rimalabEncyclopedia = document.querySelector("[data-rimalab-encyclopedia]");
const rimalabNote = document.querySelector("[data-rimalab-note]");
const rimalabFinder = document.querySelector("[data-rimalab-finder]");
const rimalabFinderResults = document.querySelector("[data-rimalab-finder-results]");
const decolonialSearch = document.querySelector("[data-decolonial-search]");
const decolonialFilters = document.querySelector("[data-decolonial-filters]");
const decolonialCount = document.querySelector("[data-decolonial-count]");
const decolonialList = document.querySelector("[data-decolonial-list]");
const decolonialObserverToggle = document.querySelector("[data-decolonial-observer-toggle]");
const decolonialObserver = document.querySelector("[data-decolonial-observer]");
const decolonialObserverSummary = document.querySelector("[data-decolonial-observer-summary]");
const decolonialObserverList = document.querySelector("[data-decolonial-observer-list]");
const rightsLab = document.querySelector("[data-rights-lab]");
const rightsSearch = document.querySelector("[data-rights-search]");
const rightsSearchClear = document.querySelector("[data-rights-search-clear]");
const rightsCards = document.querySelector("[data-rights-cards]");
const rightsSources = document.querySelector("[data-rights-sources]");
const rightsDeathYear = document.querySelector("[data-rights-death-year]");
const rightsCalcResult = document.querySelector("[data-rights-calc-result]");

const topbarSearch = document.querySelector("[data-topbar-search]");
const globalSearchInput = document.querySelector("[data-global-search-input]");
const globalSearchResults = document.querySelector("[data-global-search-results]");
const themePicker = document.querySelector("[data-theme-picker]");
const themeButton = document.querySelector("[data-action='toggle-theme-menu']");
const themeMenu = document.querySelector("[data-theme-menu]");
const themeOptions = document.querySelector("[data-theme-options]");
const themeName = document.querySelector("[data-theme-name]");
const themeNoteTitle = document.querySelector("[data-theme-note-title]");
const themeNoteText = document.querySelector("[data-theme-note-text]");

const colorThemes = [
  {
    id: "scriptorium",
    label: "Scriptorium",
    swatch: ["#decfa8", "#c97d32", "#130f0d"],
    noteTitle: "Scriptorium",
    note: "Bancada brasileira de escrita. Mesa escura, folha quente, ferramentas em madeira e cobre.",
  },
];

const documentTypes = [
  { id: "projeto",            label: "Projeto",               icon: "workspaces",            kind: "Projeto",               chapter: "Visão geral",       description: "O ponto de partida de tudo. Reúne o que o projeto é, para onde vai e o que ainda falta." },
  { id: "manuscrito",         label: "Manuscrito",            icon: "description",           kind: "Manuscrito em branco",  chapter: "Primeira página",   description: "Folha em branco. Escreve sem moldura, sem obrigação de forma." },
  { id: "pesquisa",           label: "Pesquisa",              icon: "travel_explore",        kind: "Pesquisa",              chapter: "Referências",       description: "Para não perder o fio. Guarda fontes, citações e descobertas que alimentam o texto." },
  { id: "glossário",          label: "Glossário",             icon: "dictionary",            kind: "Glossário",             chapter: "Termos",            description: "Vocabulário próprio do projeto. Bom para mundos inventados, termos técnicos e gírias do universo." },
  { id: "submissão",          label: "Submissão",             icon: "outbox",                kind: "Submissão",             chapter: "Envio editorial",   description: "Antes de enviar o texto para alguém. Registra editora, data, resposta e o histórico completo." },
  { id: "revisão",            label: "Revisão",               icon: "rate_review",           kind: "Revisão",               chapter: "Processo editorial", description: "Para ler o texto como editora. Notas do processo, não da escrita — o que funciona, o que pede mais." },
  { id: "personagem",         label: "Personagem",            icon: "person_edit",           kind: "Personagem",            chapter: "Ficha",             description: "Ficha completa de quem vive na história. Do nome ao trauma, tudo num lugar só." },
  { id: "cena",               label: "Cena",                  icon: "movie_edit",            kind: "Cena",                  chapter: "Rascunho de cena",  description: "Esboça uma cena antes de escrever. Conflito, tensão, o que muda — e o que fica em aberto." },
  { id: "mundo",              label: "Mundo",                 icon: "public",                kind: "Mundo",                 chapter: "Construção do mundo", description: "As regras do universo que você criou. Física, magia, política, história — o que vale aqui dentro." },
  { id: "lugar",              label: "Lugar",                 icon: "location_on",           kind: "Lugar",                 chapter: "Espaço",            description: "Um espaço dentro do projeto. Como é, o que aconteceu ali, o peso que carrega na narrativa." },
  { id: "instituição",        label: "Instituição",           icon: "account_balance",       kind: "Instituição",           chapter: "Grupo de poder",    description: "Um grupo de poder, família, empresa ou facção. Quem são, o que querem, com quem brigam." },
  { id: "objeto",             label: "Objeto",                icon: "category",              kind: "Objeto",                chapter: "Item narrativo",    description: "Aquele item que aparece e significa algo. A faca, a carta, o anel — o peso que tem na história." },
  { id: "cronologia",         label: "Cronologia",            icon: "timeline",              kind: "Cronologia",            chapter: "Linha do tempo",    description: "A ordem de tudo que aconteceu. Útil para não perder o fio de quem sabe o quê e quando." },
  { id: "capítulo",           label: "Capítulo",              icon: "view_agenda",           kind: "Capítulo",              chapter: "Estrutura",         description: "Antes de escrever o capítulo. O que acontece, quem aparece, onde termina — o mapa da cena." },
  { id: "tema",               label: "Tema",                  icon: "psychology",            kind: "Tema",                  chapter: "Intenção autoral",  description: "A intenção por trás da história. O que o texto quer dizer, mesmo que ninguém perceba." },
  { id: "escaleta",           label: "Escaleta",              icon: "format_list_numbered",  kind: "Escaleta",              chapter: "Roteiro",           description: "Cena por cena, antes de escrever. A espinha do roteiro — sem carne ainda, só estrutura." },
  { id: "cena-roteiro",       label: "Cena de roteiro",       icon: "theaters",              kind: "Cena de roteiro",       chapter: "Roteiro",           description: "Uma cena no formato de roteiro. Cabeçalho, ação, diálogo — o que vai para a tela." },
  { id: "ato",                label: "Ato",                   icon: "view_timeline",         kind: "Ato",                   chapter: "Roteiro",           description: "Um bloco narrativo maior. Estrutura o arco antes de escrever as cenas que cabem dentro." },
  { id: "personagem-roteiro", label: "Personagem de roteiro", icon: "co_present",            kind: "Personagem de roteiro", chapter: "Roteiro",           description: "Ficha de personagem para roteiro. Com função dramática, voz própria e o que move essa pessoa." },
  { id: "pauta",              label: "Pauta",                 icon: "newspaper",             kind: "Pauta",                 chapter: "Jornalismo",        description: "O começo de uma reportagem. O que investigar, com quem falar, por que essa história importa agora." },
  { id: "fonte",              label: "Fonte",                 icon: "contact_mail",          kind: "Fonte jornalística",    chapter: "Apuração",          description: "Registro de uma fonte jornalística. Quem é, como contatar, o que já disse e o que pode confirmar." },
  { id: "entrevista",         label: "Entrevista",            icon: "record_voice_over",     kind: "Entrevista",            chapter: "Apuração",          description: "Perguntas antes de fazer, respostas depois de ouvir. O campo de apuração numa nota só." },
  { id: "fato",               label: "Fato",                  icon: "fact_check",            kind: "Fato",                  chapter: "Verificação",       description: "Um dado verificável. Anota, checou, confirmou — a base sólida do texto jornalístico." },
  { id: "poema",              label: "Poema",                 icon: "auto_awesome",          kind: "Poema",                 chapter: "Poesia",            description: "Espaço para escrever poesia. Sem moldura, sem régua — a não ser as que você decide usar." },
  { id: "série-poética",      label: "Série poética",         icon: "library_books",         kind: "Série poética",         chapter: "Poesia",            description: "Um conjunto de poemas que conversam entre si. O arco que une os versos numa obra maior." },
  { id: "argumento",          label: "Argumento",             icon: "schema",                kind: "Argumento",             chapter: "Ensaio",            description: "A tese de um ensaio. O que você quer defender — antes de começar a construir o argumento." },
  { id: "crônica",            label: "Crônica",               icon: "stylus_note",           kind: "Crônica",               chapter: "Crônica",           description: "Um olhar sobre o cotidiano. Curta, direta, com voz — a forma mais pessoal do texto em prosa." },
];

let state = loadState();
let checklistState = loadChecklistState();

function applyProgressLevel() { shell.dataset.progress = "4"; }
function checkProgress() {}
let backupMeta = loadBackupMeta();
let saveTimer;
let rimalabTimer;
let filesystemBackupHandle = null;
let filesystemBackupTimer = null;
let filesystemBackupIntervalSeconds = 15;
let filesystemBackupCount = 0;
let deferredInstallPrompt;
let createNoteType = "manuscrito";
let createNoteCategory = null;
let collapsedFolders = new Set();

const CATEGORY_FOLDER = {
  ficcao: "Ficção",
  roteiro: "Roteiro",
  poesia: "Poesia",
  "nao-ficcao": "Não-ficção",
  vestibular: "Vestibular",
  comercial: "Comercial",
  projeto: "Notas",
};

function getManuscriptFolder(manuscript) {
  if (manuscript.folder) return manuscript.folder;
  if (manuscript.type && manuscript.type !== "manuscrito") return "Notas";
  return "Ficção";
}

function toggleFolder(name) {
  if (collapsedFolders.has(name)) collapsedFolders.delete(name);
  else collapsedFolders.add(name);
  renderManuscriptNavigation();
}
let createNoteParentId = null;

const createCategories = [
  { id: "ficcao",     label: "Ficção",      icon: "auto_stories",         sub: "Romance, conto, flash, fantasia",      oficios: ["ficcao"] },
  { id: "roteiro",    label: "Roteiro",     icon: "movie",                sub: "Série, cinema, peça, podcast",         oficios: ["roteiro"] },
  { id: "poesia",     label: "Poesia",      icon: "auto_awesome",         sub: "Verso livre, soneto, slam, canção",    oficios: ["poesia"] },
  { id: "nao-ficcao", label: "Não-ficção",  icon: "newspaper",            sub: "Crônica, ensaio, reportagem",          oficios: ["nao-ficcao", "jornalismo"] },
  { id: "vestibular", label: "Vestibular",  icon: "school",               sub: "ENEM, Fuvest, dissertação",            oficios: ["estudo-vestibular"] },
  { id: "comercial",  label: "Comercial",   icon: "campaign",             sub: "Copywriting, UX writing, conteúdo",   oficios: ["comercial-tecnica"] },
  { id: "projeto",    label: "Organizar",   icon: "workspaces",           sub: "Personagem, cena, mundo, lugar",       oficios: [] },
];
// Hint Academia
let hintIdleTimer = null;
let hintAutoHideTimer = null;
let hintDismissed = false;
let saveHintShown = false;

let decolonialState = {
  category: "all",
  query: "",
  observerEnabled: false,
};
let rightsState = {
  query: "",
};
let templateState = {
  activeId: "roteiro-tv",
  step: 0,
  craftId: "roteiro",
  query: "",
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    // Novo usuário: estado vazio — a progressão começa do nível 0
    return {
      activeId: null,
      manuscripts: [],
      focus: getDefaultFocusSettings(),
      lexical: getDefaultLexicalState(),
      template: getDefaultTemplateState(),
      archive: getDefaultArchiveState(),
      layout: getDefaultLayoutState(),
      appearance: getDefaultAppearanceState(),
      proofs: {},
      versions: {},
      proofValidations: {},
      proofAuthor: { name: "", artisticName: "", signedAt: "" },
    };
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed.manuscripts)) {
      throw new Error("Invalid manuscript payload");
    }
    // Acervo vazio é estado válido — não ressuscita starterManuscripts
    if (parsed.manuscripts.length === 0) {
      return {
        ...parsed,
        manuscripts: [],
        activeId: null,
        focus: { ...getDefaultFocusSettings(), ...parsed.focus },
        lexical: { ...getDefaultLexicalState(), ...parsed.lexical },
        template: { ...getDefaultTemplateState(), ...parsed.template },
        archive: { ...getDefaultArchiveState(), ...parsed.archive },
        layout: { ...getDefaultLayoutState(), ...parsed.layout },
        appearance: { ...getDefaultAppearanceState(), ...parsed.appearance },
        proofs: parsed.proofs || {},
        versions: parsed.versions || {},
        proofValidations: parsed.proofValidations || {},
        proofAuthor: parsed.proofAuthor || { name: "", artisticName: "", signedAt: "" },
      };
    }

    return {
      ...parsed,
      manuscripts: VeredaArchive.normalizeManuscripts(parsed.manuscripts),
      focus: {
        ...getDefaultFocusSettings(),
        ...parsed.focus,
      },
      lexical: {
        ...getDefaultLexicalState(),
        ...parsed.lexical,
      },
      template: {
        ...getDefaultTemplateState(),
        ...parsed.template,
      },
      archive: {
        ...getDefaultArchiveState(),
        ...parsed.archive,
      },
      layout: {
        ...getDefaultLayoutState(),
        ...parsed.layout,
      },
      appearance: {
        ...getDefaultAppearanceState(),
        ...parsed.appearance,
      },
      proofs: parsed.proofs || {},
      versions: parsed.versions || {},
      proofValidations: parsed.proofValidations || {},
        proofAuthor: parsed.proofAuthor || { name: "", artisticName: "", signedAt: "" },
    };
  } catch {
    return {
      activeId: starterManuscripts[0]?.id ?? null,
      manuscripts: starterManuscripts,
      focus: getDefaultFocusSettings(),
      lexical: getDefaultLexicalState(),
      template: getDefaultTemplateState(),
      archive: getDefaultArchiveState(),
      layout: getDefaultLayoutState(),
      appearance: getDefaultAppearanceState(),
      proofs: {},
      versions: {},
      proofValidations: {},
    };
  }
}

function loadChecklistState() {
  try {
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadBackupMeta() {
  try {
    const saved = localStorage.getItem(BACKUP_META_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getDefaultFocusSettings() {
  return {
    fontSize: 19,
    width: 720,
    ruler: false,
  };
}

function getDefaultLexicalState() {
  return {
    selectedWord:    null,
    selectedPhrase:  null,
    selectedRange:   null,
    selectedContext: null,
  };
}

function getDefaultTemplateState() {
  return {
    selectedId: null,   // sem pré-seleção — escritor escolhe
    side: "left",
    width: 340,
    open: false,        // guia fechado por padrão
  };
}

function getDefaultArchiveState() {
  return {
    filter: "all",
    search: "",
    sort: "updated",
    statusFilter: "all",
  };
}

function getDefaultLayoutState() {
  return {
    leftCollapsed: false,
    rightCollapsed: true,  // Inspector abre após texto existir
  };
}

function getDefaultAppearanceState() {
  return {
    theme: "scriptorium",
  };
}

function persistState(status = "Salvo localmente") {
  const now = new Date();
  state.meta = state.meta || {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const storedAt = JSON.parse(raw)?.meta?.lastSavedAt;
      const ourAt = state.meta.lastSavedAt;
      if (storedAt && ourAt && storedAt > ourAt) {
        document.dispatchEvent(new CustomEvent("vrda:tab-conflict"));
      }
    }
  } catch (_) {}

  state.meta.lastSavedAt = now.toISOString();
  const { lexical: { selectedPhrase: _sp, selectedRange: _sr, selectedContext: _sc, ...lexicalRest }, ...stateRest } = state;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stateRest, lexical: lexicalRest }));
  } catch (err) {
    saveStatus.textContent = err?.name === "QuotaExceededError"
      ? "Não foi possível salvar — espaço do navegador cheio. Faça uma cópia de segurança."
      : "Não foi possível salvar agora. Seu texto continua na tela — tente uma cópia de segurança.";
    saveStatus.title = "Erro ao salvar localmente";
    return;
  }

  const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  saveStatus.textContent = `SALVO ${hhmm}`;
  saveStatus.title = status;
  saveStatus.dataset.motion = "pulse";
  window.setTimeout(() => { saveStatus.dataset.motion = ""; }, 700);
}

function persistChecklistState(status = "Checklist atualizado") {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistState));
  saveStatus.textContent = status;
}

function persistBackupMeta() {
  localStorage.setItem(BACKUP_META_STORAGE_KEY, JSON.stringify(backupMeta));
}
