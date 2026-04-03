"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
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
    glowClassName: "bg-cyan-500/16 dark:bg-white/[0.08]",
    glyphClassName: "text-cyan-700 dark:text-white/42",
    labelClassName: "text-foreground dark:text-white/88"
  },
  {
    glowClassName: "bg-slate-500/14 dark:bg-white/[0.07]",
    glyphClassName: "text-slate-700 dark:text-white/38",
    labelClassName: "text-foreground dark:text-white/84"
  },
  {
    glowClassName: "bg-teal-500/15 dark:bg-white/[0.075]",
    glyphClassName: "text-teal-700 dark:text-white/40",
    labelClassName: "text-foreground dark:text-white/82"
  }
] as const

const PRISM_PANEL_POSITIONS = [
  "left-[8%] top-[12%] sm:left-[14%] sm:top-[12%] lg:left-[18%] lg:top-[12%]",
  "left-[18%] top-[38%] sm:left-[20%] sm:top-[38%] lg:left-[24%] lg:top-[38%]",
  "left-[6%] top-[66%] sm:left-[10%] sm:top-[64%] lg:left-[14%] lg:top-[64%]"
] as const

const PRISM_PANEL_EDITORIAL_DRIFT = [
  {
    x: [0, 8, 3, -5, 0],
    y: [0, -10, -4, 6, 0],
    rotate: [-1.4, -3.1, -2.3, -1.1, -1.4],
    duration: 15.5
  },
  {
    x: [0, -6, -2, 7, 0],
    y: [0, 7, 2, -8, 0],
    rotate: [1.1, 2.6, 1.7, 0.6, 1.1],
    duration: 17.25
  },
  {
    x: [0, 7, 1, -6, 0],
    y: [0, -8, -2, 5, 0],
    rotate: [-1.2, -2.8, -1.8, -0.7, -1.2],
    duration: 16.4
  }
] as const

function LandingHeroGlassGlyph({
  icon: Icon,
  accent,
  prefersReducedMotion
}: {
  icon: LandingHeroEditorialPanel["icon"]
  accent: (typeof PRISM_PANEL_ACCENTS)[number]
  prefersReducedMotion: boolean
}) {
  return (
    <motion.div
      className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32 lg:h-40 lg:w-40"
      animate={
        prefersReducedMotion
          ? undefined
          : {
              scale: [1, 1.028, 0.994, 1],
              opacity: [0.94, 1, 0.96, 0.94]
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 9.5,
              repeat: Infinity,
              ease: LANDING_MOTION_EASE
            }
      }
    >
      <div className={cn("absolute inset-[14%] rounded-full blur-2xl", accent.glowClassName)} />
      <Icon
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full blur-[8px] opacity-22", accent.glyphClassName)}
        strokeWidth={2.4}
      />
      <Icon
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full opacity-34", accent.glyphClassName)}
        strokeWidth={2.1}
      />
      <Icon
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-white/42 mix-blend-screen"
        strokeWidth={1.25}
      />
      <div className="absolute inset-[10%] rounded-[30%] bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.16),transparent_42%),linear-gradient(125deg,rgba(255,255,255,0.06),transparent_48%)] opacity-80" />
    </motion.div>
  )
}

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
  const drift = PRISM_PANEL_EDITORIAL_DRIFT[index]
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
          "relative"
        )}
        style={{
          x: prefersReducedMotion ? motionConfig.baseX : x,
          y: prefersReducedMotion ? motionConfig.baseY : y,
          rotate: prefersReducedMotion ? motionConfig.baseRotate : rotate
        }}
      >
        <motion.div
          className="relative flex items-center gap-4 sm:gap-5 lg:gap-6"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [...drift.x],
                  y: [...drift.y],
                  rotate: [...drift.rotate]
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: drift.duration,
                  repeat: Infinity,
                  ease: LANDING_MOTION_EASE
                }
          }
        >
          <LandingHeroGlassGlyph
            icon={panel.icon}
            accent={accent}
            prefersReducedMotion={prefersReducedMotion}
          />
          <motion.div
            className="space-y-1.5"
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, -2, 1, 0], opacity: [0.9, 1, 0.94, 0.9] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: drift.duration - 2,
                    repeat: Infinity,
                    ease: LANDING_MOTION_EASE
                  }
            }
          >
            <p
              className={cn(
                "text-[1.25rem] font-black leading-none tracking-tight sm:text-[1.8rem] lg:text-[2.4rem]",
                accent.labelClassName
              )}
            >
              {panel.title}
            </p>
            <span className="sr-only">{panel.description}</span>
          </motion.div>
        </motion.div>
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
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_32%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[15%] z-[2] h-[18rem] w-[18rem] rounded-full bg-cyan-400/20 blur-[110px] dark:bg-white/10 sm:h-[24rem] sm:w-[24rem] lg:h-[30rem] lg:w-[30rem]"
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

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[3] flex -translate-y-1/2 justify-center lg:left-[-4%] lg:justify-start">
        <BrandLogo
          variant="full"
          height={400}
          className="h-auto w-[min(112vw,82rem)] opacity-[0.16] saturate-[0.88] dark:opacity-[0.11]"
        />
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-6xl items-center">
        <div className="max-w-[38rem] py-6 sm:py-10">
          <h1 id="landing-hero-title" className="sr-only">
            {LANDING_HERO_EDITORIAL.srTitle}
          </h1>

          <p className="mt-18 max-w-[14ch] text-[1.6rem] font-black leading-[0.98] tracking-tight text-foreground sm:mt-24 sm:text-[2rem] lg:mt-28 lg:text-[2.35rem]">
            {LANDING_HERO_EDITORIAL.headline}
          </p>

          <p className="mt-4 max-w-[18rem] text-[0.98rem] font-medium leading-[1.45] tracking-[-0.01em] text-foreground/68 sm:max-w-[24rem] sm:text-[1.08rem] sm:leading-relaxed lg:max-w-[29rem] lg:text-[1.16rem]">
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
