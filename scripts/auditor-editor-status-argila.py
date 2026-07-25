#!/usr/bin/env python3
"""Audita a faixa Argila do editor em desktop e telefones compactos."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

CASES = (
    ("320x520", 320, 520),
    ("390x640", 390, 640),
    ("390x844", 390, 844),
    ("430x640", 430, 640),
    ("1440x900", 1440, 900),
)
THEMES = (("alvorada", False), ("scriptorium", True))
TERMS_KEY = "escrevaral-termos-v1"
DARK_KEY = "vereda:dark-mode"
EXPECTED_WORDS = "9"


def rect(page, selector: str):
    return page.locator(selector).first.bounding_box()


def visible(page, selector: str) -> bool:
    loc = page.locator(selector)
    return loc.count() > 0 and loc.first.is_visible()


def in_viewport(box, width: int, height: int, tolerance: float = 1.5) -> bool:
    if not box:
        return False
    return (
        box["x"] >= -tolerance
        and box["y"] >= -tolerance
        and box["x"] + box["width"] <= width + tolerance
        and box["y"] + box["height"] <= height + tolerance
    )


def overlap(a, b, tolerance: float = 1.0) -> bool:
    if not a or not b:
        return False
    return not (
        a["x"] + a["width"] <= b["x"] + tolerance
        or b["x"] + b["width"] <= a["x"] + tolerance
        or a["y"] + a["height"] <= b["y"] + tolerance
        or b["y"] + b["height"] <= a["y"] + tolerance
    )


def configure(browser, width: int, height: int, dark: bool):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if dark else "light",
    )
    values = {
        TERMS_KEY: "2026-07-25T00:00:00.000Z",
        DARK_KEY: "on" if dark else "off",
    }
    payload = json.dumps(values)
    context.add_init_script(
        f"""
        const seed = {payload};
        for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
        """
    )
    return context


def prepare(page, base_url: str, errors: list[str]):
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_function("() => typeof createBlankManuscript === 'function'", timeout=20_000)
    page.evaluate(
        """() => {
          if (!state?.manuscripts?.length) createBlankManuscript();
          setView('editor');
        }"""
    )
    page.wait_for_selector('.statusbar[data-status-argila="true"]', timeout=12_000)
    page.wait_for_selector(".writing-area", state="visible", timeout=12_000)
    editor = page.locator(".writing-area")
    editor.click()
    page.keyboard.type("uma página cresce com calma e encontra sua forma", delay=4)
    page.wait_for_function(
        "expected => document.querySelector('.statusbar-count')?.dataset.wordCount === expected",
        arg=EXPECTED_WORDS,
        timeout=8_000,
    )
    page.wait_for_function(
        "() => ['saved','ready'].includes(document.querySelector('[data-save-status]')?.dataset.saveState)",
        timeout=8_000,
    )


def audit_case(browser, base_url: str, output: Path, case, theme):
    name, width, height = case
    theme_name, dark = theme
    context = configure(browser, width, height, dark)
    page = context.new_page()
    issues: list[str] = []
    console_errors: list[str] = []
    try:
        prepare(page, base_url, console_errors)
        phone = width <= 599
        status_box = rect(page, '.statusbar[data-status-argila="true"]')
        count_box = rect(page, ".statusbar-count")
        save_box = rect(page, ".statusbar-save")
        session_box = rect(page, ".statusbar-session-toggle")

        for label, box in (("faixa", status_box), ("contagem", count_box), ("salvamento", save_box), ("sessão", session_box)):
            if not in_viewport(box, width, height):
                issues.append(f"{label} fora do viewport: {box}")

        if overlap(count_box, save_box) or overlap(save_box, session_box) or overlap(count_box, session_box):
            issues.append("contagem, salvamento e Sessão se sobrepõem")

        overflow = page.evaluate(
            """() => ({
              document: document.documentElement.scrollWidth - innerWidth,
              status: document.querySelector('.statusbar')?.scrollWidth - document.querySelector('.statusbar')?.clientWidth
            })"""
        )
        if overflow["document"] > 1 or overflow["status"] > 1:
            issues.append(f"overflow horizontal: {overflow}")

        if phone:
            dock_box = rect(page, "#mobile-dock")
            if not dock_box:
                issues.append("dock móvel não está visível")
            elif status_box and abs((status_box["y"] + status_box["height"]) - dock_box["y"]) > 2:
                issues.append(f"faixa não encosta no dock: faixa={status_box}, dock={dock_box}")
            if visible(page, ".statusbar-community"):
                issues.append("informações institucionais aparecem na faixa móvel")
            if page.locator(".statusbar-count").get_attribute("data-word-count") != EXPECTED_WORDS:
                issues.append("contagem compacta não recebeu o total esperado")

        summary = page.locator(".statusbar-session-toggle")
        summary.focus()
        page.keyboard.press("Enter")
        page.wait_for_selector(".statusbar-session[open] .statusbar-session-panel", timeout=4_000)
        panel_box = rect(page, ".statusbar-session-panel")
        if not in_viewport(panel_box, width, height):
            issues.append(f"painel de sessão fora do viewport: {panel_box}")
        if not visible(page, ".statusbar-session-panel [data-action='edit-word-goal']"):
            issues.append("meta não está acessível no painel")
        if not visible(page, ".statusbar-session-panel [data-action='toggle-pomodoro']"):
            issues.append("temporizador não está acessível no painel")
        page.keyboard.press("Escape")
        if page.locator(".statusbar-session").get_attribute("open") is not None:
            issues.append("Escape não fechou o painel de sessão")

        if phone:
            page.evaluate("setView('arquivo')")
            page.wait_for_timeout(120)
            if visible(page, '.statusbar[data-status-argila="true"]'):
                issues.append("faixa do editor continua visível no Acervo móvel")
            page.evaluate("setView('editor')")

        shot_dir = output / "screenshots"
        shot_dir.mkdir(parents=True, exist_ok=True)
        shot = shot_dir / f"{name}-{theme_name}.png"
        page.screenshot(path=str(shot), full_page=True)
        issues.extend(f"console: {item}" for item in console_errors)
        return {
            "case": name,
            "theme": theme_name,
            "screenshot": f"screenshots/{shot.name}",
            "issues": issues,
        }
    finally:
        context.close()


def write_report(output: Path, cases: list[dict]):
    generated = datetime.now(timezone.utc).isoformat()
    failures = sum(len(case["issues"]) for case in cases)
    payload = {"generated_at": generated, "failures": failures, "cases": cases}
    (output / "resultado.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        "# Auditoria da situação do editor Argila", "", f"Gerada em: {generated}",
        f"Cenários: {len(cases)}", f"Falhas: {failures}", "",
        "| Tela | Tema | Resultado |", "|---|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['case']} | {case['theme']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if failures == 0:
        lines.append("Nenhuma falha detectada.")
    else:
        for case in cases:
            for issue in case["issues"]:
                lines.append(f"- **{case['case']} · {case['theme']}** — {issue}")
    (output / "relatorio.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799/")
    parser.add_argument("--output-dir", default="reports/auditoria/editor-status-argila-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for case in CASES:
            for theme in THEMES:
                cases.append(audit_case(browser, args.base_url, output, case, theme))
        browser.close()
    write_report(output, cases)
    failures = [issue for case in cases for issue in case["issues"]]
    print(f"[editor-status-argila] cenários={len(cases)} falhas={len(failures)}")
    if failures:
        for issue in failures:
            print(f"- {issue}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
