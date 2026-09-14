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
  sweepSpeed = 0.03
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const [hoveredTarget, setHoveredTarget] = useState<RadarTarget | null>(null);
  const [pulseRadius, setPulseRadius] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
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
      const radius = center - 20;

      ctx.clearRect(0, 0, size, size);

      const bgGradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      bgGradient.addColorStop(0, '#04160c');
      bgGradient.addColorStop(0.7, '#020b06');
      bgGradient.addColorStop(1, '#010503');
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0d381e';
      ctx.lineWidth = 1;
      const rings = [2, 5, 10, 15];
      rings.forEach((rDist) => {
        const r = (rDist / maxDistance) * radius;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b98188';
        ctx.font = '10px monospace';
        ctx.fillText(`${rDist}m`, center + 4, center - r + 12);
      });

      ctx.strokeStyle = '#0d381e44';
      ctx.beginPath();
      ctx.moveTo(center - radius, center);
      ctx.lineTo(center + radius, center);
      ctx.moveTo(center, center - radius);
      ctx.lineTo(center, center + radius);
      ctx.stroke();

      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        const x1 = center + Math.cos(rad) * (radius - 8);
        const y1 = center + Math.sin(rad) * (radius - 8);
        const x2 = center + Math.cos(rad) * radius;
        const y2 = center + Math.sin(rad) * radius;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.fillStyle = '#10b981aa';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', center, center - radius + 15);
      ctx.fillText('S', center, center + radius - 5);
      ctx.fillText('E', center + radius - 12, center + 4);
      ctx.fillText('W', center - radius + 12, center + 4);

      sweepAngleRef.current = (sweepAngleRef.current + sweepSpeed) % (Math.PI * 2);
      const sweepAngle = sweepAngleRef.current;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, sweepAngle - 0.45, sweepAngle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(sweepAngle) * radius, center + Math.sin(sweepAngle) * radius);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      targets.forEach((target) => {
        const targetRad = ((target.angle_deg - 90) * Math.PI) / 180;
        const targetR = Math.min(radius - 5, (target.distance_m / maxDistance) * radius);
        const tx = center + Math.cos(targetRad) * targetR;
        const ty = center + Math.sin(targetRad) * targetR;

        const isSelected = target.id === selectedTargetId;
        const isHovered = target.id === hoveredTarget?.id;

        let color = '#10b981';
        let glowColor = 'rgba(16, 185, 129, 0.5)';
        if (target.state === 'INTRUSION_ALERT') {
          color = '#f43f5e';
          glowColor = 'rgba(244, 63, 94, 0.8)';
        } else if (target.state === 'MOTION_DETECTED') {
          color = '#f59e0b';
          glowColor = 'rgba(245, 158, 11, 0.7)';
        } else if (target.state === 'STATIONARY_PRESENCE') {
          color = '#22c55e';
          glowColor = 'rgba(34, 197, 94, 0.6)';
        }

        if (target.state === 'MOTION_DETECTED' || target.state === 'INTRUSION_ALERT') {
          const waveR = 8 + (Math.sin(Date.now() / 150) + 1) * 6;
          ctx.beginPath();
          ctx.arc(tx, ty, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, isSelected || isHovered ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#e2f5e8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${target.id} (${target.rssi}dBm)`, tx + 9, ty + 3);

        if (isSelected || isHovered) {
          ctx.strokeStyle = '#e2f5e8';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx - 10, ty - 10, 20, 20);
        }
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

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
    const radius = center - 20;

    let found: RadarTarget | null = null;
    for (const t of targets) {
      const targetRad = ((t.angle_deg - 90) * Math.PI) / 180;
      const targetR = Math.min(radius - 5, (t.distance_m / maxDistance) * radius);
      const tx = center + Math.cos(targetRad) * targetR;
      const ty = center + Math.sin(targetRad) * targetR;
      const dist = Math.hypot(x - tx, y - ty);
      if (dist < 15) {
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
      className="relative flex items-center justify-center w-full h-full min-h-[420px] p-2 select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredTarget(null)}
        onClick={handleClick}
        className="cursor-crosshair rounded-full shadow-[0_0_35px_rgba(16,185,129,0.12)] border border-emerald-900/60"
      />
      {hoveredTarget && (
        <div className="absolute top-4 left-4 bg-zinc-950/90 border border-emerald-500/60 p-2.5 rounded text-xs font-mono text-emerald-200 pointer-events-none shadow-xl z-20">
          <div className="font-bold text-emerald-400">{hoveredTarget.id}</div>
          <div className="text-zinc-400 text-[10px]">{hoveredTarget.mac_masked}</div>
          <div className="mt-1 flex justify-between gap-4">
            <span>RSSI:</span>
            <span className="text-white font-bold">{hoveredTarget.rssi} dBm</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Variance:</span>
            <span className="text-amber-300 font-bold">{hoveredTarget.variance}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Distance:</span>
            <span className="text-emerald-300 font-bold">{hoveredTarget.distance_m} m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Status:</span>
            <span className="text-white uppercase font-bold">{hoveredTarget.state}</span>
          </div>
        </div>
      )}
    </div>
  );
};
