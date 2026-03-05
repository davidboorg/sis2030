'use client'

import { useState } from 'react'
import { WizardData, SWEDISH_CITIES } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export default function StepCompany({ data, onChange }: Props) {
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const filteredCities = SWEDISH_CITIES.filter((city) =>
    city.toLowerCase().includes(data.location.toLowerCase())
  ).slice(0, 5)

  return (
    <div className="max-w-md">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 1 — Företagsprofil
      </span>

      {/* Heading */}
      <h1 className="font-display text-4xl font-light mt-3 mb-2">
        Berätta om ditt företag
      </h1>
      <p className="text-trace-text-secondary mb-8">
        Denna information hjälper oss ge dig relevanta branschjämförelser.
      </p>

      {/* Form */}
      <div className="space-y-6">
        {/* Company name */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            Företagsnamn
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="T.ex. Möbelfabriken AB"
            className="w-full px-4 py-3 bg-trace-surface border border-trace-border rounded
              text-trace-text placeholder:text-trace-text-muted
              focus:outline-none focus:border-sis-pomegranate transition-colors"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <label className="block font-mono text-xs uppercase tracking-wider text-trace-text-muted mb-2">
            Ort
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
            placeholder="T.ex. Tibro"
            className="w-full px-4 py-3 bg-trace-surface border border-trace-border rounded
              text-trace-text placeholder:text-trace-text-muted
              focus:outline-none focus:border-sis-pomegranate transition-colors"
          />

          {/* City suggestions */}
          {showCitySuggestions && filteredCities.length > 0 && data.location && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-trace-surface border border-trace-border rounded shadow-lg">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onChange({ location: city })
                    setShowCitySuggestions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-trace-text hover:bg-trace-surface-2 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-sm text-trace-text-muted">
          Dina uppgifter sparas endast lokalt under demo-sessionen.
        </p>
      </div>
    </div>
  )
}
