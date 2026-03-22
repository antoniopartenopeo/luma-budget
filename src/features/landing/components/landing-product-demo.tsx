"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll } from "framer-motion"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { LANDING_DEMO_STEPS } from "../data"
import { LandingStepPreview } from "./landing-previews"

export function LandingProductDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const mappedIndex = Math.floor(latest * 4)
      const newIndex = Math.min(Math.max(0, mappedIndex), 3)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    })
  }, [scrollYProgress, activeIndex])

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Background dark ambient gradient to differentiate the demo area */}
        <div className="absolute inset-0 z-0 bg-background pointer-events-none" />

        <div className="relative z-10 flex h-full w-full max-w-6xl flex-col gap-4 px-4 pb-4 pt-10 md:gap-8 md:py-24 lg:grid lg:grid-cols-2 lg:items-center">
          {/* Left Side: Copy */}
          <div className="w-full shrink-0 space-y-4 sm:space-y-6 lg:mt-0 lg:space-y-8">
            <div className="hidden flex-wrap gap-2 lg:flex">
              {LANDING_DEMO_STEPS.map((step, index) => {
                const isCurrent = index === activeIndex
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300",
                      isCurrent
                        ? "scale-100 border-primary/20 bg-primary/10 text-primary opacity-100"
                        : "scale-95 border-white/24 bg-white/55 text-muted-foreground opacity-50 dark:border-white/10 dark:bg-white/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        isCurrent ? "animate-ping-slow bg-primary" : "bg-muted-foreground/45"
                      )}
                    />
                    {step.eyebrow}
                  </div>
                )
              })}
            </div>

            <div className="relative min-h-[160px] sm:min-h-[220px]">
              {LANDING_DEMO_STEPS.map((step, index) => {
                const isActive = index === activeIndex
                return (
                  <motion.div
                    key={step.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 20,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 left-0 top-0 space-y-3 sm:space-y-4"
                  >
                    <div className="flex flex-col items-start gap-4 sm:flex-row">
                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-primary/20 bg-primary/10 text-primary sm:flex">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="max-w-[16ch] text-2xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                          {step.title}
                        </h3>
                        <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground lg:text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden rounded-[1.35rem] border border-primary/14 bg-primary/10 px-4 py-3 sm:ml-16 sm:inline-flex">
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Zap className="h-4 w-4 text-primary" />
                        {step.outcome}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right Side: Visual Preview */}
          <div className="relative mt-2 flex-1 min-h-[300px] w-full lg:mt-0 lg:h-[600px] lg:flex-none">
            {LANDING_DEMO_STEPS.map((step, index) => {
              const isActive = index === activeIndex
              return (
                <motion.div
                  key={step.id}
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.98,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-0 bottom-0 top-0 flex items-start justify-center lg:inset-0 lg:items-center lg:justify-end"
                >
                  <div className="w-full max-w-[360px] origin-top drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:max-w-md lg:max-w-[420px] lg:origin-center">
                    <LandingStepPreview step={step} isActive={isActive} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
