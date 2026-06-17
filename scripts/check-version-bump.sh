#!/usr/bin/env bash
set -u

if [ -t 0 ]; then
  HOOK_INPUT=""
else
  HOOK_INPUT="$(cat 2>/dev/null || true)"
fi
COMMAND=""

if [ -n "$HOOK_INPUT" ]; then
  COMMAND="$(
    printf '%s' "$HOOK_INPUT" | python3 -c '
import json
import sys

try:
    payload = json.load(sys.stdin)
except Exception:
    print("")
else:
    print(payload.get("tool_input", {}).get("command", ""))
' 2>/dev/null || true
  )"
fi

is_manual_check=0
if [ -z "$HOOK_INPUT" ]; then
  is_manual_check=1
fi

if [ "$is_manual_check" -eq 0 ]; then
  if ! printf '%s' "$COMMAND" | grep -Eq '(^|[;&|[:space:]])git([[:space:]][^;&|]*)?[[:space:]]+commit([[:space:]]|$)'; then
    exit 0
  fi
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

staged_assets="$(
  git diff --cached --name-only --diff-filter=ACMR |
    awk '
      /\.js$/ && $0 != "service-worker.js" { print; next }
      /\.css$/ { print; next }
    '
)"

if [ -z "$staged_assets" ]; then
  exit 0
fi

index_diff="$(git diff --cached -- index.html)"
sw_diff="$(git diff --cached -- service-worker.js)"

missing=""

if ! printf '%s\n' "$index_diff" | grep -Eq '^[+-].*\?v='; then
  missing="${missing}
- index.html sem bump de ?v="
fi

if ! printf '%s\n' "$sw_diff" | grep -Eq '^[+-]const ASSET_VERSION = '; then
  missing="${missing}
- service-worker.js sem alteracao de ASSET_VERSION"
fi

if ! printf '%s\n' "$sw_diff" | grep -Eq '^[+-]const CACHE_NAME = '; then
  missing="${missing}
- service-worker.js sem incremento de CACHE_NAME"
fi

if [ -n "$missing" ]; then
  {
    printf '%s\n' "AVISO Escrevaral: ha JS/CSS staged para commit sem versionamento completo."
    printf '%s\n\n' "Arquivos JS/CSS staged:"
    printf '%s\n\n' "$staged_assets"
    printf '%s\n' "Pendencias detectadas:"
    printf '%s\n\n' "$missing"
    printf '%s\n' "Rode /preparar-release ou atualize index.html + ASSET_VERSION + CACHE_NAME antes do commit."
  } >&2
fi

exit 0
