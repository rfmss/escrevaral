#!/usr/bin/env python3
"""
auditor-overflow-mobile.py
Escrevaral — Auditor de Overflow Horizontal

Mede scrollWidth > clientWidth em 320px, 390px e 430px para cada
visão principal do produto. Qualquer overflow não intencional é
uma violação do pilar "sem rolagem horizontal em editores".

Uso:
  python3 -m http.server 8799 &   (na pasta do projeto)
  python3 scripts/auditor-overflow-mobile.py

Saída:
  reports/auditoria/overflow-mobile-YYYY-MM-DD.md
  reports/auditoria/overflow-mobile-YYYY-MM-DD.json
"""

import asyncio
import json
import shutil
import sys
from datetime import date
from pathlib import Path

from playwright.async_api import async_playwright


def _navegador_sistema():
    for nome in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        caminho = shutil.which(nome)
        if caminho:
            return caminho
    return None

BASE_URL = "http://localhost:8799"
REPORTS  = Path(__file__).parent.parent / "reports" / "auditoria"
TIMEOUT  = 15_000

LARGURAS = [320, 390, 430]

# Cada cenário: nome, ação JS para ativar a visão, seletores a checar além do documento
CENARIOS = [
    {
        "nome": "acervo",
        "descricao": "Tela inicial — lista de manuscritos",
        "acao": None,   # visão padrão ao abrir
        "seletores_extras": ["#archive-panel", ".archive-list", ".manuscript-list"],
    },
    {
        "nome": "editor-vazio",
        "descricao": "Editor com manuscrito novo aberto",
        "acao": """
            const btn = document.querySelector('[data-action="new-note"], .create-button, #btn-new-note, button[aria-label*="nova nota"], button[aria-label*="Novo manuscrito"]');
            if (btn) btn.click();
        """,
        "seletores_extras": [".editor-paper", ".writing-area", ".editor-split", "#editor-container"],
    },
    {
        "nome": "editor-com-texto",
        "descricao": "Editor com texto longo (sem quebra forçada)",
        "acao": """
            const area = document.querySelector('.writing-area, [contenteditable="true"], textarea');
            if (area) {
                area.focus();
                const texto = 'Esta é uma frase muito longa que testa se o editor horizontal transborda a viewport em dispositivos móveis pequenos como 320px. '.repeat(5);
                if (area.tagName === 'TEXTAREA') {
                    area.value = texto;
                } else {
                    area.textContent = texto;
                }
            }
        """,
        "seletores_extras": [".editor-paper", ".writing-area", ".editor-split"],
    },
    {
        "nome": "guia-de-escrita",
        "descricao": "Guia de escrita aberto ao lado do editor",
        "acao": """
            const btn = document.querySelector('[data-action="toggle-guide"], .guide-toggle, #btn-guia, button[aria-label*="guia"]');
            if (btn) btn.click();
        """,
        "seletores_extras": [".guide-panel", ".vereda-guide", ".editor-split", ".writing-guide"],
    },
    {
        "nome": "academia",
        "descricao": "Aba Academia (Espelho de Voz, RimaLab)",
        "acao": """
            const btn = document.querySelector('[data-tab="academia"], [href="#academia"], nav button[aria-label*="Academia"]');
            if (btn) btn.click();
        """,
        "seletores_extras": ["#academia-panel", ".academia-content"],
    },
    {
        "nome": "prova-autoria",
        "descricao": "Aba Prova de Autoria",
        "acao": """
            const btn = document.querySelector('[data-tab="proof"], [data-tab="prova"], nav button[aria-label*="Prova"]');
            if (btn) btn.click();
        """,
        "seletores_extras": ["#proof-panel", ".proof-content"],
    },
]


async def medir_overflow(page, seletores_extras: list[str]) -> dict:
    """Mede scrollWidth vs clientWidth no documento e em seletores extras."""
    resultado = {}

    # Documento inteiro
    doc = await page.evaluate("""() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        bodyScrollW: document.body ? document.body.scrollWidth : 0,
        scrollingElScrollW: document.scrollingElement ? document.scrollingElement.scrollWidth : 0,
        scrollingElClientW: document.scrollingElement ? document.scrollingElement.clientWidth : 0,
    })""")
    resultado["documento"] = doc
    resultado["documento"]["overflow"] = doc["scrollingElScrollW"] > doc["scrollingElClientW"]

    # Seletores extras
    extras = {}
    for sel in seletores_extras:
        try:
            med = await page.evaluate(f"""() => {{
                const el = document.querySelector('{sel}');
                if (!el) return null;
                return {{ scrollW: el.scrollWidth, clientW: el.clientWidth, overflow: el.scrollWidth > el.clientWidth }};
            }}""")
            if med is not None:
                extras[sel] = med
        except Exception:
            pass
    resultado["extras"] = extras

    return resultado


async def rodar_cenario(page, cenario: dict, largura: int) -> dict:
    """Abre o produto, ajusta viewport, executa ação e mede."""
    await page.set_viewport_size({"width": largura, "height": 812})
    await page.goto(BASE_URL, wait_until="domcontentloaded", timeout=TIMEOUT)

    # Aguarda app carregar
    await page.wait_for_function(
        "document.readyState === 'interactive' || document.readyState === 'complete'",
        timeout=TIMEOUT
    )
    try:
        await page.wait_for_function(
            "window.syntaxEngine && typeof window.syntaxEngine._isReady === 'function'",
            timeout=5_000
        )
    except Exception:
        pass  # Continua mesmo sem as engines prontas

    await page.wait_for_timeout(600)

    # Executa ação do cenário
    if cenario["acao"]:
        try:
            await page.evaluate(cenario["acao"])
            await page.wait_for_timeout(500)
        except Exception:
            pass

    medicao = await medir_overflow(page, cenario["seletores_extras"])
    return medicao


def formatar_celula(med: dict | None) -> str:
    if med is None:
        return "—"
    overflow = med.get("overflow", False)
    sw = med.get("scrollW") or med.get("scrollingElScrollW", "?")
    cw = med.get("clientW") or med.get("scrollingElClientW", "?")
    status = "OVERFLOW" if overflow else "ok"
    return f"{status} ({sw}×{cw})"


def gerar_relatorio_md(resultados: list[dict], hoje: str) -> str:
    linhas = [
        f"# Auditoria Overflow Mobile — {hoje}",
        "",
        "Pilar auditado: **sem rolagem horizontal em telas de escrita**.",
        "Medida: `scrollingElement.scrollWidth > scrollingElement.clientWidth`",
        "",
        "## Tabela de resultados",
        "",
        "| Cenário | 320px | 390px | 430px | Estado |",
        "|---|---|---|---|---|",
    ]

    violacoes = []

    for r in resultados:
        nome = r["cenario"]
        desc = r["descricao"]
        cols = []
        tem_overflow = False

        for larg in LARGURAS:
            chave = str(larg)
            if chave in r["medicoes"]:
                if "erro" in r["medicoes"][chave]:
                    cols.append("ERRO")
                    continue
                doc = r["medicoes"][chave]["documento"]
                overflow = doc.get("overflow", False)
                sw = doc.get("scrollingElScrollW", doc.get("scrollW", "?"))
                cw = doc.get("scrollingElClientW", doc.get("clientW", "?"))
                if overflow:
                    tem_overflow = True
                    cols.append(f"**OVERFLOW** ({sw}×{cw})")
                    violacoes.append({
                        "cenario": nome,
                        "largura": larg,
                        "scrollW": sw,
                        "clientW": cw,
                        "extras": r["medicoes"][chave].get("extras", {}),
                    })
                else:
                    cols.append(f"ok ({sw}×{cw})")
            else:
                cols.append("—")

        estado = "VIOLACAO" if tem_overflow else "ok"
        linhas.append(f"| {desc} | {' | '.join(cols)} | {estado} |")

    linhas += ["", "## Detalhamento de violações", ""]

    if not violacoes:
        linhas.append("Nenhuma violação detectada.")
    else:
        for v in violacoes:
            linhas.append(f"### {v['cenario']} — {v['largura']}px")
            linhas.append(f"- Documento: scrollWidth={v['scrollW']}px, clientWidth={v['clientW']}px")
            extras_overflow = {k: vv for k, vv in v["extras"].items() if vv and vv.get("overflow")}
            if extras_overflow:
                linhas.append("- Seletores com overflow:")
                for sel, med in extras_overflow.items():
                    linhas.append(f"  - `{sel}`: {med['scrollW']}×{med['clientW']}")
            else:
                linhas.append("- Seletores extras: sem overflow adicional detectado")
            linhas.append("")

    linhas += [
        "## Critério de aceite",
        "",
        "Em 320px, 390px e 430px: `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth`",
        "Exceção permitida: menus e trilhos horizontais intencionais contidos no próprio elemento.",
    ]

    return "\n".join(linhas)


async def main():
    hoje = date.today().isoformat()
    REPORTS.mkdir(parents=True, exist_ok=True)

    resultados = []
    tem_violacao = False
    tem_erro = False

    async with async_playwright() as pw:
        executavel = _navegador_sistema()
        opcoes = {"headless": True}
        if executavel:
            opcoes["executable_path"] = executavel
        browser = await pw.chromium.launch(**opcoes)
        context = await browser.new_context()
        page = await context.new_page()

        for cenario in CENARIOS:
            medicoes = {}
            print(f"  [{cenario['nome']}]", end="", flush=True)

            for largura in LARGURAS:
                try:
                    med = await rodar_cenario(page, cenario, largura)
                    medicoes[str(largura)] = med
                    overflow = med["documento"].get("overflow", False)
                    print(f" {largura}={'X' if overflow else '.'}", end="", flush=True)
                    if overflow:
                        tem_violacao = True
                except Exception as e:
                    medicoes[str(largura)] = {"erro": str(e)}
                    tem_erro = True
                    print(f" {largura}=ERR", end="", flush=True)

            print()
            resultados.append({
                "cenario": cenario["nome"],
                "descricao": cenario["descricao"],
                "medicoes": medicoes,
            })

        await browser.close()

    # Salvar JSON
    dados_json = {
        "data": hoje,
        "violacao": tem_violacao,
        "larguras": LARGURAS,
        "resultados": resultados,
    }
    path_json = REPORTS / f"overflow-mobile-{hoje}.json"
    path_md   = REPORTS / f"overflow-mobile-{hoje}.md"

    path_json.write_text(json.dumps(dados_json, ensure_ascii=False, indent=2), encoding="utf-8")
    path_md.write_text(gerar_relatorio_md(resultados, hoje), encoding="utf-8")

    print(f"\nRelatório: {path_md}")
    print(f"JSON:      {path_json}")

    if tem_violacao:
        print("\nVIOLACAO DETECTADA — overflow horizontal em mobile.")
        sys.exit(1)
    elif tem_erro:
        print("\nERRO DE AUDITORIA — uma ou mais medições falharam.")
        sys.exit(1)
    else:
        print("\nNenhuma violação. Pilar de responsividade ok.")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
