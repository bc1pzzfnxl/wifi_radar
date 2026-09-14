import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sliders, RefreshCw, Layers } from 'lucide-react';

export const VariantB: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-6 py-4 border-b border-zinc-200/90 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight">Variant B · Tabular Inspector & Segmented Cockpit</div>
            <div className="text-xs text-zinc-500">Structured data view with precision hardware toggles</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">Hardware Status:</span>
          <Badge variant="neutral">Connected · ath9k_htc</Badge>
          <Badge variant="danger">Intrusion Alert</Badge>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 p-5 bg-white">
        <div className="col-span-4 space-y-4">
          <Card className="p-4 bg-white border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
              <div className="flex items-center gap-2 font-semibold text-xs text-zinc-900">
                <Sliders className="w-4 h-4" />
                <span>Operating Settings</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">CH {config.channel}</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-500 mb-1.5 font-medium">Channel Selector (2.4 GHz)</label>
                <div className="grid grid-cols-6 gap-1">
                  {[1, 3, 6, 8, 11, 13].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setConfig({ ...config, channel: ch })}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        config.channel === ch
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-zinc-500">
                  <span>Frame Rate</span>
                  <span className="font-mono text-zinc-900 font-semibold">{config.injection_rate} pkt/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={config.injection_rate}
                  onChange={(e) => setConfig({ ...config, injection_rate: parseInt(e.target.value, 10) })}
                  className="w-full accent-zinc-900 bg-zinc-200 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-zinc-500">
                  <span>Sensitivity Threshold</span>
                  <span className="font-mono text-zinc-900 font-semibold">{config.motion_threshold}</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="12.0"
                  step="0.5"
                  value={config.motion_threshold}
                  onChange={(e) => setConfig({ ...config, motion_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-zinc-900 bg-zinc-200 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button variant="secondary" size="md" className="w-full justify-center">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  <span>Calibrate Baseline</span>
                </Button>
              </div>
            </div>
          </Card>

          <SignalChart history={mockHistory} config={config} height={130} />
        </div>

        <div className="col-span-8 space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-6 p-2 bg-white border border-zinc-200 flex items-center justify-center min-h-[340px]">
              <RadarScope
                targets={mockTargets}
                globalState={mockTelemetry.global_state}
                selectedTargetId={selectedId}
                onSelectTarget={setSelectedId}
                maxDistance={15}
              />
            </Card>
            <div className="col-span-6 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Card className="p-3 bg-zinc-50 border-zinc-200/80">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Variance</div>
                  <div className="text-base font-mono font-bold text-zinc-900 mt-1">{mockTelemetry.global_variance}</div>
                </Card>
                <Card className="p-3 bg-zinc-50 border-zinc-200/80">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Motion</div>
                  <div className="text-base font-mono font-bold text-zinc-900 mt-1">{Math.round(mockTelemetry.motion_score * 100)}%</div>
                </Card>
                <Card className="p-3 bg-zinc-50 border-zinc-200/80">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Noise</div>
                  <div className="text-base font-mono font-bold text-zinc-900 mt-1">{Math.round(mockTelemetry.environmental_noise)}dB</div>
                </Card>
              </div>

              <Card className="p-3 bg-white border border-zinc-200 flex-1 overflow-hidden flex flex-col">
                <div className="font-semibold text-xs text-zinc-900 mb-2">Detailed Target Inspector</div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400">
                        <th className="pb-1.5 font-medium">ID</th>
                        <th className="pb-1.5 font-medium">RSSI</th>
                        <th className="pb-1.5 font-medium">σ²</th>
                        <th className="pb-1.5 font-medium">Dist</th>
                        <th className="pb-1.5 font-medium text-right">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 font-mono">
                      {mockTargets.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                          className={`cursor-pointer hover:bg-zinc-50 transition-colors ${selectedId === t.id ? 'bg-zinc-100/80 font-bold' : ''}`}
                        >
                          <td className="py-2 text-zinc-900 font-sans">{t.id}</td>
                          <td className="py-2 text-zinc-600">{t.rssi}dB</td>
                          <td className="py-2 text-amber-700">{t.variance}</td>
                          <td className="py-2 text-zinc-600">{t.distance_m}m</td>
                          <td className="py-2 text-right font-sans">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              t.state === 'INTRUSION_ALERT' ? 'bg-rose-100 text-rose-800' :
                              t.state === 'MOTION_DETECTED' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'
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
      </div>
    </div>
  );
};
