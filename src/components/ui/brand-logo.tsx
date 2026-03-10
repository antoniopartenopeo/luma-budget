import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    variant?: "smart" | "full"
    className?: string
    width?: number
    height?: number
}

export function BrandLogo({
    variant = "full",
    className,
    width,
    height
}: BrandLogoProps) {
    const isSmart = variant === "smart"

    // Match the intrinsic asset ratios so Next/Image does not flag
    // single-dimension resizing as aspect-ratio distortion.
    const defaultWidth = isSmart ? 504 : 1024
    const defaultHeight = isSmart ? 395 : 321
    const aspectRatio = defaultWidth / defaultHeight
    const resolvedWidth = width ?? (height ? Math.round(height * aspectRatio) : defaultWidth)
    const resolvedHeight = height ?? (width ? Math.round(width / aspectRatio) : defaultHeight)

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Image
                src={isSmart ? "/brand/numa-logo-smart.png" : "/brand/numa-logo-full.png"}
                alt="NUMA Budget"
                width={resolvedWidth}
                height={resolvedHeight}
                className="object-contain"
                priority
                unoptimized
            />
        </div>
    )
}
