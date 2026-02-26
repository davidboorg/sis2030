import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import CertificateClient from './CertificateClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'

type RunData = {
  status: string
  indicators: Record<string, number>
  hotspots: { name: string; share_pct?: number; contribution_pct?: number }[]
  assumptions: string[]
  recommendations: { action: string; impact: string; standard: string }[]
}

async function getRunData(runId: string): Promise<RunData | null> {
  try {
    const res = await fetch(`${API_URL}/runs/${runId}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getProductInfo(runId: string): Promise<{ name: string; org: string } | null> {
  try {
    const badgeRes = await fetch(`${API_URL}/badge/${runId}`, { cache: 'no-store' })
    if (!badgeRes.ok) return null

    const svgText = await badgeRes.text()
    const productNameMatch = svgText.match(/font-size="18"[^>]*>([^<]+)<\/text>/)
    const orgMatch = svgText.match(/fill-opacity="0.8">([^·]+)/)

    return {
      name: productNameMatch?.[1] || 'Produkt',
      org: orgMatch?.[1]?.trim() || '',
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const runData = await getRunData(params.id)
  const productInfo = await getProductInfo(params.id)

  if (!runData || !productInfo) {
    return {
      title: 'Certifikat ej hittat | TR/ACE',
    }
  }

  const productName = productInfo.name.replace('[Demo] ', '')
  const co2e = runData.indicators.co2e_kg?.toFixed(1) || '0'

  const title = `${productName} — Screening-LCA | TR/ACE`
  const description = `${co2e} kg CO₂e per enhet. Screening-LCA beräknad enligt ISO 14040/14044-metodiken. Ej externt granskad. Verifierad av TR/ACE.`
  const url = `${BASE_URL}/certificate/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'TR/ACE',
      type: 'website',
      images: [
        {
          url: `${API_URL}/badge/${params.id}`,
          width: 400,
          height: 520,
          alt: `Miljöcertifikat för ${productName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${API_URL}/badge/${params.id}`],
    },
  }
}

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const [runData, productInfo] = await Promise.all([
    getRunData(params.id),
    getProductInfo(params.id),
  ])

  if (!runData || runData.status !== 'completed') {
    notFound()
  }

  const certificateUrl = `${BASE_URL}/certificate/${params.id}`

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(certificateUrl, {
    width: 100,
    margin: 0,
    color: {
      dark: '#F8FAFC',
      light: '#00000000',
    },
  })

  const productName = productInfo?.name.replace('[Demo] ', '') || 'Produkt'
  const orgName = productInfo?.org || ''
  const verificationId = `TRC-${new Date().getFullYear()}-${params.id.padStart(5, '0')}`

  const calculatedDate = new Date().toLocaleDateString('sv-SE')
  const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')

  // Indicator metadata
  const indicatorMeta: Record<string, { label: string; unit: string }> = {
    co2e_kg: { label: 'Klimatpåverkan', unit: 'kg CO₂e' },
    water_l: { label: 'Vattenförbrukning', unit: 'liter' },
    energy_mj: { label: 'Energianvändning', unit: 'MJ' },
    circularity_pct: { label: 'Cirkularitet', unit: '%' },
    land_m2a: { label: 'Markanvändning', unit: 'm²·år' },
    acid_mol_hplus: { label: 'Försurning', unit: 'mol H⁺-eq' },
    eutro_g_po4: { label: 'Övergödning', unit: 'g PO₄³⁻-eq' },
    biodiversity_index: { label: 'Biodiversitet', unit: 'index' },
  }

  const indicatorCount = Object.keys(runData.indicators).length

  return (
    <main className="min-h-screen bg-trace-bg text-trace-text">
      {/* Header */}
      <header className="border-b border-trace-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-light tracking-tight">
            TR<span className="text-sis-pomegranate italic">/</span>ACE
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-trace-text-muted uppercase">
            Screening-LCA Certificate
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Main Certificate */}
        <div className="border border-trace-border bg-trace-surface relative">
          {/* Pomegranate accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sis-pomegranate to-transparent" />

          {/* Certificate Header */}
          <div className="px-10 py-10 border-b border-trace-border">
            <div className="flex items-start justify-between">
              <div>
                {/* Level indicator — Screening-LCA (ej externt granskad) */}
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-verified-dot rounded-full shadow-[0_0_8px_#F32735]" />
                  <span className="font-mono text-[10px] tracking-[0.15em] text-sis-pomegranate uppercase">
                    Screening-LCA · ISO 14040/14044 · Ej externt granskad
                  </span>
                </div>

                {/* Product name */}
                <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight mb-2">
                  {productName}
                </h1>
                {orgName && (
                  <p className="font-mono text-sm text-trace-text-secondary">
                    {orgName}
                  </p>
                )}
              </div>

              {/* Seal */}
              <div className="w-16 h-16 border border-sis-pomegranate flex flex-col items-center justify-center flex-shrink-0">
                <span className="font-mono text-[7px] tracking-[0.1em] text-trace-text-muted">TR/ACE</span>
                <span className="font-display text-2xl text-sis-pomegranate italic font-light">/</span>
                <span className="font-mono text-[6px] tracking-[0.05em] text-trace-text-muted text-center leading-tight">VERIFIED<br />2025</span>
              </div>
            </div>
          </div>

          {/* Standards & level */}
          <div className="px-10 py-6 border-b border-trace-border bg-trace-surface-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-trace-text-muted uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-sis-pomegranate rounded-full" />
              Beräkningsstandard
            </div>
            <div className="font-mono text-xs text-trace-text-secondary mb-1">
              Nivå 1 — TR/ACE screening
            </div>
            <div className="font-mono text-xl tracking-wide">
              ISO 14040<span className="text-sis-pomegranate">/</span>14044
            </div>
            <div className="text-sm text-trace-text-muted mt-1">
              Screening-LCA enligt ISO 14040/14044-metodiken. Ej fullständig konsult-LCA.
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {Object.entries(indicatorMeta).map(([key, meta]) => {
              const value = runData.indicators[key]
              if (value === undefined) return null

              return (
                <div
                  key={key}
                  className="px-6 py-6 border-b border-r border-trace-border last:border-r-0
                             md:[&:nth-child(4n)]:border-r-0"
                >
                  <div className="font-mono text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-2">
                    {meta.label}
                  </div>
                  <div className="font-mono text-2xl text-trace-text">
                    {typeof value === 'number'
                      ? value.toLocaleString('sv-SE', { maximumFractionDigits: 1 })
                      : value}
                  </div>
                  <div className="font-mono text-xs text-trace-text-muted">
                    {meta.unit}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Metadata */}
          <div className="px-10 py-8 border-t border-trace-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Certificate data */}
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-trace-text-muted tracking-wide">REFERENCE</span>
                  <span className="text-trace-text">{verificationId}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-trace-text-muted tracking-wide">ISSUED</span>
                  <span className="text-trace-text">{calculatedDate}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-trace-text-muted tracking-wide">VALID UNTIL</span>
                  <span className="text-trace-text">{validUntil}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-trace-text-muted tracking-wide">INDICATORS</span>
                  <span className="text-sis-pomegranate">{indicatorCount} / {indicatorCount}</span>
                </div>
              </div>

              {/* Right: QR Code */}
              <div className="flex items-center justify-center md:justify-end gap-4">
                <div className="text-right">
                  <div className="font-mono text-[9px] tracking-[0.15em] text-trace-text-muted uppercase mb-1">
                    Verifiera
                  </div>
                  <div className="font-mono text-xs text-trace-text-secondary">
                    trace.se/c/{params.id}
                  </div>
                </div>
                <div className="border border-trace-border p-2 bg-trace-surface-2">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR-kod för verifiering"
                    width={80}
                    height={80}
                    className="block"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-4 border-t border-trace-border bg-trace-surface-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-sis-pomegranate rounded-full shadow-[0_0_8px_#F32735]" />
              <span className="font-mono text-[10px] tracking-[0.1em] text-sis-pomegranate">
                VERIFIED — trace.se/verify/{verificationId}
              </span>
            </div>
            <div className="font-display text-lg font-light">
              TR<span className="text-sis-pomegranate italic">/</span>ACE
            </div>
          </div>
        </div>

        {/* Share Section - Client Component */}
        <CertificateClient
          certificateUrl={certificateUrl}
          productName={productName}
          runId={params.id}
          co2e={runData.indicators.co2e_kg}
        />

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-trace-text-muted mb-6 font-mono text-sm">
            Skapa din egen screening-LCA på under 10 minuter.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="/demo"
              className="inline-flex items-center gap-3 px-8 py-4 bg-sis-pomegranate text-white
                         font-mono text-sm tracking-wide uppercase hover:bg-red-600 transition-colors"
            >
              Testa TR/ACE – Demo
              <span>→</span>
            </a>
            <button
              className="inline-flex items-center gap-2 font-mono text-xs text-trace-text-secondary hover:text-sis-pomegranate transition-colors"
            >
              Vill du ha en externt granskad analys?{' '}
              <span className="text-sis-pomegranate">Uppgradera till TR/ACE Verified →</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
