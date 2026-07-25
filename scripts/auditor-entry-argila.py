#!/usr/bin/env python3
"""Valida a entrada Argila em primeira visita e retorno sem perder manuscritos."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

VIEWPORTS = (("390", 390, 844), ("1440", 1440, 900))
THEMES = (("alvorada", False), ("scriptorium", True))
STORAGE_KEY = "vereda.manuscripts.v1"
TERMS_KEY = "escrevaral-termos-v1"
DARK_KEY = "vereda:dark-mode"


def visible(locator) -> bool:
    return locator.count() > 0 and locator.first.is_visible()


def focus_visible(page, selector: str) -> bool:
    target = page.locator(selector).first
    target.focus()
    return bool(
        page.evaluate(
            """selector => {
              const el = document.querySelector(selector);
              if (!el || !el.matches(':focus-visible')) return false;
              const style = getComputedStyle(el);
              return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
            }""",
            selector,
        )
    )


def no_overflow(page) -> tuple[bool, str]:
    data = page.evaluate(
        """() => ({
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          panelWidth: document.querySelector('.ob-panel')?.scrollWidth || 0,
          panelClient: document.querySelector('.ob-panel')?.clientWidth || 0
        })"""
    )
    ok = (
        data["documentWidth"] <= data["viewportWidth"] + 1
        and data["panelWidth"] <= data["panelClient"] + 1
    )
    return ok, json.dumps(data, ensure_ascii=False)


def capture(page, output: Path, name: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{name}.png"
    page.screenshot(path=str(path), full_page=True)
    return f"screenshots/{path.name}"


def configure_context(browser, width: int, height: int, dark: bool, seed=None):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if dark else "light",
    )
    values = dict(seed or {})
    values[DARK_KEY] = "on" if dark else "off"
    values[TERMS_KEY] = None
    payload = json.dumps(values, ensure_ascii=False)
    context.add_init_script(
        f"""
        const __escrevaralSeed = {payload};
        for (const [key, value] of Object.entries(__escrevaralSeed)) {{
          if (value === null) localStorage.removeItem(key);
          else localStorage.setItem(key, value);
        }}
        """
    )
    return context


def prepare(page, base_url: str, console_errors: list[str]) -> None:
    page.on(
        "console",
        lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
    )
    page.on("pageerror", lambda error: console_errors.append(str(error)))
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector("#terms-overlay:not([hidden])", timeout=20_000)
    page.wait_for_timeout(250)


def content_missing(overlay, expected: tuple[str, ...]) -> list[str]:
    # innerText reflete text-transform. A auditoria deve validar a mensagem,
    # não falhar porque o kicker é apresentado em versais.
    rendered = overlay.inner_text().casefold()
    return [text for text in expected if text.casefold() not in rendered]


def audit_new(browser, base_url: str, output: Path, viewport, theme) -> tuple[dict, str]:
    viewport_name, width, height = viewport
    theme_name, dark = theme
    context = configure_context(browser, width, height, dark, {STORAGE_KEY: None})
    page = context.new_page()
    console_errors: list[str] = []
    issues: list[str] = []
    saved_state = ""
    try:
        prepare(page, base_url, console_errors)
        overlay = page.locator("#terms-overlay")
        new_state = page.locator('[data-ob-state="new"]')
        return_state = page.locator('[data-ob-state="continue"]')
        expected = (
            "Oficina literária digital",
            "Escrevaral",
            "Antes que as palavras sequem.",
            "Uma oficina de escrita feita no Brasil, para gente brasileira.",
            "Abra uma página.",
            "Conhecer a oficina",
        )
        issues.extend(f"texto ausente: {text}" for text in content_missing(overlay, expected))
        if not visible(new_state):
            issues.append("estado de primeira visita não está visível")
        if visible(return_state):
            issues.append("estado de retorno aparece junto da primeira visita")
        visible_states = page.locator('#terms-overlay [data-ob-state]:visible').count()
        if visible_states != 1:
            issues.append(f"esperado 1 estado principal visível; encontrado {visible_states}")
        if not focus_visible(page, '[data-action="accept-terms-blank"]'):
            issues.append("ação principal sem foco perceptível")
        overflow_ok, overflow_data = no_overflow(page)
        if not overflow_ok:
            issues.append(f"overflow: {overflow_data}")
        image = capture(page, output, f"{viewport_name}-{theme_name}-entrada-nova")

        page.locator('[data-action="accept-terms-blank"]').first.click()
        overlay.wait_for(state="hidden", timeout=8_000)
        page.wait_for_function(
            "key => !!localStorage.getItem(key)", arg=STORAGE_KEY, timeout=8_000
        )
        page.wait_for_timeout(250)
        saved_state = page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY)
        parsed = json.loads(saved_state)
        manuscripts = parsed.get("manuscripts", [])
        if len(manuscripts) != 1:
            issues.append(f"abrir página deveria criar 1 manuscrito; criou {len(manuscripts)}")
        if not visible(page.locator(".writing-area")):
            issues.append("área de escrita não ficou disponível")
        issues.extend(f"console: {item}" for item in console_errors)
        return ({
            "viewport": viewport_name,
            "theme": theme_name,
            "state": "new",
            "screenshot": image,
            "issues": issues,
        }, saved_state)
    finally:
        context.close()


def audit_returning(browser, base_url: str, output: Path, viewport, theme, saved_state: str) -> dict:
    viewport_name, width, height = viewport
    theme_name, dark = theme
    context = configure_context(browser, width, height, dark, {STORAGE_KEY: saved_state})
    page = context.new_page()
    console_errors: list[str] = []
    issues: list[str] = []
    try:
        prepare(page, base_url, console_errors)
        overlay = page.locator("#terms-overlay")
        new_state = page.locator('[data-ob-state="new"]')
        return_state = page.locator('[data-ob-state="continue"]')
        if visible(new_state):
            issues.append("estado novo aparece no retorno")
        if not visible(return_state):
            issues.append("estado de retorno não está visível")
        issues.extend(
            f"texto ausente: {text}"
            for text in content_missing(overlay, ("Seu texto está esperando.",))
        )
        if visible(return_state) and not focus_visible(
            page, '[data-action="accept-terms-continue"]'
        ):
            issues.append("ação de continuidade sem foco perceptível")
        overflow_ok, overflow_data = no_overflow(page)
        if not overflow_ok:
            issues.append(f"overflow: {overflow_data}")
        image = capture(page, output, f"{viewport_name}-{theme_name}-entrada-retorno")

        stored_raw = page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY)
        before = json.loads(stored_raw) if stored_raw else {}
        before_ids = [item.get("id") for item in before.get("manuscripts", [])]
        if not visible(return_state):
            issues.append(
                "diagnóstico do retorno: "
                + json.dumps(
                    {
                        "stored": bool(stored_raw),
                        "manuscripts": len(before_ids),
                        "activeId": before.get("activeId"),
                        "newVisible": visible(new_state),
                        "continueVisible": visible(return_state),
                    },
                    ensure_ascii=False,
                )
            )
        else:
            page.locator('[data-action="accept-terms-continue"]').click()
            overlay.wait_for(state="hidden", timeout=8_000)
            page.wait_for_selector(".writing-area", state="visible", timeout=8_000)
            page.wait_for_timeout(250)
            after = json.loads(page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY))
            after_ids = [item.get("id") for item in after.get("manuscripts", [])]
            if before_ids != after_ids:
                issues.append("retomada alterou a coleção de manuscritos")
            if not after.get("activeId"):
                issues.append("retomada não definiu manuscrito ativo")
        issues.extend(f"console: {item}" for item in console_errors)
        return {
            "viewport": viewport_name,
            "theme": theme_name,
            "state": "returning",
            "screenshot": image,
            "issues": issues,
        }
    finally:
        context.close()


def write_report(output: Path, cases: list[dict]) -> None:
    generated = datetime.now(timezone.utc).isoformat()
    errors = sum(len(case["issues"]) for case in cases)
    (output / "resultado.json").write_text(
        json.dumps({"generated_at": generated, "cases": cases, "errors": errors}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    lines = [
        "# Auditoria da entrada Argila", "", f"Gerada em: {generated}",
        f"Casos: {len(cases)}", f"Falhas: {errors}", "",
        "| Largura | Tema | Estado | Resultado |", "|---:|---|---|---|",
    ]
    for case in cases:
        result = "aprovado" if not case["issues"] else "falhou"
        lines.append(f"| {case['viewport']} | {case['theme']} | {case['state']} | {result} |")
    lines += ["", "## Ocorrências", ""]
    if not errors:
        lines.append("Nenhuma falha detectada.")
    else:
        for case in cases:
            for item in case["issues"]:
                lines.append(f"- **{case['viewport']} · {case['theme']} · {case['state']}** — {item}")
    (output / "relatorio.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799/")
    parser.add_argument("--output-dir", default="reports/auditoria/entry-argila-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases: list[dict] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for viewport in VIEWPORTS:
            for theme in THEMES:
                new_case, saved_state = audit_new(browser, args.base_url, output, viewport, theme)
                cases.append(new_case)
                if saved_state:
                    cases.append(audit_returning(browser, args.base_url, output, viewport, theme, saved_state))
        browser.close()
    write_report(output, cases)
    failures = [issue for case in cases for issue in case["issues"]]
    print(f"[entry-argila] casos={len(cases)} falhas={len(failures)}")
    if failures:
        for item in failures:
            print(f"- {item}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
