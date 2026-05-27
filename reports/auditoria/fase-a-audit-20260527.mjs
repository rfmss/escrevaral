import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";

const BASE_URL = process.env.AUDIT_URL || "http://127.0.0.1:8800/index.html";
const OUT_DIR = new URL("./fase-a-evidencias-20260527/", import.meta.url);
const DEBUG_PORT = Number(process.env.AUDIT_DEBUG_PORT || 9334 + Math.floor(Math.random() * 400));
const USER_DATA_DIR = process.env.AUDIT_USER_DATA_DIR || `/tmp/escrevaral-fase-a-chrome-${Date.now()}`;

const viewports = [
  { name: "desktop-1366x900", width: 1366, height: 900 },
  { name: "notebook-1024x768", width: 1024, height: 768 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-grande-430x932", width: 430, height: 932 },
  { name: "mobile-medio-390x844", width: 390, height: 844 },
  { name: "mobile-estreito-320x700", width: 320, height: 700 },
];

const themes = [
  { name: "alvorada", dataset: "", darkStorage: "off" },
  { name: "scriptorium", dataset: "scriptorium", darkStorage: "on" },
  { name: "cerrado-dark", dataset: "cerrado-dark", darkStorage: "off" },
  { name: "mata-dark", dataset: "mata-dark", darkStorage: "off" },
];

const views = ["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"];

const sampleState = {
  activeId: "auditoria-fase-a",
  manuscripts: [
    {
      id: "auditoria-fase-a",
      title: "Auditoria Fase A",
      type: "manuscrito",
      folder: "Auditoria",
      kind: "Manuscrito em teste",
      status: "Em escrita",
      chapter: "Primeira página",
      progress: 18,
      updatedAt: new Date("2026-05-27T12:00:00-03:00").toISOString(),
      description: "Manuscrito temporario para auditoria mecanica.",
      text: "A casa acordou cedo. Na mesa, o caderno abriu espaco para uma frase simples.\n\nA escritora respirou, revisou uma palavra e continuou.",
    },
  ],
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function auditUrl(hash = "editor") {
  const separator = BASE_URL.includes("?") ? "&" : "?";
  return `${BASE_URL}${separator}audit=${Date.now()}#${hash}`;
}

async function waitForJson(url, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await delay(150);
  }
  throw new Error(`Tempo esgotado esperando ${url}`);
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
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      if (message.method) this.events.push(message);
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
      this.pending.set(id, { resolve, reject });
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  close() {
    this.ws.close();
  }
}

class SimpleWebSocket {
  constructor(wsUrl) {
    this.url = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshakeDone = false;
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.fragment = "";
  }

  on(event, handler) {
    if (event === "message") this.messageHandlers.push(handler);
    if (event === "error") this.errorHandlers.push(handler);
  }

  open() {
    return new Promise((resolve, reject) => {
      const port = Number(this.url.port || 80);
      const key = crypto.randomBytes(16).toString("base64");
      this.socket = net.createConnection({ host: this.url.hostname, port }, () => {
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
      this.socket.on("error", (error) => {
        this.errorHandlers.forEach((handler) => handler(error));
        reject(error);
      });
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
      if (masked) {
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }
      if (opcode === 8) {
        this.close();
        return;
      }
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

async function evaluate(cdp, expression, awaitPromise = true) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Erro em Runtime.evaluate");
  }
  return result.result.value;
}

async function press(cdp, key, code = key) {
  const keyMap = {
    Tab: { windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 },
    Enter: { windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" },
    Escape: { windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 },
  };
  const info = keyMap[key] || {};
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, ...info });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, ...info });
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
    `--user-data-dir=${USER_DATA_DIR}`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  chrome.stderr.on("data", (chunk) => stderr.push(chunk.toString()));
  chrome.on("exit", (code, signal) => {
    if (code !== 0) {
      console.error(`Chromium saiu cedo: code=${code} signal=${signal}`);
      console.error(stderr.join("").slice(-4000));
    }
  });

  let version;
  try {
    version = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`, 15000);
  } catch (error) {
    console.error(stderr.join("").slice(-4000));
    throw error;
  }
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
  await cdp.send("DOM.enable");
  await cdp.send("Log.enable");
  return cdp;
}

async function navigate(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const loaded = cdp.events.some((event) => event.method === "Page.loadEventFired");
      if (loaded || Date.now() - started > 8000) {
        clearInterval(timer);
        cdp.events = cdp.events.filter((event) => event.method !== "Page.loadEventFired");
        resolve();
      }
    }, 80);
  });
  await delay(900);
}

async function prepareStorage(cdp, theme) {
  const payload = JSON.stringify(sampleState).replaceAll("\\", "\\\\").replaceAll("`", "\\`");
  await evaluate(cdp, `
    localStorage.clear();
    localStorage.setItem("vrda-first-visit", "1");
    localStorage.setItem("vereda.manuscripts.v1", \`${payload}\`);
    localStorage.setItem("vereda:dark-mode", "${theme.darkStorage}");
    localStorage.setItem("vrda-editor-view", "flow");
    true;
  `);
}

async function inspectPage(cdp, viewport, theme, view) {
  await evaluate(cdp, `document.documentElement.dataset.theme = "${theme.dataset}"; true;`);
  await evaluate(cdp, `window.location.hash = "#${view}"; window.dispatchEvent(new HashChangeEvent("hashchange")); true;`);
  await delay(350);
  await evaluate(cdp, `if (typeof setView === "function") setView("${view}", { updateRoute: true, routeMode: "replace" }); true;`);
  await delay(450);

  return evaluate(cdp, `(() => {
    const scrolling = document.scrollingElement;
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const labelFor = (el) => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return aria.trim();
      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.innerText || "").join(" ").trim();
        if (text) return text;
      }
      const title = el.getAttribute("title");
      if (title && title.trim()) return title.trim();
      const text = (el.innerText || el.textContent || el.value || "").replace(/\\s+/g, " ").trim();
      if (text) return text;
      const img = el.querySelector("img[alt]");
      if (img?.alt?.trim()) return img.alt.trim();
      return "";
    };
    const buttonProblems = [...document.querySelectorAll("button, [role='button']")]
      .filter(visible)
      .filter(el => !labelFor(el))
      .slice(0, 40)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        classes: el.className,
        action: el.getAttribute("data-action") || "",
        html: el.outerHTML.slice(0, 180),
      }));
    const ariaProblems = [...document.querySelectorAll("[aria-expanded], [aria-pressed]")]
      .filter(visible)
      .map(el => {
        const expanded = el.getAttribute("aria-expanded");
        const pressed = el.getAttribute("aria-pressed");
        const badExpanded = expanded !== null && !["true", "false"].includes(expanded);
        const badPressed = pressed !== null && !["true", "false", "mixed"].includes(pressed);
        const visualActive = el.classList.contains("is-active") || el.classList.contains("is-open");
        const possibleMismatch = pressed === "false" && visualActive;
        if (!badExpanded && !badPressed && !possibleMismatch) return null;
        return {
          label: labelFor(el),
          action: el.getAttribute("data-action") || "",
          expanded,
          pressed,
          classes: el.className,
          badExpanded,
          badPressed,
          possibleMismatch,
        };
      })
      .filter(Boolean)
      .slice(0, 40);
    const overflowing = [...document.body.querySelectorAll("*")]
      .filter(visible)
      .map(el => {
        const rect = el.getBoundingClientRect();
        const overRight = rect.right - window.innerWidth;
        const overLeft = -rect.left;
        const overWidth = rect.width - window.innerWidth;
        if (overRight > 1 || overLeft > 1 || overWidth > 1) {
          return {
            tag: el.tagName.toLowerCase(),
            classes: typeof el.className === "string" ? el.className : "",
            id: el.id || "",
            action: el.getAttribute("data-action") || "",
            text: (el.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 80),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            overRight: Math.round(overRight),
            overLeft: Math.round(overLeft),
            overWidth: Math.round(overWidth),
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 50);
    return {
      viewport: "${viewport.name}",
      theme: "${theme.name}",
      view: "${view}",
      title: document.title,
      globalOverflow: scrolling.scrollWidth > scrolling.clientWidth,
      scrollWidth: scrolling.scrollWidth,
      clientWidth: scrolling.clientWidth,
      bodyClass: document.body.className,
      shellView: document.querySelector(".app-shell")?.dataset.view || "",
      activeElement: document.activeElement?.outerHTML?.slice(0, 180) || "",
      buttonProblems,
      ariaProblems,
      overflowing,
      visibleDialogs: [...document.querySelectorAll("[role='dialog']")]
        .filter(visible)
        .map(el => ({
          id: el.id || "",
          classes: el.className,
          label: el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "",
          text: (el.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 120),
        })),
    };
  })()`);
}

async function runKeyboardChecks(cdp, viewport, theme) {
  await evaluate(cdp, `document.documentElement.dataset.theme = "${theme.dataset}"; if (typeof setView === "function") setView("editor", { updateRoute: true, routeMode: "replace" }); true;`);
  await delay(300);
  await evaluate(cdp, `document.querySelector('[data-action="open-create-note"]')?.focus(); true;`);
  const beforeEnter = await evaluate(cdp, `document.activeElement?.getAttribute("data-action") || document.activeElement?.outerHTML?.slice(0, 80) || ""`);
  await press(cdp, "Enter");
  await delay(500);
  const createOpen = await evaluate(cdp, `!document.querySelector("[data-create-note-overlay]")?.hidden`);
  const focusAfterOpen = await evaluate(cdp, `document.activeElement?.outerHTML?.slice(0, 220) || ""`);
  const tabStops = [];
  for (let i = 0; i < 8; i++) {
    await press(cdp, "Tab");
    await delay(80);
    tabStops.push(await evaluate(cdp, `(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName || "",
        action: el?.getAttribute("data-action") || "",
        label: el?.getAttribute("aria-label") || el?.innerText?.replace(/\\s+/g, " ").trim().slice(0, 60) || "",
        insideCreate: Boolean(el?.closest("[data-create-note-overlay]")),
      };
    })()`));
  }
  await press(cdp, "Escape");
  await delay(300);
  const createClosedByEscape = await evaluate(cdp, `document.querySelector("[data-create-note-overlay]")?.hidden === true`);

  await evaluate(cdp, `document.querySelector('[data-action="toggle-bandeja"]')?.focus(); true;`);
  const mobileButtonExists = await evaluate(cdp, `Boolean(document.querySelector('[data-action="toggle-bandeja"]'))`);
  let bandeja = null;
  if (mobileButtonExists) {
    await press(cdp, "Enter");
    await delay(450);
    bandeja = {
      open: await evaluate(cdp, `!document.getElementById("mobile-bandeja")?.hidden`),
      expanded: await evaluate(cdp, `document.querySelector('[data-action="toggle-bandeja"]')?.getAttribute("aria-expanded")`),
      focus: await evaluate(cdp, `document.activeElement?.outerHTML?.slice(0, 180) || ""`),
    };
    await press(cdp, "Escape");
    await delay(300);
    bandeja.closedByEscape = await evaluate(cdp, `document.getElementById("mobile-bandeja")?.hidden === true || !document.getElementById("mobile-bandeja")?.classList.contains("is-open")`);
  }

  return { viewport: viewport.name, theme: theme.name, beforeEnter, createOpen, focusAfterOpen, tabStops, createClosedByEscape, bandeja };
}

async function capture(cdp, viewport, theme, view) {
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const fileName = `${viewport.name}__${theme.name}__${view}.png`;
  await writeFile(new URL(fileName, OUT_DIR), Buffer.from(shot.data, "base64"));
  return fileName;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const { chrome, browserWsUrl } = await bootBrowser();
  const cdp = await newPage(browserWsUrl);
  const consoleEvents = [];
  try {
    await cdp.send("Runtime.consoleAPICalled", {});
  } catch {}
  const originalEvents = cdp.events;
  Object.defineProperty(cdp, "events", {
    get() { return originalEvents; },
    set(value) {
      originalEvents.length = 0;
      originalEvents.push(...value);
    },
  });

  const results = [];
  const keyboard = [];
  const screenshots = [];

  for (const viewport of viewports) {
    console.error(`Viewport: ${viewport.name}`);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 820,
    });

    for (const theme of themes) {
      console.error(`  Tema: ${theme.name}`);
      await navigate(cdp, BASE_URL);
      await prepareStorage(cdp, theme);
      await navigate(cdp, auditUrl("editor"));

      const errorsBefore = cdp.events.length;
      for (const view of views) {
        console.error(`    View: ${view}`);
        const info = await inspectPage(cdp, viewport, theme, view);
        info.eventCountAtStart = errorsBefore;
        results.push(info);
        if (["editor", "biblioteca", "academia"].includes(view) && ["desktop-1366x900", "mobile-estreito-320x700"].includes(viewport.name) && ["alvorada", "scriptorium"].includes(theme.name)) {
          screenshots.push({ viewport: viewport.name, theme: theme.name, view, file: await capture(cdp, viewport, theme, view) });
        }
      }

      if (["desktop-1366x900", "mobile-estreito-320x700"].includes(viewport.name) && ["alvorada", "scriptorium"].includes(theme.name)) {
        console.error("    Teclado");
        keyboard.push(await runKeyboardChecks(cdp, viewport, theme));
      }
    }
  }

  for (const event of cdp.events) {
    if (event.method === "Runtime.consoleAPICalled" || event.method === "Log.entryAdded") {
      consoleEvents.push(event);
    }
  }

  const report = { baseUrl: BASE_URL, createdAt: new Date().toISOString(), viewports, themes, views, results, keyboard, screenshots, consoleEvents };
  await writeFile(new URL("fase-a-results.json", OUT_DIR), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    results: results.length,
    overflows: results.filter(r => r.globalOverflow).length,
    buttonProblems: results.reduce((sum, r) => sum + r.buttonProblems.length, 0),
    ariaProblems: results.reduce((sum, r) => sum + r.ariaProblems.length, 0),
    keyboardChecks: keyboard.length,
    screenshots: screenshots.length,
    out: OUT_DIR.pathname,
  }, null, 2));
  cdp.close();
  chrome.kill("SIGTERM");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
