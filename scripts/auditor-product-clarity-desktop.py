#!/usr/bin/env python3
"""Audita hierarquia, densidade, ferramentas e foco do editor desktop."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

VIEWPORTS = (
    ("1280", 1280, 800, None),
    ("1366", 1366, 900, None),
    ("1440", 1440, 900, None),
    ("1440-escuro", 1440, 900, "scriptorium"),
)

TEXT = (
    "A manhã entrava pela janela como quem pede licença. O café esfriava na xícara "
    "enquanto as palavras se formavam devagar, uma a uma. O texto não precisava correr; "
    "precisava apenas encontrar espaço para respirar."
)

DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""

INIT_STORAGE = """
try {
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
  localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
    manuscripts: [{
      id: 'clarity-ms',
      title: 'Caderno de campo',
      folder: 'Teste',
      kind: 'manuscript',
      status: 'Em escrita',
      text: 'A manhã entrava pela janela como quem pede licença.',
      content: 'A manhã entrava pela janela como quem pede licença.',
      createdAt: 0,
      updatedAt: 0
    }],
    activeId: 'clarity-ms',
    ui: {}
  }));
} catch (_) {}
"""


def add_issue(issues: list[dict], viewport: str, kind: str, detail: str) -> None:
    issues.append({"viewport": viewport, "kind": kind, "detail": detail})


def dismiss_transients(page) -> None:
    terms = page.locator("#terms-overlay").first
    if terms.count() and terms.is_visible():
        button = page.locator('[data-action="accept-terms-blank"]').first
        if button.count():
            button.click()
            terms.wait_for(state="hidden", timeout=8_000)

    welcome = page.locator('[data-action="welcome-write"]').first
    if welcome.count() and welcome.is_visible():
        welcome.click()
        welcome.wait_for(state="hidden", timeout=8_000)

    for selector in ("#update-dismiss-btn", "#save-hint-dismiss", "#levar-mesa-dismiss"):
        button = page.locator(selector).first
        try:
            if button.count() and button.is_visible(timeout=300):
                button.click()
        except Exception:
            pass


def rect(page, selector: str) -> dict:
    return page.locator(selector).first.evaluate(
        """el => {
          const r = el.getBoundingClientRect();
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
        }"""
    )


def any_visible(page, selector: str) -> bool:
    return bool(page.locator(selector).evaluate_all(
        """els => els.some(el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return !el.hidden && !el.closest('[hidden]') && r.width > 0 && r.height > 0
            && cs.display !== 'none' && cs.visibility !== 'hidden';
        })"""
    ))


def screenshot(page, output: Path, viewport: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{viewport}-clarity-{state}.png"
    page.screenshot(path=str(directory / name), full_page=False)
    return f"screenshots/{name}"


def focus_style(locator) -> dict:
    return locator.evaluate(
        """el => { const cs=getComputedStyle(el); return {
          borderTop:cs.borderTopWidth,
          outline:cs.outlineStyle,
          outlineWidth:cs.outlineWidth,
          outlineColor:cs.outlineColor,
          boxShadow:cs.boxShadow
        }; }"""
    )


def has_outline(style: dict) -> bool:
    return style.get("outline") not in ("none", "") and style.get("outlineWidth") not in ("0px", "")


def has_shadow(style: dict) -> bool:
    return style.get("boxShadow") not in ("none", "")


def run_case(browser, base_url: str, output: Path, case: tuple) -> dict:
    name, width, height, theme = case
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
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.add_style_tag(content=DISABLE_MOTION)
        page.evaluate(
            """theme => {
              if (theme) document.documentElement.dataset.theme = theme;
              else delete document.documentElement.dataset.theme;
            }""",
            theme,
        )
        dismiss_transients(page)
        page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)
        page.wait_for_function(
            "() => document.documentElement.dataset.inputModality && document.querySelector('.topbar-actions')?.dataset.clarityUtilities === 'true'",
            timeout=10_000,
        )
        page.evaluate("() => setView('editor', { updateRoute: true, routeMode: 'replace' })")
        page.wait_for_selector(".editor-paper", state="visible", timeout=10_000)
        page.wait_for_selector(".writing-area", state="visible", timeout=10_000)

        title = page.locator(".title-input").first
        writing = page.locator(".writing-area").first
        title.fill("Caderno de campo")
        writing.fill(TEXT)
        page.wait_for_timeout(400)

        selectors = {
            "topbar": ".topbar",
            "nav": ".module-tabs",
            "utilities": ".topbar-actions",
            "paper": ".editor-paper",
            "title": ".title-block",
            "context": ".editor-mode-bar",
            "toolbar": ".format-bar-wrap",
            "writing": ".writing-area",
        }
        metrics = {key: rect(page, selector) for key, selector in selectors.items()}
        document_width = page.evaluate(
            """() => { const d=document.scrollingElement||document.documentElement;
            return {scroll:d.scrollWidth,client:d.clientWidth}; }"""
        )
        metrics["document"] = document_width

        visible_primary = page.locator(
            '.module-tabs [data-view-target="editor"], '
            '.module-tabs [data-view-target="arquivo"], '
            '.module-tabs .oficina-navigation > summary'
        ).evaluate_all(
            "els => els.filter(el => { const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden'; }).length"
        )
        metrics["visible_primary_navigation"] = visible_primary

        paper = metrics["paper"]
        title_rect = metrics["title"]
        context_rect = metrics["context"]
        toolbar = metrics["toolbar"]
        writing_rect = metrics["writing"]
        utilities = metrics["utilities"]

        if document_width["scroll"] > document_width["client"] + 2:
            add_issue(issues, name, "horizontal-overflow", f"documento {document_width}")
        if paper["left"] < -1 or paper["right"] > width + 1:
            add_issue(issues, name, "paper-outside-viewport", f"folha={paper}")
        if not 640 <= paper["width"] <= 940:
            add_issue(issues, name, "paper-width", f"largura da folha={paper['width']:.1f}px")
        if not 480 <= writing_rect["width"] <= 790:
            add_issue(issues, name, "reading-width", f"largura da escrita={writing_rect['width']:.1f}px")
        if title_rect["top"] > toolbar["top"]:
            add_issue(issues, name, "sequence", "o título aparece depois da toolbar")
        if toolbar["bottom"] > writing_rect["top"] + 1:
            add_issue(issues, name, "sequence", "toolbar invade o começo da escrita")
        if abs(title_rect["bottom"] - context_rect["bottom"]) > 34:
            add_issue(issues, name, "header-alignment", f"título={title_rect}, contexto={context_rect}")
        if utilities["width"] > 240:
            add_issue(issues, name, "utility-density", f"utilidades ocupam {utilities['width']:.1f}px")
        if visible_primary != 3:
            add_issue(issues, name, "primary-navigation", f"destinos primários visíveis={visible_primary}, esperado=3")

        for selector, label in (
            ('[data-action="toggle-template-panel"]', "guia"),
            ('[data-action="open-reader-mode"]', "leitura"),
            ('[data-action="toggle-desk-background"]', "fundo"),
            ('[data-action="toggle-editorial-group"]', "Mais"),
            ('[data-action="copy-manuscript-text"]', "Copiar"),
            ('[data-action="export-rtf"]', "Baixar"),
        ):
            if not any_visible(page, selector):
                add_issue(issues, name, "tool-missing", f"{label} não está acessível no editor")

        # Ambiente reduz a fila sem criar um beco de teclado.
        utility_trigger = page.locator(".clarity-utility-trigger").first
        if not utility_trigger.count() or not utility_trigger.is_visible():
            add_issue(issues, name, "utility-menu", "gatilho Ambiente ausente")
        else:
            utility_trigger.focus()
            utility_trigger.press("Enter")
            panel = page.locator(".clarity-utility-panel").first
            panel.wait_for(state="visible", timeout=5_000)
            items = page.locator(".clarity-utility-panel .clarity-utility-item")
            if items.count() != 4:
                add_issue(issues, name, "utility-menu", f"ações no Ambiente={items.count()}, esperado=4")
            if items.count() and not items.first.evaluate("el => document.activeElement === el"):
                add_issue(issues, name, "utility-keyboard", "a abertura por teclado não focou a primeira opção")
            panel_rect = rect(page, ".clarity-utility-panel")
            if panel_rect["left"] < 0 or panel_rect["right"] > width:
                add_issue(issues, name, "utility-menu", f"painel fora da viewport={panel_rect}")
            evidence["environment"] = screenshot(page, output, name, "environment-open")
            page.keyboard.press("Escape")
            page.wait_for_timeout(80)
            if panel.is_visible():
                add_issue(issues, name, "utility-keyboard", "Escape não fechou Ambiente")
            if not utility_trigger.evaluate("el => document.activeElement === el"):
                add_issue(issues, name, "utility-keyboard", "Escape não devolveu o foco ao gatilho")

        # Ponteiro: cursor e seleção bastam.
        writing.click(position={"x": 24, "y": 24})
        pointer_focus = focus_style(writing)
        metrics["pointer_focus"] = pointer_focus
        if pointer_focus["borderTop"] not in ("0px", "") or has_shadow(pointer_focus) or has_outline(pointer_focus):
            add_issue(issues, name, "writing-pointer-focus", f"área cercada durante digitação={pointer_focus}")

        title.click()
        title_focus = focus_style(title)
        metrics["title_focus"] = title_focus
        if title_focus["borderTop"] not in ("0px", "") or has_shadow(title_focus) or has_outline(title_focus):
            add_issue(issues, name, "title-pointer-focus", f"título cercado durante edição={title_focus}")

        evidence["editor"] = screenshot(page, output, name, "editor")

        # Teclado: exatamente um indicador, externo ou interno.
        page.keyboard.press("Tab")
        writing.focus()
        keyboard_focus = focus_style(writing)
        metrics["keyboard_focus"] = keyboard_focus
        outline = has_outline(keyboard_focus)
        shadow = has_shadow(keyboard_focus)
        if not outline and not shadow:
            add_issue(issues, name, "keyboard-focus", f"indicador de teclado ausente={keyboard_focus}")
        if outline and shadow:
            add_issue(issues, name, "keyboard-focus", f"indicadores de teclado duplicados={keyboard_focus}")

        toggle = page.locator('[data-action="toggle-editorial-group"]').first
        toggle.focus()
        toggle.press("Enter")
        page.wait_for_timeout(300)
        bar = page.locator("[data-format-bar]").first
        if bar.evaluate("el => el.scrollWidth > el.clientWidth + 2"):
            add_issue(issues, name, "toolbar-overflow", "Mais aberto criou rolagem interna")
        evidence["more"] = screenshot(page, output, name, "more-open")

        for message in console_errors:
            add_issue(issues, name, "console-error", message[:500])
    except Exception as error:
        add_issue(issues, name, "audit-crash", repr(error))
    finally:
        context.close()

    return {"viewport": name, "metrics": metrics, "evidence": evidence, "issues": issues}


def markdown(cases: list[dict], generated: str) -> str:
    issues = [item for case in cases for item in case["issues"]]
    lines = [
        "# Auditoria de Clareza do Produto — desktop",
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
        lines.append(f"| {case['viewport']} | {'aprovado' if not case['issues'] else 'falhou'} |")
    lines += ["", "## Ocorrências", ""]
    if not issues:
        lines.append("Nenhuma falha detectada.")
    for item in issues:
        lines += [
            f"### {item['kind']}",
            "",
            f"- Cenário: {item['viewport']}",
            f"- Detalhe: {item['detail']}",
            "",
        ]
    lines += ["## Evidências", "", "Capturas do editor, do menu Ambiente e da bancada Mais estão em `screenshots/`.", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/product-clarity-desktop-artifacts")
    args = parser.parse_args()

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases: list[dict] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for case in VIEWPORTS:
            print(f"[clarity-desktop] {case[0]}", flush=True)
            cases.append(run_case(browser, args.base_url, output, case))
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated, "base_url": args.base_url, "cases": cases}
    (output / "product-clarity-desktop.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "product-clarity-desktop.md").write_text(markdown(cases, generated), encoding="utf-8")

    errors = [item for case in cases for item in case["issues"]]
    print(f"[clarity-desktop] cenários={len(cases)} falhas={len(errors)}", flush=True)
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
