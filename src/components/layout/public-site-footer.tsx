import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BrandLogo } from "@/components/ui/brand-logo"
import { LANDING_FOOTER, LANDING_HERO_EDITORIAL } from "@/features/landing/content"

export function PublicSiteFooter() {
  return (
    <footer className="-mt-24 bg-slate-950 px-5 pb-10 pt-36 text-white sm:px-8 lg:px-10 dark:bg-black">
      <div className="mx-auto max-w-[92rem]">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[26rem] space-y-3">
            <div className="inline-flex items-center">
              <BrandLogo
                variant="full"
                preset="header"
                tone="light"
                className="drop-shadow-[0_14px_30px_rgba(161,222,235,0.18)]"
              />
            </div>
            <p className="text-sm font-medium leading-relaxed text-white/56">
              {LANDING_FOOTER.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:min-w-[26rem] lg:gap-12">
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                {LANDING_FOOTER.productHeading}
              </p>
              <ul className="space-y-2">
                {LANDING_FOOTER.productItems.map((item) => (
                  <li key={`footer-${item}`} className="text-sm font-medium text-white/68">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                {LANDING_FOOTER.supportHeading}
              </p>
              <ul className="space-y-2">
                {LANDING_FOOTER.supportItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-white/58 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="text-xs font-medium text-white/34">© 2026 Numa Budget. Tutti i diritti riservati.</p>
          <Link
            href={LANDING_HERO_EDITORIAL.primaryCtaHref}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.38)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {LANDING_HERO_EDITORIAL.primaryCtaLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
