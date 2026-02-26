'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type Template = {
  id: string
  name: string
  icon: string
  example: string
  materials: string[]
  context: string
}

const templates: Template[] = [
  {
    id: 'furniture',
    name: 'Möbel',
    icon: '🪑',
    example: 'Kontorsstol',
    materials: ['Stål', 'Skum', 'Textil', 'Montering'],
    context: 'Tibro, Tranås, Lammhult',
  },
  {
    id: 'food',
    name: 'Livsmedel',
    icon: '📦',
    example: 'Förpackat livsmedel',
    materials: ['Kartong', 'Plast', 'Pall', 'Distribution'],
    context: 'Förpackning och logistik',
  },
  {
    id: 'workshop',
    name: 'Verkstad',
    icon: '⚙️',
    example: 'CNC-bearbetad detalj',
    materials: ['Stål', 'CNC', 'Ytbehandling'],
    context: 'Underleverantör fordon/industri',
  },
  {
    id: 'construction',
    name: 'Bygg & Fastighet',
    icon: '🏗️',
    example: 'Byggelement',
    materials: ['Betong', 'Stål', 'Isolering'],
    context: 'Prefab, stomme, element',
  },
  {
    id: 'textile',
    name: 'Textil',
    icon: '👕',
    example: 'Plagg (t-shirt)',
    materials: ['Bomull', 'Polyester', 'Färgning'],
    context: 'Mode, arbetskläder, inredning',
  },
]

type Hotspot = { name: string; share_pct?: number; contribution_pct?: number }
type Recommendation = { action: string; impact: string; standard: string }
type AISuggestion = { action: string; rationale: string; expected_delta?: Record<string, number> }

type DemoResult = {
  product_id: number
  product_name: string
  run_id: number
  template_name: string
  indicators: Record<string, number>
  hotspots: Hotspot[]
  recommendations: Recommendation[]
  ai_suggestions: AISuggestion[]
  components: { name: string; quantity: number; unit: string }[]
}

export default function DemoPage() {
  const [step, setStep] = useState<'pain' | 'roi' | 'choose' | 'loading' | 'result'>('pain')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ROI calculator state
  const [revenue, setRevenue] = useState<number>(10) // MSEK
  const [tenderShare, setTenderShare] = useState<number>(30) // %
  const riskAmount = Math.round(revenue * (tenderShare / 100) * 0.15 * 1000) // 15% loss risk

  const runDemo = async (templateId: string) => {
    setSelectedId(templateId)
    setStep('loading')
    setError(null)

    try {
      const response = await fetch(`${API_URL}/demo/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Beräkningen misslyckades')
      const data: DemoResult = await response.json()
      setResult(data)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
      setStep('choose')
    }
  }

  const reset = () => {
    setStep('pain')
    setSelectedId(null)
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-trace-bg text-trace-text">
      {/* Header */}
      <header className="border-b border-trace-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-light tracking-tight">
            TR<span className="text-sis-pomegranate italic">/</span>ACE
          </Link>
          <div className="font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase">
            {step === 'pain' && 'Steg 1 av 4'}
            {step === 'roi' && 'Steg 2 av 4'}
            {step === 'choose' && 'Steg 3 av 4'}
            {step === 'loading' && 'Beräknar...'}
            {step === 'result' && 'Resultat'}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════════════
              STEP 1: PAIN — What does a "no" cost?
              ════════════════════════════════════════════════════════════ */}
          {step === 'pain' && (
            <motion.div
              key="pain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Eyebrow */}
              <div className="font-mono text-[10px] tracking-[0.2em] text-sis-pomegranate uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-sis-pomegranate" />
                Innan vi börjar
              </div>

              {/* Main stat */}
              <h1 className="font-display text-5xl md:text-6xl font-light tracking-tight mb-8">
                <span className="text-sis-pomegranate">847 Mkr</span><span className="text-trace-text-muted">.</span>
              </h1>
              <p className="text-xl text-trace-text-secondary mb-8 leading-relaxed max-w-xl">
                Så mycket förlorade svenska SME:er i offentliga upphandlingar förra året
                på grund av <span className="text-trace-text">saknad eller otillräcklig miljödata</span>.
              </p>

              {/* Pain points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-trace-border mb-12">
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-text mb-2">68%</div>
                  <p className="font-mono text-xs text-trace-text-muted">
                    av inköpare kräver nu miljödeklaration i offertförfrågan
                  </p>
                </div>
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-text mb-2">6 v</div>
                  <p className="font-mono text-xs text-trace-text-muted">
                    tar en traditionell LCA-konsult. Upphandlingen stänger om 2.
                  </p>
                </div>
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-text mb-2">200k</div>
                  <p className="font-mono text-xs text-trace-text-muted">
                    kronor kostar en LCA. Offerten är värd 400k.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-trace-border pt-8">
                <p className="text-trace-text-muted mb-6">
                  TR/ACE löser det på 10 minuter. Låt oss visa vad det betyder för dig.
                </p>
                <button
                  onClick={() => setStep('roi')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sis-pomegranate text-white
                             font-mono text-sm tracking-wide uppercase hover:bg-red-600 transition-colors
                             border border-sis-pomegranate"
                >
                  Beräkna min risk
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 2: ROI Calculator
              ════════════════════════════════════════════════════════════ */}
          {step === 'roi' && (
            <motion.div
              key="roi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] text-sis-pomegranate uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-sis-pomegranate" />
                ROI-kalkylator
              </div>

              <h2 className="font-display text-4xl font-light tracking-tight mb-4">
                Vad riskerar du<span className="text-sis-pomegranate">?</span>
              </h2>
              <p className="text-trace-text-secondary mb-10">
                Två snabba frågor. Sedan visar vi vad saknad miljödata kan kosta dig.
              </p>

              {/* Calculator inputs */}
              <div className="space-y-8 mb-12">
                {/* Revenue */}
                <div className="border border-trace-border bg-trace-surface p-6">
                  <label className="font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase block mb-4">
                    Ungefärlig årsomsättning (MSEK)
                  </label>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={revenue}
                      onChange={(e) => setRevenue(Number(e.target.value))}
                      className="flex-1 h-1 bg-trace-border rounded-none appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-sis-pomegranate
                                 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="font-mono text-2xl text-trace-text w-20 text-right">
                      {revenue} <span className="text-sm text-trace-text-muted">Mkr</span>
                    </div>
                  </div>
                </div>

                {/* Tender share */}
                <div className="border border-trace-border bg-trace-surface p-6">
                  <label className="font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase block mb-4">
                    Andel som kommer från upphandlingar/affärer med miljökrav (%)
                  </label>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tenderShare}
                      onChange={(e) => setTenderShare(Number(e.target.value))}
                      className="flex-1 h-1 bg-trace-border rounded-none appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-sis-pomegranate
                                 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="font-mono text-2xl text-trace-text w-20 text-right">
                      {tenderShare}<span className="text-sm text-trace-text-muted">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="border border-sis-pomegranate bg-trace-surface-2 p-8 mb-8">
                <div className="font-mono text-[10px] tracking-[0.15em] text-sis-pomegranate uppercase mb-4">
                  Din årliga risk
                </div>
                <div className="font-display text-5xl font-light text-trace-text mb-4">
                  {riskAmount.toLocaleString('sv-SE')} <span className="text-2xl text-trace-text-muted">tkr</span>
                </div>
                <p className="text-sm text-trace-text-secondary mb-6">
                  Det är vad du riskerar att förlora varje år på grund av saknad miljödata.
                  TR/ACE kostar <span className="text-trace-text">24 000 kr/år</span>.
                </p>
                <div className="font-mono text-sm">
                  <span className="text-verified">ROI: {Math.round(riskAmount / 24)}x</span>
                  <span className="text-trace-text-muted ml-3">|</span>
                  <span className="text-trace-text-secondary ml-3">Payback: {Math.round(24000 / (riskAmount * 10))} dagar</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('pain')}
                  className="font-mono text-sm text-trace-text-muted hover:text-trace-text transition-colors"
                >
                  ← Tillbaka
                </button>
                <button
                  onClick={() => setStep('choose')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sis-pomegranate text-white
                             font-mono text-sm tracking-wide uppercase hover:bg-red-600 transition-colors
                             border border-sis-pomegranate"
                >
                  Se hur det fungerar
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 3: Choose Industry — Three visual cards
              ════════════════════════════════════════════════════════════ */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="font-mono text-[10px] tracking-[0.2em] text-sis-pomegranate uppercase mb-6 flex items-center justify-center gap-3">
                  <span className="w-6 h-px bg-sis-pomegranate" />
                  Välj din bransch
                  <span className="w-6 h-px bg-sis-pomegranate" />
                </div>
                <h2 className="font-display text-4xl font-light tracking-tight mb-4">
                  Vilken typ av produkt tillverkar du<span className="text-sis-pomegranate">?</span>
                </h2>
                <p className="text-trace-text-secondary">
                  Välj den som passar bäst. Du får ett riktigt beräknat resultat på under 10 sekunder.
                </p>
              </div>

              {error && (
                <div className="mb-8 border border-sis-pomegranate bg-pomegranate-dim text-sis-pomegranate px-6 py-4 font-mono text-sm">
                  {error}
                </div>
              )}

              {/* Industry cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-trace-border">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => runDemo(t.id)}
                    className="group bg-trace-surface p-8 text-left hover:bg-trace-surface-2 transition-colors relative"
                  >
                    {/* Accent on hover */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-sis-pomegranate opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Icon */}
                    <div className="text-5xl mb-6">{t.icon}</div>

                    {/* Name */}
                    <h3 className="font-display text-2xl font-light text-trace-text mb-2 group-hover:text-sis-pomegranate transition-colors">
                      {t.name}
                    </h3>

                    {/* Example */}
                    <p className="font-mono text-sm text-trace-text-secondary mb-4">
                      Exempel: {t.example}
                    </p>

                    {/* Materials */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {t.materials.map((m, i) => (
                        <span key={i} className="font-mono text-[10px] px-2 py-1 border border-trace-border text-trace-text-muted">
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Context */}
                    <p className="font-mono text-xs text-trace-text-muted mb-6">
                      {t.context}
                    </p>

                    {/* CTA */}
                    <div className="font-mono text-sm text-trace-text-muted group-hover:text-sis-pomegranate transition-colors flex items-center gap-2">
                      Beräkna
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Back button */}
              <div className="mt-8">
                <button
                  onClick={() => setStep('roi')}
                  className="font-mono text-sm text-trace-text-muted hover:text-trace-text transition-colors"
                >
                  ← Tillbaka till ROI-kalkylatorn
                </button>
              </div>

              {/* Trust */}
              <div className="mt-12 text-center border-t border-trace-border pt-8">
                <p className="font-mono text-xs text-trace-text-muted">
                  Inget konto krävs. Inga uppgifter sparas om du inte väljer att skapa konto.
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              LOADING
              ════════════════════════════════════════════════════════════ */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              {/* Spinner */}
              <div className="w-16 h-16 border border-trace-border relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-2xl text-sis-pomegranate italic animate-pulse">/</span>
                </div>
              </div>

              <h2 className="font-display text-2xl font-light text-trace-text mb-4">
                Beräknar miljöpåverkan...
              </h2>
              <p className="text-trace-text-muted text-sm max-w-md text-center mb-8">
                Skapar produkt, beräknar 8 miljöindikatorer enligt ISO 14040,
                identifierar hotspots och genererar förbättringsförslag.
              </p>
              <div className="flex gap-6 font-mono text-[10px] tracking-[0.1em] text-trace-text-muted uppercase">
                <span>ISO 14040</span>
                <span>ISO 14044</span>
                <span>ISO 14067</span>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 4: Results
              ════════════════════════════════════════════════════════════ */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Result header */}
              <div className="border border-trace-border bg-trace-surface relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-verified to-transparent" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-verified rounded-full shadow-[0_0_8px_#F1F5F9]" />
                    <span className="font-mono text-[10px] tracking-[0.15em] text-verified uppercase">
                      Beräkning klar
                    </span>
                  </div>
                  <h1 className="font-display text-4xl font-light text-trace-text mb-2">
                    {result.product_name.replace('[Demo] ', '')}
                  </h1>
                  <p className="font-mono text-sm text-trace-text-muted">
                    {result.template_name} · {result.components.length} komponenter · ISO 14040/14044
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 font-mono text-xs text-trace-text-muted hover:text-trace-text transition-colors"
                  >
                    ← Börja om
                  </button>
                </div>
              </div>

              {/* 4 key indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-trace-border">
                {[
                  { key: 'co2e_kg', label: 'Klimatpåverkan', unit: 'kg CO₂e' },
                  { key: 'water_l', label: 'Vattenförbrukning', unit: 'liter' },
                  { key: 'energy_mj', label: 'Energianvändning', unit: 'MJ' },
                  { key: 'circularity_pct', label: 'Cirkularitet', unit: '%' },
                ].map((ind) => {
                  const value = result.indicators[ind.key] ?? 0
                  return (
                    <div key={ind.key} className="bg-trace-surface p-6">
                      <div className="font-mono text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-2">
                        {ind.label}
                      </div>
                      <div className="font-mono text-3xl text-trace-text">
                        {typeof value === 'number' ? value.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) : value}
                      </div>
                      <div className="font-mono text-xs text-trace-text-muted">{ind.unit}</div>
                    </div>
                  )
                })}
              </div>

              {/* Hotspots + Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-trace-border">
                {/* Hotspots */}
                <div className="bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase mb-6">
                    Hotspots — var kommer påverkan ifrån?
                  </h3>
                  {result.hotspots.length === 0 ? (
                    <p className="text-sm text-trace-text-muted">Inga hotspots identifierade.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.hotspots.map((hs, i) => {
                        const pct = hs.share_pct ?? hs.contribution_pct ?? 0
                        return (
                          <div key={i}>
                            <div className="flex justify-between font-mono text-sm mb-2">
                              <span className="text-trace-text">{hs.name}</span>
                              <span className="text-trace-text-secondary">{pct}%</span>
                            </div>
                            <div className="w-full h-1 bg-trace-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.15 }}
                                className="h-1 bg-sis-pomegranate"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Components */}
                <div className="bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase mb-6">
                    Produktens komponenter
                  </h3>
                  <div className="space-y-3">
                    {result.components.map((comp, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-trace-border last:border-0">
                        <span className="font-mono text-sm text-trace-text">{comp.name}</span>
                        <span className="font-mono text-sm text-trace-text-muted">
                          {comp.quantity} {comp.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="border border-trace-border bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-verified uppercase mb-6">
                    Förbättringsförslag
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="border-l-2 border-verified pl-4">
                        <div className="font-mono text-sm text-trace-text mb-1">{rec.action}</div>
                        <div className="font-mono text-xs text-verified">{rec.impact}</div>
                        <div className="font-mono text-[10px] text-trace-text-muted mt-2">{rec.standard}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge + CTA */}
              <div className="border border-sis-pomegranate bg-trace-surface-2">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Badge preview */}
                  <div className="p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-trace-border">
                    <div className="border border-trace-border bg-trace-surface p-6 max-w-xs w-full relative">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sis-pomegranate to-verified" />

                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display text-lg font-light">TR<span className="text-sis-pomegranate italic">/</span>ACE</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-verified rounded-full" />
                          <span className="font-mono text-[8px] text-verified uppercase">Verified</span>
                        </div>
                      </div>

                      <div className="font-mono text-sm text-trace-text mb-4">
                        {result.product_name.replace('[Demo] ', '')}
                      </div>

                      <div className="space-y-2 border-t border-trace-border pt-4">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-text-muted">CO₂e</span>
                          <span className="text-trace-text">{result.indicators.co2e_kg?.toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-text-muted">Vatten</span>
                          <span className="text-trace-text">{result.indicators.water_l?.toFixed(0)} L</span>
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-text-muted">Cirkularitet</span>
                          <span className="text-trace-text">{result.indicators.circularity_pct?.toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-trace-border">
                        <div className="font-mono text-[9px] text-trace-text-muted">
                          TRC-2025-{String(result.run_id).padStart(5, '0')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-8">
                    <div className="font-mono text-[10px] tracking-[0.15em] text-sis-pomegranate uppercase mb-4">
                      Nästa steg
                    </div>
                    <h3 className="font-display text-3xl font-light text-trace-text mb-4">
                      Det här tog 10 sekunder<span className="text-sis-pomegranate">.</span>
                    </h3>
                    <p className="text-trace-text-secondary mb-8 leading-relaxed">
                      Med ett konto kan du justera varje komponent, köra nya scenarier,
                      exportera ISO-rapport som PDF, och få ett hållbarhetsbevis att
                      bifoga i offerter.
                    </p>

                    <div className="space-y-3">
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-3 px-8 py-4
                                   bg-sis-pomegranate text-white font-mono text-sm tracking-wide uppercase
                                   hover:bg-red-600 transition-colors border border-sis-pomegranate"
                      >
                        Skapa konto och fortsätt
                        <span>→</span>
                      </Link>
                      <Link
                        href={`/certificate/${result.run_id}`}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4
                                   border border-trace-border text-trace-text font-mono text-sm tracking-wide uppercase
                                   hover:border-sis-pomegranate hover:text-sis-pomegranate transition-colors"
                      >
                        Se certifikatsidan
                        <span>→</span>
                      </Link>
                    </div>

                    <p className="font-mono text-[10px] text-trace-text-muted mt-6">
                      2 000 kr/mån · Obegränsat antal produkter · Avsluta när du vill
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
