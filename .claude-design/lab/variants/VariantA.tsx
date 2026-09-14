import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { TargetList } from '../TargetList';
import { ControlsPanel } from '../ControlsPanel';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Radio, Activity, Cpu } from 'lucide-react';

export const VariantA: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight">Variant A · Precision Monochrome HUD</div>
            <div className="text-[10px] font-mono text-zinc-400">ath9k_htc · 2.4 GHz Monitor</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <Badge variant="danger">Intrusion Alert</Badge>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-500">TX: <strong className="text-zinc-900">{mockTelemetry.packets_injected_per_sec}</strong>/s</span>
          <span className="text-zinc-500">RX: <strong className="text-zinc-900">{mockTelemetry.packets_captured_per_sec}</strong>/s</span>
          <span className="text-zinc-500">CH: <strong className="text-zinc-900">{config.channel}</strong></span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4 min-h-[560px] bg-zinc-50/50">
        <div className="col-span-3 space-y-4">
          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs">
            <ControlsPanel
              config={config}
              calibration={null}
              onUpdateConfig={(c) => setConfig({ ...config, ...c })}
              onTriggerCalibration={() => {}}
            />
          </Card>
          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <span>Telemetry Snapshot</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Variance:</span>
                <span className="font-mono font-semibold">{mockTelemetry.global_variance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Motion Score:</span>
                <span className="font-mono font-semibold">{Math.round(mockTelemetry.motion_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Noise Floor:</span>
                <span className="font-mono text-zinc-600">{mockTelemetry.environmental_noise} dBm</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-6 space-y-4">
          <Card className="p-2 bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center min-h-[380px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </Card>
          <SignalChart history={mockHistory} config={config} height={120} />
        </div>

        <div className="col-span-3">
          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs h-full">
            <TargetList
              targets={mockTargets}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
