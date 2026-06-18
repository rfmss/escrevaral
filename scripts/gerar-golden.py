#!/usr/bin/env python3
"""
gerar-golden.py
Escrevaral — Guarda de Regressão

Roda o corpus do Catedrático contra as engines locais e salva os
outputs como golden files. Execute UMA vez para estabelecer a linha
de base. Depois, o script comparar-golden.py detecta regressões.

Uso:
  python3 -m http.server 8799 &   (na pasta do projeto)
  python3 scripts/gerar-golden.py
"""

import asyncio
import json
import re
import sys
from pathlib import Path
from datetime import date

from playwright.async_api import async_playwright

BASE_URL  = "http://localhost:8799"
CORPUS    = Path(__file__).parent / "corpus-catedratico.txt"
GOLDEN    = Path(__file__).parent / "golden"
TIMEOUT   = 15_000  # ms


def parse_corpus(path: Path) -> list[dict]:
    """Lê corpus-catedratico.txt e retorna lista de entradas."""
    entries = []
    current = {}
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


async def wait_engines(page):
    """Aguarda engines carregarem (syntaxEngine + VeredaPunctuation)."""
    await page.wait_for_function(
        "window.syntaxEngine && window.syntaxEngine._isReady() && window.VeredaPunctuation",
        timeout=TIMEOUT
    )


async def capture_sintaxe(page, frase: str) -> dict:
    return await page.evaluate("""(frase) => {
        try {
            const morfo   = window.syntaxEngine.analisarMorfologia(frase);
            const periodo = window.syntaxEngine.analisarPeriodo(frase);
            return {
                morfologia: (morfo || []).map(t => ({
                    text:  t.text  || t.token || '',
                    tags:  t.tags  || (t.tag ? [t.tag] : []),
                    normal: t.normal || '',
                })),
                periodo: {
                    tipo: periodo?.resumo?.tipo || periodo?.tipo || null,
                    ordens: periodo?.ordens || [],
                },
            };
        } catch(e) { return { erro: e.message }; }
    }""", frase)


async def capture_pontuacao(page, frase: str) -> dict:
    return await page.evaluate("""(frase) => {
        try {
            const r = window.VeredaPunctuation.analyze(frase) || {};
            const issues = r.issues || [];
            return { alertas: issues.map(a => ({ codigo: a.ruleId, severidade: a.severity, trecho: a.fragment })) };
        } catch(e) { return { erro: e.message }; }
    }""", frase)


async def capture_voz(page, frase: str) -> dict:
    return await page.evaluate("""(frase) => {
        try {
            const r = window.VeredaVoice.analyze(frase);
            return {
                vozPassiva:      r.vozPassiva      ?? null,
                vozIndet:        r.vozIndeterminada ?? null,
                vozAtiva:        r.vozAtiva         ?? null,
            };
        } catch(e) { return { erro: e.message }; }
    }""", frase)


async def capture_rima(page, frase: str) -> dict:
    return await page.evaluate("""(frase) => {
        try {
            if (!window.VeredaRimaLab) return { disponivel: false };
            const r = window.VeredaRimaLab.analyze(frase);
            return {
                disponivel: true,
                rimas:      (r.rhymes        || []).slice(0, 10),
                assonancia: (r.assonance     || []).slice(0, 10),
                aliteracao: (r.alliteration  || []).slice(0, 10),
            };
        } catch(e) { return { erro: e.message }; }
    }""", frase)


async def run():
    entries = parse_corpus(CORPUS)
    if not entries:
        print("ERRO: corpus vazio ou não encontrado.")
        sys.exit(1)

    print(f"Corpus: {len(entries)} frases")
    GOLDEN.mkdir(exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page    = await browser.new_page()

        print(f"Abrindo {BASE_URL} ...")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=30_000)
        await wait_engines(page)
        print("Engines prontas.\n")

        results = []

        for i, entry in enumerate(entries, 1):
            frase = entry["frase"]
            zona  = entry.get("zona", "?")
            print(f"[{i:02}/{len(entries)}] {zona}: {frase[:60]}")

            sintaxe   = await capture_sintaxe(page, frase)
            pontuacao = await capture_pontuacao(page, frase)
            voz       = await capture_voz(page, frase)
            rima      = await capture_rima(page, frase)

            results.append({
                "frase":    frase,
                "zona":     zona,
                "testa":    entry.get("testa", ""),
                "gabarito": entry.get("gabarito", ""),
                "output": {
                    "sintaxe":   sintaxe,
                    "pontuacao": pontuacao,
                    "voz":       voz,
                    "rima":      rima,
                }
            })

        await browser.close()

    # Salva golden file principal
    golden_path = GOLDEN / "corpus-output.json"
    golden_path.write_text(
        json.dumps({
            "gerado_em":   str(date.today()),
            "total_frases": len(results),
            "frases":      results,
        }, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nGolden file salvo: {golden_path}")

    # Salva resumo legível por zona
    por_zona: dict[str, list] = {}
    for r in results:
        por_zona.setdefault(r["zona"], []).append(r)

    resumo_path = GOLDEN / "resumo-por-zona.md"
    linhas = [f"# Golden Files — Resumo por zona\nGerado em: {date.today()}\n"]
    for zona, itens in sorted(por_zona.items()):
        linhas.append(f"\n## {zona} ({len(itens)} frase(s))\n")
        for it in itens:
            alertas = it["output"]["pontuacao"].get("alertas", [])
            morfo   = it["output"]["sintaxe"].get("morfologia", [])
            linhas.append(f"**Frase:** {it['frase']}")
            linhas.append(f"**Gabarito:** {it['gabarito']}")
            tags = ", ".join(f"{t['text']}=[{','.join(t['tags'])}]" for t in morfo) if morfo else "—"
            linhas.append(f"**Morfologia:** {tags}")
            linhas.append(f"**Pontuação alertas:** {len(alertas)}")
            linhas.append("")

    resumo_path.write_text("\n".join(linhas), encoding="utf-8")
    print(f"Resumo legível salvo: {resumo_path}")
    print("\nPronto. Golden files estabelecidos como linha de base.")


if __name__ == "__main__":
    asyncio.run(run())
