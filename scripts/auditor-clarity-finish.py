#!/usr/bin/env python3
"""Audita o acabamento final da fase Clareza do Produto.

Cobre diálogos, retorno de foco, estados vazios, temas, mensagens críticas,
overflow e console sem alterar dados persistidos pelo produto.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

CASES = (
    ("1280-alvorada", 1280, 820, None),
    ("1440-scriptorium", 1440, 900, "scriptorium"),
    ("390-alvorada", 390, 844, None),
)

SEED = {
    "id": "finish-ms",
    "title": "Candidata final",
    "kind": "Conto",
    "type": "manuscrito",
    "status": "Em escrita",
    "text": "Uma frase brasileira preserva a escrita local e o ritmo do manuscrito.",
    "description": "Texto-canário da auditoria final.",
    "tags": ["candidata"],
    "progress": 70,
    "createdAt": "2026-07-25T00:00:00.000Z",
    "updatedAt": "2026-07-25T00:00:00.000Z",
}

INIT_STORAGE = f"""
try {{
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
  localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({{
    manuscripts: {json.dumps([SEED], ensure_ascii=False)},
    activeId: 'finish-ms',
    archive: {{filter:'all',statusFilter:'all',search:'',sort:'updated'}},
    layout: {{leftCollapsed:false,rightCollapsed:false}},
    ui: {{}}
  }}));
}} catch (_) {{}}
"""

DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""


def add(issues: list[dict], severity: str, area: str, title: str, evidence: str) -> None:
    issues.append({"severity": severity, "area": area, "title": title, "evidence": evidence})


def visible(locator) -> bool:
    return locator.count() > 0 and locator.first.is_visible()


def screenshot(page, output: Path, case: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{case}-{state}.png"
    page.screenshot(path=str(directory / name), full_page=False)
    return f"screenshots/{name}"


def dismiss_transients(page) -> None:
    for selector in (
        '[data-action="accept-terms-blank"]',
        '[data-action="welcome-write"]',
        '#update-dismiss-btn',
        '#save-hint-dismiss',
        '#backup-nudge-dismiss',
    ):
        item = page.locator(selector).first
        try:
            if item.count() and item.is_visible(timeout=250):
                item.click()
        except Exception:
            pass


def prepare(page, base_url: str, theme: str | None) -> None:
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector(".app-shell", timeout=20_000)
    page.add_style_tag(content=DISABLE_MOTION)
    dismiss_transients(page)
    page.wait_for_function("() => typeof setView === 'function' && window.VeredaDialog?.init", timeout=15_000)
    page.evaluate(
        "theme => theme ? document.documentElement.dataset.theme = theme : document.documentElement.removeAttribute('data-theme')",
        theme,
    )
    page.wait_for_timeout(120)


def audit_dialogs(page, issues: list[dict], evidence: dict, output: Path, case: str) -> None:
    if page.viewport_size["width"] < 821:
        return

    trigger = page.locator('[data-view-target="arquivo"]').first
    trigger.focus()
    page.evaluate(
        """() => {
          window.__finishDialogResult = null;
          window.VeredaDialog.confirm('Confirmar ação de teste?', value => { window.__finishDialogResult = value; });
        }"""
    )
    dialog = page.locator('#vrda-dialog-overlay:not([hidden]) .vrda-dialog').first
    page.wait_for_selector('#vrda-dialog-overlay:not([hidden]) .vrda-dialog', timeout=5_000)
    page.wait_for_timeout(80)

    if dialog.get_attribute("role") != "dialog" or dialog.get_attribute("aria-modal") != "true":
        add(issues, "P1", "diálogos", "diálogo principal perdeu semântica modal", dialog.evaluate("el => el.outerHTML.slice(0,500)"))

    active = page.evaluate("() => document.activeElement?.id || document.activeElement?.className || ''")
    if active != "vrda-dialog-ok":
        add(issues, "P1", "diálogos", "confirmação não inicia na ação previsível", f"foco inicial={active!r}")

    page.keyboard.press("Tab")
    tab_target = page.evaluate("() => document.activeElement?.id || ''")
    if tab_target != "vrda-dialog-cancel":
        add(issues, "P1", "diálogos", "Tab escapou ou não circulou dentro do diálogo", f"após Tab={tab_target!r}")

    page.keyboard.press("Shift+Tab")
    reverse_target = page.evaluate("() => document.activeElement?.id || ''")
    if reverse_target != "vrda-dialog-ok":
        add(issues, "P1", "diálogos", "Shift+Tab não circulou dentro do diálogo", f"após Shift+Tab={reverse_target!r}")

    evidence["dialog"] = screenshot(page, output, case, "dialog-confirm")
    page.keyboard.press("Escape")
    page.wait_for_timeout(80)
    if visible(page.locator("#vrda-dialog-overlay")):
        add(issues, "P1", "diálogos", "Escape não fecha a confirmação", "o overlay permaneceu visível com foco no botão OK")
        page.locator("#vrda-dialog-cancel").click()

    page.wait_for_timeout(80)
    return_id = page.evaluate("() => document.activeElement?.getAttribute('data-view-target') || document.activeElement?.id || ''")
    if return_id != "arquivo":
        add(issues, "P1", "diálogos", "foco não voltou ao gatilho da confirmação", f"destino={return_id!r}")

    trigger.focus()
    page.evaluate(
        """() => {
          window.__finishPromptResult = undefined;
          window.VeredaDialog.prompt('Nome da nota', 'Rascunho', value => { window.__finishPromptResult = value; });
        }"""
    )
    page.wait_for_selector('#vrda-dialog-overlay:not([hidden]) #vrda-dialog-input', timeout=5_000)
    page.wait_for_timeout(80)
    prompt_active = page.evaluate("() => document.activeElement?.id || ''")
    if prompt_active != "vrda-dialog-input":
        add(issues, "P1", "diálogos", "prompt não inicia no campo de texto", f"foco inicial={prompt_active!r}")
    page.keyboard.press("Escape")
    page.wait_for_timeout(80)
    if visible(page.locator("#vrda-dialog-overlay")):
        add(issues, "P1", "diálogos", "Escape não fecha o prompt", "o overlay permaneceu visível")
        page.locator("#vrda-dialog-cancel").click()


def audit_empty_states(page, issues: list[dict], evidence: dict, output: Path, case: str) -> None:
    page.evaluate("() => setView('arquivo', {updateRoute:false})")
    page.wait_for_selector(".archive-view", state="visible", timeout=10_000)

    page.evaluate(
        """() => {
          window.__finishSeed = JSON.parse(JSON.stringify(state.manuscripts));
          state.manuscripts = [];
          state.activeId = null;
          state.archive.search = '';
          renderManuscriptNavigation();
          renderProjectGrid();
          renderMetadataForm();
        }"""
    )
    empty = page.locator("[data-project-grid] .archive-empty").first
    page.wait_for_selector("[data-project-grid] .archive-empty", state="visible", timeout=5_000)
    true_actions = empty.locator('button,a,[role="button"]').count()
    if true_actions != 1:
        add(issues, "P1", "estado vazio", "Acervo vazio não oferece uma ação principal única", f"ações visíveis={true_actions}")
    elif "criar" not in (empty.inner_text() or "").lower():
        add(issues, "P1", "estado vazio", "ação do Acervo vazio não orienta a criação", empty.inner_text())
    evidence["empty_archive"] = screenshot(page, output, case, "archive-empty")

    page.evaluate(
        """() => {
          state.manuscripts = JSON.parse(JSON.stringify(window.__finishSeed));
          state.activeId = state.manuscripts[0]?.id || null;
          state.archive.search = 'termo inexistente da auditoria';
          const input = document.querySelector('.archive-search input, input.archive-search');
          if (input) input.value = state.archive.search;
          renderManuscriptNavigation();
          renderProjectGrid();
          renderMetadataForm();
        }"""
    )
    search_empty = page.locator("[data-project-grid] .archive-empty").first
    page.wait_for_selector("[data-project-grid] .archive-empty", state="visible", timeout=5_000)
    search_actions = search_empty.locator('button,a,[role="button"]').count()
    if search_actions != 1:
        add(issues, "P1", "estado vazio", "busca sem resultado não oferece uma saída principal única", f"ações visíveis={search_actions}")
    elif "limpar" not in (search_empty.inner_text() or "").lower():
        add(issues, "P1", "estado vazio", "busca sem resultado não oferece limpar busca", search_empty.inner_text())
    evidence["empty_search"] = screenshot(page, output, case, "archive-search-empty")


def audit_messages(page, issues: list[dict]) -> None:
    required = (
        ("#tab-conflict-banner", "alert"),
        ("#storage-recovery-banner", "alert"),
        ("#update-banner", "status"),
        ("#backup-nudge-banner", "status"),
    )
    for selector, role in required:
        node = page.locator(selector).first
        if not node.count():
            add(issues, "P1", "mensagens", "mensagem crítica ausente", selector)
            continue
        if node.get_attribute("role") != role:
            add(issues, "P1", "mensagens", "mensagem crítica com prioridade incorreta", f"{selector}: role={node.get_attribute('role')!r}, esperado={role!r}")

    save = page.locator("[data-save-status]").first
    if not save.count():
        add(issues, "P1", "mensagens", "estado de salvamento ausente", "[data-save-status]")


def audit_theme_and_geometry(page, issues: list[dict], metrics: dict, evidence: dict, output: Path, case: str) -> None:
    geometry = page.evaluate(
        """() => {
          const d = document.scrollingElement || document.documentElement;
          return {scroll:d.scrollWidth, client:d.clientWidth, width:innerWidth};
        }"""
    )
    metrics["document"] = geometry
    if geometry["scroll"] > geometry["client"] + 2:
        add(issues, "P1", "geometria", "rolagem horizontal não intencional", str(geometry))

    contrast = page.evaluate(
        """() => {
          const probe = document.createElement('span');
          probe.style.position = 'fixed';
          probe.style.pointerEvents = 'none';
          probe.style.opacity = '0';
          document.body.appendChild(probe);
          const rgb = value => {
            probe.style.color = value;
            const raw = getComputedStyle(probe).color;
            const nums = raw.match(/[\d.]+/g)?.slice(0,3).map(Number) || [0,0,0];
            return nums;
          };
          const lum = c => {
            const v = c.map(x => x / 255).map(x => x <= .04045 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4));
            return .2126*v[0] + .7152*v[1] + .0722*v[2];
          };
          const ratio = (a,b) => {
            const x=lum(rgb(a)), y=lum(rgb(b));
            return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
          };
          const style = getComputedStyle(document.documentElement);
          const values = {
            ink: style.getPropertyValue('--ink').trim(),
            muted: style.getPropertyValue('--muted').trim(),
            paper: style.getPropertyValue('--paper').trim(),
            card: style.getPropertyValue('--card').trim(),
            primary: style.getPropertyValue('--primary').trim(),
          };
          const result = {
            inkPaper: ratio('var(--ink)', 'var(--paper)'),
            inkCard: ratio('var(--ink)', 'var(--card)'),
            mutedPaper: ratio('var(--muted)', 'var(--paper)'),
            primaryPaper: ratio('var(--primary)', 'var(--paper)'),
            values,
          };
          probe.remove();
          return result;
        }"""
    )
    metrics["contrast"] = contrast
    for label in ("inkPaper", "inkCard", "primaryPaper"):
        if contrast[label] < 4.5:
            add(issues, "P1", "contraste", f"contraste estrutural insuficiente: {label}", f"razão={contrast[label]:.2f}; variáveis={contrast['values']}")
    if contrast["mutedPaper"] < 3.0:
        add(issues, "P1", "contraste", "texto secundário perde legibilidade", f"razão={contrast['mutedPaper']:.2f}; variáveis={contrast['values']}")

    page.evaluate("() => setView('editor', {updateRoute:false})")
    page.wait_for_timeout(100)
    evidence["theme"] = screenshot(page, output, case, "editor-theme")


def run_case(browser, base_url: str, output: Path, spec: tuple) -> dict:
    name, width, height, theme = spec
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if theme else "light",
    )
    context.add_init_script(INIT_STORAGE)
    page = context.new_page()
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    metrics: dict = {}
    try:
        prepare(page, base_url, theme)
        audit_dialogs(page, issues, evidence, output, name)
        audit_empty_states(page, issues, evidence, output, name)
        audit_messages(page, issues)
        audit_theme_and_geometry(page, issues, metrics, evidence, output, name)
    except Exception as error:
        add(issues, "P1", "auditoria", "auditoria final abortou", f"{type(error).__name__}: {error}")
    finally:
        for message in console_errors:
            add(issues, "P1", "console", "erro JavaScript não tratado", message[:500])
        context.close()
    return {"case": name, "metrics": metrics, "evidence": evidence, "issues": issues}


def write_reports(output: Path, cases: list[dict], base_url: str) -> None:
    generated = datetime.now(timezone.utc).isoformat()
    issues = [item for case in cases for item in case["issues"]]
    counts = {severity: sum(1 for item in issues if item["severity"] == severity) for severity in ("P0", "P1", "P2")}
    payload = {"generated_at": generated, "base_url": base_url, "counts": counts, "cases": cases}
    (output / "clarity-finish.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Auditoria final — Clareza do Produto", "",
        f"Gerada em: {generated}", "",
        f"- Cenários: {len(cases)}", f"- P0: {counts['P0']}", f"- P1: {counts['P1']}", f"- P2: {counts['P2']}", "",
        "| Cenário | Resultado |", "|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['case']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if not issues:
        lines.append("Nenhuma falha detectada.")
    else:
        for item in issues:
            lines += [f"### {item['severity']} · {item['area']} · {item['title']}", "", f"- Evidência: {item['evidence']}", ""]
    lines += ["## Evidências", "", "Capturas dos diálogos, estados vazios e temas estão em `screenshots/`.", ""]
    (output / "clarity-finish.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/clarity-finish-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [run_case(browser, args.base_url.rstrip("/"), output, spec) for spec in CASES]
        browser.close()
    write_reports(output, cases, args.base_url)
    blocking = [item for case in cases for item in case["issues"] if item["severity"] in ("P0", "P1")]
    print(f"[clarity-finish] cenários={len(cases)} bloqueios={len(blocking)}")
    raise SystemExit(1 if blocking else 0)


if __name__ == "__main__":
    main()
