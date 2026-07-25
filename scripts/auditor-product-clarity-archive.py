#!/usr/bin/env python3
"""Audita hierarquia, filtros, lista e inspector do Acervo desktop."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

DESKTOPS = (
    ("1280", 1280, 820, None),
    ("1366", 1366, 900, None),
    ("1440", 1440, 900, None),
    ("1440-escuro", 1440, 900, "scriptorium"),
)

MANUSCRIPTS = [
    {
        "id": "rio",
        "title": "O rio que lembrava",
        "kind": "Conto",
        "type": "manuscrito",
        "status": "Em escrita",
        "text": "Naquele verão o rio mudou de cor e ninguém soube explicar. " * 18,
        "description": "Um conto sobre memória, território e água.",
        "tags": ["rio", "memória"],
        "progress": 42,
        "pinned": True,
        "createdAt": "2026-07-20T10:00:00.000Z",
        "updatedAt": "2026-07-25T10:00:00.000Z",
    },
    {
        "id": "marco",
        "title": "Fragmentos de março sem uma palavra desnecessariamente cortada",
        "kind": "Poesia",
        "type": "manuscrito",
        "status": "Revisão",
        "text": "O vento carrega sílabas que ninguém pronunciou. " * 9,
        "description": "Poemas curtos reunidos ao longo do mês.",
        "tags": ["poesia"],
        "progress": 78,
        "createdAt": "2026-07-18T10:00:00.000Z",
        "updatedAt": "2026-07-24T09:00:00.000Z",
    },
    {
        "id": "bordas",
        "title": "Caderno de bordas",
        "kind": "Crônica",
        "type": "manuscrito",
        "status": "Pausado",
        "text": "A rua começava onde terminava a pressa. " * 12,
        "description": "Observações de caminhadas e conversas.",
        "tags": ["cidade"],
        "progress": 26,
        "createdAt": "2026-07-15T10:00:00.000Z",
        "updatedAt": "2026-07-22T08:00:00.000Z",
    },
    {
        "id": "personagem",
        "title": "Ficha de Maria das Dores",
        "kind": "Personagem",
        "type": "personagem",
        "status": "Concluído",
        "text": "Maria guardava recibos em caixas de fósforo.",
        "description": "Ficha de personagem para o romance.",
        "tags": ["personagem"],
        "progress": 100,
        "createdAt": "2026-07-13T10:00:00.000Z",
        "updatedAt": "2026-07-19T08:00:00.000Z",
    },
    {
        "id": "lugar",
        "title": "A casa de janela azul",
        "kind": "Lugar",
        "type": "lugar",
        "status": "Em escrita",
        "text": "A casa tinha três portas e nenhuma levava ao mesmo quintal.",
        "description": "Ficha de lugar.",
        "tags": ["lugar"],
        "progress": 35,
        "createdAt": "2026-07-12T10:00:00.000Z",
        "updatedAt": "2026-07-18T08:00:00.000Z",
    },
    {
        "id": "rascunho",
        "title": "Anotação para depois",
        "kind": "Rascunho",
        "type": "quick-note",
        "status": "Em escrita",
        "text": "Uma imagem ainda sem destino.",
        "description": "",
        "tags": [],
        "progress": 0,
        "createdAt": "2026-07-10T10:00:00.000Z",
        "updatedAt": "2026-07-17T08:00:00.000Z",
    },
]

INIT_STORAGE = """
try {
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
  localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
    manuscripts: %s,
    activeId: 'rio',
    archive: {filter:'all',statusFilter:'all',search:'',sort:'updated'},
    layout: {leftCollapsed:true,rightCollapsed:true},
    ui: {}
  }));
} catch (_) {}
""" % json.dumps(MANUSCRIPTS, ensure_ascii=False)

DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""


def add_issue(issues: list[dict], case: str, kind: str, detail: str) -> None:
    issues.append({"case": case, "kind": kind, "detail": detail})


def rect(locator) -> dict:
    return locator.evaluate(
        """el => { const r=el.getBoundingClientRect(); return {
          left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height
        }; }"""
    )


def visible(locator) -> bool:
    return locator.count() > 0 and locator.is_visible()


def dismiss_transients(page) -> None:
    for selector in ('[data-action="accept-terms-blank"]', '[data-action="welcome-write"]', '#update-dismiss-btn', '#save-hint-dismiss'):
        item = page.locator(selector).first
        try:
            if item.count() and item.is_visible(timeout=250):
                item.click()
        except Exception:
            pass


def screenshot(page, output: Path, case: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{case}-archive-{state}.png"
    page.screenshot(path=str(directory / name), full_page=False)
    return f"screenshots/{name}"


def prepare(page, base_url: str, theme: str | None) -> None:
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector(".app-shell", timeout=20_000)
    page.add_style_tag(content=DISABLE_MOTION)
    if theme:
        page.evaluate("theme => document.documentElement.dataset.theme = theme", theme)
    dismiss_transients(page)
    page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)
    page.evaluate("() => setView('arquivo', {updateRoute:false})")
    page.wait_for_selector(".archive-view", state="visible", timeout=10_000)
    page.wait_for_selector(".project-card", state="visible", timeout=10_000)


def run_desktop(browser, base_url: str, output: Path, spec: tuple) -> dict:
    name, width, height, theme = spec
    context = browser.new_context(viewport={"width": width, "height": height}, color_scheme="dark" if theme else "light", reduced_motion="reduce")
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
        page.wait_for_function("() => document.querySelector('.archive-controls')?.dataset.archiveClarity === 'true'", timeout=10_000)

        search = page.locator(".archive-search").first
        sort = page.locator(".archive-sort").first
        disclosure = page.locator(".archive-filter-disclosure").first
        filter_bar = page.locator("[data-archive-filter-bar]").first
        status_bar = page.locator("[data-archive-status-bar]").first
        project_grid = page.locator("[data-project-grid]").first
        cards = page.locator(".project-card")
        panel = page.locator(".archive-detail-panel").first
        resumes = page.locator(".resume-document")

        if not visible(search) or not visible(sort):
            add_issue(issues, name, "finding", "busca ou ordenação não está visível")
        if not visible(disclosure):
            add_issue(issues, name, "filter-disclosure", "gatilho Filtrar não está visível")
        if disclosure.get_attribute("open") is not None:
            add_issue(issues, name, "filter-initial", "filtros começaram abertos")
        if visible(filter_bar) or visible(status_bar):
            add_issue(issues, name, "filter-initial", "barras de filtro ficaram visíveis no estado recolhido")

        doc_width = page.evaluate("() => {const d=document.scrollingElement||document.documentElement;return {scroll:d.scrollWidth,client:d.clientWidth}}")
        metrics["document"] = doc_width
        if doc_width["scroll"] > doc_width["client"] + 2:
            add_issue(issues, name, "horizontal-overflow", str(doc_width))

        if resumes.count() > 3:
            add_issue(issues, name, "resume-count", f"itens de retomada={resumes.count()}")
        if resumes.count() >= 2:
            first_resume = rect(resumes.nth(0))
            second_resume = rect(resumes.nth(1))
            if abs(first_resume["top"] - second_resume["top"]) > 3:
                add_issue(issues, name, "resume-layout", "itens de retomada não formam faixa única")
            long_title = resumes.filter(has_text="Fragmentos de março").first
            if long_title.count():
                title = long_title.locator("strong")
                if title.evaluate("el => el.scrollWidth > el.clientWidth + 2"):
                    add_issue(issues, name, "resume-title", "título longo continua truncado horizontalmente")

        if cards.count() < 4:
            add_issue(issues, name, "seed", f"cartões renderizados={cards.count()}")
        elif cards.count() >= 2:
            first = rect(cards.nth(0))
            second = rect(cards.nth(1))
            if abs(first["left"] - second["left"]) > 3 or second["top"] < first["bottom"] - 3:
                add_issue(issues, name, "list-layout", f"lista não está em coluna única: primeiro={first}, segundo={second}")

        selected = page.locator(".project-card.is-selected").first
        if not visible(selected):
            add_issue(issues, name, "selection", "seleção ativa ausente")
        else:
            selected_style = selected.evaluate("el => ({shadow:getComputedStyle(el).boxShadow, background:getComputedStyle(el).backgroundColor})")
            if "inset" not in selected_style["shadow"]:
                add_issue(issues, name, "selection", f"seleção depende apenas de cor: {selected_style}")

        grid_rect = rect(project_grid)
        panel_rect = rect(panel)
        metrics["grid"] = grid_rect
        metrics["panel"] = panel_rect
        if grid_rect["right"] > panel_rect["left"] + 2:
            add_issue(issues, name, "inspector-overlap", f"lista={grid_rect}, inspector={panel_rect}")

        # Ações não poluem o repouso, mas aparecem ao focar o item.
        first_card = cards.nth(0)
        actions = first_card.locator(".project-actions")
        if visible(actions) and not first_card.evaluate("el => el.matches(':hover,:focus-within,.is-selected')"):
            add_issue(issues, name, "actions-rest", "ações ficaram expostas em item sem atenção")
        cards.nth(1).focus()
        second_actions = cards.nth(1).locator(".project-actions")
        page.wait_for_timeout(80)
        if not visible(second_actions):
            add_issue(issues, name, "actions-keyboard", "ações não apareceram ao focar o manuscrito")
        elif not second_actions.locator('button[data-archive-quick="open"]').is_visible():
            add_issue(issues, name, "actions-keyboard", "abrir no editor não ficou disponível pelo teclado")

        evidence["rest"] = screenshot(page, output, name, "rest")

        # Abre filtros por teclado e aplica dois refinamentos.
        summary = disclosure.locator("summary")
        summary.focus()
        summary.press("Enter")
        page.wait_for_timeout(80)
        if not visible(filter_bar) or not visible(status_bar):
            add_issue(issues, name, "filter-open", "filtros não apareceram após abrir")
        else:
            type_button = page.locator('[data-archive-filter="manuscrito"]').first
            status_button = page.locator('[data-archive-status-filter="Em escrita"]').first
            if type_button.count():
                type_button.click()
            if status_button.count():
                status_button.click()
            page.wait_for_timeout(120)
            count = disclosure.locator(".archive-filter-summary-count").text_content().strip()
            if count != "2":
                add_issue(issues, name, "filter-count", f"contador de filtros={count!r}, esperado='2'")
        evidence["filters"] = screenshot(page, output, name, "filters-open")

        for message in console_errors:
            add_issue(issues, name, "console-error", message[:500])
    except Exception as error:
        add_issue(issues, name, "audit-crash", repr(error))
    finally:
        context.close()

    return {"case": name, "metrics": metrics, "evidence": evidence, "issues": issues}


def run_mobile(browser, base_url: str, output: Path) -> dict:
    name = "390-mobile-protection"
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    context.add_init_script(INIT_STORAGE)
    page = context.new_page()
    issues: list[dict] = []
    evidence: dict[str, str] = {}
    try:
        prepare(page, base_url, None)
        page.wait_for_timeout(250)
        disclosure = page.locator(".archive-filter-disclosure").first
        filter_bar = page.locator("[data-archive-filter-bar]").first
        status_bar = page.locator("[data-archive-status-bar]").first
        if visible(disclosure):
            add_issue(issues, name, "mobile-contract", "agrupador desktop apareceu no mobile")
        if not visible(filter_bar) or not visible(status_bar):
            add_issue(issues, name, "mobile-contract", "barras originais não foram restauradas no mobile")
        width = page.evaluate("() => {const d=document.scrollingElement||document.documentElement;return {scroll:d.scrollWidth,client:d.clientWidth}}")
        if width["scroll"] > width["client"] + 2:
            add_issue(issues, name, "mobile-overflow", str(width))
        evidence["mobile"] = screenshot(page, output, name, "original-flow")
    except Exception as error:
        add_issue(issues, name, "audit-crash", repr(error))
    finally:
        context.close()
    return {"case": name, "metrics": {}, "evidence": evidence, "issues": issues}


def markdown(cases: list[dict], generated: str) -> str:
    issues = [item for case in cases for item in case["issues"]]
    lines = [
        "# Auditoria de Clareza do Produto — Acervo desktop",
        "",
        f"Gerada em: {generated}",
        "",
        f"- Cenários: {len(cases)}",
        f"- Falhas: {len(issues)}",
        "",
        "| Cenário | Resultado |",
        "|---|---|",
    ]
    for case in cases:
        lines.append(f"| {case['case']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if not issues:
        lines.append("Nenhuma falha detectada.")
    for item in issues:
        lines += [
            f"### {item['kind']}",
            "",
            f"- Cenário: {item['case']}",
            f"- Detalhe: {item['detail']}",
            "",
        ]
    lines += ["## Evidências", "", "Capturas de repouso, filtros abertos e proteção móvel estão em `screenshots/`.", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/product-clarity-archive-artifacts")
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [run_desktop(browser, args.base_url, output, spec) for spec in DESKTOPS]
        cases.append(run_mobile(browser, args.base_url, output))
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated, "base_url": args.base_url, "cases": cases}
    (output / "product-clarity-archive.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "product-clarity-archive.md").write_text(markdown(cases, generated), encoding="utf-8")
    errors = [item for case in cases for item in case["issues"]]
    print(f"[clarity-archive] cenarios={len(cases)} falhas={len(errors)}", flush=True)
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
