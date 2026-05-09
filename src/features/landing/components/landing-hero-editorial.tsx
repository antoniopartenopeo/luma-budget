"use client"

import type { ReactNode } from "react"
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  Home,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  WalletCards
} from "lucide-react"
import { LANDING_HERO_EDITORIAL } from "../content"
import { cn } from "@/lib/utils"

const HERO_TRUST_ICONS = [ShieldCheck, LockKeyhole, SlidersHorizontal] as const

function HeroTrustStrip() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium leading-relaxed text-slate-600 sm:mt-6 dark:text-white/62">
      <p className="sr-only">{LANDING_HERO_EDITORIAL.trustItems.join(" · ")}</p>
      {LANDING_HERO_EDITORIAL.trustItems.map((item, index) => {
        const Icon = HERO_TRUST_ICONS[index] ?? ShieldCheck

        return (
          <span key={item} className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-500 dark:text-white/50" strokeWidth={1.8} />
            {item}
          </span>
        )
      })}
    </div>
  )
}

function StoreIcon({ name }: { name: "apple" | "google" }) {
  if (name === "apple") {
    return (
      <svg viewBox="0 0 384 512" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.2-39.5.6-76 23-96.3 58.3-41.1 71.4-10.5 177.4 29.5 235.4 19.6 28.3 42.9 60.1 73.5 59 29.5-1.2 40.6-19.1 76.3-19.1 35.6 0 45.7 19.1 76.9 18.5 31.8-.6 51.9-28.9 71.3-57.3 22.5-32.9 31.8-64.8 32.3-66.4-.7-.3-61.3-23.5-61.9-93.5ZM260.8 100.6c16.2-19.6 27.1-46.9 24.1-74-23.3.9-51.5 15.5-68.3 35.1-15.1 17.5-28.3 45.3-24.8 71.9 26 2 52.6-13.2 69-33Z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 512 512" className="h-5 w-5" aria-hidden="true">
      <path fill="#00A173" d="M76.8 13.6C67.7 18.5 62 28.1 62 40.4v431.2c0 12.3 5.7 21.9 14.8 26.8L306.9 256 76.8 13.6Z" />
      <path fill="#4285F4" d="M306.9 256 76.8 13.6c9.7-5.2 22.4-4.5 35.4 3.1l285.5 164.8L306.9 256Z" />
      <path fill="#FBBC04" d="m397.7 330.5-90.8-74.5 90.8-74.5 36.1 20.8c35.6 20.6 35.6 86.8 0 107.4l-36.1 20.8Z" />
      <path fill="#EA4335" d="M306.9 256 76.8 498.4c9.7 5.2 22.4 4.5 35.4-3.1l285.5-164.8L306.9 256Z" />
    </svg>
  )
}

function StoreButton({ eyebrow, label, icon }: { eyebrow: string; label: string; icon: "apple" | "google" }) {
  return (
    <div className="group/store flex min-h-14 items-center gap-3 rounded-[0.95rem] bg-slate-950 px-4 py-3 text-white shadow-[0_18px_38px_-26px_rgba(2,6,23,0.62)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-28px_rgba(2,6,23,0.72)] dark:bg-white dark:text-slate-950">
      <span className="flex h-9 w-9 items-center justify-center rounded-[0.72rem] bg-white/10 text-white ring-1 ring-white/12 transition-colors duration-300 group-hover/store:bg-white/16 dark:bg-slate-950/8 dark:text-slate-950 dark:ring-slate-950/10">
        <StoreIcon name={icon} />
      </span>
      <span className="leading-none">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.04em] opacity-82">{eyebrow}</span>
        <span className="mt-1 block text-[17px] font-black tracking-tight">{label}</span>
      </span>
    </div>
  )
}

function PhoneShell({
  children,
  className,
  screenClassName,
  scale = "main"
}: {
  children: ReactNode
  className?: string
  screenClassName?: string
  scale?: "main" | "side"
}) {
  return (
    <div
      className={cn(
        "relative rounded-[2.7rem] bg-slate-950 p-[0.55rem] shadow-[0_34px_70px_-32px_rgba(2,6,23,0.78),0_10px_24px_-18px_rgba(2,6,23,0.55)] dark:bg-black",
        scale === "main" ? "h-[33rem] w-[16.5rem] sm:h-[38rem] sm:w-[19rem]" : "h-[27rem] w-[13.5rem] sm:h-[31rem] sm:w-[15.5rem]",
        className
      )}
    >
      <div className="absolute left-1/2 top-[0.98rem] z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black sm:h-7 sm:w-28" />
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-[2.15rem] bg-white text-slate-950",
          screenClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

function ForecastCard() {
  return (
    <div className="rounded-[1.25rem] bg-white p-4 shadow-[0_20px_44px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-black">A fine mese</p>
          <p className="mt-2 text-2xl font-black tracking-tight">€3.120</p>
        </div>
        <p className="text-[12px] font-black text-[#3a8591]">+12.4%</p>
      </div>
      <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,rgba(58,133,145,0.22),rgba(255,255,255,0.96))] p-3">
        <svg viewBox="0 0 240 92" className="h-full w-full" role="img" aria-label="Curva del mese">
          <path d="M4 78 C28 22 48 42 66 18 C88 -8 108 48 132 20 C154 -6 176 28 236 4" fill="none" stroke="#3a8591" strokeWidth="5" strokeLinecap="round" />
          <circle cx="236" cy="4" r="5" fill="#3a8591" />
          <path d="M4 78 C28 22 48 42 66 18 C88 -8 108 48 132 20 C154 -6 176 28 236 4 L236 92 L4 92 Z" fill="url(#heroForecastFill)" opacity="0.34" />
          <defs>
            <linearGradient id="heroForecastFill" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#3a8591" />
              <stop offset="1" stopColor="#3a8591" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function MainPhone() {
  return (
    <PhoneShell className="-rotate-[7deg]" scale="main">
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f5fbfc_100%)] px-5 pb-5 pt-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-slate-500">Ciao, Alex</p>
            <p className="mt-3 text-[12px] text-slate-500">Saldo di oggi</p>
            <p className="mt-1 text-[2rem] font-black tracking-tight">€2.450,75</p>
            <p className="mt-1 text-[12px] font-black text-[#3a8591]">+2.3% sul mese scorso</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-4 w-4" fill="currentColor" />
          </div>
        </div>

        <div className="mt-5">
          <ForecastCard />
        </div>

        <div className="mt-4 rounded-[1.2rem] bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between text-[12px]">
            <p className="font-black">Spese del mese</p>
            <p className="text-slate-500">€1.760 / €2.450</p>
          </div>
          <p className="mt-1 text-xl font-black">72%</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#0f5a6c,#3a8591)]" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[1.2rem] bg-white p-3 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <WalletCards className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-black">Spesa</p>
            <p className="text-[11px] text-slate-500">34%</p>
          </div>
          <p className="text-[13px] font-black">€420</p>
        </div>
      </div>
    </PhoneShell>
  )
}

function Gauge() {
  return (
    <div className="relative mx-auto mt-4 h-32 w-40">
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-t-[6rem] border-[12px] border-b-0 border-slate-100" />
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-t-[6rem] border-[12px] border-b-0 border-[#3a8591] [clip-path:polygon(0_0,82%_0,82%_100%,0_100%)]" />
      <div className="absolute left-1/2 top-[4.8rem] -translate-x-1/2 rounded-full bg-[#3a8591]/16 px-3 py-1 text-[11px] font-black text-[#0f5a6c]">
        Regge
      </div>
    </div>
  )
}

function SidePhone() {
  return (
    <PhoneShell className="rotate-[3deg]" scale="side">
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f5fbfc_100%)] px-4 pb-4 pt-12">
        <p className="text-[14px] font-black">Puoi aggiungere</p>
        <div className="mt-4 rounded-[1.15rem] bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.46)]">
          <p className="text-[12px] italic text-slate-500">Senza stringere il mese</p>
          <p className="mt-2 text-[1.65rem] font-black tracking-tight">€380 / mese</p>
          <p className="mt-1 text-[12px] text-slate-500">per una nuova spesa fissa</p>
          <Gauge />
          <p className="mt-1 text-center text-[12px] italic text-slate-500">Mese ancora sereno</p>
        </div>

        <div className="mt-4 rounded-[1.15rem] bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.46)]">
          <p className="text-[13px] font-black">Prova una spesa</p>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-[13px] font-black">Aggiungi €200 / mese</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Dopo</p>
                <p className="text-[18px] font-black">€2.920</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Mese</p>
                <p className="inline-flex items-center gap-1 text-[13px] font-black">
                  <span className="h-2 w-2 rounded-full bg-[#3a8591]" />
                  Regge
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400">
          {[Home, ChartNoAxesColumnIncreasing, WalletCards, UserRound].map((Icon, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <Icon className="h-4 w-4" />
              <span>{["Casa", "Budget", "Insight", "Profilo"][index]}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  )
}

function HeroPhoneShowcase() {
  return (
    <div
      data-testid="landing-hero-object"
      className="relative mx-auto h-[34.5rem] w-full max-w-[48rem] lg:h-[40rem]"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[8%] top-[10%] h-[30rem] bg-[radial-gradient(ellipse_at_52%_46%,rgba(161,222,235,0.30),rgba(58,133,145,0.12)_42%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_52%_46%,rgba(161,222,235,0.18),rgba(58,133,145,0.08)_42%,transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-[2rem] left-[18%] right-[7%] h-24 bg-[radial-gradient(ellipse_at_center,rgba(15,90,108,0.16),transparent_68%)] blur-xl dark:bg-[radial-gradient(ellipse_at_center,rgba(161,222,235,0.12),transparent_70%)]" />
      <div className="absolute left-[20%] top-0 z-20">
        <MainPhone />
      </div>
      <div className="absolute right-[5%] top-[9rem] z-10 sm:right-[3%] lg:right-[3%]">
        <SidePhone />
      </div>
    </div>
  )
}

export function LandingHeroEditorial() {
  const [firstLine, highlightLine] = LANDING_HERO_EDITORIAL.headline.split(" con ")
  const normalizedHighlight = highlightLine?.replace(/\.$/, "")
  const highlightSuffix = highlightLine?.endsWith(".") ? "." : ""

  return (
    <section
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-[linear-gradient(180deg,#f8fbfc_0%,#ffffff_54%,#eef8fa_100%)] px-5 pb-12 pt-[7.25rem] text-slate-950 sm:px-8 sm:pt-[7.75rem] lg:px-10 lg:pt-[6rem] dark:bg-[linear-gradient(180deg,#030b10_0%,#061219_58%,#030b10_100%)] dark:text-white"
      aria-labelledby="landing-hero-title"
      data-testid="landing-hero-editorial"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,rgba(58,133,145,0.18),transparent_34%),radial-gradient(circle_at_8%_8%,rgba(255,255,255,0.92),transparent_28%)] dark:bg-[radial-gradient(circle_at_70%_42%,rgba(58,133,145,0.13),transparent_34%),radial-gradient(circle_at_8%_8%,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background" />

      <div className="relative z-10 mx-auto grid w-full max-w-[92rem] items-center gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:gap-2">
        <div className="max-w-[40rem] text-left">
          <h1 id="landing-hero-title" className="sr-only">
            {LANDING_HERO_EDITORIAL.srTitle}
          </h1>

          <p className="text-[clamp(3rem,5.8vw,5.95rem)] font-black leading-[0.98] tracking-[-0.03em] text-slate-950 dark:text-white">
            {firstLine}
            {highlightLine ? (
              <>
                <br />
                <span>
                  con <span className="text-[#3a8591]">{normalizedHighlight}</span>{highlightSuffix}
                </span>
              </>
            ) : null}
          </p>

          <p className="mt-6 max-w-[36rem] text-[1.18rem] font-medium leading-[1.62] text-slate-600 sm:text-[1.34rem] dark:text-white/66">
            {LANDING_HERO_EDITORIAL.supportingCopy}
          </p>

          <div className="mt-9 max-w-[34rem] rounded-[1.35rem] border border-slate-950/10 bg-white/70 p-4 text-center shadow-[0_22px_70px_-48px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_80px_-54px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
            <p className="text-[1.1rem] font-black">{"Scarica l'app"}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StoreButton eyebrow="Scarica su" label="App Store" icon="apple" />
              <StoreButton eyebrow="Disponibile su" label="Google Play" icon="google" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-[0.92rem] font-medium text-slate-500 dark:text-white/52">
              <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
              Sicura. Privata. Sempre.
            </div>
          </div>

          <HeroTrustStrip />
        </div>

        <HeroPhoneShowcase />
      </div>
    </section>
  )
}
