#!/usr/bin/env python3
"""Testa atualização do service worker, limpeza de cache antigo e recarga offline."""

from __future__ import annotations

import json
import os
import re
import sys
import time
from datetime import date
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get("ESCREVARAL_AUDIT_URL", "http://127.0.0.1:8799").rstrip("/")
REPORT_DIR = ROOT / "reports" / "auditoria" / "pwa-upgrade-artifacts"
REPORT_JSON = REPORT_DIR / "report.json"
REPORT_MD = REPORT_DIR / "report.md"
FAILURES: list[str] = []
CHECKS: list[str] = []


def require(condition: bool, success: str, failure: str) -> None:
    if condition:
        CHECKS.append(success)
    else:
        FAILURES.append(failure)


def current_cache_name() -> str:
    text = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    match = re.search(r'CACHE_NAME\s*=\s*"([^"]+)"', text)
    if not match:
        raise RuntimeError("CACHE_NAME não encontrado em service-worker.js")
    return match.group(1)


def wait_for_cache_state(page, current: str, stale: list[str], timeout_ms: int = 20_000) -> list[str]:
    deadline = time.monotonic() + timeout_ms / 1000
    last: list[str] = []
    while time.monotonic() < deadline:
        last = page.evaluate("async () => await caches.keys()")
        if current in last and all(name not in last for name in stale):
            return last
        page.wait_for_timeout(250)
    return last


def main() -> int:
    current = current_cache_name()
    stale = ["vereda-offline-v1", "vereda-offline-v956"]
    unrelated = "escrevaral-audit-unrelated-cache"
    observed: dict[str, object] = {"base_url": BASE_URL, "current_cache": current, "stale_caches": stale}

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(service_workers="allow")
            page = context.new_page()

            # Usa uma página textual sem scripts da aplicação para preparar caches antes do registro.
            response = page.goto(f"{BASE_URL}/robots.txt", wait_until="domcontentloaded")
            require(response is not None and response.ok, "origem local acessível", "não foi possível abrir a origem local")

            before = page.evaluate(
                """
                async ({ stale, unrelated }) => {
                  for (const name of stale) {
                    const cache = await caches.open(name);
                    await cache.put('/marcador-' + name, new Response('antigo'));
                  }
                  const other = await caches.open(unrelated);
                  await other.put('/marcador-externo', new Response('preservar'));
                  return await caches.keys();
                }
                """,
                {"stale": stale, "unrelated": unrelated},
            )
            observed["cache_keys_before"] = before
            require(all(name in before for name in stale), "caches antigos preparados", "não foi possível preparar caches antigos")

            page.evaluate(
                """
                async () => {
                  const registration = await navigator.serviceWorker.register('/service-worker.js?upgrade-audit=' + Date.now());
                  await navigator.serviceWorker.ready;
                  if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                """
            )

            after = wait_for_cache_state(page, current, stale)
            observed["cache_keys_after_activation"] = after
            require(current in after, "cache atual criado", f"cache atual ausente após ativação: {after}")
            require(all(name not in after for name in stale), "caches antigos removidos", f"cache antigo permaneceu: {after}")
            require(unrelated in after, "cache não pertencente ao produto preservado", "ativação removeu cache não relacionado")

            page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
            try:
                page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=10_000)
            except PlaywrightTimeoutError:
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)", timeout=10_000)

            title_online = page.title()
            require("Escrevaral" in title_online, "aplicação abriu online sob controle do service worker", f"título inesperado: {title_online!r}")

            context.set_offline(True)
            page.reload(wait_until="domcontentloaded", timeout=15_000)
            title_offline = page.title()
            body_text = page.locator("body").inner_text(timeout=10_000)
            observed["title_online"] = title_online
            observed["title_offline"] = title_offline
            require("Escrevaral" in title_offline, "aplicação recarregou offline", f"recarga offline falhou: {title_offline!r}")
            require("Escrever" in body_text and "Acervo" in body_text, "navegação essencial disponível offline", "interface essencial ausente na recarga offline")

            context.set_offline(False)
            browser.close()
    except Exception as exc:  # noqa: BLE001 - auditor registra qualquer falha observada.
        FAILURES.append(f"exceção durante o teste: {type(exc).__name__}: {exc}")

    status = "aprovado" if not FAILURES else "reprovado"
    report = {
        "date": date.today().isoformat(),
        "status": status,
        "checks": CHECKS,
        "failures": FAILURES,
        "observed": observed,
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = ["# Auditoria de atualização da PWA", "", f"Status: {status}", "", "## Verificações", ""]
    lines.extend(f"- {item}" for item in CHECKS)
    if FAILURES:
        lines.extend(["", "## Falhas", ""])
        lines.extend(f"- {item}" for item in FAILURES)
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Atualização PWA: {status}; falhas={len(FAILURES)}")
    for failure in FAILURES:
        print(f"FALHA: {failure}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
