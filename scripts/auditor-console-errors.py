#!/usr/bin/env python3
"""
auditor-console-errors.py
Escrevaral — Auditor de Erros de Console

Navega por cada visão principal do produto e captura console.error,
uncaught exceptions e erros de rede (4xx/5xx). Qualquer erro em
runtime é sinalizado como achado.

Uso:
  python3 -m http.server 8799 &   (na pasta do projeto)
  python3 scripts/auditor-console-errors.py

Saída:
  reports/auditoria/console-errors-YYYY-MM-DD.md
  reports/auditoria/console-errors-YYYY-MM-DD.json
"""

import asyncio
import json
import os
import shutil
import sys
from datetime import date
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8799"
REPORTS  = Path(__file__).parent.parent / "reports" / "auditoria"
TIMEOUT  = 15_000

# Mesmos cenários do auditor de overflow para consistência
CENARIOS = [
    {
        "nome": "acervo",
        "descricao": "Tela inicial — lista de manuscritos",
        "acao": None,
        "interacoes": [],
    },
    {
        "nome": "editor-novo",
        "descricao": "Criar e abrir manuscrito novo",
        "acao": None,
        "interacoes": [
            "const btn = document.querySelector('[data-action=\"new-note\"], .create-button, #btn-new-note'); if (btn) btn.click();",
        ],
    },
    {
        "nome": "editor-escrita",
        "descricao": "Digitar texto no editor",
        "acao": None,
        "interacoes": [
            "const btn = document.querySelector('[data-action=\"new-note\"], .create-button, #btn-new-note'); if (btn) btn.click();",
            """(function() {
                const area = document.querySelector('.writing-area, [contenteditable="true"], textarea');
                if (area) {
                    area.focus();
                    if (area.tagName === 'TEXTAREA') {
                        area.value = 'Texto de teste para ativar engines de linguagem.';
                        area.dispatchEvent(new Event('input', {bubbles: true}));
                    } else {
                        area.textContent = 'Texto de teste para ativar engines de linguagem.';
                        area.dispatchEvent(new Event('input', {bubbles: true}));
                    }
                }
            })()""",
        ],
    },
    {
        "nome": "guia-de-escrita",
        "descricao": "Abrir guia de escrita",
        "acao": None,
        "interacoes": [
            "const btn = document.querySelector('[data-action=\"new-note\"], .create-button, #btn-new-note'); if (btn) btn.click();",
            "(function() { const g = document.querySelector('[data-action=\"toggle-guide\"], .guide-toggle, #btn-guia, button[aria-label*=\"guia\"]'); if (g) g.click(); })()",
        ],
    },
    {
        "nome": "academia",
        "descricao": "Aba Academia",
        "acao": None,
        "interacoes": [
            "const btn = document.querySelector('[data-tab=\"academia\"], nav button[aria-label*=\"Academia\"]'); if (btn) btn.click();",
        ],
    },
    {
        "nome": "prova-autoria",
        "descricao": "Aba Prova de Autoria",
        "acao": None,
        "interacoes": [
            "const btn = document.querySelector('[data-tab=\"proof\"], [data-tab=\"prova\"], nav button[aria-label*=\"Prova\"]'); if (btn) btn.click();",
        ],
    },
    {
        "nome": "copia-seguranca",
        "descricao": "Acionar cópia de segurança",
        "acao": None,
        "interacoes": [
            """
            const btn = Array.from(document.querySelectorAll('button')).find(
              b => b.textContent.includes('Cópia') || b.textContent.includes('segurança')
                || b.getAttribute('aria-label')?.includes('Cópia')
                || b.getAttribute('aria-label')?.includes('backup')
            );
            if (btn) btn.click();
            """,
        ],
    },
]

# Mensagens a ignorar (ruído esperado em localhost)
IGNORAR = [
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "The AudioContext was not allowed to start",  # browser policy, não produto
    "Unrecognized feature",
    "goatcounter",                                # analítica desabilitada em localhost
    "gc.zgo.at",                                  # URL real do GoatCounter (não aparece como "goatcounter")
]


def deve_ignorar(mensagem: str) -> bool:
    return any(ig.lower() in mensagem.lower() for ig in IGNORAR)


async def rodar_cenario(browser, cenario: dict) -> dict:
    context = await browser.new_context(viewport={"width": 390, "height": 844})
    page = await context.new_page()

    erros = []
    avisos = []
    erros_rede = []

    # Captura console
    def on_console(msg):
        texto = msg.text
        loc_url = msg.location.get("url", "")
        # Filtra pelo texto da mensagem OU pela URL de origem (ex: GoatCounter)
        if deve_ignorar(texto) or deve_ignorar(loc_url):
            return
        if msg.type == "error":
            erros.append({"tipo": "console.error", "mensagem": texto, "url": loc_url, "linha": msg.location.get("lineNumber", 0)})
        elif msg.type == "warning":
            avisos.append({"tipo": "console.warn", "mensagem": texto})

    # Captura exceções não tratadas
    def on_pageerror(exc):
        texto = str(exc)
        if not deve_ignorar(texto):
            erros.append({"tipo": "uncaught-exception", "mensagem": texto, "url": "", "linha": 0})

    # Captura falhas de rede
    def on_requestfailed(req):
        url = req.url
        if not deve_ignorar(url):
            erros_rede.append({"tipo": "request-failed", "url": url, "failure": req.failure or ""})

    def on_response(resp):
        if resp.status >= 400:
            url = resp.url
            if not deve_ignorar(url):
                erros_rede.append({"tipo": f"http-{resp.status}", "url": url, "failure": str(resp.status)})

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    page.on("requestfailed", on_requestfailed)
    page.on("response", on_response)

    try:
        await page.goto(BASE_URL, wait_until="domcontentloaded", timeout=TIMEOUT)
        await page.wait_for_function("document.readyState === 'interactive' || document.readyState === 'complete'", timeout=TIMEOUT)
        try:
            await page.wait_for_function(
                "window.syntaxEngine && typeof window.syntaxEngine._isReady === 'function'",
                timeout=5_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(500)

        for interacao in cenario.get("interacoes", []):
            try:
                await page.evaluate(interacao)
                await page.wait_for_timeout(400)
            except Exception as e:
                erros.append({"tipo": "eval-error", "mensagem": str(e), "url": "", "linha": 0})

        await page.wait_for_timeout(800)  # deixa engines processarem

    except Exception as e:
        erros.append({"tipo": "navegacao-erro", "mensagem": str(e), "url": "", "linha": 0})
    finally:
        await context.close()

    return {
        "cenario": cenario["nome"],
        "descricao": cenario["descricao"],
        "erros": erros,
        "avisos": avisos,
        "erros_rede": erros_rede,
        "tem_problema": len(erros) > 0 or len(erros_rede) > 0,
    }


def gerar_relatorio_md(resultados: list[dict], hoje: str) -> str:
    total_erros = sum(len(r["erros"]) for r in resultados)
    total_rede  = sum(len(r["erros_rede"]) for r in resultados)
    total_avisos = sum(len(r["avisos"]) for r in resultados)

    status_geral = "ERROS DETECTADOS" if (total_erros + total_rede) > 0 else "Limpo"

    linhas = [
        f"# Auditoria Erros de Console — {hoje}",
        "",
        f"**Estado geral:** {status_geral}  ",
        f"**Erros JS:** {total_erros} | **Erros de rede:** {total_rede} | **Avisos:** {total_avisos}",
        "",
        "## Tabela de resultados",
        "",
        "| Cenário | Erros JS | Erros rede | Avisos | Estado |",
        "|---|---|---|---|---|",
    ]

    for r in resultados:
        ne = len(r["erros"])
        nr = len(r["erros_rede"])
        na = len(r["avisos"])
        estado = "PROBLEMA" if r["tem_problema"] else "ok"
        linhas.append(f"| {r['descricao']} | {ne} | {nr} | {na} | {estado} |")

    linhas += ["", "## Detalhamento", ""]

    for r in resultados:
        if not r["erros"] and not r["erros_rede"] and not r["avisos"]:
            continue
        linhas.append(f"### {r['cenario']}")
        for e in r["erros"]:
            local = f" ({e['url']}:{e['linha']})" if e.get("url") else ""
            linhas.append(f"- **{e['tipo']}**{local}: `{e['mensagem'][:200]}`")
        for e in r["erros_rede"]:
            linhas.append(f"- **{e['tipo']}**: `{e['url'][:120]}`")
        for a in r["avisos"]:
            linhas.append(f"- _aviso_: `{a['mensagem'][:200]}`")
        linhas.append("")

    if total_erros == 0 and total_rede == 0:
        linhas += ["Nenhum erro detectado em todos os cenários.", ""]

    return "\n".join(linhas)


async def main():
    hoje = date.today().isoformat()
    REPORTS.mkdir(parents=True, exist_ok=True)

    resultados = []
    tem_erro = False

    async with async_playwright() as pw:
        chromium = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
        launch_options = {"headless": True}
        if chromium:
            launch_options["executable_path"] = chromium
            launch_options["args"] = ["--no-sandbox"]
        browser = await pw.chromium.launch(**launch_options)

        for cenario in CENARIOS:
            print(f"  [{cenario['nome']}]", end=" ", flush=True)
            r = await rodar_cenario(browser, cenario)
            resultados.append(r)
            ne = len(r["erros"])
            nr = len(r["erros_rede"])
            status = f"erros={ne} rede={nr}"
            print(status)
            if r["tem_problema"]:
                tem_erro = True

        await browser.close()

    dados_json = {"data": hoje, "tem_erro": tem_erro, "resultados": resultados}
    path_json = REPORTS / f"console-errors-{hoje}.json"
    path_md   = REPORTS / f"console-errors-{hoje}.md"

    path_json.write_text(json.dumps(dados_json, ensure_ascii=False, indent=2), encoding="utf-8")
    path_md.write_text(gerar_relatorio_md(resultados, hoje), encoding="utf-8")

    print(f"\nRelatório: {path_md}")

    if tem_erro:
        print("ERROS DETECTADOS — ver relatório.")
        sys.exit(1)
    else:
        print("Nenhum erro. Console limpo.")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
