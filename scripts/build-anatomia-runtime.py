from __future__ import annotations

import base64
import hashlib
import io
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "anatomia-original.html"
PUBLIC = ROOT / "mass-notes-next" / "public"
TARGET = PUBLIC / "anatomia-do-livro.html"
ASSET_DIR = PUBLIC / "assets" / "anatomia"

PNG_DATA_URI = re.compile(r"data:image/png;base64,([A-Za-z0-9+/=]+)")

EMBED_OLD = (
    "if(window.self!==window.top){document.addEventListener('DOMContentLoaded',()=>{"
    "const h=document.querySelector('.anatomia-header');if(h)h.style.display='none'})}"
)
EMBED_NEW = "if(window.self!==window.top){document.documentElement.classList.add('is-embedded')}"

EMBED_CSS = r"""

/* Correção do modo embutido no Mass Notes. */
@media (min-width:881px){
  html.is-embedded body{grid-template-rows:auto minmax(0,1fr)}
  html.is-embedded .anatomia-header{display:none!important}
  html.is-embedded .hero{grid-row:1;min-height:0;overflow:visible}
  html.is-embedded .layout{grid-row:2;height:100%;min-height:0;overflow:hidden}
  html.is-embedded .index-panel{height:100%;min-height:0;overflow:hidden}
  html.is-embedded .index{min-height:0;overflow:auto;overscroll-behavior:contain}
  html.is-embedded .stage-panel{min-height:0}
}
"""


def save_webp(raw: bytes, destination: Path, quality: int = 55) -> None:
    with Image.open(io.BytesIO(raw)) as image:
        mode = "RGBA" if image.mode in {"RGBA", "LA"} else "RGB"
        image.convert(mode).save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    matches = list(PNG_DATA_URI.finditer(source))
    if len(matches) != 2:
        raise SystemExit(f"Esperava 2 PNGs incorporados; encontrei {len(matches)}")

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    replacements: list[tuple[int, int, str]] = []

    for index, match in enumerate(matches, start=1):
        raw = base64.b64decode(match.group(1), validate=True)
        destination = ASSET_DIR / f"anatomia-asset-{index}.webp"
        save_webp(raw, destination)
        replacements.append(
            (match.start(), match.end(), f"assets/anatomia/{destination.name}")
        )
        print(
            f"asset {index}: {len(raw)} bytes PNG -> {destination.stat().st_size} bytes WebP; "
            f"sha256={hashlib.sha256(destination.read_bytes()).hexdigest()}"
        )

    built = source
    for start, end, replacement in reversed(replacements):
        built = built[:start] + replacement + built[end:]

    if EMBED_OLD not in built:
        raise SystemExit("Não encontrei o detector antigo do iframe")
    built = built.replace(EMBED_OLD, EMBED_NEW, 1)

    marker = "@media (max-height:300px){.anatomia-header{display:none}}\n</style>"
    if marker not in built:
        raise SystemExit("Não encontrei o marcador final de CSS")
    built = built.replace(
        marker,
        marker.replace("\n</style>", EMBED_CSS + "\n</style>"),
        1,
    )

    checks = {
        "título": "<title>Anatomia do Livro — Escrevaral</title>",
        "paleta": "--sky:#a9d4e4",
        "StPageFlip": "page-flip@2.0.7",
        "livro": 'id="pageFlipBook"',
        "correção iframe": "html.is-embedded body{grid-template-rows:auto minmax(0,1fr)}",
    }
    for label, needle in checks.items():
        if needle not in built:
            raise SystemExit(f"Ausente no runtime: {label}")

    forbidden = ("data:image/png;base64", "atob(", "anatomia-original.html")
    for needle in forbidden:
        if needle in built:
            raise SystemExit(f"Dependência proibida no runtime: {needle}")

    TARGET.write_text(built, encoding="utf-8")
    if TARGET.stat().st_size > 500_000:
        raise SystemExit(f"HTML gerado grande demais: {TARGET.stat().st_size} bytes")

    print(
        f"HTML: {TARGET.stat().st_size} bytes; "
        f"sha256={hashlib.sha256(TARGET.read_bytes()).hexdigest()}"
    )


if __name__ == "__main__":
    main()
