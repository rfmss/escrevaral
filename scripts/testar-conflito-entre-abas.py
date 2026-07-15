#!/usr/bin/env python3
"""Regressão: uma aba desatualizada não pode sobrescrever outra mais nova."""

import os
import json
import shutil

from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:8799"
STORAGE_KEY = "vereda.manuscripts.v1"

INITIAL_STATE = {
    "activeId": "nota-1",
    "manuscripts": [{
        "id": "nota-1",
        "title": "Nota de teste",
        "text": "Texto inicial",
        "content": "Texto inicial",
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-01-01T00:00:00.000Z",
    }],
    "meta": {"lastSavedAt": "2026-01-01T00:00:00.000Z"},
}


def main() -> None:
    with sync_playwright() as playwright:
        chromium = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
        if not chromium:
            raise RuntimeError("Chromium não encontrado; defina CHROMIUM_PATH para executar esta regressão.")
        browser = playwright.chromium.launch(
            executable_path=chromium,
            headless=True,
            args=["--no-sandbox"],
        )
        context = browser.new_context()
        context.add_init_script(
            """
            localStorage.setItem('escrevaral-termos-v1', '1');
            localStorage.setItem('vrda-first-visit', '1');
            localStorage.setItem('vereda.manuscripts.v1', JSON.stringify(%s));
            """ % json.dumps(INITIAL_STATE)
        )

        first = context.new_page()
        second = context.new_page()
        first.goto(BASE_URL, wait_until="networkidle")
        second.goto(BASE_URL, wait_until="networkidle")

        # As duas abas partiram da mesma revisão. A segunda salva primeiro.
        for page in (first, second):
            page.evaluate("""() => {
                state.meta.lastSavedAt = JSON.parse(localStorage.getItem('vereda.manuscripts.v1')).meta.lastSavedAt;
            }""")
        second_saved = second.evaluate("""() => {
            state.manuscripts[0].text = 'Texto salvo pela segunda aba';
            state.manuscripts[0].content = 'Texto salvo pela segunda aba';
            return persistState('Segunda aba');
        }""")
        first_saved = first.evaluate("""() => {
            state.manuscripts[0].text = 'Texto desatualizado da primeira aba';
            state.manuscripts[0].content = 'Texto desatualizado da primeira aba';
            return persistState('Primeira aba');
        }""")

        saved_text = first.evaluate("JSON.parse(localStorage.getItem('vereda.manuscripts.v1')).manuscripts[0].text")
        conflict_visible = first.locator("#tab-conflict-banner").is_visible()

        assert second_saved is True, "A aba que está atualizada precisa conseguir salvar"
        assert first_saved is False, "A aba desatualizada precisa interromper a própria gravação"
        assert saved_text == "Texto salvo pela segunda aba", "A aba desatualizada sobrescreveu uma revisão mais nova no localStorage"
        assert conflict_visible, "A aba desatualizada precisa receber aviso de conflito"

        context.close()
        browser.close()

    print("OK — conflito entre abas preserva a revisão mais nova")


if __name__ == "__main__":
    main()
