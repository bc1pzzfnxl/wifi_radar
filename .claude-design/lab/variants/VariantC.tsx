import React, { useState } from 'react';
import { mockConfig, mockTelemetry, mockTargets, mockHistory } from './fixtures';
import { RadarScope } from '../RadarScope';
import { SignalChart } from '../SignalChart';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Terminal, Shield, Zap } from 'lucide-react';

export const VariantC: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState(mockConfig);

  return (
    <div className="bg-white border border-zinc-300/80 rounded-xl shadow-xs overflow-hidden text-zinc-900 font-sans text-xs">
      <div className="bg-zinc-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold">Variant C · High-Density Pro Console</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">wlan1 @ 2437MHz</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div>INJ: <span className="text-white font-bold">{mockTelemetry.packets_injected_per_sec}p/s</span></div>
          <div>CAP: <span className="text-white font-bold">{mockTelemetry.packets_captured_per_sec}p/s</span></div>
          <div>σ²: <span className="text-amber-400 font-bold">{mockTelemetry.global_variance}</span></div>
          <Badge variant="danger" className="text-[10px] py-0 px-2">ALERT</Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-100/60">
        <div className="col-span-3 space-y-2">
          <Card className="p-3 bg-white border border-zinc-200">
            <div className="font-semibold text-zinc-800 text-[11px] mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-zinc-600" />
              <span>RF Channel Control</span>
            </div>
            <div className="grid grid-cols-6 gap-1 mb-3">
              {[1, 3, 6, 8, 11, 13].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setConfig({ ...config, channel: ch })}
                  className={`py-1 text-[11px] font-mono rounded font-medium border ${
                    config.channel === ch ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Rate:</span>
                <span className="font-mono font-semibold">{config.injection_rate} pkt/s</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={config.injection_rate}
                onChange={(e) => setConfig({ ...config, injection_rate: parseInt(e.target.value, 10) })}
                className="w-full accent-zinc-900 h-1"
              />

              <div className="flex justify-between pt-1">
                <span className="text-zinc-500">Threshold:</span>
                <span className="font-mono font-semibold">{config.motion_threshold}</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="12.0"
                step="0.5"
                value={config.motion_threshold}
                onChange={(e) => setConfig({ ...config, motion_threshold: parseFloat(e.target.value) })}
                className="w-full accent-zinc-900 h-1"
              />
            </div>
          </Card>

          <Card className="p-3 bg-white border border-zinc-200">
            <div className="font-semibold text-zinc-800 text-[11px] mb-2">Noise & Metrics</div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Floor:</span>
                <span className="text-zinc-800">{mockTelemetry.environmental_noise} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Score:</span>
                <span className="text-zinc-800">{mockTelemetry.motion_score}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-5 space-y-2">
          <Card className="p-1 bg-white border border-zinc-200 flex items-center justify-center min-h-[300px]">
            <RadarScope
              targets={mockTargets}
              globalState={mockTelemetry.global_state}
              selectedTargetId={selectedId}
              onSelectTarget={setSelectedId}
              maxDistance={15}
            />
          </Card>
          <SignalChart history={mockHistory} config={config} height={110} />
        </div>

        <div className="col-span-4">
          <Card className="p-3 bg-white border border-zinc-200 h-full flex flex-col">
            <div className="font-semibold text-zinc-800 text-[11px] mb-2 flex justify-between">
              <span>Tracked Targets</span>
              <span className="font-mono text-zinc-400">{mockTargets.length} active</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1 font-mono text-[11px]">
              {mockTargets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                  className={`p-2 rounded border cursor-pointer ${
                    selectedId === t.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-900">{t.id}</span>
                    <span className={`px-1 rounded text-[9px] ${
                      t.state === 'INTRUSION_ALERT' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-700'
                    }`}>{t.state}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[10px] mt-1">
                    <span>{t.rssi} dBm</span>
                    <span>σ²: {t.variance}</span>
                    <span>{t.distance_m}m</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
