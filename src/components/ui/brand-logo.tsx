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

    // Default dimensions if not provided
    const defaultWidth = isSmart ? 32 : 120
    const defaultHeight = isSmart ? 32 : 40

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Image
                src={isSmart ? "/brand/numa-logo-smart.png" : "/brand/numa-logo-full.png"}
                alt="NUMA Budget"
                width={width || defaultWidth}
                height={height || defaultHeight}
                className="object-contain"
                priority
            />
        </div>
    )
}
