"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { LANDING_DEMO_STEPS } from "../data"
import { LandingStepPreview } from "./landing-previews"

export function LandingProductDemo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const stepRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    const observedSteps = stepRefs.current.filter(Boolean)
    if (observedSteps.length === 0 || typeof IntersectionObserver === "undefined") {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)

        if (visibleEntries[0]) {
          const nextIndex = Number(visibleEntries[0].target.getAttribute("data-step-index"))
          if (!Number.isNaN(nextIndex)) {
            setActiveIndex(nextIndex)
          }
        }
      },
      {
        threshold: [0.35, 0.6, 0.8],
        rootMargin: "-14% 0px -18% 0px"
      }
    )

    observedSteps.forEach((step) => {
      if (step) {
        observer.observe(step)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const activeStep = LANDING_DEMO_STEPS[activeIndex] ?? LANDING_DEMO_STEPS[0]

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          Quattro momenti reali del prodotto, in ordine. Resti sempre dentro la landing, ma vedi chiaramente come Numa accompagna dal dato iniziale alla decisione finale.
        </p>

        <div className="flex flex-wrap gap-2">
          {LANDING_DEMO_STEPS.map((step, index) => {
            const isCurrent = index === activeIndex

            return (
              <div
                key={step.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-[background-color,border-color,opacity] duration-300",
                  isCurrent
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-white/24 bg-white/55 text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", isCurrent ? "bg-primary animate-ping-slow" : "bg-muted-foreground/45")} />
                {step.eyebrow}
              </div>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        Step attivo: {activeStep.title}
      </p>

      <div className="space-y-5">
        {LANDING_DEMO_STEPS.map((step, index) => {
          const isActive = index === activeIndex

          return (
            <motion.article
              key={step.id}
              ref={(node) => {
                stepRefs.current[index] = node
              }}
              data-step-index={index}
              data-testid={`landing-demo-step-${step.id}`}
              id={`demo-${step.id}`}
              tabIndex={0}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-strong scroll-mt-24 p-5 outline-none transition-[box-shadow,border-color,background-color,opacity] duration-300 sm:p-6",
                isActive ? "opacity-100 ring-1 ring-primary/20 shadow-2xl shadow-primary/10" : "opacity-85"
              )}
              aria-labelledby={`landing-demo-title-${step.id}`}
              aria-describedby={`landing-demo-description-${step.id}`}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border transition-colors",
                        isActive
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-white/28 bg-white/55 text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]"
                      )}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{step.eyebrow}</p>
                      <h3 id={`landing-demo-title-${step.id}`} className="max-w-[18ch] text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p
                    id={`landing-demo-description-${step.id}`}
                    className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {step.description}
                  </p>

                  <div className="rounded-[1.35rem] border border-primary/14 bg-primary/10 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      {step.outcome}
                    </p>
                  </div>
                </div>

                <LandingStepPreview step={step} isActive={isActive} />
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
