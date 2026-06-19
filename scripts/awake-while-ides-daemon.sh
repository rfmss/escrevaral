#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

pid_file=".agents/awake-ides/awake-while-ides.pid"
log_file=".agents/awake-ides/awake-while-ides.log"
tmux_session="${AWAKE_IDES_TMUX_SESSION:-awake-while-ides}"

mkdir -p ".agents/awake-ides"

tmux_running() {
  command -v tmux >/dev/null 2>&1 || return 1
  tmux has-session -t "$tmux_session" 2>/dev/null
}

is_running() {
  tmux_running && return 0
  [[ -f "$pid_file" ]] || return 1
  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" 2>/dev/null
}

case "${1:-status}" in
  start)
    shift || true
    if is_running; then
      if tmux_running; then
        echo "awake-while-ides already running in tmux: $tmux_session"
      else
        echo "awake-while-ides already running: $(cat "$pid_file")"
      fi
      exit 0
    fi
    if command -v tmux >/dev/null 2>&1; then
      cmd="cd $(printf '%q' "$PWD"); exec env PYTHONUNBUFFERED=1 scripts/awake-while-ides.sh"
      for arg in "$@"; do
        cmd+=" $(printf '%q' "$arg")"
      done
      cmd+=" >> $(printf '%q' "$log_file") 2>&1"
      tmux new-session -d -s "$tmux_session" "$cmd"
      echo "tmux:$tmux_session" > "$pid_file"
      echo "awake-while-ides started in tmux: $tmux_session"
    else
      nohup env PYTHONUNBUFFERED=1 scripts/awake-while-ides.sh "$@" >> "$log_file" 2>&1 < /dev/null &
      echo "$!" > "$pid_file"
      echo "awake-while-ides started: $(cat "$pid_file")"
    fi
    echo "log: $log_file"
    ;;
  stop)
    if ! is_running; then
      echo "awake-while-ides is not running"
      rm -f "$pid_file"
      exit 0
    fi
    if tmux_running; then
      tmux kill-session -t "$tmux_session"
    else
      kill "$(cat "$pid_file")"
    fi
    rm -f "$pid_file"
    echo "awake-while-ides stopped"
    ;;
  restart)
    "$0" stop
    shift || true
    "$0" start "$@"
    ;;
  status)
    if is_running; then
      if tmux_running; then
        echo "awake-while-ides running in tmux: $tmux_session"
      else
        echo "awake-while-ides running: $(cat "$pid_file")"
      fi
    else
      echo "awake-while-ides stopped"
      rm -f "$pid_file"
    fi
    ;;
  once)
    shift || true
    scripts/awake-while-ides.sh --once "$@"
    ;;
  log)
    touch "$log_file"
    tail -f "$log_file"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|once|log} [awake-while-ides args...]"
    echo "Example: $0 start --interval 30"
    exit 2
    ;;
esac
