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
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold tracking-tight">
          <Sliders className="w-4 h-4 text-zinc-800" />
          <span>Radar Parameters</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
          {config.interface}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-600 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-zinc-500" />
              WiFi Channel (2.4 GHz)
            </span>
            <span className="text-zinc-900 font-semibold font-mono">CH {config.channel}</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[1, 3, 6, 8, 11, 13].map((ch) => (
              <button
                key={ch}
                onClick={() => onUpdateConfig({ channel: ch })}
                className={`py-1.5 rounded-md text-center text-xs font-mono font-medium border transition-all cursor-pointer ${
                  config.channel === ch
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-2xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-600 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-500" />
              Injection Rate
            </span>
            <span className="text-zinc-900 font-semibold font-mono">{config.injection_rate} pkt/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={config.injection_rate}
            onChange={(e) => onUpdateConfig({ injection_rate: parseInt(e.target.value, 10) })}
            className="w-full accent-zinc-900 bg-zinc-200 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-600">Motion Threshold</span>
            <span className="text-zinc-900 font-semibold font-mono">{config.motion_threshold}</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="12.0"
            step="0.5"
            value={config.motion_threshold}
            onChange={(e) => onUpdateConfig({ motion_threshold: parseFloat(e.target.value) })}
            className="w-full accent-zinc-900 bg-zinc-200 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div className="pt-3 border-t border-zinc-100">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center shadow-xs"
            onClick={onTriggerCalibration}
            disabled={calibration?.in_progress}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${calibration?.in_progress ? 'animate-spin' : ''}`} />
            {calibration?.in_progress ? 'Calibrating Baseline...' : 'Calibrate Room Baseline'}
          </Button>
          {calibration?.message && (
            <div className="text-[11px] text-zinc-500 text-center mt-2">
              {calibration.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
