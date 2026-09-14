import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { ControlsPanel } from '../ControlsPanel';
import { TargetList } from '../TargetList';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Terminal, Cpu } from 'lucide-react';

export const VariantC: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-white border border-zinc-300 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <div className="bg-zinc-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <div className="font-semibold text-xs tracking-tight">Variant C · High-Density Pro Console</div>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] font-mono text-zinc-300">ath9k_htc · CH {config.channel}</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <div>TX: <strong className="text-white">{mockTelemetry.packets_injected_per_sec}</strong>/s</div>
          <div>RX: <strong className="text-white">{mockTelemetry.packets_captured_per_sec}</strong>/s</div>
          <div>σ²: <strong className="text-amber-400">{mockTelemetry.global_variance}</strong></div>
          <Badge variant="danger" className="text-[10px] py-0 px-2.5">INTRUSION ALERT</Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5 p-4 min-h-[580px] bg-zinc-100/40">
        <div className="col-span-3 space-y-3.5">
          <Card className="p-3.5 bg-white border border-zinc-200">
            <ControlsPanel
              config={config}
              calibration={null}
              onUpdateConfig={(c) => setConfig({ ...config, ...c })}
              onTriggerCalibration={() => {}}
            />
          </Card>
          <Card className="p-3.5 bg-white border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900 mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <span>Telemetry Snapshot</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Variance:</span>
                <span className="font-semibold">{mockTelemetry.global_variance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Motion Score:</span>
                <span className="font-semibold">{Math.round(mockTelemetry.motion_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Noise Floor:</span>
                <span className="text-zinc-600">{mockTelemetry.environmental_noise} dBm</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-6 space-y-3.5">
          <Card className="p-2 bg-white border border-zinc-200 flex items-center justify-center min-h-[380px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </Card>
          <SignalChart history={mockHistory} config={config} height={125} />
        </div>

        <div className="col-span-3">
          <Card className="p-3.5 bg-white border border-zinc-200 h-full">
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
