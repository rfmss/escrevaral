#!/usr/bin/env python3
"""Auditoria visual e WCAG 2.2 AA reproduzível do Escrevaral local.

Executa matriz de viewports, temas e reflow equivalente a zoom, registra
screenshots e falha em overflow, controles sem nome, foco invisível, contraste
de texto ou alvos de toque pequenos sem espaçamento suficiente.

Uso:
  python3 -m http.server 8799 &
  python3 scripts/auditor-visual-wcag.py --browser all
"""

import argparse
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "http://127.0.0.1:8799"
VIEWPORTS = [
    (1366, 768), (1920, 1080), (768, 1024),
    (320, 568), (360, 800), (390, 844), (430, 932),
    (844, 390), (932, 430),
]
THEMES = {"claro": "off", "escuro": "on"}
ZOOMS = [1, 2, 4]
MODULES = ["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"]


AUDIT_JS = r"""() => {
  const visible = el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity !== 0 && r.width > 0 && r.height > 0;
  };
  const parse = value => {
    const m = value.match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    const rgb = m.slice(0, 3).map(Number);
    const alpha = m[3] === undefined ? 1 : Number(m[3]);
    return {rgb, alpha};
  };
  const composite = (fg, bg) => fg.rgb.map((v, i) => v * fg.alpha + bg.rgb[i] * (1 - fg.alpha));
  const background = el => {
    let node = el;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.alpha > 0) return c;
      node = node.parentElement;
    }
    return {rgb:[255,255,255], alpha:1};
  };
  const lum = rgb => {
    const c = rgb.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return .2126*c[0] + .7152*c[1] + .0722*c[2];
  };
  const ratio = (a,b) => { const x=lum(a), y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const selector = el => el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.classList.length ? '.'+[...el.classList].slice(0,2).join('.') : ''}`;

  const controls = [...document.querySelectorAll('button,a[href],input,select,textarea,[contenteditable="true"],[role="button"],[tabindex]')]
    .filter(el => visible(el) && !el.disabled && el.tabIndex >= 0);
  const unnamed = controls.filter(el => {
    if (el.matches('input[type="hidden"]')) return false;
    const labelled = el.getAttribute('aria-labelledby');
    return !(el.getAttribute('aria-label') || el.innerText?.trim() || el.labels?.length || (labelled && document.getElementById(labelled)?.textContent.trim()) || el.title);
  }).map(selector);

  const contrast = [];
  [...document.querySelectorAll('body *')].filter(visible).forEach(el => {
    const text = [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!text) return;
    const style = getComputedStyle(el), fg = parse(style.color), bg = background(el);
    if (!fg) return;
    const value = ratio(composite(fg,bg), bg.rgb);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700);
    if (value + .01 < (large ? 3 : 4.5)) contrast.push({selector:selector(el), ratio:+value.toFixed(2), text:el.textContent.trim().slice(0,60)});
  });

  const smallTargets = controls.filter(el => {
    const r = el.getBoundingClientRect();
    if (r.width >= 24 && r.height >= 24) return false;
    return controls.some(other => {
      if (other === el) return false;
      const o = other.getBoundingClientRect();
      return Math.max(0, Math.min(r.right,o.right)-Math.max(r.left,o.left)) > 0 &&
             Math.max(0, Math.min(r.bottom+24,o.bottom)-Math.max(r.top-24,o.top)) > 0;
    });
  }).map(el => { const r=el.getBoundingClientRect(); return {selector:selector(el), width:+r.width.toFixed(1), height:+r.height.toFixed(1)}; });

  return {
    overflow: document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth,
    scrollWidth: document.scrollingElement.scrollWidth,
    clientWidth: document.scrollingElement.clientWidth,
    unnamed: [...new Set(unnamed)],
    contrast: contrast.slice(0, 100),
    smallTargets: smallTargets.slice(0, 100),
    controls: controls.length,
  };
}"""


async def audit_focus(page):
    results = {"missing_indicator": [], "terms_escape": False}
    await page.evaluate("localStorage.removeItem('escrevaral-termos-v1'); localStorage.removeItem('vrda-first-visit')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(400)
    dialog = page.locator("#terms-overlay [role=dialog]")
    if await dialog.is_visible():
        for _ in range(12):
            await page.keyboard.press("Tab")
            inside = await page.evaluate("document.querySelector('#terms-overlay').contains(document.activeElement)")
            if not inside:
                results["terms_escape"] = True
                break
    await page.evaluate("localStorage.setItem('escrevaral-termos-v1','audit')")
    await page.reload(wait_until="domcontentloaded")
    for _ in range(30):
        await page.keyboard.press("Tab")
        focus = await page.evaluate("""() => { const e=document.activeElement,s=getComputedStyle(e); return {sel:e.id ? '#'+e.id : e.tagName.toLowerCase()+'.'+[...e.classList].join('.'), outline:s.outlineStyle, width:parseFloat(s.outlineWidth), shadow:s.boxShadow}; }""")
        if focus["outline"] in ("none", "hidden") and focus["width"] == 0 and focus["shadow"] == "none":
            results["missing_indicator"].append(focus["sel"])
    return results


async def run_browser(pw, browser_name, output):
    browser_type = getattr(pw, browser_name)
    browser = await browser_type.launch()
    findings, captures = [], []
    for theme_name, theme_value in THEMES.items():
        for width, height in VIEWPORTS:
            for zoom in ZOOMS:
                effective_width = max(320, width // zoom)
                effective_height = max(256, height // zoom)
                context = await browser.new_context(viewport={"width": effective_width, "height": effective_height}, color_scheme="dark" if theme_name == "escuro" else "light")
                page = await context.new_page()
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                await page.add_init_script(f"localStorage.setItem('escrevaral-termos-v1','audit'); localStorage.setItem('vrda-first-visit','1'); localStorage.setItem('vereda:dark-mode','{theme_value}')")
                await page.goto(BASE_URL, wait_until="domcontentloaded")
                await page.wait_for_timeout(350)
                result = await page.evaluate(AUDIT_JS)
                slug = f"{browser_name}-{theme_name}-{width}x{height}-zoom{zoom}00"
                screenshot = output / "screenshots" / f"{slug}.png"
                screenshot.parent.mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=str(screenshot), full_page=False)
                captures.append(str(screenshot.relative_to(ROOT)))
                problems = []
                if result["overflow"]: problems.append(f"overflow {result['scrollWidth']}>{result['clientWidth']}")
                if result["unnamed"]: problems.append(f"{len(result['unnamed'])} controles sem nome")
                if result["contrast"]: problems.append(f"{len(result['contrast'])} contrastes abaixo do limiar")
                if result["smallTargets"]: problems.append(f"{len(result['smallTargets'])} alvos abaixo de 24px")
                if errors: problems.append(f"{len(errors)} erros JS")
                if problems:
                    findings.append({"scenario": slug, "problems": problems, "details": result, "errors": errors[:10], "screenshot": str(screenshot.relative_to(ROOT))})
                await context.close()

    # Mapa das seis áreas do produto em desktop e celular, nos dois temas.
    for theme_name, theme_value in THEMES.items():
        for width, height in ((1366, 768), (390, 844)):
            context = await browser.new_context(viewport={"width": width, "height": height}, color_scheme="dark" if theme_name == "escuro" else "light")
            page = await context.new_page()
            await page.add_init_script(f"localStorage.setItem('escrevaral-termos-v1','audit'); localStorage.setItem('vrda-first-visit','1'); localStorage.setItem('vereda:dark-mode','{theme_value}')")
            await page.goto(BASE_URL, wait_until="domcontentloaded")
            for module in MODULES:
                await page.evaluate("module => document.querySelector(`[data-view-target='${module}']`)?.click()", module)
                await page.wait_for_timeout(180)
                result = await page.evaluate(AUDIT_JS)
                slug = f"{browser_name}-{theme_name}-{width}x{height}-modulo-{module}"
                screenshot = output / "screenshots" / f"{slug}.png"
                await page.screenshot(path=str(screenshot), full_page=False)
                captures.append(str(screenshot.relative_to(ROOT)))
                problems = []
                if result["overflow"]: problems.append(f"overflow {result['scrollWidth']}>{result['clientWidth']}")
                if result["unnamed"]: problems.append(f"{len(result['unnamed'])} controles sem nome")
                if result["contrast"]: problems.append(f"{len(result['contrast'])} contrastes abaixo do limiar")
                if result["smallTargets"]: problems.append(f"{len(result['smallTargets'])} alvos abaixo de 24px")
                if problems:
                    findings.append({"scenario": slug, "problems": problems, "details": result, "screenshot": str(screenshot.relative_to(ROOT))})
            await context.close()

    context = await browser.new_context(viewport={"width": 1366, "height": 768})
    page = await context.new_page()
    await page.goto(BASE_URL, wait_until="domcontentloaded")
    focus = await audit_focus(page)
    if focus["terms_escape"] or focus["missing_indicator"]:
        findings.append({"scenario": f"{browser_name}-teclado", "problems": ["foco escapou do diálogo"] if focus["terms_escape"] else [], "details": focus})
    await context.close()
    await browser.close()
    return findings, captures


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=("chromium", "firefox", "all"), default="all")
    parser.add_argument("--output", default="reports/auditoria/visual-wcag")
    args = parser.parse_args()
    output = ROOT / args.output
    output.mkdir(parents=True, exist_ok=True)
    browsers = ["chromium", "firefox"] if args.browser == "all" else [args.browser]
    all_findings, captures = [], []
    async with async_playwright() as pw:
        for name in browsers:
            findings, shots = await run_browser(pw, name, output)
            all_findings.extend(findings); captures.extend(shots)
    timestamp = datetime.now(timezone.utc).isoformat()
    payload = {"timestamp": timestamp, "url": BASE_URL, "viewports": VIEWPORTS, "zooms": ZOOMS, "themes": list(THEMES), "modules": MODULES, "browsers": browsers, "findings": all_findings, "screenshots": captures}
    (output / "resultado.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    lines = ["# Auditoria visual e WCAG 2.2 AA", "", f"Data: {timestamp}", f"Cenários: {len(captures)}", f"Achados: {len(all_findings)}", ""]
    for finding in all_findings:
        lines += [f"## {finding['scenario']}", *[f"- {problem}" for problem in finding.get("problems", [])], f"- Evidência: `{finding.get('screenshot','sem screenshot')}`", ""]
    if not all_findings: lines.append("Nenhuma violação automatizável encontrada na matriz.")
    (output / "relatorio.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:12]))
    raise SystemExit(1 if all_findings else 0)


if __name__ == "__main__":
    asyncio.run(main())
