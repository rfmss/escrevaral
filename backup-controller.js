// backup-controller.js — backup, importação, File System Access e registro offline
// Depende de: state-store.js, backup-engine.js, filesystem-backup-engine.js, vrda-engine.js

function registerOfflineApp() {
  updateConnectionStatus();

  if (!("serviceWorker" in navigator)) {
    offlineStatus.innerHTML = '<span class="material-symbols-outlined">cloud_off</span>Sem suporte a uso sem internet';
    return;
  }

  const updateBanner = document.getElementById("update-banner");
  const updateReloadBtn = document.getElementById("update-reload-btn");
  const updateDismissBtn = document.getElementById("update-dismiss-btn");

  if (updateReloadBtn) updateReloadBtn.addEventListener("click", () => window.location.reload());
  if (updateDismissBtn) updateDismissBtn.addEventListener("click", () => { if (updateBanner) updateBanner.hidden = true; });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updateBanner) updateBanner.hidden = false;
  });

  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) => {
      offlineStatus.innerHTML = '<span class="material-symbols-outlined">cloud_done</span>Pronto sem internet';
      registration.update();
    })
    .catch(() => {
      offlineStatus.innerHTML = '<span class="material-symbols-outlined">sync_problem</span>Sem internet disponível';
    });
}

async function installApp() {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;

  if (choice.outcome === "accepted") {
    saveStatus.textContent = "Escrevaral instalado";
  }
}

function getBackupWarningState() {
  const exportedAt = backupMeta.exportedAt ? new Date(backupMeta.exportedAt) : null;

  if (!exportedAt || Number.isNaN(exportedAt.getTime())) {
    return {
      visible: true,
      copy: "Limpar cache, trocar de aparelho ou remover dados do site pode apagar seus textos locais. Exporte um cópia .esc para guardar uma cópia fora do navegador.",
    };
  }

  const elapsedDays = Math.floor((Date.now() - exportedAt.getTime()) / (1000 * 60 * 60 * 24));

  if (elapsedDays >= BACKUP_WARNING_DAYS) {
    return {
      visible: true,
      copy: `Sua última cópia .esc foi há ${elapsedDays} dias. Guarde uma cópia nova antes de limpar o navegador ou trocar de aparelho.`,
    };
  }

  return {
    visible: false,
    copy: "",
  };
}

function renderBackupWarning() {
  const warning = getBackupWarningState();
  backupWarning.hidden = !warning.visible;
  backupWarningCopy.textContent = warning.copy;

  // Abre automaticamente o painel de segurança quando há risco real
  const secDetails = document.querySelector(".archive-security-details");
  if (secDetails && warning.visible) {
    secDetails.open = true;
  }
}

function setFilesystemBackupState(stateName, status, detail) {
  filesystemBackup.dataset.state = stateName;
  filesystemBackupStatus.textContent = status;
  filesystemBackupDetail.textContent = detail;
  // Atualiza o status inline no summary do <details>
  const inlineStatus = document.querySelector("[data-filesystem-backup-inline-status]");
  if (inlineStatus) inlineStatus.textContent = status;
}

async function initializeFilesystemBackup() {
  if (!VeredaFileSystemBackup.isSupported()) {
    setFilesystemBackupState(
      "idle",
      "Cópia automática indisponível neste navegador",
      "Chrome, Edge e Opera permitem escolher um arquivo .esc para salvar automaticamente. Firefox e Safari ainda bloqueiam esse acesso."
    );
    filesystemBackup.querySelector('[data-action="choose-filesystem-backup"]').disabled = true;
    filesystemBackupInterval.disabled = true;
    return;
  }

  filesystemBackupHandle = await VeredaFileSystemBackup.getStoredHandle();

  if (!filesystemBackupHandle) {
    setFilesystemBackupState(
      "idle",
      "Cópia automática desativada",
      "Escolha um arquivo .esc para o Escrevaral manter uma cópia completa do acervo fora do navegador."
    );
    return;
  }

  filesystemBackupSaveButton.disabled = false;
  filesystemBackupStopButton.disabled = false;
  if (filesystemBackupForgetButton) filesystemBackupForgetButton.disabled = false;

  // Verificar permissão sem gesto: se "prompt", não inicia timer — aguarda clique manual
  const perm = typeof filesystemBackupHandle.queryPermission === "function"
    ? await filesystemBackupHandle.queryPermission({ mode: "readwrite" })
    : "granted";

  if (perm !== "granted") {
    setFilesystemBackupState("ready", "Permissão expirada — clique em Salvar para reativar", `${filesystemBackupHandle.name} · aguardando confirmação`);
    return;
  }

  setFilesystemBackupState("ready", "Arquivo no computador lembrado", `${filesystemBackupHandle.name} · cópia automática ativa`);
  startFilesystemBackup();
}

async function chooseFilesystemBackup() {
  try {
    const dateStamp = createDateTimeStamp();
    filesystemBackupHandle = await VeredaFileSystemBackup.pickBackupFile(`vereda-acervo-${dateStamp}.esc`);
    filesystemBackupSaveButton.disabled = false;
    filesystemBackupStopButton.disabled = false;
    if (filesystemBackupForgetButton) filesystemBackupForgetButton.disabled = false;
    filesystemBackupCount = 0;
    setFilesystemBackupState("ready", "Arquivo no computador configurado", `${filesystemBackupHandle.name} · cópia automática ativa`);
    startFilesystemBackup();
    await saveFilesystemBackup(true);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    setFilesystemBackupState("error", "Não foi possível configurar o cópia automática no computador", error.message);
  }
}

async function saveFilesystemBackup(manual = false) {
  if (!filesystemBackupHandle) {
    return;
  }

  try {
    setFilesystemBackupState("saving", "Salvando cópia externa...", filesystemBackupHandle.name);
    const backup = VeredaBackup.createBackup(state);
    await VeredaFileSystemBackup.writeBackup(filesystemBackupHandle, backup);
    filesystemBackupCount += 1;
    backupMeta = {
      exportedAt: backup.exportedAt,
      manuscriptCount: state.manuscripts.length,
      filesystem: true,
      filename: filesystemBackupHandle.name,
    };
    persistBackupMeta();
    renderBackupWarning();
    const label = manual ? "Cópia externa salva agora" : `Cópia automática #${filesystemBackupCount}`;
    setFilesystemBackupState("ready", label, `${filesystemBackupHandle.name} · ${formatUpdatedAt(backup.exportedAt)}`);
    // Se o timer não estava rodando (permissão expirada), retomar após save manual bem-sucedido
    if (manual && !filesystemBackupTimer) startFilesystemBackup();
  } catch (error) {
    stopFilesystemBackup();
    setFilesystemBackupState("error", "Cópia automática pausada", error.message);
  }
}

function startFilesystemBackup() {
  stopFilesystemBackup(false);
  filesystemBackupTimer = window.setInterval(() => saveFilesystemBackup(false), filesystemBackupIntervalSeconds * 1000);
}

function stopFilesystemBackup(updateUi = true) {
  if (filesystemBackupTimer) {
    window.clearInterval(filesystemBackupTimer);
    filesystemBackupTimer = null;
  }

  if (updateUi && filesystemBackupHandle) {
    setFilesystemBackupState("idle", "Cópia automática pausada", `${filesystemBackupHandle.name} continua configurado`);
  }
}

async function forgetFilesystemBackup() {
  stopFilesystemBackup(false);
  await VeredaFileSystemBackup.clearHandle();
  filesystemBackupHandle = null;
  filesystemBackupSaveButton.disabled = true;
  filesystemBackupStopButton.disabled = true;
  if (filesystemBackupForgetButton) filesystemBackupForgetButton.disabled = true;
  setFilesystemBackupState(
    "idle",
    "Cópia automática desativada",
    "Escolha um arquivo .esc para o Escrevaral manter uma cópia completa do acervo fora do navegador."
  );
}

function updateFilesystemBackupInterval(value) {
  filesystemBackupIntervalSeconds = Number(value);
  filesystemBackupIntervalLabel.textContent = `${filesystemBackupIntervalSeconds}s`;

  if (filesystemBackupTimer) {
    startFilesystemBackup();
  }
}

function exportBackup() {
  // Inclui registro de rodadas do temporizador no .esc
  const timerRounds = (() => {
    try { return JSON.parse(localStorage.getItem("vereda:timer-rounds") || "[]"); }
    catch { return []; }
  })();

  const backup = VeredaBackup.createBackup(state);
  if (timerRounds.length > 0) backup.timerRounds = timerRounds;
  const backupJson = JSON.stringify(backup, null, 2);
  const dateStamp = createDateTimeStamp();
  downloadFile(backupJson, `vereda-acervo-${dateStamp}.esc`, "application/vnd.vereda+json");
  backupMeta = {
    exportedAt: backup.exportedAt,
    manuscriptCount: state.manuscripts.length,
  };
  persistBackupMeta();
  renderBackupWarning();
  const kb = Math.round(backupJson.length / 1024);
  const msCount = state.manuscripts.filter(m => (m.type || "manuscrito") === "manuscrito").length;
  saveStatus.textContent = `Cópia guardada · ${msCount} ${msCount === 1 ? "manuscrito" : "manuscritos"} · ${kb} KB`;
}

function exportCurrentManuscript(format) {
  try {
    const exportFile = VeredaExport.exportManuscript(getActiveManuscript(), format);
    downloadFile(exportFile.content, exportFile.filename, exportFile.mimeType);
    saveStatus.textContent = `Manuscrito exportado em .${format}`;
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

function requestBackupImport() {
  backupInput.value = "";
  backupInput.click();
}

async function importBackup(file) {
  if (!file) {
    return;
  }

  try {
    const backup = await VeredaBackup.readBackup(file);
    const envSummary = VeredaVrda.summarizeEnvelope(backup);
    state = VeredaBackup.restoreBackup(state, backup);
    state.manuscripts = VeredaArchive.normalizeManuscripts(state.manuscripts);
    state.versions = state.versions || {};
    state.proofValidations = state.proofValidations || {};
    state.archive = {
      ...getDefaultArchiveState(),
      ...state.archive,
    };
    backupMeta = {
      exportedAt: backup.exportedAt || new Date().toISOString(),
      manuscriptCount: state.manuscripts.length,
    };
    persistBackupMeta();
    renderActiveManuscript();
    renderManuscriptNavigation();
    renderProjectGrid();
    renderLexicalView();
    renderProofView();
    renderVersionList();
    renderBackupWarning();
    applyFocusSettings();
    persistState("Backup importado");
    const { manuscriptCount: msCount, noteCount, totalWords } = envSummary;
    const parts = [
      msCount > 0 ? `${msCount} ${msCount === 1 ? "manuscrito" : "manuscritos"}` : "",
      noteCount > 0 ? `${noteCount} ${noteCount === 1 ? "nota" : "notas"}` : "",
    ].filter(Boolean);
    const wordsPart = totalWords > 0 ? ` · ${totalWords.toLocaleString("pt-BR")} palavras` : "";
    saveStatus.textContent = parts.length ? `${parts.join(" e ")} trazidos de volta${wordsPart}` : "Acervo restaurado";
    setView("arquivo");
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

const wordCloudEl     = document.querySelector("[data-word-cloud]");
const grammarBarEl    = document.querySelector("[data-grammar-bar]");
const grammarLegendEl = document.querySelector("[data-grammar-legend]");
const fleschScoreEl   = document.querySelector("[data-flesch-score]");
const fleschLabelEl   = document.querySelector("[data-flesch-label]");

const STOPWORDS = new Set("a o e é de da do das dos em um uma na no nas nos por para com se que ao à as os não mas também já seu sua seus suas este esta estes estas esse essa esses essas aquele aquela pelo pela pelos pelas num numa nuns numas foi era eram fazia estava estavam havia tinha tinham seria seriam mais muito muita muitos muitas tudo nada nenhum nenhuma algum alguma quando onde como porque pois então ainda assim outro outra outros outras".split(" "));
const PRONOUNS_PT = new Set("eu tu ele ela nós vocês eles elas me te se nos vos lhe lhes mim ti si você".split(" "));


window.VeredaBackupController = { init: true }; // âncora de boot

// ── Input listeners do Backup ─────────────────────────────────────────────────
if (backupInput) backupInput.addEventListener("change", () => importBackup(backupInput.files[0]));
if (filesystemBackupInterval) filesystemBackupInterval.addEventListener("input", () => updateFilesystemBackupInterval(filesystemBackupInterval.value));
