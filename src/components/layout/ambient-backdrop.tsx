import { cn } from "@/lib/utils"

interface AmbientBackdropProps {
  className?: string
}

export function AmbientBackdrop({ className }: AmbientBackdropProps) {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background", className)}>
      <div 
        className="absolute inset-0 z-50 opacity-[0.03] dark:opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="ambient-grid absolute inset-0 opacity-30 dark:opacity-60" />
      <div className="ambient-orb ambient-orb-primary left-[4%] top-[-10%] h-[34rem] w-[34rem] opacity-80" />
      <div className="ambient-orb ambient-orb-secondary right-[2%] top-[8%] h-[28rem] w-[28rem] opacity-60 [animation-delay:-6s]" />
      <div className="ambient-orb ambient-orb-warm bottom-[-18%] right-[10%] h-[30rem] w-[30rem] opacity-45 [animation-delay:-12s]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04]" />
    </div>
  )
}
