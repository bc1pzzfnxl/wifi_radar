import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { RadarTelemetry, RadarConfig, CalibrationStatus } from '../types/radar';
import { RadarScope } from './RadarScope';
import { SignalChart } from './SignalChart';
import { TargetList } from './TargetList';
import { ControlsPanel } from './ControlsPanel';
import { Badge } from './ui/Badge';
import { Radio, ShieldAlert, Cpu, Activity, Signal, Wifi } from 'lucide-react';

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
    simulate_rf: true
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
    } catch {
      // Offline fallback
    }
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
    } catch {
      // Offline fallback
    }
  };

  const handleTriggerCalibration = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/calibrate', { method: 'POST' });
      const res = await fetch('http://127.0.0.1:8000/api/calibrate/status');
      if (res.ok) {
        setCalibration(await res.json());
      }
    } catch {
      // Offline fallback
    }
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
        } catch {
          // Packet error
        }
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
      } catch {
        // Calibration poll error
      }
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
        return <Badge variant="danger">INTRUSION DETECTED</Badge>;
      case 'MOTION_DETECTED':
        return <Badge variant="warning">MOTION IN ZONE</Badge>;
      case 'STATIONARY_PRESENCE':
        return <Badge variant="success">PRESENCE CONFIRMED</Badge>;
      default:
        return <Badge variant="outline">ZONE SECURE (IDLE)</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#020804] text-[#e2f5e8] font-mono overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-950/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wider text-emerald-300">
              WiFi Radar HUD
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 border-l border-emerald-950 pl-3">
            Atheros AR9271 (ath9k_htc)
          </span>
          <div className="flex items-center gap-2 pl-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-ping'}`} />
            <span className="text-[10px] text-zinc-400">
              {connected ? 'LIVE WS' : 'CONNECTING...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">STATE:</span>
            {getGlobalBadge(telemetry?.global_state)}
          </div>
          <div className="flex items-center gap-3 border-l border-emerald-950/80 pl-4 text-[11px]">
            <div>
              <span className="text-zinc-500">TX: </span>
              <span className="text-emerald-400 font-bold">{telemetry?.packets_injected_per_sec || 0} pkt/s</span>
            </div>
            <div>
              <span className="text-zinc-500">RX: </span>
              <span className="text-emerald-400 font-bold">{telemetry?.packets_captured_per_sec || 0} pkt/s</span>
            </div>
            <div>
              <span className="text-zinc-500">CH: </span>
              <span className="text-amber-400 font-bold">{telemetry?.channel || config.channel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-3 h-full overflow-hidden">
          <div className="bg-zinc-950/80 border border-emerald-950/80 rounded-lg p-3">
            <ControlsPanel
              config={config}
              calibration={calibration}
              onUpdateConfig={handleUpdateConfig}
              onTriggerCalibration={handleTriggerCalibration}
            />
          </div>
          <div className="bg-zinc-950/80 border border-emerald-950/80 rounded-lg p-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-1.5 pb-2 border-b border-emerald-950">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>RF Telemetry</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Global Variance (σ²):</span>
                  <span className="text-amber-300 font-bold">{telemetry?.global_variance || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Motion Composite Score:</span>
                  <span className="text-emerald-400 font-bold">{telemetry?.motion_score ? Math.round(telemetry.motion_score * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Noise Floor:</span>
                  <span className="text-zinc-300">{telemetry?.environmental_noise ? Math.round(telemetry.environmental_noise) : -88} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mode:</span>
                  <span className={config.simulate_rf ? 'text-amber-400' : 'text-emerald-400'}>
                    {config.simulate_rf ? 'Mock RF Simulation' : 'ath9k_htc Raw Injection'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-emerald-950/60 text-[10px] text-zinc-600">
              Active Radar Injection: Probe Frames @ {config.injection_rate}Hz
            </div>
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-3 h-full overflow-hidden">
          <div className="flex-1 bg-zinc-950/80 border border-emerald-950/80 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
            <RadarScope
              targets={telemetry?.active_targets || []}
              globalState={telemetry?.global_state || 'IDLE'}
              selectedTargetId={selectedTargetId}
              onSelectTarget={setSelectedTargetId}
              maxDistance={15}
            />
          </div>
          <div className="h-44">
            <SignalChart history={history} config={config} height={130} />
          </div>
        </div>

        <div className="col-span-3 bg-zinc-950/80 border border-emerald-950/80 rounded-lg p-3 h-full overflow-hidden flex flex-col">
          <TargetList
            targets={telemetry?.active_targets || []}
            selectedTargetId={selectedTargetId}
            onSelectTarget={setSelectedTargetId}
          />
        </div>
      </main>
    </div>
  );
};
