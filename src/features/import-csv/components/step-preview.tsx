"use client"

/**
 * Step Preview - Responsive Switcher
 * Renders Mobile or Desktop view based on viewport
 */

import { useMediaQuery } from "@/hooks/use-media-query"
import { StepPreviewDesktop } from "./step-preview-desktop"
import { StepPreviewMobile } from "./step-preview-mobile"
import type { PreviewRow } from "../types"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

export function StepPreview(props: StepPreviewProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return <StepPreviewDesktop {...props} />
    }

    return <StepPreviewMobile {...props} />
}
