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
    <div className="min-h-screen bg-sis-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-sis-pomegranate">2030+ Calculator</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-sis-gray-600">Skandiform AB</span>
            <span className="text-sm text-sis-gray-400">demo@skandiform.example</span>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h2 className="text-3xl font-bold mb-2 text-sis-gray-900">Produktanalyser</h2>
            <p className="text-sis-gray-600">Hantera, analysera och exportera ISO-kompatibla resultat.</p>
          </header>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowForm(value => !value)}
              className="bg-sis-pomegranate text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Ny analys
            </button>
            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-sis-gray-200 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col text-sm font-medium text-sis-gray-700">
                  Produktnamn
                  <input
                    value={formValues.name}
                    onChange={(event) => setFormValues(prev => ({ ...prev, name: event.target.value }))}
                    className="mt-1 rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="Ex. Köksstol Classic"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-sis-gray-700">
                  Enhet
                  <input
                    value={formValues.unit}
                    onChange={(event) => setFormValues(prev => ({ ...prev, unit: event.target.value }))}
                    className="mt-1 rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="st"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-sis-gray-700 md:col-span-1 md:col-start-1 md:col-end-4">
                  Beskrivning
                  <textarea
                    value={formValues.description}
                    onChange={(event) => setFormValues(prev => ({ ...prev, description: event.target.value }))}
                    className="mt-1 rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="Kort beskrivning av produkten och funktionella enheten"
                    rows={3}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-sis-gray-200 hover:bg-sis-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium inline-flex items-center gap-2 hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Spara produkt
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-sis-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-sis-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sis-gray-700">Produkt</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sis-gray-700">Standard</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sis-gray-700">Enhet</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sis-gray-700">Skapad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sis-gray-700">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sis-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Hämtar produkter...
                    </td>
                  </tr>
                )}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sis-gray-500">
                      Inga produkter ännu. Skapa din första analys för att komma igång.
                    </td>
                  </tr>
                )}
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-sis-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sis-gray-900">{product.name}</div>
                      {product.description && <div className="text-sm text-sis-gray-500">{product.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-sis-gray-600">{product.iso_standard ?? 'ISO 14040-serien'}</td>
                    <td className="px-6 py-4">{product.unit}</td>
                    <td className="px-6 py-4 text-sm text-sis-gray-500">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString('sv-SE') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="text-sis-pomegranate hover:underline font-medium"
                        >
                          Öppna BOM →
                        </button>
                        <button
                          onClick={() => router.push(`/products/${product.id}/results`)}
                          className="text-sis-gray-600 hover:text-sis-pomegranate text-sm"
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
