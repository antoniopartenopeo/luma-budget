import { cn } from "@/lib/utils"

interface AmbientBackdropProps {
  className?: string
}

export function AmbientBackdrop({ className }: AmbientBackdropProps) {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background", className)}>
      <div className="ambient-noise absolute inset-0 z-50 opacity-[0.026] mix-blend-overlay dark:opacity-[0.04]" />
      <div className="ambient-grid absolute inset-0 opacity-18 dark:opacity-28" />
      <div className="absolute left-[-10%] top-[-18%] h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[110px] dark:bg-primary/12" />
      <div className="absolute right-[-8%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-cyan-300/12 blur-[118px] dark:bg-cyan-200/8" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/62 to-transparent dark:from-white/[0.035]" />
    </div>
  )
}
