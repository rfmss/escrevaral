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
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image, ImageEnhance, ImageOps


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
    kind: str = "none"
    support_pixels: int = 0

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


def read_json_if_exists(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return load_json(path)
    except Exception:
        return {}


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


def load_screen(path: Path, source_image: str | None = None) -> Image.Image:
    if source_image:
        image = Image.open(source_image)
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path)
        return image
    capture_screen(path)
    return Image.open(path)


def crop_region(image: Image.Image, region: dict[str, Any], out_path: Path) -> Image.Image:
    x = int(region["x"])
    y = int(region["y"])
    w = int(region["w"])
    h = int(region["h"])
    cropped = image.crop((x, y, x + w, y + h))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(out_path)
    return cropped


def bbox_for(points: list[tuple[int, int]]) -> tuple[int, int, int, int] | None:
    if not points:
        return None
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)


def detect_orange_banner(image: Image.Image, modes: list[str] | None = None, threshold: dict[str, Any] | None = None) -> OrangeHit:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    active_modes = set(modes or ["orange_banner", "warm_banner"])
    threshold = threshold or {}
    orange_marked: list[tuple[int, int]] = []
    warm_marked: list[tuple[int, int]] = []
    gray_marked: list[tuple[int, int]] = []
    bright_marked: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            # Long warning banners in Claude/Codex use a saturated amber/orange.
            # This intentionally ignores muted gray text and the input border.
            if r >= 165 and 70 <= g <= 185 and b <= 95 and r > g + 22 and g > b + 18:
                orange_marked.append((x, y))
            # Claude's near-limit banner can render as a darker warm strip.
            if 70 <= r <= 155 and 48 <= g <= 125 and 25 <= b <= 90 and r >= g + 8 and g >= b + 8:
                warm_marked.append((x, y))
            # Codex/Devin rate-limit dialogs render as a wide raised gray card.
            if 36 <= r <= 72 and 36 <= g <= 72 and 36 <= b <= 72 and max(r, g, b) - min(r, g, b) <= 10:
                gray_marked.append((x, y))
            if r >= 145 and g >= 145 and b >= 145 and max(r, g, b) - min(r, g, b) <= 35:
                bright_marked.append((x, y))

    total = max(1, width * height)
    candidates: list[OrangeHit] = []

    if "orange_banner" in active_modes and orange_marked:
        candidates.append(
            OrangeHit(len(orange_marked), len(orange_marked) / total, bbox_for(orange_marked), kind="orange_banner")
        )

    if "warm_banner" in active_modes and warm_marked:
        candidates.append(
            OrangeHit(len(warm_marked), len(warm_marked) / total, bbox_for(warm_marked), kind="warm_banner")
        )

    min_bright = int(threshold.get("gray_card_min_bright_pixels", 80))
    if "gray_card" in active_modes and gray_marked and len(bright_marked) >= min_bright:
        candidates.append(
            OrangeHit(
                len(gray_marked),
                len(gray_marked) / total,
                bbox_for(gray_marked),
                kind="gray_card",
                support_pixels=len(bright_marked),
            )
        )

    if not candidates:
        return OrangeHit(0, 0.0, None)

    return max(candidates, key=lambda hit: hit.ratio)


def visual_match_for(hit: OrangeHit, config: dict[str, Any]) -> bool:
    if not hit.has_wide_banner:
        return False
    if hit.kind == "gray_card":
        threshold = config.get("gray_card_threshold", {})
        return hit.pixels >= int(threshold.get("min_pixels", 5000)) and hit.ratio >= float(
            threshold.get("min_ratio", 0.35)
        )
    if hit.kind == "warm_banner":
        threshold = config.get("warm_threshold", {})
        return hit.pixels >= int(threshold.get("min_pixels", 1200)) and hit.ratio >= float(
            threshold.get("min_ratio", 0.08)
        )
    threshold = config.get("orange_threshold", {})
    return hit.pixels >= int(threshold.get("min_pixels", 240)) and hit.ratio >= float(
        threshold.get("min_ratio", 0.0035)
    )


def has_hard_limit_language(text: str) -> bool:
    if not text:
        return False
    folded = text.casefold()
    hard_terms = [
        "out of",
        "rate limit",
        "limit exceeded",
        "exceeded your",
        "try again",
        "tente novamente",
        "limite excedido",
        "upgrade or use",
        "reset usage",
        "comprar credito",
        "comprar crédito",
    ]
    return any(term in folded for term in hard_terms)


def is_hard_visual_limit(hit: OrangeHit, config: dict[str, Any]) -> bool:
    hard_kinds = set(config.get("hard_visual_kinds", ["gray_card"]))
    return hit.kind in hard_kinds


def is_uncertain_limit(hit: OrangeHit, config: dict[str, Any]) -> bool:
    if not config.get("probe_on_uncertain_limit", False):
        return False
    if hit.text and parse_resume_time(hit.text, now_local()) is not None:
        return False
    if has_hard_limit_language(hit.text):
        return False
    return not is_hard_visual_limit(hit, config)


def resume_time_for_hit(
    config: dict[str, Any],
    hit: OrangeHit,
    base: dt.datetime,
    default_wait_minutes: int,
    *,
    uncertain_after_probe: bool = False,
    no_ocr_attempts: int = 0,
) -> tuple[dt.datetime, str]:
    resume_at = parse_resume_time(hit.text, base)
    source = "ocr"
    if resume_at is None:
        if uncertain_after_probe:
            source = "uncertain-retry"
            wait_minutes = int(config.get("uncertain_retry_minutes", 10))
        elif not hit.text:
            max_attempts = int(config.get("max_no_ocr_resume_attempts", 1))
            if no_ocr_attempts >= max_attempts:
                source = "no-ocr-long-wait"
                wait_minutes = int(config.get("no_ocr_long_wait_minutes", default_wait_minutes))
            else:
                source = "no-ocr"
                wait_minutes = int(config.get("no_ocr_retry_minutes", default_wait_minutes))
        else:
            source = "fallback"
            wait_minutes = default_wait_minutes
        resume_at = base + dt.timedelta(minutes=wait_minutes)
    resume_at += dt.timedelta(minutes=int(config.get("resume_grace_minutes", 3)))
    return resume_at, source


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
        return ocr_image_gocr(path)
    langs = tesseract_languages()
    lang_arg = "+".join(langs) if langs else "eng"
    result = run_command(["tesseract", str(path), "stdout", "-l", lang_arg, "--psm", "6"], timeout=20)
    if result.returncode != 0:
        return ocr_image_gocr(path)
    text = " ".join(result.stdout.split())
    return text or ocr_image_gocr(path)


def ocr_image_gocr(path: Path) -> str:
    if not shutil.which("gocr"):
        return ""

    texts: list[str] = []
    for threshold in (95, 115, 135, 155):
        prepared = path.with_name(f"{path.stem}-gocr-{threshold}.pnm")
        try:
            image = Image.open(path).convert("L")
            image = ImageOps.autocontrast(image)
            image = ImageEnhance.Contrast(image).enhance(3.0)
            image = image.resize((image.width * 3, image.height * 3))
            image = image.point(lambda p, t=threshold: 255 if p >= t else 0)
            image.save(prepared)
            result = run_command(["gocr", "-i", str(prepared), "-f", "UTF8"], timeout=20)
        except Exception:
            continue
        if result.returncode == 0 and result.stdout.strip():
            texts.append(" ".join(result.stdout.split()))

    if not texts:
        return ""
    return max(texts, key=score_ocr_text)


def score_ocr_text(text: str) -> int:
    folded = fold_text(text)
    score = sum(ch.isdigit() for ch in folded) * 4
    for term in ("reset", "resets", "limit", "limite", "try", "again", "pm", "am", "hora", "hour"):
        if term in folded:
            score += 8
    if re.search(r"\d{1,2}\s*[:h]\s*\d{2}", folded):
        score += 20
    if re.search(r"(?:in|em)\s*\d{1,3}\s*(?:h|m|min|hour|hora)", folded):
        score += 20
    if re.search(r"(?:in|em)\d{1,3}(?:h|m)", folded):
        score += 20
    return score + min(len(folded), 120) // 8


def contains_limit_language(text: str, terms: list[str]) -> bool:
    if not text:
        return False
    folded = text.casefold()
    return any(term.casefold() in folded for term in terms)


def fold_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text.casefold())
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def parse_wait_minutes(text: str) -> int | None:
    folded = fold_text(text)
    compact = re.sub(r"\s+", "", folded)

    if re.search(r"(?:in|em|daquia|apos|after|wait|reset(?:s)?in|reset(?:s)?em)uma(?:h|hora)", compact):
        return 60

    hour_patterns = [
        r"(?:in|em|daquia|apos|after|wait|reset(?:s)?in|reset(?:s)?em)(\d{1,3})(?:h|hr|hrs|hour|hours|hora|horas)",
        r"(?:in|em|apos|after|wait|resets?\s+(?:in|em))\s*(\d{1,3})\s*(?:h|hr|hrs|hour|hours|hora|horas)",
    ]
    for pattern in hour_patterns:
        match = re.search(pattern, compact) or re.search(pattern, folded)
        if match:
            hours = int(match.group(1))
            if 1 <= hours <= 24:
                return hours * 60

    minute_patterns = [
        r"(?:wait|esper(?:e|ar)?|tente novamente em|try again in|reset(?:s)?\s+(?:in|em))\s*(\d{1,3})\s*(?:m|min|mins|minute|minutes|minuto|minutos)",
        r"(?:after|apos|em|in)\s*(\d{1,3})\s*(?:m|min|mins|minute|minutes|minuto|minutos)",
        r"(?:in|em|apos|after|reset(?:s)?in|reset(?:s)?em)(\d{1,3})(?:m|min|mins)",
    ]
    for pattern in minute_patterns:
        match = re.search(pattern, folded) or re.search(pattern, compact)
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

    folded = fold_text(text)
    folded = re.sub(r"(?<=\d)[;](?=\d)", ":", folded)
    time_patterns = [
        r"(?:try\s+again\s+at|available\s+at|resets?(?:\s+(?:at|on))?|reset(?:s)?|volta(?:m)?(?:\s+as)?|at|as)\s*(\d{1,2})(?:[:h.](\d{2}))?\s*(am|pm)?",
        r"\b(\d{1,2})\s*[:h.]\s*(\d{2})\s*(am|pm)?\b",
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
            if base - candidate <= dt.timedelta(minutes=15):
                candidate = base
            else:
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
    resume_source: str = "unknown",
    no_ocr_resume_attempts: int = 0,
) -> None:
    payload = {
        "status": "waiting_for_limit_reset",
        "detected_at": now_local().isoformat(),
        "resume_at": resume_at.isoformat(),
        "resume_source": resume_source,
        "region": {
            "id": region.get("id"),
            "label": region.get("label"),
            "x": region.get("x"),
            "y": region.get("y"),
            "w": region.get("w"),
            "h": region.get("h"),
        },
        "orange": {
            "kind": hit.kind,
            "pixels": hit.pixels,
            "ratio": round(hit.ratio, 6),
            "bbox": hit.bbox,
            "support_pixels": hit.support_pixels,
        },
        "ocr_text": hit.text,
        "screenshot": str(screenshot_path),
        "crop": str(crop_path),
        "resume_prompt": config.get("resume_prompt", "continue o trabalho"),
        "no_ocr_resume_attempts": no_ocr_resume_attempts,
    }
    write_json(state_path, payload)


def prior_no_ocr_attempts(state_path: Path, region_id: str | None) -> int:
    state = read_json_if_exists(state_path)
    if not state:
        return 0
    state_region = (state.get("region") or {}).get("id")
    if state_region != region_id:
        return 0
    return int(state.get("no_ocr_resume_attempts", 0) or 0)


def set_clipboard(text: str) -> bool:
    if shutil.which("wl-copy"):
        result = run_command(["wl-copy"], input_text=text, timeout=10)
        return result.returncode == 0
    if shutil.which("xclip"):
        proc = subprocess.Popen(
            ["xclip", "-selection", "clipboard", "-loops", "1"],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
        )
        if proc.stdin:
            proc.stdin.write(text)
            proc.stdin.close()
        time.sleep(0.1)
        return proc.poll() is None
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

    run_command(["xdotool", "mousemove", str(x), str(y)], timeout=5)
    run_command(["xdotool", "click", "1"], timeout=5)
    time.sleep(0.25)
    run_command(["xdotool", "key", "--clearmodifiers", "ctrl+a"], timeout=5)
    time.sleep(0.08)
    run_command(["xdotool", "key", "--clearmodifiers", "BackSpace"], timeout=5)
    time.sleep(0.08)
    typed = run_command(["xdotool", "type", "--clearmodifiers", "--delay", "1", prompt], timeout=10)
    if typed.returncode != 0:
        if not set_clipboard(prompt):
            raise RuntimeError("Could not type prompt or set clipboard.")
        run_command(["xdotool", "key", "--clearmodifiers", "ctrl+v"], timeout=5)
    time.sleep(0.15)
    run_command(["xdotool", "key", "--clearmodifiers", "Return"], timeout=5)
    return True


def scan_once(
    config: dict[str, Any],
    runtime_dir: Path,
    source_image: str | None = None,
) -> tuple[dict[str, Any], OrangeHit, Path, Path] | None:
    runtime_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d-%H%M%S")
    screenshot_path = runtime_dir / f"screen-{stamp}.png"
    screen = load_screen(screenshot_path, source_image)
    terms = config.get("warning_terms", [])
    for region in config.get("regions", []):
        crop_path = runtime_dir / f"crop-{stamp}-{region.get('id', 'region')}.png"
        crop = crop_region(screen, region, crop_path)
        modes = region.get("visual_hints") or region.get("detectors")
        hit = detect_orange_banner(crop, modes=modes, threshold=config)
        if hit.pixels:
            hit.text = ocr_image(crop_path)
        visual_match = visual_match_for(hit, config)
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


def command_calibrate(config: dict[str, Any], runtime_dir: Path, source_image: str | None = None) -> int:
    runtime_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = runtime_dir / "calibration-screen.png"
    screen = load_screen(screenshot_path, source_image)
    print(f"[sentinel] Screen: {screen.width}x{screen.height}")
    print(f"[sentinel] Full screenshot: {screenshot_path}")
    for region in config.get("regions", []):
        crop_path = runtime_dir / f"calibration-{region.get('id', 'region')}.png"
        crop = crop_region(screen, region, crop_path)
        hit = detect_orange_banner(crop, modes=region.get("visual_hints") or region.get("detectors"), threshold=config)
        print(
            f"[sentinel] {region.get('id')}: x={region.get('x')} y={region.get('y')} "
            f"w={region.get('w')} h={region.get('h')} crop={crop_path} "
            f"kind={hit.kind} pixels={hit.pixels} ratio={hit.ratio:.6f} "
            f"support_pixels={hit.support_pixels} bbox={hit.bbox}"
        )
    return 0


def command_once(config: dict[str, Any], args: argparse.Namespace) -> int:
    runtime_dir = Path(args.runtime)
    hit = scan_once(config, runtime_dir, source_image=args.image)
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
    resume_at, source = resume_time_for_hit(
        config,
        orange,
        base,
        int(args.wait_minutes or config.get("default_wait_minutes", 70)),
        no_ocr_attempts=prior_no_ocr_attempts(Path(args.state), region.get("id")),
    )
    state_for_wait(
        config,
        Path(args.state),
        region,
        orange,
        screenshot_path,
        crop_path,
        resume_at,
        source,
        no_ocr_resume_attempts=prior_no_ocr_attempts(Path(args.state), region.get("id")),
    )
    return 0


def command_watch(config: dict[str, Any], args: argparse.Namespace) -> int:
    interval = int(args.interval or config.get("scan_interval_seconds", 20))
    default_wait = int(args.wait_minutes or config.get("default_wait_minutes", 70))
    probe_wait = int(config.get("probe_wait_seconds", 18))
    prompt = args.prompt or config.get("resume_prompt", "continue o trabalho")
    runtime_dir = Path(args.runtime)
    state_path = Path(args.state)
    no_ocr_attempts_by_region: dict[str, int] = {}
    print("[sentinel] Watching IDE chat input limit banners.", flush=True)
    print(f"[sentinel] Prompt on resume: {prompt!r}", flush=True)

    while True:
        detected = scan_once(config, runtime_dir)
        if not detected:
            time.sleep(interval)
            continue

        region, orange, screenshot_path, crop_path = detected
        label = region.get("label") or region.get("id")
        region_id = str(region.get("id") or "")
        no_ocr_attempts = no_ocr_attempts_by_region.get(region_id)
        if no_ocr_attempts is None:
            no_ocr_attempts = prior_no_ocr_attempts(state_path, region_id)

        if is_uncertain_limit(orange, config):
            print(f"[sentinel] Uncertain limit signal in {label}; probing resume once.", flush=True)
            write_json(
                state_path,
                {
                    "status": "probing_uncertain_limit",
                    "detected_at": now_local().isoformat(),
                    "region": {"id": region.get("id"), "label": label},
                    "visual_kind": orange.kind,
                    "ocr_text": orange.text,
                    "probe_wait_seconds": probe_wait,
                    "dry_run": bool(args.dry_run),
                },
            )
            resume_region(region, prompt, args.dry_run)
            time.sleep(probe_wait)
            reprobe = scan_once(config, runtime_dir)
            if not reprobe:
                print("[sentinel] No limit message after probe; work can continue.", flush=True)
                write_json(
                    state_path,
                    {
                        "status": "resumed_after_probe",
                        "resumed_at": now_local().isoformat(),
                        "region": {"id": region.get("id"), "label": label},
                        "resume_prompt": prompt,
                        "dry_run": bool(args.dry_run),
                    },
                )
                notify("Agent Sentinel", f"{label}: sondagem liberou, trabalho retomado.")
                time.sleep(interval)
                continue
            region, orange, screenshot_path, crop_path = reprobe
            label = region.get("label") or region.get("id")

        base = now_local()
        resume_at, source = resume_time_for_hit(
            config,
            orange,
            base,
            default_wait,
            uncertain_after_probe=is_uncertain_limit(orange, config),
            no_ocr_attempts=no_ocr_attempts,
        )
        state_for_wait(
            config,
            state_path,
            region,
            orange,
            screenshot_path,
            crop_path,
            resume_at,
            source,
            no_ocr_resume_attempts=no_ocr_attempts,
        )
        msg = f"{label}: pausa até {resume_at.strftime('%H:%M')}."
        print(f"[sentinel] Limit banner detected ({source}). {msg}", flush=True)
        notify("Agent Sentinel", msg)
        wait_until_resume_at(resume_at, interval)

        # Re-scan before typing. If the banner is still there, the next cycle will
        # parse the new text when OCR exists, or use the shorter uncertain retry.
        still_blocked = scan_once(config, runtime_dir)
        if still_blocked:
            print("[sentinel] Limit banner still visible after wait; extending wait.", flush=True)
            continue

        sent_without_ocr = not orange.text
        resume_region(region, prompt, args.dry_run)
        if sent_without_ocr:
            no_ocr_attempts_by_region[region_id] = no_ocr_attempts + 1
        else:
            no_ocr_attempts_by_region[region_id] = 0
        write_json(
            state_path,
            {
                "status": "resumed",
                "resumed_at": now_local().isoformat(),
                "region": {"id": region.get("id"), "label": region.get("label")},
                "resume_prompt": prompt,
                "dry_run": bool(args.dry_run),
                "ocr_text": orange.text,
                "no_ocr_resume_attempts": no_ocr_attempts_by_region.get(region_id, 0),
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
    parser.add_argument("--image", default=None, help="Use an existing screenshot for --once or --calibrate.")
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
        return command_calibrate(config, Path(args.runtime), source_image=args.image)
    if args.once:
        return command_once(config, args)
    return command_watch(config, args)


if __name__ == "__main__":
    raise SystemExit(main())
