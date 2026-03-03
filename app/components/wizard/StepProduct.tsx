'use client'

import { WizardData, Industry, INDUSTRY_TEMPLATES } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

const industries: Industry[] = ['furniture', 'textile', 'construction', 'food', 'workshop']

export default function StepProduct({ data, onChange }: Props) {
  const handleSelect = (industry: Industry) => {
    const template = INDUSTRY_TEMPLATES[industry]
    onChange({
      industry,
      templateId: industry,
      productName: template.exampleProduct,
      materials: template.defaultMaterials.map((m) => ({ ...m, isDefault: true })),
      electricityKwh: template.defaultElectricity,
      heatKwh: template.defaultHeat,
    })
  }

  return (
    <div className="max-w-2xl">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 2 — Välj produkt
      </span>

      {/* Heading */}
      <h1 className="font-display text-4xl font-light mt-3 mb-2">
        Vilken typ av produkt tillverkar du?
      </h1>
      <p className="text-trace-text-secondary mb-8">
        Vi förifyller med branschsnitt — du justerar sedan det som avviker.
      </p>

      {/* Industry grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {industries.map((industry) => {
          const template = INDUSTRY_TEMPLATES[industry]
          const isSelected = data.templateId === industry

          return (
            <button
              key={industry}
              onClick={() => handleSelect(industry)}
              className={`relative p-6 text-left rounded border transition-all
                ${isSelected
                  ? 'bg-trace-surface-2 border-sis-pomegranate'
                  : 'bg-trace-surface border-trace-border hover:border-trace-border-light hover:bg-trace-surface-2'
                }`}
            >
              {/* Accent line when selected */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sis-pomegranate to-transparent rounded-t" />
              )}

              {/* Icon and title */}
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <div className="font-medium text-trace-text">{template.name}</div>
                  <div className="text-sm text-trace-text-muted mt-1">
                    {template.context}
                  </div>
                </div>
              </div>

              {/* Example product */}
              <div className="mt-4 pt-4 border-t border-trace-border">
                <span className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted">
                  Exempel
                </span>
                <div className="text-sm text-trace-text-secondary mt-1">
                  {template.exampleProduct}
                </div>
              </div>

              {/* Checkmark when selected */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-sis-pomegranate rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom product option */}
      <div className="mt-6 p-4 border border-dashed border-trace-border rounded">
        <div className="flex items-center gap-3 text-trace-text-muted">
          <span className="text-xl">📝</span>
          <div>
            <div className="font-medium text-trace-text-secondary">Egen produkt?</div>
            <div className="text-sm">
              Välj närmaste bransch ovan och anpassa material i nästa steg.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
