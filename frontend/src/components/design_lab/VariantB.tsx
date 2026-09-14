import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { ControlsPanel } from '../ControlsPanel';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Layers, Activity, Cpu } from 'lucide-react';

export const VariantB: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-6 py-3.5 border-b border-zinc-200/90 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight">Variant B · Tabular Inspector & Segmented Cockpit</div>
            <div className="text-[10px] text-zinc-500 font-mono">ath9k_htc · 2.4 GHz Raw Packet Injection</div>
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

      <div className="grid grid-cols-12 gap-4 p-4 min-h-[580px] bg-white">
        <div className="col-span-3 space-y-4">
          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs">
            <ControlsPanel
              config={config}
              calibration={null}
              onUpdateConfig={(c) => setConfig({ ...config, ...c })}
              onTriggerCalibration={() => {}}
            />
          </Card>

          <Card className="p-4 bg-zinc-50/70 border border-zinc-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <span>RF Statistics</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-zinc-200/60">
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Variance</div>
                <div className="font-mono font-bold text-xs text-amber-700 mt-0.5">{mockTelemetry.global_variance}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-zinc-200/60">
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Motion</div>
                <div className="font-mono font-bold text-xs text-zinc-900 mt-0.5">{Math.round(mockTelemetry.motion_score * 100)}%</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-zinc-200/60">
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Floor</div>
                <div className="font-mono font-bold text-xs text-zinc-600 mt-0.5">{Math.round(mockTelemetry.environmental_noise)}dB</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-5 space-y-4">
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

        <div className="col-span-4">
          <Card className="p-4 bg-white border border-zinc-200/80 shadow-2xs h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
              <div className="flex items-center gap-2 font-semibold text-xs text-zinc-900">
                <Activity className="w-4 h-4 text-zinc-800" />
                <span>Tabular Entity Inspector</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                {mockTargets.length} entities
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                    <th className="pb-2">Target</th>
                    <th className="pb-2">RSSI</th>
                    <th className="pb-2">σ²</th>
                    <th className="pb-2">Dist</th>
                    <th className="pb-2 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-mono">
                  {mockTargets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedId === t.id ? 'bg-zinc-100 font-bold' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <td className="py-2.5">
                        <div className="text-zinc-900 font-sans font-semibold">{t.id}</div>
                        <div className="text-[9px] text-zinc-400">{t.mac_masked}</div>
                      </td>
                      <td className="py-2.5 text-zinc-700">{t.rssi} dBm</td>
                      <td className="py-2.5 text-amber-700">{t.variance}</td>
                      <td className="py-2.5 text-zinc-700">{t.distance_m}m</td>
                      <td className="py-2.5 text-right font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          t.state === 'INTRUSION_ALERT' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          t.state === 'MOTION_DETECTED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {t.state.split('_')[0]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
