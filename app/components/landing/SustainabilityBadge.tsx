'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, QrCode, Share2, FileDown, Globe } from 'lucide-react'

export default function SustainabilityBadge() {
  return (
    <section className="py-24 px-6 bg-trace-bg border-t border-trace-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: explanation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-trace-border-light" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-trace-text-muted">
                Hållbarhetsbevis
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-trace-text mb-4">
              Ditt TR/ACE-bevis – redo att delas
            </h2>
            <p className="text-base text-trace-text-secondary mb-8 leading-relaxed">
              Varje screening-LCA i TR/ACE genererar ett hållbarhetsbevis som visar din produkts
              klimatpåverkan. Tillräckligt för upphandlingar och CSRD – utan konsult och utan krångel.
            </p>

            <div className="space-y-4">
              {[
                { icon: FileDown, text: 'Bifoga i anbud och offentliga upphandlingar' },
                { icon: Globe, text: 'Publicera på din hemsida som screening-LCA' },
                { icon: Share2, text: 'Dela i sociala medier – varje badge är en annons' },
                { icon: QrCode, text: 'Sätt QR-koden direkt på produkten' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-trace-border-light flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-sis-pomegranate" />
                  </div>
                  <span className="text-trace-text-secondary text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-trace-text-muted leading-relaxed">
              Varje gång du delar din TR/ACE-badge berättar du att miljödata inte behöver
              vara svårt eller dyrt. Dina kunder och kollegor ser att du har gjort en
              screening-LCA – och frågar hur du gjort.
            </p>
          </motion.div>

          {/* Right: badge mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm bg-trace-bg border border-trace-border p-8 relative">
              {/* Level badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 bg-sis-pomegranate text-white
                                px-4 py-1.5 text-sm font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  TR/ACE Screening-LCA
                </div>
              </div>

              <div className="mt-4 text-center">
                {/* Product name */}
                <h3 className="font-display text-xl font-light text-trace-text mb-1">
                  Kontorsstol Ergo Pro
                </h3>
                <p className="text-sm text-trace-text-muted mb-6">
                  Skandiform AB &middot; Tibro
                </p>

                {/* Key metrics */}
                <div className="space-y-0 mb-6 border border-trace-border divide-y divide-trace-border">
                  {[
                    { label: 'Klimatpåverkan', value: '12.4 kg CO₂e' },
                    { label: 'Vattenförbrukning', value: '847 L' },
                    { label: 'Cirkularitet', value: '34%' },
                    { label: 'Energianvändning', value: '186 MJ' },
                  ].map((metric, i) => (
                    <div key={i} className="flex justify-between items-center py-3 px-4">
                      <span className="text-sm text-trace-text-muted">{metric.label}</span>
                      <span className="font-medium text-trace-text">{metric.value}</span>
                    </div>
                  ))}
                </div>

                {/* Standard reference */}
                <div className="bg-trace-surface p-3 mb-4">
                  <div className="text-xs text-trace-text-muted">
                    Screening-LCA enligt ISO 14040/14044-metodiken
                  </div>
                  <div className="text-xs text-trace-text-muted mt-1 opacity-60">
                    Emissionsfaktorer från Ecoinvent och ELCD
                  </div>
                </div>

                {/* QR + verification */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-trace-surface border border-trace-border flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-trace-text-muted" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted">Verifierings-ID</div>
                    <div className="text-sm font-mono font-medium text-trace-text">
                      TRACE-00847
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
