#!/usr/bin/env python3
"""Valida contraste do título e manuscrito sobre a folha clara do Scriptorium."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

INIT_STORAGE = """
try {
  localStorage.setItem('escrevaral-termos-v1', 'auditoria');
  localStorage.setItem('vrda-first-visit', '1');
  localStorage.setItem('vereda.manuscripts.v1', JSON.stringify({
    manuscripts: [{id:'contrast-ms',title:'Contraste',kind:'manuscript',status:'Em escrita',text:'Palavras sobre o papel.',content:'Palavras sobre o papel.',createdAt:0,updatedAt:0}],
    activeId:'contrast-ms',ui:{}
  }));
} catch (_) {}
"""


def parse_rgb(value: str) -> tuple[float, float, float]:
    numbers = [float(item) for item in re.findall(r"[\d.]+", value)[:3]]
    if len(numbers) != 3:
        raise ValueError(f"cor não reconhecida: {value}")
    return tuple(numbers)


def luminance(rgb: tuple[float, float, float]) -> float:
    channels = []
    for channel in rgb:
        value = channel / 255
        channels.append(value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4)
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]


def ratio(first: str, second: str) -> float:
    one, two = luminance(parse_rgb(first)), luminance(parse_rgb(second))
    return (max(one, two) + .05) / (min(one, two) + .05)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/product-clarity-desktop-artifacts")
    args = parser.parse_args()

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="dark")
        context.add_init_script(INIT_STORAGE)
        page = context.new_page()
        page.goto(args.base_url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector(".app-shell", timeout=20_000)
        page.evaluate("() => document.documentElement.dataset.theme = 'scriptorium'")
        page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)
        page.evaluate("() => setView('editor', {updateRoute:false})")
        page.wait_for_selector(".editor-paper", state="visible", timeout=10_000)

        colors = page.evaluate(
            """() => {
              const paper = document.querySelector('.editor-paper');
              const title = document.querySelector('.title-input');
              const writing = document.querySelector('.writing-area');
              return {
                paper: getComputedStyle(paper).backgroundColor,
                title: getComputedStyle(title).color,
                writing: getComputedStyle(writing).color
              };
            }"""
        )
        context.close()
        browser.close()

    result = {
        "colors": colors,
        "title_ratio": ratio(colors["title"], colors["paper"]),
        "writing_ratio": ratio(colors["writing"], colors["paper"]),
    }
    (output / "scriptorium-paper-contrast.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        f"[scriptorium-paper] titulo={result['title_ratio']:.2f}:1 "
        f"escrita={result['writing_ratio']:.2f}:1 cores={colors}",
        flush=True,
    )
    if result["title_ratio"] < 4.5 or result["writing_ratio"] < 4.5:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
