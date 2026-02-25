'use client'

import { useState } from 'react'
import { ArrowRight, Factory, Package, Wrench, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const templates = [
  {
    id: 'furniture',
    name: 'Möbel',
    icon: '🪑',
    example: 'Kontorsstol',
    description: 'Möbler med stål, trä, textil och skum',
    components: [
      { name: 'Stålfot med hjul', quantity: '4.5 kg', impact: 42 },
      { name: 'Sits med skumstoppning', quantity: '2.2 kg', impact: 31 },
      { name: 'Ryggstöd', quantity: '1.8 kg', impact: 19 },
      { name: 'Gasdämpare', quantity: '0.6 kg', impact: 8 },
    ],
    totalCO2: 12.4,
    totalWater: 847,
    circularity: 34,
  },
  {
    id: 'food',
    name: 'Livsmedel',
    icon: '📦',
    example: 'Förpackat livsmedel (500g)',
    description: 'Livsmedelsförpackningar i kartong och plast',
    components: [
      { name: 'Primärförpackning', quantity: '35 g', impact: 48 },
      { name: 'Sekundärförpackning', quantity: '120 g', impact: 32 },
      { name: 'Pall och krympfilm', quantity: '50 g', impact: 20 },
    ],
    totalCO2: 0.28,
    totalWater: 12,
    circularity: 62,
  },
  {
    id: 'workshop',
    name: 'Verkstad',
    icon: '⚙️',
    example: 'CNC-bearbetad detalj',
    description: 'Bearbetade ståldetaljer med ytbehandling',
    components: [
      { name: 'Stålämne', quantity: '2.5 kg', impact: 65 },
      { name: 'Ytbehandling', quantity: '0.1 kg', impact: 22 },
      { name: 'Förpackning', quantity: '0.2 kg', impact: 13 },
    ],
    totalCO2: 5.8,
    totalWater: 320,
    circularity: 25,
  },
]

export default function DemoPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const template = templates.find((t) => t.id === selected)

  return (
    <main className="min-h-screen bg-sis-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <header>
          <Link href="/" className="text-sm text-sis-pomegranate hover:underline mb-4 inline-block">
            &larr; Tillbaka
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-sis-gray-900 mb-2">
            Testa 2030+ Calculator
          </h1>
          <p className="text-sis-gray-600 text-lg">
            Välj din bransch nedan och se ett resultat direkt - inget konto krävs.
          </p>
        </header>

        {/* Template selector */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`text-left rounded-2xl p-6 border-2 transition-all duration-300
                ${selected === t.id
                  ? 'border-sis-pomegranate bg-white shadow-lg scale-[1.02]'
                  : 'border-sis-gray-200 bg-white hover:border-sis-gray-300 hover:shadow-md'
                }`}
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="text-lg font-semibold text-sis-gray-900 mb-1">{t.name}</h3>
              <p className="text-sm text-sis-gray-500 mb-2">{t.description}</p>
              <span className="text-xs text-sis-pomegranate font-medium">
                Exempelprodukt: {t.example}
              </span>
            </button>
          ))}
        </section>

        {/* Result preview */}
        {template && (
          <section className="bg-white rounded-2xl border border-sis-gray-200 shadow-sm overflow-hidden animate-fade-in">
            {/* Product header */}
            <div className="bg-gradient-to-r from-sis-pomegranate to-red-700 text-white p-6">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <Factory className="w-4 h-4" />
                Exempelresultat &middot; {template.name}
              </div>
              <h2 className="text-2xl font-bold">{template.example}</h2>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 border-b border-sis-gray-200">
              <div className="p-6 text-center border-r border-sis-gray-200">
                <div className="text-xs text-sis-gray-500 uppercase tracking-wide mb-1">Klimatpåverkan</div>
                <div className="text-2xl font-bold text-sis-gray-900">{template.totalCO2}</div>
                <div className="text-xs text-sis-gray-500">kg CO&#x2082;e</div>
              </div>
              <div className="p-6 text-center border-r border-sis-gray-200">
                <div className="text-xs text-sis-gray-500 uppercase tracking-wide mb-1">Vattenförbrukning</div>
                <div className="text-2xl font-bold text-sis-gray-900">{template.totalWater}</div>
                <div className="text-xs text-sis-gray-500">liter</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-xs text-sis-gray-500 uppercase tracking-wide mb-1">Cirkularitet</div>
                <div className="text-2xl font-bold text-sis-gray-900">{template.circularity}%</div>
                <div className="text-xs text-sis-gray-500">återvunnet</div>
              </div>
            </div>

            {/* Component breakdown */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-sis-gray-700 uppercase tracking-wide mb-4">
                Komponentfördelning
              </h3>
              <div className="space-y-3">
                {template.components.map((comp) => (
                  <div key={comp.name} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-sis-gray-900 font-medium">{comp.name}</span>
                        <span className="text-sis-gray-500">{comp.quantity}</span>
                      </div>
                      <div className="w-full bg-sis-gray-100 rounded-full h-2">
                        <div
                          className="bg-sis-pomegranate rounded-full h-2 transition-all duration-500"
                          style={{ width: `${comp.impact}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-sis-gray-700 w-12 text-right">
                      {comp.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-sis-gray-200 p-6 bg-sis-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-sis-gray-600">
                  Det här är ett exempelresultat. Skapa ett konto för att analysera dina egna produkter
                  och få ett delbart hållbarhetsbevis.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sis-pomegranate
                             text-white font-medium rounded-xl hover:bg-red-700
                             transition-all duration-300 hover:shadow-lg whitespace-nowrap"
                >
                  Skapa konto
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Existing product link */}
        {!selected && (
          <div className="text-center pt-4">
            <p className="text-sm text-sis-gray-500 mb-2">Eller se en färdig analys direkt:</p>
            <Link
              href="/products/1"
              className="inline-flex items-center gap-1 text-sis-pomegranate font-medium hover:underline"
            >
              Skandiform Kontorsstol Ergo Pro
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
