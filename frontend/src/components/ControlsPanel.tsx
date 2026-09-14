import React from 'react';
import type { RadarConfig, CalibrationStatus } from '../types/radar';
import { Button } from './ui/Button';

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
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div>
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-950">
            Tuning & Parameters
          </span>
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-md">
          {config.interface}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 font-medium">Channel</span>
            <span className="text-zinc-950 font-bold font-mono text-xs">CH {config.channel}</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {[1, 3, 6, 8, 11, 13].map((ch) => (
              <button
                key={ch}
                onClick={() => onUpdateConfig({ channel: ch })}
                className={`py-2 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                  config.channel === ch
                    ? 'bg-zinc-950 text-white shadow-xs scale-[1.02]'
                    : 'bg-white/80 border border-zinc-200/70 text-zinc-700 hover:bg-zinc-100/80 hover:border-zinc-300'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-500 font-medium">Injection Rate</span>
            <span className="text-zinc-950 font-bold font-mono text-xs">{config.injection_rate} pkt/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={config.injection_rate}
            onChange={(e) => onUpdateConfig({ injection_rate: parseInt(e.target.value, 10) })}
            className="w-full accent-zinc-950 bg-zinc-200/80 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-500 font-medium">Motion Sensitivity</span>
            <span className="text-zinc-950 font-bold font-mono text-xs">{config.motion_threshold}</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="12.0"
            step="0.5"
            value={config.motion_threshold}
            onChange={(e) => onUpdateConfig({ motion_threshold: parseFloat(e.target.value) })}
            className="w-full accent-zinc-950 bg-zinc-200/80 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center rounded-2xl py-2.5 font-bold shadow-xs bg-zinc-950 text-white hover:bg-zinc-850 cursor-pointer"
            onClick={onTriggerCalibration}
            disabled={calibration?.in_progress}
          >
            <span>{calibration?.in_progress ? 'Calibrating Baseline...' : 'Calibrate Baseline'}</span>
          </Button>
          {calibration?.message && (
            <div className="text-[11px] text-zinc-400 text-center mt-2 font-mono">
              {calibration.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
