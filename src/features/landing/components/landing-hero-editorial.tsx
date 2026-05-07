"use client"

import {
  Check,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react"
import { LANDING_HERO_EDITORIAL } from "../content"

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

function HeroNumaObject() {
  return (
    <div
      data-testid="landing-hero-object"
      className="relative mx-auto h-[24rem] w-full max-w-[60rem] sm:h-[30rem] lg:h-[34rem]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-[52%] h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/24 blur-[92px] sm:h-[25rem] sm:w-[25rem] dark:bg-cyan-300/14" />
      <div className="absolute left-1/2 top-[50%] h-[15rem] w-[78%] max-w-[42rem] -translate-x-1/2 rounded-[100%] bg-slate-950/8 blur-[44px] dark:bg-black/70" />

      <div className="absolute left-1/2 top-[7%] h-[18rem] w-[min(86vw,38rem)] -translate-x-1/2 rotate-[-7deg] rounded-[2.1rem] border border-black/[0.055] bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(236,254,255,0.34)_42%,rgba(20,184,166,0.10))] shadow-[0_34px_90px_-56px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(20,184,166,0.08)_46%,rgba(0,0,0,0.28))] dark:shadow-[0_36px_110px_-54px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-[23rem] lg:h-[26rem]" />
      <div className="absolute left-1/2 top-[10%] h-[18rem] w-[min(86vw,38rem)] -translate-x-1/2 rotate-[5deg] rounded-[2.1rem] border border-black/[0.045] bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(248,250,252,0.52)_52%,rgba(14,165,168,0.12))] shadow-[0_34px_100px_-54px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035)_52%,rgba(45,212,191,0.10))] dark:shadow-[0_36px_110px_-54px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-[23rem] lg:h-[26rem]" />

      <div className="absolute left-1/2 top-[6%] flex h-[19rem] w-[min(88vw,34rem)] -translate-x-1/2 flex-col justify-between overflow-hidden rounded-[2.2rem] border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.76))] p-6 text-left shadow-[0_42px_120px_-56px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-3xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] dark:shadow-[0_46px_130px_-58px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-[24rem] sm:p-8 lg:h-[27rem]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(255,255,255,0.78),transparent_34%),radial-gradient(circle_at_78%_76%,rgba(20,184,166,0.18),transparent_32%)] dark:bg-[radial-gradient(circle_at_22%_16%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_78%_76%,rgba(45,212,191,0.15),transparent_32%)]" />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700/62 dark:text-cyan-100/62">
              Risposta Numa
            </p>
            <p className="mt-3 max-w-[9ch] text-[clamp(2.7rem,7vw,5.7rem)] font-black leading-[0.9] text-slate-950 dark:text-white">
              Ci sta.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/16 bg-teal-500/10 text-teal-700 shadow-[0_18px_40px_-26px_rgba(20,184,166,0.55)] dark:border-cyan-200/12 dark:bg-cyan-200/10 dark:text-cyan-100 sm:h-14 sm:w-14">
            <Check className="h-6 w-6" strokeWidth={2.4} />
          </div>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-3">
          {[
            ["In arrivo", "+ € 2.300"],
            ["Già previsti", "- € 1.055"],
            ["Puoi usarli", "€ 1.245"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className="rounded-[1.2rem] border border-black/[0.055] bg-white/62 px-4 py-3 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-foreground/44 dark:text-white/42">
                {label}
              </p>
              <p className={`mt-1 text-[13px] font-black sm:text-[14px] ${index === 2 ? "text-teal-700 dark:text-cyan-100" : "text-foreground dark:text-white/78"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
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
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_50%_53%,rgba(14,165,168,0.18),transparent_32%),linear-gradient(180deg,rgba(241,249,252,0.34),rgba(238,247,249,0.74)_72%,#f7fbfd_100%)] dark:bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_50%_53%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,rgba(2,5,9,0.54),rgba(2,5,9,0.78)_72%,#020509_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[34rem] bg-[radial-gradient(ellipse_at_center,rgba(14,165,168,0.16),transparent_54%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.16),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-b from-transparent via-background/82 to-background sm:h-52 dark:via-background/70 dark:to-background" />

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
            className="max-w-[13ch] text-[clamp(3rem,7.4vw,6.2rem)] font-black leading-[0.93] text-slate-950 [text-wrap:balance] drop-shadow-[0_18px_58px_rgba(15,23,42,0.10)] dark:text-white dark:drop-shadow-[0_18px_58px_rgba(255,255,255,0.10)]"
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
          <HeroNumaObject />

          <HeroTrustStrip />
        </div>

      </div>
    </section>
  )
}
