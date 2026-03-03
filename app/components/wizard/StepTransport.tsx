'use client'

import { WizardData } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

const TRANSPORT_MODES = [
  { id: 'truck', name: 'Lastbil', icon: '🚛', factor: 0.1 },
  { id: 'rail', name: 'Tåg', icon: '🚂', factor: 0.02 },
  { id: 'ship', name: 'Fartyg', icon: '🚢', factor: 0.015 },
] as const

const COMMON_ROUTES = [
  { from: 'Kina', to: 'Sverige', distance: 8000, mode: 'ship' as const },
  { from: 'Tyskland', to: 'Sverige', distance: 1000, mode: 'truck' as const },
  { from: 'Polen', to: 'Sverige', distance: 700, mode: 'truck' as const },
  { from: 'Sverige (lokalt)', to: 'Kund', distance: 200, mode: 'truck' as const },
]

export default function StepTransport({ data, onChange }: Props) {
  const selectedMode = TRANSPORT_MODES.find((m) => m.id === data.transportMode)

  // Calculate transport emissions preview
  const supplierWeight = data.materials.reduce((sum, m) => sum + (m.unit === 'kg' ? m.quantity : 0), 0)
  const transportEmissions = (
    data.supplierDistance * supplierWeight * (selectedMode?.factor || 0.1) / 1000 +
    data.customerDistance * supplierWeight * (selectedMode?.factor || 0.1) / 1000
  )

  return (
    <div className="max-w-xl">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 5 — Transport
      </span>

      {/* Heading */}
      <h1 className="font-display text-4xl font-light mt-3 mb-2">
        Hur transporteras materialet?
      </h1>
      <p className="text-trace-text-secondary mb-8">
        Upstream (leverantör → fabrik) och downstream (fabrik → kund).
      </p>

      {/* Transport mode selection */}
      <div className="mb-8">
        <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-3">
          Transportmetod (huvudsaklig)
        </label>
        <div className="flex gap-2">
          {TRANSPORT_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange({ transportMode: mode.id as 'truck' | 'rail' | 'ship' })}
              className={`flex-1 p-4 rounded border transition-all
                ${data.transportMode === mode.id
                  ? 'bg-trace-surface-2 border-sis-pomegranate'
                  : 'bg-trace-surface border-trace-border hover:border-trace-border-light'
                }`}
            >
              <span className="text-2xl block mb-1">{mode.icon}</span>
              <span className="text-sm text-trace-text">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distances */}
      <div className="space-y-6">
        {/* Supplier distance */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            <span className="mr-2">📥</span>
            Avstånd från leverantör
          </label>
          <div className="relative">
            <input
              type="number"
              value={data.supplierDistance || ''}
              onChange={(e) => onChange({ supplierDistance: parseFloat(e.target.value) || 0 })}
              placeholder="200"
              className="w-full px-4 py-3 pr-16 bg-trace-surface border border-trace-border rounded
                text-trace-text placeholder:text-trace-text-muted
                focus:outline-none focus:border-sis-pomegranate transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-trace-text-muted">
              km
            </span>
          </div>

          {/* Quick select */}
          <div className="flex flex-wrap gap-2 mt-2">
            {COMMON_ROUTES.slice(0, 3).map((route) => (
              <button
                key={route.from}
                onClick={() => onChange({
                  supplierDistance: route.distance,
                  transportMode: route.mode,
                })}
                className="px-3 py-1 text-xs bg-trace-surface border border-trace-border rounded
                  text-trace-text-muted hover:text-trace-text hover:border-trace-border-light transition-colors"
              >
                {route.from} ({route.distance} km)
              </button>
            ))}
          </div>
        </div>

        {/* Customer distance */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            <span className="mr-2">📤</span>
            Avstånd till kund
          </label>
          <div className="relative">
            <input
              type="number"
              value={data.customerDistance || ''}
              onChange={(e) => onChange({ customerDistance: parseFloat(e.target.value) || 0 })}
              placeholder="100"
              className="w-full px-4 py-3 pr-16 bg-trace-surface border border-trace-border rounded
                text-trace-text placeholder:text-trace-text-muted
                focus:outline-none focus:border-sis-pomegranate transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-trace-text-muted">
              km
            </span>
          </div>
          <p className="mt-2 text-xs text-trace-text-muted">
            Genomsnittlig leveransdistans till slutkund.
          </p>
        </div>
      </div>

      {/* Transport emissions preview */}
      <div className="mt-8 p-4 bg-trace-surface rounded border border-trace-border">
        <div className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted mb-3">
          Transport-preview
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-trace-text-secondary">Upstream</span>
            <span className="font-mono text-sm text-trace-text">
              {data.supplierDistance || 0} km × {supplierWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-trace-text-secondary">Downstream</span>
            <span className="font-mono text-sm text-trace-text">
              {data.customerDistance || 0} km × {supplierWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="pt-2 border-t border-trace-border flex justify-between">
            <span className="text-sm font-medium text-trace-text">Transport totalt (Scope 3)</span>
            <span className="font-mono text-sm font-medium text-sis-pomegranate">
              ~{transportEmissions.toFixed(1)} kg CO₂e
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
