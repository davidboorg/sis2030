'use client'

import { useState } from 'react'
import { WizardData, Material } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

type InputMode = 'weight' | 'spend'

export default function StepMaterials({ data, onChange }: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('weight')

  // Spend values stored separately (not in main data model yet)
  const [spendValues, setSpendValues] = useState<Record<string, number>>(
    Object.fromEntries(data.materials.map((m) => [m.id, m.quantity * 150])) // Rough SEK estimate
  )

  const updateMaterial = (id: string, quantity: number) => {
    const updated = data.materials.map((m) =>
      m.id === id ? { ...m, quantity, isDefault: false } : m
    )
    onChange({ materials: updated })
  }

  const updateSpend = (id: string, amount: number) => {
    setSpendValues((prev) => ({ ...prev, [id]: amount }))
  }

  const addMaterial = () => {
    const newMaterial: Material = {
      id: `custom-${Date.now()}`,
      name: '',
      quantity: 0,
      unit: 'kg',
    }
    onChange({ materials: [...data.materials, newMaterial] })
  }

  const removeMaterial = (id: string) => {
    onChange({ materials: data.materials.filter((m) => m.id !== id) })
  }

  const updateMaterialName = (id: string, name: string) => {
    const updated = data.materials.map((m) =>
      m.id === id ? { ...m, name, isDefault: false } : m
    )
    onChange({ materials: updated })
  }

  return (
    <div className="max-w-xl">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 3 — Material
      </span>

      {/* Heading */}
      <h1 className="font-display text-4xl font-light mt-3 mb-2">
        Vad består produkten av?
      </h1>
      <p className="text-trace-text-secondary mb-6">
        Vi har förifyllt baserat på branschsnitt. Justera det som avviker.
      </p>

      {/* Input mode toggle */}
      <div className="flex gap-1 p-1 bg-trace-surface rounded mb-6">
        <button
          onClick={() => setInputMode('weight')}
          className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded transition-colors
            ${inputMode === 'weight'
              ? 'bg-trace-surface-2 text-trace-text'
              : 'text-trace-text-muted hover:text-trace-text'
            }`}
        >
          <span className="mr-2">⚖️</span>
          Vikt (kg)
        </button>
        <button
          onClick={() => setInputMode('spend')}
          className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded transition-colors
            ${inputMode === 'spend'
              ? 'bg-trace-surface-2 text-trace-text'
              : 'text-trace-text-muted hover:text-trace-text'
            }`}
        >
          <span className="mr-2">💰</span>
          Utgifter (kr)
        </button>
      </div>

      {/* Info banner for spend mode */}
      {inputMode === 'spend' && (
        <div className="mb-6 p-4 bg-trace-surface border border-trace-border rounded">
          <div className="flex gap-3">
            <span className="text-lg">💡</span>
            <div>
              <div className="text-sm text-trace-text">
                Utgiftsbaserad input ger en snabb uppskattning (±30% osäkerhet).
              </div>
              <div className="text-xs text-trace-text-muted mt-1">
                För högre precision, använd viktbaserad input.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Materials list */}
      <div className="space-y-3">
        {data.materials.map((material) => (
          <div
            key={material.id}
            className={`p-4 rounded border transition-colors ${
              material.isDefault
                ? 'bg-trace-surface-2 border-trace-border'
                : 'bg-trace-surface border-trace-border-light'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Material name */}
              <div className="flex-1">
                {material.isDefault ? (
                  <span className="text-trace-text">{material.name}</span>
                ) : (
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterialName(material.id, e.target.value)}
                    placeholder="Materialnamn"
                    className="w-full bg-transparent text-trace-text placeholder:text-trace-text-muted
                      focus:outline-none border-b border-trace-border focus:border-sis-pomegranate"
                  />
                )}
                {material.isDefault && (
                  <span className="ml-2 text-[10px] font-mono uppercase text-trace-text-muted">
                    Branschsnitt
                  </span>
                )}
              </div>

              {/* Quantity input */}
              <div className="flex items-center gap-2">
                {inputMode === 'weight' ? (
                  <>
                    <input
                      type="number"
                      value={material.quantity || ''}
                      onChange={(e) => updateMaterial(material.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 bg-trace-surface border border-trace-border rounded
                        text-right text-trace-text font-mono
                        focus:outline-none focus:border-sis-pomegranate"
                    />
                    <span className="font-mono text-sm text-trace-text-muted w-8">
                      {material.unit}
                    </span>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      value={spendValues[material.id] || ''}
                      onChange={(e) => updateSpend(material.id, parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-trace-surface border border-trace-border rounded
                        text-right text-trace-text font-mono
                        focus:outline-none focus:border-sis-pomegranate"
                    />
                    <span className="font-mono text-sm text-trace-text-muted w-8">
                      kr
                    </span>
                  </>
                )}

                {/* Remove button */}
                {!material.isDefault && (
                  <button
                    onClick={() => removeMaterial(material.id)}
                    className="p-1 text-trace-text-muted hover:text-sis-pomegranate transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add material button */}
      <button
        onClick={addMaterial}
        className="mt-4 w-full p-3 border border-dashed border-trace-border rounded
          text-trace-text-muted hover:text-trace-text hover:border-trace-border-light
          transition-colors font-mono text-sm"
      >
        + Lägg till material
      </button>

      {/* Total summary */}
      {inputMode === 'weight' && (
        <div className="mt-6 pt-4 border-t border-trace-border">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs uppercase text-trace-text-muted">
              Total vikt
            </span>
            <span className="font-mono text-lg text-trace-text">
              {data.materials
                .filter((m) => m.unit === 'kg')
                .reduce((sum, m) => sum + m.quantity, 0)
                .toFixed(1)}{' '}
              kg
            </span>
          </div>
        </div>
      )}

      {inputMode === 'spend' && (
        <div className="mt-6 pt-4 border-t border-trace-border">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs uppercase text-trace-text-muted">
              Total utgift
            </span>
            <span className="font-mono text-lg text-trace-text">
              {Object.values(spendValues)
                .reduce((sum, v) => sum + v, 0)
                .toLocaleString('sv-SE')}{' '}
              kr
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
