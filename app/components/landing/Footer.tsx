import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-sis-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-sis-pomegranate rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">2+</span>
              </div>
              <span className="font-semibold">2030+ Calculator</span>
            </div>
            <p className="text-sm text-sis-gray-400 leading-relaxed">
              ISO-kompatibel livscykelanalys för svenska tillverkare.
              Utvecklat av SIS och Surprise Ventures.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Produkt</h4>
            <div className="space-y-2 text-sm text-sis-gray-400">
              <Link href="/demo" className="block hover:text-white transition-colors">Testa gratis</Link>
              <Link href="/dashboard" className="block hover:text-white transition-colors">Logga in</Link>
              <span className="block">Priser: 2,000 kr/mån</span>
            </div>
          </div>

          {/* Standards */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Standarder</h4>
            <div className="space-y-2 text-sm text-sis-gray-400">
              <span className="block">ISO 14040 - Livscykelanalys</span>
              <span className="block">ISO 14067 - Klimatpåverkan</span>
              <span className="block">ISO 14046 - Vattenavtryck</span>
              <span className="block">ISO 59004 - Cirkulär ekonomi</span>
            </div>
          </div>
        </div>

        <div className="border-t border-sis-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-sis-gray-500">
            <a href="/about" className="hover:text-white transition-colors">Om oss</a>
            <span className="text-sis-gray-700">&middot;</span>
            <a href="/contact" className="hover:text-white transition-colors">Kontakta</a>
            <span className="text-sis-gray-700">&middot;</span>
            <a href="/privacy" className="hover:text-white transition-colors">Integritet</a>
          </div>
          <div className="text-sm text-sis-gray-500">
            &copy; {currentYear} SIS &middot; Surprise Ventures
          </div>
        </div>
      </div>
    </footer>
  )
}
