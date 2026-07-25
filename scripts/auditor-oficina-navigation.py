#!/usr/bin/env python3
"""Audita a hierarquia desktop da Oficina e preserva dock/rail móveis."""
from __future__ import annotations

import argparse
import json
import traceback
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

DESKTOPS = (("820", 820, 900), ("1024", 1024, 900), ("1440", 1440, 900))
MOBILES = (("390", 390, 844), ("768", 768, 900))
THEMES = (("alvorada", False), ("scriptorium", True))
TERMS_KEY = "escrevaral-termos-v1"
DARK_KEY = "vereda:dark-mode"
GROUP_VIEWS = ("academia", "biblioteca", "autoria", "cronograma")


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


def in_viewport(box, width: int, height: int, tolerance: float = 2) -> bool:
    return bool(
        box
        and box["x"] >= -tolerance
        and box["y"] >= -tolerance
        and box["x"] + box["width"] <= width + tolerance
        and box["y"] + box["height"] <= height + tolerance
    )


def prepare(page, base_url: str, errors: list[str]):
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    # No mobile as tabs existem, mas ficam ocultas porque o dock assume a navegação.
    page.wait_for_selector(
        '.module-tabs[data-oficina-navigation="true"]',
        state="attached",
        timeout=20_000,
    )
    page.wait_for_function("() => typeof setView === 'function'", timeout=20_000)


def screenshot(page, output: Path, name: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{name}.png"
    page.screenshot(path=str(path), full_page=True)
    return f"screenshots/{path.name}"


def audit_desktop(browser, base_url: str, output: Path, viewport, theme):
    name, width, height = viewport
    theme_name, dark = theme
    context = configure(browser, width, height, dark)
    page = context.new_page()
    issues: list[str] = []
    console_errors: list[str] = []
    closed_shot = ""
    open_shot = ""
    try:
        prepare(page, base_url, console_errors)
        nav = page.locator('.module-tabs[data-oficina-navigation="true"]')
        top_children = nav.locator(":scope > *")
        if top_children.count() != 3:
            issues.append(f"primeiro nível deveria ter 3 itens; encontrou {top_children.count()}")

        visible_text = " ".join(nav.locator(":scope > *").all_inner_texts()).casefold()
        for label in ("escrever", "acervo", "oficina"):
            if label not in visible_text:
                issues.append(f"destino principal ausente: {label}")

        details = page.locator(".oficina-navigation")
        summary = page.locator(".oficina-navigation > summary")
        if details.get_attribute("open") is not None:
            issues.append("Oficina inicia aberta")
        for view in GROUP_VIEWS:
            if page.locator(f'.oficina-navigation-menu [data-view-target="{view}"]').is_visible():
                issues.append(f"{view} aparece fora do segundo nível")

        closed_shot = screenshot(page, output, f"{name}-{theme_name}-oficina-fechada")
        summary.press("Enter")
        page.wait_for_selector(".oficina-navigation[open] .oficina-navigation-menu", timeout=5_000)
        page.wait_for_function(
            "() => getComputedStyle(document.querySelector('.oficina-navigation-menu')).position === 'absolute'"
        )
        menu_box = page.locator(".oficina-navigation-menu").bounding_box()
        if not in_viewport(menu_box, width, height):
            issues.append(f"menu fora do viewport: {menu_box}")
        open_shot = screenshot(page, output, f"{name}-{theme_name}-oficina-aberta")

        for index, view in enumerate(GROUP_VIEWS):
            if index:
                summary.press("Enter")
                page.wait_for_selector(".oficina-navigation[open]", timeout=3_000)
            item = page.locator(f'.oficina-navigation-menu [data-view-target="{view}"]')
            if not item.is_visible():
                issues.append(f"destino inacessível: {view}")
                continue
            item.click()
            page.wait_for_function(
                "expected => document.querySelector('.app-shell')?.dataset.view === expected",
                arg=view,
            )
            if details.get_attribute("open") is not None:
                issues.append(f"menu não fechou após abrir {view}")
            if "is-active" not in (details.get_attribute("class") or ""):
                issues.append(f"Oficina não ficou ativa em {view}")
            if item.get_attribute("aria-current") != "page":
                issues.append(f"item ativo sem aria-current: {view}")

        summary.press("Enter")
        page.wait_for_selector(".oficina-navigation[open]", timeout=3_000)
        page.keyboard.press("Escape")
        if details.get_attribute("open") is not None:
            issues.append("Escape não fechou Oficina")
        if not summary.evaluate("el => document.activeElement === el"):
            issues.append("foco não voltou ao agrupador Oficina")
    except Exception as error:
        issues.append(f"exceção: {type(error).__name__}: {error}")
        issues.append(traceback.format_exc(limit=5))
    finally:
        if console_errors:
            issues.extend(f"console: {item}" for item in console_errors)
        context.close()

    return {
        "viewport": name,
        "theme": theme_name,
        "mode": "desktop",
        "closedScreenshot": closed_shot,
        "openScreenshot": open_shot,
        "issues": issues,
    }


def audit_mobile(browser, base_url: str, output: Path, viewport, theme):
    name, width, height = viewport
    theme_name, dark = theme
    context = configure(browser, width, height, dark)
    page = context.new_page()
    issues: list[str] = []
    console_errors: list[str] = []
    shot = ""
    try:
        prepare(page, base_url, console_errors)
        if page.locator(".module-tabs").is_visible():
            issues.append("tabs desktop aparecem junto do dock/rail")
        dock = page.locator("#mobile-dock")
        if not dock.is_visible():
            issues.append("dock/rail móvel não está visível")
        labels = " ".join(dock.locator(".dock-label").all_inner_texts()).casefold()
        for expected in ("escrever", "acervo", "ateliê", "autoria", "palavras"):
            if expected not in labels:
                issues.append(f"destino móvel removido: {expected}")
        box = dock.bounding_box()
        if not in_viewport(box, width, height):
            issues.append(f"dock/rail fora do viewport: {box}")
        shot = screenshot(page, output, f"{name}-{theme_name}-dock-preservado")
    except Exception as error:
        issues.append(f"exceção: {type(error).__name__}: {error}")
        issues.append(traceback.format_exc(limit=5))
    finally:
        if console_errors:
            issues.extend(f"console: {item}" for item in console_errors)
        context.close()

    return {
        "viewport": name,
        "theme": theme_name,
        "mode": "mobile",
        "screenshot": shot,
        "issues": issues,
    }


def write_report(output: Path, cases: list[dict]):
    generated = datetime.now(timezone.utc).isoformat()
    failures = sum(len(case["issues"]) for case in cases)
    (output / "resultado.json").write_text(
        json.dumps({"generated_at": generated, "failures": failures, "cases": cases}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    lines = [
        "# Auditoria da navegação Oficina Argila", "", f"Gerada em: {generated}",
        f"Cenários: {len(cases)}", f"Falhas: {failures}", "",
        "| Tela | Tema | Modo | Resultado |", "|---:|---|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['viewport']} | {case['theme']} | {case['mode']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if not failures:
        lines.append("Nenhuma falha detectada.")
    else:
        for case in cases:
            for issue in case["issues"]:
                lines.append(f"- **{case['viewport']} · {case['theme']} · {case['mode']}** — {issue}")
    (output / "relatorio.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799/")
    parser.add_argument("--output-dir", default="reports/auditoria/oficina-navigation-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for viewport in DESKTOPS:
            for theme in THEMES:
                cases.append(audit_desktop(browser, args.base_url, output, viewport, theme))
        for viewport in MOBILES:
            for theme in THEMES:
                cases.append(audit_mobile(browser, args.base_url, output, viewport, theme))
        browser.close()
    write_report(output, cases)
    failures = [issue for case in cases for issue in case["issues"]]
    print(f"[oficina-navigation] cenários={len(cases)} falhas={len(failures)}")
    if failures:
        for issue in failures:
            print(f"- {issue}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
