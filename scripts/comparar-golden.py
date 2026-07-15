#!/usr/bin/env python3
"""
comparar-golden.py
Escrevaral — Guarda de Regressão

Roda o corpus do Catedrático, compara com os golden files e gera
um relatório de regressões e evoluções em reports/agente/.

Uso:
  python3 -m http.server 8799 &   (na pasta do projeto)
  python3 scripts/comparar-golden.py

Saída:
  reports/agente/YYYY-MM-DD.md   — relatório legível
  reports/agente/YYYY-MM-DD.json — dados brutos para histórico
"""

import asyncio
import argparse
import json
import shutil
import sys
import os
from pathlib import Path
from datetime import date

from playwright.async_api import async_playwright

BASE_URL   = os.environ.get("ESCREVARAL_BASE_URL", "http://localhost:8799")
CORPUS     = Path(__file__).parent / "corpus-catedratico.txt"
GOLDEN     = Path(__file__).parent / "golden" / "corpus-output.json"
REPORTS    = Path(__file__).parent.parent / "reports" / "agente"
TIMEOUT    = 15_000
SYSTEM_BROWSER_CANDIDATES = (
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
)


def parse_corpus(path: Path) -> list[dict]:
    entries, current = [], {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("#") or not line or line.startswith("---"):
            if current.get("frase"):
                entries.append(current)
                current = {}
            continue
        for key in ("FRASE", "TESTA", "GABARITO", "ZONA"):
            if line.startswith(f"{key}:"):
                current[key.lower()] = line[len(key)+1:].strip()
    if current.get("frase"):
        entries.append(current)
    return entries


def load_golden(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    return {f["frase"]: f for f in data["frases"]}


async def wait_engines(page):
    await page.wait_for_function(
        "window.syntaxEngine && window.syntaxEngine._isReady() && window.VeredaPunctuation",
        timeout=TIMEOUT
    )


def find_system_browser() -> str | None:
    for candidate in SYSTEM_BROWSER_CANDIDATES:
        path = shutil.which(candidate)
        if path:
            return path
    return None


async def capture(page, frase: str) -> dict:
    return await page.evaluate("""(frase) => {
        const morfo = window.syntaxEngine.analisarMorfologia(frase) || [];
        const _pont = window.VeredaPunctuation.analyze(frase) || {};
        const pont  = _pont.issues || [];
        let voz = { vozPassiva: null, vozIndet: null, vozAtiva: null };
        try { const v = window.VeredaVoice.analyze(frase); voz = { vozPassiva: v.vozPassiva ?? null, vozIndet: v.vozIndeterminada ?? null, vozAtiva: v.vozAtiva ?? null }; } catch(_) {}
        let rima = { disponivel: false, rimas: [], assonancia: [], aliteracao: [] };
        try { if (window.VeredaRimaLab) { const r = window.VeredaRimaLab.analyze(frase); rima = { disponivel: true, rimas: (r.rhymes||[]).slice(0,10), assonancia: (r.assonance||[]).slice(0,10), aliteracao: (r.alliteration||[]).slice(0,10) }; } } catch(_) {}
        return {
            morfologia: morfo.map(t => ({ text: t.text||'', tags: t.tags||[], normal: t.normal||'' })),
            pontuacao:  pont.map(a => ({
                codigo: a.ruleId || a.codigo || null,
                mensagem: a.message || a.mensagem || a.acao || '',
                trecho: a.fragment || a.trecho || '',
            })),
            voz, rima,
        };
    }""", frase)


def compare_outputs(current: dict, golden: dict) -> dict:
    diffs = []

    # Morfologia: comparar por posição, não por texto. O dict por token
    # colapsava palavras repetidas ("que", "a", "se") e mascarava regressões.
    cur_morfo = current.get("morfologia", [])
    gld_morfo = golden.get("output", {}).get("sintaxe", {}).get("morfologia", [])

    if len(cur_morfo) != len(gld_morfo):
        diffs.append({
            "tipo": "morfologia-tokenizacao",
            "antes": len(gld_morfo),
            "depois": len(cur_morfo),
        })

    for idx, (cur_term, gld_term) in enumerate(zip(cur_morfo, gld_morfo)):
        token = cur_term.get("text", "")
        gld_token = gld_term.get("text", "")
        cur_tags = cur_term.get("tags", [])
        gld_tags = gld_term.get("tags", [])
        if token != gld_token:
            diffs.append({
                "tipo": "morfologia-token",
                "indice": idx,
                "antes": gld_token,
                "depois": token,
            })
            continue
        if set(cur_tags) != set(gld_tags):
            diffs.append({
                "tipo":   "morfologia",
                "indice": idx,
                "token":  token,
                "antes":  gld_tags,
                "depois": cur_tags,
            })

    # Pontuação: comparar códigos de alerta
    cur_pont = {a["codigo"] for a in current.get("pontuacao", [])}
    gld_pont = {a["codigo"] for a in golden.get("output", {}).get("pontuacao", {}).get("alertas", [])}
    novos   = cur_pont - gld_pont
    sumidos = gld_pont - cur_pont
    if novos:
        diffs.append({"tipo": "pontuacao-novo-alerta",   "codigos": list(novos)})
    if sumidos:
        diffs.append({"tipo": "pontuacao-alerta-sumido", "codigos": list(sumidos)})

    # Voz: comparar detecção
    cur_voz = current.get("voz", {})
    gld_voz = golden.get("output", {}).get("voz", {})
    for campo in ("vozPassiva", "vozIndet", "vozAtiva"):
        if cur_voz.get(campo) != gld_voz.get(campo):
            diffs.append({
                "tipo":   f"voz-{campo}",
                "antes":  gld_voz.get(campo),
                "depois": cur_voz.get(campo),
            })

    # Rima: comparar presença de rimas
    cur_rimas = len(current.get("rima", {}).get("rimas", []))
    gld_rimas = len(golden.get("output", {}).get("rima", {}).get("rimas", []))
    if cur_rimas != gld_rimas:
        diffs.append({
            "tipo":   "rima-contagem",
            "antes":  gld_rimas,
            "depois": cur_rimas,
        })

    return diffs


def classify_diff(diff: dict, gabarito: str) -> str:
    """Classifica diff como regressão, evolução ou mudança neutra."""
    tipo = diff.get("tipo", "")

    if tipo == "morfologia":
        token   = diff["token"].lower()
        antes   = set(diff["antes"])
        depois  = set(diff["depois"])
        gab     = gabarito.lower()

        tag_map = {
            "adjetivo": "Adjective", "advérbio": "Adverb", "verbo": "Verb",
            "numeral": "Numeral", "interjeição": "Interjection",
            "pronome": "Pronoun", "possessivo": "Possessive",
        }
        for palavra, tag in tag_map.items():
            if token in gab and palavra in gab:
                if tag in depois and tag not in antes:
                    return "evolucao"
                if tag in antes and tag not in depois:
                    return "regressao"
        return "neutro"

    if tipo in {"morfologia-tokenizacao", "morfologia-token"}:
        return "regressao"

    if tipo == "rima-contagem":
        return "evolucao" if diff["depois"] > diff["antes"] else "regressao"

    if tipo.startswith("voz-"):
        if diff["antes"] is None and diff["depois"] is not None:
            return "evolucao"
        if diff["antes"] is not None and diff["depois"] is None:
            return "regressao"
        return "neutro"

    return "neutro"


def gerar_relatorio(resultados: list, hoje: str) -> str:
    total        = len(resultados)
    com_diff     = [r for r in resultados if r["diffs"]]
    regressoes   = [r for r in resultados if any(d.get("classe") == "regressao"  for d in r["diffs"])]
    evolucoes    = [r for r in resultados if any(d.get("classe") == "evolucao"   for d in r["diffs"])]
    sem_mudanca  = total - len(com_diff)

    linhas = [
        f"# Relatório Guarda de Regressão — {hoje}",
        f"\n**Corpus:** {total} frases · **Com diferença:** {len(com_diff)} · **Regressões:** {len(regressoes)} · **Evoluções:** {len(evolucoes)} · **Sem mudança:** {sem_mudanca}",
        "",
    ]

    if regressoes:
        linhas.append("\n## Regressões\n")
        for r in regressoes:
            linhas.append(f"### [{r['zona']}] {r['frase']}")
            linhas.append(f"**Gabarito:** {r['gabarito']}\n")
            for d in r["diffs"]:
                if d.get("classe") == "regressao":
                    linhas.append(f"- **{d['tipo']}** `{d.get('token','')}`: antes `{d.get('antes','')}` → depois `{d.get('depois','')}`")
            linhas.append("")

    if evolucoes:
        linhas.append("\n## Evoluções\n")
        for r in evolucoes:
            linhas.append(f"### [{r['zona']}] {r['frase']}")
            linhas.append(f"**Gabarito:** {r['gabarito']}\n")
            for d in r["diffs"]:
                if d.get("classe") == "evolucao":
                    linhas.append(f"- **{d['tipo']}** `{d.get('token','')}`: antes `{d.get('antes','')}` → depois `{d.get('depois','')}`")
            linhas.append("")

    neutros = [r for r in com_diff if not any(d.get("classe") in ("regressao","evolucao") for d in r["diffs"])]
    if neutros:
        linhas.append("\n## Mudanças neutras\n")
        for r in neutros:
            linhas.append(f"- [{r['zona']}] {r['frase'][:70]}")

    if not com_diff:
        linhas.append("\n**Nenhuma diferença detectada.** Engines estáveis.\n")

    return "\n".join(linhas)


async def run(base_url: str = BASE_URL, browser_executable: str | None = None):
    if not GOLDEN.exists():
        print("ERRO: golden files não encontrados. Rode gerar-golden.py primeiro.")
        sys.exit(1)

    entries = parse_corpus(CORPUS)
    golden  = load_golden(GOLDEN)
    REPORTS.mkdir(parents=True, exist_ok=True)

    print(f"Corpus: {len(entries)} frases | Golden: {len(golden)} entradas")

    async with async_playwright() as pw:
        launch_options = {"headless": True}
        if browser_executable:
            launch_options["executable_path"] = browser_executable
        browser = await pw.chromium.launch(**launch_options)
        page    = await browser.new_page()

        print(f"Abrindo {base_url} ...")
        await page.goto(base_url, wait_until="networkidle", timeout=30_000)
        await wait_engines(page)
        print("Engines prontas.\n")

        resultados = []

        for i, entry in enumerate(entries, 1):
            frase   = entry["frase"]
            zona    = entry.get("zona", "?")
            gabarito = entry.get("gabarito", "")

            current = await capture(page, frase)
            diffs   = []

            if frase in golden:
                raw_diffs = compare_outputs(current, golden[frase])
                for d in raw_diffs:
                    d["classe"] = classify_diff(d, gabarito)
                diffs = raw_diffs
            else:
                diffs = [{"tipo": "frase-nova", "classe": "neutro"}]

            flag = ""
            if any(d.get("classe") == "regressao" for d in diffs): flag = " ⚠"
            elif any(d.get("classe") == "evolucao" for d in diffs): flag = " ✓"

            print(f"[{i:02}/{len(entries)}] {zona}{flag}")

            resultados.append({
                "frase":    frase,
                "zona":     zona,
                "gabarito": gabarito,
                "diffs":    diffs,
            })

        await browser.close()

    hoje = str(date.today())

    # Relatório legível
    relatorio = gerar_relatorio(resultados, hoje)
    md_path   = REPORTS / f"{hoje}.md"
    md_path.write_text(relatorio, encoding="utf-8")
    print(f"\nRelatório: {md_path}")

    # JSON bruto
    json_path = REPORTS / f"{hoje}.json"
    json_path.write_text(
        json.dumps({"data": hoje, "total": len(resultados), "resultados": resultados},
                   ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"Dados:     {json_path}")

    # Resumo no terminal
    regressoes = sum(1 for r in resultados if any(d.get("classe") == "regressao" for d in r["diffs"]))
    evolucoes  = sum(1 for r in resultados if any(d.get("classe") == "evolucao"  for d in r["diffs"]))
    print(f"\nRegressões: {regressoes} | Evoluções: {evolucoes} | Total: {len(resultados)}")

    if regressoes > 0:
        sys.exit(1)  # sinaliza falha para GitHub Actions


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--browser-executable", default=None)
    args = parser.parse_args()
    asyncio.run(run(args.base_url, args.browser_executable or find_system_browser()))
