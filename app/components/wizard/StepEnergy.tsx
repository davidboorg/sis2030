'use client'

import { WizardData, INDUSTRY_TEMPLATES } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export default function StepEnergy({ data, onChange }: Props) {
  const template = data.templateId ? INDUSTRY_TEMPLATES[data.templateId] : null

  return (
    <div className="max-w-md">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 4 — Tillverkning
      </span>

      {/* Heading */}
      <h1 className="font-display text-4xl font-light mt-3 mb-2">
        Hur mycket energi går åt?
      </h1>
      <p className="text-trace-text-secondary mb-8">
        Ange energiförbrukning per producerad enhet.
        {template && (
          <span className="block mt-1 text-trace-text-muted">
            Branschsnitt för {template.name.toLowerCase()}: ~{template.defaultElectricity} kWh el, ~{template.defaultHeat} kWh värme.
          </span>
        )}
      </p>

      {/* Form */}
      <div className="space-y-6">
        {/* Electricity */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            <span className="mr-2">⚡</span>
            El (kWh per enhet)
          </label>
          <div className="relative">
            <input
              type="number"
              value={data.electricityKwh || ''}
              onChange={(e) => onChange({ electricityKwh: parseFloat(e.target.value) || 0 })}
              placeholder={template ? String(template.defaultElectricity) : '15'}
              className={`w-full px-4 py-3 pr-16 rounded border
                text-trace-text placeholder:text-trace-text-muted
                focus:outline-none focus:border-sis-pomegranate transition-colors
                ${data.electricityKwh === template?.defaultElectricity
                  ? 'bg-trace-surface-2 border-trace-border'
                  : 'bg-trace-surface border-trace-border'
                }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-trace-text-muted">
              kWh
            </span>
          </div>
          <p className="mt-2 text-xs text-trace-text-muted">
            El från det svenska elnätet (nordisk mix).
          </p>
        </div>

        {/* Heat */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            <span className="mr-2">🔥</span>
            Värme (kWh per enhet)
          </label>
          <div className="relative">
            <input
              type="number"
              value={data.heatKwh || ''}
              onChange={(e) => onChange({ heatKwh: parseFloat(e.target.value) || 0 })}
              placeholder={template ? String(template.defaultHeat) : '5'}
              className={`w-full px-4 py-3 pr-16 rounded border
                text-trace-text placeholder:text-trace-text-muted
                focus:outline-none focus:border-sis-pomegranate transition-colors
                ${data.heatKwh === template?.defaultHeat
                  ? 'bg-trace-surface-2 border-trace-border'
                  : 'bg-trace-surface border-trace-border'
                }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-trace-text-muted">
              kWh
            </span>
          </div>
          <p className="mt-2 text-xs text-trace-text-muted">
            Fjärrvärme eller egen panna.
          </p>
        </div>

        {/* Process emissions checkbox */}
        <div className="pt-4 border-t border-trace-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.processEmissions}
              onChange={(e) => onChange({ processEmissions: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-trace-border bg-trace-surface
                checked:bg-sis-pomegranate checked:border-sis-pomegranate
                focus:ring-sis-pomegranate focus:ring-offset-0"
            />
            <div>
              <span className="text-trace-text">
                Direkta processemissioner
              </span>
              <p className="text-sm text-trace-text-muted mt-1">
                T.ex. svetsning, härdning, kemiska reaktioner. Lämna omarkerad om osäker.
              </p>
            </div>
          </label>
        </div>

        {/* Energy breakdown preview */}
        <div className="mt-6 p-4 bg-trace-surface rounded border border-trace-border">
          <div className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted mb-3">
            Energi-preview
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-trace-text-secondary">El</span>
              <span className="font-mono text-sm text-trace-text">
                {data.electricityKwh || 0} kWh → ~{((data.electricityKwh || 0) * 0.05).toFixed(1)} kg CO₂e
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-trace-text-secondary">Värme</span>
              <span className="font-mono text-sm text-trace-text">
                {data.heatKwh || 0} kWh → ~{((data.heatKwh || 0) * 0.1).toFixed(1)} kg CO₂e
              </span>
            </div>
            <div className="pt-2 border-t border-trace-border flex justify-between">
              <span className="text-sm font-medium text-trace-text">Scope 2 totalt</span>
              <span className="font-mono text-sm font-medium text-sis-pomegranate">
                ~{((data.electricityKwh || 0) * 0.05 + (data.heatKwh || 0) * 0.1).toFixed(1)} kg CO₂e
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
