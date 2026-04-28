"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { m, useScroll, useTransform } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { LANDING_HERO_EDITORIAL } from "../content"
import { AppleFluidBackground } from "./motion-primitives"
import { LandingCoverFlow } from "./landing-cover-flow"
import { LANDING_PRIMARY_CTA_CLASS } from "./landing-tokens"

export function LandingHeroEditorial() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  const yOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-visible px-4 pt-[clamp(5.75rem,11svh,8rem)] sm:px-6 sm:pt-[clamp(6.25rem,12svh,9rem)] lg:px-8 lg:pt-[clamp(6.5rem,12svh,9rem)]"
      aria-labelledby="landing-hero-title"
      data-testid="landing-hero-editorial"
    >
      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_46%,transparent_100%)]">
        <AppleFluidBackground className="scale-[1.14] opacity-[0.88] saturate-[0.82] dark:opacity-[0.82] dark:saturate-[0.52] sm:scale-[1.08]" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.54),transparent_44%),radial-gradient(circle_at_72%_22%,rgba(34,211,238,0.11),transparent_34%),radial-gradient(circle_at_24%_42%,rgba(15,23,42,0.08),transparent_38%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_72%_20%,rgba(255,255,255,0.075),transparent_34%),radial-gradient(circle_at_30%_46%,rgba(255,255,255,0.035),transparent_38%)]" />

      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[4%] z-[2] h-[28rem] w-[44rem] -translate-x-1/2 rounded-[100%] bg-white/44 blur-[120px] dark:bg-white/[0.055] sm:h-[38rem] sm:w-[72rem]"
        style={{ opacity: yOpacity }}
      />

      <div className="relative z-30 mx-auto flex w-full max-w-[68rem] flex-col items-center text-center">
        
        <m.div className="flex flex-col items-center text-center" style={{ opacity: yOpacity, y: yTranslate }}>
          <h1 id="landing-hero-title" className="sr-only">
            {LANDING_HERO_EDITORIAL.srTitle}
          </h1>

          <div 
            className="pointer-events-none mb-4 motion-safe:transition-[opacity,transform] motion-safe:duration-[1200ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:starting:opacity-0 motion-safe:starting:translate-y-5 motion-safe:starting:scale-95 sm:mb-6"
          >
            <BrandLogo
              variant="smart"
              width={160}
              priority
              sizes="(min-width: 1024px) 128px, (min-width: 640px) 104px, 80px"
              className="h-auto w-[4.75rem] opacity-92 drop-shadow-[0_18px_34px_rgba(15,23,42,0.10)] dark:opacity-96 dark:drop-shadow-[0_20px_42px_rgba(0,0,0,0.32)] sm:w-[6rem] lg:w-[7rem]"
            />
          </div>

          <p 
            className="max-w-[13ch] text-[clamp(3rem,7.4vw,6.2rem)] font-black leading-[0.93] tracking-tight text-foreground/95 [text-wrap:balance] motion-safe:transition-[opacity,transform] motion-safe:duration-[1200ms] motion-safe:delay-100 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:starting:opacity-0 motion-safe:starting:translate-y-8"
          >
            {LANDING_HERO_EDITORIAL.headline}
          </p>

          <p 
            className="mt-5 max-w-[24rem] text-[1.05rem] font-medium leading-[1.5] text-foreground/64 motion-safe:transition-[opacity,transform] motion-safe:duration-[1200ms] motion-safe:delay-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:starting:opacity-0 motion-safe:starting:translate-y-5 sm:max-w-[38rem] sm:text-[1.2rem] lg:max-w-[42rem] lg:text-[1.26rem]"
          >
            {LANDING_HERO_EDITORIAL.supportingCopy}
          </p>

          <div
            className="mt-7 flex flex-wrap items-center justify-center gap-3 motion-safe:transition-[opacity,transform] motion-safe:duration-1000 motion-safe:delay-[250ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:starting:opacity-0 motion-safe:starting:translate-y-4"
          >
            <Button asChild size="lg" className={`rounded-full ${LANDING_PRIMARY_CTA_CLASS}`}>
              <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
                {LANDING_HERO_EDITORIAL.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </m.div>

        <div className="w-full">
          <LandingCoverFlow />
        </div>

        <div
          className="pointer-events-none mt-8 flex justify-center motion-safe:transition-opacity motion-safe:duration-[1600ms] motion-safe:ease-out motion-safe:delay-[700ms] motion-safe:starting:opacity-0 sm:mt-12 lg:mt-16"
        >
          <p className="max-w-[42rem] text-center text-[12px] font-medium leading-relaxed text-foreground/42 dark:text-white/42 sm:text-[13px]">
            {LANDING_HERO_EDITORIAL.trustItems.join(" · ")}
          </p>
        </div>

      </div>
    </section>
  )
}
