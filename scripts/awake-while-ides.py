#!/usr/bin/env python3
"""
Keep the computer awake only while configured IDE/agent processes are active.

The monitor does not keep the screen on. DPMS can still blank/power off the
monitor; this only blocks system sleep while work tools are running.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / ".agents" / "awake-ides" / "config.json"
DEFAULT_STATE = ROOT / ".agents" / "awake-ides" / "state.json"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    tmp.replace(path)


def run(args: list[str], timeout: int = 15) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )


def list_processes() -> list[dict[str, str]]:
    result = run(["ps", "-eo", "pid=,comm=,args="])
    if result.returncode != 0:
        return []
    processes = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 2)
        if len(parts) < 2:
            continue
        pid = parts[0]
        comm = parts[1]
        args = parts[2] if len(parts) > 2 else comm
        processes.append({"pid": pid, "comm": comm, "args": args})
    return processes


def find_matches(config: dict[str, Any]) -> list[dict[str, str]]:
    patterns = config.get("process_patterns", [])
    compiled = [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    matches = []
    own_pid = str(os.getpid())
    for proc in list_processes():
        if proc["pid"] == own_pid:
            continue
        haystack = f"{proc['comm']} {proc['args']}"
        for pattern in compiled:
            if pattern.search(haystack):
                matches.append(
                    {
                        "pid": proc["pid"],
                        "comm": proc["comm"],
                        "pattern": pattern.pattern,
                        "args": proc["args"][:220],
                    }
                )
                break
    return matches


def apply_display_policy(config: dict[str, Any]) -> None:
    if not config.get("manage_display_power", True):
        return
    if not shutil.which("xset"):
        return
    blank_after = int(config.get("screen_blank_seconds", 600))
    run(["xset", "s", "blank"], timeout=5)
    run(["xset", "s", str(blank_after), str(blank_after)], timeout=5)
    run(["xset", "+dpms"], timeout=5)
    run(["xset", "dpms", "0", "0", str(blank_after)], timeout=5)


def start_inhibitor(config: dict[str, Any]) -> subprocess.Popen[str]:
    if not shutil.which("systemd-inhibit"):
        raise RuntimeError("systemd-inhibit not found")
    who = config.get("inhibit_who", "Escrevaral IDE Watch")
    why = config.get("inhibit_why", "Manter agentes e IDEs trabalhando com a tela apagada")
    return subprocess.Popen(
        [
            "systemd-inhibit",
            "--what=sleep",
            f"--who={who}",
            f"--why={why}",
            "--mode=block",
            "sleep",
            "infinity",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=True,
    )


def stop_inhibitor(proc: subprocess.Popen[str] | None) -> None:
    if not proc or proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait(timeout=5)


def state_payload(status: str, matches: list[dict[str, str]], inhibitor: subprocess.Popen[str] | None) -> dict[str, Any]:
    return {
        "status": status,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "inhibitor_pid": inhibitor.pid if inhibitor and inhibitor.poll() is None else None,
        "matches": matches[:20],
        "match_count": len(matches),
    }


def command_once(config: dict[str, Any], state_path: Path) -> int:
    apply_display_policy(config)
    matches = find_matches(config)
    status = "active_ide_detected" if matches else "idle_no_ide"
    write_json(state_path, state_payload(status, matches, None))
    print(f"[awake-ides] {status}: {len(matches)} match(es)")
    for match in matches[:12]:
        print(f"[awake-ides] {match['pid']} {match['comm']} via {match['pattern']}")
    return 0 if matches else 1


def command_watch(config: dict[str, Any], state_path: Path, interval: int) -> int:
    apply_display_policy(config)
    inhibitor: subprocess.Popen[str] | None = None
    stopping = False

    def handle_stop(_signum: int, _frame: Any) -> None:
        nonlocal stopping
        stopping = True

    signal.signal(signal.SIGTERM, handle_stop)
    signal.signal(signal.SIGINT, handle_stop)

    print("[awake-ides] Watching IDE/agent processes. Screen may turn off; sleep is conditional.", flush=True)

    try:
        while not stopping:
            matches = find_matches(config)
            if matches and (not inhibitor or inhibitor.poll() is not None):
                inhibitor = start_inhibitor(config)
                print(f"[awake-ides] Sleep inhibited: {len(matches)} active match(es).", flush=True)
            elif not matches and inhibitor and inhibitor.poll() is None:
                stop_inhibitor(inhibitor)
                inhibitor = None
                print("[awake-ides] No configured IDEs detected; sleep allowed.", flush=True)

            status = "sleep_blocked_for_ides" if matches else "sleep_allowed"
            write_json(state_path, state_payload(status, matches, inhibitor))
            time.sleep(interval)
    finally:
        stop_inhibitor(inhibitor)
        write_json(state_path, state_payload("stopped", [], None))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Block sleep only while configured IDEs/agents are running.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    parser.add_argument("--state", default=str(DEFAULT_STATE))
    parser.add_argument("--interval", type=int, default=None)
    parser.add_argument("--once", action="store_true")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    config_path = Path(args.config)
    state_path = Path(args.state)
    if not config_path.exists():
        print(f"[awake-ides] Missing config: {config_path}", file=sys.stderr)
        return 2
    config = load_json(config_path)
    interval = int(args.interval or config.get("scan_interval_seconds", 30))
    if args.once:
        return command_once(config, state_path)
    return command_watch(config, state_path, interval)


if __name__ == "__main__":
    raise SystemExit(main())
