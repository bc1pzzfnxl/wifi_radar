from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class PresenceState(str, Enum):
    IDLE = "IDLE"
    STATIONARY_PRESENCE = "STATIONARY_PRESENCE"
    MOTION_DETECTED = "MOTION_DETECTED"
    INTRUSION_ALERT = "INTRUSION_ALERT"

class DistanceZone(str, Enum):
    IMMEDIATE = "IMMEDIATE"
    NEAR = "NEAR"
    MID = "MID"
    FAR = "FAR"

class RadarTarget(BaseModel):
    id: str
    mac_masked: str
    rssi: float
    baseline_rssi: float
    delta_rssi: float
    variance: float
    state: PresenceState
    zone: DistanceZone
    confidence: float
    angle_deg: float
    distance_m: float
    last_seen: float

class RadarTelemetry(BaseModel):
    timestamp: float
    channel: int
    active_targets: List[RadarTarget]
    global_variance: float
    global_state: PresenceState
    environmental_noise: float
    packets_injected_per_sec: int
    packets_captured_per_sec: int
    motion_score: float
    last_error: Optional[str] = None

class RadarConfig(BaseModel):
    interface: str = "wlan1"
    channel: int = 6
    injection_rate: int = 20
    noise_threshold: float = 1.8
    motion_threshold: float = 4.5
    alert_threshold: float = 8.0
    window_size: int = 30
    ema_alpha: float = 0.05
    cooldown_seconds: float = 2.5
    simulate_rf: bool = False

class CalibrationStatus(BaseModel):
    in_progress: bool
    samples_collected: int
    target_samples: int
    calculated_baseline_variance: float
    calculated_noise_floor: float
    message: str
