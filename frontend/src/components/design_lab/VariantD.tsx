import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Target, Compass, Sliders, ChevronRight } from 'lucide-react';

export const VariantD: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('tgt_5884');
  const [config, setConfig] = useState(mockConfig);

  const selectedTarget = mockTargets.find((t) => t.id === selectedId) || mockTargets[0];

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight">Variant D · Interactive Master-Detail Inspector</div>
            <div className="text-[11px] text-zinc-400">Deep telemetry inspector on selection</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="neutral">Target Inspector Active</Badge>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-50/40">
        <div className="col-span-3 space-y-4">
          <Card className="p-4 bg-white border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5 pb-2 border-b border-zinc-100">
              <Sliders className="w-3.5 h-3.5 text-zinc-700" />
              <span>Global Radar Tuning</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">Channel (2.4 GHz)</label>
                <div className="grid grid-cols-6 gap-1">
                  {[1, 3, 6, 8, 11, 13].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setConfig({ ...config, channel: ch })}
                      className={`py-1 rounded font-mono text-[11px] border ${
                        config.channel === ch ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>Rate</span>
                  <span className="font-mono text-zinc-900 font-semibold">{config.injection_rate} pkt/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={config.injection_rate}
                  onChange={(e) => setConfig({ ...config, injection_rate: parseInt(e.target.value, 10) })}
                  className="w-full accent-zinc-900 h-1.5"
                />
              </div>
            </div>
          </Card>

          <SignalChart history={mockHistory} config={config} height={120} />
        </div>

        <div className="col-span-5 space-y-4">
          <Card className="p-2 bg-white border border-zinc-200 flex items-center justify-center min-h-[360px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <Card className="p-4 bg-white border border-zinc-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-700" />
                <span>Entity Inspector</span>
              </div>
              <Badge variant={selectedTarget.state === 'INTRUSION_ALERT' ? 'danger' : 'neutral'}>
                {selectedTarget.state}
              </Badge>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono">IDENTIFIER</div>
                  <div className="font-bold text-zinc-900 font-mono text-sm">{selectedTarget.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-mono">MAC ADDRESS</div>
                  <div className="font-mono text-zinc-600">{selectedTarget.mac_masked}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <div className="text-zinc-400 text-[10px]">CURRENT RSSI</div>
                  <div className="font-mono font-bold text-zinc-900 mt-0.5">{selectedTarget.rssi} dBm</div>
                </div>
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <div className="text-zinc-400 text-[10px]">BASELINE RSSI</div>
                  <div className="font-mono font-bold text-zinc-600 mt-0.5">{selectedTarget.baseline_rssi} dBm</div>
                </div>
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <div className="text-zinc-400 text-[10px]">VARIANCE (σ²)</div>
                  <div className="font-mono font-bold text-amber-700 mt-0.5">{selectedTarget.variance}</div>
                </div>
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <div className="text-zinc-400 text-[10px]">DISTANCE / ZONE</div>
                  <div className="font-mono font-bold text-zinc-900 mt-0.5">{selectedTarget.distance_m}m ({selectedTarget.zone})</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex justify-between text-[11px] text-zinc-500">
                <span>Confidence: {Math.round(selectedTarget.confidence * 100)}%</span>
                <span>Angle: {selectedTarget.angle_deg}°</span>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-white border border-zinc-200">
            <div className="text-[11px] font-semibold text-zinc-700 mb-2">Switch Target</div>
            <div className="space-y-1">
              {mockTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                    selectedId === t.id ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <span className="font-mono">{t.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] opacity-70">{t.distance_m}m</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
