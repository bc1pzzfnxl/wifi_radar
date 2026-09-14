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
    <div className="w-full bg-zinc-950/70 border border-emerald-950 rounded-lg p-2 font-mono flex flex-col">
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2 pb-1 border-b border-emerald-950/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-emerald-300">RSSI Waveform</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500/40 border border-amber-400 inline-block rounded-xs" />
            <span className="text-amber-300">Rolling Variance (σ²)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Threshold:</span>
          <span className="text-amber-400 font-bold">{config.motion_threshold}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none pt-1"
      >
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="#0d381e"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={width - padding.right}
          y2={padding.top + innerHeight}
          stroke="#0d381e"
          strokeWidth="1"
        />

        <line
          x1={padding.left}
          y1={getYVar(config.noise_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.noise_threshold)}
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.4"
        />
        <line
          x1={padding.left}
          y1={getYVar(config.motion_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.motion_threshold)}
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.7"
        />
        <line
          x1={padding.left}
          y1={getYVar(config.alert_threshold)}
          x2={width - padding.right}
          y2={getYVar(config.alert_threshold)}
          stroke="#f43f5e"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {variancePath && (
          <path
            d={variancePath}
            fill="rgba(245, 158, 11, 0.18)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
        )}

        {rssiPath && (
          <path
            d={rssiPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.8"
          />
        )}

        <text x={padding.left - 5} y={padding.top + 10} fill="#71717a" fontSize="9" textAnchor="end">
          {maxRssi}dB
        </text>
        <text x={padding.left - 5} y={padding.top + innerHeight} fill="#71717a" fontSize="9" textAnchor="end">
          {minRssi}dB
        </text>
      </svg>
    </div>
  );
};
