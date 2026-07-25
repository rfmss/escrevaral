#!/usr/bin/env python3
"""Guarda local da candidata Argila: views reais e páginas do sitemap em 390–1366px."""
from __future__ import annotations

import json
import os
import re
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get("ESCREVARAL_AUDIT_URL", "http://127.0.0.1:8799").rstrip("/")
TODAY = date.today().isoformat()
REPORT_DIR = ROOT / "reports" / "auditoria"
SHOT_DIR = REPORT_DIR / "screenshots" / f"release-local-{TODAY}"
REPORT_MD = REPORT_DIR / f"release-local-{TODAY}.md"
REPORT_JSON = REPORT_DIR / f"release-local-{TODAY}.json"

VIEWPORTS = (("mobile", 390, 844), ("tablet", 768, 1024), ("desktop", 1366, 900))
APP_VIEWS = ("editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma")
ISSUES: list[dict] = []

INIT_STORAGE = """
localStorage.setItem('escrevaral-termos-v1', '1');
localStorage.setItem('vrda-first-visit', '1');
localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
  manuscripts: [{
    id: 'release-ms', title: 'Candidata Argila', folder: 'Teste', kind: 'manuscript',
    text: 'Uma frase brasileira para validar a escrita local. Outra frase preserva o ritmo.',
    content: 'Uma frase brasileira para validar a escrita local. Outra frase preserva o ritmo.',
    createdAt: 0, updatedAt: 0
  }],
  activeId: 'release-ms', ui: {}
}));
"""


def add_issue(severity: str, area: str, title: str, evidence: str) -> None:
    ISSUES.append({"severity": severity, "area": area, "title": title, "evidence": evidence})


def sitemap_paths() -> list[str]:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return ["/"]
    root = ET.fromstring(sitemap.read_text(encoding="utf-8"))
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    paths = []
    for loc in root.findall(".//sm:loc", ns):
        if loc.text:
            paths.append(urlparse(loc.text.strip()).path or "/")
    return sorted(set(paths or ["/"]))


def slug(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-")[:90] or "pagina"


def wait_ready(page, url: str) -> None:
    page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    try:
        page.wait_for_load_state("networkidle", timeout=6_000)
    except PlaywrightTimeoutError:
        pass
    page.wait_for_timeout(500)


def inspect(page) -> dict:
    return page.evaluate(
        """() => {
          const vw = innerWidth;
          const vh = innerHeight;
          const doc = document.scrollingElement || document.documentElement;
          const visible = el => {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
          };
          const name = el => (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
          const interactive = [...document.querySelectorAll('button,a,label,[role="button"],summary,input,select,textarea')].filter(visible);
          const protruding = interactive.filter(el => {
            const r = el.getBoundingClientRect();
            return r.left < -2 || r.right > vw + 2;
          }).slice(0, 20).map(el => {
            const r = el.getBoundingClientRect();
            return {tag: el.tagName.toLowerCase(), text: name(el).slice(0, 80), left: Math.round(r.left), right: Math.round(r.right)};
          });
          const unnamed = [...document.querySelectorAll('button,[role="button"]')].filter(visible).filter(el => !name(el)).slice(0, 20).map(el => el.outerHTML.slice(0, 160));
          return {
            horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            protruding,
            unnamed,
            title: document.title,
            view: document.querySelector('.app-shell')?.dataset.view || null
          };
        }"""
    )


def record_state(page, viewport_name: str, label: str, state: dict) -> None:
    if state["horizontalOverflow"]:
        add_issue("P1", label, "rolagem horizontal não intencional", f"{state['scrollWidth']} > {state['clientWidth']} em {viewport_name}")
    for item in state["protruding"]:
        add_issue("P1", label, "controle visível escapa lateralmente", f"{viewport_name}: {item['tag']} `{item['text']}` {item['left']}..{item['right']}")
    for item in state["unnamed"]:
        add_issue("P1", label, "controle visível sem nome acessível", f"{viewport_name}: {item}")
    if state["horizontalOverflow"] or state["protruding"] or state["unnamed"]:
        SHOT_DIR.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(SHOT_DIR / f"{viewport_name}-{slug(label)}.png"), full_page=False)


def audit_app(browser, viewport_name: str, width: int, height: int) -> None:
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    context.add_init_script(INIT_STORAGE)
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        wait_ready(page, BASE_URL + "/")
        page.wait_for_function("() => typeof setView === 'function'", timeout=15_000)
        for view in APP_VIEWS:
            page.evaluate("view => setView(view, { updateRoute: true, routeMode: 'replace' })", view)
            page.wait_for_function("view => document.querySelector('.app-shell')?.dataset.view === view", arg=view, timeout=5_000)
            page.wait_for_timeout(350)
            state = inspect(page)
            if state["view"] != view:
                add_issue("P1", f"app-{view}", "view não ficou ativa", f"esperado {view}; recebido {state['view']}")
            record_state(page, viewport_name, f"app-{view}", state)
    except Exception as error:
        add_issue("P1", "app", "auditoria local abortou", f"{viewport_name}: {type(error).__name__}: {error}")
    finally:
        for error in errors:
            add_issue("P1", "app", "erro JavaScript não tratado", f"{viewport_name}: {error}")
        context.close()


def audit_satellites(browser, viewport_name: str, width: int, height: int) -> None:
    for path in sitemap_paths():
        if path in ("/", "/index.html"):
            continue
        context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
        page = context.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        try:
            wait_ready(page, BASE_URL + path)
            record_state(page, viewport_name, path, inspect(page))
        except Exception as error:
            add_issue("P1", path, "página não pôde ser auditada", f"{viewport_name}: {type(error).__name__}: {error}")
        finally:
            for error in errors:
                add_issue("P1", path, "erro JavaScript não tratado", f"{viewport_name}: {error}")
            context.close()


def write_reports() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    counts = {severity: sum(1 for issue in ISSUES if issue["severity"] == severity) for severity in ("P0", "P1", "P2")}
    semaforo = "VERMELHO" if counts["P0"] else "AMARELO" if counts["P1"] else "VERDE"
    lines = [
        f"# Auditoria local da candidata — {TODAY}", "",
        f"**Semaforo:** {semaforo}  |  **P0:** {counts['P0']}  **P1:** {counts['P1']}  **P2:** {counts['P2']}", "",
        f"Base: `{BASE_URL}`", "",
    ]
    if ISSUES:
        for severity in ("P0", "P1", "P2"):
            group = [issue for issue in ISSUES if issue["severity"] == severity]
            if not group:
                continue
            lines += [f"## {severity}", ""]
            for issue in group:
                lines += [f"- **[{issue['area']}] {issue['title']}**", f"  - Evidencia: {issue['evidence']}"]
    else:
        lines += ["Nenhuma falha P0/P1 detectada nas views e páginas do sitemap."]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    REPORT_JSON.write_text(json.dumps({"base_url": BASE_URL, "counts": counts, "issues": ISSUES}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for viewport_name, width, height in VIEWPORTS:
            audit_app(browser, viewport_name, width, height)
            audit_satellites(browser, viewport_name, width, height)
        browser.close()
    write_reports()
    blocking = [issue for issue in ISSUES if issue["severity"] in ("P0", "P1")]
    print(f"[release-local] cenários={len(VIEWPORTS)} páginas={len(sitemap_paths())} bloqueios={len(blocking)}")
    return 1 if blocking else 0


if __name__ == "__main__":
    raise SystemExit(main())
