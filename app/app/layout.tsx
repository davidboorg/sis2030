import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'TR/ACE – Dina kunders miljökrav, besvarade på minuter',
  description:
    'Screening-LCA enligt ISO 14040/14044-metodiken. Dina kunders miljökrav – besvarade på minuter. 10 minuter och 2 000 kr/mån istället för 6 veckor och 200 000 kr.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


