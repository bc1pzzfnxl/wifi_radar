import pytest
from app.dsp import WelfordStats, ExponentialMovingAverage, SignalProcessor
from app.models import RadarConfig, PresenceState

def test_welford_variance_empty():
    w = WelfordStats()
    assert w.variance == 0.0

def test_welford_variance_constant():
    w = WelfordStats()
    for _ in range(10):
        w.update(5.0)
    assert w.variance == 0.0

def test_welford_variance_known_series():
    w = WelfordStats()
    samples = [10.0, 12.0, 23.0, 23.0, 16.0, 23.0, 21.0, 16.0]
    for s in samples:
        w.update(s)
    assert round(w.mean, 2) == 18.0
    assert round(w.variance, 2) == 27.43

def test_ema_update():
    ema = ExponentialMovingAverage(alpha=0.5)
    assert ema.update(10.0) == 10.0
    assert ema.update(20.0) == 15.0

def test_signal_processor_state_machine():
    cfg = RadarConfig(noise_threshold=1.0, motion_threshold=3.0, alert_threshold=6.0, cooldown_seconds=0.0)
    proc = SignalProcessor(cfg)
    mac = "aa:bb:cc:dd:ee:ff"
    
    for _ in range(5):
        target, gvar, state = proc.process_packet(mac, -50.0)
    assert target.state == PresenceState.IDLE

    target, gvar, state = proc.process_packet(mac, -30.0)
    target, gvar, state = proc.process_packet(mac, -70.0)
    target, gvar, state = proc.process_packet(mac, -20.0)
    assert target.variance > 1.0
    assert target.state in [PresenceState.STATIONARY_PRESENCE, PresenceState.MOTION_DETECTED, PresenceState.INTRUSION_ALERT]
