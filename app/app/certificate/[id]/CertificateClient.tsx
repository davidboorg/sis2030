'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type Props = {
  certificateUrl: string
  productName: string
  runId: string
  co2e: number
}

export default function CertificateClient({ certificateUrl, productName, runId, co2e }: Props) {
  const [copied, setCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(certificateUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyEmbed = async () => {
    const embedCode = `<a href="${certificateUrl}" target="_blank" rel="noopener"><img src="${API_URL}/badge/${runId}.svg" alt="TR/ACE Screening-LCA: ${productName}" width="200" /></a>`
    await navigator.clipboard.writeText(embedCode)
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const handleEmailShare = () => {
    const subject = `Miljöcertifikat: ${productName}`
    const body = `${productName} har ${co2e?.toFixed(1)} kg CO₂e per enhet.\n\nScreening-LCA beräknad enligt ISO 14040/14044-metodiken.\nEj externt granskad. Verifierad av TR/ACE.\n\nSe certifikatet: ${certificateUrl}\n\n— TR/ACE`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleDownloadSVG = () => {
    window.open(`${API_URL}/badge/${runId}`, '_blank')
  }

  const handleDownloadPDF = () => {
    window.open(`${API_URL}/certificate/${runId}/pdf`, '_blank')
  }

  const handleDownloadPNG = async () => {
    try {
      const response = await fetch(`${API_URL}/badge/${runId}`)
      const svgText = await response.text()

      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 1040
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, 800, 1040)
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `trace-certificate-${runId}.png`
        link.href = pngUrl
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)))
    } catch (err) {
      console.error('Failed to download PNG:', err)
    }
  }

  return (
    <>
      {/* Actions Panel */}
      <div className="mt-6 sm:mt-8 border border-trace-border bg-trace-surface">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-trace-border">
          <div className="font-mono text-[10px] tracking-[0.2em] text-trace-text-muted uppercase mb-2 sm:mb-3">
            Dela &amp; Ladda ner
          </div>
          <p className="text-xs sm:text-sm text-trace-text-secondary">
            Använd certifikatet i offerter, på din hemsida, eller som QR-kod på produkten.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4">
          {/* LinkedIn */}
          <button
            onClick={handleLinkedInShare}
            className="px-4 sm:px-6 py-4 sm:py-5 border-r border-b border-trace-border text-left
                       hover:bg-trace-surface-2 transition-colors group"
          >
            <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-1 sm:mb-2">
              Dela på
            </div>
            <div className="font-mono text-xs sm:text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
              LinkedIn →
            </div>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="px-4 sm:px-6 py-4 sm:py-5 border-b border-trace-border text-left
                       hover:bg-trace-surface-2 transition-colors group
                       md:border-r"
          >
            <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-1 sm:mb-2">
              Skicka via
            </div>
            <div className="font-mono text-xs sm:text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
              E-post →
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="px-4 sm:px-6 py-4 sm:py-5 border-r border-b border-trace-border text-left
                       hover:bg-trace-surface-2 transition-colors group"
          >
            <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-1 sm:mb-2">
              Kopiera
            </div>
            <div className="font-mono text-xs sm:text-sm transition-colors">
              {copied ? (
                <span className="text-sis-pomegranate">Kopierad ✓</span>
              ) : (
                <span className="text-trace-text group-hover:text-sis-pomegranate">Länk →</span>
              )}
            </div>
          </button>

          {/* Download */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="px-4 sm:px-6 py-4 sm:py-5 border-b border-trace-border text-left
                       hover:bg-trace-surface-2 transition-colors group"
          >
            <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-1 sm:mb-2">
              Ladda ner
            </div>
            <div className="font-mono text-xs sm:text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
              Badge →
            </div>
          </button>
        </div>

        {/* Embed Code */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="font-mono text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-2 sm:mb-3">
            Embed-kod för hemsida
          </div>
          <p className="text-xs text-trace-text-muted mb-3 hidden sm:block">
            Sätt badgen i dina offerter, på hemsidan eller skriv ut som QR-kod på produkten.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 bg-trace-surface-2 border border-trace-border px-3 sm:px-4 py-2 sm:py-3
                            font-mono text-[10px] sm:text-xs text-trace-text-secondary overflow-x-auto whitespace-nowrap">
              {`<img src="${API_URL}/badge/${runId}.svg" />`}
            </div>
            <button
              onClick={handleCopyEmbed}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-trace-border font-mono text-xs uppercase tracking-wide
                         text-trace-text hover:bg-sis-pomegranate hover:text-white
                         hover:border-sis-pomegranate transition-colors flex-shrink-0"
            >
              {embedCopied ? '✓ Kopierad' : 'Kopiera'}
            </button>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-trace-bg/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDownloadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-trace-surface border border-trace-border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-trace-border flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-trace-text-muted uppercase mb-1">
                    Ladda ner
                  </div>
                  <div className="font-display text-xl font-light text-trace-text">
                    Badge-format
                  </div>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="w-10 h-10 border border-trace-border flex items-center justify-center
                             text-trace-text-muted hover:text-trace-text hover:border-trace-text
                             transition-colors font-mono text-lg"
                >
                  ×
                </button>
              </div>

              {/* Options */}
              <div className="divide-y divide-trace-border">
                {/* SVG */}
                <button
                  onClick={() => {
                    handleDownloadSVG()
                    setShowDownloadModal(false)
                  }}
                  className="w-full px-8 py-5 text-left hover:bg-trace-surface-2 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
                        SVG
                      </div>
                      <div className="font-mono text-xs text-trace-text-muted mt-1">
                        Skalbart vektorformat. Bäst för webb och tryck.
                      </div>
                    </div>
                    <span className="font-mono text-trace-text-muted group-hover:text-sis-pomegranate transition-colors">
                      →
                    </span>
                  </div>
                </button>

                {/* PNG */}
                <button
                  onClick={() => {
                    handleDownloadPNG()
                    setShowDownloadModal(false)
                  }}
                  className="w-full px-8 py-5 text-left hover:bg-trace-surface-2 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
                        PNG
                      </div>
                      <div className="font-mono text-xs text-trace-text-muted mt-1">
                        Transparent bakgrund. Fungerar överallt.
                      </div>
                    </div>
                    <span className="font-mono text-trace-text-muted group-hover:text-sis-pomegranate transition-colors">
                      →
                    </span>
                  </div>
                </button>

                {/* PDF */}
                <button
                  onClick={() => {
                    handleDownloadPDF()
                    setShowDownloadModal(false)
                  }}
                  className="w-full px-8 py-5 text-left hover:bg-trace-surface-2 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm text-trace-text group-hover:text-sis-pomegranate transition-colors">
                        PDF-rapport
                      </div>
                      <div className="font-mono text-xs text-trace-text-muted mt-1">
                        Fullständig ISO-rapport med alla indikatorer.
                      </div>
                    </div>
                    <span className="font-mono text-trace-text-muted group-hover:text-sis-pomegranate transition-colors">
                      →
                    </span>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-trace-border">
                <p className="font-mono text-[10px] text-trace-text-muted text-center">
                  Badgen är endast giltig för den produkt den är utfärdad för.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
