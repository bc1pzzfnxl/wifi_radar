import React, { useRef, useEffect, useState } from 'react';
import type { RadarTarget, PresenceState } from '../types/radar';

interface RadarScopeProps {
  targets: RadarTarget[];
  globalState: PresenceState;
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  maxDistance?: number;
  sweepSpeed?: number;
}

export const RadarScope: React.FC<RadarScopeProps> = ({
  targets,
  globalState,
  selectedTargetId,
  onSelectTarget,
  maxDistance = 15,
  sweepSpeed = 0.025
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const [hoveredTarget, setHoveredTarget] = useState<RadarTarget | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height > 100 ? rect.height : w;
      const size = Math.max(260, Math.min(w, h));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!canvas || !containerRef.current) return;
      const size = parseFloat(canvas.style.width || '500');
      const center = size / 2;
      const radius = center - 24;

      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center - radius, center);
      ctx.lineTo(center + radius, center);
      ctx.moveTo(center, center - radius);
      ctx.lineTo(center, center + radius);
      ctx.stroke();

      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        const x1 = center + Math.cos(rad) * (radius - 6);
        const y1 = center + Math.sin(rad) * (radius - 6);
        const x2 = center + Math.cos(rad) * radius;
        const y2 = center + Math.sin(rad) * radius;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const rings = [2, 5, 10, 15];
      rings.forEach((rDist) => {
        const r = (rDist / maxDistance) * radius;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${rDist}m`, center + 6, center - r + 11);
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', center, center - radius + 14);
      ctx.fillText('S', center, center + radius - 6);
      ctx.fillText('E', center + radius - 10, center + 3);
      ctx.fillText('W', center - radius + 10, center + 3);

      sweepAngleRef.current = (sweepAngleRef.current + sweepSpeed) % (Math.PI * 2);
      const sweepAngle = sweepAngleRef.current;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, sweepAngle - 0.35, sweepAngle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      sweepGrad.addColorStop(0, 'rgba(15, 23, 42, 0.07)');
      sweepGrad.addColorStop(1, 'rgba(15, 23, 42, 0.01)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(sweepAngle) * radius, center + Math.sin(sweepAngle) * radius);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      targets.forEach((target) => {
        const targetRad = ((target.angle_deg - 90) * Math.PI) / 180;
        const targetR = Math.min(radius - 8, (target.distance_m / maxDistance) * radius);
        const tx = center + Math.cos(targetRad) * targetR;
        const ty = center + Math.sin(targetRad) * targetR;

        const isSelected = target.id === selectedTargetId;
        const isHovered = target.id === hoveredTarget?.id;

        let dotColor = '#0f172a';
        let ringColor = 'rgba(15, 23, 42, 0.15)';

        if (target.state === 'INTRUSION_ALERT') {
          dotColor = '#e11d48';
          ringColor = 'rgba(225, 29, 72, 0.2)';
        } else if (target.state === 'MOTION_DETECTED') {
          dotColor = '#d97706';
          ringColor = 'rgba(217, 119, 6, 0.2)';
        } else if (target.state === 'STATIONARY_PRESENCE') {
          dotColor = '#18181b';
          ringColor = 'rgba(24, 24, 27, 0.12)';
        }

        if (target.state === 'MOTION_DETECTED' || target.state === 'INTRUSION_ALERT') {
          const waveR = 8 + (Math.sin(Date.now() / 180) + 1) * 4;
          ctx.beginPath();
          ctx.arc(tx, ty, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, isSelected || isHovered ? 6.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#0f172a';
        ctx.font = '500 10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${target.id} (${target.rssi}dBm)`, tx + 8, ty + 3);

        if (isSelected || isHovered) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx - 9, ty - 9, 18, 18);
        }
      });

      ctx.beginPath();
      ctx.arc(center, center, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [targets, selectedTargetId, hoveredTarget, maxDistance, sweepSpeed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = rect.width;
    const center = size / 2;
    const radius = center - 24;

    let found: RadarTarget | null = null;
    for (const t of targets) {
      const targetRad = ((t.angle_deg - 90) * Math.PI) / 180;
      const targetR = Math.min(radius - 8, (t.distance_m / maxDistance) * radius);
      const tx = center + Math.cos(targetRad) * targetR;
      const ty = center + Math.sin(targetRad) * targetR;
      const dist = Math.hypot(x - tx, y - ty);
      if (dist < 16) {
        found = t;
        break;
      }
    }
    setHoveredTarget(found);
  };

  const handleClick = () => {
    if (hoveredTarget) {
      onSelectTarget(hoveredTarget.id === selectedTargetId ? null : hoveredTarget.id);
    } else {
      onSelectTarget(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full min-h-[440px] p-4 select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredTarget(null)}
        onClick={handleClick}
        className="cursor-crosshair rounded-full shadow-xs"
      />
      {hoveredTarget && (
        <div className="absolute top-4 left-4 bg-white border border-zinc-200/90 p-3 rounded-xl text-xs text-zinc-800 pointer-events-none shadow-md z-20 min-w-[170px]">
          <div className="font-semibold text-zinc-900">{hoveredTarget.id}</div>
          <div className="text-zinc-400 font-mono text-[10px]">{hoveredTarget.mac_masked}</div>
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">RSSI:</span>
              <span className="font-mono font-semibold text-zinc-900">{hoveredTarget.rssi} dBm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Variance:</span>
              <span className="font-mono font-semibold text-amber-700">{hoveredTarget.variance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Distance:</span>
              <span className="font-mono font-semibold text-zinc-900">{hoveredTarget.distance_m} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">State:</span>
              <span className="font-semibold text-zinc-900">{hoveredTarget.state}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
