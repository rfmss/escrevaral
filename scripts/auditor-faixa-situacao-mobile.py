#!/usr/bin/env python3
"""Audita a faixa de situação do editor em celulares reais e compactos."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


VIEWPORTS = (("320", 320, 720), ("390", 390, 844), ("430", 430, 932))
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

ESSENTIALS = (
    ('[data-stat="count"]', "contagem"),
    ('[data-save-status]', "salvamento"),
    ('[data-action="edit-word-goal"]:visible', "meta"),
    ('[data-action="toggle-pomodoro"]', "temporizador"),
)


def add_issue(issues: list[dict], viewport: str, state: str, area: str, detail: str) -> None:
    issues.append({
        "viewport": viewport,
        "state": state,
        "area": area,
        "detail": detail,
    })


def prepare_editor(page: Page) -> None:
    page.evaluate(
        """async () => {
          const paragraph = 'A casa guardava a noite em silêncio, enquanto o vento atravessava as frestas da janela.';
          const text = Array.from({ length: 48 }, (_, index) => `${index + 1}. ${paragraph}`).join('\\n\\n');
          const html = text.split('\\n\\n').map(item => `<p>${item}</p>`).join('');
          const manuscript = VeredaArchive.createManuscript({
            id: 'auditoria-faixa-mobile',
            title: 'Caderno da noite',
            text,
            html,
            type: 'manuscrito',
            folder: 'Ficção',
          });
          state.manuscripts = [manuscript];
          state.activeId = manuscript.id;
          titleInput.value = manuscript.title;
          writingArea.innerHTML = html;
          renderActiveManuscript();
          await persistState('Massa da faixa móvel preparada');

          const count = document.querySelector('[data-stat="count"]');
          const save = document.querySelector('[data-save-status]');
          const goal = document.querySelector('[data-goal-bar]');
          const goalLabel = document.querySelector('[data-goal-label]');
          const timer = document.querySelector('[data-pomodoro-display]');
          if (count) count.textContent = '1.284 palavras · 48 parágrafos';
          if (save) save.textContent = 'Salvo agora';
          if (goal) goal.hidden = false;
          if (goalLabel) goalLabel.textContent = '1.284 / 2.000 palavras';
          if (timer) timer.textContent = '24:59';
        }"""
    )
    page.wait_for_selector('.statusbar', state="visible", timeout=10_000)
    page.wait_for_selector('#mobile-dock', state="visible", timeout=10_000)


def element_state(page: Page, selector: str) -> dict:
    locator = page.locator(selector).first
    if locator.count() == 0:
        return {"exists": False}
    return locator.evaluate(
        """element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
          const y = Math.min(innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
          const top = document.elementFromPoint(x, y);
          const exposed = Boolean(top && (top === element || element.contains(top)));
          return {
            exists: true,
            visible: !element.hidden && style.display !== 'none' && style.visibility !== 'hidden'
              && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0,
            exposed,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            text: (element.innerText || element.textContent || '').trim(),
            clippedText: element.scrollWidth > element.clientWidth + 1,
          };
        }"""
    )


def overlap(page: Page) -> dict:
    return page.evaluate(
        """() => {
          const status = document.querySelector('.statusbar')?.getBoundingClientRect();
          const dock = document.querySelector('#mobile-dock')?.getBoundingClientRect();
          if (!status || !dock) return { exists: false };
          const left = Math.max(status.left, dock.left);
          const right = Math.min(status.right, dock.right);
          const top = Math.max(status.top, dock.top);
          const bottom = Math.min(status.bottom, dock.bottom);
          return {
            exists: true,
            width: Math.max(0, right - left),
            height: Math.max(0, bottom - top),
            status: { left: status.left, top: status.top, right: status.right, bottom: status.bottom },
            dock: { left: dock.left, top: dock.top, right: dock.right, bottom: dock.bottom },
          };
        }"""
    )


def screenshot(page: Page, output: Path, viewport: str, state: str) -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{viewport}-faixa-situacao-{state}.png"
    page.screenshot(path=str(path), full_page=True)
    return str(path.relative_to(output))


def audit_state(page: Page, issues: list[dict], viewport: str, state: str) -> dict:
    evidence: dict[str, dict] = {}

    status = element_state(page, '.statusbar')
    evidence['statusbar'] = status
    if not status.get('visible'):
        add_issue(issues, viewport, state, 'faixa', 'a faixa de situação não está visível')

    collision = overlap(page)
    evidence['overlap'] = collision
    if collision.get('height', 0) > 1 and collision.get('width', 0) > 1:
        add_issue(
            issues,
            viewport,
            state,
            'sobreposição',
            f"dock cobre {collision['height']:.1f}px da faixa de situação",
        )

    for selector, label in ESSENTIALS:
        value = element_state(page, selector)
        evidence[label] = value
        if not value.get('exists'):
            add_issue(issues, viewport, state, label, 'controle essencial ausente')
            continue
        if not value.get('visible'):
            add_issue(issues, viewport, state, label, 'controle essencial invisível')
            continue
        if not value.get('exposed'):
            add_issue(issues, viewport, state, label, 'controle essencial está coberto por outra camada')
        if value.get('clippedText') and label in {'contagem', 'salvamento'}:
            add_issue(issues, viewport, state, label, f"texto essencial cortado: {value.get('text')!r}")
        if value.get('left', 0) < -1 or value.get('right', 0) > page.viewport_size['width'] + 1:
            add_issue(issues, viewport, state, label, 'controle essencial saiu da largura da tela')

    copyright_state = element_state(page, '.statusbar-copyright')
    evidence['copyright'] = copyright_state
    if copyright_state.get('visible'):
        add_issue(issues, viewport, state, 'ruído', 'informação institucional ocupa a faixa no celular')

    social_visible = page.locator('.statusbar-social:visible').count()
    evidence['social_visible'] = social_visible
    if social_visible:
        add_issue(issues, viewport, state, 'ruído', f'{social_visible} atalhos sociais permanecem na faixa móvel')

    document_overflow = page.evaluate(
        "document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth + 2"
    )
    evidence['document_overflow'] = document_overflow
    if document_overflow:
        add_issue(issues, viewport, state, 'overflow', 'a página criou rolagem horizontal')

    return evidence


def run_case(browser: Browser, base_url: str, output: Path, viewport_data: tuple[str, int, int]) -> dict:
    viewport_name, width, height = viewport_data
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        extra_http_headers={"DNT": "1"},
    )
    context.add_init_script(TERMS_SCRIPT)
    page = context.new_page()
    issues: list[dict] = []
    states: dict[str, dict] = {}
    console_errors: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector('.app-shell', timeout=20_000)
        page.add_style_tag(content=DISABLE_MOTION)
        prepare_editor(page)

        states['normal'] = audit_state(page, issues, viewport_name, 'normal')
        states['normal']['screenshot'] = screenshot(page, output, viewport_name, 'normal')

        page.evaluate("""() => {
          const banner = document.querySelector('#update-banner');
          if (banner) banner.hidden = false;
        }""")
        states['update-banner'] = audit_state(page, issues, viewport_name, 'aviso-de-atualizacao')
        states['update-banner']['screenshot'] = screenshot(page, output, viewport_name, 'aviso-atualizacao')
        page.evaluate("document.querySelector('#update-banner').hidden = true")

        page.evaluate("""() => {
          const banner = document.querySelector('#backup-nudge-banner');
          if (banner) banner.hidden = false;
        }""")
        states['backup-banner'] = audit_state(page, issues, viewport_name, 'aviso-de-copia')
        states['backup-banner']['screenshot'] = screenshot(page, output, viewport_name, 'aviso-copia')
        page.evaluate("document.querySelector('#backup-nudge-banner').hidden = true")

        page.set_viewport_size({"width": width, "height": 480})
        page.wait_for_timeout(100)
        states['compact-height'] = audit_state(page, issues, viewport_name, 'altura-compacta')
        states['compact-height']['screenshot'] = screenshot(page, output, viewport_name, 'altura-compacta')

        for message in console_errors:
            add_issue(issues, viewport_name, 'execução', 'console', message[:500])
    except Exception as error:  # noqa: BLE001
        add_issue(issues, viewport_name, 'execução', 'auditoria', repr(error))
    finally:
        context.close()

    return {
        "viewport": viewport_name,
        "initial_height": height,
        "states": states,
        "issues": issues,
    }


def render_markdown(cases: list[dict], generated_at: str) -> str:
    issues = [issue for case in cases for issue in case['issues']]
    lines = [
        '# Auditoria da faixa de situação no celular',
        '',
        f'Gerada em: {generated_at}',
        '',
        f'- Larguras: {len(cases)}',
        f'- Estados por largura: 4',
        f'- Falhas: {len(issues)}',
        '',
        '| Largura | Resultado | Falhas |',
        '|---:|---|---:|',
    ]
    for case in cases:
        lines.append(
            f"| {case['viewport']} | {'aprovado' if not case['issues'] else 'falhou'} | {len(case['issues'])} |"
        )

    lines.extend(['', '## Ocorrências', ''])
    if not issues:
        lines.append('Nenhuma falha detectada.')
    else:
        for issue in issues:
            lines.extend([
                f"### {issue['area']}",
                '',
                f"- Contexto: {issue['viewport']} px · {issue['state']}",
                f"- Detalhe: {issue['detail']}",
                '',
            ])

    lines.extend([
        '## Evidências',
        '',
        'Capturas dos estados normal, aviso de atualização, aviso de cópia e altura compacta estão em `screenshots/`.',
        '',
    ])
    return '\n'.join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:8799/')
    parser.add_argument('--output-dir', default='reports/auditoria/faixa-situacao-mobile-artifacts')
    args = parser.parse_args()

    base_url = args.base_url if args.base_url.endswith('/') else f'{args.base_url}/'
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        cases = [run_case(browser, base_url, output, viewport) for viewport in VIEWPORTS]
        browser.close()

    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated_at, "base_url": base_url, "cases": cases}
    (output / 'faixa-situacao-mobile.json').write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    (output / 'faixa-situacao-mobile.md').write_text(
        render_markdown(cases, generated_at), encoding='utf-8'
    )

    issues = [issue for case in cases for issue in case['issues']]
    print(f'[faixa-mobile] larguras={len(cases)} estados={len(cases) * 4} falhas={len(issues)}', flush=True)
    raise SystemExit(1 if issues else 0)


if __name__ == '__main__':
    main()
