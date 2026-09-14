import type { RadarTarget, RadarConfig, RadarTelemetry } from '../../types/radar';

export const mockConfig: RadarConfig = {
  interface: 'wlan1',
  channel: 6,
  injection_rate: 20,
  noise_threshold: 1.8,
  motion_threshold: 4.5,
  alert_threshold: 8.0,
  window_size: 30,
  ema_alpha: 0.05,
  cooldown_seconds: 2.5
};

export const mockTargets: RadarTarget[] = [
  {
    id: 'tgt_5884',
    mac_masked: 'E4:5F:01:XX:XX:44',
    rssi: -52.4,
    baseline_rssi: -48.0,
    delta_rssi: -4.4,
    variance: 8.92,
    state: 'INTRUSION_ALERT',
    zone: 'NEAR',
    confidence: 0.94,
    angle_deg: 24,
    distance_m: 3.2,
    last_seen: 1789394900
  },
  {
    id: 'tgt_7353',
    mac_masked: '70:FC:8F:XX:XX:F3',
    rssi: -71.2,
    baseline_rssi: -71.0,
    delta_rssi: -0.2,
    variance: 5.14,
    state: 'MOTION_DETECTED',
    zone: 'MID',
    confidence: 0.88,
    angle_deg: 138,
    distance_m: 7.8,
    last_seen: 1789394902
  },
  {
    id: 'tgt_2816',
    mac_masked: '60:45:E8:XX:XX:D9',
    rssi: -64.8,
    baseline_rssi: -65.0,
    delta_rssi: 0.2,
    variance: 0.84,
    state: 'STATIONARY_PRESENCE',
    zone: 'MID',
    confidence: 0.91,
    angle_deg: 215,
    distance_m: 6.4,
    last_seen: 1789394903
  },
  {
    id: 'tgt_9848',
    mac_masked: '3C:22:FB:XX:XX:AA',
    rssi: -84.1,
    baseline_rssi: -84.0,
    delta_rssi: -0.1,
    variance: 0.18,
    state: 'IDLE',
    zone: 'FAR',
    confidence: 0.76,
    angle_deg: 310,
    distance_m: 13.5,
    last_seen: 1789394904
  }
];

export const mockTelemetry: RadarTelemetry = {
  timestamp: 1789394905.2,
  channel: 6,
  active_targets: mockTargets,
  global_variance: 5.42,
  global_state: 'INTRUSION_ALERT',
  environmental_noise: -89.4,
  packets_injected_per_sec: 20,
  packets_captured_per_sec: 58,
  motion_score: 0.82,
  last_error: null
};

export const mockHistory = [
  { time: 1, rssi: -55.1, variance: 1.2 },
  { time: 2, rssi: -54.8, variance: 1.4 },
  { time: 3, rssi: -56.0, variance: 1.6 },
  { time: 4, rssi: -55.2, variance: 2.1 },
  { time: 5, rssi: -58.4, variance: 4.8 },
  { time: 6, rssi: -62.1, variance: 7.9 },
  { time: 7, rssi: -59.5, variance: 8.9 },
  { time: 8, rssi: -54.0, variance: 6.2 },
  { time: 9, rssi: -52.8, variance: 5.1 },
  { time: 10, rssi: -53.2, variance: 3.4 }
];
