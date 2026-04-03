"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { GLASS_V2_PANEL_CLASS } from "@/components/ui/glass-tokens"
import { cn } from "@/lib/utils"
import {
  LANDING_HERO_EDITORIAL,
  type LandingHeroEditorialPanel
} from "../data"
import {
  LANDING_HERO_PRISM_GLOW_DURATION,
  LANDING_HERO_PRISM_PANELS,
  LANDING_HERO_PRISM_SCROLL_RANGE,
  LANDING_HERO_PRISM_STAGGER,
  LANDING_MOTION_EASE,
  LANDING_MOTION_TIMINGS,
} from "./landing-motion"
import { AppleFluidBackground } from "./motion-primitives"

const PRISM_PANEL_ACCENTS = [
  {
    kickerClassName: "text-cyan-700 dark:text-cyan-300",
    iconClassName:
      "border-cyan-400/28 bg-cyan-500/12 text-cyan-700 dark:border-cyan-400/18 dark:bg-cyan-400/10 dark:text-cyan-300",
    panelClassName:
      "border-cyan-400/22 bg-gradient-to-br from-cyan-500/[0.08] via-white/74 to-cyan-100/48 dark:from-cyan-400/[0.10] dark:via-[#061019]/84 dark:to-cyan-900/[0.20]",
    lineClassName: "bg-cyan-400/24 dark:bg-cyan-300/18"
  },
  {
    kickerClassName: "text-slate-700 dark:text-slate-200",
    iconClassName:
      "border-slate-400/24 bg-slate-500/10 text-slate-700 dark:border-slate-300/18 dark:bg-slate-200/10 dark:text-slate-200",
    panelClassName:
      "border-slate-400/18 bg-gradient-to-br from-slate-500/[0.08] via-white/76 to-slate-100/52 dark:from-slate-200/[0.10] dark:via-[#081018]/86 dark:to-slate-900/[0.22]",
    lineClassName: "bg-slate-400/22 dark:bg-slate-200/16"
  },
  {
    kickerClassName: "text-teal-700 dark:text-teal-200",
    iconClassName:
      "border-teal-400/28 bg-teal-500/12 text-teal-700 dark:border-teal-300/18 dark:bg-teal-300/10 dark:text-teal-200",
    panelClassName:
      "border-teal-400/22 bg-gradient-to-br from-teal-500/[0.08] via-white/74 to-teal-100/50 dark:from-teal-300/[0.10] dark:via-[#061111]/84 dark:to-teal-900/[0.22]",
    lineClassName: "bg-teal-400/22 dark:bg-teal-200/16"
  }
] as const

const PRISM_PANEL_POSITIONS = [
  "left-[6%] top-[8%] sm:left-[12%] sm:top-[10%] lg:left-[18%] lg:top-[10%]",
  "left-[24%] top-[34%] sm:left-[26%] sm:top-[28%] lg:left-[30%] lg:top-[30%]",
  "left-[10%] top-[68%] sm:left-[8%] sm:top-[52%] lg:left-[12%] lg:top-[54%]"
] as const

function LandingHeroPrismPanel({
  accent,
  index,
  panel,
  positionClassName,
  prefersReducedMotion,
  scrollYProgress
}: {
  accent: (typeof PRISM_PANEL_ACCENTS)[number]
  index: number
  panel: LandingHeroEditorialPanel
  positionClassName: string
  prefersReducedMotion: boolean
  scrollYProgress: MotionValue<number>
}) {
  const motionConfig = LANDING_HERO_PRISM_PANELS[index]
  const x = useTransform(
    scrollYProgress,
    LANDING_HERO_PRISM_SCROLL_RANGE,
    [motionConfig.baseX, motionConfig.baseX + motionConfig.scrollX]
  )
  const y = useTransform(
    scrollYProgress,
    LANDING_HERO_PRISM_SCROLL_RANGE,
    [motionConfig.baseY, motionConfig.baseY + motionConfig.scrollY]
  )
  const rotate = useTransform(
    scrollYProgress,
    LANDING_HERO_PRISM_SCROLL_RANGE,
    [motionConfig.baseRotate, motionConfig.scrollRotate]
  )

  return (
    <motion.div
      aria-hidden="true"
      data-testid="landing-hero-prism-panel"
      className={cn("pointer-events-none absolute will-change-transform", positionClassName)}
      style={{ scale: motionConfig.scale }}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: motionConfig.scale - 0.08 }}
      animate={{ opacity: 1, scale: motionConfig.scale }}
      transition={
        prefersReducedMotion
          ? LANDING_MOTION_TIMINGS.instant
          : { ...LANDING_MOTION_TIMINGS.slow, delay: index * LANDING_HERO_PRISM_STAGGER }
      }
    >
      <motion.div
        className={cn(
          GLASS_V2_PANEL_CLASS,
          "relative w-[10.75rem] rounded-[2rem] p-4 shadow-[0_40px_110px_-50px_rgba(15,23,42,0.42)] sm:w-[17rem] sm:rounded-[2.4rem] sm:p-6 lg:w-[19rem] xl:w-[20rem]",
          accent.panelClassName
        )}
        style={{
          x: prefersReducedMotion ? motionConfig.baseX : x,
          y: prefersReducedMotion ? motionConfig.baseY : y,
          rotate: prefersReducedMotion ? motionConfig.baseRotate : rotate
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_52%)]" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent dark:via-white/20" />

        <div className="relative space-y-6">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[0.95rem] border shadow-[0_20px_34px_-24px_rgba(15,23,42,0.42)] sm:h-12 sm:w-12 sm:rounded-[1rem]",
              accent.iconClassName
            )}
          >
            <panel.icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="space-y-3">
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", accent.kickerClassName)}>
              {panel.title}
            </p>
            <p className="max-w-[12ch] text-pretty text-[1rem] font-semibold leading-tight text-foreground sm:max-w-[14ch] sm:text-[1.35rem]">
              {panel.description}
            </p>
          </div>

          <div className={cn("h-px w-14", accent.lineClassName)} />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function LandingHeroEditorial() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden px-4 py-16 md:min-h-[calc(100svh-4.5rem)] sm:px-6 lg:px-8"
      aria-labelledby="landing-hero-title"
      data-testid="landing-hero-editorial"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AppleFluidBackground />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_32%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[15%] z-[2] h-[18rem] w-[18rem] rounded-full bg-cyan-400/20 blur-[110px] dark:bg-cyan-300/14 sm:h-[24rem] sm:w-[24rem] lg:h-[30rem] lg:w-[30rem]"
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.35, 0.62, 0.4], scale: [0.92, 1.06, 0.98] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: LANDING_HERO_PRISM_GLOW_DURATION,
                repeat: Infinity,
                ease: LANDING_MOTION_EASE
              }
        }
      />

      <div className="pointer-events-none absolute inset-y-0 left-[50%] right-[-42%] z-10 sm:left-[40%] sm:right-[-16%] lg:left-[48%] lg:right-[-8%]">
        {LANDING_HERO_EDITORIAL.panels.map((panel, index) => (
          <LandingHeroPrismPanel
            key={panel.title}
            accent={PRISM_PANEL_ACCENTS[index]}
            index={index}
            panel={panel}
            positionClassName={PRISM_PANEL_POSITIONS[index]}
            prefersReducedMotion={prefersReducedMotion}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-6xl items-center">
        <div className="max-w-[38rem] py-6 sm:py-10">
          <h1 id="landing-hero-title" className="sr-only">
            {LANDING_HERO_EDITORIAL.srTitle}
          </h1>

          <div className="max-w-[36rem] sm:mt-2">
            <BrandLogo
              variant="full"
              height={224}
              className="w-auto max-w-[15.5rem] drop-shadow-[0_26px_60px_rgba(255,255,255,0.24)] sm:max-w-[26rem] lg:max-w-[34rem]"
            />
          </div>

          <p className="mt-5 max-w-[17rem] text-[0.98rem] font-medium leading-[1.45] tracking-[-0.01em] text-foreground/68 sm:mt-6 sm:max-w-[23rem] sm:text-[1.08rem] sm:leading-relaxed lg:max-w-[27rem] lg:text-[1.16rem]">
            {LANDING_HERO_EDITORIAL.supportingCopy}
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              asChild
              size="default"
              className="h-9 rounded-full px-6 text-[0.95rem] shadow-[0_20px_44px_-24px_rgba(14,165,168,0.42)] transition-[box-shadow,transform] hover:shadow-[0_28px_56px_-24px_rgba(14,165,168,0.58)] sm:h-10 sm:px-8 sm:text-sm"
            >
              <Link href="/dashboard">
                {LANDING_HERO_EDITORIAL.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="default" className="h-9 rounded-full px-6 text-[0.95rem] sm:h-10 sm:px-8 sm:text-sm">
              <Link href="/transactions/import">
                {LANDING_HERO_EDITORIAL.secondaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
