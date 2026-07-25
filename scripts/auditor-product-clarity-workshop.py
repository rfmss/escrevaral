#!/usr/bin/env python3
"""Audita clareza, teclado e preservação funcional de Ateliê e Autoria."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

CASES = (
    ("1280", 1280, 800, None),
    ("1366", 1366, 900, None),
    ("1440", 1440, 900, None),
    ("1440-escuro", 1440, 900, "scriptorium"),
    ("390-mobile-protection", 390, 844, None),
)

INIT = """
try {
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
} catch (_) {}
"""

DISABLE_MOTION = """
*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
"""


def add(issues, case, kind, detail):
    issues.append({"case": case, "kind": kind, "detail": detail})


def screenshot(page, output: Path, case: str, state: str) -> str:
    folder = output / "screenshots"
    folder.mkdir(parents=True, exist_ok=True)
    name = f"{case}-workshop-{state}.png"
    page.screenshot(path=str(folder / name), full_page=False)
    return f"screenshots/{name}"


def no_overflow(page):
    return page.evaluate("""() => {
      const d = document.scrollingElement || document.documentElement;
      return {scroll:d.scrollWidth, client:d.clientWidth};
    }""")


def run_case(browser, base_url: str, output: Path, case):
    name, width, height, theme = case
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if theme else "light",
    )
    context.add_init_script(INIT)
    page = context.new_page()
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: console_errors.append(str(err)))
    issues, evidence, metrics = [], {}, {}

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.add_style_tag(content=DISABLE_MOTION)
        page.evaluate("theme => theme ? document.documentElement.dataset.theme=theme : delete document.documentElement.dataset.theme", theme)
        page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)

        if width < 821:
            page.evaluate("() => setView('autoria', {updateRoute:true, routeMode:'replace'})")
            page.wait_for_selector('[data-view-panel="autoria"] .certificate-paper', state="visible")
            journey_visible = page.locator(".proof-clarity-journey").count() and page.locator(".proof-clarity-journey").is_visible()
            if journey_visible:
                add(issues, name, "mobile-journey", "A jornada desktop permaneceu visível no celular.")
            for selector in (".certificate-grid", ".proof-actions", ".proof-blockchain-section", ".proof-validate-section"):
                node = page.locator(f'[data-view-panel="autoria"] {selector}').first
                if not node.count() or node.evaluate("el => el.parentElement?.classList.contains('proof-clarity-body')"):
                    add(issues, name, "mobile-restore", f"{selector} não voltou à estrutura original.")
            overflow = no_overflow(page)
            metrics["document"] = overflow
            if overflow["scroll"] > overflow["client"] + 2:
                add(issues, name, "horizontal-overflow", str(overflow))
            evidence["mobile"] = screenshot(page, output, name, "mobile-original-flow")
        else:
            # Ateliê
            page.evaluate("() => setView('academia', {updateRoute:true, routeMode:'replace'})")
            page.wait_for_selector('[data-view-panel="academia"] .academy-tools', state="visible")
            tabs = page.locator('[data-view-panel="academia"] .academy-tool-tab')
            if tabs.count() != 5:
                add(issues, name, "atelier-tabs", f"abas encontradas={tabs.count()}, esperado=5")
            visible_panels = page.locator('[data-view-panel="academia"] .academy-tool-panel').evaluate_all(
                "els => els.filter(el => {const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'}).length"
            )
            if visible_panels != 1:
                add(issues, name, "atelier-density", f"painéis detalhados visíveis={visible_panels}, esperado=1")
            second = tabs.nth(1)
            if second.get_attribute("tabindex") != "0":
                add(issues, name, "atelier-keyboard", "A segunda ferramenta não entrou na ordem de foco desktop.")
            second.focus()
            second.press("Enter")
            page.wait_for_timeout(220)
            target_id = second.get_attribute("for")
            checked = page.locator(f"#{target_id}").is_checked() if target_id else False
            if not checked:
                add(issues, name, "atelier-keyboard", "Enter não ativou a ferramenta escolhida.")

            for selector, label in ((".at-panel-rimalab", "painel"), (".rimalab-tool", "ferramenta"), (".rimalab-workbench", "bancada")):
                node = page.locator(f'[data-view-panel="academia"] {selector}').first
                if not node.count() or not node.is_visible():
                    add(issues, name, "rimalab-missing", f"{label} do RimaLab não ficou visível.")
                    continue
                dimensions = node.evaluate("el => ({scroll:el.scrollWidth, client:el.clientWidth})")
                if dimensions["scroll"] > dimensions["client"] + 2:
                    add(issues, name, "rimalab-internal-overflow", f"{label}: {dimensions}")
            evidence["atelier"] = screenshot(page, output, name, "atelier-rimalab")

            # Autoria
            page.evaluate("() => setView('autoria', {updateRoute:true, routeMode:'replace'})")
            page.wait_for_selector(".proof-clarity-journey", state="visible")
            steps = page.locator(".proof-clarity-step")
            if steps.count() != 5:
                add(issues, name, "authorship-steps", f"etapas encontradas={steps.count()}, esperado=5")
            open_count = steps.evaluate_all("els => els.filter(el => el.open).length")
            if open_count != 1 or not steps.nth(0).evaluate("el => el.open"):
                add(issues, name, "authorship-initial", f"etapas abertas={open_count}; a primeira deveria estar aberta.")
            evidence["authorship_initial"] = screenshot(page, output, name, "authorship-initial")

            required = (
                (0, '[data-action="sign-proof-author"]', "assinatura"),
                (1, '[data-action="export-proof"]', "guardar cópia"),
                (2, '[data-action="stamp-blockchain"]', "carimbo"),
                (3, '[data-proof-validate-input]', "verificação"),
                (4, '[data-action="create-version"]', "versão"),
            )
            for index, selector, label in required:
                summary = steps.nth(index).locator(".proof-clarity-summary").first
                if not steps.nth(index).evaluate("el => el.open"):
                    summary.focus()
                    summary.press("Enter")
                    page.wait_for_timeout(120)
                if steps.evaluate_all("els => els.filter(el => el.open).length") != 1:
                    add(issues, name, "authorship-accordion", f"Mais de uma etapa aberta ao acessar {label}.")
                node = steps.nth(index).locator(selector).first
                if not node.count():
                    add(issues, name, "action-missing", f"Ação de {label} não está na etapa esperada.")
            evidence["authorship"] = screenshot(page, output, name, "authorship-last-step")

            overflow = no_overflow(page)
            metrics["document"] = overflow
            if overflow["scroll"] > overflow["client"] + 2:
                add(issues, name, "horizontal-overflow", str(overflow))

        for message in console_errors:
            add(issues, name, "console-error", message[:500])
    except Exception as error:
        add(issues, name, "audit-crash", repr(error))
    finally:
        context.close()

    return {"case": name, "metrics": metrics, "evidence": evidence, "issues": issues}


def markdown(cases, generated):
    issues = [item for case in cases for item in case["issues"]]
    lines = [
        "# Auditoria de Clareza — Oficina e Autoria desktop", "",
        f"Gerada em: {generated}", "",
        f"- Cenários: {len(cases)}", f"- Falhas: {len(issues)}", "",
        "| Cenário | Resultado |", "|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['case']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if not issues:
        lines.append("Nenhuma falha detectada.")
    for item in issues:
        lines += [f"### {item['kind']}", "", f"- Cenário: {item['case']}", f"- Detalhe: {item['detail']}", ""]
    lines += ["## Evidências", "", "Capturas do Ateliê, Autoria e proteção móvel estão em `screenshots/`.", ""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/product-clarity-workshop-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        cases = [run_case(browser, args.base_url, output, case) for case in CASES]
        browser.close()
    generated = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated, "base_url": args.base_url, "cases": cases}
    (output / "product-clarity-workshop.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "product-clarity-workshop.md").write_text(markdown(cases, generated), encoding="utf-8")
    errors = [item for case in cases for item in case["issues"]]
    print(f"[clarity-workshop] cenários={len(cases)} falhas={len(errors)}", flush=True)
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
