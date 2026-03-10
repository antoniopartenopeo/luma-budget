"use client"

import { DiagnosticsSnapshot } from "@/features/settings/diagnostics/diagnostics-utils"
import { cn } from "@/lib/utils"

type DiagnosticsMetaStripProps = {
    diagnostics: DiagnosticsSnapshot
}

function formatStorageSize(totalApproxBytes: number): string {
    if (totalApproxBytes > 1024 * 50) {
        return `${(totalApproxBytes / 1024 / 1024).toFixed(2)} MB`
    }
    return `${(totalApproxBytes / 1024).toFixed(1)} KB`
}

export function DiagnosticsMetaStrip({ diagnostics }: DiagnosticsMetaStripProps) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Versione:</span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{diagnostics.app.version}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Build:</span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{diagnostics.app.gitSha}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ambiente:</span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{diagnostics.app.env}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Storage totale:</span>
                    <span className={cn(
                        "font-mono font-bold text-xs",
                        diagnostics.totalApproxBytes > 1024 * 1024 ? "text-amber-600" : "text-primary"
                    )}>
                        {formatStorageSize(diagnostics.totalApproxBytes)}
                    </span>
                </div>
            </div>

            <div className="text-xs font-medium text-muted-foreground">
                Build time: {diagnostics.app.buildTime}
            </div>
        </>
    )
}
