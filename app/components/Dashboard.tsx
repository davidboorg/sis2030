'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save } from 'lucide-react'

type ProductSummary = {
  id: number
  name: string
  unit: string
  description?: string | null
  iso_standard?: string | null
  created_at?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export default function Dashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState({
    name: '',
    unit: 'st',
    description: ''
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_URL}/products`)
        if (!response.ok) {
          throw new Error('Kunde inte hämta produkter')
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formValues.name.trim()) {
      setError('Ange ett produktnamn')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      })
      if (!response.ok) {
        throw new Error('Kunde inte skapa produkten')
      }
      const created = await response.json()
      const productId = created.product_id
      const refreshed = await fetch(`${API_URL}/products/${productId}`)
      if (refreshed.ok) {
        const detail = await refreshed.json()
        setProducts(prev => [
          { ...detail.product },
          ...prev.filter(product => product.id !== productId)
        ])
      }
      setFormValues({ name: '', unit: 'st', description: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-trace-bg">
      {/* Navigation */}
      <nav className="border-b border-trace-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-display text-xl font-light text-trace-text">
            TR<span className="text-sis-pomegranate italic">/</span>ACE
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-trace-text-secondary">Skandiform AB</span>
            <span className="text-sm text-trace-text-muted">demo@skandiform.example</span>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h2 className="font-display text-3xl font-light mb-2 text-trace-text">Produktanalyser</h2>
            <p className="text-trace-text-muted">Hantera, analysera och exportera ISO-kompatibla resultat.</p>
          </header>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowForm(value => !value)}
              className="bg-sis-pomegranate text-white px-6 py-3 font-medium
                         hover:bg-red-600 transition-colors inline-flex items-center gap-2
                         border border-sis-pomegranate"
            >
              <Plus size={20} />
              Ny analys
            </button>
            {error && (
              <span className="text-sm text-sis-pomegranate">{error}</span>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-trace-surface border border-trace-border p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                    Produktnamn
                  </span>
                  <input
                    value={formValues.name}
                    onChange={(event) => setFormValues(prev => ({ ...prev, name: event.target.value }))}
                    className="bg-trace-bg border border-trace-border-light px-3 py-2 text-trace-text
                               focus:outline-none focus:border-sis-pomegranate"
                    placeholder="Ex. Köksstol Classic"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                    Enhet
                  </span>
                  <input
                    value={formValues.unit}
                    onChange={(event) => setFormValues(prev => ({ ...prev, unit: event.target.value }))}
                    className="bg-trace-bg border border-trace-border-light px-3 py-2 text-trace-text
                               focus:outline-none focus:border-sis-pomegranate"
                    placeholder="st"
                    required
                  />
                </label>
                <label className="flex flex-col md:col-span-1 md:col-start-1 md:col-end-4">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                    Beskrivning
                  </span>
                  <textarea
                    value={formValues.description}
                    onChange={(event) => setFormValues(prev => ({ ...prev, description: event.target.value }))}
                    className="bg-trace-bg border border-trace-border-light px-3 py-2 text-trace-text
                               focus:outline-none focus:border-sis-pomegranate"
                    placeholder="Kort beskrivning av produkten och funktionella enheten"
                    rows={3}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-trace-border-light text-trace-text
                             hover:border-trace-text-muted transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-sis-pomegranate text-white font-medium inline-flex items-center gap-2
                             hover:bg-red-600 disabled:opacity-60 border border-sis-pomegranate"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Spara produkt
                </button>
              </div>
            </form>
          )}

          <div className="border border-trace-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-trace-surface border-b border-trace-border">
                <tr>
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Produkt</th>
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Standard</th>
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Enhet</th>
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Skapad</th>
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-trace-text-muted">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Hämtar produkter...
                    </td>
                  </tr>
                )}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-trace-text-muted">
                      Inga produkter ännu. Skapa din första analys för att komma igång.
                    </td>
                  </tr>
                )}
                {products.map(product => (
                  <tr key={product.id} className="border-b border-trace-border hover:bg-trace-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-trace-text">{product.name}</div>
                      {product.description && <div className="text-sm text-trace-text-muted">{product.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-trace-text-secondary">{product.iso_standard ?? 'ISO 14040-serien'}</td>
                    <td className="px-6 py-4 text-trace-text">{product.unit}</td>
                    <td className="px-6 py-4 text-sm text-trace-text-muted">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString('sv-SE') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="text-sis-pomegranate hover:underline font-medium text-sm"
                        >
                          Öppna BOM
                        </button>
                        <button
                          onClick={() => router.push(`/products/${product.id}/results`)}
                          className="text-trace-text-secondary hover:text-sis-pomegranate text-sm"
                        >
                          Visa resultat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
