#!/usr/bin/env python3
"""Valida a descoberta da Mesa no celular e o ciclo real sem internet."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import Browser, BrowserContext, Page, TimeoutError, sync_playwright


TERMS_SCRIPT = """
localStorage.setItem('escrevaral-termos-v1', '2026-07-25T00:00:00.000Z');
localStorage.setItem('vrda-first-visit', '1');
"""


def add_issue(issues: list[dict], area: str, detail: str) -> None:
    issues.append({"area": area, "detail": detail})


def wait_for_controller(page: Page, expected_suffix: str) -> str:
    page.evaluate("""async () => {
      if (!('serviceWorker' in navigator)) throw new Error('service worker indisponível');
      await navigator.serviceWorker.ready;
    }""")
    try:
        page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=8_000)
    except TimeoutError:
        page.reload(wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=12_000)

    script_url = page.evaluate("() => navigator.serviceWorker.controller?.scriptURL || ''")
    if not script_url.endswith(expected_suffix):
        raise RuntimeError(f"controlador inesperado: {script_url or 'ausente'}")
    return script_url


def test_mobile_entry(browser: Browser, base_url: str, output: Path) -> dict:
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    context.add_init_script(TERMS_SCRIPT)
    page = context.new_page()
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.locator('[data-action="toggle-bandeja"]').click()
        entry = page.locator('[data-mesa-portatil-entry="bandeja"]')
        entry.wait_for(state="visible", timeout=8_000)

        if entry.inner_text().strip() != "Mesa no celular":
            add_issue(issues, "descoberta móvel", f"texto inesperado: {entry.inner_text()!r}")
        if not entry.get_attribute("href") or not entry.get_attribute("href").endswith("/pegar/"):
            add_issue(issues, "descoberta móvel", f"destino inesperado: {entry.get_attribute('href')}")

        screenshots = output / "screenshots"
        screenshots.mkdir(parents=True, exist_ok=True)
        path = screenshots / "390-mesa-no-celular-mais.png"
        page.screenshot(path=str(path), full_page=True)
        evidence["drawer"] = str(path.relative_to(output))

        page.evaluate("""() => {
          window.persistState = async () => {
            localStorage.setItem('mesa-portatil-save-test', 'ok');
            return true;
          };
        }""")
        entry.click()
        page.wait_for_url("**/pegar/", timeout=15_000)
        saved = page.evaluate("() => localStorage.getItem('mesa-portatil-save-test')")
        if saved != "ok":
            add_issue(issues, "preservação", "a navegação ocorreu sem confirmar a gravação simulada")

        for message in console_errors:
            add_issue(issues, "console móvel", message[:500])
    except Exception as error:  # noqa: BLE001
        add_issue(issues, "descoberta móvel", repr(error))
    finally:
        context.close()

    return {"case": "mobile-entry", "issues": issues, "evidence": evidence}


def test_archive_entry(browser: Browser, base_url: str, output: Path) -> dict:
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    context = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    context.add_init_script(TERMS_SCRIPT)
    page = context.new_page()

    try:
        page.goto(f"{base_url}#arquivo", wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector('.app-shell[data-view="arquivo"]', timeout=20_000)
        details = page.locator(".archive-security-details")
        if details.count() and not details.get_attribute("open"):
            details.locator("summary").click()

        entry = page.locator('[data-mesa-portatil-entry="acervo"]')
        entry.wait_for(state="visible", timeout=8_000)
        if entry.inner_text().strip() != "Mesa no celular":
            add_issue(issues, "descoberta no Acervo", f"texto inesperado: {entry.inner_text()!r}")
        if not entry.get_attribute("href") or not entry.get_attribute("href").endswith("/pegar/"):
            add_issue(issues, "descoberta no Acervo", f"destino inesperado: {entry.get_attribute('href')}")

        screenshots = output / "screenshots"
        screenshots.mkdir(parents=True, exist_ok=True)
        path = screenshots / "1440-mesa-no-celular-acervo.png"
        entry.scroll_into_view_if_needed()
        page.screenshot(path=str(path), full_page=True)
        evidence["archive"] = str(path.relative_to(output))
    except Exception as error:  # noqa: BLE001
        add_issue(issues, "descoberta no Acervo", repr(error))
    finally:
        context.close()

    return {"case": "archive-entry", "issues": issues, "evidence": evidence}


def test_offline_main(browser: Browser, base_url: str) -> dict:
    issues: list[dict] = []
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    context.add_init_script(TERMS_SCRIPT)
    page = context.new_page()

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".writing-area", timeout=20_000)
        wait_for_controller(page, "/service-worker.js")
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=15_000)
        page.wait_for_selector(".writing-area", timeout=15_000)
        if not page.locator('[data-mesa-portatil-entry="bandeja"]').count():
            add_issue(issues, "aplicativo sem internet", "a entrada Mesa no celular não veio do cache atualizado")
    except Exception as error:  # noqa: BLE001
        add_issue(issues, "aplicativo sem internet", repr(error))
    finally:
        context.set_offline(False)
        context.close()

    return {"case": "offline-main", "issues": issues, "evidence": {}}


def test_offline_portable(browser: Browser, base_url: str) -> dict:
    issues: list[dict] = []
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    page = context.new_page()

    try:
        page.goto(f"{base_url}pegar/", wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector("#telaAguardando", timeout=20_000)
        for selector, label in (("#btnReceber", "Receber do computador"), ("#btnAbrirEsc", "Abrir arquivo .esc")):
            locator = page.locator(selector)
            if not locator.is_visible() or label not in locator.inner_text():
                add_issue(issues, "Mesa Portátil", f"ação ausente ou alterada: {label}")

        wait_for_controller(page, "/pegar/sw.js")
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector("#telaAguardando.ativa", timeout=15_000)
        if not page.locator("#btnReceber").is_visible() or not page.locator("#btnAbrirEsc").is_visible():
            add_issue(issues, "Mesa Portátil sem internet", "as ações principais não permaneceram disponíveis")
    except Exception as error:  # noqa: BLE001
        add_issue(issues, "Mesa Portátil sem internet", repr(error))
    finally:
        context.set_offline(False)
        context.close()

    return {"case": "offline-portable", "issues": issues, "evidence": {}}


def render_markdown(cases: list[dict], generated_at: str) -> str:
    issues = [issue for case in cases for issue in case["issues"]]
    lines = [
        "# Auditoria da Mesa no celular",
        "",
        f"Gerada em: {generated_at}",
        "",
        f"- Cenários: {len(cases)}",
        f"- Falhas: {len(issues)}",
        "",
        "| Cenário | Resultado |",
        "|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['case']} | {'aprovado' if not case['issues'] else 'falhou'} |")

    lines.extend(["", "## Ocorrências", ""])
    if not issues:
        lines.append("Nenhuma falha detectada.")
    else:
        for issue in issues:
            lines.extend([f"### {issue['area']}", "", issue["detail"], ""])

    lines.extend(["## Evidências", "", "As capturas de descoberta estão em `screenshots/`.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799/")
    parser.add_argument("--output-dir", default="reports/auditoria/mesa-portatil-artifacts")
    args = parser.parse_args()

    base_url = args.base_url if args.base_url.endswith("/") else f"{args.base_url}/"
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [
            test_mobile_entry(browser, base_url, output),
            test_archive_entry(browser, base_url, output),
            test_offline_main(browser, base_url),
            test_offline_portable(browser, base_url),
        ]
        browser.close()

    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated_at, "base_url": base_url, "cases": cases}
    (output / "mesa-portatil.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "mesa-portatil.md").write_text(render_markdown(cases, generated_at), encoding="utf-8")

    issues = [issue for case in cases for issue in case["issues"]]
    print(f"[mesa-portatil] cenarios={len(cases)} falhas={len(issues)}", flush=True)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()
