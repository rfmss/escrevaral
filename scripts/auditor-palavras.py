#!/usr/bin/env python3
"""Valida título, estado vazio, busca e continuidade offline de Palavras."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import Browser, Page, TimeoutError, sync_playwright


VIEWPORTS = (("390", 390, 844), ("1440", 1440, 900))
TERMS_SCRIPT = """
localStorage.setItem('escrevaral-termos-v1', '2026-07-25T00:00:00.000Z');
localStorage.setItem('vrda-first-visit', '1');
"""
DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""


def add_issue(issues: list[dict], viewport: str, area: str, detail: str) -> None:
    issues.append({"viewport": viewport, "area": area, "detail": detail})


def wait_for_controller(page: Page) -> None:
    page.wait_for_function(
        "() => Boolean(window.VeredaLexicalViewController && window.renderLexicalView)",
        timeout=15_000,
    )


def open_words(page: Page) -> None:
    target = page.locator('[data-view-target="biblioteca"]:visible').first
    target.wait_for(state="visible", timeout=10_000)
    target.click()
    page.wait_for_selector('.app-shell[data-view="biblioteca"]', timeout=10_000)


def seed_manuscript(page: Page) -> None:
    page.evaluate(
        """() => {
          if (!getActiveManuscript()) createBlankManuscript();
          titleInput.value = 'A casa de barro';
          writingArea.innerHTML = '<p>A casa guardava um canto escuro. A casa respirava devagar.</p>';
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
          writingArea.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: null,
          }));
        }"""
    )
    page.wait_for_function(
        "() => getActiveManuscript()?.title === 'A casa de barro' && getActiveManuscript()?.text.includes('canto escuro')",
        timeout=10_000,
    )


def screenshot(page: Page, output: Path, viewport: str, state_name: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{viewport}-palavras-{state_name}.png"
    page.screenshot(path=str(path), full_page=True)
    return str(path.relative_to(output))


def assert_title(page: Page, issues: list[dict], viewport: str, stage: str) -> None:
    value = page.locator('[data-lexical-title]').inner_text().strip()
    if value != "Palavras":
        add_issue(issues, viewport, stage, f"título do módulo virou {value!r}")


def run_case(browser: Browser, base_url: str, output: Path, viewport_data: tuple[str, int, int]) -> dict:
    viewport_name, width, height = viewport_data
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
    )
    context.add_init_script(TERMS_SCRIPT)
    page = context.new_page()
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.add_style_tag(content=DISABLE_MOTION)
        wait_for_controller(page)
        seed_manuscript(page)

        open_words(page)
        page.wait_for_selector('[data-lexical-empty]', state="visible", timeout=10_000)

        assert_title(page, issues, viewport_name, "estado vazio")
        empty_text = page.locator('[data-lexical-empty]').inner_text()
        if "Escolha uma palavra" not in empty_text or "A casa de barro" not in empty_text:
            add_issue(issues, viewport_name, "estado vazio", "a orientação não informou a ação e o texto atual")
        if page.locator('[data-lexical-card]').is_visible():
            add_issue(issues, viewport_name, "estado vazio", "o cartão lexical vazio continuou visível")
        evidence["empty"] = screenshot(page, output, viewport_name, "vazio")

        search = page.locator('[data-lexical-search]')
        search.fill("casa")
        page.wait_for_selector('[data-lexical-card] h2', state="visible", timeout=15_000)
        page.wait_for_function(
            "() => document.querySelector('[data-lexical-card] h2')?.textContent.trim().toLowerCase() === 'casa'",
            timeout=15_000,
        )
        assert_title(page, issues, viewport_name, "busca de palavra")
        if page.locator('[data-lexical-context] mark').count() < 1:
            add_issue(issues, viewport_name, "busca de palavra", "nenhuma ocorrência foi destacada no texto")
        evidence["word"] = screenshot(page, output, viewport_name, "palavra")

        # Reproduz o defeito anterior: frase ativa seguida de busca digitada.
        page.evaluate(
            """async () => {
              state.lexical.selectedWord = null;
              state.lexical.selectedPhrase = 'A casa guardava um canto escuro.';
              state.lexical.selectedContext = null;
              await window.renderLexicalView();
            }"""
        )
        page.wait_for_selector('.lexical-frase-texto', state="visible", timeout=15_000)
        assert_title(page, issues, viewport_name, "análise de frase")

        search.fill("")
        search.fill("canto")
        page.wait_for_function(
            """() => {
              const heading = document.querySelector('[data-lexical-card] h2');
              return heading?.textContent.trim().toLowerCase() === 'canto'
                && !document.querySelector('.lexical-frase-texto')
                && state.lexical.selectedPhrase === null;
            }""",
            timeout=15_000,
        )
        assert_title(page, issues, viewport_name, "busca após frase")
        evidence["after_phrase"] = screenshot(page, output, viewport_name, "busca-apos-frase")

        search.press("Escape")
        page.wait_for_selector('[data-lexical-empty]', state="visible", timeout=10_000)
        cleared = page.evaluate(
            "() => !state.lexical.selectedWord && !state.lexical.selectedPhrase && !state.lexical.selectedContext && !state.lexical.selectedRange"
        )
        if not cleared:
            add_issue(issues, viewport_name, "limpeza", "Escape deixou seleção lexical obsoleta")
        assert_title(page, issues, viewport_name, "limpeza")

        overflow = page.locator('.view[data-view-panel="biblioteca"]').evaluate(
            "element => element.scrollWidth > element.clientWidth + 2"
        )
        if overflow:
            add_issue(issues, viewport_name, "layout", "Palavras criou rolagem horizontal interna")

        # O controlador novo precisa continuar presente no pacote offline.
        if viewport_name == "390":
            page.evaluate("async () => { await navigator.serviceWorker.ready; }")
            try:
                page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=8_000)
            except TimeoutError:
                page.reload(wait_until="domcontentloaded", timeout=30_000)
                wait_for_controller(page)
                page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=12_000)

            context.set_offline(True)
            page.reload(wait_until="domcontentloaded", timeout=30_000)
            wait_for_controller(page)
            open_words(page)
            page.wait_for_selector('[data-lexical-empty]', state="visible", timeout=15_000)
            assert_title(page, issues, viewport_name, "offline")
            evidence["offline"] = screenshot(page, output, viewport_name, "offline")
            context.set_offline(False)

        for message in console_errors:
            add_issue(issues, viewport_name, "console", message[:500])
    except Exception as error:  # noqa: BLE001
        add_issue(issues, viewport_name, "execução", repr(error))
    finally:
        try:
            context.set_offline(False)
        except Exception:  # noqa: BLE001
            pass
        context.close()

    return {
        "viewport": viewport_name,
        "issues": issues,
        "evidence": evidence,
    }


def render_markdown(cases: list[dict], generated_at: str) -> str:
    issues = [item for case in cases for item in case["issues"]]
    lines = [
        "# Auditoria da superfície Palavras",
        "",
        f"Gerada em: {generated_at}",
        "",
        f"- Cenários: {len(cases)}",
        f"- Falhas: {len(issues)}",
        "",
        "| Largura | Resultado |",
        "|---:|---|",
    ]
    for case in cases:
        lines.append(f"| {case['viewport']} | {'aprovado' if not case['issues'] else 'falhou'} |")

    lines.extend(["", "## Ocorrências", ""])
    if not issues:
        lines.append("Nenhuma falha detectada.")
    else:
        for issue in issues:
            lines.extend([
                f"### {issue['area']}",
                "",
                f"- Largura: {issue['viewport']} px",
                f"- Detalhe: {issue['detail']}",
                "",
            ])

    lines.extend(["## Evidências", "", "As capturas estão em `screenshots/`.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799/")
    parser.add_argument("--output-dir", default="reports/auditoria/palavras-artifacts")
    args = parser.parse_args()

    base_url = args.base_url if args.base_url.endswith("/") else f"{args.base_url}/"
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [run_case(browser, base_url, output, viewport) for viewport in VIEWPORTS]
        browser.close()

    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated_at, "base_url": base_url, "cases": cases}
    (output / "palavras.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "palavras.md").write_text(render_markdown(cases, generated_at), encoding="utf-8")

    issues = [item for case in cases for item in case["issues"]]
    print(f"[palavras] cenarios={len(cases)} falhas={len(issues)}", flush=True)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()
