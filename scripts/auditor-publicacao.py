#!/usr/bin/env python3
"""
Auditor de publicacao/offline do Escrevaral em producao.

Valida sitemap, recursos internos, manifest e service worker. O foco e pegar
falhas silenciosas de deploy: 404 em asset cacheado, link interno quebrado,
manifest inconsistente ou dependencia externa que enfraquece o offline-first.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://escrevaral.com"
DATA = date.today().isoformat()
REPORT_MD = ROOT / "reports" / "auditoria" / f"publicacao-offline-{DATA}.md"
REPORT_JSON = ROOT / "reports" / "auditoria" / f"publicacao-offline-{DATA}.json"

TIMEOUT = 18
ISSUES: list[dict[str, Any]] = []
FETCH_CACHE: dict[str, dict[str, Any]] = {}

IGNORE_SCHEMES = {"mailto", "tel", "javascript", "data", "blob"}
EXPECTED_EXTERNAL = {
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "static.cloudflareinsights.com",
    "escrevaral.goatcounter.com",
    "x.com",
    "bolha.us",
    "bsky.app",
}


class RefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str, str]] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if "id" in data:
            self.ids.add(data["id"])
        for attr in ("href", "src"):
            if attr in data and data[attr].strip():
                self.refs.append((tag, attr, data[attr].strip()))
        if tag == "meta" and data.get("property") in {"og:image", "twitter:image"} and data.get("content"):
            self.refs.append((tag, "content", data["content"].strip()))


def add_issue(severity: str, area: str, title: str, evidence: str, recommendation: str = "") -> None:
    ISSUES.append({
        "severity": severity,
        "area": area,
        "title": title,
        "evidence": evidence,
        "recommendation": recommendation,
    })


def normalize_url(url: str, base: str = BASE_URL + "/") -> str | None:
    url = url.strip()
    if not url or url.startswith("#"):
        return None
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme and parsed.scheme in IGNORE_SCHEMES:
        return None
    return urllib.parse.urljoin(base, url)


def without_fragment(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse(parsed._replace(fragment=""))


def is_internal(url: str) -> bool:
    return urllib.parse.urlparse(url).netloc == "escrevaral.com"


def fetch_url(url: str) -> dict[str, Any]:
    url = without_fragment(url)
    if url in FETCH_CACHE:
        return FETCH_CACHE[url]
    req = urllib.request.Request(url, headers={"User-Agent": "EscrevaralCodexAudit/1.0"})
    result: dict[str, Any] = {"url": url, "ok": False, "status": None, "content_type": "", "body": b"", "error": ""}
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            result["status"] = resp.status
            result["content_type"] = resp.headers.get("content-type", "")
            result["body"] = resp.read()
            result["ok"] = 200 <= resp.status < 400
    except urllib.error.HTTPError as exc:
        result["status"] = exc.code
        result["content_type"] = exc.headers.get("content-type", "") if exc.headers else ""
        result["body"] = exc.read() if hasattr(exc, "read") else b""
        result["error"] = str(exc)
    except Exception as exc:  # noqa: BLE001 - auditor records network failures.
        result["error"] = str(exc)
    FETCH_CACHE[url] = result
    return result


def text_of(result: dict[str, Any]) -> str:
    try:
        return result.get("body", b"").decode("utf-8", errors="replace")
    except Exception:
        return ""


def read_sitemap() -> list[str]:
    result = fetch_url(BASE_URL + "/sitemap.xml")
    if not result["ok"]:
        add_issue("P0", "Sitemap", "sitemap.xml indisponivel", f"{result['status']} {result['error']}", "Corrigir antes de validar indexacao.")
        return [BASE_URL + "/"]
    try:
        root = ET.fromstring(result["body"])
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [loc.text.strip() for loc in root.findall(".//sm:loc", ns) if loc.text]
    except Exception as exc:  # noqa: BLE001
        add_issue("P0", "Sitemap", "sitemap.xml invalido", str(exc), "Validar XML.")
        return [BASE_URL + "/"]
    if BASE_URL + "/" not in urls:
        add_issue("P1", "Sitemap", "pagina inicial ausente do sitemap", ", ".join(urls[:8]), "Adicionar raiz ao sitemap.")
    return urls


def parse_html(url: str, html: str) -> RefParser:
    parser = RefParser()
    parser.feed(html)
    for tag, attr, raw in parser.refs:
        absolute = normalize_url(raw, url)
        if not absolute:
            continue
        parsed = urllib.parse.urlparse(absolute)
        if parsed.scheme in {"http", "https"} and parsed.netloc and parsed.netloc != "escrevaral.com":
            if parsed.netloc not in EXPECTED_EXTERNAL:
                add_issue("P2", "Links externos", "dependencia externa nao catalogada", f"{url} -> {raw}", "Confirmar se e intencional.")
            continue
        if is_internal(absolute):
            if urllib.parse.urlparse(absolute).path.startswith("/cdn-cgi/l/email-protection"):
                add_issue(
                    "P2",
                    "Links",
                    "email protegido pela Cloudflare no HTML bruto",
                    f"{url}: <{tag} {attr}='{raw}'>",
                    "Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.",
                )
                continue
            status = fetch_url(absolute)
            if not status["ok"]:
                sev = "P0" if tag in {"script", "link", "img", "iframe"} else "P1"
                add_issue(sev, "Recurso interno", "referencia interna quebrada", f"{url}: <{tag} {attr}='{raw}'> -> {status['status']} {status['error']}", "Corrigir caminho ou remover referencia.")
        if urllib.parse.urlparse(raw).fragment and not urllib.parse.urlparse(raw).path:
            frag = urllib.parse.urlparse(raw).fragment
            if frag and frag not in parser.ids:
                add_issue("P2", "Ancora", "ancora local sem alvo", f"{url}: #{frag}", "Criar id correspondente ou corrigir link.")
    return parser


def extract_sw_assets(sw_text: str) -> tuple[str | None, str | None, list[str]]:
    version_match = re.search(r'ASSET_VERSION\s*=\s*"([^"]+)"', sw_text)
    cache_match = re.search(r'CACHE_NAME\s*=\s*"([^"]+)"', sw_text)
    version = version_match.group(1) if version_match else None
    cache_name = cache_match.group(1) if cache_match else None
    block_match = re.search(r"CORE_ASSETS\s*=\s*\[(.*?)\];", sw_text, re.S)
    assets: list[str] = []
    if block_match:
        for raw in re.findall(r"`([^`]+)`|\"([^\"]+)\"|'([^']+)'", block_match.group(1)):
            item = next(part for part in raw if part)
            if version:
                item = item.replace("${ASSET_VERSION}", version)
            assets.append(item)
    return cache_name, version, assets


def audit_service_worker(index_text: str, sitemap_urls: list[str]) -> None:
    result = fetch_url(BASE_URL + "/service-worker.js")
    if not result["ok"]:
        add_issue("P0", "Service worker", "service-worker.js indisponivel", f"{result['status']} {result['error']}", "Restaurar arquivo de SW.")
        return
    sw_text = text_of(result)
    cache_name, version, assets = extract_sw_assets(sw_text)
    if not cache_name or not version:
        add_issue("P1", "Service worker", "versao/cache nao detectados", "CACHE_NAME ou ASSET_VERSION ausente", "Manter versao explicita para invalidacao previsivel.")
    if version and f"v={version}" not in index_text:
        add_issue("P1", "Versionamento", "ASSET_VERSION do service worker nao aparece no index", version, "Alinhar querystring do index e cache offline.")
    if "install" not in sw_text or "fetch" not in sw_text or "cache.addAll" not in sw_text:
        add_issue("P0", "Service worker", "offline basico incompleto", "install/fetch/cache.addAll nao detectado", "Revisar registro offline.")

    broken_assets = []
    for asset in assets:
        absolute = urllib.parse.urljoin(BASE_URL + "/", asset)
        status = fetch_url(absolute)
        if not status["ok"]:
            broken_assets.append(f"{asset} -> {status['status']} {status['error']}")
    if broken_assets:
        add_issue(
            "P0",
            "Service worker",
            "CORE_ASSETS tem recurso quebrado",
            "; ".join(broken_assets[:20]),
            "Qualquer 404 em cache.addAll pode impedir instalacao offline.",
        )

    sw_paths = {urllib.parse.urlparse(urllib.parse.urljoin(BASE_URL + "/", asset)).path for asset in assets}
    missing_sitemap_pages = []
    for url in sitemap_urls:
        path = urllib.parse.urlparse(url).path or "/"
        if path in {"/", ""}:
            continue
        if path not in sw_paths:
            missing_sitemap_pages.append(path)
    if missing_sitemap_pages:
        add_issue(
            "P2",
            "Offline",
            "paginas do sitemap fora do cache inicial",
            ", ".join(missing_sitemap_pages),
            "Decidir se trilhas editoriais tambem devem abrir offline apos instalacao.",
        )


def audit_manifest() -> None:
    result = fetch_url(BASE_URL + "/manifest.webmanifest")
    if not result["ok"]:
        add_issue("P0", "Manifest", "manifest.webmanifest indisponivel", f"{result['status']} {result['error']}", "Restaurar manifest PWA.")
        return
    try:
        data = json.loads(text_of(result))
    except json.JSONDecodeError as exc:
        add_issue("P0", "Manifest", "manifest invalido", str(exc), "Corrigir JSON.")
        return
    required = ["name", "short_name", "start_url", "display", "icons"]
    missing = [key for key in required if not data.get(key)]
    if missing:
        add_issue("P1", "Manifest", "campos PWA obrigatorios ausentes", ", ".join(missing), "Completar manifest.")
    for icon in data.get("icons", []):
        src = icon.get("src")
        if not src:
            add_issue("P1", "Manifest", "icone sem src", json.dumps(icon, ensure_ascii=False), "Corrigir entrada de icone.")
            continue
        absolute = urllib.parse.urljoin(BASE_URL + "/", src)
        status = fetch_url(absolute)
        if not status["ok"]:
            add_issue("P0", "Manifest", "icone do manifest quebrado", f"{src} -> {status['status']} {status['error']}", "Corrigir src ou publicar arquivo.")
    start = data.get("start_url")
    if start:
        status = fetch_url(start)
        if not status["ok"]:
            add_issue("P0", "Manifest", "start_url quebrado", f"{start} -> {status['status']} {status['error']}", "Corrigir start_url.")


def audit_robots(sitemap_urls: list[str]) -> None:
    result = fetch_url(BASE_URL + "/robots.txt")
    if not result["ok"]:
        add_issue("P1", "Robots", "robots.txt indisponivel", f"{result['status']} {result['error']}", "Publicar robots.")
        return
    text = text_of(result)
    if "Sitemap: https://escrevaral.com/sitemap.xml" not in text:
        add_issue("P1", "Robots", "robots nao aponta para sitemap canonico", text[:200], "Adicionar linha Sitemap.")
    for url in sitemap_urls:
        path = urllib.parse.urlparse(url).path
        if path and path != "/" and f"Allow: {path}" not in text:
            add_issue("P2", "Robots", "pagina do sitemap sem Allow explicito", path, "Adicionar Allow ou remover exigencia se nao for politica do projeto.")


def audit_external_dependencies(index_parser: RefParser) -> None:
    externals = defaultdict(int)
    for _tag, _attr, raw in index_parser.refs:
        absolute = normalize_url(raw, BASE_URL + "/")
        if not absolute:
            continue
        parsed = urllib.parse.urlparse(absolute)
        if parsed.scheme in {"http", "https"} and parsed.netloc and parsed.netloc != "escrevaral.com":
            externals[parsed.netloc] += 1
    if "fonts.googleapis.com" in externals:
        add_issue(
            "P2",
            "Offline",
            "index depende de Google Fonts em primeira carga",
            "fonts.googleapis.com / fonts.gstatic.com",
            "Aceitavel com fallback, mas nao e 100% autocontido antes da primeira visita online.",
        )


def severity_counts() -> dict[str, int]:
    return {severity: sum(1 for issue in ISSUES if issue["severity"] == severity) for severity in ("P0", "P1", "P2")}


def generate_markdown(summary: dict[str, Any]) -> str:
    counts = severity_counts()
    semaforo = "VERMELHO" if counts["P0"] else "AMARELO" if counts["P1"] else "VERDE"
    lines = [
        f"# Auditoria Publicacao/Offline - {DATA}",
        "",
        f"**URL:** {BASE_URL}  |  **Semaforo:** {semaforo}  |  **P0:** {counts['P0']} **P1:** {counts['P1']} **P2:** {counts['P2']}",
        "",
        f"Sitemap: {summary['sitemap_count']} URLs.  ",
        f"Recursos testados: {summary['fetched_count']}.",
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
        lines += ["Nenhum problema de publicacao/offline detectado.", ""]
    lines += [
        "## Comando",
        "",
        "```bash",
        "python3 scripts/auditor-publicacao.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    sitemap_urls = read_sitemap()
    html_parsers: dict[str, RefParser] = {}
    for url in sitemap_urls:
        result = fetch_url(url)
        if not result["ok"]:
            add_issue("P0", "Sitemap", "URL do sitemap indisponivel", f"{url} -> {result['status']} {result['error']}", "Corrigir deploy ou sitemap.")
            continue
        ctype = result.get("content_type", "")
        if "text/html" not in ctype:
            add_issue("P1", "Sitemap", "URL do sitemap nao retorna HTML", f"{url} -> {ctype}", "Confirmar se e intencional.")
            continue
        html_parsers[url] = parse_html(url, text_of(result))

    index_result = fetch_url(BASE_URL + "/")
    index_text = text_of(index_result) if index_result["ok"] else ""
    audit_service_worker(index_text, sitemap_urls)
    audit_manifest()
    audit_robots(sitemap_urls)
    if BASE_URL + "/" in html_parsers:
        audit_external_dependencies(html_parsers[BASE_URL + "/"])

    ISSUES.sort(key=lambda item: ({"P0": 0, "P1": 1, "P2": 2}[item["severity"]], item["area"], item["title"]))
    summary = {"sitemap_count": len(sitemap_urls), "fetched_count": len(FETCH_CACHE), "counts": severity_counts()}
    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text(generate_markdown(summary) + "\n", encoding="utf-8")
    REPORT_JSON.write_text(
        json.dumps(
            {
                "date": DATA,
                "base_url": BASE_URL,
                "summary": summary,
                "issues": ISSUES,
                "fetched": {url: {k: v for k, v in data.items() if k != "body"} for url, data in FETCH_CACHE.items()},
                "reports": {"markdown": str(REPORT_MD), "json": str(REPORT_JSON)},
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    counts = severity_counts()
    print(f"Auditoria publicacao/offline: P0={counts['P0']} P1={counts['P1']} P2={counts['P2']}")
    print(f"Relatorio: {REPORT_MD}")
    print(f"JSON: {REPORT_JSON}")
    return 1 if counts["P0"] else 0


if __name__ == "__main__":
    sys.exit(main())
