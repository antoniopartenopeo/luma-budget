"use client"

/**
 * Step Preview - Responsive Switcher
 * Renders Mobile or Desktop view based on viewport
 */

import { StepPreviewResponsive } from "./step-preview-responsive"
import type { PreviewRow } from "../types"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

export function StepPreview(props: StepPreviewProps) {
    return <StepPreviewResponsive {...props} />
}
