"use client"

import { m, useReducedMotion } from "framer-motion"
import type { Transition } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { LANDING_COMPARISON_QA_SECTION } from "../content"

const revealViewport = { once: true, amount: 0.42 } as const

type BezierEase = [number, number, number, number]

const quotaEase: Record<"enter" | "draw" | "hold", BezierEase> = {
  enter: [0.16, 1, 0.3, 1],
  draw: [0.22, 1, 0.36, 1],
  hold: [0.45, 0, 0.55, 1]
}

const quotaTimeline = {
  brand: 0.24,
  shardPrimary: 0,
  shardSecondary: 0.08,
  frame: 0.36,
  guideStart: 0.46,
  titleBlur: 1.36,
  titlePrefix: 1.28,
  titleAmount: 1.42,
  titleSuffix: 1.62,
  description: 1.92,
  mockups: 2.12,
  summary: 2.5,
  dots: 3.05
} as const

const hidden = {
  opacity: 0,
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  filter: "blur(0px)"
}

const shardTransition = {
  duration: 0.95,
  ease: quotaEase.enter
} as const

function transitionFor(
  reduceMotion: boolean,
  duration: number,
  delay = 0,
  ease: BezierEase = quotaEase.enter
): Transition {
  return {
    duration: reduceMotion ? 0 : duration,
    delay: reduceMotion ? 0 : delay,
    ease
  }
}

function parseQuotaTitle(title: string) {
  const titleParts = title.match(/^(\D*?)([\d.,]+)(.*)$/)

  return {
    prefix: titleParts?.[1]?.trim() ?? "",
    amount: titleParts?.[2] ?? title,
    suffix: titleParts?.[3]?.trim() ?? ""
  }
}

function DotField({
  className,
  count,
  reduceMotion
}: {
  className: string
  count: number
  reduceMotion: boolean
}) {
  return (
    <m.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={revealViewport}
      transition={transitionFor(reduceMotion, 0.5, quotaTimeline.frame)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <m.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-[#14c5cf]"
          initial={reduceMotion ? false : { opacity: 0.18, scale: 0.72 }}
          whileInView={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: [0.28, 1, 0.48], scale: [0.72, 1.1, 1] }}
          viewport={revealViewport}
          transition={transitionFor(reduceMotion, 0.8, quotaTimeline.dots + index * 0.025, quotaEase.hold)}
        />
      ))}
    </m.div>
  )
}

const quotaMockups = [
  {
    eyebrow: "01 / Lettura",
    title: "L'IA legge il mese",
    description: "Entrate, ricorrenti e ritmo reale vengono collegati senza chiederti una cifra.",
    variant: "signals"
  },
  {
    eyebrow: "02 / Nessun input",
    title: "Niente importo da provare",
    description: "Non parti da una rata desiderata: il sistema trova prima il limite sostenibile.",
    variant: "noInput"
  },
  {
    eyebrow: "03 / Prudenza",
    title: "Protegge il buffer",
    description: "La quota viene stressata su margine, variabilità e spese già programmate.",
    variant: "buffer"
  },
  {
    eyebrow: "04 / Risposta",
    title: "Nuova spesa massima",
    description: "Prestito, finanziamento o abbonamento: sai quanto puoi aggiungere al mese.",
    variant: "result"
  }
] as const

function QuotaInsightMockup({
  mockup,
  index,
  reduceMotion
}: {
  mockup: (typeof quotaMockups)[number]
  index: number
  reduceMotion: boolean
}) {
  return (
    <m.article
      className="relative min-h-[13.5rem] overflow-hidden rounded-[1.4rem] border border-[#0b6170]/12 bg-white/76 p-4 text-left shadow-[0_24px_70px_-54px_rgba(6,63,77,0.54),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl"
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={revealViewport}
      transition={transitionFor(reduceMotion, 0.5, quotaTimeline.mockups + index * 0.08, quotaEase.enter)}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#b7f7f9]/58 blur-2xl" />
      <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#0c8d9a]">{mockup.eyebrow}</p>
      <h3 className="mt-2 text-[1.05rem] font-black leading-tight text-[#063f4b]">{mockup.title}</h3>
      <p className="mt-2 min-h-[2.7rem] text-sm font-medium leading-snug text-[#345d68]">{mockup.description}</p>

      {mockup.variant === "signals" ? (
        <div className="mt-4 space-y-2">
          {[
            ["Entrate nette", "+€3.280"],
            ["Costi fissi", "-€1.740"],
            ["Ritmo variabile", "-€890"]
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-[#edfafa] px-3 py-2">
              <span className="text-xs font-bold text-[#52717a]">{label}</span>
              <span className="text-sm font-black text-[#063f4b]">{value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {mockup.variant === "noInput" ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#11a9b6]/34 bg-[#f5fdfe] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#6c8b94]">Campo manuale</span>
            <span className="rounded-full bg-[#063f4b] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white">Non serve</span>
          </div>
          <div className="mt-3 h-9 rounded-lg bg-white/92 px-3 py-2 text-sm font-black text-[#9badb3] line-through">Inserisci una rata da testare</div>
        </div>
      ) : null}

      {mockup.variant === "buffer" ? (
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <span className="text-xs font-bold text-[#52717a]">Buffer protetto</span>
            <span className="text-2xl font-black tracking-[-0.04em] text-[#063f4b]">18%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dff1f3]">
            <m.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#14c5cf,#063f4b)]"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 0.72 }}
              viewport={revealViewport}
              transition={transitionFor(reduceMotion, 0.72, quotaTimeline.mockups + 0.42, quotaEase.draw)}
              style={{ originX: 0 }}
            />
          </div>
          <p className="mt-3 text-xs font-bold text-[#52717a]">Scenario sostenibile anche con spese recenti piu alte.</p>
        </div>
      ) : null}

      {mockup.variant === "result" ? (
        <div className="mt-4 rounded-[1.15rem] bg-[#063f4b] p-4 text-white shadow-[0_18px_46px_-32px_rgba(6,63,77,0.82)]">
          <p className="text-xs font-bold text-white/64">Puoi aggiungere fino a</p>
          <p className="mt-1 text-[2.4rem] font-black leading-none tracking-[-0.07em]">€380</p>
          <p className="mt-1 text-sm font-black text-[#9de9ef]">al mese</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[0.64rem] font-black uppercase tracking-[0.08em] text-white/72">
            <span className="rounded-full bg-white/10 px-2 py-1">Prestito</span>
            <span className="rounded-full bg-white/10 px-2 py-1">Rata</span>
            <span className="rounded-full bg-white/10 px-2 py-1">Abbon.</span>
          </div>
        </div>
      ) : null}
    </m.article>
  )
}

function LandingSustainableQuotaMotion() {
  const reduceMotion = useReducedMotion() === true
  const initial = reduceMotion ? false : hidden
  const staticTransition = reduceMotion ? { duration: 0 } : undefined
  const quotaTitle = parseQuotaTitle(LANDING_COMPARISON_QA_SECTION.title)

  return (
    <section
      id="confronto"
      className="relative -mt-16 scroll-mt-24 px-5 sm:px-8 lg:px-10"
      aria-labelledby="landing-quota-section-title"
    >
      <m.div
        className="relative mx-auto max-w-[92rem] overflow-hidden rounded-[2.35rem] border border-slate-950/8 bg-[radial-gradient(circle_at_50%_30%,#ffffff_0%,#f8feff_38%,#effafb_100%)] px-6 py-8 text-[#073f4d] shadow-[0_34px_110px_-70px_rgba(7,63,77,0.46),inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-10 sm:py-10 lg:min-h-[57rem] lg:px-14 lg:py-12 dark:border-white/10"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={transitionFor(reduceMotion, 0.6)}
      >
        <m.div
          className="pointer-events-none absolute -left-24 bottom-0 h-[22rem] w-[37rem] bg-[linear-gradient(135deg,#006171_0%,#003744_46%,rgba(0,55,68,0)_72%)] [clip-path:polygon(0_100%,0_18%,88%_100%)] sm:h-[28rem] sm:w-[50rem]"
          initial={reduceMotion ? false : { opacity: 0, x: -70, y: 48 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : { ...shardTransition, delay: quotaTimeline.shardPrimary }}
        />
        <m.div
          className="pointer-events-none absolute -left-6 bottom-16 h-[14rem] w-[24rem] bg-[#a8eff2]/52 backdrop-blur-sm [clip-path:polygon(0_0,70%_100%,100%_100%,18%_0)] sm:bottom-24 sm:h-[18rem] sm:w-[35rem]"
          initial={reduceMotion ? false : { opacity: 0, x: -40, y: 38 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : { ...shardTransition, delay: quotaTimeline.shardSecondary }}
        />
        <m.div
          className="pointer-events-none absolute -right-28 -top-10 h-[21rem] w-[42rem] bg-[linear-gradient(135deg,rgba(183,249,249,0.7),rgba(12,168,178,0.42)_42%,rgba(0,85,101,0.95)_68%,rgba(0,85,101,0)_69%)] [clip-path:polygon(38%_0,100%_0,62%_56%,12%_73%)] sm:h-[28rem] sm:w-[56rem]"
          initial={reduceMotion ? false : { opacity: 0, x: 92, y: -72 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : { ...shardTransition, delay: quotaTimeline.shardSecondary + 0.02 }}
        />

        <m.div
          className="pointer-events-none absolute right-8 top-20 hidden h-44 w-44 rotate-45 border border-[#16bac4]/24 lg:block"
          initial={initial}
          whileInView={{ opacity: 1 }}
          viewport={revealViewport}
          transition={transitionFor(reduceMotion, 0.5, quotaTimeline.frame)}
        />
        <m.div
          className="pointer-events-none absolute bottom-24 right-36 hidden h-px w-96 origin-right -rotate-45 bg-[#16bac4]/28 lg:block"
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={revealViewport}
          transition={transitionFor(reduceMotion, 0.65, quotaTimeline.guideStart, quotaEase.draw)}
        />
        <m.div
          className="pointer-events-none absolute left-10 top-1/2 hidden h-px w-80 origin-left rotate-45 bg-[#16bac4]/26 lg:block"
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={revealViewport}
          transition={transitionFor(reduceMotion, 0.65, quotaTimeline.guideStart + 0.04, quotaEase.draw)}
        />

        <DotField className="pointer-events-none absolute bottom-16 left-10 grid grid-cols-4 gap-3 opacity-95" count={16} reduceMotion={reduceMotion} />
        <DotField className="pointer-events-none absolute right-24 top-44 hidden grid-cols-5 gap-3 opacity-55 sm:grid" count={20} reduceMotion={reduceMotion} />

        <div className="relative z-10 flex min-h-[40rem] flex-col lg:min-h-[50rem]">
          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: -18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={revealViewport}
            transition={transitionFor(reduceMotion, 0.5, quotaTimeline.brand)}
          >
            <BrandLogo
              variant="full"
              preset="header"
            />
          </m.div>

          <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center sm:mt-8 lg:mt-0">
            <h2
              id="landing-quota-section-title"
              className="text-[clamp(1rem,2.1vw,1.75rem)] font-black uppercase tracking-[0.42em] text-[#17bdc7]"
            >
              {LANDING_COMPARISON_QA_SECTION.eyebrow}
            </h2>

            <m.div
              className="mt-5 flex flex-wrap items-end justify-center gap-x-3 gap-y-0 text-[#053f4b]"
              initial={reduceMotion ? false : { filter: "blur(5px)" }}
              whileInView={{ filter: "blur(0px)" }}
              viewport={revealViewport}
              transition={transitionFor(reduceMotion, 0.42, quotaTimeline.titleBlur, quotaEase.hold)}
            >
              <m.span
                className="pb-[0.08em] text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.08em]"
                initial={reduceMotion ? false : { opacity: 0, y: 42, scaleY: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={transitionFor(reduceMotion, 0.42, quotaTimeline.titlePrefix, quotaEase.enter)}
              >
                {quotaTitle.prefix}
              </m.span>
              <m.span
                id="landing-quota-title"
                className="text-[clamp(7rem,22vw,18.5rem)] font-black leading-[0.82] tracking-[-0.075em]"
                initial={reduceMotion ? false : { opacity: 0, y: 44, scaleY: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={transitionFor(reduceMotion, 0.58, quotaTimeline.titleAmount, quotaEase.enter)}
              >
                {quotaTitle.amount}
              </m.span>
              <m.span
                className="pb-[0.11em] text-[clamp(2.6rem,6vw,6.2rem)] font-black leading-none tracking-[-0.075em]"
                initial={reduceMotion ? false : { opacity: 0, y: 38, scaleY: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={transitionFor(reduceMotion, 0.45, quotaTimeline.titleSuffix, quotaEase.enter)}
              >
                {quotaTitle.suffix}
              </m.span>
            </m.div>

            <m.p
              className="mt-4 text-[clamp(1.45rem,2.8vw,2.45rem)] font-medium leading-tight tracking-[-0.02em] text-[#063f4b]"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealViewport}
              transition={transitionFor(reduceMotion, 0.46, quotaTimeline.description, quotaEase.enter)}
            >
              {LANDING_COMPARISON_QA_SECTION.description}
            </m.p>

            <div className="mt-8 grid w-full max-w-[70rem] gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quotaMockups.map((mockup, index) => (
                <QuotaInsightMockup
                  key={mockup.title}
                  mockup={mockup}
                  index={index}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>

          <m.p
            className="mx-auto mt-7 max-w-[42rem] text-center text-[clamp(1rem,1.45vw,1.32rem)] font-bold leading-tight text-[#58737c]"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={transitionFor(reduceMotion, 0.45, quotaTimeline.summary, quotaEase.enter)}
          >
            {LANDING_COMPARISON_QA_SECTION.summaryTitle}
          </m.p>
          <p className="sr-only">{LANDING_COMPARISON_QA_SECTION.summary}</p>
        </div>
      </m.div>
    </section>
  )
}

export { LandingSustainableQuotaMotion }
