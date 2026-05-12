import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "./ambient-backdrop"
import { PublicSiteFooter } from "./public-site-footer"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LANDING_HERO_EDITORIAL, LANDING_NAV_ITEMS } from "@/features/landing/content"

interface PublicPageFrameProps {
  children: React.ReactNode
  className?: string
}

export function PublicPageFrame({
  children,
  className
}: PublicPageFrameProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
      <AmbientBackdrop />

      <header className="px-5 pt-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-5 text-slate-950 dark:text-white">
          <Link href="/" aria-label="Torna alla landing" className="flex items-center transition-opacity hover:opacity-86">
            <BrandLogo variant="full" preset="header" priority />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {LANDING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={`/${item.href}`}
                className="text-[1.02rem] font-black text-slate-950 transition-colors hover:text-primary dark:text-white dark:hover:text-cyan-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="lg" className="rounded-xl bg-slate-950 px-6 text-base font-black text-white shadow-[0_18px_42px_-28px_rgba(2,6,23,0.62)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
              <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
                {LANDING_HERO_EDITORIAL.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className={cn("mx-auto max-w-[92rem]", className)}>{children}</div>
      </main>

      <PublicSiteFooter />
    </div>
  )
}
