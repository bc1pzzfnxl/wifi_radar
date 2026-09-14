import React from 'react';
import type { RadarConfig, CalibrationStatus } from '../types/radar';
import { Button } from './ui/Button';
import { Sliders, RefreshCw, Zap, Wifi } from 'lucide-react';

interface ControlsPanelProps {
  config: RadarConfig;
  calibration: CalibrationStatus | null;
  onUpdateConfig: (newCfg: Partial<RadarConfig>) => void;
  onTriggerCalibration: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  calibration,
  onUpdateConfig,
  onTriggerCalibration
}) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-950 text-zinc-400">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Sliders className="w-4 h-4" />
          <span>Radar Parameters</span>
        </div>
        <span className="text-[10px] text-zinc-500">{config.interface}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-500" />
              WiFi Channel (2.4 GHz)
            </span>
            <span className="text-emerald-300 font-bold">CH {config.channel}</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[1, 3, 6, 8, 11, 13].map((ch) => (
              <button
                key={ch}
                onClick={() => onUpdateConfig({ channel: ch })}
                className={`py-1 rounded text-center border transition-all cursor-pointer ${
                  config.channel === ch
                    ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                    : 'bg-zinc-900/50 border-emerald-950 text-zinc-400 hover:border-emerald-800'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Frame Injection Rate
            </span>
            <span className="text-amber-300 font-bold">{config.injection_rate} pkt/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={config.injection_rate}
            onChange={(e) => onUpdateConfig({ injection_rate: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400">Motion Detection Threshold</span>
            <span className="text-emerald-400 font-bold">{config.motion_threshold}</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="12.0"
            step="0.5"
            value={config.motion_threshold}
            onChange={(e) => onUpdateConfig({ motion_threshold: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div className="pt-2 border-t border-emerald-950/60 space-y-1.5">
          <div className="flex justify-between text-zinc-400">
            <span>Operating Mode</span>
            <span className={config.simulate_rf ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
              {config.simulate_rf ? 'MOCK SIMULATION' : 'HARDWARE (AR9271)'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onUpdateConfig({ simulate_rf: true })}
              className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                config.simulate_rf
                  ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              Mock Simulation
            </button>
            <button
              onClick={() => onUpdateConfig({ simulate_rf: false })}
              className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                !config.simulate_rf
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              Hardware (AR9271)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center"
            onClick={onTriggerCalibration}
            disabled={calibration?.in_progress}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${calibration?.in_progress ? 'animate-spin' : ''}`} />
            {calibration?.in_progress ? 'Calibrating Baseline...' : 'Calibrate Room Baseline'}
          </Button>
          {calibration?.message && (
            <div className="text-[10px] text-zinc-500 text-center mt-1">
              {calibration.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
