#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/.runtime"

SOCKET_PID_FILE="$RUNTIME_DIR/socket.pid"
WEB_PID_FILE="$RUNTIME_DIR/web.pid"

stop_from_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name: no hay PID file"
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if [[ -z "$pid" ]]; then
    rm -f "$pid_file"
    echo "$name: PID file vacio, limpiado"
    return
  fi

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    echo "$name detenido (PID $pid)"
  else
    echo "$name no estaba corriendo (PID $pid)"
  fi

  rm -f "$pid_file"
}

stop_from_pid_file "Socket" "$SOCKET_PID_FILE"
stop_from_pid_file "Web server" "$WEB_PID_FILE"
