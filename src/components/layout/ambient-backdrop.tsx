import { cn } from "@/lib/utils"

interface AmbientBackdropProps {
  className?: string
}

export function AmbientBackdrop({ className }: AmbientBackdropProps) {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden pointer-events-none", className)}>
      <div className="ambient-grid absolute inset-0 opacity-30 dark:opacity-60" />
      <div className="ambient-orb ambient-orb-primary left-[4%] top-[-10%] h-[34rem] w-[34rem] opacity-80" />
      <div className="ambient-orb ambient-orb-secondary right-[2%] top-[8%] h-[28rem] w-[28rem] opacity-60 [animation-delay:-6s]" />
      <div className="ambient-orb ambient-orb-warm bottom-[-18%] right-[10%] h-[30rem] w-[30rem] opacity-45 [animation-delay:-12s]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04]" />
    </div>
  )
}
