#!/usr/bin/env python3
"""Regressão: a oficina continua utilizável após recarregar sem rede."""

import os
import shutil

from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:8799"


def main() -> None:
    chromium = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
    if not chromium:
        raise RuntimeError("Chromium não encontrado; defina CHROMIUM_PATH para executar esta regressão.")

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=chromium,
            headless=True,
            args=["--no-sandbox"],
        )
        context = browser.new_context()
        context.add_init_script("""
            localStorage.setItem('escrevaral-termos-v1', '1');
            localStorage.setItem('vrda-first-visit', '1');
        """)
        page = context.new_page()

        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=20_000)
        page.reload(wait_until="networkidle")
        page.wait_for_selector(".writing-area")

        context.set_offline(True)
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector(".writing-area")
        assert page.locator(".app-shell").is_visible(), "A interface não foi recuperada do cache offline"

        context.close()
        browser.close()

    print("OK — recarregamento offline preserva a oficina utilizável")


if __name__ == "__main__":
    main()
