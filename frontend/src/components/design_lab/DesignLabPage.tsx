import React, { useState } from 'react';
import { VariantA } from './VariantA';
import { VariantB } from './VariantB';
import { VariantC } from './VariantC';
import { VariantD } from './VariantD';
import { VariantE } from './VariantE';
import { FeedbackOverlay } from './FeedbackOverlay';
import { LayoutGrid, CheckCircle2 } from 'lucide-react';

export const DesignLabPage: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'ALL' | 'A' | 'B' | 'C' | 'D' | 'E'>('ALL');

  const variants = [
    { id: 'A', title: 'Variant A: Precision Monochrome HUD', axis: 'Hierarchy & Hairline Spatial Focus', Component: VariantA },
    { id: 'B', title: 'Variant B: Tabular Inspector & Segmented Cockpit', axis: 'Layout Model & Tabular Data', Component: VariantB },
    { id: 'C', title: 'Variant C: High-Density Pro Console', axis: 'Density Variation & Compact Instrumentation', Component: VariantC },
    { id: 'D', title: 'Variant D: Master-Detail Interactive Inspector', axis: 'Interaction Model & Entity Drilldown', Component: VariantD },
    { id: 'E', title: 'Variant E: Minimalist Spatial Instrument', axis: 'Apple Hardware Aesthetic & Hero Radar Scope', Component: VariantE },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-8 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-xs font-semibold">LAB</span>
              <h1 className="font-bold text-base tracking-tight text-zinc-900">WiFi Radar Design Lab</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Target: <code className="text-zinc-800 font-mono">RadarDashboard.tsx</code> · Aesthetic: Apple Minimalist White-First · 5 Meaningfully Distinct Variants
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80">
            <button
              onClick={() => setSelectedVariant('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedVariant === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All (5)
            </button>
            {(['A', 'B', 'C', 'D', 'E'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedVariant === v ? 'bg-zinc-900 text-white shadow-2xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Variant {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
        {variants
          .filter((v) => selectedVariant === 'ALL' || selectedVariant === v.id)
          .map((v) => (
            <section key={v.id} data-variant={v.id} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold font-mono flex items-center justify-center">
                    {v.id}
                  </span>
                  <div>
                    <h2 className="font-bold text-sm text-zinc-900">{v.title}</h2>
                    <span className="text-xs text-zinc-400">{v.axis}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hardware ath9k_htc Compatible</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-xs">
                <v.Component />
              </div>
            </section>
          ))}
      </main>

      <FeedbackOverlay targetName="RadarDashboard" />
    </div>
  );
};
