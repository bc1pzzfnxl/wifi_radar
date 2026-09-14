# Execution Plan: Active WiFi Radar & Presence Detection (RuView Fork for Atheros AR9271)

## 1. Overview & Requirements Alignment

- **Hardware Centerpiece**: Atheros AR9271 USB WiFi adapter (`ath9k_htc` driver) utilizing raw 802.11 frame injection as an active RF illuminator combined with radiotap RSSI delta analysis.
- **Backend**: Pure Python (`scapy` for raw 802.11 frame generation and capture, `FastAPI` + WebSockets for real-time telemetry streaming).
- **Frontend**: Full React application (Next.js with Turbopack, Tailwind CSS, runtime & package manager: `Bun`).
- **UI Components**: Sourced directly from the curated Faved design and component registry:
  - **Bearnie** (`bearnie.dev`): Base component primitives and core UI tokens (`@bearnie/mcp`).
  - **Evil Charts** (`evilcharts.com`): Real-time RSSI signal charts, rolling variance waterfall, and threshold telemetry graphs.
  - **motion-panels** (`motion-panels.letstri.dev`): Resizable, draggable HUD layout (Radar Canvas, Telemetry Monitor, Target Logs, Sensitivity Controls).
  - **Solaris / Canvas UI** (`github.com/thecuvii/solaris`, `canvasui.dev`): Canvas/WebGL phosphor radar sweep, concentric range rings, and target blip pulse animations.
  - **beUI & Kinetics** (`beui.dev`, `kinetics.colorion.co`): Spring physics micro-interactions for target lock, alert badges, and range dials.
  - **Spectrum UI / shadcn/ui** (`ui.spectrumhq.in`, `ui.shadcn.com`): HUD indicators, status chips, drawer settings.
- **Workflow Principle**: **Zero automated scripts**. No opaque shell scripts (`setup.sh`, `start.sh`) or hidden background daemons. Every command is executed manually, step-by-step, with complete developer visibility and control.

---

## 2. Hardware & Signal Theory (Atheros AR9271)

### 2.1 The AR9271 Active Radar Concept
- **Why Active Injection?**
  - Passive sniffing relies on ambient traffic that is unpredictable in frequency and timing.
  - The AR9271 (`ath9k_htc`) has reliable frame injection capabilities. By continuously transmitting forged 802.11 frames (e.g., Probe Requests, Null Data frames) at fixed intervals (10–50 Hz), the transmitter acts as an active RF illuminator.
  - Reflected signals and immediate 802.11 ACKs / Probe Responses are captured via monitor mode. Physical presence and human movement within the Fresnel zone disturb multi-path reflections, creating measurable variance in RSSI and packet arrival jitter.

### 2.2 CSI vs. Radiotap RSSI
- **CSI Limitations on AR9271**: Standard CSI extraction tools (such as Xie's Linux 802.11n CSI tool cited by RuView) require PCIe Atheros chips (`ath9k` like AR9300/AR9580), not the USB `ath9k_htc` firmware.
- **Selected Detection Vector**: Active packet injection + radiotap RSSI sliding window variance ($\sigma^2_{RSSI}$) + background subtraction. This yields robust human presence detection, motion triggers, and approximate proximity zones without requiring unsupported CSI firmware modifications.

---

## 3. RuView Core Logic Extraction

Cloned locally in read-only mode to extract signal processing principles:

| Extracted Concept | Source in RuView | Implementation in Python Backend |
|---|---|---|
| Background Subtraction | `wifi_densepose/` | Exponential Moving Average (EMA) to filter static room multipath |
| Rolling Variance Filter | ADR #593 / #263 | Sliding window (N=20 to 50 samples) variance calculation ($\sigma^2$) |
| Debounce & Peak Detector | `cogs/intrusion/` | State machine with cooldown timer to prevent false positive flickering |
| Security Cog Logic | `cogs/perimeter-breach/` | Configurable thresholds for `IDLE`, `MOTION_DETECTED`, `PERSISTENT_PRESENCE` |
| Event Schema | RuView telemetry specs | Structured JSON payload over WebSocket |

*Discarded*: ESP32 firmware, CSI neural network encoders, 105 edge cogs, Matter/Home Assistant wrappers.

---

## 4. Target Architecture

```
+-------------------------------------------------------------+
|               Atheros AR9271 USB Adapter                     |
|           (ath9k_htc - Monitor Mode + Injection)             |
+-------------------------------------------------------------+
                               |
                               | Frame Injection / Radiotap Capture
                               v
+-------------------------------------------------------------+
|                 Backend: Python 3.12+                       |
|                                                             |
|  - Engine: Scapy / Raw Sockets                              |
|    * Controlled frame transmission (10-50 Hz)               |
|    * Radiotap parser (RSSI, MAC, Channel, Timestamp)        |
|  - DSP Pipeline:                                            |
|    * EMA Static Multi-path Filter                           |
|    * Sliding-Window Variance Calculator                     |
|    * Presence / Motion State Machine                        |
|  - API Layer: FastAPI + WebSockets                          |
|    * ws://localhost:8000/ws/radar                           |
|    * http://localhost:8000/api/config                       |
+-------------------------------------------------------------+
                               |
                               | Real-Time WebSocket JSON Stream
                               v
+-------------------------------------------------------------+
|              Frontend: React (Next.js + Turbopack)           |
|                     Runtime: Bun                            |
|                                                             |
|  - Layout: motion-panels (Resizable HUD panels)             |
|  - Radar Scope: Canvas/WebGL 2D circular sweep + blips      |
|  - Signal Telemetry: Evil Charts (Live RSSI & Variance)     |
|  - UI Primitives: Bearnie (@bearnie/mcp) + Spectrum UI      |
|  - Micro-Interactions: Kinetics & beUI spring physics       |
+-------------------------------------------------------------+
```

---

## 5. Phased Execution Steps (Manual Workflow Only)

### Phase 0: Manual Hardware Validation & Injection Spike
- **Objective**: Verify AR9271 monitor mode and raw packet injection using manual commands.
- **Manual Commands**:
  ```bash
  # 1. Identify wireless interface
  ip link show
  
  # 2. Put interface in monitor mode (replace wlan1 with target device)
  sudo ip link set wlan1 down
  sudo iw dev wlan1 set type monitor
  sudo ip link set wlan1 up
  
  # 3. Verify monitor mode active
  iw dev wlan1 info
  
  # 4. Test packet injection capability
  sudo aireplay-ng --test wlan1
  ```
- **Validation**: Confirm packet injection success rate (e.g. 30/30) and determine operating 2.4 GHz channel (e.g. Channel 1, 6, or 11).

---

### Phase 1: Event Specification & Detection Pipeline
- **Objective**: Define detection schema and statistical algorithms.
- **Telemetry Payload Schema** (`/ws/radar`):
  ```json
  {
    "timestamp": 1788537600.123,
    "channel": 6,
    "active_targets": [
      {
        "id": "target-01",
        "mac_masked": "XX:XX:XX:3A:9F",
        "rssi": -42,
        "variance": 4.82,
        "state": "MOTION_DETECTED",
        "estimated_zone": "NEAR",
        "confidence": 0.88
      }
    ],
    "environmental_noise": -88,
    "packets_injected_per_sec": 20
  }
  ```
- **Detection Algorithm**:
  - Raw RSSI Series: $r(t)$
  - Static Baseline EMA: $\mu(t) = \alpha \cdot r(t) + (1 - \alpha) \cdot \mu(t-1)$
  - Centered RSSI: $\Delta r(t) = r(t) - \mu(t)$
  - Moving Variance: $\sigma^2(t) = \frac{1}{N} \sum_{i=0}^{N-1} (\Delta r(t-i))^2$
  - State Determination:
    - $\sigma^2 < \theta_{noise}$ -> `IDLE`
    - $\theta_{noise} \le \sigma^2 < \theta_{motion}$ -> `STATIONARY_PRESENCE`
    - $\sigma^2 \ge \theta_{motion}$ -> `MOTION_DETECTED`

---

### Phase 2: Python Backend Development (FastAPI + Scapy)
- **Objective**: Build the manual injection loop, capture pipeline, and WebSocket server.
- **Structure**:
  ```
  backend/
  ├── main.py            # FastAPI application & WebSocket endpoint
  ├── injector.py        # Scapy raw frame transmission loop
  ├── sniffer.py         # Radiotap frame listener and RSSI extractor
  ├── processor.py       # Rolling variance & presence state machine
  └── config.py          # Adjustable parameters (channel, rate, thresholds)
  ```
- **Manual Launch Commands**:
  ```bash
  cd /home/bc1pzzfnxl/Documents/project/wifi_radar/backend
  python3 -m venv venv
  source venv/bin/activate
  pip install fastapi uvicorn scapy websockets
  sudo venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```

---

### Phase 3: React Frontend Development (Next.js + Faved Components)
- **Objective**: Build the radar interface using components from the Faved list.
- **Setup with Bun**:
  ```bash
  cd /home/bc1pzzfnxl/Documents/project/wifi_radar
  bun create next-app frontend --typescript --tailwind --app --turbopack
  cd frontend
  bun add lucide-react framer-motion clsx tailwind-merge
  ```
- **Components Integration**:
  - `components/layout/RadarHudLayout.tsx`: Built with `motion-panels` for resizable dockable layout.
  - `components/radar/RadarScope.tsx`: Custom HTML5 Canvas / WebGL radar sweep with concentric range rings, rotating beam, and faded phosphor persistence (inspired by Solaris).
  - `components/telemetry/SignalGraph.tsx`: Built with `Evil Charts` (Recharts-based) displaying real-time RSSI signal line and variance fill area.
  - `components/controls/SensitivityControls.tsx`: Sliders and toggles built with `Bearnie` primitives and `DialKit` principles.
  - `components/status/TargetCard.tsx`: Reactive target cards with `beUI`/`Kinetics` spring animations on detection.
- **Manual Launch Command**:
  ```bash
  cd /home/bc1pzzfnxl/Documents/project/wifi_radar/frontend
  bun run dev
  ```

---

### Phase 4: Manual Calibration & Verification
- **Objective**: Calibrate noise floor and variance thresholds in real room conditions.
- **Procedure**:
  1. Set baseline in empty room: observe baseline variance ($\theta_{noise}$).
  2. Walk into room: observe variance peak ($\theta_{motion}$).
  3. Stand still: observe stationary breathing/micro-movement variance ($\theta_{presence}$).
  4. Adjust threshold dials via UI without restarting services.

---

### Phase 5: Documentation & Attribution
- **Objective**: Finalize documentation and licenses.
- Document hardware specifics (`ath9k_htc` firmware requirements, USB power considerations).
- Credit `ruvnet/RuView` (MIT License) for signal processing patterns.
- Produce `README.md` following standard conventions (`npx shieldcn-cli`).

---

## 6. Manual Execution Quick Reference

```bash
# Terminal 1 - Network Interface Setup
sudo ip link set wlan1 down
sudo iw dev wlan1 set type monitor
sudo ip link set wlan1 up
sudo iw dev wlan1 set channel 6

# Terminal 2 - Python Backend
cd /home/bc1pzzfnxl/Documents/project/wifi_radar/backend
source venv/bin/activate
sudo venv/bin/python main.py

# Terminal 3 - React Frontend
cd /home/bc1pzzfnxl/Documents/project/wifi_radar/frontend
bun run dev
```
