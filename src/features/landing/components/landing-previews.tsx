"use client"

import { useRef } from "react"
import { m } from "framer-motion"
import { useHardwareParallax } from "@/hooks/use-hardware-parallax"

function ConsoleChassis() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useHardwareParallax({ tiltMax: 6 })

  const _handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    handleMouseMove(e, cardRef.current.getBoundingClientRect())
  }

  const _handleMouseLeave = () => {
    handleMouseLeave()
  }

  return (
    <m.div
      ref={cardRef}
      onMouseMove={_handleMouseMove}
      onMouseLeave={_handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(248,250,252,0.58))] shadow-[0_28px_92px_-44px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-3xl will-change-transform transition-[border-color,box-shadow] duration-500 hover:border-teal-500/22 hover:shadow-[0_36px_110px_-52px_rgba(15,23,42,0.30),0_0_0_1px_rgba(20,184,166,0.05),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.035))] dark:shadow-[0_42px_118px_-42px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10)] dark:hover:border-cyan-200/18 dark:hover:shadow-[0_46px_128px_-52px_rgba(0,0,0,0.95),0_0_44px_-32px_rgba(45,212,191,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] bg-clip-padding"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),transparent_42%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] border border-white/54 [mask-image:linear-gradient(180deg,black,transparent_44%)] dark:border-white/10" />

      <div className="relative z-10 p-6 sm:p-8 sm:py-8 flex flex-col [transform-style:preserve-3d] min-h-[16rem]">
        {/* Fake Window Controls */}
        <div className="mb-6 flex items-center gap-1.5" style={{ transform: "translateZ(10px)" }}>
          <div className="h-3 w-3 rounded-full bg-red-400 dark:bg-red-500/80 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-amber-400 dark:bg-amber-500/80 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80 shadow-sm" />
        </div>

        {/* Mock Dashboard Area */}
        <div className="flex-1 space-y-6 sm:space-y-8" style={{ transform: "translateZ(30px)" }}>
          {/* Top Section - Key Metric */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground/80 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Puoi spenderli?
            </h4>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-5xl sm:text-[4rem] font-black leading-none text-foreground">€ 1.250</span>
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground/60 leading-none">,00</span>
            </div>
            <p className="max-w-[34rem] text-[13px] font-medium leading-relaxed text-muted-foreground/72 sm:text-[15px]">
              Una risposta semplice, costruita sui movimenti che hai caricato.
            </p>

            {/* Fake Progress Bar */}
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10 sm:max-w-xs">
              <div className="h-full w-2/3 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.5)] dark:bg-teal-400 dark:shadow-[0_0_12px_rgba(45,212,191,0.6)]" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["In arrivo", "+ € 2.300"],
              ["Già previsti", "- € 1.008"],
              ["Risposta", "ci sta"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="rounded-[1.15rem] border border-black/[0.065] bg-white/64 px-4 py-3 text-left shadow-[0_14px_30px_-26px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.70)] transition-[border-color,box-shadow,background-color] duration-300 group-hover:border-teal-500/16 group-hover:shadow-[0_18px_38px_-30px_rgba(15,23,42,0.28),0_0_0_1px_rgba(20,184,166,0.035),inset_0_1px_0_rgba(255,255,255,0.76)] dark:border-white/9 dark:bg-white/[0.045] dark:group-hover:border-cyan-200/14 dark:group-hover:shadow-[0_18px_42px_-32px_rgba(0,0,0,0.88),0_0_28px_-24px_rgba(45,212,191,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/72">
                  {label}
                </p>
                <p className={`mt-1 text-sm font-black ${index === 2 ? "text-teal-600 dark:text-teal-300" : "text-foreground"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Section - Semantic rows */}
          <m.div
            className="relative space-y-3 rounded-2xl border border-black/[0.055] bg-white/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition-[border-color,box-shadow] duration-300 group-hover:border-teal-500/12 dark:border-white/[0.065] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:group-hover:border-cyan-200/12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-5%" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
            }}
          >
            {[
              ["Stipendio del mese", "gia dentro", "+ € 2.300"],
              ["Spese che tornano", "non spariscono", "- € 968"],
              ["Nuovo impegno", "prima di dire si", "ci sta"],
            ].map(([title, note, value], i) => (
              <m.div
                key={title}
                variants={{
                  hidden: { opacity: 0, filter: "blur(8px)", x: -12 },
                  visible: { opacity: 1, filter: "blur(0px)", x: 0, transition: { type: "spring", stiffness: 450, damping: 25 } }
                }}
                className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10" />
                  <div className="space-y-1.5">
                    <p className="text-[13px] font-semibold text-foreground">{title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/72">{note}</p>
                  </div>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${i === 2
                    ? "border border-teal-400/20 bg-teal-500/10 text-teal-700 dark:border-teal-300/12 dark:bg-teal-300/[0.08] dark:text-teal-100"
                    : "border border-black/6 bg-white/50 text-foreground/68 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/72"
                  }`}>
                  {value}
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </m.div>
  )
}

export function LandingHeroConsole() {
  return (
    <div className="[perspective:1200px]">
      <ConsoleChassis />
    </div>
  )
}
