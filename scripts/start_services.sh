#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/.runtime"
LOG_DIR="$PROJECT_ROOT/.logs"

SOCKET_SCRIPT="$PROJECT_ROOT/php/Sockets/server.php"
WEB_DOCROOT="$PROJECT_ROOT"

WEB_HOST="0.0.0.0"
WEB_PORT="777"

SOCKET_PID_FILE="$RUNTIME_DIR/socket.pid"
WEB_PID_FILE="$RUNTIME_DIR/web.pid"

mkdir -p "$RUNTIME_DIR" "$LOG_DIR"

if ! command -v php >/dev/null 2>&1; then
  echo "Error: php no esta instalado o no esta en PATH"
  exit 1
fi

if [[ ! -f "$SOCKET_SCRIPT" ]]; then
  echo "Error: no existe el socket server en $SOCKET_SCRIPT"
  exit 1
fi

is_running() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

start_socket() {
  if is_running "$SOCKET_PID_FILE"; then
    echo "Socket ya esta en ejecucion (PID $(cat "$SOCKET_PID_FILE"))"
  else
    nohup php "$SOCKET_SCRIPT" > "$LOG_DIR/socket.log" 2>&1 &
    echo $! > "$SOCKET_PID_FILE"
    echo "Socket iniciado (PID $(cat "$SOCKET_PID_FILE"))"
  fi
}

start_web() {
  if is_running "$WEB_PID_FILE"; then
    echo "Web server ya esta en ejecucion (PID $(cat "$WEB_PID_FILE"))"
  else
    nohup php -S "$WEB_HOST:$WEB_PORT" -t "$WEB_DOCROOT" > "$LOG_DIR/web.log" 2>&1 &
    echo $! > "$WEB_PID_FILE"
    echo "Web server iniciado en http://$WEB_HOST:$WEB_PORT (PID $(cat "$WEB_PID_FILE"))"
  fi
}

start_socket
start_web

echo "Servicios levantados."
echo "Logs: $LOG_DIR/socket.log y $LOG_DIR/web.log"
echo "Para detenerlos: $PROJECT_ROOT/scripts/stop_services.sh"
