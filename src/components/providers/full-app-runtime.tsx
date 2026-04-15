"use client"

import { Toaster } from "sonner"
import { QueryProvider } from "./query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export function FullAppRuntime({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryProvider>
  )
}
