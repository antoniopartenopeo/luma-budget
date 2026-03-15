import { motion } from "framer-motion"

const NEURON_COUNT = 8

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
                {Array.from({ length: NEURON_COUNT }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-primary/30 blur-[1px]"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.2, 1],
                            x: [0, Math.sin(i) * 30, 0],
                            y: [0, Math.cos(i) * 30, 0]
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                        style={{
                            left: `${20 + (i * 15) % 65}%`,
                            top: `${15 + (i * 22) % 70}%`,
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
