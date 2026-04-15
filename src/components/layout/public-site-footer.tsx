import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BrandLogo } from "@/components/ui/brand-logo"
import { LANDING_FOOTER, LANDING_HERO_EDITORIAL } from "@/features/landing/content"

export function PublicSiteFooter() {
  return (
    <footer className="px-4 pb-10 pt-6">
      <div className="mx-auto max-w-6xl border-t border-black/6 pt-6 dark:border-white/8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[26rem] space-y-3">
            <BrandLogo variant="full" height={24} className="w-auto max-w-[132px] opacity-90" sizes="132px" />
            <p className="text-sm font-normal leading-relaxed text-muted-foreground">
              {LANDING_FOOTER.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:min-w-[26rem] lg:gap-12">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/46">
                {LANDING_FOOTER.productHeading}
              </p>
              <ul className="space-y-2">
                {LANDING_FOOTER.productItems.map((item) => (
                  <li key={`footer-${item}`} className="text-sm font-normal text-foreground/72">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/46">
                {LANDING_FOOTER.supportHeading}
              </p>
              <ul className="space-y-2">
                {LANDING_FOOTER.supportItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-normal text-foreground/62 transition-colors duration-200 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center border-t border-black/6 pt-8 dark:border-white/8">
          <Link
            href={LANDING_HERO_EDITORIAL.primaryCtaHref}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)] transition-[box-shadow,transform,background-color] duration-200 hover:scale-[1.02] hover:shadow-[0_24px_52px_-24px_rgba(14,165,168,0.7)]"
          >
            {LANDING_HERO_EDITORIAL.primaryCtaLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
