#!/usr/bin/env python3
"""Registra a visão limpa do Acervo e valida Scriptorium/foco editorial."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

CASES = (
    ("1280", 1280, 820, None),
    ("1366", 1366, 900, None),
    ("1440", 1440, 900, None),
    ("1440-escuro", 1440, 900, "scriptorium"),
)

MANUSCRIPTS = [
    {
        "id": "rio", "title": "O rio que lembrava", "kind": "Conto", "type": "manuscrito",
        "status": "Em escrita", "text": "Naquele verão o rio mudou de cor. " * 24,
        "description": "Um conto sobre memória, território e água.", "tags": ["rio", "memória"],
        "progress": 42, "pinned": True, "createdAt": "2026-07-20T10:00:00.000Z", "updatedAt": "2026-07-25T10:00:00.000Z"
    },
    {
        "id": "marco", "title": "Fragmentos de março sem uma palavra desnecessariamente cortada",
        "kind": "Poesia", "type": "manuscrito", "status": "Revisão",
        "text": "O vento carrega sílabas que ninguém pronunciou. " * 12,
        "description": "Poemas curtos reunidos ao longo do mês.", "tags": ["poesia"],
        "progress": 78, "createdAt": "2026-07-18T10:00:00.000Z", "updatedAt": "2026-07-24T09:00:00.000Z"
    },
    {
        "id": "bordas", "title": "Caderno de bordas", "kind": "Crônica", "type": "manuscrito",
        "status": "Pausado", "text": "A rua começava onde terminava a pressa. " * 16,
        "description": "Observações de caminhadas e conversas.", "tags": ["cidade"],
        "progress": 26, "createdAt": "2026-07-15T10:00:00.000Z", "updatedAt": "2026-07-22T08:00:00.000Z"
    },
    {
        "id": "personagem", "title": "Ficha de Maria das Dores", "kind": "Personagem", "type": "personagem",
        "status": "Concluído", "text": "Maria guardava recibos em caixas de fósforo.",
        "description": "Ficha de personagem para o romance.", "tags": ["personagem"],
        "progress": 100, "createdAt": "2026-07-13T10:00:00.000Z", "updatedAt": "2026-07-19T08:00:00.000Z"
    },
]

INIT_STORAGE = """
try {
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
  localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
    manuscripts: %s, activeId: 'rio',
    archive: {filter:'all',statusFilter:'all',search:'',sort:'updated'},
    layout: {leftCollapsed:true,rightCollapsed:true}, ui: {}
  }));
} catch (_) {}
""" % json.dumps(MANUSCRIPTS, ensure_ascii=False)

AUDIT_STYLE = """
*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
#update-banner,#tab-conflict-banner,#save-hint-toast,#levar-mesa-toast{display:none!important}
"""


def rgb(value: str) -> tuple[float, float, float]:
    values = [float(item) for item in re.findall(r"[\d.]+", value)[:3]]
    if len(values) != 3:
        raise ValueError(f"cor inválida: {value}")
    return tuple(values)


def luminance(value: str) -> float:
    channels = []
    for channel in rgb(value):
        normalized = channel / 255
        channels.append(normalized / 12.92 if normalized <= .04045 else ((normalized + .055) / 1.055) ** 2.4)
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]


def contrast(first: str, second: str) -> float:
    one, two = luminance(first), luminance(second)
    return (max(one, two) + .05) / (min(one, two) + .05)


def screenshot(page, output: Path, case: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{case}-archive-{state}.png"
    page.screenshot(path=str(directory / name), full_page=False)
    return f"screenshots/{name}"


def run_case(browser, base_url: str, output: Path, spec: tuple) -> dict:
    name, width, height, theme = spec
    context = browser.new_context(viewport={"width": width, "height": height}, color_scheme="dark" if theme else "light", reduced_motion="reduce")
    context.add_init_script(INIT_STORAGE)
    page = context.new_page()
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    metrics: dict = {}

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.add_style_tag(content=AUDIT_STYLE)
        if theme:
            page.evaluate("theme => document.documentElement.dataset.theme = theme", theme)
        page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)
        page.evaluate("() => setView('arquivo', {updateRoute:false})")
        page.wait_for_selector(".project-card", state="visible", timeout=10_000)
        page.wait_for_function(
            "() => document.querySelector('.archive-controls')?.dataset.archiveClarity === 'true' && document.querySelector('link[data-archive-clarity-refine=" + '"true"' + "]')",
            timeout=10_000,
        )
        page.wait_for_timeout(180)
        page.evaluate("window.scrollTo(0, 0)")

        evidence["overview"] = screenshot(page, output, name, "overview")

        if theme == "scriptorium":
            colors = page.evaluate(
                """() => {
                  const title = document.querySelector('.archive-heading-title');
                  const project = document.querySelector('.project-card h2');
                  const findBackground = (element) => {
                    let current = element;
                    while (current) {
                      const value = getComputedStyle(current).backgroundColor;
                      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value;
                      current = current.parentElement;
                    }
                    return getComputedStyle(document.body).backgroundColor;
                  };
                  return {
                    heading: getComputedStyle(title).color,
                    project: getComputedStyle(project).color,
                    headingBg: findBackground(title),
                    projectBg: findBackground(project)
                  };
                }"""
            )
            heading_ratio = contrast(colors["heading"], colors["headingBg"])
            project_ratio = contrast(colors["project"], colors["projectBg"])
            metrics["scriptorium"] = {"colors": colors, "headingRatio": heading_ratio, "projectRatio": project_ratio}
            if heading_ratio < 4.5:
                issues.append({"kind": "scriptorium-contrast", "detail": f"título do Acervo={heading_ratio:.2f}:1, cores={colors}"})
            if project_ratio < 4.5:
                issues.append({"kind": "scriptorium-contrast", "detail": f"título do manuscrito={project_ratio:.2f}:1, cores={colors}"})

        second = page.locator(".project-card").nth(1)
        second.focus()
        page.wait_for_timeout(80)
        focus_style = second.evaluate(
            """el => { const cs=getComputedStyle(el); return {outline:cs.outlineStyle,outlineWidth:cs.outlineWidth,shadow:cs.boxShadow}; }"""
        )
        metrics["cardFocus"] = focus_style
        if focus_style["outline"] not in ("none", "") and focus_style["outlineWidth"] not in ("0px", ""):
            issues.append({"kind": "card-focus", "detail": f"cartão ainda usa caixa externa: {focus_style}"})
        if "inset" not in focus_style["shadow"]:
            issues.append({"kind": "card-focus", "detail": f"marca lateral interna ausente: {focus_style}"})
        evidence["keyboard"] = screenshot(page, output, name, "keyboard-focus")
    except Exception as error:
        issues.append({"kind": "audit-crash", "detail": repr(error)})
    finally:
        context.close()

    return {"case": name, "metrics": metrics, "evidence": evidence, "issues": issues}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/product-clarity-archive-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [run_case(browser, args.base_url, output, spec) for spec in CASES]
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    result = {"generated_at": generated, "cases": cases}
    (output / "product-clarity-archive-visual.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    failures = [issue for case in cases for issue in case["issues"]]
    print(f"[clarity-archive-visual] cenarios={len(cases)} falhas={len(failures)}", flush=True)
    for failure in failures:
        print(f"[clarity-archive-visual] {failure['kind']}: {failure['detail']}", flush=True)
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
