import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[2rem] border border-slate-950/10 bg-white/66 p-6 shadow-[0_28px_86px_-62px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl sm:p-8 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_34px_104px_-72px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)]",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.10)_32%,transparent_66%),linear-gradient(132deg,transparent_0%,rgba(14,165,168,0.05)_40%,rgba(255,255,255,0.16)_52%,transparent_68%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.022)_34%,transparent_68%),linear-gradient(132deg,transparent_0%,rgba(161,222,235,0.055)_40%,rgba(255,255,255,0.04)_52%,transparent_68%)]" />
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-[46rem] text-sm font-medium leading-relaxed text-slate-600 dark:text-white/58">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
            </div>
        </div>
    )
}
