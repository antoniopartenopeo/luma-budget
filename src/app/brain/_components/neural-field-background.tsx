

export function NeuralFieldBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.14_200_/_.22),transparent_46%),radial-gradient(circle_at_82%_10%,oklch(0.68_0.15_160_/_.16),transparent_34%),radial-gradient(circle_at_50%_86%,oklch(0.62_0.13_220_/_.12),transparent_42%)]" />
            <div className="absolute left-1/3 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 animate-pulse-soft" />
            <div className="absolute left-1/3 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 animate-ping-slow" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#7c8ea11a_1px,transparent_1px),linear-gradient(to_bottom,#7c8ea11a_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
        </div>
    )
}
