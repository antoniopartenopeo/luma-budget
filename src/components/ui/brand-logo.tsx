import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    variant?: "smart" | "full"
    preset?: "asset" | "header"
    tone?: "default" | "light"
    className?: string
    width?: number
    height?: number
    priority?: boolean
    sizes?: string
}

const BRAND_LOGO_HEADER_HEIGHT = 48
const BRAND_LOGO_HEADER_SIZES = "180px"

export function BrandLogo({
    variant = "full",
    preset = "asset",
    tone = "default",
    className,
    width,
    height,
    priority = false,
    sizes
}: BrandLogoProps) {
    const isSmart = variant === "smart"
    const useHeaderPreset = preset === "header" && !isSmart

    // Match the intrinsic asset ratios so Next/Image does not flag
    // single-dimension resizing as aspect-ratio distortion.
    const defaultWidth = isSmart ? 220 : 760
    const defaultHeight = 220
    const aspectRatio = defaultWidth / defaultHeight
    const displayHeight = height ?? (useHeaderPreset ? BRAND_LOGO_HEADER_HEIGHT : undefined)
    const resolvedWidth = width ?? (displayHeight ? Math.round(displayHeight * aspectRatio) : defaultWidth)
    const resolvedHeight = displayHeight ?? (width ? Math.round(width / aspectRatio) : defaultHeight)

    return (
        <div
            className={cn(
                "relative inline-flex shrink-0 items-center justify-center",
                useHeaderPreset && "w-auto max-w-[180px] opacity-100",
                tone === "light" && "brightness-0 invert",
                className
            )}
        >
            <Image
                src={isSmart ? "/brand/numa-logo-mark.svg" : "/brand/numa-logo-full.svg"}
                alt="NUMA Budget"
                width={resolvedWidth}
                height={resolvedHeight}
                className="block h-auto w-auto max-w-full object-contain"
                priority={priority}
                sizes={sizes ?? (useHeaderPreset ? BRAND_LOGO_HEADER_SIZES : isSmart ? "128px" : "132px")}
                unoptimized
            />
        </div>
    )
}
