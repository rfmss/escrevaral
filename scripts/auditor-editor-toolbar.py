#!/usr/bin/env python3
"""Valida a revelação progressiva da barra de ferramentas do editor."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

VIEWPORTS = (("390", 390, 844), ("1440", 1440, 900))
THEMES = (("alvorada", None), ("vereda", "scriptorium"))
DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""


def add_issue(issues: list[dict], viewport: str, theme: str, kind: str, detail: str) -> None:
    issues.append({
        "viewport": viewport,
        "theme": theme,
        "kind": kind,
        "detail": detail,
    })


def visible(page, selector: str) -> bool:
    locator = page.locator(selector).first
    return locator.count() > 0 and locator.is_visible()


def dismiss_onboarding(page) -> None:
    terms = page.locator("#terms-overlay").first
    if terms.count() > 0 and terms.is_visible():
        button = page.locator('[data-action="accept-terms-blank"]').first
        if button.count() == 0:
            raise RuntimeError("Botão para concluir termos ausente")
        button.click()
        terms.wait_for(state="hidden", timeout=8_000)

    welcome_button = page.locator('[data-action="welcome-write"]').first
    if welcome_button.count() > 0 and welcome_button.is_visible():
        welcome_button.click()
        welcome_button.wait_for(state="hidden", timeout=8_000)


def screenshot(page, output: Path, viewport: str, theme: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{viewport}-{theme}-editor-toolbar-{state}.png"
    page.screenshot(path=str(directory / name), full_page=True)
    return f"screenshots/{name}"


def run_case(browser, base_url: str, output: Path, viewport: tuple, theme: tuple) -> dict:
    viewport_name, width, height = viewport
    theme_name, theme_value = theme
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if theme_value else "light",
    )
    context.add_init_script(
        """
        try {
          localStorage.setItem("escrevaral-termos-v1", "auditoria");
          localStorage.setItem("vrda-first-visit", "1");
        } catch (_) {
          // A navegação seguinte executa novamente no domínio do aplicativo.
        }
        """
    )
    page = context.new_page()
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))
    issues: list[dict] = []
    evidence: dict[str, str] = {}

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.add_style_tag(content=DISABLE_MOTION)
        page.evaluate(
            """theme => {
              if (theme) document.documentElement.dataset.theme = theme;
              else delete document.documentElement.dataset.theme;
            }""",
            theme_value,
        )
        dismiss_onboarding(page)
        page.wait_for_selector('[data-action="toggle-editorial-group"]', state="visible", timeout=10_000)

        toggle = page.locator('[data-action="toggle-editorial-group"]').first
        group = page.locator("[data-editorial-group]").first
        format_bar = page.locator("[data-format-bar]").first

        if toggle.get_attribute("aria-expanded") != "false":
            add_issue(issues, viewport_name, theme_name, "initial-state", "O controle Mais não começou recolhido.")
        if group.evaluate("el => el.classList.contains('is-open')"):
            add_issue(issues, viewport_name, theme_name, "initial-state", "O grupo editorial começou aberto.")

        for selector, label in (
            (".editor-preset-select", "formato de página"),
            ('[data-fmt="justifyLeft"]', "alinhamento"),
            ('[data-action="print-pages"]', "impressão"),
        ):
            if visible(page, selector):
                add_issue(issues, viewport_name, theme_name, "collapsed-visibility", f"{label} ficou visível no estado recolhido.")

        for selector, label in (
            ('[data-action="copy-manuscript-text"]', "Copiar"),
            ('[data-action="export-rtf"]', "Baixar"),
        ):
            if not visible(page, selector):
                add_issue(issues, viewport_name, theme_name, "quick-action-missing", f"A ação {label} não ficou disponível no estado recolhido.")

        evidence["collapsed"] = screenshot(page, output, viewport_name, theme_name, "collapsed")

        toggle.focus()
        toggle.press("Enter")
        page.wait_for_function(
            """() => {
              const group = document.querySelector('[data-editorial-group]');
              const bar = document.querySelector('[data-format-bar]');
              return group?.classList.contains('is-open') && bar?.classList.contains('is-editorial-open');
            }""",
            timeout=5_000,
        )

        if toggle.get_attribute("aria-expanded") != "true":
            add_issue(issues, viewport_name, theme_name, "expanded-state", "aria-expanded não acompanhou a abertura.")

        for selector, label in (
            (".editor-preset-select", "formato de página"),
            ('[data-fmt="justifyLeft"]', "alinhamento"),
            ('[data-action="print-pages"]', "impressão"),
        ):
            if not visible(page, selector):
                add_issue(issues, viewport_name, theme_name, "expanded-visibility", f"{label} não apareceu após abrir Mais.")

        overflow = format_bar.evaluate("el => el.scrollWidth > el.clientWidth + 2")
        if overflow:
            add_issue(issues, viewport_name, theme_name, "expanded-overflow", "A barra aberta criou rolagem horizontal interna.")

        evidence["expanded"] = screenshot(page, output, viewport_name, theme_name, "expanded")

        toggle.press("Enter")
        page.wait_for_function(
            """() => {
              const group = document.querySelector('[data-editorial-group]');
              return group && !group.classList.contains('is-open');
            }""",
            timeout=5_000,
        )

        if toggle.get_attribute("aria-expanded") != "false":
            add_issue(issues, viewport_name, theme_name, "collapsed-state", "aria-expanded não voltou a false ao recolher.")
        if visible(page, ".editor-preset-select"):
            add_issue(issues, viewport_name, theme_name, "collapsed-state", "As ferramentas permaneceram visíveis após recolher.")

        for message in console_errors:
            add_issue(issues, viewport_name, theme_name, "console-error", message[:500])
    except Exception as error:
        add_issue(issues, viewport_name, theme_name, "audit-crash", repr(error))
    finally:
        context.close()

    return {
        "viewport": viewport_name,
        "theme": theme_name,
        "evidence": evidence,
        "issues": issues,
    }


def markdown(cases: list[dict], generated: str) -> str:
    issues = [item for case in cases for item in case["issues"]]
    lines = [
        "# Auditoria da barra de ferramentas do editor",
        "",
        f"Gerada em: {generated}",
        "",
        f"- Casos: {len(cases)}",
        f"- Erros: {len(issues)}",
        "",
        "| Largura | Tema | Resultado |",
        "|---:|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['viewport']} | {case['theme']} | {'aprovado' if not case['issues'] else 'falhou'} |")

    lines += ["", "## Ocorrências", ""]
    if not issues:
        lines.append("Nenhuma falha detectada.")
    for item in issues:
        lines += [
            f"### {item['kind']}",
            "",
            f"- Contexto: {item['viewport']}px · {item['theme']}",
            f"- Detalhe: {item['detail']}",
            "",
        ]

    lines += ["## Evidências", "", "Capturas recolhidas e abertas estão em `screenshots/`.", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/editor-toolbar-artifacts")
    args = parser.parse_args()

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases: list[dict] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for viewport in VIEWPORTS:
            for theme in THEMES:
                print(f"[toolbar] {viewport[0]}px · {theme[0]}", flush=True)
                cases.append(run_case(browser, args.base_url, output, viewport, theme))
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated, "base_url": args.base_url, "cases": cases}
    (output / "editor-toolbar.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "editor-toolbar.md").write_text(markdown(cases, generated), encoding="utf-8")

    errors = [item for case in cases for item in case["issues"]]
    print(f"[toolbar] casos={len(cases)} erros={len(errors)}", flush=True)
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
