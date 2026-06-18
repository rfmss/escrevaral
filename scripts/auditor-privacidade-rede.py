#!/usr/bin/env python3
"""
Auditor de privacidade/rede do Escrevaral em producao.

Insere um texto-canario no editor, navega pelos modulos principais e captura
requsicoes. O objetivo e validar a promessa: texto do usuario fica no navegador
e nao e enviado para servicos externos.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://escrevaral.com"
DATA = date.today().isoformat()
REPORT_MD = ROOT / "reports" / "auditoria" / f"privacidade-rede-{DATA}.md"
REPORT_JSON = ROOT / "reports" / "auditoria" / f"privacidade-rede-{DATA}.json"

CANARY = "CANARY_ESCREVARAL_PRIV_20260618_NAO_ENVIAR"
TIMEOUT = 25_000

EXPECTED_EXTERNAL = {
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "static.cloudflareinsights.com",
    "gc.zgo.at",
    "escrevaral.goatcounter.com",
}

INIT_STORAGE = f"""
localStorage.setItem('escrevaral-termos-v1', '1');
localStorage.setItem('vrda-first-visit', '1');
localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({{
  manuscripts: [{{
    id: 'privacy-ms',
    title: 'Auditoria privacidade',
    folder: 'Teste',
    kind: 'manuscript',
    text: 'Texto local antes do canario.',
    content: 'Texto local antes do canario.',
    createdAt: 0,
    updatedAt: 0
  }}],
  activeId: 'privacy-ms',
  ui: {{}}
}}));
"""

ISSUES: list[dict[str, Any]] = []


def add_issue(severity: str, area: str, title: str, evidence: str, recommendation: str = "") -> None:
    ISSUES.append({
        "severity": severity,
        "area": area,
        "title": title,
        "evidence": evidence,
        "recommendation": recommendation,
    })


def domain_of(url: str) -> str:
    try:
        return url.split("//", 1)[1].split("/", 1)[0].split(":", 1)[0]
    except Exception:
        return ""


def is_external(url: str) -> bool:
    host = domain_of(url)
    return bool(host and host != "escrevaral.com")


def short(value: str, size: int = 220) -> str:
    value = (value or "").replace("\n", "\\n")
    return value[:size] + ("..." if len(value) > size else "")


def fetch_headers(url: str) -> dict[str, str]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EscrevaralCodexPrivacyAudit/1.0"})
        with urllib.request.urlopen(req, timeout=18) as resp:
            return {key.lower(): value for key, value in resp.headers.items()}
    except Exception as exc:  # noqa: BLE001 - auditor records network failures.
        add_issue("P2", "Headers", "nao foi possivel ler headers", str(exc), "Reexecutar auditoria.")
        return {}


def audit_headers() -> dict[str, str]:
    headers = fetch_headers(BASE_URL + "/")
    checks = {
        "content-security-policy": "CSP ausente",
        "referrer-policy": "Referrer-Policy ausente",
        "permissions-policy": "Permissions-Policy ausente",
        "x-content-type-options": "X-Content-Type-Options ausente",
        "strict-transport-security": "HSTS ausente",
    }
    for header, label in checks.items():
        if header not in headers:
            sev = "P1" if header == "content-security-policy" else "P2"
            add_issue(
                sev,
                "Headers",
                label,
                f"{BASE_URL}/ nao envia `{header}`",
                "Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.",
            )
    return headers


def severity_counts() -> dict[str, int]:
    return {severity: sum(1 for issue in ISSUES if issue["severity"] == severity) for severity in ("P0", "P1", "P2")}


def generate_markdown(result: dict[str, Any]) -> str:
    counts = severity_counts()
    semaforo = "VERMELHO" if counts["P0"] else "AMARELO" if counts["P1"] else "VERDE"
    lines = [
        f"# Auditoria Privacidade/Rede - {DATA}",
        "",
        f"**URL:** {BASE_URL}  |  **Semaforo:** {semaforo}  |  **P0:** {counts['P0']} **P1:** {counts['P1']} **P2:** {counts['P2']}",
        "",
        f"Canario usado: `{CANARY}`",
        "",
        "## Resultado do canario",
        "",
        f"- Vazou em rede: `{result['canary_leaked']}`",
        f"- Presente em localStorage: `{result['canary_in_local_storage']}`",
        f"- Requisicoes observadas: `{len(result['requests'])}`",
        f"- Dominios externos: `{', '.join(result['external_domains']) or 'nenhum'}`",
        "",
    ]

    if ISSUES:
        for severity in ("P0", "P1", "P2"):
            group = [issue for issue in ISSUES if issue["severity"] == severity]
            if not group:
                continue
            lines += [f"## {severity}", ""]
            for issue in group:
                lines.append(f"- **[{issue['area']}] {issue['title']}**")
                lines.append(f"  - Evidencia: {issue['evidence']}")
                if issue.get("recommendation"):
                    lines.append(f"  - Recomendacao: {issue['recommendation']}")
                lines.append("")
    else:
        lines += ["## Achados", "", "Nenhuma falha detectada.", ""]

    lines += [
        "## Dominios externos observados",
        "",
    ]
    for domain, count in result["external_counts"].items():
        lines.append(f"- `{domain}`: {count} requisicoes")
    if not result["external_counts"]:
        lines.append("- Nenhum.")

    lines += [
        "",
        "## Comando",
        "",
        "```bash",
        "python3 scripts/auditor-privacidade-rede.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    audit_headers()
    requests: list[dict[str, Any]] = []
    leaked: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1366, "height": 900},
            service_workers="block",
        )
        context.add_init_script(INIT_STORAGE)
        page = context.new_page()

        def on_request(req):
            post_data = req.post_data or ""
            headers = req.headers or {}
            header_blob = json.dumps(headers, ensure_ascii=False)
            item = {
                "method": req.method,
                "url": req.url,
                "domain": domain_of(req.url),
                "resource_type": req.resource_type,
                "has_post_data": bool(post_data),
                "post_data_preview": short(post_data),
            }
            requests.append(item)
            if CANARY in req.url or CANARY in post_data or CANARY in header_blob:
                leaked.append({
                    **item,
                    "where": "url/post_data/headers",
                    "post_data_preview": short(post_data, 500),
                })

        def on_requestfailed(req):
            failures.append({"url": req.url, "failure": str(req.failure)})

        page.on("request", on_request)
        page.on("requestfailed", on_requestfailed)

        page.goto(BASE_URL + "/", wait_until="domcontentloaded", timeout=TIMEOUT)
        try:
            page.wait_for_load_state("networkidle", timeout=10_000)
        except PlaywrightTimeoutError:
            pass

        page.evaluate(
            """(canary) => {
              const area = document.querySelector('.writing-area, [contenteditable="true"], textarea');
              const text = `Este texto e local. ${canary}. Nenhum servidor deveria receber esta frase.`;
              if (area) {
                area.focus();
                if (area.tagName === 'TEXTAREA') {
                  area.value = text;
                } else {
                  area.textContent = text;
                }
                area.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertText', data: text}));
              }
            }""",
            CANARY,
        )
        page.wait_for_timeout(1500)

        for view in ["biblioteca", "autoria", "arquivo", "academia", "cronograma", "editor"]:
            try:
                page.locator(f'[data-view-target="{view}"]').first.click(timeout=2_000)
                page.wait_for_timeout(900)
            except Exception:
                add_issue("P2", "Navegacao", "nao foi possivel acionar modulo durante auditoria", view, "Conferir se seletor mudou.")

        page.wait_for_timeout(1500)
        storage = page.evaluate(
            """() => {
              const out = {};
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                out[key] = localStorage.getItem(key);
              }
              return out;
            }"""
        )
        context_cookies = context.cookies()
        context.close()
        browser.close()

    canary_in_local_storage = any(CANARY in str(value) for value in storage.values())
    if leaked:
        add_issue(
            "P0",
            "Privacidade",
            "texto-canario apareceu em requisicao de rede",
            "; ".join(f"{item['method']} {item['url']}" for item in leaked[:8]),
            "Bloquear deploy ate impedir envio de texto do usuario.",
        )
    if not canary_in_local_storage:
        add_issue(
            "P1",
            "Persistencia local",
            "texto-canario nao ficou em localStorage",
            "Canario ausente apos input no editor.",
            "Validar se fixture nao acionou editor ou se persistencia falhou.",
        )

    external_counts: dict[str, int] = {}
    for item in requests:
        if is_external(item["url"]):
            external_counts[item["domain"]] = external_counts.get(item["domain"], 0) + 1
            if item["domain"] not in EXPECTED_EXTERNAL:
                add_issue(
                    "P1",
                    "Rede",
                    "dominio externo nao esperado",
                    f"{item['domain']} em {item['url']}",
                    "Confirmar necessidade ou remover dependencia.",
                )

    non_get_external = [
        item for item in requests
        if is_external(item["url"]) and item["method"] != "GET"
    ]
    if non_get_external:
        add_issue(
            "P2",
            "Rede",
            "requisicoes externas nao-GET observadas",
            "; ".join(f"{item['method']} {item['url']}" for item in non_get_external[:10]),
            "Verificar se analytics nao recebe conteudo do texto.",
        )

    cookie_domains = sorted({cookie.get("domain", "") for cookie in context_cookies})
    if cookie_domains:
        add_issue(
            "P2",
            "Cookies",
            "cookies presentes apos navegacao",
            ", ".join(cookie_domains),
            "Confirmar que nao ha cookie de rastreamento alem do necessario.",
        )

    result = {
        "canary": CANARY,
        "canary_leaked": bool(leaked),
        "canary_in_local_storage": canary_in_local_storage,
        "requests": requests,
        "leaks": leaked,
        "failures": failures,
        "local_storage_keys": sorted(storage.keys()),
        "cookies": context_cookies,
        "external_domains": sorted(external_counts.keys()),
        "external_counts": dict(sorted(external_counts.items())),
        "summary": severity_counts(),
    }

    ISSUES.sort(key=lambda item: ({"P0": 0, "P1": 1, "P2": 2}[item["severity"]], item["area"], item["title"]))
    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text(generate_markdown(result) + "\n", encoding="utf-8")
    REPORT_JSON.write_text(
        json.dumps(
            {
                "date": DATA,
                "base_url": BASE_URL,
                "issues": ISSUES,
                "result": result,
                "reports": {"markdown": str(REPORT_MD), "json": str(REPORT_JSON)},
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    counts = severity_counts()
    print(f"Auditoria privacidade/rede: P0={counts['P0']} P1={counts['P1']} P2={counts['P2']}")
    print(f"Relatorio: {REPORT_MD}")
    print(f"JSON: {REPORT_JSON}")
    return 1 if counts["P0"] else 0


if __name__ == "__main__":
    sys.exit(main())
