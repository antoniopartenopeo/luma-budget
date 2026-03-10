import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  staggerIndex?: number;
}

function Skeleton({ className, staggerIndex, style, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse-soft rounded-md", className)}
      style={{
        animationDelay: staggerIndex !== undefined ? `${staggerIndex * 50}ms` : undefined,
        ...style
      }}
      {...props}
    />
  )
}

export { Skeleton }
