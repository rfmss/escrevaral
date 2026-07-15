"""
Auditor de Pilares — Escrevaral (site em produção).
Verifica: português brasileiro, overflow por rota, ARIA, erros JS.
Salva screenshots nas falhas.
"""
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "https://escrevaral.com"
DATA = datetime.now().strftime("%Y-%m-%d")
RELATORIO = Path(f"reports/auditoria/pilares-{DATA}.md")
SCREENSHOTS = Path(f"reports/auditoria/screenshots/{DATA}")

PALAVRAS_PROIBIDAS = [
    "backup", "autosave", "offline", "toggle", "template",
    "modal", "tooltip", "blockchain", "download", "upload",
    "dashboard", "login", "logout",
]

IGNORAR_ERROS = [
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "goatcounter",
    "gc.zgo.at",
    "The AudioContext was not allowed to start",
]

VIEWPORTS = [
    {"width": 390,  "height": 844, "nome": "mobile 390×844"},
    {"width": 1366, "height": 900, "nome": "desktop 1366×900"},
]

achados = []
prints = []


def capturar(page, slug):
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    caminho = SCREENSHOTS / f"{slug}.png"
    page.screenshot(path=str(caminho), full_page=False)
    prints.append(str(caminho))
    return caminho


def achar(nivel, msg, pilar, rota="", evidencia=""):
    achados.append({"nivel": nivel, "msg": msg, "pilar": pilar,
                    "rota": rota, "evidencia": evidencia})
    print(f"  [{nivel.upper()}] [{pilar}] {msg}")


def deve_ignorar_erro(texto):
    return any(item.lower() in (texto or "").lower() for item in IGNORAR_ERROS)


def auditar(browser, vp):
    ctx = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
    page = ctx.new_page()
    erros_js = []
    erros_rede = []

    def registrar_console(msg):
        texto = msg.text
        url = msg.location.get("url", "")
        if msg.type == "error" and not (deve_ignorar_erro(texto) or deve_ignorar_erro(url)):
            erros_js.append(f"console.error: {texto}")

    def registrar_pageerror(exc):
        texto = str(exc)
        if not deve_ignorar_erro(texto):
            erros_js.append(texto)

    def registrar_requestfailed(req):
        url = req.url
        if not deve_ignorar_erro(url):
            erros_rede.append(f"request-failed: {url}")

    def registrar_response(resp):
        url = resp.url
        if resp.status >= 400 and not deve_ignorar_erro(url):
            erros_rede.append(f"http-{resp.status}: {url}")

    page.on("console", registrar_console)
    page.on("pageerror", registrar_pageerror)
    page.on("requestfailed", registrar_requestfailed)
    page.on("response", registrar_response)

    # Injeta localStorage para pular termos/onboarding
    page.add_init_script("""
        localStorage.setItem('escrevaral-termos-v1', '1');
        localStorage.setItem('vrda-first-visit', '1');
        localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
            manuscripts: [{id:'audit-ms',title:'Auditoria',folder:'Teste',
                kind:'manuscript',content:'texto',createdAt:0,updatedAt:0}],
            activeId:'audit-ms', ui:{}
        }));
    """)

    page.goto(URL, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)

    nome_vp = vp["nome"]
    print(f"\n— {nome_vp} —")

    # Pilar: português — palavras proibidas no texto visível
    texto = page.evaluate("document.body.innerText").lower()
    for palavra in PALAVRAS_PROIBIDAS:
        if f" {palavra} " in f" {texto} " or f"\n{palavra}\n" in f"\n{texto}\n":
            achar("aviso", f"Palavra proibida: '{palavra}'", "Português", URL)

    # Pilar: responsividade — overflow na rota inicial
    def checar_overflow(rota_nome):
        sw = page.evaluate("document.scrollingElement.scrollWidth")
        cw = page.evaluate("document.scrollingElement.clientWidth")
        if sw > cw:
            slug = f"overflow-{rota_nome}-{nome_vp}".replace(" ", "-").replace("×", "x")
            ev = capturar(page, slug)
            achar("critico", f"Overflow: scrollWidth={sw} > clientWidth={cw}",
                  "Responsividade", rota_nome, str(ev))

    def botoes_navegacao_visiveis():
        seletor = ".mobile-dock .dock-item" if vp["width"] < 820 else ".module-tabs button"
        botoes = page.query_selector_all(seletor)
        return [botao for botao in botoes if botao.is_visible()]

    def reportar_erros_codigo(rota_nome):
        criticos = [e for e in erros_js
                    if any(t in e for t in ["TypeError", "ReferenceError", "SyntaxError", "console.error"])]
        if criticos:
            achar("critico", f"Erro JS em '{rota_nome}': {criticos[0][:120]}",
                  "Código", rota_nome)
        if erros_rede:
            achar("critico", f"Erro de rede em '{rota_nome}': {erros_rede[0][:120]}",
                  "Código", rota_nome)
        erros_js.clear()
        erros_rede.clear()

    checar_overflow("inicio")
    reportar_erros_codigo("inicio")

    # Pilar: acessibilidade — botões sem label
    sem_label = page.evaluate("""() =>
        [...document.querySelectorAll('button')].filter(b =>
            !b.textContent.trim() &&
            !b.getAttribute('aria-label') &&
            !b.getAttribute('title')
        ).length
    """)
    if sem_label > 0:
        achar("aviso", f"{sem_label} botão(ões) sem texto nem aria-label",
              "Acessibilidade", URL)

    # Navegar por cada destino principal, respeitando a navegacao visivel do viewport.
    abas = botoes_navegacao_visiveis()

    for aba in abas:
        nome_aba = (aba.inner_text() or "").strip()
        if not nome_aba or len(nome_aba) > 30:
            continue
        try:
            aba.click()
            page.wait_for_timeout(700)
            checar_overflow(nome_aba)
            reportar_erros_codigo(nome_aba)
        except Exception as exc:
            achar("aviso", f"Falha ao navegar para '{nome_aba}': {exc}",
                  "Navegação", nome_aba)

    ctx.close()


with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    for vp in VIEWPORTS:
        auditar(browser, vp)
    browser.close()

# ── Relatório ──────────────────────────────────────────
criticos = [a for a in achados if a["nivel"] == "critico"]
avisos   = [a for a in achados if a["nivel"] == "aviso"]

if criticos:
    semaforo = "🔴 VERMELHO"
elif avisos:
    semaforo = "🟡 AMARELO"
else:
    semaforo = "🟢 VERDE"

ts = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
linhas = [f"# Auditoria de Pilares — {ts}",
          f"**Semáforo:** {semaforo}  |  **URL:** {URL}", ""]

if criticos:
    linhas += ["## Críticos", ""]
    for a in criticos:
        linhas += [f"- **[{a['pilar']}]** {a['msg']}",
                   f"  - Rota: `{a['rota']}`",
                   f"  - Evidência: `{a['evidencia']}`", ""]

if avisos:
    linhas += ["## Avisos", ""]
    for a in avisos:
        linhas += [f"- **[{a['pilar']}]** {a['msg']}",
                   f"  - Rota: `{a['rota']}`", ""]

if not achados:
    linhas += ["Todos os pilares verificados sem falhas detectadas."]

if prints:
    linhas += ["", "## Screenshots de falha", ""] + [f"- `{s}`" for s in prints]

RELATORIO.parent.mkdir(parents=True, exist_ok=True)
RELATORIO.write_text("\n".join(linhas) + "\n")
print("\n" + "\n".join(linhas))
sys.exit(1 if criticos else 0)
