import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "./ambient-backdrop"
import { PublicSiteFooter } from "./public-site-footer"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { cn } from "@/lib/utils"

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

      <header className="px-4 pt-4 sm:pt-6">
        <div className={cn("mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-full px-4 py-3", LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS)}>
          <Link href="/" aria-label="Torna alla landing">
            <BrandLogo variant="full" height={26} className="w-auto max-w-[132px] opacity-95" />
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="rounded-full px-4 shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)]">
              <Link href="/dashboard">
                Inizia senza account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="px-4 pb-24 pt-6 sm:pt-8">
        <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
      </main>

      <PublicSiteFooter />
    </div>
  )
}
