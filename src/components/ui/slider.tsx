"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    trackClassName?: string
    rangeClassName?: string
    thumbClassName?: string
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, trackClassName, rangeClassName, thumbClassName, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track
            className={cn(
                "relative h-2.5 w-full grow overflow-hidden rounded-full border border-border/60 bg-muted/80",
                trackClassName
            )}
        >
            <SliderPrimitive.Range
                className={cn(
                    "absolute h-full bg-gradient-to-r from-primary/65 via-primary/80 to-primary",
                    rangeClassName
                )}
            />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={cn(
                "block h-5 w-5 rounded-full border-2 border-primary/85 bg-background shadow-md shadow-primary/20 transition-[transform,box-shadow] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
                thumbClassName
            )}
        />
    </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
