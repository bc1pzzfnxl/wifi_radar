#!/usr/bin/env bash

set -e

IFACE="${1:-wlan1}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"

if [ "$EUID" -ne 0 ]; then
  exec sudo bash "$0" "$@"
fi

fuser -k 8000/tcp 2>/dev/null || true
fuser -k 4321/tcp 2>/dev/null || true

if ip link show "$IFACE" >/dev/null 2>&1; then
  ip link set "$IFACE" down
  iw dev "$IFACE" set type monitor
  ip link set "$IFACE" up
  iw dev "$IFACE" set channel 6
fi

cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
  python3 -m venv venv
  ./venv/bin/pip install -r requirements.txt
fi

export PYTHONPATH="$BACKEND_DIR"
./venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cleanup() {
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

cd "$FRONTEND_DIR"

RUN_USER="${SUDO_USER:-$USER}"
USER_HOME=$(eval echo "~$RUN_USER")
BUN_BIN=""

if [ -x "$USER_HOME/.bun/bin/bun" ]; then
  BUN_BIN="$USER_HOME/.bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  BUN_BIN="$(command -v bun)"
elif [ -x "/home/bc1pzzfnxl/.bun/bin/bun" ]; then
  BUN_BIN="/home/bc1pzzfnxl/.bun/bin/bun"
fi

BUN_DIR="$(dirname "$BUN_BIN")"

if [ ! -d "node_modules" ]; then
  if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
    sudo -u "$SUDO_USER" env "PATH=$PATH:$BUN_DIR" "$BUN_BIN" install
  else
    env "PATH=$PATH:$BUN_DIR" "$BUN_BIN" install
  fi
fi

if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
  sudo -u "$SUDO_USER" env "PATH=$PATH:$BUN_DIR" "$BUN_BIN" run dev &
  FRONTEND_PID=$!
else
  env "PATH=$PATH:$BUN_DIR" "$BUN_BIN" run dev &
  FRONTEND_PID=$!
fi

wait
