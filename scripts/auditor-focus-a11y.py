#!/usr/bin/env python3
"""Audita foco por teclado do Escrevaral com Playwright e gera evidências."""

from __future__ import annotations

import argparse
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

VIEWPORTS = (
    ("360", 360, 800),
    ("390", 390, 844),
    ("768", 768, 1024),
    ("1024", 1024, 768),
    ("1440", 1440, 900),
)
THEMES = (("alvorada", None), ("vereda", "scriptorium"))
VIEWS = ("editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma")
FULL_MATRIX_WIDTHS = {"390", "1440"}
FOCUSABLE = (
    'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),'
    'select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],'
    '[tabindex]:not([tabindex="-1"])'
)
DISABLE_MOTION = """
*,*::before,*::after{
  animation-duration:.001ms!important;
  animation-delay:0ms!important;
  transition-duration:.001ms!important;
  scroll-behavior:auto!important
}
"""

ACTIVE_JS = r"""
() => {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement) || el === document.body || el === document.documentElement) return null;

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
        const siblings = [...parent.children].filter(item => item.tagName === current.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ");
  };

  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const width = Number.parseFloat(style.outlineWidth) || 0;
  const offset = Number.parseFloat(style.outlineOffset) || 0;
  const extent = Math.max(0, width + offset);
  const tolerance = 1.5;

  let background = "rgba(0, 0, 0, 0)";
  let backgroundNode = el.parentElement;
  while (backgroundNode) {
    const candidate = getComputedStyle(backgroundNode).backgroundColor;
    const values = candidate.match(/[\d.]+/g) || [];
    const alpha = values.length >= 4 ? Number(values[3]) : 1;
    if (candidate !== "transparent" && alpha > .02) {
      background = candidate;
      break;
    }
    backgroundNode = backgroundNode.parentElement;
  }

  const clipped = [];
  let ancestor = el.parentElement;
  while (ancestor && ancestor !== document.body) {
    const parentStyle = getComputedStyle(ancestor);
    const clipX = ["hidden", "clip"].includes(parentStyle.overflowX);
    const clipY = ["hidden", "clip"].includes(parentStyle.overflowY);
    if (clipX || clipY) {
      const parentRect = ancestor.getBoundingClientRect();
      const outsideX = rect.left - extent < parentRect.left - tolerance || rect.right + extent > parentRect.right + tolerance;
      const outsideY = rect.top - extent < parentRect.top - tolerance || rect.bottom + extent > parentRect.bottom + tolerance;
      if ((clipX && outsideX) || (clipY && outsideY)) {
        clipped.push({
          path: pathFor(ancestor),
          overflowX: parentStyle.overflowX,
          overflowY: parentStyle.overflowY
        });
      }
    }
    ancestor = ancestor.parentElement;
  }

  const label = (
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    el.getAttribute("placeholder") ||
    el.textContent ||
    el.getAttribute("name") ||
    ""
  ).replace(/\s+/g, " ").trim().slice(0, 100);

  const shadowColors = [...String(style.boxShadow).matchAll(/rgba?\([^)]*\)/g)].map(match => match[0]);

  return {
    path: pathFor(el),
    classes: [...el.classList].slice(0, 8),
    label,
    focusVisible: el.matches(":focus-visible"),
    outlineStyle: style.outlineStyle,
    outlineWidth: width,
    outlineColor: style.outlineColor,
    outlineOffset: offset,
    boxShadow: style.boxShadow,
    hasInsetFocus: el.matches(":focus-visible") && String(style.boxShadow).includes("inset"),
    shadowColors,
    background,
    rect: {left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom},
    viewport: {width: innerWidth, height: innerHeight},
    clipped
  };
}
"""


def rgb(value: str) -> tuple[float, float, float, float] | None:
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
    channels = []
    for channel in color[:3]:
        value = channel / 255
        channels.append(value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4)
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]


def ratio(first: str, second: str) -> float | None:
    a, b = rgb(first), rgb(second)
    if not a or not b or a[3] <= 0 or b[3] <= 0:
        return None
    one, two = luminance(a), luminance(b)
    return (max(one, two) + .05) / (min(one, two) + .05)


def issue(severity: str, viewport: str, theme: str, view: str, kind: str, element: str, detail: str) -> dict:
    return {
        "severity": severity,
        "viewport": viewport,
        "theme": theme,
        "view": view,
        "kind": kind,
        "element": element,
        "detail": detail,
    }


def visible_count(page, scope: str | None = None) -> int:
    selector = (
        ",".join(f"{scope} {part.strip()}" for part in FOCUSABLE.split(","))
        if scope
        else FOCUSABLE
    )
    return page.locator(selector).evaluate_all(
        """elements => elements.filter(el => {
          if (!(el instanceof HTMLElement)) return false;
          if (el.hidden || el.closest("[hidden]") || el.getAttribute("aria-hidden") === "true") return false;
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        }).length"""
    )


def switch_view(page, view: str) -> None:
    tab = page.locator(f'[data-view-target="{view}"]').first
    if tab.count() == 0:
        raise RuntimeError(f"Aba ausente: {view}")
    tab.evaluate("el => el.click()")
    page.wait_for_function(
        """view => {
          const shell = document.querySelector(".app-shell");
          const panel = document.querySelector(`[data-view-panel="${view}"]`);
          return (shell && shell.dataset.view === view) || (panel && panel.classList.contains("is-active"));
        }""",
        arg=view,
        timeout=8_000,
    )
    page.wait_for_timeout(60)


def indicator_ok(data: dict[str, Any]) -> bool:
    if not data.get("focusVisible"):
        return False
    outline = (
        data.get("outlineStyle") not in {"none", "hidden", ""}
        and float(data.get("outlineWidth") or 0) >= 1
    )
    shadow = str(data.get("boxShadow") or "").lower() not in {"", "none"}
    return bool(outline or shadow)


def contrast_ok(data: dict[str, Any]) -> tuple[bool, str]:
    colors = [data.get("outlineColor", ""), *data.get("shadowColors", [])]
    values = [ratio(color, data.get("background", "")) for color in colors]
    values = [value for value in values if value is not None]
    if not values:
        return True, "contraste não calculável"
    best = max(values)
    return best >= 3, f"melhor contraste: {best:.2f}:1"


def scroll_active_into_view(page) -> None:
    page.evaluate(
        """() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement) {
            active.scrollIntoView({block: "nearest", inline: "nearest"});
          }
        }"""
    )
    page.wait_for_timeout(16)


def inspect_active(page, viewport: str, theme: str, view: str, enforce_scope: str | None = None) -> tuple[dict | None, list[dict]]:
    scroll_active_into_view(page)
    data = page.evaluate(ACTIVE_JS)
    problems: list[dict] = []
    if not data:
        return None, problems

    descriptor = f'{data["path"]} — {data.get("label") or "(sem rótulo)"}'

    if enforce_scope:
        inside = page.evaluate(
            """selector => {
              const scope = document.querySelector(selector);
              return !!scope && scope.contains(document.activeElement);
            }""",
            enforce_scope,
        )
        if not inside:
            problems.append(issue("error", viewport, theme, view, "focus-escaped-dialog", descriptor, f"O foco saiu de {enforce_scope}."))

    if not indicator_ok(data):
        problems.append(issue("error", viewport, theme, view, "focus-invisible", descriptor, "Tab alcançou o controle sem indicador perceptível."))

    ok, detail = contrast_ok(data)
    if not ok:
        problems.append(issue("error", viewport, theme, view, "focus-low-contrast", descriptor, detail))

    if data.get("clipped") and not data.get("hasInsetFocus"):
        problems.append(issue("error", viewport, theme, view, "focus-clipped", descriptor, json.dumps(data["clipped"], ensure_ascii=False)))

    rect, screen = data["rect"], data["viewport"]
    if rect["right"] <= 0 or rect["bottom"] <= 0 or rect["left"] >= screen["width"] or rect["top"] >= screen["height"]:
        problems.append(issue("error", viewport, theme, view, "focus-offscreen", descriptor, "Controle focado inteiramente fora da área visível."))

    return data, problems


def keyboard_cycle(
    page,
    viewport: str,
    theme: str,
    view: str,
    *,
    scope: str | None = None,
    enforce_scope: str | None = None,
) -> tuple[int, int, bool, bool, list[dict]]:
    expected = visible_count(page, scope)
    page.evaluate(
        """() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          scrollTo(0, 0);
        }"""
    )

    found: dict[str, dict] = {}
    first = None
    closed = False
    writing = False
    problems: list[dict] = []

    for _ in range(min(max(expected + 24, 48), 280)):
        page.keyboard.press("Tab")
        data, active_problems = inspect_active(page, viewport, theme, view, enforce_scope)
        problems.extend(active_problems)
        if not data:
            continue
        path = data["path"]
        if first is None:
            first = path
        elif path == first and len(found) > 1:
            closed = True
            break
        if path in found:
            continue
        found[path] = data
        writing = writing or "writing-area" in data.get("classes", [])

    if expected and len(found) < max(1, math.floor(expected * .72)):
        problems.append(issue("warning", viewport, theme, view, "focus-coverage", "ordem de tabulação", f"{len(found)} visitados para {expected} candidatos."))

    return expected, len(found), closed, writing, problems


def screenshot(page, output: Path, viewport: str, theme: str, view: str, suffix: str = "focus") -> str:
    directory = output / "screenshots"
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{viewport}-{theme}-{view}-{suffix}.png"
    page.screenshot(path=str(directory / name), full_page=True)
    return f"screenshots/{name}"


def audit_onboarding(page, output: Path, viewport: str, theme: str) -> dict | None:
    overlay = page.locator("#terms-overlay").first
    if overlay.count() == 0 or not overlay.is_visible():
        return None

    expected, visited, closed, _, problems = keyboard_cycle(
        page,
        viewport,
        theme,
        "onboarding",
        scope="#terms-overlay",
        enforce_scope="#terms-overlay",
    )
    evidence = screenshot(page, output, viewport, theme, "onboarding")
    return {
        "viewport": viewport,
        "theme": theme,
        "view": "onboarding",
        "expected_focusables": expected,
        "visited_focusables": visited,
        "focus_cycle_closed": closed,
        "writing_area_reached": False,
        "screenshot": evidence,
        "issues": problems,
    }


def dismiss_onboarding(page) -> None:
    overlay = page.locator("#terms-overlay").first
    if overlay.count() == 0 or not overlay.is_visible():
        return
    button = page.locator('[data-action="accept-terms-blank"]').first
    if button.count() == 0:
        raise RuntimeError("Botão para concluir onboarding ausente")
    button.click()
    overlay.wait_for(state="hidden", timeout=8_000)
    page.wait_for_timeout(120)


def writing_area_check(page, viewport: str, theme: str) -> tuple[bool, list[dict]]:
    switch_view(page, "editor")
    title = page.locator(".title-input").first
    writing = page.locator(".writing-area").first
    if title.count() == 0 or writing.count() == 0:
        return False, [issue("error", viewport, theme, "editor", "editor-focus-missing", ".title-input / .writing-area", "Campos centrais ausentes.")]

    title.focus()
    page.keyboard.press("Tab")
    data, problems = inspect_active(page, viewport, theme, "editor")
    if not data or "writing-area" not in data.get("classes", []):
        return False, [*problems, issue("error", viewport, theme, "editor", "writing-area-tab-order", ".writing-area", "Tab a partir do título não chegou à área de escrita.")]
    return not any(item["severity"] == "error" for item in problems), problems


def module_keyboard_check(page, viewport: str, theme: str) -> list[dict]:
    problems: list[dict] = []
    for view in VIEWS:
        tab = page.locator(f'[data-view-target="{view}"]').first
        if tab.count() == 0:
            problems.append(issue("error", viewport, theme, view, "module-tab-missing", view, "Aba principal ausente."))
            continue
        if not tab.is_visible():
            continue
        tab.focus()
        page.keyboard.press("Enter")
        try:
            page.wait_for_function(
                """view => {
                  const panel = document.querySelector(`[data-view-panel="${view}"]`);
                  return panel && panel.classList.contains("is-active");
                }""",
                arg=view,
                timeout=3_000,
            )
        except PlaywrightTimeoutError:
            problems.append(issue("error", viewport, theme, view, "module-tab-keyboard", view, "Enter não ativou o módulo."))
    return problems


def prepare_page(page, base_url: str, theme_value: str | None, console_errors: list[str]) -> None:
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: console_errors.append(str(error)))
    page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector(".app-shell", timeout=20_000)
    page.add_style_tag(content=DISABLE_MOTION)
    page.evaluate(
        """theme => {
          if (theme) document.documentElement.dataset.theme = theme;
          else delete document.documentElement.dataset.theme;
        }""",
        theme_value,
    )
    page.wait_for_timeout(80)


def run_context(browser, base_url: str, output: Path, viewport: tuple, theme: tuple, views: tuple[str, ...]) -> list[dict]:
    viewport_name, width, height = viewport
    theme_name, theme_value = theme
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
        color_scheme="dark" if theme_value else "light",
    )
    page = context.new_page()
    console_errors: list[str] = []
    cases: list[dict] = []

    try:
        prepare_page(page, base_url, theme_value, console_errors)
        onboarding = audit_onboarding(page, output, viewport_name, theme_name)
        if onboarding:
            cases.append(onboarding)
        dismiss_onboarding(page)

        for view in views:
            switch_view(page, view)
            expected, visited, closed, writing_reached, problems = keyboard_cycle(
                page, viewport_name, theme_name, view
            )

            if view == "editor":
                direct_ok, direct_problems = writing_area_check(page, viewport_name, theme_name)
                writing_reached = writing_reached or direct_ok
                problems.extend(direct_problems)
                problems.extend(module_keyboard_check(page, viewport_name, theme_name))
                switch_view(page, "editor")
                title = page.locator(".title-input").first
                if title.count():
                    title.focus()
                    page.keyboard.press("Tab")
                    scroll_active_into_view(page)

            evidence = screenshot(page, output, viewport_name, theme_name, view)
            cases.append({
                "viewport": viewport_name,
                "theme": theme_name,
                "view": view,
                "expected_focusables": expected,
                "visited_focusables": visited,
                "focus_cycle_closed": closed,
                "writing_area_reached": writing_reached,
                "screenshot": evidence,
                "issues": problems,
            })

        if console_errors:
            target = cases[-1] if cases else None
            if target:
                target["issues"].extend(
                    issue("error", viewport_name, theme_name, target["view"], "console-error", "console", message[:500])
                    for message in console_errors
                )
    except Exception as error:
        cases.append({
            "viewport": viewport_name,
            "theme": theme_name,
            "view": "contexto",
            "expected_focusables": 0,
            "visited_focusables": 0,
            "focus_cycle_closed": False,
            "writing_area_reached": False,
            "screenshot": "",
            "issues": [issue("error", viewport_name, theme_name, "contexto", "audit-crash", "caso completo", repr(error))],
        })
    finally:
        context.close()

    return cases


def markdown(cases: list[dict], generated: str) -> str:
    all_issues = [item for case in cases for item in case["issues"]]
    errors = [item for item in all_issues if item["severity"] == "error"]
    warnings = [item for item in all_issues if item["severity"] == "warning"]
    lines = [
        "# Auditoria de foco por teclado",
        "",
        f"Gerada em: {generated}",
        "",
        f"- Casos: {len(cases)}",
        f"- Erros: {len(errors)}",
        f"- Avisos: {len(warnings)}",
        "",
        "## Matriz",
        "",
        "| Largura | Tema | Área | Candidatos | Visitados | Ciclo | Escrita |",
        "|---:|---|---|---:|---:|---|---|",
    ]
    for case in cases:
        lines.append(
            f"| {case['viewport']} | {case['theme']} | {case['view']} | "
            f"{case['expected_focusables']} | {case['visited_focusables']} | "
            f"{'sim' if case['focus_cycle_closed'] else 'não'} | "
            f"{'sim' if case['writing_area_reached'] else 'n/a' if case['view'] not in {'editor'} else 'não'} |"
        )
    lines += ["", "## Ocorrências", ""]
    if not all_issues:
        lines.append("Nenhuma falha detectada.")
    for item in all_issues:
        lines += [
            f"### {item['severity'].upper()} — {item['kind']}",
            "",
            f"- Contexto: {item['viewport']}px · {item['theme']} · {item['view']}",
            f"- Elemento: `{item['element']}`",
            f"- Detalhe: {item['detail']}",
            "",
        ]
    lines += ["## Evidências", "", "Capturas disponíveis em `screenshots/`.", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8799")
    parser.add_argument("--output-dir", default="reports/auditoria/focus-a11y-artifacts")
    args = parser.parse_args()

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    cases: list[dict] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for viewport in VIEWPORTS:
            for theme in THEMES:
                views = VIEWS if viewport[0] in FULL_MATRIX_WIDTHS else ("editor",)
                print(f"[focus] {viewport[0]}px · {theme[0]}", flush=True)
                cases.extend(run_context(browser, args.base_url, output, viewport, theme, views))
        browser.close()

    generated = datetime.now(timezone.utc).isoformat()
    payload = {"generated_at": generated, "base_url": args.base_url, "cases": cases}
    (output / "focus-a11y.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "focus-a11y.md").write_text(markdown(cases, generated), encoding="utf-8")

    errors = [item for case in cases for item in case["issues"] if item["severity"] == "error"]
    print(f"[focus] casos={len(cases)} erros={len(errors)}", flush=True)
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
