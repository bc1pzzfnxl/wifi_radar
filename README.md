# WiFi Radar — Atheros AR9271 Presence Detection

<!-- shieldcn-start -->
### GitHub

![GitHub Stars](https://www.shieldcn.dev/github/stars/bc1pzzfnxl/wifi_radar.svg?variant=secondary&theme=emerald)
![GitHub Forks](https://www.shieldcn.dev/github/forks/bc1pzzfnxl/wifi_radar.svg?variant=secondary&theme=emerald)
![Watchers](https://www.shieldcn.dev/github/watchers/bc1pzzfnxl/wifi_radar.svg?variant=secondary&theme=emerald)
![Contributors](https://www.shieldcn.dev/github/contributors/bc1pzzfnxl/wifi_radar.svg?theme=emerald)
![Last commit](https://www.shieldcn.dev/github/last-commit/bc1pzzfnxl/wifi_radar.svg?variant=secondary&theme=emerald)
![Open issues](https://www.shieldcn.dev/github/open-issues/bc1pzzfnxl/wifi_radar.svg?variant=secondary&theme=emerald)
![License](https://www.shieldcn.dev/github/license/bc1pzzfnxl/wifi_radar.svg?variant=ghost&theme=emerald)
<!-- shieldcn-end -->

Active WiFi presence detection and radar map system centered on the Atheros AR9271 USB adapter (`ath9k_htc`), powered by continuous 802.11 frame injection and radiotap RSSI delta variance analysis, inspired by `ruvnet/RuView`.

---

## Architecture

- **Hardware**: Atheros AR9271 802.11b/g/n USB NIC (`ath9k_htc` driver) in monitor mode with raw frame injection.
- **Signal Engine (Python)**: Welford running variance, Exponential Moving Average (EMA) multipath background subtraction, and state machine (IDLE, STATIONARY_PRESENCE, MOTION_DETECTED, INTRUSION_ALERT).
- **Backend API**: FastAPI + WebSockets streaming real-time telemetry at 10 Hz (`ws://127.0.0.1:8000/ws/radar`).
- **Frontend**: AstroJS Single Page Application with React islands, styled with Tailwind CSS, managed with Bun.
- **Component Stack**: Inspired by Bearnie primitives (`bearnie.dev`), Evil Charts (`evilcharts.com`), motion-panels (`motion-panels.letstri.dev`), and Solaris/Canvas UI (`thecuvii/solaris`).

---

## Directory Structure

```
wifi_radar/
├── RuView_upstream/        # Upstream RuView reference codebase
├── plan-execution-ruview-ar9271.md # Technical execution plan
├── backend/                # Python signal processing and WebSocket API
│   ├── app/
│   │   ├── dsp.py          # Welford variance & presence detector
│   │   ├── engine.py       # Engine coordinator
│   │   ├── injector.py     # Scapy 802.11 frame injector
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Pydantic telemetry models
│   │   └── sniffer.py      # Radiotap sniffer
│   ├── requirements.txt
│   └── tests/
│       ├── test_api.py
│       └── test_dsp.py
├── frontend/               # AstroJS + React single page HUD
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── ControlsPanel.tsx
│       │   ├── RadarDashboard.tsx
│       │   ├── RadarScope.tsx
│       │   ├── SignalChart.tsx
│       │   ├── TargetList.tsx
│       │   └── ui/
│       ├── layouts/
│       └── pages/
│           └── index.astro
└── README.md
```

---

## Manual Execution Workflow (Zero Automated Scripts)

### Step 1: Configure Atheros AR9271 Monitor Mode

```bash
# Bring interface down
sudo ip link set wlan1 down

# Set type to monitor
sudo iw dev wlan1 set type monitor

# Bring interface up
sudo ip link set wlan1 up

# Set target 2.4 GHz channel (e.g. Channel 6)
sudo iw dev wlan1 set channel 6

# Verify monitor mode
iw dev wlan1 info
```

### Step 2: Launch Python Backend

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. sudo venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Launch AstroJS Frontend with Bun

```bash
cd frontend
bun run dev
```

Access the Radar Map HUD in browser at `http://localhost:4321`.

---

## Testing & Verification

```bash
# Backend unit tests (Welford variance, DSP state machine, API endpoints)
PYTHONPATH=backend backend/venv/bin/pytest backend/tests

# Frontend production build
cd frontend
bun run astro build
```
