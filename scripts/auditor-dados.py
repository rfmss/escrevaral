#!/usr/bin/env python3
"""
Auditor de dados linguisticos do Escrevaral.

Foco: falsos verdes em vocabularios marcados como maduros. O script nao altera
dados; ele aponta duplicidade silenciosa, colisao morfologica e higiene basica
das bases de sinonimos, decolonial, lexico, RimaLab e norma.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DATA = date.today().isoformat()
REPORT_MD = ROOT / "reports" / "auditoria" / f"dados-linguisticos-{DATA}.md"
REPORT_JSON = ROOT / "reports" / "auditoria" / f"dados-linguisticos-{DATA}.json"

SEVERITY_ORDER = {"P0": 0, "P1": 1, "P2": 2}
ISSUES: list[dict[str, Any]] = []
JSON_KEY_DUPLICATES: dict[str, list[str]] = {}

SYN_ENTRY_RE = re.compile(r'^\s*"([^"]+)"\s*:\s*\[(.*?)\]\s*,?\s*$')
JS_STRING_RE = re.compile(r'"((?:\\.|[^"\\])*)"')


def strip_diacritics(value: str) -> str:
    return "".join(
        ch
        for ch in unicodedata.normalize("NFD", value.lower().strip())
        if unicodedata.category(ch) != "Mn"
    )


def clean_key(value: Any) -> str:
    return strip_diacritics(str(value))


def add_issue(
    severity: str,
    area: str,
    title: str,
    evidence: str = "",
    recommendation: str = "",
) -> None:
    ISSUES.append(
        {
            "severity": severity,
            "area": area,
            "title": title,
            "evidence": evidence,
            "recommendation": recommendation,
        }
    )


def load_json(rel_path: str) -> Any:
    path = ROOT / rel_path
    duplicate_keys: list[str] = []

    def object_hook(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        seen: set[str] = set()
        for key, _value in pairs:
            if key in seen:
                duplicate_keys.append(key)
            seen.add(key)
        return dict(pairs)

    try:
        data = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=object_hook)
    except json.JSONDecodeError as exc:
        add_issue("P0", rel_path, "JSON invalido", f"{exc.msg} na linha {exc.lineno}", "Corrigir antes de expandir a base.")
        return {}

    if duplicate_keys:
        JSON_KEY_DUPLICATES[rel_path] = duplicate_keys
        counts = Counter(duplicate_keys)
        evidence = ", ".join(f"{key} ({count + 1}x)" for key, count in counts.most_common(12))
        add_issue(
            "P0",
            rel_path,
            "Chaves JSON duplicadas sobrescrevem dados silenciosamente",
            evidence,
            "Unificar as entradas repetidas; JSON preserva apenas a ultima ocorrencia em objetos comuns.",
        )
    return data


def decode_js_string(raw: str) -> str:
    try:
        return json.loads(f'"{raw}"')
    except json.JSONDecodeError:
        return raw


def parse_synonyms() -> list[dict[str, Any]]:
    path = ROOT / "synonym-data.js"
    entries: list[dict[str, Any]] = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        match = SYN_ENTRY_RE.match(line)
        if not match:
            continue
        key = decode_js_string(match.group(1))
        values = [decode_js_string(raw) for raw in JS_STRING_RE.findall(match.group(2))]
        entries.append({"key": key, "line": lineno, "values": values})
    return entries


def duplicate_groups(values: list[Any], normalize=clean_key) -> dict[str, list[Any]]:
    groups: dict[str, list[Any]] = defaultdict(list)
    for value in values:
        groups[normalize(value)].append(value)
    return {key: group for key, group in groups.items() if key and len(group) > 1}


def duplicate_array_issue(
    area: str,
    label: str,
    values: list[Any],
    severity: str,
    recommendation: str,
    normalize=clean_key,
    limit: int = 12,
) -> None:
    groups = duplicate_groups(values, normalize)
    if not groups:
        return
    examples = []
    for _norm, group in sorted(groups.items())[:limit]:
        rendered = " / ".join(str(item) for item in group[:4])
        examples.append(rendered)
    suffix = "" if len(groups) <= limit else f" (+{len(groups) - limit})"
    add_issue(
        severity,
        area,
        f"{label} tem duplicidades ou equivalentes normalizados",
        "; ".join(examples) + suffix,
        recommendation,
    )


def suspicious_letters(value: str) -> list[str]:
    bad: list[str] = []
    for ch in value:
        if ch in {"ª", "º"}:
            continue
        if not ch.isalpha():
            continue
        name = unicodedata.name(ch, "")
        if "LATIN" not in name:
            bad.append(ch)
    return sorted(set(bad))


def walk_strings(value: Any, path: str = "$") -> list[tuple[str, str]]:
    if isinstance(value, str):
        return [(path, value)]
    if isinstance(value, list):
        out: list[tuple[str, str]] = []
        for idx, item in enumerate(value):
            out.extend(walk_strings(item, f"{path}[{idx}]"))
        return out
    if isinstance(value, dict):
        out = []
        for key, item in value.items():
            out.extend(walk_strings(key, f"{path}.<key>"))
            out.extend(walk_strings(item, f"{path}.{key}"))
        return out
    return []


def audit_suspicious_unicode(label: str, data: Any, limit: int = 20) -> None:
    hits = []
    for path, value in walk_strings(data):
        bad = suspicious_letters(value)
        if bad:
            hits.append(f"{path}: {''.join(bad)} em `{value[:60]}`")
    if hits:
        add_issue(
            "P0",
            label,
            "Caracteres alfabeticos nao latinos em dados linguisticos",
            "; ".join(hits[:limit]) + ("" if len(hits) <= limit else f" (+{len(hits) - limit})"),
            "Revisar possivel colagem corrompida ou termo estrangeiro indevido.",
        )


def audit_synonyms() -> None:
    entries = parse_synonyms()
    by_key: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_norm: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for entry in entries:
        by_key[entry["key"]].append(entry)
        by_norm[clean_key(entry["key"])].append(entry)

        repeated_values = duplicate_groups(entry["values"], normalize=lambda x: str(x).strip().lower())
        if repeated_values:
            values = []
            for _norm, group in repeated_values.items():
                values.append(" / ".join(group[:4]))
            add_issue(
                "P2",
                "synonym-data.js",
                f"Entrada `{entry['key']}` repete sinonimo",
                f"linha {entry['line']}: " + "; ".join(values[:6]),
                "Remover repeticoes internas para aumentar diversidade real.",
            )

    duplicate_exact = {key: group for key, group in by_key.items() if len(group) > 1}
    if duplicate_exact:
        examples = []
        for key, group in sorted(duplicate_exact.items())[:16]:
            lines = ", ".join(str(item["line"]) for item in group)
            examples.append(f"`{key}` linhas {lines}")
        add_issue(
            "P0",
            "synonym-data.js",
            "Chaves duplicadas em objeto JS sobrescrevem sinonimos",
            "; ".join(examples),
            "Mesclar as listas duplicadas; no objeto JS a ultima chave vence.",
        )

    duplicate_norm = {
        key: group
        for key, group in by_norm.items()
        if len({item["key"] for item in group}) > 1
    }
    if duplicate_norm:
        examples = []
        for _norm, group in sorted(duplicate_norm.items())[:12]:
            rendered = ", ".join(f"`{item['key']}`:{item['line']}" for item in group[:4])
            examples.append(rendered)
        add_issue(
            "P1",
            "synonym-data.js",
            "Entradas de sinonimos colidem apos normalizacao",
            "; ".join(examples),
            "Confirmar se sao variantes intencionais; se forem, mesclar ou documentar.",
        )

    audit_suspicious_unicode("synonym-data.js", entries)


def parse_syntax_set(name: str) -> list[str]:
    source = (ROOT / "syntax-engine.js").read_text(encoding="utf-8")
    match = re.search(rf"const\s+{re.escape(name)}\s*=\s*new Set\(\[(.*?)\]\);", source, re.S)
    if not match:
        add_issue("P1", "syntax-engine.js", f"Nao foi possivel ler `{name}`", "", "Ajustar regex do auditor se a estrutura mudou.")
        return []
    return [decode_js_string(raw) for raw in JS_STRING_RE.findall(match.group(1))]


def set_intersection(left: list[str], right: list[str], normalize=lambda x: str(x).lower()) -> list[str]:
    left_norm = {normalize(item): item for item in left}
    right_norm = {normalize(item): item for item in right}
    return sorted(left_norm.keys() & right_norm.keys())


def audit_morphology_collisions(norma: dict[str, Any], lexical: dict[str, Any]) -> None:
    verbos_irr = list(norma.get("formas_verbais_irr") or [])
    verbos_pres = list(norma.get("verbos_pres_reg") or [])
    verbos = verbos_irr + verbos_pres
    adjetivos_norma = list(norma.get("adjetivos_comuns") or [])
    adjetivos_lexical = list((lexical.get("functionWords") or {}).get("adjetivos_comuns") or [])
    adjetivos_prim = parse_syntax_set("ADJETIVOS_PRIM")

    exact_lexical = set_intersection(adjetivos_lexical, verbos, normalize=lambda x: str(x).lower())
    if exact_lexical:
        add_issue(
            "P0",
            "lexical-data.json/functionWords.adjetivos_comuns",
            "Adjetivos comuns tambem sao formas verbais exatas",
            ", ".join(f"`{item}`" for item in exact_lexical[:30]),
            "No lexical-engine, functionWords.adjetivos_comuns e checado antes de verbos; exigir contexto ou remover da lista cega.",
        )

    exact_syntax = set_intersection(adjetivos_prim, verbos, normalize=lambda x: str(x).lower())
    if exact_syntax:
        # Verificar se ja existe guarda pre-ADJETIVOS_PRIM no cascade de syntax-engine.js (v781+)
        with open("syntax-engine.js", encoding="utf-8") as _sf:
            _sc = _sf.read()
        _has_preguard = "_VERBOS_PRES.has(_stripDiac(norm))" in _sc and "ADJETIVOS_PRIM.has(norm)" in _sc
        _guard_before = _sc.index("_VERBOS_PRES.has(_stripDiac(norm))") < _sc.index("ADJETIVOS_PRIM.has(norm)") if _has_preguard else False
        severity = "P1" if _guard_before else "P0"
        add_issue(
            severity,
            "syntax-engine.js/ADJETIVOS_PRIM",
            "Adjetivo primitivo hardcoded tambem e forma verbal exata" + (" (mitigado por guarda pre-ADJETIVOS_PRIM no cascade)" if _guard_before else ""),
            ", ".join(f"`{item}`" for item in exact_syntax[:30]),
            "Guarda contextual ja presente antes de ADJETIVOS_PRIM; colisao coberta para formas verbais de presente." if _guard_before else "Checar verbos presentes antes de ADJETIVOS_PRIM ou resolver por janela contextual.",
        )

    exact_pres = set_intersection(adjetivos_norma, verbos_pres, normalize=lambda x: str(x).lower())
    if exact_pres:
        # Verificar se a guarda adnominal (2-token lookback) esta presente no VERBOS_PRES do syntax-engine.js (v794+)
        with open("syntax-engine.js", encoding="utf-8") as _sf2:
            _sc2 = _sf2.read()
        _has_adnominal_guard = 'tokens[i-2].toLowerCase() === "a"' in _sc2 and "_VERBOS_PRES.has(_stripDiac(norm))" in _sc2
        _pres_severity = "P1" if _has_adnominal_guard else "P0"
        add_issue(
            _pres_severity,
            "norma-data.json/adjetivos_comuns",
            "Adjetivos da norma colidem com presente verbal regular" + (" (mitigado por guarda adnominal 2-token no VERBOS_PRES)" if _has_adnominal_guard else ""),
            ", ".join(f"`{item}`" for item in exact_pres[:30]),
            "Guarda adnominal presente: Art+N+Adj bloqueado antes de VERBOS_PRES; colisao coberta." if _has_adnominal_guard else "Classificar por contexto sintatico: sujeito + forma presente => verbo; nome/artigo + termo => adjetivo.",
        )

    exact_irr = set_intersection(adjetivos_norma, verbos_irr, normalize=lambda x: str(x).lower())
    if exact_irr:
        add_issue(
            "P1",
            "norma-data.json/adjetivos_comuns",
            "Adjetivos da norma colidem com formas verbais/participios irregulares",
            ", ".join(f"`{item}`" for item in exact_irr[:30]),
            "Manter se forem adjetivos legitimos, mas cobrir com teste contextual de particípio/adjetivo.",
        )

    normalized_sources = [
        ("syntax ADJETIVOS_PRIM", adjetivos_prim),
        ("lexical adjetivos_comuns", adjetivos_lexical),
        ("norma adjetivos_comuns", adjetivos_norma),
    ]
    verb_norm = {clean_key(item) for item in verbos}
    normalized_hits = []
    exact_hits = {str(item).lower() for item in exact_lexical + exact_syntax + exact_pres + exact_irr}
    for source, words in normalized_sources:
        for word in words:
            key = clean_key(word)
            if key in verb_norm and str(word).lower() not in exact_hits:
                normalized_hits.append(f"{source}: `{word}` -> `{key}`")
    if normalized_hits:
        add_issue(
            "P1",
            "morfologia/listas",
            "Colisoes verbo-adjetivo aparecem apos tirar acento",
            "; ".join(sorted(set(normalized_hits))[:36]),
            "Testar pares como serio/seria, publico/publica e largo/larga com e sem acento.",
        )


def audit_lexical(lexical: dict[str, Any]) -> None:
    function_words = lexical.get("functionWords") or {}
    for name, values in function_words.items():
        if isinstance(values, list):
            duplicate_array_issue(
                "lexical-data.json/functionWords",
                name,
                values,
                "P2",
                "Remover duplicidade literal; variantes acentuadas podem ficar se forem decisao de produto.",
                normalize=lambda x: str(x).strip().lower(),
            )

    local = lexical.get("localLexicon") or {}
    missing = [
        key for key, value in local.items()
        if not isinstance(value, dict) or not value.get("field") or not value.get("note")
    ]
    if missing:
        add_issue(
            "P1",
            "lexical-data.json/localLexicon",
            "Entradas sem field/note completos",
            ", ".join(f"`{item}`" for item in missing[:30]),
            "Completar ficha para manter a Biblioteca de palavras em 100%.",
        )
    duplicate_array_issue(
        "lexical-data.json/localLexicon",
        "chaves normalizadas",
        list(local.keys()),
        "P1",
        "Mesclar variantes que apontem para a mesma palavra normalizada, ou documentar excecoes.",
    )
    audit_suspicious_unicode("lexical-data.json", lexical)


def audit_norma(norma: dict[str, Any]) -> None:
    high_risk_arrays = [
        "formas_verbais_irr",
        "verbos_pres_reg",
        "adjetivos_comuns",
        "substantivos_ia",
        "_particípios_irregulares_extra",
        "verbos_ligacao_extra",
    ]
    for key in high_risk_arrays:
        values = norma.get(key)
        if isinstance(values, list):
            duplicate_array_issue(
                "norma-data.json",
                key,
                values,
                "P1",
                "Remover duplicidade ou documentar variante intencional.",
                normalize=lambda x: str(x).strip().lower(),
            )
    audit_suspicious_unicode("norma-data.json", norma)


def audit_decolonial(decolonial: dict[str, Any]) -> None:
    categories = set((decolonial.get("categories") or {}).keys())
    entries = decolonial.get("entries") or []

    invalid_categories = []
    missing_alternatives = []
    missing_reason = []
    avoid_terms = []

    for idx, entry in enumerate(entries):
        if not isinstance(entry, dict):
            add_issue("P0", "decolonial-data.json", "Entrada decolonial nao e objeto", f"indice {idx}", "Corrigir estrutura.")
            continue
        avoid = entry.get("avoid", "")
        avoid_terms.append(avoid)
        if not avoid:
            add_issue("P0", "decolonial-data.json", "Entrada sem termo `avoid`", f"indice {idx}", "Adicionar termo ou remover entrada.")
        if entry.get("category") not in categories:
            invalid_categories.append(f"{idx}: `{avoid}` -> `{entry.get('category')}`")
        if not entry.get("alternatives"):
            missing_alternatives.append(f"{idx}: `{avoid}`")
        if not entry.get("reason"):
            missing_reason.append(f"{idx}: `{avoid}`")
        if "contextual" in entry and not isinstance(entry.get("contextual"), bool):
            add_issue(
                "P2",
                "decolonial-data.json",
                "`contextual` deveria ser booleano",
                f"{idx}: `{avoid}`",
                "Usar true/false para previsibilidade da UI.",
            )

    if invalid_categories:
        add_issue(
            "P0",
            "decolonial-data.json",
            "Entradas apontam para categorias inexistentes",
            "; ".join(invalid_categories[:24]),
            "Criar categoria ou corrigir o campo category.",
        )
    if missing_alternatives:
        add_issue(
            "P1",
            "decolonial-data.json",
            "Entradas sensiveis sem alternativas",
            "; ".join(missing_alternatives[:24]),
            "Preencher com alternativa contextual ou `nao use` para nao deixar UI vazia.",
        )
    if missing_reason:
        add_issue(
            "P1",
            "decolonial-data.json",
            "Entradas sensiveis sem justificativa",
            "; ".join(missing_reason[:24]),
            "Explicar o risco para evitar alerta opaco.",
        )

    duplicate_array_issue(
        "decolonial-data.json",
        "avoid",
        avoid_terms,
        "P1",
        "Mesclar duplicatas normalizadas; a busca nao precisa alertar duas vezes a mesma expressao.",
        normalize=clean_key,
    )
    audit_suspicious_unicode("decolonial-data.json", decolonial)


def audit_rimalab(rimalab: dict[str, Any]) -> None:
    encyclopedia = rimalab.get("encyclopedia") or []
    titles = []
    missing = []
    for idx, entry in enumerate(encyclopedia):
        title = entry.get("title", "") if isinstance(entry, dict) else ""
        titles.append(title)
        for field in ("title", "body", "sample"):
            if not isinstance(entry, dict) or not entry.get(field):
                missing.append(f"{idx}: {field}")
    if missing:
        add_issue(
            "P1",
            "rimalab-data.json/encyclopedia",
            "Itens da enciclopedia incompletos",
            "; ".join(missing[:24]),
            "Completar antes de aumentar o numero de formas poeticas.",
        )
    duplicate_array_issue(
        "rimalab-data.json/encyclopedia",
        "titulos",
        titles,
        "P1",
        "Mesclar entradas repetidas de forma poetica.",
    )

    grammar = rimalab.get("grammarWords") or {}
    canonical = {
        "substantivo",
        "verbo",
        "adjetivo",
        "adverbio",
        "advérbio",
        "pronome",
        "artigo",
        "preposicao",
        "preposição",
        "conjuncao",
        "conjunção",
        "interjeicao",
        "interjeição",
        "numeral",
    }
    noncanonical = Counter(
        value for value in grammar.values()
        if isinstance(value, str) and clean_key(value) not in {clean_key(item) for item in canonical}
    )
    if noncanonical:
        evidence = ", ".join(f"`{key}`: {count}" for key, count in noncanonical.most_common(12))
        add_issue(
            "P2",
            "rimalab-data.json/grammarWords",
            "Classes gramaticais usam abreviaturas fora da taxonomia principal",
            evidence,
            "Normalizar `adj`, `s`, `pron` para nomes completos antes de ampliar grammarWords.",
        )
    duplicate_array_issue(
        "rimalab-data.json/grammarWords",
        "chaves normalizadas",
        list(grammar.keys()),
        "P1",
        "Mesclar variantes normalizadas ou documentar excecoes.",
    )
    audit_suspicious_unicode("rimalab-data.json", rimalab)


def audit_analise(analise: dict[str, Any]) -> None:
    stopwords = analise.get("stopwords") or []
    if isinstance(stopwords, list):
        duplicate_array_issue(
            "analise-data.json",
            "stopwords",
            stopwords,
            "P2",
            "Remover repeticoes literais.",
            normalize=lambda x: str(x).strip().lower(),
        )
    audit_suspicious_unicode("analise-data.json", analise)


def severity_counts() -> dict[str, int]:
    return {severity: sum(1 for issue in ISSUES if issue["severity"] == severity) for severity in ("P0", "P1", "P2")}


def generate_markdown() -> str:
    counts = severity_counts()
    if counts["P0"]:
        semaphore = "VERMELHO"
    elif counts["P1"]:
        semaphore = "AMARELO"
    else:
        semaphore = "VERDE"

    lines = [
        f"# Auditoria de Dados Linguisticos - {DATA}",
        "",
        f"**Semaforo:** {semaphore}  |  **P0:** {counts['P0']}  **P1:** {counts['P1']}  **P2:** {counts['P2']}",
        "",
        "Escopo: `synonym-data.js`, `norma-data.json`, `lexical-data.json`, `decolonial-data.json`, `rimalab-data.json`, `analise-data.json` e listas hardcoded de `syntax-engine.js`.",
        "",
    ]

    if not ISSUES:
        lines.append("Nenhum achado estrutural detectado.")
    else:
        for severity in ("P0", "P1", "P2"):
            group = [issue for issue in ISSUES if issue["severity"] == severity]
            if not group:
                continue
            lines += [f"## {severity}", ""]
            for issue in sorted(group, key=lambda item: (item["area"], item["title"])):
                lines.append(f"- **[{issue['area']}] {issue['title']}**")
                if issue.get("evidence"):
                    lines.append(f"  - Evidencia: {issue['evidence']}")
                if issue.get("recommendation"):
                    lines.append(f"  - Recomendacao: {issue['recommendation']}")
                lines.append("")

    lines += [
        "## Ordem de ataque sugerida",
        "",
        "1. Corrigir P0 de sinonimos e colisoes verbo/adjetivo antes de novas expansoes.",
        "2. Depois normalizar duplicatas de decolonial e lacunas de alternativas.",
        "3. Por fim, harmonizar taxonomia do RimaLab/grammarWords para evitar classes paralelas.",
        "",
        "Comando:",
        "",
        "```bash",
        "python3 scripts/auditor-dados.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    norma = load_json("norma-data.json")
    lexical = load_json("lexical-data.json")
    decolonial = load_json("decolonial-data.json")
    rimalab = load_json("rimalab-data.json")
    analise = load_json("analise-data.json")

    audit_synonyms()
    audit_norma(norma)
    audit_lexical(lexical)
    audit_morphology_collisions(norma, lexical)
    audit_decolonial(decolonial)
    audit_rimalab(rimalab)
    audit_analise(analise)

    ISSUES.sort(key=lambda item: (SEVERITY_ORDER[item["severity"]], item["area"], item["title"]))
    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text(generate_markdown() + "\n", encoding="utf-8")
    REPORT_JSON.write_text(
        json.dumps(
            {
                "date": DATA,
                "summary": severity_counts(),
                "issues": ISSUES,
                "reports": {"markdown": str(REPORT_MD), "json": str(REPORT_JSON)},
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    counts = severity_counts()
    print(f"Auditoria de dados linguisticos: P0={counts['P0']} P1={counts['P1']} P2={counts['P2']}")
    print(f"Relatorio: {REPORT_MD}")
    print(f"JSON: {REPORT_JSON}")
    return 1 if counts["P0"] else 0


if __name__ == "__main__":
    sys.exit(main())
