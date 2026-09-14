import time
import random
import os
import asyncio
from typing import List, Optional
from .models import RadarConfig, RadarTelemetry, PresenceState, CalibrationStatus
from .dsp import SignalProcessor
from .injector import FrameInjector
from .sniffer import PacketSniffer

class RadarEngine:
    def __init__(self, config: Optional[RadarConfig] = None):
        self.config = config or RadarConfig()
        self.dsp = SignalProcessor(self.config)
        self.injector = FrameInjector(self.config)
        self.sniffer = PacketSniffer(self.config, self._on_packet)
        self.running = False
        self.calibrating = False
        self.calib_samples = []
        self.calib_target = 50
        self.calib_start = 0.0

    def _interface_exists(self) -> bool:
        return os.path.exists(f"/sys/class/net/{self.config.interface}")

    def start(self):
        if self.running:
            return
        self.running = True
        if not self._interface_exists():
            self.injector.last_error = f"Hardware interface '{self.config.interface}' not found."
            return
        self.injector.start()
        self.sniffer.start()

    def stop(self):
        self.running = False
        self.injector.stop()
        self.sniffer.stop()

    def update_config(self, new_config: RadarConfig):
        restart_needed = (
            new_config.interface != self.config.interface
            or new_config.injection_rate != self.config.injection_rate
        )
        self.config = new_config
        self.dsp.config = new_config
        self.injector.config = new_config
        self.sniffer.config = new_config

        if restart_needed and self.running:
            self.stop()
            self.start()

    def _on_packet(self, mac: str, rssi: float):
        target, _, _ = self.dsp.process_packet(mac, rssi)
        if self.calibrating:
            if not self.config.filter_out_of_bounds or target.distance_m <= self.config.max_range_m:
                self.calib_samples.append(target.delta_rssi)
                if len(self.calib_samples) >= self.calib_target:
                    self._finish_calibration()

    def trigger_calibration(self, target_samples: int = 40):
        self.calibrating = True
        self.calib_target = target_samples
        self.calib_samples = []
        self.calib_start = time.time()

    def _finish_calibration(self):
        self.calibrating = False
        if not self.calib_samples or len(self.calib_samples) < 5:
            self.config.noise_threshold = 1.8
            self.config.motion_threshold = 4.5
            self.config.alert_threshold = 8.0
            self.dsp.config = self.config
            return
        avg = sum(self.calib_samples) / len(self.calib_samples)
        variance = sum((x - avg) ** 2 for x in self.calib_samples) / max(1, len(self.calib_samples) - 1)
        base_noise = max(0.8, min(10.0, variance))
        self.config.noise_threshold = round(base_noise * 1.5, 2)
        self.config.motion_threshold = round(self.config.noise_threshold * 2.4, 2)
        self.config.alert_threshold = round(self.config.noise_threshold * 4.2, 2)
        self.dsp.config = self.config

    def get_calibration_status(self) -> CalibrationStatus:
        if self.calibrating and (time.time() - self.calib_start > 8.0):
            self._finish_calibration()
        return CalibrationStatus(
            in_progress=self.calibrating,
            samples_collected=len(self.calib_samples),
            target_samples=self.calib_target,
            calculated_baseline_variance=self.config.noise_threshold,
            calculated_noise_floor=-88.0,
            message="Calibration complete" if not self.calibrating and self.calib_samples else ("Calibrating..." if self.calibrating else "Idle")
        )

    def generate_telemetry_frame(self) -> RadarTelemetry:
        now = time.time()
        active_targets = self.dsp.prune_stale_targets()
        global_var = self.dsp.global_variance
        motion_score = self.dsp.calculate_motion_score()

        highest_state = PresenceState.IDLE
        for t in active_targets:
            if t.state == PresenceState.INTRUSION_ALERT:
                highest_state = PresenceState.INTRUSION_ALERT
                break
            elif t.state == PresenceState.MOTION_DETECTED:
                highest_state = PresenceState.MOTION_DETECTED
            elif t.state == PresenceState.STATIONARY_PRESENCE and highest_state == PresenceState.IDLE:
                highest_state = PresenceState.STATIONARY_PRESENCE

        error_msg = self.injector.last_error or self.sniffer.last_error

        return RadarTelemetry(
            timestamp=round(now, 3),
            channel=self.config.channel,
            active_targets=active_targets,
            global_variance=round(global_var, 3),
            global_state=highest_state,
            environmental_noise=-88.0 + random.uniform(-1.5, 1.5),
            packets_injected_per_sec=self.injector.current_rate,
            packets_captured_per_sec=self.sniffer.capture_rate,
            motion_score=round(motion_score, 3),
            last_error=error_msg
        )
