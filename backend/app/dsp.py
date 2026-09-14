import math
import time
from collections import deque
from typing import Dict, List, Tuple
from .models import PresenceState, DistanceZone, RadarTarget, RadarConfig

class WelfordStats:
    def __init__(self):
        self.count = 0
        self.mean = 0.0
        self.m2 = 0.0

    def update(self, value: float):
        self.count += 1
        delta = value - self.mean
        self.mean += delta / self.count
        delta2 = value - self.mean
        self.m2 += delta * delta2

    @property
    def variance(self) -> float:
        if self.count < 2:
            return 0.0
        return self.m2 / (self.count - 1)

    def reset(self):
        self.count = 0
        self.mean = 0.0
        self.m2 = 0.0

class ExponentialMovingAverage:
    def __init__(self, alpha: float = 0.05):
        self.alpha = alpha
        self.value = None

    def update(self, sample: float) -> float:
        if self.value is None:
            self.value = sample
        else:
            self.value = self.alpha * sample + (1.0 - self.alpha) * self.value
        return self.value

    def reset(self):
        self.value = None

class RollingWindowStats:
    def __init__(self, maxlen: int = 30):
        self.samples = deque(maxlen=maxlen)

    def update(self, value: float):
        self.samples.append(value)

    @property
    def variance(self) -> float:
        if len(self.samples) < 3:
            return 0.0
        mean = sum(self.samples) / len(self.samples)
        return sum((x - mean) ** 2 for x in self.samples) / (len(self.samples) - 1)

    def reset(self):
        self.samples.clear()

class TargetTracker:
    def __init__(self, target_id: str, mac_masked: str, config: RadarConfig):
        self.target_id = target_id
        self.mac_masked = mac_masked
        self.config = config
        self.history = deque(maxlen=config.window_size)
        self.ema = ExponentialMovingAverage(alpha=config.ema_alpha)
        self.stats = RollingWindowStats(maxlen=config.window_size)
        self.welford = self.stats
        self.state = PresenceState.IDLE
        self.last_state_change = time.time()
        self.last_seen = time.time()
        self.fixed_angle = (hash(target_id) % 360 + 360) % 360

    def add_sample(self, rssi: float) -> RadarTarget:
        now = time.time()
        self.last_seen = now
        self.history.append(rssi)
        
        baseline = self.ema.update(rssi)
        delta = rssi - baseline
        
        self.stats.update(delta)
        variance = self.stats.variance

        if variance > self.config.alert_threshold:
            candidate_state = PresenceState.INTRUSION_ALERT
        elif variance > self.config.motion_threshold:
            candidate_state = PresenceState.MOTION_DETECTED
        elif variance > self.config.noise_threshold:
            candidate_state = PresenceState.STATIONARY_PRESENCE
        else:
            candidate_state = PresenceState.IDLE

        if candidate_state != self.state:
            if candidate_state.value > self.state.value or (now - self.last_state_change) >= self.config.cooldown_seconds:
                self.state = candidate_state
                self.last_state_change = now

        distance = self._estimate_distance(rssi)
        zone = self._estimate_zone(distance)
        confidence = min(1.0, max(0.2, variance / (self.config.motion_threshold + 0.001)))

        return RadarTarget(
            id=self.target_id,
            mac_masked=self.mac_masked,
            rssi=round(rssi, 1),
            baseline_rssi=round(baseline, 1),
            delta_rssi=round(delta, 2),
            variance=round(variance, 3),
            state=self.state,
            zone=zone,
            confidence=round(confidence, 2),
            angle_deg=float(self.fixed_angle),
            distance_m=round(distance, 2),
            last_seen=self.last_seen
        )

    def _estimate_distance(self, rssi: float) -> float:
        tx_power_1m = -40.0
        path_loss_exponent = 2.5
        exponent = (tx_power_1m - rssi) / (10.0 * path_loss_exponent)
        dist = math.pow(10.0, exponent)
        return max(0.5, min(15.0, dist))

    def _estimate_zone(self, distance: float) -> DistanceZone:
        if distance < 2.0:
            return DistanceZone.IMMEDIATE
        elif distance < 5.0:
            return DistanceZone.NEAR
        elif distance < 10.0:
            return DistanceZone.MID
        return DistanceZone.FAR

class SignalProcessor:
    def __init__(self, config: RadarConfig):
        self.config = config
        self.trackers: Dict[str, TargetTracker] = {}
        self.global_welford = WelfordStats()
        self.calibration_baseline = 0.0

    @property
    def global_variance(self) -> float:
        active_vars = [t.stats.variance for t in self.trackers.values() if t.history and t.history[-1] > -82]
        if not active_vars:
            return 0.0
        return sum(active_vars) / len(active_vars)

    def process_packet(self, mac: str, rssi: float) -> Tuple[RadarTarget, float, PresenceState]:
        masked_mac = self._mask_mac(mac)
        target_id = f"tgt_{abs(hash(mac)) % 10000:04d}"

        if target_id not in self.trackers:
            self.trackers[target_id] = TargetTracker(target_id, masked_mac, self.config)

        tracker = self.trackers[target_id]
        target = tracker.add_sample(rssi)

        global_var = self.global_variance

        highest_state = PresenceState.IDLE
        for t in self.trackers.values():
            if t.state == PresenceState.INTRUSION_ALERT:
                highest_state = PresenceState.INTRUSION_ALERT
                break
            elif t.state == PresenceState.MOTION_DETECTED:
                highest_state = PresenceState.MOTION_DETECTED
            elif t.state == PresenceState.STATIONARY_PRESENCE and highest_state == PresenceState.IDLE:
                highest_state = PresenceState.STATIONARY_PRESENCE

        return target, global_var, highest_state

    def prune_stale_targets(self, timeout_seconds: float = 12.0) -> List[RadarTarget]:
        now = time.time()
        active = []
        to_delete = []
        for tid, tracker in self.trackers.items():
            if now - tracker.last_seen > timeout_seconds:
                to_delete.append(tid)
            else:
                current_dist = tracker._estimate_distance(tracker.history[-1] if tracker.history else -60.0)
                active.append(RadarTarget(
                    id=tracker.target_id,
                    mac_masked=tracker.mac_masked,
                    rssi=round(tracker.history[-1], 1) if tracker.history else -60.0,
                    baseline_rssi=round(tracker.ema.value or -60.0, 1),
                    delta_rssi=round((tracker.history[-1] - tracker.ema.value) if (tracker.history and tracker.ema.value) else 0.0, 2),
                    variance=round(tracker.stats.variance, 3),
                    state=tracker.state,
                    zone=tracker._estimate_zone(current_dist),
                    confidence=0.5,
                    angle_deg=float(tracker.fixed_angle),
                    distance_m=round(current_dist, 2),
                    last_seen=tracker.last_seen
                ))
        for tid in to_delete:
            del self.trackers[tid]
        return active

    def calculate_motion_score(self) -> float:
        if not self.trackers:
            return 0.0
        variances = [t.stats.variance for t in self.trackers.values()]
        max_var = max(variances) if variances else 0.0
        return min(1.0, max_var / self.config.alert_threshold)

    def _mask_mac(self, mac: str) -> str:
        parts = mac.upper().split(":")
        if len(parts) == 6:
            return f"{parts[0]}:{parts[1]}:{parts[2]}:XX:XX:{parts[5]}"
        return "XX:XX:XX:XX:XX:XX"
