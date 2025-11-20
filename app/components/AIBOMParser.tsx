'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Component {
  name: string
  quantity: number
  unit: string
  material_type?: string
  recycled_content_pct?: number
  suggested_dataset?: string
}

interface AIBOMParserProps {
  onParse: (components: Component[]) => void
}

export default function AIBOMParser({ onParse }: AIBOMParserProps) {
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!text.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/ai/parse-bom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Kunde inte parsa BOM')

      const data = await response.json()
      onParse(data.components || [])
      setText('')
    } catch (err) {
      setError('Kunde inte parsa texten. Försök igen.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-sis-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-sis-pomegranate" />
        <h3 className="font-semibold">AI BOM-assistent</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Klistra in produktbeskrivning eller komponentlista. AI extraherar automatiskt komponenter.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: Vi har ett aluminiumhölje på 12 kg med 30% återvunnet innehåll, en motor på 25 kg i stål, och ett kretskort på 800 gram"
        className="w-full px-3 py-2 border rounded-lg mb-3 min-h-[100px]"
        disabled={isProcessing}
      />
      {isProcessing && (
        <div className="flex items-center gap-2 text-purple-600 mb-3">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-sm">AI analyserar...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-sm mb-3">{error}</div>
      )}
      <button
        onClick={handleParse}
        disabled={isProcessing || !text.trim()}
        className="px-4 py-2 bg-sis-pomegranate text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Bearbetar...' : 'Extrahera komponenter'}
      </button>
    </div>
  )
}

