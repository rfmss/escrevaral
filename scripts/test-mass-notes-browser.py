#!/usr/bin/env python3
"""Smoke tests de navegador para a shell experimental Mass Notes.

Executa a entrada real por HTTP local, com IndexedDB e engines do repositório.
Não publica nem modifica dados de produção.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports" / "auditoria" / "mass-notes-browser-artifacts"
REPORT_PATH = REPORT_DIR / "resultado.json"
PORT = int(os.environ.get("MASS_NOTES_TEST_PORT", "8799"))
BASE_URL = f"http://127.0.0.1:{PORT}/mass-notes.html"


class Audit:
    def __init__(self) -> None:
        self.checks: list[dict[str, object]] = []
        self.failures: list[str] = []
        self.console_errors: list[str] = []
        self.page_errors: list[str] = []
        self.external_requests: set[str] = set()

    def check(self, name: str, condition: bool, detail: str = "") -> None:
        self.checks.append({"name": name, "passed": bool(condition), "detail": detail})
        if not condition:
            self.failures.append(f"{name}: {detail or 'condição não atendida'}")

    def attach_page(self, page: Page) -> None:
        page.on(
            "console",
            lambda message: self.console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.on("pageerror", lambda error: self.page_errors.append(str(error)))

        def watch_request(request) -> None:
            parsed = urlparse(request.url)
            if parsed.scheme in {"http", "https"} and parsed.hostname not in {"127.0.0.1", "localhost"}:
                self.external_requests.add(request.url)

        page.on("request", watch_request)

    def write(self) -> None:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(
            json.dumps(
                {
                    "status": "failed" if self.failures else "passed",
                    "checks": self.checks,
                    "failures": self.failures,
                    "console_errors": self.console_errors,
                    "page_errors": self.page_errors,
                    "external_requests": sorted(self.external_requests),
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )


def wait_for_server(timeout: float = 20.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.5):
                return
        except OSError:
            time.sleep(0.15)
    raise RuntimeError(f"Servidor local não respondeu na porta {PORT}.")


def wait_ready(page: Page) -> None:
    page.goto(BASE_URL, wait_until="networkidle")
    page.locator("#mn-save-state").wait_for(state="visible")
    page.wait_for_function(
        """() => ['Salvo', 'Alterações temporárias'].includes(document.querySelector('#mn-save-state')?.textContent?.trim())""",
        timeout=20_000,
    )


def set_editor_html(page: Page, html: str) -> None:
    page.evaluate(
        """html => {
          const editor = document.querySelector('#mn-editor');
          editor.innerHTML = html;
          editor.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertText'}));
        }""",
        html,
    )


def wait_saved(page: Page, timeout: int = 15_000) -> None:
    page.wait_for_function(
        """() => ['Salvo', 'Alterações temporárias'].includes(document.querySelector('#mn-save-state')?.textContent?.trim())""",
        timeout=timeout,
    )


def active_document_title(page: Page) -> str:
    return page.locator("#mn-title").input_value()


def run_main_flow(browser, audit: Audit) -> None:
    context = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
    page = context.new_page()
    audit.attach_page(page)
    wait_ready(page)

    audit.check("inicialização", page.locator("#mn-document-list .mn-doc-button").count() >= 1)
    audit.check("engines carregadas", "0/" not in page.locator("#mn-engine-status").inner_text(), page.locator("#mn-engine-status").inner_text())

    page.locator("#mn-title").fill("Documento de teste")
    set_editor_html(page, "<h1>Primeiro título</h1><p>Um texto forte para testar o editor.</p>")
    wait_saved(page)
    page.reload(wait_until="networkidle")
    wait_saved(page)
    audit.check("persistência após recarregar", active_document_title(page) == "Documento de teste", active_document_title(page))
    audit.check("corpo persistido", "texto forte" in page.locator("#mn-editor").inner_text())

    page.evaluate(
        """() => {
          const node = document.querySelector('#mn-editor p').firstChild;
          const start = node.textContent.indexOf('texto forte');
          const range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, start + 'texto forte'.length);
          const selection = getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }"""
    )
    page.locator("[data-command='bold']").click()
    audit.check(
        "formatação negrito",
        page.locator("#mn-editor strong, #mn-editor b").filter(has_text="texto forte").count() >= 1,
    )

    page.locator("#mn-editor").focus()
    page.keyboard.press("Tab")
    audit.check(
        "Tab navega para fora do editor",
        page.evaluate("document.activeElement?.id !== 'mn-editor'"),
        page.evaluate("document.activeElement?.outerHTML?.slice(0, 160) || ''"),
    )

    page.locator("#mn-editor").focus()
    page.evaluate(
        """() => {
          window.__massNotesPasteExecuted = false;
          const transfer = new DataTransfer();
          transfer.setData('text/html', '<p>Colagem <strong>segura</strong></p><img src=x onerror="window.__massNotesPasteExecuted=true"><script>window.__massNotesPasteExecuted=true</script><a href="javascript:alert(1)">ruim</a>');
          const event = new ClipboardEvent('paste', {clipboardData: transfer, bubbles: true, cancelable: true});
          document.querySelector('#mn-editor').dispatchEvent(event);
        }"""
    )
    audit.check("colagem remove elementos ativos", page.locator("#mn-editor img, #mn-editor script").count() == 0)
    audit.check("colagem rejeita javascript", page.locator("#mn-editor a[href^='javascript:']").count() == 0)
    audit.check("colagem não executa evento", page.evaluate("window.__massNotesPasteExecuted === false"))

    page.evaluate(
        """() => {
          const original = MassNotesStore.saveDocument.bind(MassNotesStore);
          window.__massNotesOriginalSave = original;
          MassNotesStore.saveDocument = async input => {
            await new Promise(resolve => setTimeout(resolve, 350));
            return original(input);
          };
        }"""
    )
    page.locator("#mn-title").fill("Primeira versão")
    page.wait_for_timeout(120)
    page.locator("#mn-title").fill("Versão final concorrente")
    wait_saved(page, timeout=20_000)
    page.reload(wait_until="networkidle")
    wait_saved(page)
    audit.check("gravação concorrente preserva última edição", active_document_title(page) == "Versão final concorrente", active_document_title(page))

    set_editor_html(
        page,
        "<h1>Cena</h1><p>Na calada da noite, a personagem respirou fundo e entrou para dentro da casa. "
        "A memória da rua voltou como vento, sombra e silêncio. O coração acelerou, o coração acelerou, "
        "e ela perguntou se havia alguma coisa errada.</p><p>Luz na janela<br>Vento na estrada<br>Lua amarela<br>Noite calada</p>",
    )
    wait_saved(page)

    for panel, action, state_name in [
        ("review", "run-review", "review"),
        ("voice", "run-voice", "voice"),
        ("rhyme", "run-rhyme", "rhyme"),
    ]:
        page.locator(f"[data-panel='{panel}']").click()
        page.locator(f"[data-action='{action}']").click()
        page.wait_for_function(
            """name => {
              const value = document.querySelector(`[data-engine-state='${name}']`)?.textContent?.trim();
              return value && value !== 'Analisando…';
            }""",
            arg=state_name,
            timeout=30_000,
        )
        status = page.locator(f"[data-engine-state='{state_name}']").inner_text().strip()
        audit.check(f"engine {state_name}", status == "Concluído", status)
        audit.check(f"resultado {state_name}", page.locator(f"#mn-{state_name}-results > *").count() >= 1)

    page.evaluate(
        """() => {
          window.__massNotesOriginalReview = MassNotesEngines.runReview;
          MassNotesEngines.runReview = async doc => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {ok: true, documentId: doc.id, revision: doc.revision, data: {alerts: [{title: 'RESULTADO ANTIGO', detail: 'não deve aparecer'}], contextualTerms: []}, warnings: []};
          };
        }"""
    )
    page.locator("[data-panel='review']").click()
    page.locator("[data-action='run-review']").click()
    page.wait_for_timeout(80)
    page.keyboard.press("Control+N")
    page.wait_for_timeout(750)
    audit.check("análise antiga descartada", "RESULTADO ANTIGO" not in page.locator("#mn-review-results").inner_text())

    page.locator("[data-action='toggle-focus'].mn-desktop-only").click()
    audit.check("modo foco ativado", page.locator("body").evaluate("node => node.classList.contains('mn-focus')"))
    audit.check("saída do foco visível", page.locator(".mn-focus-exit").is_visible())
    page.keyboard.press("Escape")
    audit.check("Escape sai do foco", not page.locator("body").evaluate("node => node.classList.contains('mn-focus')"))

    audit.check(
        "título preparado para impressão",
        page.locator("#mn-document").get_attribute("data-print-title") in {"Documento sem título", active_document_title(page)},
        page.locator("#mn-document").get_attribute("data-print-title") or "",
    )

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(REPORT_DIR / "desktop.png"), full_page=True)

    page.locator("#mn-title").fill("Arquivo exportável")
    set_editor_html(page, "<p>Conteúdo exportável.</p>")
    wait_saved(page)
    with page.expect_download(timeout=15_000) as download_info:
        page.locator("[data-action='export-txt']").click()
    download = download_info.value
    audit.check("exportação TXT", download.suggested_filename.endswith(".txt"), download.suggested_filename)

    audit.check("sem chamadas externas", not audit.external_requests, ", ".join(sorted(audit.external_requests)))
    context.close()


def run_recovery_flow(browser, audit: Audit) -> None:
    context = browser.new_context(viewport={"width": 1024, "height": 768})
    page = context.new_page()
    audit.attach_page(page)
    wait_ready(page)

    page.evaluate(
        """() => {
          MassNotesStore.saveDocument = async () => new Promise(() => {});
        }"""
    )
    page.locator("#mn-title").fill("Recuperação emergencial")
    set_editor_html(page, "<p>Conteúdo que ainda não chegou ao IndexedDB.</p>")
    page.reload(wait_until="networkidle", timeout=30_000)
    wait_saved(page, timeout=20_000)
    audit.check("snapshot emergencial recuperado", active_document_title(page) == "Recuperação emergencial", active_document_title(page))
    audit.check("conteúdo emergencial recuperado", "ainda não chegou" in page.locator("#mn-editor").inner_text())
    context.close()


def run_migration_flow(browser, audit: Audit) -> None:
    context = browser.new_context(viewport={"width": 1024, "height": 768})
    context.add_init_script(
        """localStorage.setItem('vereda.manuscripts.v1', JSON.stringify([{id: 'legado-1', title: 'Documento legado', text: 'Texto preservado da interface antiga.', tags: ['legado'], createdAt: Date.now() - 10000, updatedAt: Date.now() - 5000}]));"""
    )
    page = context.new_page()
    audit.attach_page(page)
    wait_ready(page)
    titles = page.locator("#mn-document-list .mn-doc-title").all_inner_texts()
    audit.check("migração importa documento legado", "Documento legado" in titles, repr(titles))
    audit.check(
        "migração preserva fonte antiga",
        page.evaluate("localStorage.getItem('vereda.manuscripts.v1') !== null"),
    )
    context.close()


def run_responsive_flow(browser, audit: Audit) -> None:
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    audit.attach_page(page)
    wait_ready(page)

    opener = page.locator("[data-action='open-library']")
    opener.click()
    audit.check("biblioteca mobile abre", page.locator("body").evaluate("node => node.classList.contains('mn-library-open')"))
    for _ in range(10):
        page.keyboard.press("Tab")
        inside = page.evaluate("document.querySelector('#mn-library').contains(document.activeElement)")
        audit.check("foco contido na biblioteca", inside, page.evaluate("document.activeElement?.outerHTML?.slice(0,120) || ''"))
        if not inside:
            break
    page.keyboard.press("Escape")
    audit.check("biblioteca fecha por Escape", not page.locator("body").evaluate("node => node.classList.contains('mn-library-open')"))
    audit.check("foco retorna ao acionador", page.evaluate("document.activeElement?.dataset?.action === 'open-library'"))

    inspector_opener = page.locator("[data-action='open-inspector']")
    inspector_opener.click()
    audit.check("assistente mobile abre", page.locator("body").evaluate("node => node.classList.contains('mn-inspector-open')"))
    audit.check("fundo fica inerte", page.locator(".mn-main").get_attribute("inert") is not None)
    page.locator("#mn-overlay").click(position={"x": 5, "y": 5})
    audit.check("assistente fecha pelo fundo", not page.locator("body").evaluate("node => node.classList.contains('mn-inspector-open')"))

    breakpoints = [
        (1440, 900),
        (1366, 650),
        (1024, 768),
        (820, 768),
        (430, 800),
        (390, 844),
        (320, 568),
    ]
    for width, height in breakpoints:
        page.set_viewport_size({"width": width, "height": height})
        page.wait_for_timeout(80)
        metrics = page.evaluate(
            """() => ({
              viewport: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              appWidth: document.querySelector('#mn-app').scrollWidth,
              appClient: document.querySelector('#mn-app').clientWidth
            })"""
        )
        audit.check(
            f"sem overflow horizontal {width}x{height}",
            metrics["documentWidth"] <= metrics["viewport"] and metrics["appWidth"] <= metrics["appClient"],
            repr(metrics),
        )

    page.set_viewport_size({"width": 390, "height": 844})
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(REPORT_DIR / "mobile.png"), full_page=True)
    context.close()


def main() -> int:
    audit = Audit()
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    server_log = (REPORT_DIR / "http-server.log").open("w", encoding="utf-8")
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=server_log,
        stderr=subprocess.STDOUT,
        text=True,
    )

    try:
        wait_for_server()
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
            try:
                run_main_flow(browser, audit)
                run_recovery_flow(browser, audit)
                run_migration_flow(browser, audit)
                run_responsive_flow(browser, audit)
                audit.check("nenhuma chamada externa no conjunto", not audit.external_requests, ", ".join(sorted(audit.external_requests)))
            finally:
                browser.close()
    except Exception as error:
        audit.failures.append(f"Exceção do auditor: {type(error).__name__}: {error}")
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
        server_log.close()

    if audit.console_errors:
        audit.failures.append("Erros de console: " + " | ".join(audit.console_errors))
    if audit.page_errors:
        audit.failures.append("Exceções de página: " + " | ".join(audit.page_errors))

    audit.write()
    if audit.failures:
        print("[FALHOU] Smoke de navegador Mass Notes")
        for failure in audit.failures:
            print(f"- {failure}")
        return 1

    print("[OK] Smoke de navegador Mass Notes")
    print(f"- {len(audit.checks)} verificações aprovadas")
    print("- persistência, recuperação, migração, engines, foco e responsividade validados")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())