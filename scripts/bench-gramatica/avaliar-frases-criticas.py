#!/usr/bin/env python3
"""
Bancada pequena para frases gramaticais criticas.

Uso:
  python3 -m http.server 8799
  python3 scripts/bench-gramatica/avaliar-frases-criticas.py

Este script nao altera o app. Ele abre o Escrevaral no navegador, roda a
engine atual contra scripts/bench-gramatica/frases-criticas.json e grava um
relatorio em reports/auditoria/.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import sys
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from playwright.async_api import Error as PlaywrightError
from playwright.async_api import async_playwright


ROOT = Path(__file__).resolve().parents[2]
CORPUS = Path(__file__).with_name("frases-criticas.json")
REPORTS = ROOT / "reports" / "auditoria"
DEFAULT_BASE_URL = "http://localhost:8799"
TIMEOUT = 15_000
SYSTEM_BROWSER_CANDIDATES = (
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
)

TECH_TO_ENGINE = {
    "ADJ": {"Adjective"},
    "ADP": {"Preposition"},
    "ADV": {"Adverb"},
    "AUX": {"Verb"},
    "CCONJ": {"Conjunction"},
    "DET": {"Determiner"},
    "INTJ": {"Interjection"},
    "NOUN": {"Noun"},
    "NUM": {"Numeral"},
    "PRON": {"Pronoun"},
    "PROPN": {"Noun"},
    "SCONJ": {"Conjunction"},
    "VERB": {"Verb"},
}

SCHOOL_TO_ENGINE = {
    "adjetivo": {"Adjective"},
    "artigo": {"Determiner"},
    "conjuncao": {"Conjunction"},
    "interjeicao": {"Interjection"},
    "locucao adverbial": {"Adverb"},
    "numeral": {"Numeral"},
    "preposicao": {"Preposition"},
    "pronome": {"Pronoun"},
    "substantivo": {"Noun"},
    "verbo": {"Verb"},
}


def strip_diacritics(value: str) -> str:
    return "".join(
        ch
        for ch in unicodedata.normalize("NFD", value.lower().strip())
        if unicodedata.category(ch) != "Mn"
    )


def token_norm(value: str) -> str:
    value = strip_diacritics(value)
    return re.sub(r"[^\w]+", "", value, flags=re.UNICODE)


def target_parts(value: str) -> list[str]:
    return [token_norm(part) for part in re.findall(r"\w+", value, flags=re.UNICODE) if token_norm(part)]


def expected_engine_tags(target: dict[str, Any]) -> list[str]:
    tags: set[str] = set()

    tech = str(target.get("classe_tecnica", "")).upper().strip()
    tags.update(TECH_TO_ENGINE.get(tech, set()))

    school = strip_diacritics(str(target.get("classe_escolar", "")))
    for label, mapped in SCHOOL_TO_ENGINE.items():
        if label in school:
            tags.update(mapped)

    return sorted(tags)


def find_windows(tokens: list[dict[str, Any]], target_text: str) -> list[list[int]]:
    parts = target_parts(target_text)
    if not parts:
        return []

    token_norms = [token_norm(str(token.get("text", ""))) for token in tokens]
    windows: list[list[int]] = []
    width = len(parts)
    for start in range(0, len(token_norms) - width + 1):
        if token_norms[start : start + width] == parts:
            windows.append(list(range(start, start + width)))
    return windows


def observed_for_window(tokens: list[dict[str, Any]], indexes: list[int]) -> dict[str, Any]:
    matched = [tokens[index] for index in indexes]
    observed_tags = sorted({tag for token in matched for tag in token.get("tags", [])})
    return {
        "tokens": [
            {
                "text": token.get("text", ""),
                "tags": token.get("tags", []),
                "normal": token.get("normal", ""),
            }
            for token in matched
        ],
        "tags": observed_tags,
    }


def evaluate_target(tokens: list[dict[str, Any]], target: dict[str, Any]) -> dict[str, Any]:
    expected = expected_engine_tags(target)
    windows = find_windows(tokens, str(target.get("texto", "")))

    if not windows:
        return {
            "texto": target.get("texto", ""),
            "status": "sem-token",
            "esperado": expected,
            "observado": None,
            "alvo": target,
        }

    observed = observed_for_window(tokens, windows[0])
    if not expected:
        status = "sem-expectativa"
    elif set(expected) & set(observed["tags"]):
        status = "ok"
    else:
        status = "divergente"

    return {
        "texto": target.get("texto", ""),
        "status": status,
        "esperado": expected,
        "observado": observed,
        "alvo": target,
    }


async def wait_engines(page: Any) -> None:
    await page.wait_for_function(
        "window.syntaxEngine && window.syntaxEngine._isReady && window.syntaxEngine._isReady()",
        timeout=TIMEOUT,
    )


def find_system_browser() -> str | None:
    for candidate in SYSTEM_BROWSER_CANDIDATES:
        path = shutil.which(candidate)
        if path:
            return path
    return None


async def capture_case(page: Any, phrase: str) -> dict[str, Any]:
    return await page.evaluate(
        """(frase) => {
            const morfo = window.syntaxEngine.analisarMorfologia(frase) || [];
            let periodo = null;
            try {
                periodo = window.syntaxEngine.analisarPeriodo(frase) || null;
            } catch (_) {}
            return {
                morfologia: morfo.map(t => ({
                    text: t.text || t.token || '',
                    tags: t.tags || (t.tag ? [t.tag] : []),
                    normal: t.normal || '',
                })),
                periodo: {
                    tipo: periodo?.resumo?.tipo || periodo?.tipo || null,
                    conjuncoes: (periodo?.conjuncoes || []).slice(0, 10),
                    locucoes: (periodo?.locucoes || []).slice(0, 10),
                },
            };
        }""",
        phrase,
    )


def load_corpus(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    cases = data.get("casos", [])
    if not isinstance(cases, list) or not cases:
        raise ValueError(f"Corpus vazio ou invalido: {path}")
    return cases


async def run_browser(
    cases: list[dict[str, Any]],
    base_url: str,
    browser_executable: str | None,
) -> list[dict[str, Any]]:
    async with async_playwright() as pw:
        launch_options: dict[str, Any] = {"headless": True}
        if browser_executable:
            launch_options["executable_path"] = browser_executable
        browser = await pw.chromium.launch(**launch_options)
        page = await browser.new_page()
        await page.goto(base_url, wait_until="networkidle", timeout=30_000)
        await wait_engines(page)

        results = []
        for case in cases:
            phrase = str(case.get("frase", ""))
            captured = await capture_case(page, phrase)
            tokens = captured.get("morfologia", [])
            targets = [evaluate_target(tokens, target) for target in case.get("alvos", [])]
            results.append(
                {
                    "id": case.get("id", ""),
                    "frase": phrase,
                    "status": summarize_case_status(targets),
                    "alvos": targets,
                    "captura": captured,
                }
            )

        await browser.close()
        return results


def summarize_case_status(targets: list[dict[str, Any]]) -> str:
    statuses = {target.get("status") for target in targets}
    if "divergente" in statuses:
        return "divergente"
    if "sem-token" in statuses:
        return "sem-token"
    if "sem-expectativa" in statuses:
        return "sem-expectativa"
    return "ok"


def render_tokens(tokens: list[dict[str, Any]]) -> str:
    parts = []
    for token in tokens:
        text = token.get("text", "")
        tags = ",".join(token.get("tags", [])) or "-"
        parts.append(f"{text}=[{tags}]")
    return " ".join(parts)


def render_report(results: list[dict[str, Any]], base_url: str, browser_executable: str | None) -> str:
    today = date.today().isoformat()
    counts = Counter(result["status"] for result in results)
    total_targets = sum(len(result.get("alvos", [])) for result in results)
    divergent_targets = sum(
        1
        for result in results
        for target in result.get("alvos", [])
        if target.get("status") == "divergente"
    )

    lines = [
        f"# Bancada gramatical - frases criticas - {today}",
        "",
        f"Base URL: `{base_url}`",
        f"Navegador: `{browser_executable or 'playwright-default'}`",
        f"Casos: {len(results)}",
        f"Alvos: {total_targets}",
        f"Alvos divergentes: {divergent_targets}",
        "",
        "## Resumo por caso",
        "",
    ]

    for status in ("ok", "divergente", "sem-token", "sem-expectativa"):
        if counts.get(status):
            lines.append(f"- {status}: {counts[status]}")
    lines.append("")

    if any(result["status"] != "ok" for result in results):
        lines.extend(["## Pontos para revisar", ""])
        for result in results:
            if result["status"] == "ok":
                continue
            lines.append(f"### {result['id']}")
            lines.append("")
            lines.append(result["frase"])
            lines.append("")
            for target in result["alvos"]:
                if target["status"] == "ok":
                    continue
                observed = target.get("observado") or {}
                observed_tokens = render_tokens(observed.get("tokens", [])) if observed else "token nao encontrado"
                expected = ", ".join(target.get("esperado", [])) or "-"
                lines.append(
                    f"- `{target['texto']}`: esperado `{expected}`; observado {observed_tokens}; status `{target['status']}`"
                )
                alvo = target.get("alvo", {})
                if alvo.get("alerta_ortografico"):
                    lines.append(f"  - alerta ortografico esperado: `{alvo.get('forma_normativa', '')}`")
            tokens = result.get("captura", {}).get("morfologia", [])
            lines.append("")
            lines.append(f"Tokens: {render_tokens(tokens)}")
            lines.append("")

    lines.extend(["## Todos os casos", ""])
    for result in results:
        lines.append(f"- `{result['status']}` `{result['id']}`: {result['frase']}")

    return "\n".join(lines) + "\n"


def write_reports(
    results: list[dict[str, Any]],
    base_url: str,
    browser_executable: str | None,
) -> tuple[Path, Path]:
    REPORTS.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    md_path = REPORTS / f"frases-criticas-gramatica-{today}.md"
    json_path = REPORTS / f"frases-criticas-gramatica-{today}.json"

    md_path.write_text(render_report(results, base_url, browser_executable), encoding="utf-8")
    json_path.write_text(
        json.dumps(
            {
                "data": today,
                "base_url": base_url,
                "browser_executable": browser_executable,
                "resultados": results,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return md_path, json_path


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--browser-executable", default=None)
    parser.add_argument("--corpus", type=Path, default=CORPUS)
    parser.add_argument("--fail-on-divergence", action="store_true")
    args = parser.parse_args()

    cases = load_corpus(args.corpus)
    browser_executable = args.browser_executable or find_system_browser()

    try:
        results = await run_browser(cases, args.base_url, browser_executable)
    except PlaywrightError as exc:
        print(f"ERRO Playwright: {exc}", file=sys.stderr)
        print("Dica: rode `python3 -m http.server 8799` na raiz do repo.", file=sys.stderr)
        return 2

    md_path, json_path = write_reports(results, args.base_url, browser_executable)
    counts = Counter(result["status"] for result in results)
    divergent = counts.get("divergente", 0)
    print(f"Casos: {len(results)} | OK: {counts.get('ok', 0)} | Divergentes: {divergent}")
    print(f"Relatorio: {md_path}")
    print(f"JSON: {json_path}")

    if args.fail_on_divergence and divergent:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
