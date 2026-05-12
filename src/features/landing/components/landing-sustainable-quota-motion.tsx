"use client"

import { m, useReducedMotion } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { LANDING_COMPARISON_QA_SECTION } from "../content"

const revealViewport = { once: true, amount: 0.42 } as const

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
  ease: [0.16, 1, 0.3, 1]
} as const

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
      transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.38 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <m.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-[#14c5cf]"
          initial={reduceMotion ? false : { opacity: 0.18, scale: 0.72 }}
          whileInView={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: [0.28, 1, 0.48], scale: [0.72, 1.1, 1] }}
          viewport={revealViewport}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 3.35 + index * 0.025, ease: "easeInOut" }}
        />
      ))}
    </m.div>
  )
}

function MobileSignalCard({
  label,
  delay,
  reduceMotion
}: {
  label: string
  delay: number
  reduceMotion: boolean
}) {
  return (
    <m.div
      className="rounded-2xl border border-[#17bdc7]/20 bg-white/72 px-4 py-3 shadow-[0_16px_42px_-34px_rgba(7,63,77,0.35)] backdrop-blur-xl"
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={revealViewport}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-sm font-black text-[#063f4b]">{label}</p>
    </m.div>
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
        className="relative mx-auto max-w-[92rem] overflow-hidden rounded-[2.35rem] border border-slate-950/8 bg-[radial-gradient(circle_at_50%_36%,#ffffff_0%,#f8feff_42%,#effafb_100%)] px-6 py-8 text-[#073f4d] shadow-[0_34px_110px_-70px_rgba(7,63,77,0.46),inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-10 sm:py-10 lg:aspect-[16/9] lg:px-14 lg:py-12 dark:border-white/10"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <m.div
          className="pointer-events-none absolute -left-24 bottom-0 h-[22rem] w-[37rem] bg-[linear-gradient(135deg,#006171_0%,#003744_46%,rgba(0,55,68,0)_72%)] [clip-path:polygon(0_100%,0_18%,88%_100%)] sm:h-[28rem] sm:w-[50rem]"
          initial={reduceMotion ? false : { opacity: 0, x: -70, y: 48 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : shardTransition}
        />
        <m.div
          className="pointer-events-none absolute -left-6 bottom-16 h-[14rem] w-[24rem] bg-[#a8eff2]/52 backdrop-blur-sm [clip-path:polygon(0_0,70%_100%,100%_100%,18%_0)] sm:bottom-24 sm:h-[18rem] sm:w-[35rem]"
          initial={reduceMotion ? false : { opacity: 0, x: -40, y: 38 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : { ...shardTransition, delay: 0.08 }}
        />
        <m.div
          className="pointer-events-none absolute -right-28 -top-10 h-[21rem] w-[42rem] bg-[linear-gradient(135deg,rgba(183,249,249,0.7),rgba(12,168,178,0.42)_42%,rgba(0,85,101,0.95)_68%,rgba(0,85,101,0)_69%)] [clip-path:polygon(38%_0,100%_0,62%_56%,12%_73%)] sm:h-[28rem] sm:w-[56rem]"
          initial={reduceMotion ? false : { opacity: 0, x: 92, y: -72 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={revealViewport}
          transition={reduceMotion ? staticTransition : { ...shardTransition, delay: 0.1 }}
        />

        <m.div
          className="pointer-events-none absolute right-8 top-20 hidden h-44 w-44 rotate-45 border border-[#16bac4]/24 lg:block"
          initial={initial}
          whileInView={{ opacity: 1 }}
          viewport={revealViewport}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.36 }}
        />
        <m.div
          className="pointer-events-none absolute bottom-24 right-36 hidden h-px w-96 origin-right -rotate-45 bg-[#16bac4]/28 lg:block"
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={revealViewport}
          transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.46, ease: "easeOut" }}
        />
        <m.div
          className="pointer-events-none absolute left-10 top-1/2 hidden h-px w-80 origin-left rotate-45 bg-[#16bac4]/26 lg:block"
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={revealViewport}
          transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.5, ease: "easeOut" }}
        />

        <DotField className="pointer-events-none absolute bottom-16 left-10 grid grid-cols-4 gap-3 opacity-95" count={16} reduceMotion={reduceMotion} />
        <DotField className="pointer-events-none absolute right-24 top-44 hidden grid-cols-5 gap-3 opacity-55 sm:grid" count={20} reduceMotion={reduceMotion} />

        <div className="relative z-10 flex min-h-[40rem] flex-col lg:h-full lg:min-h-0">
          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: -18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={revealViewport}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: reduceMotion ? 0 : 0.42, delay: 1.6 }}
            >
              <m.span
                className="pb-[0.08em] text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.08em]"
                initial={reduceMotion ? false : { opacity: 0, y: 42, scaleY: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={{ duration: reduceMotion ? 0 : 0.42, delay: 1.45, ease: "backOut" }}
              >
                {quotaTitle.prefix}
              </m.span>
              <m.span
                id="landing-quota-title"
                className="text-[clamp(7rem,22vw,18.5rem)] font-black leading-[0.82] tracking-[-0.075em]"
                initial={reduceMotion ? false : { opacity: 0, y: 44, scaleY: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={{ duration: reduceMotion ? 0 : 0.58, delay: 1.58, ease: "backOut" }}
              >
                {quotaTitle.amount}
              </m.span>
              <m.span
                className="pb-[0.11em] text-[clamp(2.6rem,6vw,6.2rem)] font-black leading-none tracking-[-0.075em]"
                initial={reduceMotion ? false : { opacity: 0, y: 38, scaleY: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                viewport={revealViewport}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: 1.78, ease: "backOut" }}
              >
                {quotaTitle.suffix}
              </m.span>
            </m.div>

            <m.p
              className="mt-4 text-[clamp(1.45rem,2.8vw,2.45rem)] font-medium leading-tight tracking-[-0.02em] text-[#063f4b]"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealViewport}
              transition={{ duration: reduceMotion ? 0 : 0.46, delay: 2.04, ease: "easeOut" }}
            >
              {LANDING_COMPARISON_QA_SECTION.description}
            </m.p>
          </div>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3 lg:hidden">
            {["Entrate", "Costi ricorrenti", "Saldo a fine mese"].map((label, index) => (
              <MobileSignalCard key={label} label={label} delay={0.78 + index * 0.12} reduceMotion={reduceMotion} />
            ))}
          </div>

          <m.p
            className="mt-7 max-w-[24rem] self-end text-right text-[clamp(1rem,1.7vw,1.45rem)] font-medium leading-tight text-white/72 lg:mt-0 lg:text-slate-400"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: 2.34, ease: "easeOut" }}
          >
            {LANDING_COMPARISON_QA_SECTION.summaryTitle}
          </m.p>
          <p className="sr-only">{LANDING_COMPARISON_QA_SECTION.summary}</p>
        </div>

        <div className="pointer-events-none absolute left-[10%] top-[32%] hidden lg:block">
          <m.p
            className="text-2xl font-black text-[#063f4b]"
            initial={initial}
            whileInView={{ opacity: 1 }}
            viewport={revealViewport}
            transition={{ duration: reduceMotion ? 0 : 0.32, delay: 0.9 }}
          >
            Entrate
          </m.p>
          <div className="mt-4 flex items-center">
            <m.span className="h-3 w-3 rounded-full bg-[#17bdc7]" initial={initial} whileInView={{ opacity: 1, scale: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.24, delay: 1.02 }} />
            <m.span className="h-px w-36 origin-left bg-[#17bdc7]" initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.44, delay: 1.08, ease: "easeInOut" }} />
            <m.span className="h-px w-28 origin-left rotate-45 bg-[#17bdc7]" initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.44, delay: 1.28, ease: "easeInOut" }} />
            <m.span className="absolute left-[17.2rem] top-[6.85rem] h-3 w-3 rounded-full bg-[#17bdc7] shadow-[0_0_24px_rgba(20,197,207,0.72)]" initial={reduceMotion ? false : { opacity: 0, scale: 0.2 }} whileInView={reduceMotion ? { opacity: 0 } : { opacity: [0, 1, 0], scale: [0.2, 1, 0.55], x: [0, 80, 126], y: [0, 44, 82] }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 1.18, ease: "easeInOut" }} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[12%] top-[46%] hidden text-right lg:block">
          <m.p className="text-2xl font-black text-[#063f4b]" initial={initial} whileInView={{ opacity: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.32, delay: 1.1 }}>
            Costi ricorrenti
          </m.p>
          <div className="mt-4 flex items-center justify-end">
            <m.span className="h-px w-28 origin-right -rotate-45 bg-[#17bdc7]" initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.44, delay: 1.48, ease: "easeInOut" }} />
            <m.span className="h-px w-44 origin-right bg-[#17bdc7]" initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.44, delay: 1.24, ease: "easeInOut" }} />
            <m.span className="h-3 w-3 rounded-full bg-[#17bdc7]" initial={initial} whileInView={{ opacity: 1, scale: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.24, delay: 1.2 }} />
            <m.span className="absolute right-[17rem] top-[6.7rem] h-3 w-3 rounded-full bg-[#17bdc7] shadow-[0_0_24px_rgba(20,197,207,0.72)]" initial={reduceMotion ? false : { opacity: 0, scale: 0.2 }} whileInView={reduceMotion ? { opacity: 0 } : { opacity: [0, 1, 0], scale: [0.2, 1, 0.55], x: [0, -82, -124], y: [0, 42, 78] }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 1.34, ease: "easeInOut" }} />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[15%] left-1/2 hidden -translate-x-1/2 text-center lg:block">
          <m.div className="mx-auto h-28 w-px origin-top bg-[#17bdc7]" initial={reduceMotion ? false : { opacity: 0, scaleY: 0 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.5, delay: 1.56, ease: "easeInOut" }} />
          <m.span className="mx-auto block h-3 w-3 rounded-full bg-[#17bdc7]" initial={initial} whileInView={{ opacity: 1, scale: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.24, delay: 1.92 }} />
          <m.p className="mt-3 text-xl font-black text-[#063f4b]" initial={initial} whileInView={{ opacity: 1 }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.32, delay: 1.48 }}>
            Saldo a fine mese
          </m.p>
          <m.span className="absolute left-1/2 top-0 h-3 w-3 rounded-full bg-[#17bdc7] shadow-[0_0_24px_rgba(20,197,207,0.72)]" initial={reduceMotion ? false : { opacity: 0, scale: 0.2, x: "-50%" }} whileInView={reduceMotion ? { opacity: 0 } : { opacity: [0, 1, 0], scale: [0.2, 1, 0.55], y: [112, 52, 0] }} viewport={revealViewport} transition={{ duration: reduceMotion ? 0 : 0.64, delay: reduceMotion ? 0 : 1.72, ease: "easeInOut" }} />
        </div>
      </m.div>
    </section>
  )
}

export { LandingSustainableQuotaMotion }
