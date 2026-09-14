import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { RadarTelemetry, RadarConfig, CalibrationStatus } from '../types/radar';
import { RadarScope } from './RadarScope';
import { SignalChart } from './SignalChart';
import { TargetList } from './TargetList';
import { ControlsPanel } from './ControlsPanel';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Radio, Activity, AlertCircle, Cpu } from 'lucide-react';

export const RadarDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<RadarTelemetry | null>(null);
  const [config, setConfig] = useState<RadarConfig>({
    interface: 'wlan1',
    channel: 6,
    injection_rate: 20,
    noise_threshold: 1.8,
    motion_threshold: 4.5,
    alert_threshold: 8.0,
    window_size: 30,
    ema_alpha: 0.05,
    cooldown_seconds: 2.5,
    max_range_m: 6.0,
    filter_out_of_bounds: true
  });
  const [calibration, setCalibration] = useState<CalibrationStatus | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ time: number; rssi: number; variance: number }>>([]);

  const wsRef = useRef<WebSocket | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {}
  }, []);

  const handleUpdateConfig = async (newCfg: Partial<RadarConfig>) => {
    const updated = { ...config, ...newCfg };
    setConfig(updated);
    try {
      await fetch('http://127.0.0.1:8000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleTriggerCalibration = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/calibrate', { method: 'POST' });
      const res = await fetch('http://127.0.0.1:8000/api/calibrate/status');
      if (res.ok) {
        setCalibration(await res.json());
      }
    } catch {}
  };

  useEffect(() => {
    fetchConfig();
    let isMounted = true;

    const connectWs = () => {
      const socket = new WebSocket('ws://127.0.0.1:8000/ws/radar');
      wsRef.current = socket;

      socket.onopen = () => {
        if (isMounted) setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data: RadarTelemetry = JSON.parse(event.data);
          if (isMounted) {
            setTelemetry(data);
            const activeRssi = data.active_targets.length > 0 ? data.active_targets[0].rssi : -75;
            setHistory((prev) => {
              const next = [...prev, { time: data.timestamp, rssi: activeRssi, variance: data.global_variance }];
              return next.length > 50 ? next.slice(next.length - 50) : next;
            });
          }
        } catch {}
      };

      socket.onclose = () => {
        if (isMounted) {
          setConnected(false);
          setTimeout(connectWs, 2000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWs();

    const calibInterval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/calibrate/status');
        if (res.ok && isMounted) {
          const st = await res.json();
          setCalibration(st);
        }
      } catch {}
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(calibInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchConfig]);

  const getGlobalBadge = (state?: string) => {
    switch (state) {
      case 'INTRUSION_ALERT':
        return <Badge variant="danger">Intrusion Detected</Badge>;
      case 'MOTION_DETECTED':
        return <Badge variant="warning">Motion in Zone</Badge>;
      case 'STATIONARY_PRESENCE':
        return <Badge variant="neutral">Presence Confirmed</Badge>;
      default:
        return <Badge variant="default">Zone Secure (Idle)</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f8fafc] text-zinc-950 font-sans overflow-hidden">
      <header className="flex items-center justify-between px-8 py-3.5 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-bold text-xs uppercase tracking-widest text-zinc-950">
              WiFi Radar
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-zinc-400 border-l border-zinc-200 pl-3">
            AR9271 · ath9k_htc
          </span>
          <div className="pl-1">
            <Badge variant={connected ? 'success' : 'danger'}>
              {connected ? 'LIVE' : 'CONNECTING'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">STATUS:</span>
            {getGlobalBadge(telemetry?.global_state)}
          </div>
          <div className="flex items-center gap-4 border-l border-zinc-200 pl-4 text-xs font-mono">
            <div>
              <span className="text-zinc-400">TX: </span>
              <span className="font-bold text-zinc-950">{telemetry?.packets_injected_per_sec || 0}</span>
              <span className="text-zinc-400 text-[10px]"> pkt/s</span>
            </div>
            <div>
              <span className="text-zinc-400">RX: </span>
              <span className="font-bold text-zinc-950">{telemetry?.packets_captured_per_sec || 0}</span>
              <span className="text-zinc-400 text-[10px]"> pkt/s</span>
            </div>
            <div>
              <span className="text-zinc-400">CH: </span>
              <span className="font-bold text-zinc-950">{telemetry?.channel || config.channel}</span>
            </div>
          </div>
        </div>
      </header>

      {telemetry?.last_error && (
        <div className="bg-rose-50/90 backdrop-blur-md border-b border-rose-200 px-8 py-2 flex items-center justify-between text-xs text-rose-900 font-medium">
          <span>{telemetry.last_error}</span>
        </div>
      )}

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-5 h-full overflow-hidden">
          <Card className="p-5 shrink-0">
            <ControlsPanel
              config={config}
              calibration={calibration}
              onUpdateConfig={handleUpdateConfig}
              onTriggerCalibration={handleTriggerCalibration}
            />
          </Card>
          <Card className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="text-zinc-950 text-xs font-bold uppercase tracking-wider mb-3 pb-2.5 border-b border-zinc-100">
                RF Telemetry
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Global Variance (σ²):</span>
                  <span className="font-mono font-bold text-xs text-amber-700">{telemetry?.global_variance || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Motion Score:</span>
                  <span className="font-mono font-bold text-xs text-zinc-950">
                    {telemetry?.motion_score ? Math.round(telemetry.motion_score * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Noise Floor:</span>
                  <span className="font-mono font-medium text-xs text-zinc-600">
                    {telemetry?.environmental_noise ? Math.round(telemetry.environmental_noise) : -88} dBm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Hardware Interface:</span>
                  <span className="font-mono text-zinc-800 text-xs">{config.interface} (ath9k_htc)</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 font-mono">
              Raw Injection: Probe Frames @ {config.injection_rate}Hz
            </div>
          </Card>
        </div>

        <div className="col-span-6 flex flex-col gap-5 h-full overflow-hidden">
          <Card className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
            <RadarScope
              targets={telemetry?.active_targets || []}
              globalState={telemetry?.global_state || 'IDLE'}
              selectedTargetId={selectedTargetId}
              onSelectTarget={setSelectedTargetId}
              maxDistance={config.max_range_m || 6}
            />
          </Card>
          <div className="h-44 shrink-0">
            <SignalChart history={history} config={config} height={125} />
          </div>
        </div>

        <div className="col-span-3 h-full overflow-hidden flex flex-col">
          <Card className="h-full overflow-hidden flex flex-col p-5">
            <TargetList
              targets={telemetry?.active_targets || []}
              selectedTargetId={selectedTargetId}
              onSelectTarget={setSelectedTargetId}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};
