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
    var resetButton = document.getElementById("reset-button");

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
                tamperButton.disabled = false;
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
    resetButton.onclick = resetAll;
    window.addEventListener("pagehide", function () {
        persistDraft();
        discardWorker();
    }, false);

    restore();
}(window, document));
