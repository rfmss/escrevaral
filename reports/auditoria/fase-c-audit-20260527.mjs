import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";

const BASE_URL = process.env.AUDIT_URL || "http://127.0.0.1:8800/index.html";
const OUT_DIR = new URL("./fase-c-evidencias-20260527/", import.meta.url);
const DEBUG_PORT = Number(process.env.AUDIT_DEBUG_PORT || 9800 + Math.floor(Math.random() * 400));
const USER_DATA_DIR = process.env.AUDIT_USER_DATA_DIR || `/tmp/escrevaral-fase-c-chrome-${Date.now()}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("\\", "\\\\").replaceAll("`", "\\`");
}

function jsLiteral(value) {
  return JSON.stringify(value);
}

function makeState({ id = "fase-c", title = "Fase C", text = "Texto inicial da fase C." } = {}) {
  return {
    activeId: id,
    manuscripts: [{
      id,
      title,
      type: "manuscrito",
      folder: "Auditoria",
      kind: "Manuscrito em teste",
      status: "Em escrita",
      chapter: "Persistência",
      progress: 3,
      updatedAt: new Date("2026-05-27T12:00:00-03:00").toISOString(),
      description: "Estado temporario para auditoria Fase C.",
      text,
    }],
    focus: {},
    lexical: {},
    template: {},
    archive: {},
    layout: { leftCollapsed: false, rightCollapsed: false, templateCollapsed: false, templateSide: "left" },
    appearance: {},
    proofs: {},
    versions: {},
    proofValidations: {},
  };
}

async function waitForJson(url, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await delay(700);
  }
  throw new Error(`Tempo esgotado esperando ${url}`);
}

class SimpleWebSocket {
  constructor(wsUrl) {
    this.url = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshakeDone = false;
    this.messageHandlers = [];
    this.fragment = "";
  }

  on(event, handler) {
    if (event === "message") this.messageHandlers.push(handler);
  }

  open() {
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString("base64");
      this.socket = net.createConnection({ host: this.url.hostname, port: Number(this.url.port || 80) }, () => {
        this.socket.write([
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
          `Host: ${this.url.host}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\r\n",
        ].join("\r\n"));
      });
      this.socket.on("data", (chunk) => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        if (!this.handshakeDone) {
          const marker = this.buffer.indexOf("\r\n\r\n");
          if (marker === -1) return;
          const header = this.buffer.slice(0, marker).toString("utf8");
          if (!header.includes("101")) {
            reject(new Error(`Handshake WebSocket falhou: ${header}`));
            return;
          }
          this.handshakeDone = true;
          this.buffer = this.buffer.slice(marker + 4);
          resolve();
        }
        this.readFrames();
      });
      this.socket.on("error", reject);
    });
  }

  readFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const fin = Boolean(first & 0x80);
      const opcode = first & 0x0f;
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        length = Number(this.buffer.readBigUInt64BE(offset));
        offset += 8;
      }
      let mask;
      if (masked) {
        if (this.buffer.length < offset + 4) return;
        mask = this.buffer.slice(offset, offset + 4);
        offset += 4;
      }
      if (this.buffer.length < offset + length) return;
      let payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);
      if (masked) payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      if (opcode === 8) return this.close();
      if (opcode === 1 || opcode === 0) {
        this.fragment += payload.toString("utf8");
        if (fin) {
          const text = this.fragment;
          this.fragment = "";
          this.messageHandlers.forEach((handler) => handler(text));
        }
      }
    }
  }

  send(text) {
    const payload = Buffer.from(text);
    const mask = crypto.randomBytes(4);
    let header;
    if (payload.length < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | payload.length;
    } else if (payload.length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(payload.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    header[0] = 0x81;
    const masked = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  close() {
    this.socket?.end();
  }
}

class CdpClient {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.ws = new SimpleWebSocket(wsUrl);
    this.ws.on("message", (data) => {
      const message = JSON.parse(data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject, timer } = this.pending.get(message.id);
        clearTimeout(timer);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) {
        this.events.push(message);
      }
    });
  }

  async open() {
    await this.ws.open();
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout CDP em ${method}`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timer });
    });
  }

  close() {
    this.ws.close();
  }
}

async function bootBrowser() {
  const stderr = [];
  const chrome = spawn("chromium", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--use-fake-ui-for-media-stream",
    `--user-data-dir=${USER_DATA_DIR}`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  chrome.stderr.on("data", (chunk) => stderr.push(chunk.toString()));
  const version = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`).catch((error) => {
    console.error(stderr.join("").slice(-4000));
    throw error;
  });
  return { chrome, browserWsUrl: version.webSocketDebuggerUrl };
}

async function newPage(browserWsUrl) {
  const browser = new CdpClient(browserWsUrl);
  await browser.open();
  const target = await browser.send("Target.createTarget", { url: "about:blank" });
  const pages = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  browser.close();
  const page = pages.find((item) => item.id === target.targetId) || pages[0];
  const cdp = new CdpClient(page.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Log.enable");
  return cdp;
}

async function navigate(cdp, hash = "editor") {
  cdp.events.length = 0;
  const separator = BASE_URL.includes("?") ? "&" : "?";
  await cdp.send("Page.navigate", { url: `${BASE_URL}${separator}faseC=${Date.now()}#${hash}` });
  const started = Date.now();
  while (!cdp.events.some((event) => event.method === "Page.loadEventFired") && Date.now() - started < 10000) {
    await delay(80);
  }
  await delay(900);
}

async function evaluate(cdp, expression, awaitPromise = true) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Erro em Runtime.evaluate");
  }
  return result.result.value;
}

async function setStorage(cdp, state, extra = {}) {
  await evaluate(cdp, `
    localStorage.clear();
    localStorage.setItem("vrda-first-visit", ${extra.firstVisit === false ? "''" : "'1'"});
    ${extra.dark ? `localStorage.setItem("vereda:dark-mode", "on");` : `localStorage.setItem("vereda:dark-mode", "off");`}
    ${extra.pageMode ? `localStorage.setItem("vrda-editor-view", "pages");` : `localStorage.setItem("vrda-editor-view", "flow");`}
    localStorage.setItem("vereda.manuscripts.v1", \`${safeJson(state)}\`);
    true;
  `);
}

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 820,
  });
}

async function pageSnapshot(cdp) {
  return evaluate(cdp, `(() => {
    const scrolling = document.scrollingElement;
    const active = getActiveManuscript?.();
    return {
      view: document.querySelector(".app-shell")?.dataset.view || "",
      theme: document.documentElement.dataset.theme || "",
      overflow: scrolling.scrollWidth > scrolling.clientWidth,
      scrollWidth: scrolling.scrollWidth,
      clientWidth: scrolling.clientWidth,
      title: document.querySelector(".title-input")?.value || "",
      text: document.querySelector(".writing-area")?.innerText || "",
      activeTitle: active?.title || "",
      activeText: active?.text || "",
      saveStatus: document.querySelector("[data-save-status]")?.textContent || "",
      saveNotice: document.getElementById("save-hint-toast")?.innerText?.replace(/\\s+/g, " ").trim() || "",
      welcomeHidden: document.querySelector("[data-welcome-overlay]")?.hidden,
      createHidden: document.querySelector("[data-create-note-overlay]")?.hidden,
      editorMode: document.querySelector(".writing-area")?.dataset.viewMode || "",
      pageCount: document.querySelector("[data-paged-editor]")?.children.length || 0,
      focusedLabel: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.replace(/\\s+/g, " ").trim().slice(0, 80) || document.activeElement?.tagName || "",
    };
  })()`);
}

async function typeIntoEditor(cdp, text) {
  await evaluate(cdp, `
    const area = document.querySelector(".writing-area");
    area.focus();
    area.innerText = ${jsLiteral(text)};
    area.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "x" }));
    true;
  `);
  await delay(850);
}

async function pressKey(cdp, key, code = key) {
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
  await delay(200);
}

async function capture(cdp, name) {
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(new URL(`${name}.png`, OUT_DIR), Buffer.from(shot.data, "base64"));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const { chrome, browserWsUrl } = await bootBrowser();
  const result = {
    createdAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    checks: {},
    consoleEvents: [],
  };

  const cdp = await newPage(browserWsUrl);
  try {
    await setViewport(cdp, 390, 844);
    await navigate(cdp, "editor");
    await setStorage(cdp, makeState({ text: "Texto antes da prova." }));
    await navigate(cdp, "editor");
    await typeIntoEditor(cdp, "Texto digitado depois da correcao TDZ.");
    result.checks.proofTyping = {
      snapshot: await pageSnapshot(cdp),
      fatalEvents: cdp.events.filter((event) => {
        const level = event.params?.entry?.level || event.params?.type;
        return ["error", "exception"].includes(level);
      }).map((event) => event.params?.entry?.text || event.params?.args?.map((arg) => arg.value).join(" ")),
    };

    await evaluate(cdp, `(() => {
      const area = document.querySelector(".writing-area");
      area.focus();
      const event = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(window, "clipboardData", {
        configurable: true,
        value: {
          getData(type) {
            if (type === "text/plain") return "Texto rico colado";
            if (type === "text/html") return "<p><strong>Texto rico</strong> <em>colado</em></p>";
            return "";
          }
        }
      });
      area.dispatchEvent(event);
      delete window.clipboardData;
      return true;
    })()`);
    await delay(150);
    result.checks.richPasteNotice = await pageSnapshot(cdp);

    await setViewport(cdp, 320, 700);
    const longWord = "palavra".repeat(70);
    await setStorage(cdp, makeState({
      title: "Titulo muito muito muito muito muito longo para testar a confianca visual da folha",
      text: `Inicio com palavra sem espacos: ${longWord}\n\nFim.`,
    }));
    await navigate(cdp, "editor");
    result.checks.longWordMobile = await pageSnapshot(cdp);
    await capture(cdp, "mobile-320-long-word");

    await setStorage(cdp, makeState({
      title: "Modo pagina estreito",
      text: Array.from({ length: 18 }, (_, i) => `Paragrafo ${i + 1}. Esta frase existe para gerar paginas e testar navegacao sem rolagem horizontal.`).join("\n\n"),
    }), { pageMode: true });
    await navigate(cdp, "editor");
    result.checks.pageModeMobile = await pageSnapshot(cdp);
    await capture(cdp, "mobile-320-page-mode");
    result.checks.pageModeExit = {};
    result.checks.pageModeExit.beforeEscape = await evaluate(cdp, `(() => {
      const btn = document.querySelector("[data-action='toggle-page-view']");
      return {
        mode: document.querySelector(".writing-area")?.dataset.viewMode || "",
        label: btn?.innerText?.replace(/\\s+/g, " ").trim() || "",
        ariaPressed: btn?.getAttribute("aria-pressed") || "",
        ariaLabel: btn?.getAttribute("aria-label") || "",
      };
    })()`);
    await pressKey(cdp, "Escape");
    result.checks.pageModeExit.afterEscape = await evaluate(cdp, `(() => {
      const btn = document.querySelector("[data-action='toggle-page-view']");
      return {
        mode: document.querySelector(".writing-area")?.dataset.viewMode || "",
        label: btn?.innerText?.replace(/\\s+/g, " ").trim() || "",
        ariaPressed: btn?.getAttribute("aria-pressed") || "",
        ariaLabel: btn?.getAttribute("aria-label") || "",
      };
    })()`);
    result.checks.pageModeExit.afterToggleRoundtrip = await evaluate(cdp, `(() => {
      const btn = document.querySelector("[data-action='toggle-page-view']");
      btn?.click();
      const afterOn = {
        mode: document.querySelector(".writing-area")?.dataset.viewMode || "",
        label: btn?.innerText?.replace(/\\s+/g, " ").trim() || "",
        ariaPressed: btn?.getAttribute("aria-pressed") || "",
        ariaLabel: btn?.getAttribute("aria-label") || "",
      };
      btn?.click();
      const afterOff = {
        mode: document.querySelector(".writing-area")?.dataset.viewMode || "",
        label: btn?.innerText?.replace(/\\s+/g, " ").trim() || "",
        ariaPressed: btn?.getAttribute("aria-pressed") || "",
        ariaLabel: btn?.getAttribute("aria-label") || "",
      };
      return { afterOn, afterOff };
    })()`);
    result.checks.materialIcons = await evaluate(cdp, `(() => {
      const icons = [...document.querySelectorAll(".material-symbols-outlined")];
      return {
        total: icons.length,
        missingAriaHidden: icons.filter((icon) => icon.getAttribute("aria-hidden") !== "true").length,
        samples: icons.slice(0, 8).map((icon) => ({
          text: icon.textContent.trim(),
          ariaHidden: icon.getAttribute("aria-hidden"),
        })),
      };
    })()`);

    await setStorage(cdp, makeState({ title: "Tema escuro persiste", text: "Teste de tema em reload." }), { dark: true });
    await navigate(cdp, "editor");
    const beforeReloadTheme = await pageSnapshot(cdp);
    await navigate(cdp, "editor");
    result.checks.darkReload = { beforeReloadTheme, afterReload: await pageSnapshot(cdp) };

    await setStorage(cdp, makeState({ title: "Persistencia", text: "Antes do reload." }));
    await navigate(cdp, "editor");
    await typeIntoEditor(cdp, "Texto salvo antes do reload automatico.");
    await navigate(cdp, "editor");
    result.checks.reloadPersistence = await pageSnapshot(cdp);

    await setStorage(cdp, { activeId: null, manuscripts: [], focus: {}, lexical: {}, template: {}, archive: {}, layout: {}, appearance: {}, proofs: {}, versions: {}, proofValidations: {} }, { firstVisit: false });
    await navigate(cdp, "biblioteca");
    result.checks.emptyFirstVisitBiblioteca = await pageSnapshot(cdp);
    await capture(cdp, "empty-first-visit-biblioteca");

    await navigate(cdp, "academia");
    await evaluate(cdp, `document.getElementById("at-voice").checked = true; true;`);
    result.checks.microphoneDenied = {
      applicable: Boolean(await evaluate(cdp, `Boolean(navigator.mediaDevices?.getUserMedia) && /microfone|gravar|ditado/i.test(document.body.innerText)`)),
      note: "Espelho de Voz atual e uma analise textual local; nao ha fluxo de microfone/getUserMedia na interface testada.",
      snapshot: await pageSnapshot(cdp),
    };

    await evaluate(cdp, `
      document.getElementById("at-rimalab").checked = true;
      const finder = document.querySelector("[data-rimalab-finder]");
      finder.value = "amor";
      finder.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "amor" }));
      true;
    `);
    await delay(600);
    result.checks.rimalabAmor = await evaluate(cdp, `(() => {
      const results = document.querySelector("[data-rimalab-finder-results]");
      return {
        text: results?.innerText || "",
        chipCount: results?.querySelectorAll(".rimalab-finder-chip").length || 0,
        empty: Boolean(results?.querySelector(".rimalab-finder-empty")),
      };
    })()`);

    const tabA = cdp;
    const tabB = await newPage(browserWsUrl);
    await setViewport(tabA, 390, 844);
    await setViewport(tabB, 390, 844);
    await setStorage(tabA, makeState({ id: "multi-tab", title: "Multiplas abas", text: "Base." }));
    await navigate(tabA, "editor");
    await navigate(tabB, "editor");
    await typeIntoEditor(tabA, "Alteracao feita na aba A.");
    await typeIntoEditor(tabB, "Alteracao feita na aba B com estado antigo.");
    await navigate(tabA, "editor");
    result.checks.multiTabOverwrite = {
      final: await pageSnapshot(tabA),
      expectation: "Se a aba B persistir estado antigo, a alteracao da aba A desaparece.",
    };
    tabB.close();

    result.consoleEvents = cdp.events.filter((event) => {
      const level = event.params?.entry?.level || event.params?.type;
      return ["error", "exception", "warning"].includes(level);
    });

    await writeFile(new URL("fase-c-results.json", OUT_DIR), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      proofFatalEvents: result.checks.proofTyping.fatalEvents.length,
      longWordOverflow: result.checks.longWordMobile.overflow,
      pageModeOverflow: result.checks.pageModeMobile.overflow,
      darkReloadTheme: result.checks.darkReload.afterReload.theme,
      reloadPersisted: result.checks.reloadPersistence.activeText.includes("reload automatico"),
      emptyWelcomeHidden: result.checks.emptyFirstVisitBiblioteca.welcomeHidden,
      microphoneApplicable: result.checks.microphoneDenied.applicable,
      multiTabFinalText: result.checks.multiTabOverwrite.final.activeText,
      out: OUT_DIR.pathname,
    }, null, 2));
  } finally {
    cdp.close();
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
