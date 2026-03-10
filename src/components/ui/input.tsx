import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { inputControlVariants } from "@/components/ui/control-styles"

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputControlVariants> {}

function Input({ className, type, variant, density, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputControlVariants({ variant, density }), className)}
      {...props}
    />
  )
}

export { Input }
