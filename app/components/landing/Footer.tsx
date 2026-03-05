import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-trace-bg text-trace-text py-12 px-6 border-t border-trace-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-xl font-light">
                TR<span className="text-sis-pomegranate italic">/</span>ACE
              </span>
            </div>
            <p className="text-sm text-trace-text-muted leading-relaxed">
              Screening-LCA för svenska tillverkare.
              Utvecklat av SIS och Surprise Ventures.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-trace-text-muted mb-4">Produkt</h4>
            <div className="space-y-2 text-sm text-trace-text-secondary">
              <Link href="/demo" className="block hover:text-sis-pomegranate transition-colors">Testa gratis</Link>
              <Link href="/dashboard" className="block hover:text-sis-pomegranate transition-colors">Logga in</Link>
              <span className="block text-trace-text-muted">Priser: 2,000 kr/mån</span>
            </div>
          </div>

          {/* Standards */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-trace-text-muted mb-4">Standarder</h4>
            <div className="space-y-2 text-sm text-trace-text-secondary">
              <span className="block">ISO 14040 - Livscykelanalys</span>
              <span className="block">ISO 14067 - Klimatpåverkan</span>
              <span className="block">ISO 14046 - Vattenavtryck</span>
              <span className="block">ISO 59004 - Cirkulär ekonomi</span>
            </div>
          </div>
        </div>

        <div className="border-t border-trace-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-trace-text-muted">
            <a href="/about" className="hover:text-sis-pomegranate transition-colors">Om oss</a>
            <span className="text-trace-border-light">&middot;</span>
            <a href="/contact" className="hover:text-sis-pomegranate transition-colors">Kontakta</a>
            <span className="text-trace-border-light">&middot;</span>
            <a href="/privacy" className="hover:text-sis-pomegranate transition-colors">Integritet</a>
          </div>
          <div className="text-sm text-trace-text-muted">
            &copy; {currentYear} SIS &middot; Surprise Ventures
          </div>
        </div>
      </div>
    </footer>
  )
}
