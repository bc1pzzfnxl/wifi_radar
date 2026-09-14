import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { ControlsPanel } from '../ControlsPanel';
import { TargetList } from '../TargetList';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Target, Compass, Cpu } from 'lucide-react';

export const VariantD: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('tgt_5884');
  const [config, setConfig] = useState(mockConfig);

  const selectedTarget = mockTargets.find((t) => t.id === selectedId);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight">Variant D · Interactive Master-Detail Inspector</div>
            <div className="text-[10px] text-zinc-400 font-mono">ath9k_htc · Deep Inspector on Selection</div>
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

      <div className="grid grid-cols-12 gap-4 p-4 min-h-[580px] bg-zinc-50/40">
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
            <div className="text-xs font-semibold text-zinc-900 mb-2.5 flex items-center gap-1.5">
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
          <SignalChart history={mockHistory} config={config} height={130} />
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          {selectedTarget ? (
            <Card className="p-3.5 bg-zinc-900 text-white border border-zinc-900 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Focused Entity</span>
                </div>
                <Badge variant={selectedTarget.state === 'INTRUSION_ALERT' ? 'danger' : 'outline'} className="text-[10px] text-white">
                  {selectedTarget.state.split('_')[0]}
                </Badge>
              </div>
              <div className="mt-2.5 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">ID:</span>
                  <span className="font-bold text-white">{selectedTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MAC:</span>
                  <span className="text-zinc-300">{selectedTarget.mac_masked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">RSSI:</span>
                  <span className="font-bold text-white">{selectedTarget.rssi} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Variance:</span>
                  <span className="font-bold text-amber-400">{selectedTarget.variance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Distance:</span>
                  <span className="text-zinc-300">{selectedTarget.distance_m}m ({selectedTarget.zone})</span>
                </div>
              </div>
            </Card>
          ) : null}

          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs flex-1 overflow-hidden">
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
