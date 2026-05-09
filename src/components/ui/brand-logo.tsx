import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    variant?: "smart" | "full"
    className?: string
    width?: number
    height?: number
    priority?: boolean
    sizes?: string
}

export function BrandLogo({
    variant = "full",
    className,
    width,
    height,
    priority = false,
    sizes
}: BrandLogoProps) {
    const isSmart = variant === "smart"

    // Match the intrinsic asset ratios so Next/Image does not flag
    // single-dimension resizing as aspect-ratio distortion.
    const defaultWidth = isSmart ? 414 : 1024
    const defaultHeight = 321
    const aspectRatio = defaultWidth / defaultHeight
    const resolvedWidth = width ?? (height ? Math.round(height * aspectRatio) : defaultWidth)
    const resolvedHeight = height ?? (width ? Math.round(width / aspectRatio) : defaultHeight)

    return (
        <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)}>
            <Image
                src={isSmart ? "/brand/numa-logo-mark.svg" : "/brand/numa-logo-full.svg"}
                alt="NUMA Budget"
                width={resolvedWidth}
                height={resolvedHeight}
                className="block h-auto max-w-full object-contain"
                priority={priority}
                sizes={sizes ?? (isSmart ? "128px" : "132px")}
                unoptimized
            />
        </div>
    )
}
