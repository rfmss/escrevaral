#!/usr/bin/env python3
"""
Auditoria visual/navegacional do Escrevaral em producao.

Percorre o app principal e as URLs do sitemap em mobile, tablet e desktop.
Gera screenshots, captura erros de console/rede e aponta problemas visuais
objetivos: overflow horizontal, controles sem nome, alvos pequenos, texto
cortado e destinos de navegacao inacessiveis.
"""

from __future__ import annotations

import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = os.environ.get("ESCREVARAL_AUDIT_URL", "https://escrevaral.com").rstrip("/")
DATA = date.today().isoformat()
REPORT_DIR = ROOT / "reports" / "auditoria"
SHOT_DIR = REPORT_DIR / "screenshots" / f"navegacao-visual-{DATA}"
REPORT_MD = REPORT_DIR / f"navegacao-visual-{DATA}.md"
REPORT_JSON = REPORT_DIR / f"navegacao-visual-{DATA}.json"

TIMEOUT = 25_000
VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1366, "height": 900},
]
APP_VIEWS = ["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"]

IGNORAR_REDE = [
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "goatcounter",
    "gc.zgo.at",
    "cdn-cgi/rum",
    "analytics",
]

INIT_STORAGE = """
localStorage.setItem('escrevaral-termos-v1', '1');
localStorage.setItem('vrda-first-visit', '1');
localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
  manuscripts: [{
    id: 'audit-ms',
    title: 'Auditoria visual',
    folder: 'Teste',
    kind: 'manuscript',
    text: 'Primeira frase de auditoria. Segunda frase com palavra repetida. Terceira frase para ativar os painéis de linguagem.',
    content: 'Primeira frase de auditoria. Segunda frase com palavra repetida. Terceira frase para ativar os painéis de linguagem.',
    createdAt: 0,
    updatedAt: 0
  }],
  activeId: 'audit-ms',
  ui: {}
}));
"""


def slugify(value: str) -> str:
    value = re.sub(r"^https?://", "", value)
    value = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")
    return value[:120] or "pagina"


def deve_ignorar(texto: str) -> bool:
    return any(item.lower() in (texto or "").lower() for item in IGNORAR_REDE)


def urls_from_sitemap() -> list[str]:
    path = ROOT / "sitemap.xml"
    urls: list[str] = []
    if path.exists():
        root = ET.fromstring(path.read_text(encoding="utf-8"))
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in root.findall(".//sm:loc", ns):
            if loc.text:
                parsed = urlparse(loc.text.strip())
                urls.append(f"{BASE_URL}{parsed.path}")
    if not urls:
        urls = [f"{BASE_URL}/"]
    return urls


def attach_watchers(page, bucket: dict) -> None:
    def on_console(msg):
        text = msg.text
        url = msg.location.get("url", "")
        if deve_ignorar(text) or deve_ignorar(url):
            return
        if msg.type == "error":
            bucket["console_errors"].append({
                "message": text,
                "url": url,
                "line": msg.location.get("lineNumber", 0),
            })
        elif msg.type == "warning":
            bucket["console_warnings"].append({"message": text, "url": url})

    def on_pageerror(exc):
        text = str(exc)
        if not deve_ignorar(text):
            bucket["page_errors"].append(text)

    def on_requestfailed(req):
        url = req.url
        if not deve_ignorar(url):
            bucket["network_errors"].append({"type": "requestfailed", "url": url, "failure": str(req.failure)})

    def on_response(resp):
        url = resp.url
        if resp.status >= 400 and not deve_ignorar(url):
            bucket["network_errors"].append({"type": f"http-{resp.status}", "url": url})

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    page.on("requestfailed", on_requestfailed)
    page.on("response", on_response)


def goto_ready(page, url: str) -> None:
    page.goto(url, wait_until="domcontentloaded", timeout=TIMEOUT)
    try:
        page.wait_for_load_state("networkidle", timeout=8_000)
    except PlaywrightTimeoutError:
        pass
    page.wait_for_timeout(900)


def capture_screenshot(page, viewport: dict, label: str) -> str:
    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    path = SHOT_DIR / f"{viewport['name']}-{slugify(label)}.png"
    page.screenshot(path=str(path), full_page=False)
    return str(path)


def evaluate_visual_state(page) -> dict:
    return page.evaluate(
        """() => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const doc = document.scrollingElement || document.documentElement;
          const visible = (el) => {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
          };
          const visualContainer = (el) =>
            el.closest('.book, .stage, .cover-front, .cover-face, .face, .page, .leaf, .f-spine, .editor-paper, .content-stage, .view, .fichas-body');
          const nameFor = (el) =>
            (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
          const short = (el) => {
            const r = el.getBoundingClientRect();
            const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().replace(/\\s+/g,'.') : '';
            return {
              tag: el.tagName.toLowerCase() + cls,
              text: nameFor(el).slice(0, 80),
              left: Math.round(r.left),
              right: Math.round(r.right),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              width: Math.round(r.width),
              height: Math.round(r.height),
            };
          };
          const all = [...document.body.querySelectorAll('*')];
          const protruding = all
            .filter(el => visible(el))
            .filter(el => {
              const r = el.getBoundingClientRect();
              if (['html','body','svg'].includes(el.tagName.toLowerCase())) return false;
              if (r.width > vw * 1.8) return false;
              return r.left < -2 || r.right > vw + 2;
            })
            .slice(0, 24).map(short);
          const clippedText = all
            .filter(el => visible(el))
            .filter(el => {
              if (visualContainer(el)) return false;
              if (['input', 'textarea', 'select'].includes(el.tagName.toLowerCase())) return false;
              if (el.children.length > 0 && !['button', 'a'].includes(el.tagName.toLowerCase())) return false;
              const text = nameFor(el);
              if (text.length < 8) return false;
              const cs = getComputedStyle(el);
              const clipsX = ['hidden', 'clip'].includes(cs.overflowX) || ['hidden', 'clip'].includes(cs.textOverflow);
              return clipsX && el.scrollWidth > el.clientWidth + 3;
            })
            .slice(0, 24).map(short);
          const unnamedButtons = [...document.querySelectorAll('button, [role="button"]')]
            .filter(el => visible(el) && !nameFor(el))
            .slice(0, 24).map(short);
          const smallTargets = [...document.querySelectorAll('button, a, [role="button"], input, select, textarea')]
            .filter(el => visible(el))
            .filter(el => {
              if (['input', 'textarea', 'select'].includes(el.tagName.toLowerCase())) return false;
              const r = el.getBoundingClientRect();
              if (el.closest('.writing-area')) return false;
              return (r.width < 28 || r.height < 28);
            })
            .slice(0, 32).map(short);
          const bigFixed = all
            .filter(el => visible(el))
            .filter(el => {
              const cs = getComputedStyle(el);
              if (!['fixed', 'sticky'].includes(cs.position)) return false;
              const r = el.getBoundingClientRect();
              const area = r.width * r.height;
              return area > vw * vh * 0.45 && !el.hidden;
            })
            .slice(0, 12).map(short);
          const headings = [...document.querySelectorAll('h1,h2,[role="heading"]')]
            .filter(el => visible(el))
            .slice(0, 10)
            .map(el => nameFor(el).slice(0, 100));
          const appView = document.querySelector('.app-shell')?.dataset?.view || null;
          const visibleNav = [...document.querySelectorAll('nav button, nav a, .module-tabs button, .mobile-dock button, .bandeja-item')]
            .filter(el => visible(el))
            .map(el => ({ text: nameFor(el), target: el.dataset.viewTarget || el.getAttribute('href') || el.dataset.action || '' }))
            .filter(item => item.text || item.target)
            .slice(0, 80);
          return {
            title: document.title,
            url: location.href,
            appView,
            headings,
            bodyTextChars: (document.body.innerText || '').length,
            scroll: {
              width: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              height: doc.scrollHeight,
              clientHeight: doc.clientHeight,
              horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
            },
            protruding,
            clippedText,
            unnamedButtons,
            smallTargets,
            bigFixed,
            visibleNav,
          };
        }"""
    )


def add_state(record: dict, page, viewport: dict, label: str, screenshot: bool = True) -> dict:
    state = evaluate_visual_state(page)
    state["label"] = label
    state["viewport"] = viewport["name"]
    if screenshot:
        state["screenshot"] = capture_screenshot(page, viewport, label)
    record["states"].append(state)
    return state


def click_if_visible(page, selector: str) -> bool:
    loc = page.locator(selector).first
    try:
        if loc.count() and loc.is_visible(timeout=700):
            loc.click(timeout=2_000)
            page.wait_for_timeout(700)
            return True
    except Exception:
        return False
    return False


def audit_app(page, viewport: dict, record: dict) -> None:
    goto_ready(page, f"{BASE_URL}/")
    add_state(record, page, viewport, "app-inicio")

    reachable = {}
    for view in APP_VIEWS:
        clicked = False
        if viewport["width"] >= 820:
            clicked = click_if_visible(page, f'.module-tabs [data-view-target="{view}"]')
        elif viewport["width"] >= 600:
            clicked = click_if_visible(page, f'.mobile-dock [data-view-target="{view}"]')
        else:
            clicked = click_if_visible(page, f'.mobile-dock [data-view-target="{view}"]')
            if not clicked and view == "cronograma":
                clicked = click_if_visible(page, '[data-action="toggle-bandeja"]')
                if clicked:
                    clicked = click_if_visible(page, '.bandeja-item[data-view-target="cronograma"]')

        reachable[view] = clicked
        if clicked:
            add_state(record, page, viewport, f"app-{view}")

    unreachable = [view for view, ok in reachable.items() if not ok]
    if unreachable:
        record["navigation_findings"].append({
            "severity": "P1" if viewport["name"] == "mobile" else "P2",
            "viewport": viewport["name"],
            "message": "Destinos do app sem controle visivel/clicavel neste viewport",
            "details": unreachable,
        })


def interactive_selectors() -> str:
    return ",".join([
        "nav a[href^='#']",
        "nav button",
        ".index button",
        ".topbar-tabs button",
        ".processo-tabs button",
        ".estruturas-tabs button",
        ".tab-btn",
        ".processo-tab",
        ".estrutura-tab",
    ])


def audit_static_page(page, viewport: dict, url: str, record: dict) -> None:
    goto_ready(page, url)
    add_state(record, page, viewport, urlparse(url).path.strip("/") or "home")

    selectors = interactive_selectors()
    items = page.evaluate(
        """(selector) => {
          const visible = (el) => {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
          };
          const nameFor = (el) => (el.getAttribute('aria-label') || el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
          return [...document.querySelectorAll(selector)]
            .filter(visible)
            .map((el, index) => ({
              index,
              text: nameFor(el).slice(0, 80),
              href: el.getAttribute('href') || '',
              selector: el.tagName.toLowerCase(),
            }))
            .slice(0, 30);
        }""",
        selectors,
    )

    clicked = 0
    for idx, item in enumerate(items[:18]):
        text = item.get("text") or item.get("href") or f"item-{idx}"
        try:
            loc = page.locator(selectors).nth(idx)
            if loc.is_visible(timeout=500):
                loc.click(timeout=2_000)
                page.wait_for_timeout(500)
                clicked += 1
                add_state(record, page, viewport, f"{urlparse(url).path}-{slugify(text)}", screenshot=False)
        except Exception as exc:
            record["navigation_findings"].append({
                "severity": "P2",
                "viewport": viewport["name"],
                "message": "Falha ao acionar controle de pagina estatica",
                "details": {"url": url, "control": text, "error": str(exc)[:160]},
            })

    record["static_interactions"].append({
        "url": url,
        "viewport": viewport["name"],
        "controls_tested": clicked,
        "controls_visible": len(items),
    })


def collect_issues(records: list[dict]) -> list[dict]:
    issues: list[dict] = []
    seen: set[tuple] = set()

    def add(severity: str, area: str, message: str, evidence: str, screenshot: str = ""):
        key = (severity, area, message, evidence, screenshot)
        if key in seen:
            return
        seen.add(key)
        issues.append({
            "severity": severity,
            "area": area,
            "message": message,
            "evidence": evidence,
            "screenshot": screenshot,
        })

    for record in records:
        for err in record["console_errors"][:12]:
            add("P0", "Console", "console.error durante navegacao", err.get("message", "")[:220])
        for err in record["page_errors"][:12]:
            add("P0", "Console", "excecao JS nao tratada", err[:220])
        for err in record["network_errors"][:12]:
            add("P1", "Rede", "erro de rede/HTTP durante navegacao", f"{err.get('type')} {err.get('url')}")
        for finding in record["navigation_findings"]:
            add(finding["severity"], "Navegacao", finding["message"], f"{finding['viewport']}: {finding['details']}")

        for state in record["states"]:
            label = f"{state['viewport']} {state['label']}"
            shot = state.get("screenshot", "")
            if state["scroll"]["horizontalOverflow"]:
                add("P0", "Visual", "overflow horizontal no documento", f"{label}: {state['scroll']['width']} > {state['scroll']['clientWidth']}", shot)
            if state["bodyTextChars"] < 80:
                add("P1", "Conteudo", "viewport quase sem conteudo textual visivel", f"{label}: {state['bodyTextChars']} caracteres", shot)
            if state["protruding"]:
                examples = "; ".join(f"{p['tag']} `{p['text']}` {p['left']}..{p['right']}" for p in state["protruding"][:5])
                add("P1", "Visual", "elementos visiveis escapam lateralmente", f"{label}: {examples}", shot)
            if state["clippedText"]:
                examples = "; ".join(f"{p['tag']} `{p['text']}`" for p in state["clippedText"][:5])
                add("P1", "Visual", "texto possivelmente cortado por container", f"{label}: {examples}", shot)
            if state["unnamedButtons"]:
                examples = "; ".join(f"{p['tag']} {p['width']}x{p['height']}" for p in state["unnamedButtons"][:5])
                add("P1", "Acessibilidade", "botao visivel sem nome acessivel", f"{label}: {examples}", shot)
            if state["bigFixed"]:
                examples = "; ".join(f"{p['tag']} `{p['text']}` {p['width']}x{p['height']}" for p in state["bigFixed"][:5])
                add("P2", "Visual", "camada fixa grande cobrindo viewport", f"{label}: {examples}", shot)
            small_named = [p for p in state["smallTargets"] if p["text"]]
            if len(small_named) >= 6:
                examples = "; ".join(f"`{p['text']}` {p['width']}x{p['height']}" for p in small_named[:6])
                add("P2", "Usabilidade", "muitos alvos clicaveis abaixo de 32px", f"{label}: {examples}", shot)

    return sorted(issues, key=lambda item: ({"P0": 0, "P1": 1, "P2": 2}[item["severity"]], item["area"], item["message"]))


def generate_markdown(records: list[dict], issues: list[dict], prompt: str) -> str:
    counts = {sev: sum(1 for item in issues if item["severity"] == sev) for sev in ("P0", "P1", "P2")}
    semaforo = "VERMELHO" if counts["P0"] else "AMARELO" if counts["P1"] else "VERDE"
    screenshot_count = sum(1 for record in records for state in record["states"] if state.get("screenshot"))
    lines = [
        f"# Auditoria Visual e Navegacional - {DATA}",
        "",
        f"**URL base:** {BASE_URL}  |  **Semaforo:** {semaforo}  |  **P0:** {counts['P0']} **P1:** {counts['P1']} **P2:** {counts['P2']}",
        "",
        f"Execucao: {datetime.now().isoformat(timespec='seconds')}  ",
        f"Viewports: mobile 390x844, tablet 768x1024, desktop 1366x900  ",
        f"Screenshots: `{SHOT_DIR}` ({screenshot_count} arquivos)",
        "",
        "## Prompt remodelado",
        "",
        prompt,
        "",
        "## Cobertura",
        "",
        "- App principal: tentativa de navegar por `editor`, `biblioteca`, `autoria`, `arquivo`, `academia`, `cronograma` em cada viewport.",
        "- Sitemap: todas as URLs listadas em `sitemap.xml` foram abertas em mobile, tablet e desktop.",
        "- Paginas satelite: controles de navegação, abas e indices visiveis foram acionados quando presentes.",
        "",
    ]

    if issues:
        for severity in ("P0", "P1", "P2"):
            group = [item for item in issues if item["severity"] == severity]
            if not group:
                continue
            lines += [f"## {severity}", ""]
            for item in group:
                lines.append(f"- **[{item['area']}] {item['message']}**")
                lines.append(f"  - Evidencia: {item['evidence']}")
                if item.get("screenshot"):
                    lines.append(f"  - Screenshot: `{item['screenshot']}`")
                lines.append("")
    else:
        lines += ["## Achados", "", "Nenhum problema objetivo detectado pela varredura.", ""]

    lines += [
        "## Interacoes em paginas satelite",
        "",
        "| URL | Viewport | Controles visiveis | Controles testados |",
        "|---|---:|---:|---:|",
    ]
    for record in records:
        for item in record["static_interactions"]:
            lines.append(f"| {item['url']} | {item['viewport']} | {item['controls_visible']} | {item['controls_tested']} |")

    lines += [
        "",
        "## Comando",
        "",
        "```bash",
        "python3 scripts/auditor-navegacao-visual.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    prompt = (
        "> Audite o Escrevaral como uma pessoa escritora usando o produto pela primeira vez e depois como usuaria recorrente. "
        "Percorra producao em mobile, tablet e desktop; navegue por todos os modulos do app e por todas as URLs do sitemap. "
        "Registre qualquer quebra visual, overflow, texto cortado, botao sem resposta, destino escondido, erro de console/rede, "
        "rotulo confuso, alvos pequenos, fluxo sem volta ou diferenca grave entre viewports. Separe P0/P1/P2, cite evidencia e screenshot, "
        "e nao chame de falha aquilo que for apenas preferencia estetica sem impacto de uso."
    )

    urls = urls_from_sitemap()
    records: list[dict] = []
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for viewport in VIEWPORTS:
            context = browser.new_context(viewport={"width": viewport["width"], "height": viewport["height"]})
            context.add_init_script(INIT_STORAGE)
            page = context.new_page()
            record = {
                "viewport": viewport["name"],
                "states": [],
                "console_errors": [],
                "console_warnings": [],
                "page_errors": [],
                "network_errors": [],
                "navigation_findings": [],
                "static_interactions": [],
            }
            attach_watchers(page, record)
            try:
                audit_app(page, viewport, record)
                for url in urls:
                    if url.rstrip("/") == BASE_URL:
                        continue
                    audit_static_page(page, viewport, url, record)
            except Exception as exc:
                record["page_errors"].append(f"Falha geral no viewport {viewport['name']}: {exc}")
            finally:
                records.append(record)
                context.close()
        browser.close()

    issues = collect_issues(records)
    REPORT_MD.write_text(generate_markdown(records, issues, prompt) + "\n", encoding="utf-8")
    REPORT_JSON.write_text(
        json.dumps(
            {
                "date": DATA,
                "base_url": BASE_URL,
                "summary": {sev: sum(1 for item in issues if item["severity"] == sev) for sev in ("P0", "P1", "P2")},
                "issues": issues,
                "records": records,
                "reports": {"markdown": str(REPORT_MD), "json": str(REPORT_JSON), "screenshots": str(SHOT_DIR)},
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    summary = {sev: sum(1 for item in issues if item["severity"] == sev) for sev in ("P0", "P1", "P2")}
    print(f"Auditoria visual: P0={summary['P0']} P1={summary['P1']} P2={summary['P2']}")
    print(f"Relatorio: {REPORT_MD}")
    print(f"JSON: {REPORT_JSON}")
    print(f"Screenshots: {SHOT_DIR}")
    return 1 if summary["P0"] else 0


if __name__ == "__main__":
    sys.exit(main())
