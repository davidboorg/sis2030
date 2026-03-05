'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('demo@skandiform.example')
  const [password, setPassword] = useState('Demo123!')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        onLogin()
      } else {
        alert('Fel e-post eller lösenord')
      }
    } catch (error) {
      // Fallback till mock login om API inte svarar
      if (email === 'demo@skandiform.example' && password === 'Demo123!') {
        localStorage.setItem('token', 'demo-token')
        onLogin()
      } else {
        alert('Kunde inte ansluta till servern')
      }
    }
  }

  return (
    <div className="min-h-screen bg-trace-bg flex items-center justify-center p-6">
      <div className="bg-trace-surface border border-trace-border p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-light text-trace-text mb-2">
            TR<span className="text-sis-pomegranate italic">/</span>ACE
          </h1>
          <p className="text-trace-text-muted text-sm">Screening-LCA för svenska tillverkare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
              E-postadress
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-trace-bg border border-trace-border-light text-trace-text
                         focus:outline-none focus:border-sis-pomegranate"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
              Lösenord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-trace-bg border border-trace-border-light text-trace-text
                         focus:outline-none focus:border-sis-pomegranate"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sis-pomegranate text-white py-3 font-medium
                       hover:bg-red-600 transition-colors border border-sis-pomegranate"
          >
            Logga in
          </button>
        </form>

        <p className="text-xs text-trace-text-muted mt-6 text-center">
          Demo-miljö för Svenska institutet för standarder
        </p>
      </div>
    </div>
  )
}
