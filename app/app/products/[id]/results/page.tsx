'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Download, FileOutput, Loader2, Sparkles } from 'lucide-react'

import AIChatWidget from '@/components/AIChatWidget'

type IndicatorKey =
  | 'co2e_kg'
  | 'water_l'
  | 'energy_mj'
  | 'land_m2a'
  | 'acid_mol_hplus'
  | 'eutro_g_po4'
  | 'biodiversity_index'
  | 'circularity_pct'

type IndicatorMeta = {
  key: IndicatorKey
  label: string
  unit: string
  standard: string
}

type Hotspot = {
  name: string
  share_pct?: number
  contribution_pct?: number
}

type Recommendation = {
  action: string
  impact: string
  standard: string
}

type AISuggestion = {
  action: string
  rationale: string
  uncertainty?: 'low' | 'medium' | 'high'
  expected_delta?: Record<string, number>
}

const INDICATOR_META: IndicatorMeta[] = [
  { key: 'co2e_kg', label: 'Klimatpåverkan', unit: 'kg CO₂e', standard: 'ISO 14067' },
  { key: 'water_l', label: 'Vattenförbrukning', unit: 'liter', standard: 'ISO 14046' },
  { key: 'energy_mj', label: 'Energianvändning', unit: 'MJ', standard: 'ISO 50001' },
  { key: 'land_m2a', label: 'Markanvändning', unit: 'm²·år', standard: 'ISO 14055' },
  { key: 'acid_mol_hplus', label: 'Försurning', unit: 'mol H⁺-eq', standard: 'ISO 14040' },
  { key: 'eutro_g_po4', label: 'Övergödning', unit: 'g PO₄³⁻-eq', standard: 'ISO 14040' },
  { key: 'biodiversity_index', label: 'Biodiversitet', unit: 'index (0-1)', standard: 'ISO 14055' },
  { key: 'circularity_pct', label: 'Cirkularitet', unit: '%', standard: 'ISO 59004' }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export default function ResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const productId = Number(params.id)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runId, setRunId] = useState<number | null>(null)
  const [indicators, setIndicators] = useState<Record<string, number>>({})
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [assumptions, setAssumptions] = useState<{ item: string; value: string; standard: string; uncertainty: string }[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_URL}/runs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            dataset_version: 'v1',
            method_version: 'iso14040-2024'
          })
        })
        if (!response.ok) {
          throw new Error('Kunde inte genomföra beräkningen')
        }
        const data = await response.json()
        setRunId(data.run_id)
        setIndicators(data.indicators || {})
        setHotspots(data.hotspots || [])
        setRecommendations(data.recommendations || [])
        setAssumptions(data.assumptions || [])
        setAiSuggestions(data.ai_suggestions || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod vid beräkning')
      } finally {
        setIsLoading(false)
      }
    }

    runAnalysis()
  }, [productId])

  const kpis = useMemo(() => {
    return INDICATOR_META.map(meta => ({
      ...meta,
      value: indicators[meta.key] ?? 0
    }))
  }, [indicators])

  const hotspotData = useMemo(() => {
    return hotspots.map(item => ({
      name: item.name,
      share: item.share_pct ?? item.contribution_pct ?? 0
    }))
  }, [hotspots])

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!runId) {
      setExportMessage('Kör en analys innan export.')
      return
    }
    setIsExporting(true)
    setExportMessage(null)
    try {
      const response = await fetch(`${API_URL}/runs/${runId}/export?format=${format}`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Exporten misslyckades')
      }
      const data = await response.json()
      setExportMessage(`Export skapad: ${data.report_url}`)
    } catch (err) {
      setExportMessage(err instanceof Error ? err.message : 'Exporten misslyckades')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sis-gray-900">Resultat</h1>
            <p className="text-sm text-sis-gray-600">
              Produkt #{productId} • 8 miljöindikatorer enligt ISO-standarder
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-sis-gray-200 hover:bg-sis-gray-50"
              onClick={() => router.push(`/products/${productId}`)}
            >
              Till BOM
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-sis-pomegranate text-white hover:bg-red-700 inline-flex items-center gap-2 disabled:opacity-60"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileOutput className="w-4 h-4" />
              Exportera ISO-rapport (PDF)
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-sis-gray-300 hover:bg-sis-gray-50 inline-flex items-center gap-2 disabled:opacity-60"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              Ladda ner data (CSV)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {exportMessage && (
          <div className="bg-sis-gray-100 border border-sis-gray-200 text-sis-gray-700 rounded-xl px-4 py-3">
            {exportMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sis-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Beräkningen körs enligt ISO 14040-serien...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map(kpi => (
                <div
                  key={kpi.key}
                  className="bg-white rounded-xl shadow-sm border border-sis-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-sis-gray-500 mb-1">{kpi.label}</div>
                  <div className="text-2xl font-bold text-sis-gray-900 mb-1">{kpi.value}</div>
                  <div className="text-xs text-sis-gray-400 mb-2">{kpi.unit}</div>
                  <div className="text-xs text-sis-pomegranate font-medium">{kpi.standard}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="mb-3 font-semibold text-sis-gray-900">Hotspots (andel av CO₂e)</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotspotData}>
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="share" fill="#F32735" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 flex flex-col gap-1">
              <div className="text-sm font-semibold text-green-700">
                Reduktionspotential
              </div>
              <div className="text-2xl font-bold text-green-800">
                -38% CO₂e genom dessa åtgärder
              </div>
              <p className="text-sm text-sis-gray-600">
                Samlad potential baserat på identifierade hotspots och rekommenderade förbättringsåtgärder.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
                <h3 className="font-semibold text-sis-gray-900">Rekommenderade åtgärder</h3>
                {recommendations.length === 0 ? (
                  <p className="text-sm text-sis-gray-500">Inga ytterligare rekommendationer identifierades.</p>
                ) : (
                  <ul className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="border-l-4 border-sis-pomegranate/60 pl-4">
                        <div className="font-medium text-sis-gray-900">{rec.action}</div>
                        <div className="text-sm text-sis-gray-600">{rec.impact}</div>
                        <div className="text-xs text-sis-pomegranate mt-1">{rec.standard}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
                <h3 className="font-semibold text-sis-gray-900">Antaganden och parametrar</h3>
                {assumptions.length === 0 ? (
                  <p className="text-sm text-sis-gray-500">Inga explicita antaganden angivna.</p>
                ) : (
                  <ul className="space-y-3">
                    {assumptions.map((assumption, index) => (
                      <li key={index} className="border border-sis-gray-200 rounded-lg px-3 py-2">
                        <div className="font-medium text-sis-gray-900">{assumption.item}</div>
                        <div className="text-sm text-sis-gray-600">{assumption.value}</div>
                        <div className="text-xs text-sis-gray-500 flex justify-between">
                          <span>{assumption.standard}</span>
                          <span>{assumption.uncertainty}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-sis-gray-900">AI-förbättringsförslag</h3>
                  <p className="text-xs text-sis-gray-500">
                    Konkreta förbättringsförslag med kvantifierad effekt där det är möjligt.
                  </p>
                </div>
              </div>
              {aiSuggestions.length === 0 ? (
                <p className="text-sm text-sis-gray-500">AI-assistenten har inga ytterligare förslag just nu.</p>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="border-l-4 border-purple-600 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sis-gray-900">{suggestion.action}</div>
                          <div className="text-sm text-sis-gray-600 mt-1">{suggestion.rationale}</div>
                          {suggestion.expected_delta?.co2e_kg && (
                            <div className="text-xs text-green-600 font-medium mt-2">
                              Potentiell CO₂e-reduktion: {Math.abs(suggestion.expected_delta.co2e_kg)} kg
                            </div>
                          )}
                        </div>
                        {suggestion.uncertainty && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              suggestion.uncertainty === 'low'
                                ? 'bg-green-100 text-green-800'
                                : suggestion.uncertainty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {suggestion.uncertainty === 'low'
                              ? 'Hög säkerhet'
                              : suggestion.uncertainty === 'medium'
                              ? 'Medel säkerhet'
                              : 'Låg säkerhet'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <AIChatWidget />
    </div>
  )
}
