import Link from "next/link"
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Download,
  Goal,
  Home,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingClientWrapper } from "./components/landing-client-wrapper"
import { PublicSiteFooter } from "@/components/layout/public-site-footer"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_HERO_EDITORIAL,
  LANDING_CLOSING,
  LANDING_FLOW_STEPS,
  LANDING_HOW_IT_WORKS_SECTION,
  LANDING_NAV_ITEMS,
  LANDING_OUTCOMES_SECTION,
  LANDING_PROBLEM_SECTION
} from "./content"
import { LandingHeroEditorial } from "./components/landing-hero-editorial"
import { LandingSustainableQuotaMotion } from "./components/landing-sustainable-quota-motion"

const LANDING_DECISION_STATS = [
  ["3", "posti da controllare"],
  ["Ogni mese", "conti da rifare"],
] as const

const LANDING_DECISION_CARDS = [
  {
    icon: Goal,
    title: "Il saldo è solo il punto di partenza",
    description: "Ti mostra i soldi di oggi, ma non quello che succede dopo affitto, rate, abbonamenti e spese che tornano."
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "La decisione resta tutta in testa",
    description: "Prima di aggiungere una spesa finisci a fare conti a memoria, sperando di non dimenticare nulla."
  }
] as const

const LANDING_TESTIMONIALS = [
  {
    name: "Marco B.",
    initials: "MB",
    quote: "Prima controllavo banca, note e fogli. Ora ho un posto solo da cui partire.",
  },
  {
    name: "Giulia R.",
    initials: "GR",
    quote: "Numa mi aiuta a guardare il mese intero, non solo l'ultimo saldo sul conto.",
  },
  {
    name: "Luca S.",
    initials: "LS",
    quote: "Quando arriva una nuova rata, non devo rifare tutto da zero. La provo e capisco se ci sta.",
  },
] as const

const LANDING_TESTIMONIAL_LOOP = [...LANDING_TESTIMONIALS, ...LANDING_TESTIMONIALS] as const

const LANDING_CTA_ICONS = [
  { icon: Home, positionClassName: "left-0 top-0" },
  { icon: WalletCards, positionClassName: "left-[5.2rem] top-[1.2rem]" },
  { icon: ShieldCheck, positionClassName: "left-[10.4rem] top-0" },
  { icon: Sparkles, positionClassName: "left-[15.6rem] top-[1.2rem]" },
  { icon: Plane, positionClassName: "left-[3rem] top-[5.4rem]" },
  { icon: Download, positionClassName: "left-[8.2rem] top-[6.6rem]" },
  { icon: Goal, positionClassName: "left-[13.4rem] top-[5.4rem]" },
  { icon: ChartNoAxesColumnIncreasing, positionClassName: "left-[18.6rem] top-[6.6rem]" }
] as const

function LandingDecisionPreviewCard({
  icon: Icon,
  title,
  description
}: {
  icon: typeof Goal
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-950/10 bg-white/72 p-6 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_20px_70px_-48px_rgba(0,0,0,0.86),inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-[0_16px_34px_-24px_rgba(2,6,23,0.62)] dark:bg-white dark:text-slate-950">
        <Icon className="h-6 w-6" strokeWidth={1.9} />
      </div>
      <h3 className="mt-8 text-[1.35rem] font-black tracking-[-0.02em] text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-[24rem] text-[0.98rem] font-medium leading-relaxed text-slate-600 dark:text-white/60">
        {description}
      </p>
    </div>
  )
}

function LandingProblemNoisePanel() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] bg-slate-950 p-8 text-white shadow-[0_34px_90px_-54px_rgba(2,6,23,0.82)] dark:bg-black sm:p-10 lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(58,133,145,0.26),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0),rgba(58,133,145,0.08))]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl bg-[linear-gradient(135deg,#a1deeb,#3a8591)] px-8 py-2 text-[0.84rem] font-black text-white shadow-[0_14px_32px_-24px_rgba(58,133,145,0.9)]">
        Prima di Numa
      </div>

      <div className="relative grid items-center gap-8 pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pt-3">
        <div>
          <h3 className="max-w-[18ch] text-[clamp(2rem,3.2vw,3.25rem)] font-black leading-[1.05] tracking-[-0.03em]">
            I numeri ci sono. Manca la risposta.
          </h3>
          <p className="mt-5 max-w-[36rem] text-[1.04rem] font-medium leading-relaxed text-white/68">
            Movimenti, saldo e scadenze sono separati. Numa li mette insieme per farti capire se il mese regge davvero.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <p className="text-[0.78rem] font-black uppercase tracking-[0.16em] text-white/48">Banca</p>
            <p className="mt-5 text-2xl font-black text-white">Movimenti</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-white/54">Vedi cosa è successo, ma non sempre cosa succede dopo.</p>
          </div>

          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <p className="text-[0.78rem] font-black uppercase tracking-[0.16em] text-white/48">Foglio</p>
            <p className="mt-5 text-2xl font-black text-white">Calcoli</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-white/54">Formule che vanno aggiornate ogni volta.</p>
          </div>

          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <p className="text-[0.78rem] font-black uppercase tracking-[0.16em] text-white/48">Testa</p>
            <p className="mt-5 text-2xl font-black text-[#a1deeb]">Dubbio</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-white/54">La decisione resta sospesa fino all&apos;ultimo.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingFlowStepCard({
  icon: Icon,
  cue,
  stepLabel,
  title,
  description
}: {
  icon: typeof WalletCards
  cue: string
  stepLabel: string
  title: string
  description: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.35rem] border border-slate-950/10 bg-white/76 p-6 shadow-[0_18px_58px_-44px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#3a8591]/34 hover:shadow-[0_28px_76px_-48px_rgba(15,23,42,0.38),0_0_34px_-26px_rgba(58,133,145,0.65),inset_0_1px_0_rgba(255,255,255,0.88)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_72px_-50px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-[#a1deeb]/24">
      <div className="pointer-events-none absolute right-5 top-4 text-[4.5rem] font-black leading-none text-slate-950/[0.04] dark:text-white/[0.035]">
        {stepLabel}
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.05rem] bg-slate-950 text-white shadow-[0_18px_38px_-26px_rgba(2,6,23,0.62)] dark:bg-white dark:text-slate-950">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#0f5a6c] dark:text-[#a1deeb]">{cue}</p>
        </div>
        <h3 className="mt-9 text-[1.35rem] font-black tracking-[-0.02em] text-slate-950 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 max-w-[24rem] text-[0.98rem] font-medium leading-relaxed text-slate-600 dark:text-white/60">
          {description}
        </p>
      </div>
    </div>
  )
}

function LandingTestimonialCard({
  name,
  initials,
  quote
}: {
  name: string
  initials: string
  quote: string
}) {
  return (
    <article className="w-[min(24rem,78vw)] shrink-0 rounded-[1.35rem] border border-slate-950/10 bg-white/78 p-6 shadow-[0_20px_62px_-48px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:w-[26rem] lg:w-[28rem]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#101828,#020617)] text-sm font-black text-white shadow-[0_18px_38px_-26px_rgba(2,6,23,0.62)] dark:bg-white dark:text-slate-950">
          {initials}
        </div>
        <div>
          <p className="font-black text-slate-950 dark:text-white">{name}</p>
          <div className="mt-1 flex gap-0.5 text-[#3a8591]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" strokeWidth={1.8} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-[1rem] font-medium leading-relaxed text-slate-600 dark:text-white/62">
        “{quote}”
      </p>
    </article>
  )
}

function LandingFinalCta() {
  return (
    <section className="px-5 sm:px-8 lg:px-10" aria-labelledby="landing-closing-title">
      <div className="relative mx-auto max-w-[92rem] overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,#0f5a6c,#a1deeb)] px-7 py-10 text-white shadow-[0_34px_100px_-58px_rgba(15,90,108,0.72)] sm:px-12 sm:py-14 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.32),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_62%)]" />
        <div className="pointer-events-none absolute right-[-3rem] top-1/2 hidden h-[22rem] w-[35rem] -translate-y-1/2 sm:block">
          {LANDING_CTA_ICONS.map(({ icon: Icon, positionClassName }, index) => (
            <div
              key={index}
              className={cn(
                "absolute flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-md",
                positionClassName
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </div>
          ))}
        </div>

        <div className="relative max-w-[34rem]">
          <h3 id="landing-closing-title" className="text-[clamp(2.25rem,4vw,4.15rem)] font-black leading-[1.02] tracking-[-0.035em]">
            {LANDING_CLOSING.title}
          </h3>
          <p className="mt-4 max-w-[33rem] text-[1.05rem] font-semibold leading-relaxed text-white/82 sm:text-[1.2rem]">
            {LANDING_CLOSING.description}
          </p>
          <Button asChild size="lg" className="mt-7 rounded-xl bg-slate-950 px-6 text-base font-black text-white shadow-[0_20px_46px_-30px_rgba(2,6,23,0.74)] hover:bg-slate-900">
            <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
              {LANDING_CLOSING.primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  const [problemTitleStart, problemTitleEnd] = LANDING_PROBLEM_SECTION.title.split(", ")

  return (
    <LandingClientWrapper>
      <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
        <header className="absolute inset-x-0 top-0 z-50 px-5 pt-5 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-5 text-slate-950 dark:text-white">
            <Link
              href="/"
              aria-label="Torna alla landing"
              className="flex items-center transition-opacity hover:opacity-86"
            >
              <BrandLogo
                variant="full"
                preset="header"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-10 lg:flex">
              {LANDING_NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="text-[1.05rem] font-black text-slate-950 transition-colors hover:text-[#3a8591] dark:text-white dark:hover:text-[#a1deeb]">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button asChild size="lg" className="rounded-xl bg-slate-950 px-6 text-base font-black text-white shadow-[0_18px_42px_-28px_rgba(2,6,23,0.62)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
                <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
                  {LANDING_HERO_EDITORIAL.primaryCtaLabel}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main id="main-content" className="relative pb-32">
          <StaggerContainer className="space-y-36 sm:space-y-52">
            <LandingHeroEditorial />

            <section id="problema" className="relative scroll-mt-24 border-t border-slate-950/8 px-5 py-16 sm:px-8 lg:px-10 dark:border-white/10" aria-labelledby="landing-problem-title">
              <div className="mx-auto max-w-[92rem]">
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                  <div>
                    <h2 id="landing-problem-title" className="max-w-[13ch] text-[clamp(2.25rem,4.1vw,4.15rem)] font-black leading-[1.02] tracking-[-0.035em] text-slate-950 dark:text-white">
                      {problemTitleEnd ? (
                        <>
                          {problemTitleStart},{" "}<br />
                          {problemTitleEnd}
                        </>
                      ) : LANDING_PROBLEM_SECTION.title}
                    </h2>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      {LANDING_DECISION_STATS.map(([value, label], index) => (
                        <div key={label} className={cn("pr-6", index === 0 && "border-r border-slate-950/18 dark:border-white/14")}>
                          <p className="text-[2.1rem] font-black leading-none text-[#3a8591]">{value}</p>
                          <p className="mt-1 text-[0.98rem] font-medium leading-tight text-slate-600 dark:text-white/58">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {LANDING_DECISION_CARDS.map((card) => (
                      <LandingDecisionPreviewCard key={card.title} {...card} />
                    ))}
                  </div>
                </div>

                <div className="mt-9">
                  <LandingProblemNoisePanel />
                </div>
              </div>
            </section>

            <section id="come-inizi" className="relative -mt-28 scroll-mt-24 px-5 sm:-mt-44 sm:px-8 lg:-mt-48 lg:px-10" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-[92rem]">
              <div className="mb-8 max-w-[48rem]">
                <p className="text-[0.78rem] font-black uppercase tracking-[0.22em] text-[#0f5a6c] dark:text-[#a1deeb]">
                  {LANDING_HOW_IT_WORKS_SECTION.eyebrow}
                </p>
                <h2 id="landing-how-title" className="mt-4 text-[clamp(2.25rem,4.1vw,4.2rem)] font-black leading-[1.02] tracking-[-0.035em] text-slate-950 dark:text-white">
                  {LANDING_HOW_IT_WORKS_SECTION.title}
                </h2>
                <p className="mt-5 text-[1.08rem] font-medium leading-relaxed text-slate-600 sm:text-[1.2rem] dark:text-white/62">
                  {LANDING_HOW_IT_WORKS_SECTION.description}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {LANDING_FLOW_STEPS.map((step) => (
                  <LandingFlowStepCard key={step.stepLabel} {...step} />
                ))}
              </div>
            </div>
          </section>

          <LandingSustainableQuotaMotion />

          <section id="outcomes" className="relative -mt-16 scroll-mt-24 px-5 sm:px-8 lg:px-10" aria-labelledby="landing-outcomes-title">
            <div className="mx-auto max-w-[92rem]">
              <div className="mb-8">
                <div>
                  <p className="text-[0.78rem] font-black uppercase tracking-[0.22em] text-[#0f5a6c] dark:text-[#a1deeb]">
                    {LANDING_OUTCOMES_SECTION.eyebrow}
                  </p>
                  <h2 id="landing-outcomes-title" className="mt-4 max-w-[18ch] text-[clamp(2rem,4vw,3.65rem)] font-black leading-[1.02] tracking-[-0.035em] text-slate-950 dark:text-white">
                    {LANDING_OUTCOMES_SECTION.title}
                  </h2>
                </div>
              </div>

              <div className="relative overflow-hidden" aria-label="Recensioni degli utenti">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />
                <div className="landing-testimonial-marquee flex w-max gap-5 py-1 hover:[animation-play-state:paused]" aria-hidden="true">
                  {LANDING_TESTIMONIAL_LOOP.map((testimonial, index) => (
                    <LandingTestimonialCard key={`${testimonial.name}-${index}`} {...testimonial} />
                  ))}
                </div>
              </div>

              <div className="sr-only">
                {LANDING_TESTIMONIALS.map((testimonial) => (
                  <p key={testimonial.name}>{testimonial.name}: {testimonial.quote}</p>
                ))}
              </div>
            </div>
          </section>

          <LandingFinalCta />

          </StaggerContainer>
        </main>

        <PublicSiteFooter />
      </div>
    </LandingClientWrapper>
  )
}
