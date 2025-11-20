export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-sis-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="border-t border-sis-gray-800 pt-8">
          {/* Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="/about" className="hover:text-sis-pomegranate transition-colors">
                Om oss
              </a>
              <span className="text-sis-gray-600">·</span>
              <a href="/contact" className="hover:text-sis-pomegranate transition-colors">
                Kontakta
              </a>
              <span className="text-sis-gray-600">·</span>
              <a href="/privacy" className="hover:text-sis-pomegranate transition-colors">
                Integritet
              </a>
            </div>
            
            <div className="text-sm text-sis-gray-400">
              © 2030+ Calculator {currentYear}
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="text-xs text-sis-gray-500 text-center md:text-left">
            Detta är en demonstrationssida. Faktiska beräkningar sker i 2030+ Calculator-plattformen.
          </div>
        </div>
      </div>
    </footer>
  )
}
