#!/usr/bin/env python3
"""
Auditoria de foco por teclado do Escrevaral.

Executa em Chromium via Playwright:
- 5 larguras de referência;
- temas Alvorada e Vereda;
- 6 áreas principais;
- navegação real com Tab / Shift+Tab;
- verificação de indicador perceptível;
- detecção de foco cortado por overflow;
- capturas antes/depois e relatórios JSON/Markdown.

Uso:
  python3 -m http.server 8799 &
  python3 scripts/auditor-focus-a11y.py
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PlaywrightTimeoutError


VIEWPORTS = (
    ("360", 360, 800),
    ("390", 390, 844),
    ("768", 768, 1024),
    ("1024", 1024, 768),
    ("1440", 1440, 900),
)

THEMES = (
    ("alvorada", None),
    ("vereda", "scriptorium"),
)

VIEWS = (
    "editor",
    "biblioteca",
    "autoria",
    "arquivo",
    "academia",
    "cronograma",
)

FULL_MATRIX_WIDTHS = {"390", "1440"}

FOCUSABLE_SELECTOR = """
a[href],
button:not([disabled]),
input:not([disabled]):not([type="hidden"]),
select:not([disabled]),
textarea:not([disabled]),
summary,
[contenteditable="true"],
[tabindex]:not([tabindex="-1"])
"""

DISABLE_MOTION_CSS = """
*, *::before, *::after {
  animation-duration: 0.001ms !important;
  animation-delay: 0ms !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
"""


@dataclass
class Issue:
    severity: str
    viewport: str
    theme: str
    view: str
    kind: str
    element: str
    detail: str


@dataclass
class AuditCase:
    viewport: str
    theme: str
    view: str
    expected_focusables: int
    visited_focusables: int
    focus_cycle_closed: bool
    writing_area_reached: bool
    screenshot: str
    issues: list[Issue]


def parse_rgb(value: str) -> tuple[float, float, float, float] | None:
    match = re.fullmatch(
        r"rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)",
        value.strip(),
    )
    if not match:
        return None
    r, g, b = (float(match.group(i)) for i in range(1, 4))
    a = float(match.group(4)) if match.group(4) is not None else 1.0
    return r, g, b, a


def relative_luminance(rgb: tuple[float, float, float, float]) -> float:
    channels = []
    for channel in rgb[:3]:
        value = channel / 255.0
        channels.append(value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast_ratio(a: str, b: str) -> float | None:
    rgb_a = parse_rgb(a)
    rgb_b = parse_rgb(b)
    if not rgb_a or not rgb_b or rgb_a[3] <= 0 or rgb_b[3] <= 0:
        return None
    lum_a = relative_luminance(rgb_a)
    lum_b = relative_luminance(rgb_b)
    lighter = max(lum_a, lum_b)
    darker = min(lum_a, lum_b)
    return (lighter + 0.05) / (darker + 0.05)


def safe_filename(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")


async def prepare_page(page: Page, base_url: str, theme_value: str | None) -> list[str]:
    console_errors: list[str] = []

    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    page.on("pageerror", lambda error: console_errors.append(str(error)))

    await page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    await page.wait_for_selector(".app-shell", timeout=20_000)
    await page.add_style_tag(content=DISABLE_MOTION_CSS)

    await page.evaluate(
        """(theme) => {
          if (theme) {
            document.documentElement.dataset.theme = theme;
          } else {
            delete document.documentElement.dataset.theme;
          }
          try {
            localStorage.setItem("vereda:dark-mode", theme === "scriptorium" ? "on" : "off");
          } catch (_) {}
        }""",
        theme_value,
    )

    await page.wait_for_timeout(120)
    return console_errors


async def switch_view(page: Page, view: str) -> None:
    selector = f'[data-view-target="{view}"]'
    tab = page.locator(selector).first
    if await tab.count() == 0:
        raise RuntimeError(f"Aba não encontrada: {view}")

    # evaluate(click) funciona também quando a navegação desktop está recolhida no mobile.
    await tab.evaluate("(element) => element.click()")
    await page.wait_for_function(
        """(viewName) => {
          const shell = document.querySelector(".app-shell");
          const panel = document.querySelector(`[data-view-panel="${viewName}"]`);
          return (shell && shell.dataset.view === viewName)
            || (panel && panel.classList.contains("is-active"));
        }""",
        view,
        timeout=8_000,
    )
    await page.wait_for_timeout(80)


async def visible_focusable_count(page: Page) -> int:
    return await page.locator(FOCUSABLE_SELECTOR).evaluate_all(
        """(elements) => elements.filter((element) => {
          if (!(element instanceof HTMLElement)) return false;
          if (element.hidden || element.closest("[hidden]")) return false;
          if (element.getAttribute("aria-hidden") === "true") return false;
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length"""
    )


ACTIVE_ELEMENT_SCRIPT = r"""
() => {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement) {
    return null;
  }

  const pathFor = (node) => {
    const parts = [];
    let current = node;
    while (current && current !== document.body && parts.length < 7) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part += `#${CSS.escape(current.id)}`;
        parts.unshift(part);
        break;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((item) => item.tagName === current.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ");
  };

  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const outlineWidth = Number.parseFloat(style.outlineWidth) || 0;
  const outlineOffset = Number.parseFloat(style.outlineOffset) || 0;
  const ringExtent = Math.max(0, outlineWidth + outlineOffset);

  let background = "rgba(0, 0, 0, 0)";
  let backgroundNode = element;
  while (backgroundNode) {
    const candidate = getComputedStyle(backgroundNode).backgroundColor;
    const values = candidate.match(/[\d.]+/g) || [];
    const alpha = values.length >= 4 ? Number(values[3]) : 1;
    if (candidate !== "transparent" && alpha > 0.02) {
      background = candidate;
      break;
    }
    backgroundNode = backgroundNode.parentElement;
  }

  const clipped = [];
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.body) {
    const ancestorStyle = getComputedStyle(ancestor);
    const overflowX = ancestorStyle.overflowX;
    const overflowY = ancestorStyle.overflowY;
    const clipsX = ["hidden", "clip"].includes(overflowX);
    const clipsY = ["hidden", "clip"].includes(overflowY);
    if (clipsX || clipsY) {
      const parentRect = ancestor.getBoundingClientRect();
      const outsideX = rect.left - ringExtent < parentRect.left || rect.right + ringExtent > parentRect.right;
      const outsideY = rect.top - ringExtent < parentRect.top || rect.bottom + ringExtent > parentRect.bottom;
      if ((clipsX && outsideX) || (clipsY && outsideY)) {
        clipped.push({
          path: pathFor(ancestor),
          overflowX,
          overflowY,
        });
      }
    }
    ancestor = ancestor.parentElement;
  }

  const label = (
    element.getAttribute("aria-label")
    || element.getAttribute("title")
    || element.getAttribute("placeholder")
    || element.textContent
    || element.getAttribute("name")
    || ""
  ).replace(/\s+/g, " ").trim().slice(0, 100);

  return {
    path: pathFor(element),
    tag: element.tagName.toLowerCase(),
    id: element.id || "",
    classes: [...element.classList].slice(0, 8),
    label,
    focusVisible: element.matches(":focus-visible"),
    outlineStyle: style.outlineStyle,
    outlineWidth,
    outlineColor: style.outlineColor,
    outlineOffset,
    boxShadow: style.boxShadow,
    focusContrastColor: style.getPropertyValue("--focus-ring-contrast").trim(),
    background,
    rect: {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    clipped,
  };
}
"""


def indicator_visible(data: dict[str, Any]) -> bool:
    outline_ok = (
        data.get("focusVisible")
        and data.get("outlineStyle") not in {"none", "hidden", ""}
        and float(data.get("outlineWidth") or 0) >= 1
    )
    shadow = str(data.get("boxShadow") or "").strip().lower()
    shadow_ok = shadow not in {"", "none"}
    return bool(outline_ok or shadow_ok)


def contrast_is_sufficient(data: dict[str, Any]) -> tuple[bool, str]:
    background = data.get("background", "")
    primary_ratio = contrast_ratio(data.get("outlineColor", ""), background)
    contrast_ring_ratio = contrast_ratio(data.get("focusContrastColor", ""), background)

    available = [ratio for ratio in (primary_ratio, contrast_ring_ratio) if ratio is not None]
    if not available:
        return True, "contraste não calculável"

    best = max(available)
    return best >= 3.0, f"melhor contraste do indicador: {best:.2f}:1"


async def keyboard_cycle(
    page: Page,
    viewport_name: str,
    theme_name: str,
    view: str,
) -> tuple[int, bool, bool, list[Issue]]:
    issues: list[Issue] = []
    expected = await visible_focusable_count(page)

    await page.evaluate(
        """() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();
          window.scrollTo(0, 0);
        }"""
    )

    visited: dict[str, dict[str, Any]] = {}
    first_path: str | None = None
    cycle_closed = False
    writing_area_reached = False
    max_steps = min(max(expected + 24, 48), 260)

    for _ in range(max_steps):
        await page.keyboard.press("Tab")
        await page.wait_for_timeout(12)
        data = await page.evaluate(ACTIVE_ELEMENT_SCRIPT)
        if not data:
            continue

        path = data["path"]
        if first_path is None:
            first_path = path
        elif path == first_path and len(visited) > 1:
            cycle_closed = True
            break

        if path in visited:
            continue

        visited[path] = data
        if "writing-area" in data.get("classes", []):
            writing_area_reached = True

        descriptor = f'{path} — {data.get("label") or "(sem rótulo)"}'

        if not indicator_visible(data):
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "focus-invisible",
                    descriptor,
                    "Elemento alcançado por Tab sem indicador de foco perceptível.",
                )
            )

        contrast_ok, contrast_detail = contrast_is_sufficient(data)
        if not contrast_ok:
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "focus-low-contrast",
                    descriptor,
                    contrast_detail,
                )
            )

        if data.get("clipped"):
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "focus-clipped",
                    descriptor,
                    "Indicador pode ser cortado por: " + json.dumps(data["clipped"], ensure_ascii=False),
                )
            )

        rect = data["rect"]
        viewport = data["viewport"]
        if (
            rect["right"] <= 0
            or rect["bottom"] <= 0
            or rect["left"] >= viewport["width"]
            or rect["top"] >= viewport["height"]
        ):
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "focus-offscreen",
                    descriptor,
                    "O navegador focou um controle inteiramente fora da área visível.",
                )
            )

    if expected and len(visited) < max(1, math.floor(expected * 0.72)):
        issues.append(
            Issue(
                "warning",
                viewport_name,
                theme_name,
                view,
                "focus-coverage",
                "ordem de tabulação",
                f"{len(visited)} elementos únicos visitados para {expected} candidatos visíveis.",
            )
        )

    return len(visited), cycle_closed, writing_area_reached, issues


async def verify_writing_area_focus(
    page: Page,
    viewport_name: str,
    theme_name: str,
) -> list[Issue]:
    issues: list[Issue] = []
    await switch_view(page, "editor")

    title = page.locator(".title-input").first
    writing = page.locator(".writing-area").first
    if await title.count() == 0 or await writing.count() == 0:
        return [
            Issue(
                "error",
                viewport_name,
                theme_name,
                "editor",
                "editor-focus-missing",
                ".title-input / .writing-area",
                "Campos centrais do editor não foram encontrados.",
            )
        ]

    await title.focus()
    await page.keyboard.press("Tab")
    await page.wait_for_timeout(80)
    data = await page.evaluate(ACTIVE_ELEMENT_SCRIPT)

    if not data or "writing-area" not in data.get("classes", []):
        issues.append(
            Issue(
                "error",
                viewport_name,
                theme_name,
                "editor",
                "writing-area-tab-order",
                ".writing-area",
                "A área de escrita não recebeu foco após Tab a partir do título.",
            )
        )
        return issues

    if not indicator_visible(data):
        issues.append(
            Issue(
                "error",
                viewport_name,
                theme_name,
                "editor",
                "writing-area-focus-invisible",
                ".writing-area",
                "A área principal de escrita não exibe foco perceptível.",
            )
        )

    contrast_ok, detail = contrast_is_sufficient(data)
    if not contrast_ok:
        issues.append(
            Issue(
                "error",
                viewport_name,
                theme_name,
                "editor",
                "writing-area-focus-low-contrast",
                ".writing-area",
                detail,
            )
        )

    if data.get("clipped"):
        issues.append(
            Issue(
                "error",
                viewport_name,
                theme_name,
                "editor",
                "writing-area-focus-clipped",
                ".writing-area",
                json.dumps(data["clipped"], ensure_ascii=False),
            )
        )

    return issues


async def verify_module_tabs_keyboard(
    page: Page,
    viewport_name: str,
    theme_name: str,
) -> list[Issue]:
    issues: list[Issue] = []
    for view in VIEWS:
        tab = page.locator(f'[data-view-target="{view}"]').first
        if await tab.count() == 0:
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "module-tab-missing",
                    f'[data-view-target="{view}"]',
                    "A navegação principal não contém este módulo.",
                )
            )
            continue

        # Em mobile a aba desktop pode estar escondida; o teste de ativação nativa
        # fica restrito aos controles realmente visíveis.
        if not await tab.is_visible():
            continue

        await tab.focus()
        await page.keyboard.press("Enter")
        try:
            await page.wait_for_function(
                """(viewName) => {
                  const panel = document.querySelector(`[data-view-panel="${viewName}"]`);
                  return panel && panel.classList.contains("is-active");
                }""",
                view,
                timeout=3_000,
            )
        except PlaywrightTimeoutError:
            issues.append(
                Issue(
                    "error",
                    viewport_name,
                    theme_name,
                    view,
                    "module-tab-keyboard",
                    f'[data-view-target="{view}"]',
                    "Enter não ativou o módulo.",
                )
            )
    return issues


async def screenshot_case(
    page: Page,
    output_dir: Path,
    viewport_name: str,
    theme_name: str,
    view: str,
    suffix: str = "",
) -> str:
    name = safe_filename("-".join(filter(None, (viewport_name, theme_name, view, suffix)))) + ".png"
    path = output_dir / "screenshots" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    await page.screenshot(path=str(path), full_page=True)
    return str(path.relative_to(output_dir))


async def run_case(
    browser: Browser,
    base_url: str,
    output_dir: Path,
    viewport_name: str,
    width: int,
    height: int,
    theme_name: str,
    theme_value: str | None,
    view: str,
) -> AuditCase:
    context = await browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if theme_value else "light",
    )
    page = await context.new_page()
    console_errors = await prepare_page(page, base_url, theme_value)
    await switch_view(page, view)

    visited, cycle_closed, writing_reached, issues = await keyboard_cycle(
        page, viewport_name, theme_name, view
    )

    if view == "editor":
        writing_issues = await verify_writing_area_focus(page, viewport_name, theme_name)
        issues.extend(writing_issues)
        if not any(issue.kind.startswith("writing-area") or issue.kind == "editor-focus-missing" for issue in writing_issues):
            writing_reached = True
        issues.extend(await verify_module_tabs_keyboard(page, viewport_name, theme_name))
        await switch_view(page, "editor")
        title = page.locator(".title-input").first
        if await title.count():
            await title.focus()
            await page.keyboard.press("Tab")
            await page.wait_for_timeout(80)

    for message in console_errors:
        issues.append(
            Issue(
                "error",
                viewport_name,
                theme_name,
                view,
                "console-error",
                "console",
                message[:500],
            )
        )

    screenshot = await screenshot_case(
        page,
        output_dir,
        viewport_name,
        theme_name,
        view,
        "focus",
    )

    expected = await visible_focusable_count(page)
    await context.close()
    return AuditCase(
        viewport=viewport_name,
        theme=theme_name,
        view=view,
        expected_focusables=expected,
        visited_focusables=visited,
        focus_cycle_closed=cycle_closed,
        writing_area_reached=writing_reached,
        screenshot=screenshot,
        issues=issues,
    )


def markdown_report(cases: list[AuditCase], generated_at: str) -> str:
    issues = [issue for case in cases for issue in case.issues]
    errors = [issue for issue in issues if issue.severity == "error"]
    warnings = [issue for issue in issues if issue.severity == "warning"]

    lines = [
        "# Auditoria de foco por teclado",
        "",
        f"Gerada em: {generated_at}",
        "",
        f"- Casos: {len(cases)}",
        f"- Erros: {len(errors)}",
        f"- Avisos: {len(warnings)}",
        "",
        "## Matriz",
        "",
        "| Largura | Tema | Área | Candidatos | Visitados | Ciclo fechado | Área de escrita |",
        "|---:|---|---|---:|---:|---|---|",
    ]

    for case in cases:
        lines.append(
            f"| {case.viewport} | {case.theme} | {case.view} | "
            f"{case.expected_focusables} | {case.visited_focusables} | "
            f"{'sim' if case.focus_cycle_closed else 'não'} | "
            f"{'sim' if case.writing_area_reached else 'n/a' if case.view != 'editor' else 'não'} |"
        )

    lines.extend(["", "## Ocorrências", ""])
    if not issues:
        lines.append("Nenhuma falha de foco detectada.")
    else:
        for issue in issues:
            lines.extend(
                [
                    f"### {issue.severity.upper()} — {issue.kind}",
                    "",
                    f"- Contexto: {issue.viewport}px · {issue.theme} · {issue.view}",
                    f"- Elemento: `{issue.element}`",
                    f"- Detalhe: {issue.detail}",
                    "",
                ]
            )

    lines.extend(
        [
            "## Evidências",
            "",
            "As capturas ficam em `screenshots/` no artefato do workflow.",
            "",
        ]
    )
    return "\n".join(lines)


async def main_async(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    cases: list[AuditCase] = []

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)

        for viewport_name, width, height in VIEWPORTS:
            for theme_name, theme_value in THEMES:
                views = VIEWS if viewport_name in FULL_MATRIX_WIDTHS else ("editor",)
                for view in views:
                    print(f"[focus] {viewport_name}px · {theme_name} · {view}", flush=True)
                    try:
                        case = await run_case(
                            browser,
                            args.base_url,
                            output_dir,
                            viewport_name,
                            width,
                            height,
                            theme_name,
                            theme_value,
                            view,
                        )
                    except Exception as exc:  # noqa: BLE001
                        issue = Issue(
                            "error",
                            viewport_name,
                            theme_name,
                            view,
                            "audit-crash",
                            "caso completo",
                            repr(exc),
                        )
                        case = AuditCase(
                            viewport=viewport_name,
                            theme=theme_name,
                            view=view,
                            expected_focusables=0,
                            visited_focusables=0,
                            focus_cycle_closed=False,
                            writing_area_reached=False,
                            screenshot="",
                            issues=[issue],
                        )
                    cases.append(case)

        await browser.close()

    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "generated_at": generated_at,
        "base_url": args.base_url,
        "cases": [
            {
                **{key: value for key, value in asdict(case).items() if key != "issues"},
                "issues": [asdict(issue) for issue in case.issues],
            }
            for case in cases
        ],
    }

    (output_dir / "focus-a11y.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (output_dir / "focus-a11y.md").write_text(
        markdown_report(cases, generated_at),
        encoding="utf-8",
    )

    errors = [
        issue
        for case in cases
        for issue in case.issues
        if issue.severity == "error"
    ]

    print(f"[focus] casos={len(cases)} erros={len(errors)}", flush=True)
    return 1 if errors else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument(
        "--output-dir",
        default="reports/auditoria/focus-a11y-artifacts",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    raise SystemExit(asyncio.run(main_async(args)))


if __name__ == "__main__":
    main()
