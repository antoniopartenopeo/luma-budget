import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const NEURON_LAYOUTS = [
    { positionClass: "left-[20%] top-[15%]", driftX: 0, driftY: 30, duration: 8, delay: 0 },
    { positionClass: "left-[35%] top-[37%]", driftX: 25, driftY: 16, duration: 10, delay: 0.5 },
    { positionClass: "left-[50%] top-[59%]", driftX: 27, driftY: -12, duration: 12, delay: 1 },
    { positionClass: "left-[65%] top-[81%]", driftX: 4, driftY: -30, duration: 14, delay: 1.5 },
    { positionClass: "left-[80%] top-[33%]", driftX: -23, driftY: -20, duration: 16, delay: 2 },
    { positionClass: "left-[30%] top-[55%]", driftX: -29, driftY: 9, duration: 18, delay: 2.5 },
    { positionClass: "left-[45%] top-[77%]", driftX: -8, driftY: 29, duration: 20, delay: 3 },
    { positionClass: "left-[60%] top-[29%]", driftX: 20, driftY: 23, duration: 22, delay: 3.5 },
] as const

export function NeuralFieldBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Atmospheric Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.14_200_/_.15),transparent_40%),radial-gradient(circle_at_80%_15%,oklch(0.68_0.15_160_/_.12),transparent_35%),radial-gradient(circle_at_50%_85%,oklch(0.62_0.13_220_/_.08),transparent_40%)]" />

            {/* Soft Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#7c8ea108_1px,transparent_1px),linear-gradient(to_bottom,#7c8ea108_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

            {/* Core Neural Pulse */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-56 w-56 rounded-full border border-primary/10 animate-pulse-soft blur-sm" />
                <div className="absolute inset-0 h-56 w-56 rounded-full border border-primary/5 animate-ping-slow" />
            </div>

            {/* Floating Neurons (Stars) */}
            <div className="absolute inset-0">
                {NEURON_LAYOUTS.map((neuron) => (
                    <motion.div
                        key={neuron.positionClass}
                        className={cn("absolute h-1 w-1 rounded-full bg-primary/30 blur-[1px]", neuron.positionClass)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.2, 1],
                            x: [0, neuron.driftX, 0],
                            y: [0, neuron.driftY, 0]
                        }}
                        transition={{
                            duration: neuron.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: neuron.delay
                        }}
                    />
                ))}
            </div>

            {/* Neural Connections (Subtle) */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.03] grayscale">
                <defs>
                    <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M 100 200 Q 400 150 700 350 T 1100 250"
                    fill="none"
                    stroke="url(#neural-grad)"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
            </svg>
        </div>
    )
}
