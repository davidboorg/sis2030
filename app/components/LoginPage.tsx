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
    <div className="min-h-screen bg-gradient-to-br from-sis-pomegranate/5 to-sis-white flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-sis-gray-200 p-8 w-96 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-sis-pomegranate">2030+ Calculator</h1>
        <p className="text-sis-gray-600 mb-8">ISO‑aligned LCA för SIS</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sis-gray-700 mb-1">
              E-postadress
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-sis-gray-300 rounded-lg focus:ring-2 focus:ring-sis-pomegranate focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sis-gray-700 mb-1">
              Lösenord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-sis-gray-300 rounded-lg focus:ring-2 focus:ring-sis-pomegranate focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-sis-pomegranate text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Logga in
          </button>
        </form>
        
        <p className="text-xs text-sis-gray-500 mt-6 text-center">
          Demo-miljö för Svenska institutet för standarder
        </p>
      </div>
    </div>
  )
}


