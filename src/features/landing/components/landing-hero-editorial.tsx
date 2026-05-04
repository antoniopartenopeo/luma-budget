"use client"

import {
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react"
import { LANDING_HERO_EDITORIAL } from "../content"
import { AppleFluidBackground } from "./motion-primitives"
import { LandingCoverFlow } from "./landing-cover-flow"

const HERO_TRUST_ICONS = [ShieldCheck, LockKeyhole, SlidersHorizontal] as const

function HeroTrustStrip() {
  return (
    <div
      className="pointer-events-none mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 text-[12px] font-medium leading-relaxed text-slate-700/62 motion-safe:transition-opacity motion-safe:duration-[1600ms] motion-safe:ease-out motion-safe:delay-[700ms] motion-safe:starting:opacity-0 sm:mt-7 dark:text-white/62"
    >
      <p className="sr-only">{LANDING_HERO_EDITORIAL.trustItems.join(" · ")}</p>
      {LANDING_HERO_EDITORIAL.trustItems.map((item, index) => {
        const Icon = HERO_TRUST_ICONS[index] ?? ShieldCheck

        return (
          <span key={item} className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-600/52 dark:text-white/52" />
            {item}
          </span>
        )
      })}
    </div>
  )
}

export function LandingHeroEditorial() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden bg-[linear-gradient(180deg,#eef7fb_0%,#f7fbfd_46%,#edf7f6_100%)] px-4 pt-[clamp(5.75rem,11svh,8rem)] text-foreground sm:px-6 sm:pt-[clamp(6.25rem,12svh,9rem)] lg:px-8 lg:pt-[clamp(6.5rem,12svh,9rem)] dark:bg-[#020509]"
      aria-labelledby="landing-hero-title"
      data-testid="landing-hero-editorial"
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] [mask-image:linear-gradient(to_bottom,black_42%,transparent_100%)] dark:opacity-[0.22]">
        <AppleFluidBackground className="scale-[1.14] saturate-[0.22] sm:scale-[1.08]" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_50%_53%,rgba(14,165,168,0.18),transparent_32%),linear-gradient(180deg,rgba(241,249,252,0.34),rgba(238,247,249,0.74)_72%,#f7fbfd_100%)] dark:bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_50%_53%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,rgba(2,5,9,0.54),rgba(2,5,9,0.78)_72%,#020509_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[34rem] bg-[radial-gradient(ellipse_at_center,rgba(14,165,168,0.16),transparent_54%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.16),transparent_54%)]" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[4%] z-[2] h-[28rem] w-[44rem] -translate-x-1/2 rounded-[100%] bg-cyan-200/28 blur-[120px] sm:h-[38rem] sm:w-[72rem] dark:bg-white/[0.07]"
      />

      <div className="relative z-30 mx-auto flex w-full max-w-[76rem] flex-col items-center text-center">

        <div className="relative z-30 flex flex-col items-center text-center">
          <h1 id="landing-hero-title" className="sr-only">
            {LANDING_HERO_EDITORIAL.srTitle}
          </h1>

          <p 
            className="max-w-[13ch] text-[clamp(3rem,7.4vw,6.2rem)] font-black leading-[0.93] tracking-tight text-slate-950 [text-wrap:balance] drop-shadow-[0_18px_58px_rgba(15,23,42,0.10)] dark:text-white dark:drop-shadow-[0_18px_58px_rgba(255,255,255,0.10)]"
          >
            {LANDING_HERO_EDITORIAL.headline}
          </p>

          <p 
            className="mt-5 max-w-[25rem] text-[1.05rem] font-medium leading-[1.5] text-slate-700/76 sm:max-w-[34rem] sm:text-[1.2rem] lg:max-w-[38rem] lg:text-[1.26rem] dark:text-white/68"
          >
            {LANDING_HERO_EDITORIAL.supportingCopy}
          </p>
        </div>

        <div className="relative mt-8 w-full max-w-[76rem] sm:mt-7 lg:mt-6">
          <div className="relative z-10 mx-auto w-full max-w-[76rem] origin-top lg:scale-[0.86]">
            <LandingCoverFlow />
          </div>

          <HeroTrustStrip />
        </div>

      </div>
    </section>
  )
}
