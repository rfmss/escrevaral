"""
Smoke test do site live (https://escrevaral.com).
Verifica: HTTP 200, título, sem tela branca, sem overflow mobile, editor presente.
Sai com código 1 e grava relatório se qualquer check falhar.
"""
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

URL = "https://escrevaral.com"
RELATORIO = f"reports/auditoria/smoke-live-{datetime.now().strftime('%Y-%m-%d')}.md"
falhas = []

def checar(contexto, viewport, nome):
    page = contexto.new_page()
    erros_js = []
    page.on("pageerror", lambda e: erros_js.append(str(e)))

    resp = page.goto(URL, wait_until="networkidle", timeout=30000)
    if not resp or resp.status >= 400:
        falhas.append(f"[{nome}] HTTP {resp.status if resp else 'sem resposta'}")
        page.close()
        return

    if "Escrevaral" not in page.title():
        falhas.append(f"[{nome}] Título inesperado: {page.title()!r}")

    branco = page.evaluate("document.body.innerText.trim() === ''")
    if branco:
        falhas.append(f"[{nome}] Tela em branco detectada")

    overflow = page.evaluate(
        "document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth"
    )
    if overflow:
        w = page.evaluate("document.scrollingElement.scrollWidth")
        c = page.evaluate("document.scrollingElement.clientWidth")
        falhas.append(f"[{nome}] Overflow horizontal: scrollWidth={w} > clientWidth={c}")

    editor = page.query_selector('[data-view-panel="editor"]')
    if not editor:
        falhas.append(f"[{nome}] Editor ausente (data-view-panel='editor' não encontrado)")

    criticos = [e for e in erros_js if "TypeError" in e or "ReferenceError" in e or "SyntaxError" in e]
    if criticos:
        falhas.append(f"[{nome}] Erros JS críticos: {'; '.join(criticos[:3])}")

    page.close()

with sync_playwright() as p:
    browser = p.chromium.launch()

    checar(browser.new_context(viewport={"width": 1366, "height": 900}), None, "desktop 1366×900")
    checar(browser.new_context(viewport={"width": 390, "height": 844}), None, "mobile 390×844")

    browser.close()

data = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
status = "✅ OK" if not falhas else "❌ FALHA"
linhas = [f"# Smoke test live — {data}", f"**Status:** {status}", f"**URL:** {URL}", ""]

if falhas:
    linhas += ["## Falhas detectadas", ""] + [f"- {f}" for f in falhas]
else:
    linhas += ["Todas as verificações passaram: HTTP 200, título, tela, overflow, editor."]

with open(RELATORIO, "w") as f:
    f.write("\n".join(linhas) + "\n")

print("\n".join(linhas))
sys.exit(1 if falhas else 0)
