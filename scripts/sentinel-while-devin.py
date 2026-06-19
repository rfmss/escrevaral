#!/usr/bin/env python3
"""
Start Agent Sentinel while Devin Desktop is open, and stop it when Devin closes.

This is the always-on lightweight watcher. The visual sentinel itself only runs
while a configured Devin process is present.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / ".agents" / "sentinel-auto" / "config.json"
DEFAULT_STATE = ROOT / ".agents" / "sentinel-auto" / "state.json"


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


def run(args: list[str], timeout: int = 20) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=str(ROOT),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )


def list_processes() -> list[dict[str, str]]:
    result = run(["ps", "-eo", "pid=,comm=,args="], timeout=10)
    if result.returncode != 0:
        return []
    processes: list[dict[str, str]] = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 2)
        if len(parts) < 2:
            continue
        processes.append(
            {
                "pid": parts[0],
                "comm": parts[1],
                "args": parts[2] if len(parts) > 2 else parts[1],
            }
        )
    return processes


def find_devin_matches(config: dict[str, Any]) -> list[dict[str, str]]:
    patterns = [re.compile(pattern, re.IGNORECASE) for pattern in config.get("process_patterns", [])]
    own_pid = str(os.getpid())
    matches: list[dict[str, str]] = []
    for proc in list_processes():
        if proc["pid"] == own_pid:
            continue
        haystack = f"{proc['comm']} {proc['args']}"
        for pattern in patterns:
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


def sentinel_running() -> bool:
    result = run(["scripts/agent-sentinel-daemon.sh", "status"], timeout=10)
    return result.returncode == 0 and "running" in result.stdout.casefold()


def start_sentinel(config: dict[str, Any]) -> subprocess.CompletedProcess[str]:
    args = ["scripts/agent-sentinel-daemon.sh", "start"]
    args.extend(str(arg) for arg in config.get("sentinel_args", []))
    return run(args, timeout=20)


def stop_sentinel() -> subprocess.CompletedProcess[str]:
    return run(["scripts/agent-sentinel-daemon.sh", "stop"], timeout=20)


def state_payload(
    status: str,
    matches: list[dict[str, str]],
    sentinel_is_running: bool,
    action: str | None = None,
    action_result: subprocess.CompletedProcess[str] | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "status": status,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "sentinel_running": sentinel_is_running,
        "match_count": len(matches),
        "matches": matches[:20],
    }
    if action:
        payload["last_action"] = action
    if action_result:
        payload["last_action_returncode"] = action_result.returncode
        payload["last_action_stdout"] = action_result.stdout.strip()[-1000:]
        payload["last_action_stderr"] = action_result.stderr.strip()[-1000:]
    return payload


def reconcile(config: dict[str, Any], state_path: Path, *, force_no_grace: bool = False) -> bool:
    matches = find_devin_matches(config)
    active = bool(matches)
    running = sentinel_running()
    action = None
    action_result = None

    if active and not running:
        action = "start_sentinel"
        action_result = start_sentinel(config)
        running = sentinel_running()
    elif not active and running and force_no_grace:
        action = "stop_sentinel"
        action_result = stop_sentinel()
        running = sentinel_running()

    status = "devin_active" if active else "devin_closed"
    if running:
        status += "_sentinel_running"
    else:
        status += "_sentinel_stopped"
    write_json(state_path, state_payload(status, matches, running, action, action_result))
    return active


def command_once(config: dict[str, Any], state_path: Path) -> int:
    active = reconcile(config, state_path, force_no_grace=True)
    print(f"[sentinel-auto] {'devin active' if active else 'devin closed'}")
    return 0 if active else 1


def command_watch(config: dict[str, Any], state_path: Path, interval: int) -> int:
    stopping = False
    last_seen_active = 0.0
    idle_grace = int(config.get("idle_grace_seconds", 20))

    def handle_stop(_signum: int, _frame: Any) -> None:
        nonlocal stopping
        stopping = True

    signal.signal(signal.SIGTERM, handle_stop)
    signal.signal(signal.SIGINT, handle_stop)

    print("[sentinel-auto] Watching Devin; Agent Sentinel follows Devin lifecycle.", flush=True)

    try:
        while not stopping:
            matches = find_devin_matches(config)
            active = bool(matches)
            running = sentinel_running()
            action = None
            action_result = None

            if active:
                last_seen_active = time.time()
                if not running:
                    action = "start_sentinel"
                    action_result = start_sentinel(config)
                    running = sentinel_running()
                    print("[sentinel-auto] Devin detected; Agent Sentinel started.", flush=True)
            elif running and time.time() - last_seen_active >= idle_grace:
                action = "stop_sentinel"
                action_result = stop_sentinel()
                running = sentinel_running()
                print("[sentinel-auto] Devin closed; Agent Sentinel stopped.", flush=True)

            status = "devin_active" if active else "devin_closed"
            status += "_sentinel_running" if running else "_sentinel_stopped"
            write_json(state_path, state_payload(status, matches, running, action, action_result))
            time.sleep(interval)
    finally:
        if config.get("stop_sentinel_on_exit", True):
            stop_sentinel()
        write_json(state_path, state_payload("watcher_stopped", [], sentinel_running(), "watcher_exit"))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Start/stop Agent Sentinel with Devin Desktop.")
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
        print(f"[sentinel-auto] Missing config: {config_path}", file=sys.stderr)
        return 2
    config = load_json(config_path)
    interval = int(args.interval or config.get("scan_interval_seconds", 8))
    if args.once:
        return command_once(config, state_path)
    return command_watch(config, state_path, interval)


if __name__ == "__main__":
    raise SystemExit(main())
