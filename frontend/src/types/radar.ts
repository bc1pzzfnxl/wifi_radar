export type PresenceState = 'IDLE' | 'STATIONARY_PRESENCE' | 'MOTION_DETECTED' | 'INTRUSION_ALERT';

export type DistanceZone = 'IMMEDIATE' | 'NEAR' | 'MID' | 'FAR';

export interface RadarTarget {
  id: string;
  mac_masked: string;
  rssi: number;
  baseline_rssi: number;
  delta_rssi: number;
  variance: number;
  state: PresenceState;
  zone: DistanceZone;
  confidence: number;
  angle_deg: number;
  distance_m: number;
  last_seen: number;
}

export interface RadarTelemetry {
  timestamp: number;
  channel: number;
  active_targets: RadarTarget[];
  global_variance: number;
  global_state: PresenceState;
  environmental_noise: number;
  packets_injected_per_sec: number;
  packets_captured_per_sec: number;
  motion_score: number;
  last_error?: string | null;
}

export interface RadarConfig {
  interface: string;
  channel: number;
  injection_rate: number;
  noise_threshold: number;
  motion_threshold: number;
  alert_threshold: number;
  window_size: number;
  ema_alpha: number;
  cooldown_seconds: number;
}

export interface CalibrationStatus {
  in_progress: boolean;
  samples_collected: number;
  target_samples: number;
  calculated_baseline_variance: number;
  calculated_noise_floor: number;
  message: string;
}
