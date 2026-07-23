// backup-controller.js — backup, importação, File System Access e registro offline
// Depende de: state-store.js, backup-engine.js, filesystem-backup-engine.js, vrda-engine.js

function _setOfflineStatus(icon, label, tooltip) {
  if (!offlineStatus) return;
  offlineStatus.innerHTML = `<span class="material-symbols-outlined">${icon}</span>${label}`;
  offlineStatus.dataset.vrdaTooltip = tooltip || label;
  offlineStatus.setAttribute("aria-label", label);
}

function _checkCacheHealth() {
  if (!("caches" in window)) return;
  caches.keys().then(names => {
    const appCache = names.find(n => n.startsWith("vereda-offline-"));
    if (!appCache) {
      _setOfflineStatus("cloud_sync", "Preparando modo sem internet…", "Instalando arquivos para funcionar sem conexão. Pronto em instantes.");
      return;
    }
    return caches.open(appCache).then(c => c.keys()).then(keys => {
      if (!offlineStatus) return;
      const count = keys.length;
      if (count === 0) {
        _setOfflineStatus("cloud_sync", "Preparando modo sem internet…", "Instalando arquivos para funcionar sem conexão. Pronto em instantes.");
      } else {
        offlineStatus.dataset.vrdaTooltip = `${count} arquivo${count !== 1 ? "s" : ""} disponíveis localmente · oficina funciona sem internet`;
      }
    });
  }).catch(() => {});
}

function registerOfflineApp() {
  updateConnectionStatus();

  if (!("serviceWorker" in navigator)) {
    _setOfflineStatus(
      "cloud_off",
      "Modo sem internet indisponível",
      "Seu navegador não suporta o modo sem internet. Suas notas continuam salvas localmente — exporte uma cópia de segurança para protegê-las."
    );
    return;
  }

  const updateBanner = document.getElementById("update-banner");
  const updateReloadBtn = document.getElementById("update-reload-btn");
  const updateDismissBtn = document.getElementById("update-dismiss-btn");

  const tabConflictBanner = document.getElementById("tab-conflict-banner");
  const tabConflictReload = document.getElementById("tab-conflict-reload");
  const tabConflictDismiss = document.getElementById("tab-conflict-dismiss");
  let _tabConflictShown = false;

  document.addEventListener("vrda:tab-conflict", () => {
    if (_tabConflictShown || !tabConflictBanner) return;
    _tabConflictShown = true;
    tabConflictBanner.hidden = false;
  });
  if (tabConflictReload) tabConflictReload.addEventListener("click", () => { window.location.reload(); });
  if (tabConflictDismiss) tabConflictDismiss.addEventListener("click", () => {
    if (tabConflictBanner) tabConflictBanner.hidden = true;
  });

  function showUpdateBanner() {
    if (!updateBanner) return;
    // Não mostrar na primeira visita — usuário ainda não tem nada salvo
    if (!window.state?.manuscripts?.length) return;
    updateBanner.hidden = false;
    if (window.innerWidth <= 768) {
      const wa = document.querySelector(".writing-area");
      if (wa) wa.addEventListener("input", () => { updateBanner.hidden = true; }, { once: true });
    }
  }

  if (updateReloadBtn) updateReloadBtn.addEventListener("click", () => {
    updateReloadBtn.disabled = true;
    updateReloadBtn.textContent = "Recarregando…";
    window.location.reload();
  });
  if (updateDismissBtn) updateDismissBtn.addEventListener("click", () => {
    if (updateBanner) updateBanner.hidden = true;
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    showUpdateBanner();
    _setOfflineStatus("cloud_done", "Pronto sem internet", "Nova versão ativa — o Escrevaral está atualizado e funciona sem rede.");
    _checkCacheHealth();
  });

  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) => {
      const isControlled = Boolean(navigator.serviceWorker.controller);
      if (isControlled) {
        _setOfflineStatus("cloud_done", "Pronto sem internet", "O Escrevaral funciona sem conexão — suas notas ficam salvas aqui no navegador.");
        _checkCacheHealth();
      } else {
        _setOfflineStatus("downloading", "Preparando uso sem internet…", "Baixando arquivos para funcionar sem conexão. Pronto em instantes.");
      }

      if (registration.waiting) showUpdateBanner();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });

      // Verificar atualizações a cada 30 minutos enquanto app estiver aberto
      setInterval(() => registration.update().catch(() => {}), 30 * 60 * 1000);
    })
    .catch((err) => {
      const isNetwork = err?.message?.toLowerCase().includes("network");
      _setOfflineStatus(
        "sync_problem",
        isNetwork ? "Modo sem internet não disponível agora" : "Modo sem internet indisponível",
        "Não foi possível ativar o modo sem internet. Suas notas continuam salvas no navegador — exporte uma cópia de segurança quando puder."
      );
    });
}

async function checkForSWUpdate() {
  if (!("serviceWorker" in navigator)) {
    saveStatus.textContent = "Modo sem internet não disponível neste navegador";
    return;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) { saveStatus.textContent = "Nenhuma versão armazenada ainda"; return; }
    saveStatus.textContent = "Verificando nova versão…";
    await reg.update();
    if (reg.waiting) {
      const banner = document.getElementById("update-banner");
      if (banner) banner.hidden = false;
      saveStatus.textContent = "Nova versão disponível — recarregue para aplicar";
    } else {
      saveStatus.textContent = "Você já está na versão mais recente";
    }
  } catch (_) {
    saveStatus.textContent = "Verificação falhou — tente novamente em instantes";
  }
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
      copy: "Limpar dados do navegador, trocar de aparelho ou remover dados do site pode apagar seus textos locais. Exporte uma cópia .esc para guardar seus textos fora do navegador.",
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

function _checkReloadBackupNudge() {
  const RELOAD_KEY = "vrda-reload-count";
  const count = parseInt(sessionStorage.getItem(RELOAD_KEY) || "0", 10) + 1;
  sessionStorage.setItem(RELOAD_KEY, String(count));

  // Primeiro carregamento (count=1) passa silencioso; a partir do primeiro reload (count=2) verifica
  if (count < 2) return;

  // Só mostra se há conteúdo real para proteger
  const hasContent = Array.isArray(state.manuscripts) &&
    state.manuscripts.some(m => (m.text || "").trim().length > 0);
  if (!hasContent) return;

  // Só mostra se backup está ausente ou velho
  if (!getBackupWarningState().visible) return;

  const banner = document.getElementById("backup-nudge-banner");
  if (!banner || !banner.hidden) return;
  banner.hidden = false;

  const exportBtn = document.getElementById("backup-nudge-export");
  const dismissBtn = document.getElementById("backup-nudge-dismiss");

  if (exportBtn) exportBtn.addEventListener("click", () => { exportBackup(); banner.hidden = true; }, { once: true });
  if (dismissBtn) dismissBtn.addEventListener("click", () => { banner.hidden = true; }, { once: true });
}

function humanizeBackupError(error) {
  if (error.name === "NotAllowedError") {
    return "O arquivo de cópia precisa de confirmação — clique em Salvar agora para continuar.";
  }
  if (error.name === "NotFoundError") {
    return "O arquivo de cópia não foi encontrado no computador. Use Esquecer arquivo e escolha um novo arquivo.";
  }
  return "Não foi possível salvar a cópia agora. Tente salvar manualmente.";
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
    setFilesystemBackupState("ready", "Arquivo de cópia precisa de confirmação", `${filesystemBackupHandle.name} · clique em Salvar agora para continuar`);
    return;
  }

  setFilesystemBackupState("ready", "Arquivo de cópia lembrado", `${filesystemBackupHandle.name} · cópia automática ativa`);
  startFilesystemBackup();
}

async function chooseFilesystemBackup() {
  try {
    const dateStamp = createDateTimeStamp();
    filesystemBackupHandle = await VeredaFileSystemBackup.pickBackupFile(`escrevaral-acervo-${dateStamp}.esc`);
    filesystemBackupSaveButton.disabled = false;
    filesystemBackupStopButton.disabled = false;
    if (filesystemBackupForgetButton) filesystemBackupForgetButton.disabled = false;
    filesystemBackupCount = 0;
    setFilesystemBackupState("ready", "Arquivo de cópia configurado", `${filesystemBackupHandle.name} · cópia automática ativa`);
    startFilesystemBackup();
    await saveFilesystemBackup(true);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    setFilesystemBackupState("error", "Não foi possível configurar a cópia automática no computador", humanizeBackupError(error));
  }
}

async function saveFilesystemBackup(manual = false) {
  if (!filesystemBackupHandle) {
    return;
  }

  try {
    setFilesystemBackupState("saving", "Guardando cópia no computador...", filesystemBackupHandle.name);
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
    const label = manual ? "Cópia guardada agora" : "Cópia automática guardada";
    setFilesystemBackupState("ready", label, `${filesystemBackupHandle.name} · ${formatUpdatedAt(backup.exportedAt)}`);
    // Se o timer não estava rodando (permissão expirada), retomar após save manual bem-sucedido
    if (manual && !filesystemBackupTimer) startFilesystemBackup();
  } catch (error) {
    stopFilesystemBackup();
    setFilesystemBackupState("error", "Cópia automática pausada", humanizeBackupError(error));
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
  downloadFile(backupJson, `escrevaral-acervo-${dateStamp}.esc`, "application/vnd.vereda+json");
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
    if (format === "epub") {
      const opts = _getExportScope();
      const pkg  = VeredaExport.buildOutputPackage(state.manuscripts, opts);
      if (pkg.warnings.length) { saveStatus.textContent = pkg.warnings[0]; return; }
      const docs = pkg.items;
      if (docs.length > 1) {
        const combined = {
          title: `Acervo Escrevaral — ${docs.length} textos`,
          author: "",
          text: docs.map(ms => `# ${ms.title || "Sem título"}\n\n${ms.text || ""}`).join("\n\n"),
        };
        const exportFile = VeredaExport.exportManuscript(combined, "epub");
        downloadFile(exportFile.content, exportFile.filename, exportFile.mimeType);
        saveStatus.textContent = `ePub exportado — ${docs.length} texto${docs.length !== 1 ? "s" : ""}`;
        return;
      }
    }
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

function _formatImportConfirmMessage(envelope, fileName) {
  const s = VeredaVrda.summarizeEnvelope(envelope);
  const parts = [
    s.manuscriptCount > 0 ? `${s.manuscriptCount} ${s.manuscriptCount === 1 ? "manuscrito" : "manuscritos"}` : null,
    s.noteCount > 0 ? `${s.noteCount} ${s.noteCount === 1 ? "nota" : "notas"}` : null,
  ].filter(Boolean);
  const wordsPart = s.totalWords > 0 ? `, ${s.totalWords.toLocaleString("pt-BR")} palavras` : "";
  let datePart = "";
  if (s.exportedAt) {
    try {
      datePart = ` de ${new Date(s.exportedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`;
    } catch (_) {}
  }
  const currentCount = state.manuscripts.length;
  const currentNoun = currentCount === 1 ? "manuscrito" : "manuscritos";
  const fileLabel = fileName ? `"${fileName}"` : "cópia";
  const content = parts.length ? `${parts.join(" e ")}${wordsPart}` : "acervo";
  return `${fileLabel}${datePart}: ${content}.\n✓ Assinatura verificada.\nSubstitui o acervo atual (${currentCount} ${currentNoun}). Continuar?`;
}

async function _readAndConfirmImport(file) {
  if (!file) return;
  let backup;
  try {
    backup = await VeredaBackup.readBackup(file);
  } catch (error) {
    saveStatus.textContent = error.message;
    return;
  }
  const msg = _formatImportConfirmMessage(backup, file.name);
  vrdaConfirm(msg, () => _executeImport(file, backup));
}

async function importFromFilesystem() {
  if (!("showOpenFilePicker" in window)) {
    saveStatus.textContent = "Leitura via sistema de arquivos requer Chrome, Edge ou Opera.";
    return;
  }

  let file;
  try {
    file = await VeredaFileSystemBackup.pickReadFile();
  } catch (error) {
    if (error.name === "AbortError") return;
    saveStatus.textContent = "Não foi possível abrir o arquivo — tente usar o botão Trazer cópia de volta.";
    return;
  }

  await _readAndConfirmImport(file);
}

async function importBackup(file) {
  await _readAndConfirmImport(file);
}

async function _executeImport(file, backup) {
  try {
    const envSummary = VeredaVrda.summarizeEnvelope(backup);
    const previousCount = state.manuscripts.length;
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
    persistState("Cópia trazida de volta");
    const { manuscriptCount: msCount, noteCount, totalWords } = envSummary;
    const parts = [
      msCount > 0 ? `${msCount} ${msCount === 1 ? "manuscrito" : "manuscritos"}` : "",
      noteCount > 0 ? `${noteCount} ${noteCount === 1 ? "nota" : "notas"}` : "",
    ].filter(Boolean);
    const wordsPart = totalWords > 0 ? ` · ${totalWords.toLocaleString("pt-BR")} palavras` : "";
    const singular = (msCount + noteCount) === 1;
    const restoredTotal = state.manuscripts.length;
    const diffPart = restoredTotal !== previousCount
      ? ` (antes ${previousCount})`
      : "";
    saveStatus.textContent = parts.length ? `${parts.join(" e ")} ${singular ? "trazido" : "trazidos"} de volta${wordsPart}${diffPart}` : "Acervo restaurado";
    setView("arquivo");
  } catch (error) {
    saveStatus.textContent = error.message;
  }
} // _executeImport

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
