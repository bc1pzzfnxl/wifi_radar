import React from 'react';
import type { RadarTarget } from '../types/radar';
import { Badge } from './ui/Badge';
import { Radio, Activity } from 'lucide-react';

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
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'NEAR':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'MID':
        return 'text-zinc-700 bg-zinc-100 border-zinc-200';
      default:
        return 'text-zinc-500 bg-zinc-50 border-zinc-200';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 text-zinc-500">
        <div className="flex items-center gap-2 font-semibold text-zinc-900 tracking-tight">
          <Activity className="w-4 h-4 text-zinc-800" />
          <span>Active Entities ({targets.length})</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
          ath9k_htc
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
        {targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-2">
            <Radio className="w-8 h-8 text-zinc-300 animate-pulse" />
            <span className="text-xs">Scanning RF environment...</span>
          </div>
        ) : (
          targets.map((t) => {
            const isSelected = t.id === selectedTargetId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTarget(isSelected ? null : t.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-zinc-50 border-zinc-900 shadow-xs ring-1 ring-zinc-900/10'
                    : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 font-mono text-xs">{t.id}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{t.mac_masked}</span>
                  </div>
                  {getStateBadge(t.state)}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100 text-[11px]">
                  <div>
                    <div className="text-zinc-400 text-[10px]">SIGNAL</div>
                    <div className="font-semibold font-mono text-zinc-900">{t.rssi} dBm</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px]">VARIANCE (σ²)</div>
                    <div className={`font-semibold font-mono ${t.variance > 4 ? 'text-amber-700' : 'text-zinc-600'}`}>
                      {t.variance}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px]">DISTANCE</div>
                    <div className="font-semibold font-mono text-zinc-900">{t.distance_m}m</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getZoneColor(t.zone)}`}>
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
