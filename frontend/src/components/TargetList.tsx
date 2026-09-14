import React from 'react';
import type { RadarTarget } from '../types/radar';
import { Badge } from './ui/Badge';

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
        return <Badge variant="neutral">PRESENCE</Badge>;
      default:
        return <Badge variant="default">IDLE</Badge>;
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'IMMEDIATE':
        return 'text-rose-800 bg-rose-500/10 border-rose-300/40';
      case 'NEAR':
        return 'text-amber-800 bg-amber-500/10 border-amber-300/40';
      case 'MID':
        return 'text-zinc-700 bg-zinc-100/80 border-zinc-200/70';
      default:
        return 'text-zinc-500 bg-zinc-50 border-zinc-200/60';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 text-zinc-500">
        <div>
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-950">
            Tracked Entities
          </span>
          <span className="ml-2 font-mono font-bold text-xs text-zinc-400">({targets.length})</span>
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-md">
          ath9k_htc
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
        {targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
            <span className="text-xs font-medium">Scanning RF environment...</span>
          </div>
        ) : (
          targets.map((t) => {
            const isSelected = t.id === selectedTargetId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTarget(isSelected ? null : t.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-zinc-950 shadow-xs ring-1 ring-zinc-950/10 scale-[1.01]'
                    : 'bg-white/80 border-zinc-200/70 hover:border-zinc-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-zinc-950 text-xs">{t.id}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{t.mac_masked}</span>
                  </div>
                  {getStateBadge(t.state)}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100/80 text-[11px]">
                  <div>
                    <div className="text-zinc-400 text-[10px] font-medium">RSSI</div>
                    <div className="font-bold font-mono text-zinc-900">{t.rssi} dBm</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px] font-medium">VARIANCE</div>
                    <div className={`font-bold font-mono ${t.variance > 4 ? 'text-amber-700' : 'text-zinc-600'}`}>
                      {t.variance}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px] font-medium">DISTANCE</div>
                    <div className="font-bold font-mono text-zinc-900">{t.distance_m}m</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getZoneColor(t.zone)}`}>
                    {t.zone} ZONE
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
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
