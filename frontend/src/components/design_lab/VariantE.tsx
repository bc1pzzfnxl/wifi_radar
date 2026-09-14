import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { ControlsPanel } from '../ControlsPanel';
import { TargetList } from '../TargetList';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Radio, Cpu } from 'lucide-react';

export const VariantE: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-[#fafafa] border border-zinc-200/90 rounded-3xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-8 py-4 border-b border-zinc-200/70 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-zinc-950">Variant E · Minimalist Spatial Instrument</div>
            <div className="text-xs text-zinc-400">Apple Hardware Aesthetic · Precision Radial Optics</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-950" />
            <span className="font-mono text-zinc-600">AR9271 Connected</span>
          </div>
          <Badge variant="neutral">Channel 6</Badge>
          <Badge variant="danger">Intrusion Alert</Badge>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 p-6 min-h-[580px]">
        <div className="col-span-3 space-y-5">
          <Card className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-2xs">
            <ControlsPanel
              config={config}
              calibration={null}
              onUpdateConfig={(c) => setConfig({ ...config, ...c })}
              onTriggerCalibration={() => {}}
            />
          </Card>

          <Card className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-2xs">
            <div className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <span>Sensor Snapshot</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Variance:</span>
                <span className="font-mono font-semibold">{mockTelemetry.global_variance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Motion Score:</span>
                <span className="font-mono font-semibold">{Math.round(mockTelemetry.motion_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Noise Floor:</span>
                <span className="font-mono text-zinc-600">{mockTelemetry.environmental_noise} dBm</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-6 space-y-5">
          <Card className="p-4 bg-white border border-zinc-200/80 rounded-3xl shadow-xs flex items-center justify-center min-h-[400px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </Card>
          <SignalChart history={mockHistory} config={config} height={130} />
        </div>

        <div className="col-span-3">
          <Card className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-2xs h-full">
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
