import React, { useMemo } from 'react';
import type { RadarConfig } from '../types/radar';

interface DataPoint {
  time: number;
  rssi: number;
  variance: number;
}

interface SignalChartProps {
  history: DataPoint[];
  config: RadarConfig;
  height?: number;
}

export const SignalChart: React.FC<SignalChartProps> = ({
  history,
  config,
  height = 140
}) => {
  const width = 600;
  const padding = { top: 15, right: 15, bottom: 25, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const { rssiPath, variancePath, minRssi, maxRssi, maxVar } = useMemo(() => {
    if (history.length < 2) {
      return { rssiPath: '', variancePath: '', minRssi: -90, maxRssi: -30, maxVar: 10 };
    }

    const minR = Math.min(-90, ...history.map((d) => d.rssi));
    const maxR = Math.max(-30, ...history.map((d) => d.rssi));
    const maxV = Math.max(config.alert_threshold * 1.2, ...history.map((d) => d.variance));

    const getX = (idx: number) => padding.left + (idx / (history.length - 1)) * innerWidth;
    const getYRssi = (val: number) => padding.top + innerHeight - ((val - minR) / (maxR - minR || 1)) * innerHeight;
    const getYVar = (val: number) => padding.top + innerHeight - (Math.min(val, maxV) / maxV) * innerHeight;

    const rssiPoints = history.map((d, i) => `${getX(i)},${getYRssi(d.rssi)}`);
    const varPoints = history.map((d, i) => `${getX(i)},${getYVar(d.variance)}`);

    const rPath = `M ${rssiPoints.join(' L ')}`;
    const vPath = `M ${getX(0)},${padding.top + innerHeight} L ${varPoints.join(' L ')} L ${getX(history.length - 1)},${padding.top + innerHeight} Z`;

    return {
      rssiPath: rPath,
      variancePath: vPath,
      minRssi: Math.round(minR),
      maxRssi: Math.round(maxR),
      maxVar: Math.round(maxV)
    };
  }, [history, config.alert_threshold, innerWidth, innerHeight, padding.left, padding.top]);

  const getYVar = (val: number) => padding.top + innerHeight - (Math.min(val, maxVar) / (maxVar || 1)) * innerHeight;

  return (
    <div className="w-full bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-zinc-900/5 flex flex-col">
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1 pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-zinc-900 inline-block rounded-full" />
            <span className="text-zinc-800 font-medium">RSSI Signal</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 bg-amber-500/10 border border-amber-500/60 inline-block rounded-xs" />
            <span className="text-zinc-600 font-medium">Variance (σ²)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-400">Motion Threshold:</span>
          <span className="text-zinc-900 font-mono font-semibold">{config.motion_threshold}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none pt-2"
      >
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={width - padding.right}
          y2={padding.top + innerHeight}
          stroke="#f1f5f9"
          strokeWidth="1"
        />

        <line
          x1={padding.left}
          y1={getYVar(config.noise_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.noise_threshold)}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.8"
        />
        <line
          x1={padding.left}
          y1={getYVar(config.motion_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.motion_threshold)}
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        <line
          x1={padding.left}
          y1={getYVar(config.alert_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.alert_threshold)}
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {variancePath && (
          <path
            d={variancePath}
            fill="rgba(245, 158, 11, 0.08)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
        )}

        {rssiPath && (
          <path
            d={rssiPath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="1.8"
          />
        )}

        <text x={padding.left - 6} y={padding.top + 8} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="sans-serif">
          {maxRssi}dB
        </text>
        <text x={padding.left - 6} y={padding.top + innerHeight} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="sans-serif">
          {minRssi}dB
        </text>
      </svg>
    </div>
  );
};
