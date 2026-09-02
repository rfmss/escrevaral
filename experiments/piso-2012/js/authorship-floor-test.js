(function (window, document) {
    "use strict";

    var PACKAGE_KEY = "encore-authorship-floor-package-v1";
    var DRAFT_KEY = "encore-authorship-floor-draft-v1";
    var titleInput = document.getElementById("note-title");
    var textInput = document.getElementById("note-text");
    var proofWord = document.getElementById("proof-word");
    var proofDetail = document.getElementById("proof-detail");
    var proofHash = document.getElementById("proof-hash");
    var capsuleCount = document.getElementById("capsule-count");
    var eventCount = document.getElementById("event-count");
    var sealTime = document.getElementById("seal-time");
    var clockStatus = document.getElementById("clock-status");
    var workerStatus = document.getElementById("worker-status");
    var sealButton = document.getElementById("seal-button");
    var tamperButton = document.getElementById("tamper-button");
    var exportButton = document.getElementById("export-button");
    var importButton = document.getElementById("import-button");
    var resetButton = document.getElementById("reset-button");
    var transferPanel = document.getElementById("transfer-panel");
    var transferTitle = document.getElementById("transfer-title");
    var transferInstruction = document.getElementById("transfer-instruction");
    var packageTransfer = document.getElementById("package-transfer");
    var copyButton = document.getElementById("copy-button");
    var confirmImportButton = document.getElementById("confirm-import-button");
    var downloadLink = document.getElementById("download-link");
    var closeTransferButton = document.getElementById("close-transfer-button");

    var worker = null;
    var sealTimer = null;
    var draftTimer = null;
    var events = [];
    var packageData = null;
    var sessionStart = monotonicNow();
    var sessionId = makeId("session");
    var noteId = makeId("note");
    var lastElapsed = 0;
    var lastTitleLength = 0;
    var lastTextLength = 0;
    var pasteField = "";
    var sealStarted = 0;
    var activeSnapshot = null;
    var transferMode = "";
    var downloadUrl = "";

    function monotonicNow() {
        if (window.performance && typeof window.performance.now === "function") return window.performance.now();
        return new Date().getTime();
    }

    function elapsedNow() {
        var value = Math.max(0, Math.round(monotonicNow() - sessionStart));
        if (value < lastElapsed) value = lastElapsed;
        lastElapsed = value;
        return value;
    }

    function makeId(prefix) {
        var values;
        var i;
        var out = "";
        try {
            if (window.crypto && window.crypto.getRandomValues && window.Uint32Array) {
                values = new window.Uint32Array(4);
                window.crypto.getRandomValues(values);
                for (i = 0; i < values.length; i += 1) out += ("00000000" + values[i].toString(16)).slice(-8);
                return prefix + "-" + out;
            }
        } catch (ignore) {}
        return prefix + "-weak-" + String(new Date().getTime()) + "-" + String(Math.random()).slice(2);
    }

    function readJSON(key) {
        var raw;
        try {
            raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (ignore) { return null; }
    }

    function writeJSON(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (ignore) { return false; }
    }

    function removeStored(key) {
        try { window.localStorage.removeItem(key); } catch (ignore) {}
    }

    function currentNote() {
        return { id: noteId, title: titleInput.value, text: textInput.value };
    }

    function persistDraft() {
        writeJSON(DRAFT_KEY, currentNote());
    }

    function scheduleDraft() {
        if (draftTimer) window.clearTimeout(draftTimer);
        draftTimer = window.setTimeout(function () {
            draftTimer = null;
            persistDraft();
        }, 350);
    }

    function previousRoot() {
        var capsules = packageData && packageData.capsules ? packageData.capsules : [];
        return capsules.length ? capsules[capsules.length - 1].capsuleHash : "GENESIS";
    }

    function lastDeviceTime() {
        var capsules = packageData && packageData.capsules ? packageData.capsules : [];
        if (!capsules.length) return 0;
        return Number(capsules[capsules.length - 1].time.deviceTimeMs || 0);
    }

    function deviceClockStatus(deviceTime) {
        var previous = lastDeviceTime();
        if (previous && deviceTime + 60000 < previous) return "rollback-detected";
        return "unwitnessed";
    }

    function record(kind, beforeLength, afterLength, inserted, deleted) {
        events.push({
            kind: kind,
            atMs: elapsedNow(),
            beforeLength: beforeLength,
            afterLength: afterLength,
            inserted: inserted || 0,
            deleted: deleted || 0
        });
        eventCount.innerHTML = String(events.length);
    }

    function recordChange(field, beforeLength, afterLength) {
        var inserted = Math.max(0, afterLength - beforeLength);
        var deleted = Math.max(0, beforeLength - afterLength);
        var action = pasteField === field ? "paste" : (inserted ? "insert" : (deleted ? "delete" : "replace"));
        pasteField = "";
        record(field + "-" + action, beforeLength, afterLength, inserted, deleted);
    }

    function discardWorker() {
        if (worker) {
            worker.terminate();
            worker = null;
        }
        workerStatus.innerHTML = "não";
    }

    function clearDownload() {
        if (downloadUrl && window.URL && window.URL.revokeObjectURL) {
            window.URL.revokeObjectURL(downloadUrl);
        }
        downloadUrl = "";
        downloadLink.style.display = "none";
        downloadLink.removeAttribute("download");
        downloadLink.href = "#";
    }

    function closeTransfer() {
        clearDownload();
        transferMode = "";
        packageTransfer.value = "";
        transferPanel.style.display = "none";
    }

    function showTransfer(mode) {
        transferMode = mode;
        clearDownload();
        transferPanel.style.display = "block";
        packageTransfer.readOnly = mode === "export";
        copyButton.style.display = mode === "export" ? "inline-block" : "none";
        confirmImportButton.style.display = mode === "import" ? "inline-block" : "none";
        if (mode === "export") {
            transferTitle.innerHTML = "Pacote .scrvrl pronto";
            transferInstruction.innerHTML = "Este bloco contém o texto e a prova. Copie sem digitar nada e guarde em lugar privado.";
        } else {
            transferTitle.innerHTML = "Trazer pacote .scrvrl";
            transferInstruction.innerHTML = "Cole aqui um pacote. Ele só substituirá a folha depois de passar na verificação.";
            packageTransfer.value = "";
            packageTransfer.focus();
        }
    }

    function offerDownload(serialized) {
        var name;
        var blob;
        if (!("download" in downloadLink) || !window.Blob || !window.URL || !window.URL.createObjectURL) return;
        try {
            name = String(packageData.note.title || "original").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "original";
            blob = new window.Blob([serialized], { type: "application/vnd.escrevaral.scrvrl+json;charset=utf-8" });
            downloadUrl = window.URL.createObjectURL(blob);
            downloadLink.href = downloadUrl;
            downloadLink.setAttribute("download", name + ".scrvrl");
            downloadLink.style.display = "inline-block";
        } catch (ignore) {
            clearDownload();
        }
    }

    function showIdle() {
        if (!titleInput.value || !textInput.value) {
            proofWord.innerHTML = "AGUARDANDO";
            proofDetail.innerHTML = "A prova começa quando houver título e texto.";
        } else {
            proofWord.innerHTML = "PRONTO";
            proofDetail.innerHTML = "Pare por um segundo ou toque em Selar agora.";
        }
    }

    function scheduleSeal() {
        if (sealTimer) window.clearTimeout(sealTimer);
        sealTimer = window.setTimeout(function () {
            sealTimer = null;
            seal(false);
        }, 1100);
    }

    function handleChange() {
        exportButton.disabled = true;
        tamperButton.disabled = true;
        scheduleDraft();
        scheduleSeal();
        showIdle();
    }

    function seal(force) {
        var note = currentNote();
        var deviceTime;
        var capsules;
        if (!note.title || !note.text) {
            showIdle();
            return;
        }
        if (worker) {
            if (force) scheduleSeal();
            return;
        }
        if (!window.Worker) {
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "Este navegador não abriu a cápsula de autoria.";
            return;
        }
        deviceTime = new Date().getTime();
        capsules = packageData && packageData.capsules ? packageData.capsules : [];
        activeSnapshot = {
            title: note.title,
            text: note.text,
            eventCount: events.length
        };
        proofWord.innerHTML = "REGISTRANDO";
        proofDetail.innerHTML = "A cápsula calcula os hashes e será descartada.";
        workerStatus.innerHTML = "sim";
        sealStarted = monotonicNow();
        worker = new window.Worker("js/authorship-worker.js");
        worker.onerror = function () {
            discardWorker();
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A cápsula encontrou um erro.";
        };
        worker.onmessage = function (message) {
            var response = message.data || {};
            var elapsed = Math.round(monotonicNow() - sealStarted);
            if (response.type === "sealed" && response.result && response.result.valid) {
                packageData = response.packageData;
                writeJSON(PACKAGE_KEY, packageData);
                if (activeSnapshot && activeSnapshot.title === titleInput.value && activeSnapshot.text === textInput.value) {
                    events.splice(0, activeSnapshot.eventCount);
                }
                proofWord.innerHTML = "REGISTRADO";
                proofDetail.innerHTML = "Integridade e continuidade confirmadas neste aparelho.";
                proofHash.innerHTML = "Raiz: " + response.result.rootHash;
                capsuleCount.innerHTML = String(response.result.capsuleCount);
                eventCount.innerHTML = String(packageData.capsules[packageData.capsules.length - 1].process.eventCount);
                sealTime.innerHTML = String(elapsed) + " ms";
                clockStatus.innerHTML = response.result.witnessStatus === "pending" ? "aguarda testemunha externa" : response.result.witnessStatus;
                if (activeSnapshot && activeSnapshot.title === titleInput.value && activeSnapshot.text === textInput.value) {
                    tamperButton.disabled = false;
                    exportButton.disabled = false;
                }
            } else {
                proofWord.innerHTML = "NÃO PASSOU";
                proofDetail.innerHTML = response.message || "A prova não foi confirmada.";
            }
            discardWorker();
            activeSnapshot = null;
            if (titleInput.value !== note.title || textInput.value !== note.text) scheduleSeal();
        };
        worker.postMessage({
            type: "seal",
            note: note,
            packageData: packageData,
            capsule: {
                noteId: note.id,
                sessionId: sessionId,
                sequence: capsules.length + 1,
                previousHash: previousRoot(),
                title: note.title,
                text: note.text,
                events: events.slice(0),
                deviceTimeMs: deviceTime,
                elapsedStartMs: events.length ? events[0].atMs : elapsedNow(),
                elapsedEndMs: elapsedNow(),
                clockStatus: deviceClockStatus(deviceTime)
            }
        });
    }

    function testTamper() {
        var altered;
        if (!packageData || worker) return;
        altered = JSON.parse(JSON.stringify(packageData));
        altered.note.text += "x";
        workerStatus.innerHTML = "sim";
        proofWord.innerHTML = "TESTANDO";
        proofDetail.innerHTML = "Uma cópia recebeu um caractere extra.";
        worker = new window.Worker("js/authorship-worker.js");
        worker.onmessage = function (message) {
            var response = message.data || {};
            if (response.type === "verified" && response.result && response.result.valid === false) {
                proofWord.innerHTML = "ALTERAÇÃO PEGA";
                proofDetail.innerHTML = "O verificador recusou a cópia modificada: " + response.result.reason + ".";
            } else {
                proofWord.innerHTML = "NÃO PASSOU";
                proofDetail.innerHTML = "O verificador aceitou uma cópia alterada.";
            }
            discardWorker();
        };
        worker.onerror = function () {
            discardWorker();
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A verificação não terminou.";
        };
        worker.postMessage({ type: "verify", packageData: altered, purpose: "tamper" });
    }

    function exportCurrent() {
        if (!packageData || worker || exportButton.disabled) return;
        workerStatus.innerHTML = "sim";
        proofWord.innerHTML = "PREPARANDO";
        proofDetail.innerHTML = "O pacote privado está sendo verificado antes de sair.";
        worker = new window.Worker("js/authorship-worker.js");
        worker.onmessage = function (message) {
            var response = message.data || {};
            if (response.type === "exported" && response.result && response.result.valid) {
                showTransfer("export");
                packageTransfer.value = response.serialized;
                packageTransfer.select();
                offerDownload(response.serialized);
                proofWord.innerHTML = "PACOTE PRONTO";
                proofDetail.innerHTML = "A cópia portátil passou na verificação.";
            } else {
                proofWord.innerHTML = "NÃO PASSOU";
                proofDetail.innerHTML = "O pacote local não pôde ser exportado.";
            }
            discardWorker();
        };
        worker.onerror = function () {
            discardWorker();
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A preparação do pacote não terminou.";
        };
        worker.postMessage({ type: "export", packageData: packageData });
    }

    function copyExport() {
        var copied = false;
        if (transferMode !== "export" || !packageTransfer.value) return;
        packageTransfer.focus();
        packageTransfer.select();
        try { copied = document.execCommand && document.execCommand("copy"); } catch (ignore) {}
        transferInstruction.innerHTML = copied ?
            "Pacote copiado. Cole onde quiser guardar o original." :
            "O pacote está selecionado. Use Copiar no menu do iPad.";
    }

    function beginImport() {
        if (worker) return;
        showTransfer("import");
    }

    function importSerialized() {
        var serialized = packageTransfer.value;
        if (transferMode !== "import" || !serialized || worker) return;
        workerStatus.innerHTML = "sim";
        transferInstruction.innerHTML = "Verificando conteúdo, cápsulas e cadeia...";
        worker = new window.Worker("js/authorship-worker.js");
        worker.onmessage = function (message) {
            var response = message.data || {};
            var imported = response.result;
            var accept = true;
            if (response.type === "imported" && imported && imported.valid && imported.packageData) {
                if ((titleInput.value || textInput.value) && window.confirm) {
                    accept = window.confirm("O pacote é íntegro. Substituir a folha aberta por este original?");
                }
                if (accept) {
                    packageData = imported.packageData;
                    noteId = packageData.note.id || makeId("note");
                    titleInput.value = packageData.note.title || "";
                    textInput.value = packageData.note.text || "";
                    lastTitleLength = titleInput.value.length;
                    lastTextLength = textInput.value.length;
                    events = [];
                    writeJSON(PACKAGE_KEY, packageData);
                    persistDraft();
                    proofWord.innerHTML = "IMPORTADO";
                    proofDetail.innerHTML = "Texto e prova chegaram íntegros.";
                    proofHash.innerHTML = "Raiz: " + imported.rootHash;
                    capsuleCount.innerHTML = String(imported.capsuleCount);
                    eventCount.innerHTML = "0";
                    clockStatus.innerHTML = "aguarda testemunha externa";
                    tamperButton.disabled = false;
                    exportButton.disabled = false;
                    closeTransfer();
                } else {
                    transferInstruction.innerHTML = "Importação cancelada. A folha aberta foi preservada.";
                }
            } else {
                transferInstruction.innerHTML = "RECUSADO: " + (imported && imported.reason ? imported.reason : "pacote inválido") + ".";
            }
            discardWorker();
        };
        worker.onerror = function () {
            discardWorker();
            transferInstruction.innerHTML = "NÃO PASSOU: a verificação não terminou.";
        };
        worker.postMessage({ type: "import", serialized: serialized });
    }

    function resetAll() {
        discardWorker();
        if (sealTimer) window.clearTimeout(sealTimer);
        if (draftTimer) window.clearTimeout(draftTimer);
        removeStored(PACKAGE_KEY);
        removeStored(DRAFT_KEY);
        packageData = null;
        events = [];
        noteId = makeId("note");
        sessionId = makeId("session");
        sessionStart = monotonicNow();
        lastElapsed = 0;
        titleInput.value = "";
        textInput.value = "";
        lastTitleLength = 0;
        lastTextLength = 0;
        capsuleCount.innerHTML = "0";
        eventCount.innerHTML = "0";
        sealTime.innerHTML = "—";
        clockStatus.innerHTML = "não testemunhada";
        proofHash.innerHTML = "Nenhuma raiz criada.";
        tamperButton.disabled = true;
        exportButton.disabled = true;
        closeTransfer();
        showIdle();
        titleInput.focus();
    }

    function restore() {
        var draft = readJSON(DRAFT_KEY);
        var draftDiffers = false;
        packageData = readJSON(PACKAGE_KEY);
        if (draft) {
            noteId = draft.id || noteId;
            titleInput.value = draft.title || "";
            textInput.value = draft.text || "";
        } else if (packageData && packageData.note) {
            noteId = packageData.note.id || noteId;
            titleInput.value = packageData.note.title || "";
            textInput.value = packageData.note.text || "";
        }
        lastTitleLength = titleInput.value.length;
        lastTextLength = textInput.value.length;
        if (packageData && packageData.capsules && packageData.capsules.length) {
            draftDiffers = draft && packageData.note &&
                (draft.title !== packageData.note.title || draft.text !== packageData.note.text);
            capsuleCount.innerHTML = String(packageData.capsules.length);
            proofHash.innerHTML = "Raiz: " + previousRoot();
            tamperButton.disabled = false;
            exportButton.disabled = !!draftDiffers;
            proofWord.innerHTML = draftDiffers ? "RASCUNHO RECUPERADO" : "RECUPERADO";
            proofDetail.innerHTML = draftDiffers ?
                "Há mudanças recuperadas que ainda precisam de um novo selo." :
                "A prova local sobreviveu ao fechamento.";
            clockStatus.innerHTML = "aguarda testemunha externa";
            if (draftDiffers) scheduleSeal();
        } else {
            showIdle();
        }
    }

    titleInput.onpaste = function () { pasteField = "title"; };
    textInput.onpaste = function () { pasteField = "body"; };
    titleInput.oninput = function () {
        recordChange("title", lastTitleLength, titleInput.value.length);
        lastTitleLength = titleInput.value.length;
        handleChange();
    };
    textInput.oninput = function () {
        recordChange("body", lastTextLength, textInput.value.length);
        lastTextLength = textInput.value.length;
        handleChange();
    };
    titleInput.onfocus = function () { record("title-focus", titleInput.value.length, titleInput.value.length, 0, 0); };
    titleInput.onblur = function () { record("title-blur", titleInput.value.length, titleInput.value.length, 0, 0); };
    textInput.onfocus = function () { record("body-focus", textInput.value.length, textInput.value.length, 0, 0); };
    textInput.onblur = function () { record("body-blur", textInput.value.length, textInput.value.length, 0, 0); };
    sealButton.onclick = function () { seal(true); };
    tamperButton.onclick = testTamper;
    exportButton.onclick = exportCurrent;
    importButton.onclick = beginImport;
    copyButton.onclick = copyExport;
    confirmImportButton.onclick = importSerialized;
    closeTransferButton.onclick = closeTransfer;
    resetButton.onclick = resetAll;
    window.addEventListener("pagehide", function () {
        persistDraft();
        discardWorker();
    }, false);

    restore();
}(window, document));
