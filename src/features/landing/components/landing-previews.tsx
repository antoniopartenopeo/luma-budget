"use client"

import { motion } from "framer-motion"
import { LANDING_STORY_POINTS } from "../data"
import {
  LANDING_EDITORIAL_ACCENT_CLASS,
  LANDING_EDITORIAL_PANEL_CLASS,
  LANDING_SECTION_DESCRIPTION_CLASS,
  LANDING_SECTION_EYEBROW_CLASS,
  LANDING_SECTION_TITLE_CLASS
} from "./landing-tokens"
import { LANDING_MOTION_TIMINGS } from "./landing-motion"

export function LandingHeroConsole() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className={LANDING_SECTION_EYEBROW_CLASS}>Perche succede</p>
        <h3 className={LANDING_SECTION_TITLE_CLASS}>
          Sai quanto hai speso. Ma sai come sta andando il mese?
        </h3>
        <p className={LANDING_SECTION_DESCRIPTION_CLASS}>
          La differenza tra un elenco di transazioni e una visione utile è enorme. Quasi nessuna app la colma.
        </p>
      </div>

      <div className={LANDING_EDITORIAL_PANEL_CLASS}>
        <div className="space-y-4">
          {LANDING_STORY_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={LANDING_MOTION_TIMINGS.fast}
              className={index === 0 ? "" : "border-t border-primary/10 pt-4"}
            >
              <div className="flex items-start gap-4">
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
      </div>

      <div className={LANDING_EDITORIAL_ACCENT_CLASS}>
        <p className="text-sm font-semibold leading-relaxed text-foreground">
          Numa non aggiunge un altro tracker. Ti dà una lente sul mese: presente, stima e sostenibilità delle spese fisse.
        </p>
      </div>
    </div>
  )
}
