'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Factory, Loader2, ChevronRight,
  Cloud, Droplets, Zap, RefreshCw, BadgeCheck, QrCode,
  TrendingDown, Sparkles, Share2
} from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type Template = {
  id: string
  name: string
  icon: string
  example: string
  description: string
  tagline: string
}

const templates: Template[] = [
  {
    id: 'furniture',
    name: 'Möbel',
    icon: '🪑',
    example: 'Kontorsstol',
    description: 'Stål, skum, textil, montering',
    tagline: 'Typisk för möbeltillverkare i Tibro, Tranås, Lammhult',
  },
  {
    id: 'food',
    name: 'Livsmedel',
    icon: '📦',
    example: 'Förpackat livsmedel',
    description: 'Kartong, plast, pall, distribution',
    tagline: 'Typisk för livsmedelsförpackning och distribution',
  },
  {
    id: 'workshop',
    name: 'Verkstad',
    icon: '⚙️',
    example: 'CNC-bearbetad detalj',
    description: 'Stål, CNC, ytbehandling',
    tagline: 'Typisk för underleverantörer till fordon och industri',
  },
]

type Hotspot = { name: string; share_pct?: number; contribution_pct?: number }
type Recommendation = { action: string; impact: string; standard: string }
type AISuggestion = { action: string; rationale: string; expected_delta?: Record<string, number>; uncertainty?: string }

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

const INDICATOR_LABELS: Record<string, { label: string; unit: string; icon: typeof Cloud }> = {
  co2e_kg: { label: 'Klimatpåverkan', unit: 'kg CO₂e', icon: Cloud },
  water_l: { label: 'Vattenförbrukning', unit: 'liter', icon: Droplets },
  energy_mj: { label: 'Energianvändning', unit: 'MJ', icon: Zap },
  circularity_pct: { label: 'Cirkularitet', unit: '%', icon: RefreshCw },
}

export default function DemoPage() {
  const [step, setStep] = useState<'choose' | 'loading' | 'result'>('choose')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    setStep('choose')
    setSelectedId(null)
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-sis-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-sis-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-sis-pomegranate font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> 2030+ Calculator
          </Link>
          <div className="text-xs text-sis-gray-500">
            {step === 'choose' && 'Steg 1 av 2: Välj bransch'}
            {step === 'loading' && 'Beräknar...'}
            {step === 'result' && 'Steg 2 av 2: Ditt resultat'}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Choose template ─────────────────────── */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-sis-gray-900 mb-3">
                  Se vad miljödata avslöjar om din produkt
                </h1>
                <p className="text-lg text-sis-gray-600">
                  Välj den bransch som passar bäst. Du får ett riktigt beräknat resultat
                  baserat på typiska material och processer - på under 10 sekunder.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => runDemo(t.id)}
                    className="group text-left bg-white rounded-2xl p-8 border-2 border-sis-gray-200
                               hover:border-sis-pomegranate hover:shadow-xl transition-all duration-300
                               hover:scale-[1.02]"
                  >
                    <div className="text-4xl mb-4">{t.icon}</div>
                    <h3 className="text-xl font-bold text-sis-gray-900 mb-1">{t.name}</h3>
                    <p className="text-sm text-sis-gray-600 mb-3">{t.description}</p>
                    <p className="text-xs text-sis-gray-400 mb-4">{t.tagline}</p>
                    <div className="flex items-center gap-2 text-sis-pomegranate font-medium text-sm
                                    group-hover:translate-x-1 transition-transform">
                      Beräkna {t.example.toLowerCase()}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center pt-4 space-y-3">
                <p className="text-sm text-sis-gray-500">
                  Inget konto krävs. Inga uppgifter sparas om du inte väljer att skapa konto.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── LOADING ─────────────────────────────────── */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-sis-pomegranate animate-spin" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-sis-gray-900 mb-2">
                  Beräknar miljöpåverkan...
                </h2>
                <p className="text-sis-gray-500 text-sm max-w-md">
                  Skapar produkt från branschmall, beräknar 8 miljöindikatorer
                  enligt ISO 14040-serien, identifierar hotspots och genererar
                  förbättringsförslag.
                </p>
              </div>
              <div className="flex gap-8 text-xs text-sis-gray-400">
                <span>ISO 14067</span>
                <span>ISO 14046</span>
                <span>ISO 59004</span>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Results ─────────────────────────── */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Result header */}
              <div className="bg-gradient-to-r from-sis-pomegranate to-red-700 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                  <Factory className="w-4 h-4" />
                  Livscykelanalys &middot; {result.template_name}
                </div>
                <h1 className="text-3xl font-bold mb-2">{result.product_name.replace('[Demo] ', '')}</h1>
                <p className="opacity-80 text-sm">
                  Beräknad just nu med {result.components.length} komponenter &middot;
                  8 indikatorer &middot; ISO 14040-serien
                </p>
                <button
                  onClick={reset}
                  className="mt-4 inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" /> Välj annan bransch
                </button>
              </div>

              {/* 4 key indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(INDICATOR_LABELS).map(([key, meta]) => {
                  const value = result.indicators[key] ?? 0
                  const Icon = meta.icon
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl border border-sis-gray-200 p-5 text-center"
                    >
                      <Icon className="w-5 h-5 text-sis-pomegranate mx-auto mb-2" />
                      <div className="text-2xl font-bold text-sis-gray-900">
                        {typeof value === 'number' ? value.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) : value}
                      </div>
                      <div className="text-xs text-sis-gray-500 mb-1">{meta.unit}</div>
                      <div className="text-xs font-medium text-sis-gray-700">{meta.label}</div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Hotspots + Component breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hotspots */}
                <div className="bg-white rounded-xl border border-sis-gray-200 p-6">
                  <h3 className="font-semibold text-sis-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-sis-pomegranate" />
                    Hotspots - var kommer påverkan ifrån?
                  </h3>
                  {result.hotspots.length === 0 ? (
                    <p className="text-sm text-sis-gray-500">Inga hotspots identifierade.</p>
                  ) : (
                    <div className="space-y-3">
                      {result.hotspots.map((hs, i) => {
                        const pct = hs.share_pct ?? hs.contribution_pct ?? 0
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-sis-gray-900">{hs.name}</span>
                              <span className="text-sis-gray-600">{pct}%</span>
                            </div>
                            <div className="w-full bg-sis-gray-100 rounded-full h-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.15 }}
                                className="bg-sis-pomegranate rounded-full h-2.5"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Components */}
                <div className="bg-white rounded-xl border border-sis-gray-200 p-6">
                  <h3 className="font-semibold text-sis-gray-900 mb-4">
                    Produktens komponenter
                  </h3>
                  <div className="space-y-2">
                    {result.components.map((comp, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-sis-gray-100 last:border-0">
                        <span className="text-sm text-sis-gray-900">{comp.name}</span>
                        <span className="text-sm text-sis-gray-500 font-medium">
                          {comp.quantity} {comp.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-white rounded-xl border border-green-200 p-6">
                  <h3 className="font-semibold text-sis-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Förbättringsförslag
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="font-medium text-sis-gray-900 text-sm">{rec.action}</div>
                        <div className="text-sm text-green-700 mt-1">{rec.impact}</div>
                        <div className="text-xs text-sis-gray-400 mt-1">{rec.standard}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {result.ai_suggestions.length > 0 && (
                <div className="bg-white rounded-xl border border-purple-200 p-6">
                  <h3 className="font-semibold text-sis-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-förbättringsförslag
                  </h3>
                  <div className="space-y-4">
                    {result.ai_suggestions.map((sug, i) => (
                      <div key={i} className="border-l-4 border-purple-400 pl-4 py-2">
                        <div className="font-medium text-sis-gray-900 text-sm">{sug.action}</div>
                        <div className="text-sm text-sis-gray-600 mt-1">{sug.rationale}</div>
                        {sug.expected_delta?.co2e_kg != null && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Potentiell CO₂e-reduktion: {Math.abs(sug.expected_delta.co2e_kg).toFixed(1)} kg
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge preview + CTA */}
              <div className="bg-gradient-to-br from-sis-gray-50 to-white rounded-2xl border-2 border-sis-gray-200 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Badge */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs bg-white rounded-2xl border border-sis-gray-200 shadow-lg p-6 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="inline-flex items-center gap-1.5 bg-green-600 text-white
                                        px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                          <BadgeCheck className="w-3 h-3" />
                          Verifierad
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <h4 className="font-bold text-sis-gray-900">
                          {result.product_name.replace('[Demo] ', '')}
                        </h4>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between border-b border-sis-gray-100 pb-1">
                            <span className="text-sis-gray-500">CO₂e</span>
                            <span className="font-semibold">{result.indicators.co2e_kg?.toFixed(1)} kg</span>
                          </div>
                          <div className="flex justify-between border-b border-sis-gray-100 pb-1">
                            <span className="text-sis-gray-500">Vatten</span>
                            <span className="font-semibold">{result.indicators.water_l?.toFixed(0)} L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sis-gray-500">Cirkularitet</span>
                            <span className="font-semibold">{result.indicators.circularity_pct?.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <QrCode className="w-8 h-8 text-sis-gray-300" />
                          <div className="text-left">
                            <div className="text-[10px] text-sis-gray-400">Verifierings-ID</div>
                            <div className="text-xs font-mono text-sis-gray-600">SIS-2030-{String(result.run_id).padStart(5, '0')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <h3 className="text-2xl font-bold text-sis-gray-900 mb-3">
                      Det här tog 10 sekunder.
                    </h3>
                    <p className="text-sis-gray-600 mb-6 leading-relaxed">
                      Med ett konto kan du justera varje komponent, köra nya scenarier,
                      exportera ISO-rapport som PDF, och få ett hållbarhetsbevis att
                      bifoga i offerter och publicera på din hemsida.
                    </p>
                    <div className="space-y-3">
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 px-8 py-4
                                   bg-sis-pomegranate text-white font-medium rounded-xl
                                   hover:bg-red-700 hover:shadow-xl hover:scale-[1.02]
                                   transition-all duration-300"
                      >
                        Skapa konto och fortsätt
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/products/${result.product_id}/results`}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4
                                   bg-white text-sis-gray-700 font-medium rounded-xl border border-sis-gray-300
                                   hover:border-sis-pomegranate hover:text-sis-pomegranate
                                   transition-all duration-300"
                      >
                        Se fullständig rapport
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                    <p className="text-xs text-sis-gray-400 mt-4">
                      2,000 kr/mån &middot; Obegränsat antal produkter &middot; Avsluta när du vill
                    </p>
                  </div>
                </div>
              </div>

              {/* Share prompt */}
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-sis-gray-500">
                  <Share2 className="w-4 h-4" />
                  Gillade du resultatet? Dela med en kollega som också har miljökrav att uppfylla.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
