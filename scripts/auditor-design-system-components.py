#!/usr/bin/env python3
"""Audita o harness isolado de ActionButton e TextStatistic com Playwright."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

VIEWPORTS = (
    ("390", 390, 844),
    ("1440", 1440, 900),
)
THEMES = ("alvorada", "vereda")
EXPECTED_BUTTONS_PER_THEME = 7
EXPECTED_STATISTICS_PER_THEME = 4
EXPECTED_TABBABLE_BUTTONS = 12


def parse_color(value: str) -> tuple[float, float, float, float] | None:
    match = re.fullmatch(
        r"rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)",
        value.strip(),
    )
    if not match:
        return None
    return (
        float(match.group(1)),
        float(match.group(2)),
        float(match.group(3)),
        float(match.group(4)) if match.group(4) else 1.0,
    )


def luminance(color: tuple[float, float, float, float]) -> float:
    channels: list[float] = []
    for channel in color[:3]:
        value = channel / 255
        channels.append(
            value / 12.92
            if value <= 0.04045
            else ((value + 0.055) / 1.055) ** 2.4
        )
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(first: str, second: str) -> float | None:
    a = parse_color(first)
    b = parse_color(second)
    if not a or not b or a[3] <= 0 or b[3] <= 0:
        return None
    lighter, darker = sorted((luminance(a), luminance(b)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def problem(
    viewport: str,
    theme: str,
    kind: str,
    element: str,
    detail: str,
) -> dict[str, str]:
    return {
        "viewport": viewport,
        "theme": theme,
        "kind": kind,
        "element": element,
        "detail": detail,
    }


def require(
    condition: bool,
    problems: list[dict[str, str]],
    viewport: str,
    theme: str,
    kind: str,
    element: str,
    detail: str,
) -> None:
    if not condition:
        problems.append(problem(viewport, theme, kind, element, detail))


def resolved_background(page, selector: str) -> str:
    return page.locator(selector).evaluate(
        """element => {
          let current = element;
          while (current) {
            const color = getComputedStyle(current).backgroundColor;
            const values = color.match(/[\d.]+/g) || [];
            const alpha = values.length >= 4 ? Number(values[3]) : 1;
            if (color !== "transparent" && alpha > 0.02) return color;
            current = current.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        }"""
    )


def computed(page, selector: str) -> dict[str, Any]:
    return page.locator(selector).evaluate(
        """element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            minHeight: Number.parseFloat(style.minHeight) || 0,
            width: rect.width,
            height: rect.height,
            opacity: Number.parseFloat(style.opacity) || 0,
            cursor: style.cursor,
            outlineStyle: style.outlineStyle,
            outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
            outlineColor: style.outlineColor,
            outlineOffset: Number.parseFloat(style.outlineOffset) || 0,
            fontSize: Number.parseFloat(style.fontSize) || 0
          };
        }"""
    )


def audit_theme(page, viewport: str, theme: str) -> tuple[dict[str, Any], list[dict[str, str]]]:
    scope = f'[data-theme-case="{theme}"]'
    problems: list[dict[str, str]] = []
    buttons = page.locator(f'{scope} [data-component="action-button"]')
    statistics = page.locator(f'{scope} [data-component="text-statistic"]')

    require(
        buttons.count() == EXPECTED_BUTTONS_PER_THEME,
        problems,
        viewport,
        theme,
        "button-count",
        scope,
        f"Esperados {EXPECTED_BUTTONS_PER_THEME} ActionButton; encontrados {buttons.count()}.",
    )
    require(
        statistics.count() == EXPECTED_STATISTICS_PER_THEME,
        problems,
        viewport,
        theme,
        "statistic-count",
        scope,
        f"Esperados {EXPECTED_STATISTICS_PER_THEME} TextStatistic; encontrados {statistics.count()}.",
    )

    theme_tokens = page.locator(scope).evaluate(
        """element => {
          const style = getComputedStyle(element);
          return {
            paper: style.getPropertyValue("--paper").trim(),
            ink: style.getPropertyValue("--ink").trim(),
            primary: style.getPropertyValue("--primary").trim(),
            onPrimary: style.getPropertyValue("--on-primary").trim(),
            focus: style.getPropertyValue("--focus-ring-color").trim(),
            buttonHeight: style.getPropertyValue("--action-button-height").trim(),
            statisticLabel: style.getPropertyValue("--text-statistic-label").trim()
          };
        }"""
    )
    for token, value in theme_tokens.items():
        require(
            bool(value),
            problems,
            viewport,
            theme,
            "missing-token",
            scope,
            f"Custom property {token} sem valor computado.",
        )

    for variant in ("primary", "secondary", "ghost"):
        selector = f'{scope} [data-variant="{variant}"]:not([data-size]):not([data-state]):not([data-icon-only])'
        style = computed(page, selector)
        background = resolved_background(page, selector)
        ratio = contrast(style["color"], background)
        require(
            ratio is not None and ratio >= 4.5,
            problems,
            viewport,
            theme,
            "button-text-contrast",
            selector,
            f"Contraste {ratio:.2f}:1; mínimo 4.5:1." if ratio is not None else "Contraste não calculável.",
        )
        require(
            style["minHeight"] >= 42,
            problems,
            viewport,
            theme,
            "button-height",
            selector,
            f"Altura mínima computada {style['minHeight']:.1f}px; esperado ao menos 42px.",
        )

    compact_selector = f'{scope} [data-component="action-button"][data-size="compact"]'
    compact = computed(page, compact_selector)
    require(
        compact["minHeight"] >= 36,
        problems,
        viewport,
        theme,
        "compact-height",
        compact_selector,
        f"Altura mínima computada {compact['minHeight']:.1f}px; esperado ao menos 36px.",
    )

    icon_selector = f'{scope} [data-icon-only="true"]'
    icon = computed(page, icon_selector)
    icon_label = page.locator(icon_selector).get_attribute("aria-label") or ""
    require(
        abs(icon["width"] - icon["height"]) <= 1.5,
        problems,
        viewport,
        theme,
        "icon-button-shape",
        icon_selector,
        f"Controle não quadrado: {icon['width']:.1f}×{icon['height']:.1f}px.",
    )
    require(
        bool(icon_label.strip()),
        problems,
        viewport,
        theme,
        "icon-button-name",
        icon_selector,
        "Botão somente com ícone não possui aria-label.",
    )

    for state in ("disabled-native", "disabled-aria"):
        selector = f'{scope} [data-state="{state}"]'
        style = computed(page, selector)
        require(
            style["opacity"] <= 0.5,
            problems,
            viewport,
            theme,
            "disabled-opacity",
            selector,
            f"Opacidade computada {style['opacity']:.2f}; esperado no máximo 0.50.",
        )
        require(
            style["cursor"] == "not-allowed",
            problems,
            viewport,
            theme,
            "disabled-cursor",
            selector,
            f"Cursor computado {style['cursor']!r}; esperado 'not-allowed'.",
        )

    statistic_parts = (
        ("label", ".text-statistic__label"),
        ("value", ".text-statistic__value"),
        ("detail", ".text-statistic__detail"),
    )
    for role, part in statistic_parts:
        selector = f'{scope} {part}'
        locator = page.locator(selector)
        for index in range(locator.count()):
            item_selector = f'{selector}:nth-of-type({index + 1})'
            element = locator.nth(index)
            style = element.evaluate(
                """element => {
                  const style = getComputedStyle(element);
                  return {color: style.color, fontSize: Number.parseFloat(style.fontSize) || 0};
                }"""
            )
            background = element.evaluate(
                """element => {
                  let current = element;
                  while (current) {
                    const color = getComputedStyle(current).backgroundColor;
                    const values = color.match(/[\d.]+/g) || [];
                    const alpha = values.length >= 4 ? Number(values[3]) : 1;
                    if (color !== "transparent" && alpha > 0.02) return color;
                    current = current.parentElement;
                  }
                  return getComputedStyle(document.body).backgroundColor;
                }"""
            )
            ratio = contrast(style["color"], background)
            require(
                ratio is not None and ratio >= 4.5,
                problems,
                viewport,
                theme,
                "statistic-text-contrast",
                f"{item_selector} [{role}]",
                f"Contraste {ratio:.2f}:1; mínimo 4.5:1." if ratio is not None else "Contraste não calculável.",
            )

    return theme_tokens, problems


def audit_keyboard(page, viewport: str) -> list[dict[str, str]]:
    problems: list[dict[str, str]] = []
    page.evaluate(
        """() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          window.scrollTo(0, 0);
        }"""
    )
    visited: list[dict[str, Any]] = []
    seen: set[str] = set()

    for _ in range(30):
        page.keyboard.press("Tab")
        data = page.evaluate(
            """() => {
              const element = document.activeElement;
              if (!(element instanceof HTMLElement) || !element.matches('[data-component="action-button"]')) return null;
              const style = getComputedStyle(element);
              const scope = element.closest('[data-theme-case]');
              let current = element.parentElement;
              let background = getComputedStyle(document.body).backgroundColor;
              while (current) {
                const candidate = getComputedStyle(current).backgroundColor;
                const values = candidate.match(/[\d.]+/g) || [];
                const alpha = values.length >= 4 ? Number(values[3]) : 1;
                if (candidate !== "transparent" && alpha > .02) {
                  background = candidate;
                  break;
                }
                current = current.parentElement;
              }
              return {
                key: `${scope?.dataset.themeCase || "unknown"}:${element.dataset.variant || "none"}:${element.dataset.state || "active"}:${element.dataset.size || "default"}:${element.dataset.iconOnly || "text"}`,
                theme: scope?.dataset.themeCase || "unknown",
                state: element.dataset.state || "active",
                focusVisible: element.matches(':focus-visible'),
                outlineStyle: style.outlineStyle,
                outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
                outlineColor: style.outlineColor,
                background
              };
            }"""
        )
        if not data:
            continue
        if data["key"] in seen:
            if len(seen) >= EXPECTED_TABBABLE_BUTTONS:
                break
            continue
        seen.add(data["key"])
        visited.append(data)

    require(
        len(visited) == EXPECTED_TABBABLE_BUTTONS,
        problems,
        viewport,
        "ambos",
        "tab-order-count",
        "ActionButton",
        f"Esperados {EXPECTED_TABBABLE_BUTTONS} botões alcançáveis; visitados {len(visited)}.",
    )
    require(
        not any(item["state"] == "disabled-native" for item in visited),
        problems,
        viewport,
        "ambos",
        "native-disabled-focus",
        '[data-state="disabled-native"]',
        "Botão nativamente disabled entrou na ordem de tabulação.",
    )
    require(
        sum(item["state"] == "disabled-aria" for item in visited) == 2,
        problems,
        viewport,
        "ambos",
        "aria-disabled-focus",
        '[data-state="disabled-aria"]',
        "Os dois controles aria-disabled devem permanecer identificáveis por teclado.",
    )

    for item in visited:
        ratio = contrast(item["outlineColor"], item["background"])
        require(
            item["focusVisible"]
            and item["outlineStyle"] not in {"none", "hidden", ""}
            and item["outlineWidth"] >= 2,
            problems,
            viewport,
            item["theme"],
            "focus-indicator",
            item["key"],
            "Controle alcançado por Tab sem outline visível de ao menos 2px.",
        )
        require(
            ratio is not None and ratio >= 3,
            problems,
            viewport,
            item["theme"],
            "focus-contrast",
            item["key"],
            f"Contraste do foco {ratio:.2f}:1; mínimo 3:1." if ratio is not None else "Contraste do foco não calculável.",
        )

    return problems


def markdown(cases: list[dict[str, Any]], generated: str) -> str:
    problems = [item for case in cases for item in case["problems"]]
    lines = [
        "# Auditoria dos componentes do Design System",
        "",
        f"Gerada em: {generated}",
        "",
        f"- Viewports: {len(cases)}",
        f"- Falhas: {len(problems)}",
        "",
        "## Matriz",
        "",
        "| Largura | Overflow | Alvorada | Vereda | Teclado |",
        "|---:|---|---|---|---|",
    ]
    for case in cases:
        by_theme = {
            theme: not any(item["theme"] in {theme, "ambos"} for item in case["problems"])
            for theme in THEMES
        }
        keyboard_ok = not any(
            item["kind"] in {
                "tab-order-count",
                "native-disabled-focus",
                "aria-disabled-focus",
                "focus-indicator",
                "focus-contrast",
            }
            for item in case["problems"]
        )
        lines.append(
            f"| {case['viewport']} | {'ok' if case['overflow_ok'] else 'falhou'} | "
            f"{'ok' if by_theme['alvorada'] else 'falhou'} | "
            f"{'ok' if by_theme['vereda'] else 'falhou'} | "
            f"{'ok' if keyboard_ok else 'falhou'} |"
        )

    lines += ["", "## Ocorrências", ""]
    if not problems:
        lines.append("Nenhuma falha detectada.")
    for item in problems:
        lines += [
            f"### {item['kind']}",
            "",
            f"- Contexto: {item['viewport']}px · {item['theme']}",
            f"- Elemento: `{item['element']}`",
            f"- Detalhe: {item['detail']}",
            "",
        ]
    lines += ["## Evidências", "", "Capturas disponíveis em `screenshots/`.", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--base-url",
        default=(
            "http://127.0.0.1:8799/reports/auditoria/"
            "design-system-components-harness/index.html"
        ),
    )
    parser.add_argument(
        "--output-dir",
        default="reports/auditoria/design-system-components-artifacts",
    )
    args = parser.parse_args()

    output = Path(args.output_dir)
    screenshots = output / "screenshots"
    screenshots.mkdir(parents=True, exist_ok=True)
    cases: list[dict[str, Any]] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for viewport, width, height in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion="reduce",
            )
            page = context.new_page()
            console_errors: list[str] = []
            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                else None,
            )
            page.on("pageerror", lambda error: console_errors.append(str(error)))
            problems: list[dict[str, str]] = []

            try:
                page.goto(args.base_url, wait_until="networkidle", timeout=30_000)
                page.wait_for_selector(
                    '[data-theme-case="vereda"] [data-component="action-button"]',
                    timeout=10_000,
                )
                page.add_style_tag(
                    content=(
                        "*,*::before,*::after{animation:none!important;"
                        "transition:none!important;scroll-behavior:auto!important}"
                    )
                )

                overflow = page.evaluate(
                    """() => ({
                      scrollWidth: document.documentElement.scrollWidth,
                      clientWidth: document.documentElement.clientWidth
                    })"""
                )
                overflow_ok = overflow["scrollWidth"] <= overflow["clientWidth"] + 1
                require(
                    overflow_ok,
                    problems,
                    viewport,
                    "ambos",
                    "horizontal-overflow",
                    "documentElement",
                    f"scrollWidth={overflow['scrollWidth']} e clientWidth={overflow['clientWidth']}.",
                )

                tokens: dict[str, dict[str, str]] = {}
                for theme in THEMES:
                    theme_tokens, theme_problems = audit_theme(page, viewport, theme)
                    tokens[theme] = theme_tokens
                    problems.extend(theme_problems)

                require(
                    tokens["alvorada"].get("paper") != tokens["vereda"].get("paper")
                    and tokens["alvorada"].get("ink") != tokens["vereda"].get("ink")
                    and tokens["alvorada"].get("primary") != tokens["vereda"].get("primary"),
                    problems,
                    viewport,
                    "ambos",
                    "theme-differentiation",
                    "[data-theme-case]",
                    "Alvorada e Vereda não produziram conjuntos distintos de paper, ink e primary.",
                )
                problems.extend(audit_keyboard(page, viewport))

                for message in console_errors:
                    problems.append(
                        problem(
                            viewport,
                            "ambos",
                            "console-error",
                            "console",
                            message[:500],
                        )
                    )

                screenshot_name = f"{viewport}-componentes.png"
                page.screenshot(
                    path=str(screenshots / screenshot_name),
                    full_page=True,
                )
                cases.append(
                    {
                        "viewport": viewport,
                        "overflow_ok": overflow_ok,
                        "tokens": tokens,
                        "screenshot": f"screenshots/{screenshot_name}",
                        "problems": problems,
                    }
                )
            except Exception as error:
                cases.append(
                    {
                        "viewport": viewport,
                        "overflow_ok": False,
                        "tokens": {},
                        "screenshot": "",
                        "problems": [
                            problem(
                                viewport,
                                "ambos",
                                "audit-crash",
                                "caso completo",
                                repr(error),
                            )
                        ],
                    }
                )
            finally:
                context.close()
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    payload = {
        "generated_at": generated,
        "base_url": args.base_url,
        "cases": cases,
    }
    (output / "design-system-components.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output / "design-system-components.md").write_text(
        markdown(cases, generated),
        encoding="utf-8",
    )

    failures = [item for case in cases for item in case["problems"]]
    print(
        f"[design-system-components] casos={len(cases)} falhas={len(failures)}",
        flush=True,
    )
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
