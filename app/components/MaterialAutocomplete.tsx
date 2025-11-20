'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'

interface MaterialMatch {
  dataset_ref: string
  name: string
  confidence: number
  suggested_recycled_content?: number
  typical_density_kg_m3?: number
}

interface MaterialAutocompleteProps {
  value: string
  onChange: (value: string, match?: MaterialMatch) => void
  placeholder?: string
}

export default function MaterialAutocomplete({ value, onChange, placeholder }: MaterialAutocompleteProps) {
  const [matches, setMatches] = useState<MaterialMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setMatches([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
        const response = await fetch(`${apiUrl}/ai/match-material`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value })
        })

        if (response.ok) {
          const data = await response.json()
          setMatches(data.matches || [])
          setShowSuggestions(true)
        }
      } catch (err) {
        console.error('Material matching error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  const handleSelect = (match: MaterialMatch) => {
    onChange(value, match)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => matches.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || "Sök material..."}
          className="w-full px-3 py-2 border rounded-lg pr-10"
        />
        {isLoading && (
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 animate-pulse" />
        )}
      </div>
      {showSuggestions && matches.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {matches.map((match, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(match)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{match.name}</div>
                  <div className="text-xs text-gray-500">{match.dataset_ref}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(match.confidence * 100)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

