
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useGoalScenarios } from '../hooks/use-goal-scenarios'
import { useGoalPortfolio } from '../hooks/use-goal-portfolio'
import { useCategories } from '@/features/categories/api/use-categories'
import { ScenarioType } from '../types'

export function NUMAExperience() {
    const [step, setStep] = useState<'orient' | 'path' | 'confirm'>('orient')
    const [amountStr, setAmountStr] = useState('')
    const [goalType, setGoalType] = useState<'growth' | 'comfort' | 'security' | null>(null)
    const [selectedRhythm, setSelectedRhythm] = useState<string | null>(null)
    const { data: categories = [] } = useCategories()

    // Convert input to cents
    const amountCents = parseInt(amountStr || '0') * 100

    // Hook for projections
    const { scenarios, isLoading, baselineMetrics } = useGoalScenarios({
        goalTargetCents: amountCents,
        categories
    })

    // Hook for persistence
    const { setRhythm, activeRhythm } = useGoalPortfolio({
        globalProjectionInput: {
            currentFreeCashFlow: (baselineMetrics?.averageMonthlyIncome || 0) - (baselineMetrics?.averageMonthlyExpenses || 0),
            historicalVariability: baselineMetrics?.expensesStdDev || 0
        }
    })

    const baselineProjection = scenarios.find(s => s.config.type === 'baseline')?.projection

    const handleApplyRhythm = async (type: ScenarioType, label: string, benefitCents: number) => {
        setSelectedRhythm(label)
        await setRhythm(type, label, benefitCents)
        setStep('confirm')
        // Automatically return to orientation after a delay
        setTimeout(() => {
            setStep('orient')
            setGoalType(null)
        }, 4000)
    }

    const goalTypeLabels = {
        growth: "Crescita",
        comfort: "Comfort",
        security: "Sicurezza"
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">

            {/* Header / Context */}
            {activeRhythm && step !== 'confirm' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-8 flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                    <div className="text-sm font-medium text-white/50">
                        L'andamento attuale è il <span className="text-white font-bold">{activeRhythm.label}</span>
                    </div>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {step === 'orient' && (
                    <motion.div
                        key="orient"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 text-center"
                    >
                        <h1 className="text-4xl font-semibold tracking-tight text-white/90">
                            Qual è il tuo traguardo?
                        </h1>

                        <div className="relative max-w-xs mx-auto">
                            <input
                                type="number"
                                value={amountStr}
                                onChange={(e) => setAmountStr(e.target.value)}
                                placeholder="Valore del traguardo"
                                className="w-full bg-transparent border-b-2 border-white/20 focus:border-white/60 text-5xl font-bold py-4 text-center text-white outline-none transition-all placeholder:text-white/10"
                            />
                            <span className="absolute right-0 bottom-4 text-2xl text-white/30">€</span>
                        </div>

                        {amountCents > 0 && baselineProjection && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <p className="text-2xl text-white/70 leading-relaxed">
                                        Secondo l'andamento naturale, il tuo traguardo {goalType ? `di ${goalTypeLabels[goalType].toLowerCase()}` : ""} si concretizza verso{' '}
                                        <span className="text-white font-semibold">
                                            {format(baselineProjection.likelyDate, 'MMMM yyyy', { locale: it })}
                                        </span>.
                                    </p>

                                    <p className="text-sm text-white/30 italic max-w-md mx-auto">
                                        Questa proiezione riflette il tuo modo abituale di gestire le risorse, senza cambiamenti forzati.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Qual è la natura del traguardo?</p>
                                    <div className="flex justify-center gap-3">
                                        {(['growth', 'comfort', 'security'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setGoalType(t)}
                                                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all ${goalType === t
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                {goalTypeLabels[t]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep('path')}
                                    className="px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all shadow-xl shadow-white/5 transform hover:scale-105"
                                >
                                    Vedi le proiezioni
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {step === 'path' && (
                    <motion.div
                        key="path"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-semibold text-white/90">Andamento del viaggio</h2>
                            <p className="text-white/50">In quale di questi ritmi ti riconosci di più?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {scenarios.map((s) => (
                                <button
                                    key={s.config.type}
                                    onClick={() => {
                                        const benefit = (baselineMetrics?.averageMonthlyExpenses || 0) - s.simulatedExpenses
                                        handleApplyRhythm(s.config.type, s.config.label, benefit)
                                    }}
                                    className="group text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex justify-between items-center"
                                >
                                    <div className="space-y-1">
                                        <div className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
                                            {s.config.label}
                                        </div>
                                        <div className="text-sm text-white/50">
                                            {s.config.description}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">
                                            {format(s.projection.likelyDate, 'MMM yyyy', { locale: it })}
                                        </div>
                                        <div className="text-xs text-white/30 font-medium uppercase tracking-wider">
                                            Orizzonte temporale
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep('orient')}
                            className="w-full text-sm text-white/40 hover:text-white/60 transition-colors underline"
                        >
                            Modifica cifre
                        </button>
                    </motion.div>
                )}

                {step === 'confirm' && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                className="text-4xl text-white"
                            >
                                ✅
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-bold text-white tracking-tight">Andamento confermato.</h3>
                            <div className="space-y-2">
                                <p className="text-xl text-white/80">
                                    Con l'assetto <span className="text-white font-bold">"{selectedRhythm}"</span>,
                                    il tempo e la tranquillità trovano il loro equilibrio.
                                </p>
                                <p className="text-sm text-white/30">
                                    L'intero sistema rifletterà d'ora in poi questo passo.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
