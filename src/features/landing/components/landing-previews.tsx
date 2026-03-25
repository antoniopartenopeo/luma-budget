"use client"

import { motion } from "framer-motion"
import { LANDING_STORY_POINTS } from "../data"

export function LandingHeroConsole() {
  return (
    <div className="surface-strong overflow-hidden p-6 sm:p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="max-w-[20ch] text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Sai quanto hai speso. Ma sai come sta andando il mese?
          </h3>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
            La differenza tra un elenco di transazioni e una visione utile è enorme. Quasi nessuna app la colma.
          </p>
        </div>

        <div className="space-y-3">
          {LANDING_STORY_POINTS.map((point) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="surface-subtle p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-bold text-foreground">{point.title}</p>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-primary/14 bg-primary/10 px-4 py-4">
          <p className="text-sm font-semibold leading-relaxed text-foreground">
            Numa non aggiunge un altro tracker. Ti dà una lente sul mese: presente, stima e sostenibilità delle spese fisse.
          </p>
        </div>
      </div>
    </div>
  )
}
