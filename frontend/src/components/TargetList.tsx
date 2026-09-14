import React from 'react';
import type { RadarTarget } from '../types/radar';
import { Badge } from './ui/Badge';
import { Radio, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TargetListProps {
  targets: RadarTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
}

export const TargetList: React.FC<TargetListProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget
}) => {
  const getStateBadge = (state: string) => {
    switch (state) {
      case 'INTRUSION_ALERT':
        return <Badge variant="danger">ALERT</Badge>;
      case 'MOTION_DETECTED':
        return <Badge variant="warning">MOTION</Badge>;
      case 'STATIONARY_PRESENCE':
        return <Badge variant="success">PRESENCE</Badge>;
      default:
        return <Badge variant="outline">IDLE</Badge>;
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'IMMEDIATE':
        return 'text-rose-400 border-rose-800/40 bg-rose-950/20';
      case 'NEAR':
        return 'text-amber-400 border-amber-800/40 bg-amber-950/20';
      case 'MID':
        return 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20';
      default:
        return 'text-zinc-400 border-zinc-800/40 bg-zinc-950/20';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-950 text-zinc-400">
        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Activity className="w-4 h-4" />
          <span>Active Entities ({targets.length})</span>
        </div>
        <span className="text-[10px] text-zinc-500">2.4 GHz ath9k_htc</span>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
        {targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2">
            <Radio className="w-8 h-8 animate-pulse text-emerald-900" />
            <span>Scanning Fresnel zone...</span>
          </div>
        ) : (
          targets.map((t) => {
            const isSelected = t.id === selectedTargetId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTarget(isSelected ? null : t.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-950/70 border-emerald-950/60 hover:border-emerald-800/60 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300">{t.id}</span>
                    <span className="text-[10px] text-zinc-500">{t.mac_masked}</span>
                  </div>
                  {getStateBadge(t.state)}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-950/40 text-[11px]">
                  <div>
                    <div className="text-zinc-500 text-[9px]">SIGNAL</div>
                    <div className="font-bold text-white">{t.rssi} dBm</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[9px]">VARIANCE (σ²)</div>
                    <div className={`font-bold ${t.variance > 4 ? 'text-amber-300' : 'text-zinc-300'}`}>
                      {t.variance}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[9px]">DISTANCE</div>
                    <div className="font-bold text-emerald-300">{t.distance_m}m</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getZoneColor(t.zone)}`}>
                    {t.zone} ZONE
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Conf: {Math.round(t.confidence * 100)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
