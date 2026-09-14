import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Radio, RefreshCw, SlidersHorizontal } from 'lucide-react';

export const VariantE: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-[#fafafa] border border-zinc-200/90 rounded-2xl shadow-xs overflow-hidden text-zinc-900 font-sans">
      <header className="px-8 py-5 border-b border-zinc-200/70 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-zinc-950">Variant E · Minimalist Spatial Instrument</div>
            <div className="text-xs text-zinc-400">Apple Hardware aesthetic · Precision radial optics</div>
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

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center relative min-h-[460px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </div>

          <div className="col-span-4 flex flex-col gap-5">
            <Card className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <div className="font-semibold text-xs text-zinc-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-800" />
                  <span>Instrument Controls</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">Reset</Button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-500 mb-1.5 font-medium">
                    <span>Active Channel</span>
                    <span className="font-mono text-zinc-900 font-semibold">{config.channel}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {[1, 3, 6, 8, 11, 13].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setConfig({ ...config, channel: ch })}
                        className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                          config.channel === ch
                            ? 'bg-zinc-950 text-white shadow-2xs'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-500 mb-1.5 font-medium">
                    <span>Pulse Injection Rate</span>
                    <span className="font-mono text-zinc-900 font-semibold">{config.injection_rate} pkt/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={config.injection_rate}
                    onChange={(e) => setConfig({ ...config, injection_rate: parseInt(e.target.value, 10) })}
                    className="w-full accent-zinc-950 bg-zinc-200 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="md" className="w-full justify-center rounded-xl bg-zinc-950 text-white">
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                    <span>Run Background Calibration</span>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-2xs flex-1 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-xs text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                  Spatial Entities ({mockTargets.length})
                </div>
                <div className="space-y-2">
                  {mockTargets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        selectedId === t.id
                          ? 'border-zinc-950 bg-zinc-50 shadow-2xs ring-1 ring-zinc-950/10'
                          : 'border-zinc-200/80 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-semibold text-zinc-900">{t.id}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{t.rssi} dBm · {t.distance_m}m</div>
                      </div>
                      <Badge variant={t.state === 'INTRUSION_ALERT' ? 'danger' : 'neutral'}>
                        {t.state.split('_')[0]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <SignalChart history={mockHistory} config={config} height={140} />
      </div>
    </div>
  );
};
