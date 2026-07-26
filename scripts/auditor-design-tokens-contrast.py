#!/usr/bin/env python3
"""Valida contraste dos tokens de texto nas superfícies previstas do Escrevaral."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS_FILE = ROOT / "css/00-tokens.css"


@dataclass(frozen=True)
class Pair:
    role: str
    foreground: str
    surface: str
    minimum: float


BASE_SURFACES = (
    "--paper",
    "--surface",
    "--surface-low",
    "--surface-mid",
    "--surface-high",
    "--card",
)

THEMES = {
    "Alvorada": {
        "selector": ":root",
        "pairs": (
            *(Pair("text-primary", "--ink", surface, 4.5) for surface in BASE_SURFACES),
            *(Pair("text-secondary", "--soft-ink", surface, 4.5) for surface in BASE_SURFACES),
            *(
                Pair("text-muted", "--muted", surface, 4.5)
                for surface in ("--paper", "--surface", "--surface-low", "--card")
            ),
            Pair("text-callout", "--tip-ink", "--tip-bg", 4.5),
            Pair("text-on-accent", "--on-primary", "--primary", 4.5),
        ),
    },
    "Vereda": {
        "selector": '[data-theme="scriptorium"]',
        "pairs": (
            *(Pair("text-primary", "--ink", surface, 4.5) for surface in BASE_SURFACES),
            *(Pair("text-secondary", "--soft-ink", surface, 4.5) for surface in BASE_SURFACES),
            *(Pair("text-muted", "--muted", surface, 5.5) for surface in BASE_SURFACES),
            Pair("text-callout", "--tip-ink", "--tip-bg", 4.5),
            Pair("text-on-accent", "--on-primary", "--primary", 4.5),
        ),
    },
}

BLOCK_RE = re.compile(
    r'(?P<selector>:root|\[data-theme="scriptorium"\])\s*\{(?P<body>.*?)\n\}',
    re.DOTALL,
)
TOKEN_RE = re.compile(r"(?P<name>--[a-z0-9-]+)\s*:\s*(?P<value>#[0-9a-fA-F]{6})\s*;")


def parse_tokens(css: str) -> dict[str, dict[str, str]]:
    parsed: dict[str, dict[str, str]] = {}
    for match in BLOCK_RE.finditer(css):
        selector = match.group("selector")
        parsed[selector] = {
            token.group("name"): token.group("value").lower()
            for token in TOKEN_RE.finditer(match.group("body"))
        }
    return parsed


def luminance(hex_color: str) -> float:
    channels = [int(hex_color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast(first: str, second: str) -> float:
    lighter, darker = sorted((luminance(first), luminance(second)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def main() -> None:
    css = TOKENS_FILE.read_text(encoding="utf-8")
    themes = parse_tokens(css)
    failures: list[str] = []

    for theme_name, config in THEMES.items():
        selector = config["selector"]
        tokens = themes.get(selector)
        if tokens is None:
            failures.append(f"{theme_name}: bloco {selector} não encontrado")
            continue

        print(f"[{theme_name}]")
        for pair in config["pairs"]:
            missing = [
                name
                for name in (pair.foreground, pair.surface)
                if name not in tokens
            ]
            if missing:
                failures.append(
                    f"{theme_name}/{pair.role}: token ausente: {', '.join(missing)}"
                )
                continue

            foreground = tokens[pair.foreground]
            surface = tokens[pair.surface]
            value = contrast(foreground, surface)
            print(
                f"  {pair.role}: {pair.foreground}={foreground} em "
                f"{pair.surface}={surface} -> {value:.2f}:1 "
                f"(mínimo {pair.minimum:.1f}:1)"
            )
            if value + 1e-9 < pair.minimum:
                failures.append(
                    f"{theme_name}/{pair.role}: {value:.2f}:1 em {pair.surface}; "
                    f"mínimo {pair.minimum:.1f}:1"
                )

    if failures:
        print("\n[design-tokens-contrast] FALHA")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print("\n[design-tokens-contrast] aprovado")


if __name__ == "__main__":
    main()
