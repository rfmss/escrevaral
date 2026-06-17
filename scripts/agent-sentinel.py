#!/usr/bin/env python3
"""
Visual sentinel for Claude/Codex/Devin chat inputs inside the IDE.

It watches configured screen regions for the long orange limit banner that
appears just above the chat input, waits until the estimated reset time, then
sends exactly the configured resume prompt to the matching input.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / ".agents" / "sentinel" / "config.json"
DEFAULT_STATE = ROOT / ".agents" / "sentinel" / "state.json"
DEFAULT_RUNTIME = Path(os.environ.get("AGENT_SENTINEL_RUNTIME", "/tmp/agent-sentinel"))


@dataclass
class OrangeHit:
    pixels: int
    ratio: float
    bbox: tuple[int, int, int, int] | None
    text: str = ""

    @property
    def has_wide_banner(self) -> bool:
        if not self.bbox:
            return False
        x0, y0, x1, y1 = self.bbox
        return (x1 - x0) >= 110 and (y1 - y0) >= 8


def now_local() -> dt.datetime:
    return dt.datetime.now().astimezone()


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    tmp.replace(path)


def run_command(args: list[str], *, input_text: str | None = None, timeout: int = 20) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        input=input_text,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )


def notify(title: str, message: str) -> None:
    if not shutil.which("notify-send"):
        return
    subprocess.Popen(["notify-send", title, message], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def capture_screen(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if shutil.which("scrot"):
        result = run_command(["scrot", "-z", "-o", str(path)], timeout=10)
        if result.returncode == 0 and path.exists():
            return
    if shutil.which("import"):
        result = run_command(["import", "-window", "root", str(path)], timeout=10)
        if result.returncode == 0 and path.exists():
            return
    raise RuntimeError("No screenshot command available. Install scrot or ImageMagick import.")


def crop_region(image: Image.Image, region: dict[str, Any], out_path: Path) -> Image.Image:
    x = int(region["x"])
    y = int(region["y"])
    w = int(region["w"])
    h = int(region["h"])
    cropped = image.crop((x, y, x + w, y + h))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(out_path)
    return cropped


def detect_orange_banner(image: Image.Image) -> OrangeHit:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    marked: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            # Long warning banners in Claude/Codex use a saturated amber/orange.
            # This intentionally ignores muted gray text and the input border.
            if r >= 165 and 70 <= g <= 185 and b <= 95 and r > g + 22 and g > b + 18:
                marked.append((x, y))

    if not marked:
        return OrangeHit(0, 0.0, None)

    xs = [p[0] for p in marked]
    ys = [p[1] for p in marked]
    bbox = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    return OrangeHit(len(marked), len(marked) / max(1, width * height), bbox)


def tesseract_languages() -> list[str]:
    if not shutil.which("tesseract"):
        return []
    result = run_command(["tesseract", "--list-langs"], timeout=10)
    if result.returncode != 0:
        return ["eng"]
    langs = [line.strip() for line in result.stdout.splitlines() if line.strip() and "List of available" not in line]
    selected = [lang for lang in ("por", "eng") if lang in langs]
    return selected or ["eng"]


def ocr_image(path: Path) -> str:
    if not shutil.which("tesseract"):
        return ""
    langs = tesseract_languages()
    lang_arg = "+".join(langs) if langs else "eng"
    result = run_command(["tesseract", str(path), "stdout", "-l", lang_arg, "--psm", "6"], timeout=20)
    if result.returncode != 0:
        return ""
    return " ".join(result.stdout.split())


def contains_limit_language(text: str, terms: list[str]) -> bool:
    if not text:
        return False
    folded = text.casefold()
    return any(term.casefold() in folded for term in terms)


def parse_wait_minutes(text: str) -> int | None:
    folded = text.casefold()
    patterns = [
        r"(?:wait|esper(?:e|ar)?|tente novamente em)\s+(\d{1,3})\s*(?:min|minute|minuto)",
        r"(?:after|ap[oó]s|em)\s+(\d{1,3})\s*(?:min|minute|minuto)",
    ]
    for pattern in patterns:
        match = re.search(pattern, folded)
        if match:
            minutes = int(match.group(1))
            if 1 <= minutes <= 360:
                return minutes
    return None


def parse_resume_time(text: str, base: dt.datetime) -> dt.datetime | None:
    if not text:
        return None

    wait_minutes = parse_wait_minutes(text)
    if wait_minutes:
        return base + dt.timedelta(minutes=wait_minutes)

    folded = text.casefold()
    time_patterns = [
        r"(?:at|às|as|volta(?:m)?(?:\s+às)?|resets?\s+at)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?",
        r"\b(\d{1,2}):(\d{2})\s*(am|pm)?\b",
    ]
    for pattern in time_patterns:
        match = re.search(pattern, folded)
        if not match:
            continue
        hour = int(match.group(1))
        minute = int(match.group(2) or 0)
        suffix = match.group(3)
        if suffix == "pm" and hour < 12:
            hour += 12
        if suffix == "am" and hour == 12:
            hour = 0
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            continue
        candidate = base.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if candidate <= base:
            candidate += dt.timedelta(days=1)
        return candidate
    return None


def state_for_wait(
    config: dict[str, Any],
    state_path: Path,
    region: dict[str, Any],
    hit: OrangeHit,
    screenshot_path: Path,
    crop_path: Path,
    resume_at: dt.datetime,
) -> None:
    payload = {
        "status": "waiting_for_limit_reset",
        "detected_at": now_local().isoformat(),
        "resume_at": resume_at.isoformat(),
        "region": {
            "id": region.get("id"),
            "label": region.get("label"),
            "x": region.get("x"),
            "y": region.get("y"),
            "w": region.get("w"),
            "h": region.get("h"),
        },
        "orange": {
            "pixels": hit.pixels,
            "ratio": round(hit.ratio, 6),
            "bbox": hit.bbox,
        },
        "ocr_text": hit.text,
        "screenshot": str(screenshot_path),
        "crop": str(crop_path),
        "resume_prompt": config.get("resume_prompt", "continue o trabalho"),
    }
    write_json(state_path, payload)


def set_clipboard(text: str) -> bool:
    if shutil.which("xclip"):
        result = run_command(["xclip", "-selection", "clipboard"], input_text=text, timeout=10)
        return result.returncode == 0
    if shutil.which("wl-copy"):
        result = run_command(["wl-copy"], input_text=text, timeout=10)
        return result.returncode == 0
    return False


def resume_region(region: dict[str, Any], prompt: str, dry_run: bool) -> bool:
    click = region.get("resume_click") or region.get("click")
    if not click:
        print(f"[sentinel] Region {region.get('id')} has no resume_click; not sending.", flush=True)
        return False
    x = int(click["x"])
    y = int(click["y"])
    print(f"[sentinel] Resume target {region.get('id')} at {x},{y}: {prompt!r}", flush=True)
    if dry_run:
        return True
    if not shutil.which("xdotool"):
        raise RuntimeError("xdotool is required to click/type into the IDE.")

    if not set_clipboard(prompt):
        raise RuntimeError("No clipboard command available. Install xclip or wl-copy.")

    run_command(["xdotool", "mousemove", str(x), str(y)], timeout=5)
    run_command(["xdotool", "click", "1"], timeout=5)
    time.sleep(0.25)
    run_command(["xdotool", "key", "--clearmodifiers", "ctrl+a"], timeout=5)
    time.sleep(0.08)
    run_command(["xdotool", "key", "--clearmodifiers", "BackSpace"], timeout=5)
    time.sleep(0.08)
    run_command(["xdotool", "key", "--clearmodifiers", "ctrl+v"], timeout=5)
    time.sleep(0.15)
    run_command(["xdotool", "key", "--clearmodifiers", "Return"], timeout=5)
    return True


def scan_once(config: dict[str, Any], runtime_dir: Path) -> tuple[dict[str, Any], OrangeHit, Path, Path] | None:
    runtime_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d-%H%M%S")
    screenshot_path = runtime_dir / f"screen-{stamp}.png"
    capture_screen(screenshot_path)
    screen = Image.open(screenshot_path)
    terms = config.get("warning_terms", [])
    threshold = config.get("orange_threshold", {})
    min_pixels = int(threshold.get("min_pixels", 240))
    min_ratio = float(threshold.get("min_ratio", 0.0035))

    for region in config.get("regions", []):
        crop_path = runtime_dir / f"crop-{stamp}-{region.get('id', 'region')}.png"
        crop = crop_region(screen, region, crop_path)
        hit = detect_orange_banner(crop)
        if hit.pixels:
            hit.text = ocr_image(crop_path)
        visual_match = hit.pixels >= min_pixels and hit.ratio >= min_ratio and hit.has_wide_banner
        text_match = contains_limit_language(hit.text, terms)
        if visual_match or text_match:
            return region, hit, screenshot_path, crop_path
    return None


def wait_until_resume_at(resume_at: dt.datetime, interval: int) -> None:
    while True:
        remaining = (resume_at - now_local()).total_seconds()
        if remaining <= 0:
            return
        print(f"[sentinel] Waiting {int(remaining)}s until {resume_at.isoformat()}", flush=True)
        time.sleep(min(interval, max(1, remaining)))


def command_calibrate(config: dict[str, Any], runtime_dir: Path) -> int:
    runtime_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = runtime_dir / "calibration-screen.png"
    capture_screen(screenshot_path)
    screen = Image.open(screenshot_path)
    print(f"[sentinel] Screen: {screen.width}x{screen.height}")
    print(f"[sentinel] Full screenshot: {screenshot_path}")
    for region in config.get("regions", []):
        crop_path = runtime_dir / f"calibration-{region.get('id', 'region')}.png"
        crop = crop_region(screen, region, crop_path)
        hit = detect_orange_banner(crop)
        print(
            f"[sentinel] {region.get('id')}: x={region.get('x')} y={region.get('y')} "
            f"w={region.get('w')} h={region.get('h')} crop={crop_path} "
            f"orange_pixels={hit.pixels} ratio={hit.ratio:.6f} bbox={hit.bbox}"
        )
    return 0


def command_once(config: dict[str, Any], args: argparse.Namespace) -> int:
    runtime_dir = Path(args.runtime)
    hit = scan_once(config, runtime_dir)
    if not hit:
        print("[sentinel] No orange limit banner detected.")
        return 1
    region, orange, screenshot_path, crop_path = hit
    print(
        f"[sentinel] Detected {region.get('id')} ({region.get('label')}): "
        f"pixels={orange.pixels} ratio={orange.ratio:.6f} bbox={orange.bbox}"
    )
    if orange.text:
        print(f"[sentinel] OCR: {orange.text}")
    base = now_local()
    resume_at = parse_resume_time(orange.text, base)
    if resume_at is None:
        resume_at = base + dt.timedelta(minutes=int(args.wait_minutes or config.get("default_wait_minutes", 70)))
    resume_at += dt.timedelta(minutes=int(config.get("resume_grace_minutes", 3)))
    state_for_wait(config, Path(args.state), region, orange, screenshot_path, crop_path, resume_at)
    return 0


def command_watch(config: dict[str, Any], args: argparse.Namespace) -> int:
    interval = int(args.interval or config.get("scan_interval_seconds", 20))
    default_wait = int(args.wait_minutes or config.get("default_wait_minutes", 70))
    prompt = args.prompt or config.get("resume_prompt", "continue o trabalho")
    runtime_dir = Path(args.runtime)
    state_path = Path(args.state)
    print("[sentinel] Watching IDE chat input limit banners.", flush=True)
    print(f"[sentinel] Prompt on resume: {prompt!r}", flush=True)

    while True:
        detected = scan_once(config, runtime_dir)
        if not detected:
            time.sleep(interval)
            continue

        region, orange, screenshot_path, crop_path = detected
        base = now_local()
        resume_at = parse_resume_time(orange.text, base)
        if resume_at is None:
            resume_at = base + dt.timedelta(minutes=default_wait)
        resume_at += dt.timedelta(minutes=int(config.get("resume_grace_minutes", 3)))
        state_for_wait(config, state_path, region, orange, screenshot_path, crop_path, resume_at)
        label = region.get("label") or region.get("id")
        msg = f"{label}: pausa até {resume_at.strftime('%H:%M')}."
        print(f"[sentinel] Limit banner detected. {msg}", flush=True)
        notify("Agent Sentinel", msg)
        wait_until_resume_at(resume_at, interval)

        # Re-scan before typing. If the banner is still there, wait another cycle.
        still_blocked = scan_once(config, runtime_dir)
        if still_blocked:
            print("[sentinel] Limit banner still visible after wait; extending wait.", flush=True)
            continue

        resume_region(region, prompt, args.dry_run)
        write_json(
            state_path,
            {
                "status": "resumed",
                "resumed_at": now_local().isoformat(),
                "region": {"id": region.get("id"), "label": region.get("label")},
                "resume_prompt": prompt,
                "dry_run": bool(args.dry_run),
            },
        )
        notify("Agent Sentinel", f"{label}: enviei {prompt!r}.")
        time.sleep(interval)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Watch Claude/Codex/Devin chat limit banners and resume work.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path to config JSON.")
    parser.add_argument("--state", default=str(DEFAULT_STATE), help="Path to state JSON.")
    parser.add_argument("--runtime", default=str(DEFAULT_RUNTIME), help="Runtime screenshot/crop directory.")
    parser.add_argument("--interval", type=int, default=None, help="Scan interval in seconds.")
    parser.add_argument("--wait-minutes", type=int, default=None, help="Fallback wait when OCR cannot read a reset time.")
    parser.add_argument("--prompt", default=None, help="Prompt to send on resume.")
    parser.add_argument("--dry-run", action="store_true", help="Do not click/type; only log.")
    parser.add_argument("--once", action="store_true", help="Scan once and exit.")
    parser.add_argument("--calibrate", action="store_true", help="Capture screen and save region crops for calibration.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"[sentinel] Config not found: {config_path}", file=sys.stderr)
        return 2
    config = load_json(config_path)
    if args.calibrate:
        return command_calibrate(config, Path(args.runtime))
    if args.once:
        return command_once(config, args)
    return command_watch(config, args)


if __name__ == "__main__":
    raise SystemExit(main())
