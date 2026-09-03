(function (window, document) {
    "use strict";

    var PACKAGE_KEY = "encore-authorship-floor-package-v1";
    var DRAFT_KEY = "encore-authorship-floor-draft-v1";
    var PORTABLE_KEY = "encore-authorship-floor-portable-v1";
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
    var qrButton = document.getElementById("qr-button");
    var savedImportButton = document.getElementById("saved-import-button");
    var importButton = document.getElementById("import-button");
    var resetButton = document.getElementById("reset-button");
    var transferPanel = document.getElementById("transfer-panel");
    var transferTitle = document.getElementById("transfer-title");
    var transferInstruction = document.getElementById("transfer-instruction");
    var packageTransfer = document.getElementById("package-transfer");
    var confirmImportButton = document.getElementById("confirm-import-button");
    var downloadLink = document.getElementById("download-link");
    var closeTransferButton = document.getElementById("close-transfer-button");
    var qrPanel = document.getElementById("qr-panel");
    var qrCode = document.getElementById("qr-code");
    var qrStatus = document.getElementById("qr-status");
    var qrDetail = document.getElementById("qr-detail");
    var qrPauseButton = document.getElementById("qr-pause-button");
    var qrBackButton = document.getElementById("qr-back-button");
    var qrNextButton = document.getElementById("qr-next-button");
    var qrCloseButton = document.getElementById("qr-close-button");

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
    var qrWorker = null;
    var qrTimer = null;
    var qrIndex = 0;
    var qrTotal = 0;
    var qrWaiting = false;
    var qrPaused = false;
    var qrReady = false;
    var qrWarmed = false;
    var qrOpen = false;
    var qrPendingExport = false;

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

    function readText(key) {
        try { return window.localStorage.getItem(key) || ""; } catch (ignore) { return ""; }
    }

    function writeText(key, value) {
        try {
            window.localStorage.setItem(key, String(value || ""));
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

    function setWritingLocked(locked) {
        titleInput.disabled = locked;
        textInput.disabled = locked;
        sealButton.disabled = locked;
        tamperButton.disabled = locked || !packageData;
        exportButton.disabled = locked || !packageData ||
            packageData.note.title !== titleInput.value || packageData.note.text !== textInput.value;
        qrButton.disabled = locked || exportButton.disabled;
        savedImportButton.disabled = locked || !readText(PORTABLE_KEY);
        importButton.disabled = locked;
        resetButton.disabled = locked;
    }

    function clearQrDrawing() {
        qrCode.innerHTML = "";
    }

    function stopQrRotation() {
        if (qrTimer) window.clearInterval(qrTimer);
        qrTimer = null;
    }

    function discardQrTransport() {
        stopQrRotation();
        if (qrWorker) {
            try { qrWorker.postMessage({ type: "discard" }); } catch (ignore) {}
            qrWorker.terminate();
        }
        qrWorker = null;
        qrReady = false;
        qrWarmed = false;
        qrPendingExport = false;
        qrWaiting = false;
        qrTotal = 0;
        if (!worker) workerStatus.innerHTML = "não";
    }

    function closeQr() {
        stopQrRotation();
        qrOpen = false;
        qrWaiting = false;
        qrPaused = false;
        qrIndex = 0;
        clearQrDrawing();
        qrPanel.style.display = "none";
        qrPauseButton.innerHTML = "Pausar";
        qrPauseButton.disabled = false;
        qrBackButton.disabled = false;
        qrNextButton.disabled = false;
        setWritingLocked(false);
    }

    function failQr(message) {
        var exporting = qrPendingExport;
        discardQrTransport();
        qrWaiting = false;
        qrPaused = true;
        if (exporting) {
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A cópia preparada não pôde ser entregue.";
        }
        if (qrOpen) {
            qrStatus.innerHTML = "NÃO PASSOU";
            qrDetail.innerHTML = message;
            qrPauseButton.disabled = true;
            qrBackButton.disabled = true;
            qrNextButton.disabled = true;
        }
    }

    function requestQrFrame(index) {
        if (!qrWorker || qrWaiting || !qrTotal) return;
        qrWaiting = true;
        qrStatus.innerHTML = "ABRINDO BLOCO " + String(index + 1);
        qrWorker.postMessage({ type: "frame", index: index });
    }

    function startQrRotation() {
        if (qrTimer) window.clearInterval(qrTimer);
        qrTimer = window.setInterval(function () {
            if (!qrPaused && !qrWaiting && qrTotal) requestQrFrame((qrIndex + 1) % qrTotal);
        }, 1000);
    }

    function drawQrMatrix(response) {
        var canvases = qrCode.getElementsByTagName("canvas");
        var canvas = canvases.length ? canvases[0] : document.createElement("canvas");
        var context;
        var count = Number(response.size || 0);
        var quiet = 4;
        var side = 300;
        var scale;
        var offset;
        var row;
        var y;
        var x;
        if (!count || !response.rows || response.rows.length !== count) throw new Error("matriz-inválida");
        if (canvas.width !== side) canvas.width = side;
        if (canvas.height !== side) canvas.height = side;
        if (!canvases.length) qrCode.appendChild(canvas);
        canvas.setAttribute("aria-label", "Bloco QR " + String(response.number) + " de " + String(response.total));
        context = canvas.getContext("2d");
        scale = Math.floor(side / (count + quiet * 2));
        offset = Math.floor((side - count * scale) / 2);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, side, side);
        context.fillStyle = "#211d18";
        context.beginPath();
        for (y = 0; y < count; y += 1) {
            row = response.rows[y];
            for (x = 0; x < count; x += 1) {
                if (row.charAt(x) === "1") context.rect(offset + x * scale, offset + y * scale, scale, scale);
            }
        }
        context.fill();
    }

    function finishPreparedExport(serialized) {
        if (writeText(PORTABLE_KEY, serialized)) {
            showTransfer("export");
            savedImportButton.disabled = false;
            offerDownload(serialized);
            proofWord.innerHTML = "CÓPIA GUARDADA";
            proofDetail.innerHTML = "O original preparado em segundo plano ficou separado da folha aberta.";
        } else {
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "O aparelho não conseguiu guardar outra cópia local.";
        }
    }

    function prepareQrTransport() {
        if (!packageData || worker || !window.Worker) return;
        discardQrTransport();
        workerStatus.innerHTML = "preparando QR";
        qrWorker = new window.Worker("js/scrvrl-transport-worker.js");
        qrWorker.onerror = function () {
            failQr("A cápsula de transporte encontrou um erro.");
        };
        qrWorker.onmessage = function (message) {
            var response = message.data || {};
            if (response.type === "ready") {
                qrReady = true;
                qrTotal = response.total;
                if (qrOpen) {
                    qrDetail.innerHTML = "Identidade " + response.id + ". Uma volta completa tem " + qrTotal + " blocos.";
                    requestQrFrame(0);
                }
                if (qrPendingExport) qrWorker.postMessage({ type: "export" });
            } else if (response.type === "warmed") {
                qrWarmed = true;
                workerStatus.innerHTML = "QR pronto";
            } else if (response.type === "matrix") {
                qrIndex = response.index;
                qrStatus.innerHTML = "MOSTRANDO BLOCO " + response.number;
                window.setTimeout(function () {
                    if (!qrWorker) return;
                    try {
                        drawQrMatrix(response);
                        qrStatus.innerHTML = "BLOCO " + response.number + " DE " + response.total;
                        qrWaiting = false;
                        if (qrOpen && !qrTimer) startQrRotation();
                    } catch (error) {
                        failQr("O desenho do QR não terminou.");
                    }
                }, 20);
            } else if (response.type === "exported") {
                qrPendingExport = false;
                finishPreparedExport(response.serialized);
                workerStatus.innerHTML = qrWarmed ? "QR pronto" : "preparando QR";
            } else if (response.type === "error") {
                failQr(response.message || "O transporte não foi preparado.");
            }
        };
        qrWorker.postMessage({ type: "prepare", packageData: packageData, chunkSize: 72 });
    }

    function beginQr() {
        if (!packageData || worker || qrButton.disabled || !window.Worker) return;
        closeTransfer();
        setWritingLocked(true);
        qrOpen = true;
        qrPanel.style.display = "block";
        qrPauseButton.disabled = false;
        qrBackButton.disabled = false;
        qrNextButton.disabled = false;
        qrStatus.innerHTML = qrWarmed ? "ABRINDO" : "PREPARANDO";
        qrDetail.innerHTML = qrWarmed ? "O primeiro bloco já estava pronto." : "A cápsula está preparando o primeiro bloco.";
        if (!qrWorker) prepareQrTransport();
        if (qrReady && !qrWaiting) requestQrFrame(0);
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
        packageTransfer.readOnly = false;
        packageTransfer.style.display = mode === "export" ? "none" : "block";
        confirmImportButton.style.display = mode === "import" ? "inline-block" : "none";
        if (mode === "export") {
            transferTitle.innerHTML = "Cópia privada guardada";
            transferInstruction.innerHTML = "Ela ficou em um compartimento separado neste aparelho. Recomeçar não apaga essa cópia.";
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
        if (/iP(?:ad|hone|od).*OS 9_/i.test(window.navigator.userAgent || "")) return;
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
        discardQrTransport();
        exportButton.disabled = true;
        qrButton.disabled = true;
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
            var prepareAfter = false;
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
                    qrButton.disabled = false;
                    prepareAfter = true;
                }
            } else {
                proofWord.innerHTML = "NÃO PASSOU";
                proofDetail.innerHTML = response.message || "A prova não foi confirmada.";
            }
            discardWorker();
            activeSnapshot = null;
            if (prepareAfter) prepareQrTransport();
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
        discardQrTransport();
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
            prepareQrTransport();
        };
        worker.onerror = function () {
            discardWorker();
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A verificação não terminou.";
            prepareQrTransport();
        };
        worker.postMessage({ type: "verify", packageData: altered, purpose: "tamper" });
    }

    function exportCurrent() {
        var prepared = qrWarmed;
        if (!packageData || worker || exportButton.disabled) return;
        if (!qrWorker) prepareQrTransport();
        qrPendingExport = true;
        proofWord.innerHTML = prepared ? "ENTREGANDO" : "PREPARANDO";
        proofDetail.innerHTML = prepared ?
            "A cópia já estava pronta em segundo plano." :
            "A cópia será guardada assim que o preparo terminar.";
        if (qrReady && qrWorker) qrWorker.postMessage({ type: "export" });
    }

    function beginImport() {
        if (worker) return;
        showTransfer("import");
    }

    function importPackageText(serialized, source) {
        if (!serialized || worker) return;
        discardQrTransport();
        workerStatus.innerHTML = "sim";
        if (source === "colado") transferInstruction.innerHTML = "Verificando conteúdo, cápsulas e cadeia...";
        proofWord.innerHTML = "VERIFICANDO";
        proofDetail.innerHTML = source === "guardado" ?
            "Abrindo a cópia separada neste aparelho." :
            "Conferindo o pacote recebido.";
        worker = new window.Worker("js/authorship-worker.js");
        worker.onmessage = function (message) {
            var response = message.data || {};
            var imported = response.result;
            var accept = true;
            var prepareAfter = false;
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
                    qrButton.disabled = false;
                    closeTransfer();
                    prepareAfter = true;
                } else {
                    if (source === "colado") transferInstruction.innerHTML = "Importação cancelada. A folha aberta foi preservada.";
                    proofWord.innerHTML = "CANCELADO";
                    proofDetail.innerHTML = "A folha aberta foi preservada.";
                }
            } else {
                proofWord.innerHTML = "RECUSADO";
                proofDetail.innerHTML = "O pacote não passou: " + (imported && imported.reason ? imported.reason : "pacote inválido") + ".";
                if (source === "colado") transferInstruction.innerHTML = proofDetail.innerHTML;
            }
            discardWorker();
            if (prepareAfter) prepareQrTransport();
        };
        worker.onerror = function () {
            discardWorker();
            proofWord.innerHTML = "NÃO PASSOU";
            proofDetail.innerHTML = "A verificação do pacote não terminou.";
            if (source === "colado") transferInstruction.innerHTML = proofDetail.innerHTML;
        };
        worker.postMessage({ type: "import", serialized: serialized });
    }

    function importSerialized() {
        if (transferMode !== "import") return;
        importPackageText(packageTransfer.value, "colado");
    }

    function importSaved() {
        var serialized = readText(PORTABLE_KEY);
        if (!serialized) {
            savedImportButton.disabled = true;
            proofWord.innerHTML = "SEM CÓPIA";
            proofDetail.innerHTML = "Ainda não há um original guardado neste compartimento.";
            return;
        }
        importPackageText(serialized, "guardado");
    }

    function resetAll() {
        discardWorker();
        discardQrTransport();
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
        qrButton.disabled = true;
        savedImportButton.disabled = !readText(PORTABLE_KEY);
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
            qrButton.disabled = !!draftDiffers;
            proofWord.innerHTML = draftDiffers ? "RASCUNHO RECUPERADO" : "RECUPERADO";
            proofDetail.innerHTML = draftDiffers ?
                "Há mudanças recuperadas que ainda precisam de um novo selo." :
                "A prova local sobreviveu ao fechamento.";
            clockStatus.innerHTML = "aguarda testemunha externa";
            if (draftDiffers) scheduleSeal();
            else prepareQrTransport();
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
    qrButton.onclick = beginQr;
    savedImportButton.onclick = importSaved;
    importButton.onclick = beginImport;
    confirmImportButton.onclick = importSerialized;
    closeTransferButton.onclick = closeTransfer;
    qrPauseButton.onclick = function () {
        qrPaused = !qrPaused;
        qrPauseButton.innerHTML = qrPaused ? "Retomar" : "Pausar";
        if (!qrPaused) requestQrFrame((qrIndex + 1) % qrTotal);
    };
    qrBackButton.onclick = function () {
        qrPaused = true;
        qrPauseButton.innerHTML = "Retomar";
        requestQrFrame((qrIndex + qrTotal - 1) % qrTotal);
    };
    qrNextButton.onclick = function () {
        qrPaused = true;
        qrPauseButton.innerHTML = "Retomar";
        requestQrFrame((qrIndex + 1) % qrTotal);
    };
    qrCloseButton.onclick = closeQr;
    resetButton.onclick = resetAll;
    window.addEventListener("pagehide", function () {
        persistDraft();
        discardWorker();
        closeQr();
        discardQrTransport();
    }, false);

    savedImportButton.disabled = !readText(PORTABLE_KEY);
    restore();
}(window, document));
