#!/usr/bin/env python3
"""Audita a nomenclatura pública sem renomear identificadores técnicos legados."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.sync_api import Route, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:8799/"
REPORT_DIR = ROOT / "reports" / "auditoria" / "nomenclatura-publica-artifacts"
REPORT_PATH = REPORT_DIR / "report.json"


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def audit_static(failures: list[str], checks: list[str]) -> None:
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    app = (ROOT / "app.js").read_text(encoding="utf-8")
    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))

    description_marker = '<meta name="description" content="'
    description = index.split(description_marker, 1)[1].split('">', 1)[0]
    require(len(description) <= 160, f"Meta description tem {len(description)} caracteres.", failures)
    checks.append(f"Meta description: {len(description)} caracteres")

    require("Mudar para Vereda" not in index, "index.html ainda exibe ‘Mudar para Vereda’.", failures)
    require("Mudar para Vereda" not in app, "app.js ainda produz ‘Mudar para Vereda’.", failures)
    require('biblioteca: "Palavras"' in app, "Título analítico de Palavras não foi atualizado.", failures)
    require('arquivo: "Acervo"' in app, "Título analítico de Acervo não foi atualizado.", failures)
    require('cronograma: "Plano"' in app, "Título analítico de Plano não foi atualizado.", failures)
    checks.append("Rótulos analíticos: Palavras, Acervo e Plano")

    shortcuts = {(item["name"], item["short_name"]) for item in manifest.get("shortcuts", [])}
    require(("Escrever", "Escrever") in shortcuts, "Atalho PWA ‘Escrever’ ausente.", failures)
    require(("Ateliê", "Ateliê") in shortcuts, "Atalho PWA ‘Ateliê’ ausente.", failures)
    checks.append("Atalhos PWA: Escrever e Ateliê")

    guide_files = [
        "vereda-titulo-do-livro.html",
        "vereda-primeiras-linhas.html",
        "vereda-revisao-manuscrito.html",
        "vereda-bloqueio-criativo.html",
    ]
    for filename in guide_files:
        text = (ROOT / filename).read_text(encoding="utf-8")
        require(">Bancada</a>" not in text, f"{filename} ainda exibe Bancada no breadcrumb.", failures)
        require(
            'href="./index.html#academia">Ateliê</a>' in text,
            f"{filename} não aponta Ateliê para #academia.",
            failures,
        )
    checks.append("Breadcrumbs das quatro trilhas: Ateliê → #academia")

    title_page = (ROOT / "vereda-titulo-do-livro.html").read_text(encoding="utf-8")
    twitter_marker = '<meta name="twitter:title" content="'
    twitter_title = title_page.split(twitter_marker, 1)[1].split('">', 1)[0]
    require(len(twitter_title) <= 70, f"Twitter title tem {len(twitter_title)} caracteres.", failures)
    checks.append(f"Twitter title: {len(twitter_title)} caracteres")


def allow_local_only(route: Route) -> None:
    parsed = urlparse(route.request.url)
    if parsed.scheme in {"data", "blob"} or parsed.hostname in {"127.0.0.1", "localhost"}:
        route.continue_()
    else:
        route.abort()


def audit_browser(failures: list[str], checks: list[str]) -> None:
    console_errors: list[str] = []
    routes = ["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"]

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            context = browser.new_context(
                viewport={"width": 1366, "height": 900},
                service_workers="block",
            )
            page = context.new_page()
            page.set_default_timeout(10_000)
            page.route("**/*", allow_local_only)
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("pageerror", lambda exc: console_errors.append(str(exc)))

            page.goto(urljoin(BASE_URL, "#editor"), wait_until="domcontentloaded")
            page.wait_for_selector(".app-shell")
            require(page.locator("html").get_attribute("lang") == "pt-BR", 'Documento principal sem lang="pt-BR".', failures)

            theme_button = page.locator('[data-action="toggle-dark-mode"]')
            require(
                theme_button.get_attribute("aria-label") == "Mudar para Scriptorium",
                "Tema claro não oferece ‘Mudar para Scriptorium’.",
                failures,
            )
            theme_button.click()
            require(
                theme_button.get_attribute("aria-label") == "Mudar para Alvorada",
                "Tema escuro não oferece ‘Mudar para Alvorada’.",
                failures,
            )
            theme_button.click()
            checks.append("Alternância de tema: Alvorada ↔ Scriptorium")

            for route in routes:
                page.goto(urljoin(BASE_URL, f"#{route}"), wait_until="domcontentloaded")
                page.wait_for_selector(".view.is-active")
                visible_h1 = page.locator("h1:visible").count()
                require(visible_h1 <= 1, f"Rota #{route} expõe {visible_h1} títulos H1 visíveis.", failures)
            checks.append("No máximo um H1 visível em cada rota principal")

            page.goto(urljoin(BASE_URL, "#academia"), wait_until="domcontentloaded")
            page.wait_for_selector('[data-view-target="academia"].is-active')
            active_atelie = page.locator('[data-view-target="academia"].is-active', has_text="Ateliê")
            require(active_atelie.count() >= 1, "A rota #academia não ativa o destino público Ateliê.", failures)
            checks.append("Rota técnica #academia abre o Ateliê")

            for filename in [
                "vereda-titulo-do-livro.html",
                "vereda-primeiras-linhas.html",
                "vereda-revisao-manuscrito.html",
                "vereda-bloqueio-criativo.html",
            ]:
                page.goto(urljoin(BASE_URL, filename), wait_until="domcontentloaded")
                breadcrumb = page.locator('a[href="./index.html#academia"]', has_text="Ateliê")
                require(breadcrumb.count() == 1, f"{filename} não renderiza o breadcrumb Ateliê.", failures)

            require(not console_errors, f"Erros de console: {console_errors}", failures)
            checks.append("Sem erros de console durante a auditoria")
        finally:
            browser.close()


def write_report(failures: list[str], checks: list[str]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "status": "reprovado" if failures else "aprovado",
        "checks": checks,
        "failures": failures,
        "legacy_preserved": [
            "arquivos e URLs vereda-*.html",
            "chave localStorage vereda:dark-mode",
            "data-vrda-* e APIs globais legadas",
            "vereda-editorial.css",
            "prefixo histórico vereda-offline-",
        ],
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    failures: list[str] = []
    checks: list[str] = []

    try:
        audit_static(failures, checks)
    except Exception as error:  # noqa: BLE001
        failures.append(f"Auditoria estática interrompida: {type(error).__name__}: {error}")

    try:
        audit_browser(failures, checks)
    except Exception as error:  # noqa: BLE001
        failures.append(f"Auditoria no navegador interrompida: {type(error).__name__}: {error}")

    write_report(failures, checks)

    if failures:
        for failure in failures:
            print(f"ERRO: {failure}")
        return 1

    for check in checks:
        print(f"OK: {check}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
