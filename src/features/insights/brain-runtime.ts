"use client"

import { useEffect, useId, useMemo, useSyncExternalStore } from "react"
import {
    BRAIN_MATURITY_SAMPLE_TARGET,
    computeBrainInputSignature,
    evolveBrainFromHistory,
    getBrainSnapshot,
    initializeBrain,
    resetBrain,
    type BrainEvolutionResult,
    type BrainTrainingProgress,
    type NeuralBrainSnapshot,
} from "@/brain"
import { fetchTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"
import { getCategories, __resetCategoriesCache } from "@/features/categories/api/repository"
import type { Transaction } from "@/features/transactions/api/types"
import type { Category } from "@/domain/categories/types"
import { getCurrentPeriod } from "@/lib/date-ranges"
import {
    STORAGE_KEY_BRAIN_ADAPTIVE_POLICY,
    STORAGE_KEY_BRAIN_SNAPSHOT,
    STORAGE_KEY_CATEGORIES,
    STORAGE_KEY_TRANSACTIONS,
} from "@/lib/storage-keys"
import { STORAGE_MUTATION_EVENT, type StorageMutationDetail } from "@/lib/storage-utils"
import {
    adaptBrainAdaptivePolicy,
    DEFAULT_BRAIN_ADAPTIVE_POLICY,
    loadBrainAdaptivePolicy,
    saveBrainAdaptivePolicy,
    type BrainAdaptivePolicy,
} from "./brain-auto-tune"
import { formatBrainEvolutionReason, resolveBrainStage } from "./brain-copy"
import type {
    BrainRuntimeMode,
    EvolutionPoint,
    StageState,
    TimelineEvent,
    TrainingState,
} from "./brain-runtime-types"

const MAX_TIMELINE_EVENTS = 12
const MAX_EVOLUTION_HISTORY_POINTS = 36
const STABILITY_LOSS_TARGET = 0.12

interface BrainRuntimePeriodState {
    preferredPeriod: string
    inputSignature: string
    evolutionSignature: string
    evolution: BrainEvolutionResult | null
    isLoading: boolean
    error: string | null
    mode: BrainRuntimeMode | null
}

interface BrainRuntimeStoreState {
    snapshot: NeuralBrainSnapshot | null
    adaptivePolicy: BrainAdaptivePolicy
    training: TrainingState
    timeline: TimelineEvent[]
    evolutionHistory: EvolutionPoint[]
    transactionsCount: number
    categoriesCount: number
    periods: Record<string, BrainRuntimePeriodState>
}

export interface BrainRuntimeValue extends BrainRuntimeStoreState {
    preferredPeriod: string
    mode: BrainRuntimeMode
    stage: StageState
    periodState: BrainRuntimePeriodState
    evolution: BrainEvolutionResult | null
    isInitialized: boolean
    isLoading: boolean
    initialize: () => void
    reset: () => void
    runEvolution: () => void
}

export interface BrainRuntimeOptions {
    mode?: BrainRuntimeMode
    preferredPeriod?: string
}

interface RegisteredBrainConsumer {
    mode: BrainRuntimeMode
    preferredPeriod: string
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)))
}

function createTrainingState(): TrainingState {
    return {
        isTraining: false,
        epoch: 0,
        totalEpochs: 0,
        progress: 0,
        currentLoss: 0,
        sampleCount: 0,
        lastCompletedAt: null,
    }
}

function createPeriodState(preferredPeriod: string): BrainRuntimePeriodState {
    return {
        preferredPeriod,
        inputSignature: "",
        evolutionSignature: "",
        evolution: null,
        isLoading: false,
        error: null,
        mode: null,
    }
}

function createStoreState(): BrainRuntimeStoreState {
    return {
        snapshot: null,
        adaptivePolicy: { ...DEFAULT_BRAIN_ADAPTIVE_POLICY },
        training: createTrainingState(),
        timeline: [],
        evolutionHistory: [],
        transactionsCount: 0,
        categoriesCount: 0,
        periods: {},
    }
}

function signatureOfSnapshot(snapshot: NeuralBrainSnapshot | null): string {
    if (!snapshot) return "not-initialized"
    return [
        snapshot.version,
        snapshot.featureSchemaVersion,
        snapshot.trainedSamples,
        snapshot.lossEma,
        snapshot.updatedAt,
        snapshot.dataFingerprint,
    ].join(":")
}

function isSameAdaptivePolicy(a: BrainAdaptivePolicy, b: BrainAdaptivePolicy): boolean {
    return a.version === b.version
        && a.minNowcastConfidence === b.minNowcastConfidence
        && a.outlierMinConfidence === b.outlierMinConfidence
        && a.primaryBlendThreshold === b.primaryBlendThreshold
        && a.overshootDeltaCents === b.overshootDeltaCents
        && a.rollingQuality === b.rollingQuality
        && a.steps === b.steps
        && a.updatedAt === b.updatedAt
}

function toBrainTransactions(transactions: Transaction[]) {
    return transactions.map((transaction) => ({
        amountCents: Math.abs(transaction.amountCents || 0),
        type: transaction.type,
        timestamp: transaction.timestamp,
        categoryId: transaction.categoryId,
        isSuperfluous: transaction.isSuperfluous,
    }))
}

function toBrainCategories(categories: Category[]) {
    return categories.map((category) => ({
        id: category.id,
        spendingNature: category.spendingNature,
    }))
}

let runtimeState = createStoreState()
let hasBootstrappedRuntime = false
let lifecycleAttached = false
let eventCounter = 0

const subscribers = new Set<() => void>()
const registeredConsumers = new Map<string, RegisteredBrainConsumer>()
const inFlightRuns = new Map<string, Promise<void>>()
const lastRequestedRunKeyByPeriod = new Map<string, string>()
const lastAdaptiveTuneSignatureByPeriod = new Map<string, string>()

function getRuntimeSnapshot(): BrainRuntimeStoreState {
    return runtimeState
}

function emitRuntimeChange(): void {
    subscribers.forEach((listener) => listener())
}

function setRuntimeState(
    updater: (previous: BrainRuntimeStoreState) => BrainRuntimeStoreState
): void {
    runtimeState = updater(runtimeState)
    emitRuntimeChange()
}

function subscribeToRuntime(listener: () => void): () => void {
    subscribers.add(listener)
    return () => {
        subscribers.delete(listener)
    }
}

function getPeriodState(
    state: BrainRuntimeStoreState,
    preferredPeriod: string
): BrainRuntimePeriodState {
    return state.periods[preferredPeriod] ?? createPeriodState(preferredPeriod)
}

function buildTimelineEvent(title: string, detail: string, tone: TimelineEvent["tone"] = "neutral"): TimelineEvent {
    const nextId = `brain-event-${eventCounter}`
    eventCounter += 1
    return {
        id: nextId,
        title,
        detail,
        tone,
        at: new Date().toISOString(),
    }
}

function resolveStabilityProgress(snapshot: NeuralBrainSnapshot | null, training: TrainingState): number {
    const liveLoss = training.isTraining ? training.currentLoss : (snapshot?.lossEma ?? 0)
    const normalizedLoss = Math.min(liveLoss / STABILITY_LOSS_TARGET, 1)
    return clampPercent((1 - normalizedLoss) * 100)
}

function resolveExperienceProgress(snapshot: NeuralBrainSnapshot | null): number {
    return clampPercent(((snapshot?.trainedSamples ?? 0) / BRAIN_MATURITY_SAMPLE_TARGET) * 100)
}

function resolveBrainReadiness(snapshot: NeuralBrainSnapshot | null, training: TrainingState): number {
    if (!snapshot) return 0
    const experience = resolveExperienceProgress(snapshot)
    const stability = resolveStabilityProgress(snapshot, training)
    const learned = clampPercent((experience * 0.72) + (stability * 0.28))
    return training.isTraining ? Math.max(learned, training.progress) : learned
}

function appendEvolutionPoint(state: BrainRuntimeStoreState): BrainRuntimeStoreState {
    const nextPoint: EvolutionPoint = {
        at: Date.now(),
        readiness: resolveBrainReadiness(state.snapshot, state.training),
        experience: resolveExperienceProgress(state.snapshot),
        stability: resolveStabilityProgress(state.snapshot, state.training),
    }
    const lastPoint = state.evolutionHistory[state.evolutionHistory.length - 1]

    if (
        lastPoint
        && lastPoint.readiness === nextPoint.readiness
        && lastPoint.experience === nextPoint.experience
        && lastPoint.stability === nextPoint.stability
    ) {
        return state
    }

    const nextHistory = [...state.evolutionHistory, nextPoint]
    if (nextHistory.length > MAX_EVOLUTION_HISTORY_POINTS) {
        nextHistory.shift()
    }

    return {
        ...state,
        evolutionHistory: nextHistory,
    }
}

function pushRuntimeEvent(title: string, detail: string, tone: TimelineEvent["tone"] = "neutral"): void {
    const nextEvent = buildTimelineEvent(title, detail, tone)
    setRuntimeState((previous) => ({
        ...previous,
        timeline: [nextEvent, ...previous.timeline].slice(0, MAX_TIMELINE_EVENTS),
    }))
}

function attachLifecycleListeners(): void {
    if (lifecycleAttached || typeof window === "undefined") return
    lifecycleAttached = true

    window.addEventListener("storage", handleNativeStorageChange)
    window.addEventListener(STORAGE_MUTATION_EVENT, handleSameTabStorageChange)
}

function syncStoredBrainState(reason: "boot" | "storage" | "mutation"): void {
    const nextSnapshot = getBrainSnapshot()
    const nextAdaptivePolicy = loadBrainAdaptivePolicy()
    const snapshotChanged = signatureOfSnapshot(nextSnapshot) !== signatureOfSnapshot(runtimeState.snapshot)
    const policyChanged = !isSameAdaptivePolicy(runtimeState.adaptivePolicy, nextAdaptivePolicy)

    if (!snapshotChanged && !policyChanged && reason !== "boot") return

    setRuntimeState((previous) => appendEvolutionPoint({
        ...previous,
        snapshot: nextSnapshot,
        adaptivePolicy: nextAdaptivePolicy,
    }))

    if (reason === "boot") {
        pushRuntimeEvent(
            "Brain collegato",
            nextSnapshot ? "Stato letto dal dispositivo." : "Il Brain non è ancora stato avviato.",
            "neutral"
        )
        return
    }

    if (reason === "storage" && (snapshotChanged || policyChanged)) {
        pushRuntimeEvent(
            "Aggiornamento rilevato",
            "Lo stato del Brain è cambiato in un'altra scheda aperta.",
            "warning"
        )
    }
}

function ensureBootstrappedRuntime(): void {
    attachLifecycleListeners()
    if (hasBootstrappedRuntime) return
    hasBootstrappedRuntime = true
    syncStoredBrainState("boot")
}

async function loadBrainSources(preferredPeriod: string) {
    const [transactions, categories] = await Promise.all([
        fetchTransactions(),
        getCategories(),
    ])
    const brainTransactions = toBrainTransactions(transactions)
    const brainCategories = toBrainCategories(categories)
    const inputSignature = computeBrainInputSignature(brainTransactions, brainCategories, preferredPeriod)

    setRuntimeState((previous) => ({
        ...previous,
        transactionsCount: transactions.length,
        categoriesCount: categories.length,
        periods: {
            ...previous.periods,
            [preferredPeriod]: {
                ...getPeriodState(previous, preferredPeriod),
                preferredPeriod,
                inputSignature,
            },
        },
    }))

    return {
        transactions,
        categories,
        brainTransactions,
        brainCategories,
        inputSignature,
    }
}

function resolveSubscribedMode(preferredPeriod: string): BrainRuntimeMode | null {
    let hasReadOnlySubscriber = false

    for (const consumer of registeredConsumers.values()) {
        if (consumer.preferredPeriod !== preferredPeriod) continue
        if (consumer.mode === "active") return "active"
        hasReadOnlySubscriber = true
    }

    return hasReadOnlySubscriber ? "readonly" : null
}

async function requestEvolution(
    preferredPeriod: string,
    requestedMode: BrainRuntimeMode,
    options: { force?: boolean } = {}
): Promise<void> {
    ensureBootstrappedRuntime()

    const subscribedMode = resolveSubscribedMode(preferredPeriod)
    const effectiveMode = subscribedMode === "active"
        ? "active"
        : requestedMode
    const { brainTransactions, brainCategories, inputSignature } = await loadBrainSources(preferredPeriod)
    const currentPeriodState = getPeriodState(runtimeState, preferredPeriod)
    const hasFreshEvolution = currentPeriodState.evolutionSignature === inputSignature && currentPeriodState.evolution !== null

    if (!options.force && hasFreshEvolution) {
        return
    }

    const runtimeRunKey = `${effectiveMode}:${preferredPeriod}:${inputSignature}`
    lastRequestedRunKeyByPeriod.set(preferredPeriod, runtimeRunKey)

    const existingRun = inFlightRuns.get(runtimeRunKey)
    if (existingRun) {
        return existingRun
    }

    if (effectiveMode === "active" && !getBrainSnapshot()) {
        const newborn = initializeBrain()
        setRuntimeState((previous) => appendEvolutionPoint({
            ...previous,
            snapshot: newborn,
        }))
        pushRuntimeEvent("Brain pronto", "Il Brain è stato preparato e può iniziare a leggere i tuoi dati.", "positive")
    }

    const baselineLoss = getBrainSnapshot()?.lossEma ?? 0
    setRuntimeState((previous) => appendEvolutionPoint({
        ...previous,
        training: effectiveMode === "active"
            ? {
                ...previous.training,
                isTraining: true,
                epoch: 0,
                totalEpochs: 0,
                progress: 0,
                currentLoss: baselineLoss,
                sampleCount: 0,
            }
            : previous.training,
        periods: {
            ...previous.periods,
            [preferredPeriod]: {
                ...getPeriodState(previous, preferredPeriod),
                preferredPeriod,
                inputSignature,
                isLoading: true,
                error: null,
                mode: effectiveMode,
            },
        },
    }))

    if (effectiveMode === "active") {
        pushRuntimeEvent(
            "Analisi avviata",
            `Sto rileggendo ${brainTransactions.length} transazioni e ${brainCategories.length} categorie per aggiornare stime e segnali.`,
            "neutral"
        )
    }

    const runPromise = (async () => {
        try {
            const result = await evolveBrainFromHistory(brainTransactions, brainCategories, {
                preferredPeriod,
                allowTraining: effectiveMode === "active",
                onProgress: effectiveMode === "active"
                    ? (progress: BrainTrainingProgress) => {
                        if (lastRequestedRunKeyByPeriod.get(preferredPeriod) !== runtimeRunKey) return

                        setRuntimeState((previous) => appendEvolutionPoint({
                            ...previous,
                            training: {
                                ...previous.training,
                                isTraining: true,
                                epoch: progress.epoch,
                                totalEpochs: progress.totalEpochs,
                                progress: clampPercent((progress.epoch / progress.totalEpochs) * 100),
                                currentLoss: progress.averageLoss,
                                sampleCount: progress.sampleCount,
                            },
                        }))

                        pushRuntimeEvent(
                            `Passaggio ${progress.epoch}/${progress.totalEpochs}`,
                            `Sto leggendo ${progress.sampleCount} dati per aggiornare il Brain.`,
                            "neutral"
                        )
                    }
                    : undefined,
            })

            if (lastRequestedRunKeyByPeriod.get(preferredPeriod) !== runtimeRunKey) {
                return
            }

            const shouldAdaptPolicy = effectiveMode === "active"
                && lastAdaptiveTuneSignatureByPeriod.get(preferredPeriod) !== inputSignature
            const nextAdaptivePolicy = shouldAdaptPolicy
                ? adaptBrainAdaptivePolicy(runtimeState.adaptivePolicy, result)
                : runtimeState.adaptivePolicy

            if (shouldAdaptPolicy) {
                saveBrainAdaptivePolicy(nextAdaptivePolicy)
                lastAdaptiveTuneSignatureByPeriod.set(preferredPeriod, inputSignature)
            }

            setRuntimeState((previous) => appendEvolutionPoint({
                ...previous,
                snapshot: result.snapshot ?? getBrainSnapshot() ?? previous.snapshot,
                adaptivePolicy: nextAdaptivePolicy,
                training: effectiveMode === "active"
                    ? {
                        ...previous.training,
                        isTraining: false,
                        epoch: result.epochsRun,
                        totalEpochs: result.epochsRun,
                        progress: result.didTrain ? 100 : previous.training.progress,
                        currentLoss: result.averageLoss,
                        sampleCount: result.sampleCount,
                        lastCompletedAt: new Date().toISOString(),
                    }
                    : previous.training,
                periods: {
                    ...previous.periods,
                    [preferredPeriod]: {
                        ...getPeriodState(previous, preferredPeriod),
                        preferredPeriod,
                        inputSignature,
                        evolutionSignature: inputSignature,
                        evolution: result,
                        isLoading: false,
                        error: null,
                        mode: effectiveMode,
                    },
                },
            }))

            if (effectiveMode === "active") {
                const summary = formatBrainEvolutionReason(result)
                pushRuntimeEvent(summary.title, summary.detail, summary.tone)
            }
        } catch (error) {
            if (lastRequestedRunKeyByPeriod.get(preferredPeriod) !== runtimeRunKey) {
                return
            }

            const detail = error instanceof Error ? error.message : "Errore sconosciuto"
            setRuntimeState((previous) => ({
                ...previous,
                training: effectiveMode === "active"
                    ? {
                        ...previous.training,
                        isTraining: false,
                    }
                    : previous.training,
                periods: {
                    ...previous.periods,
                    [preferredPeriod]: {
                        ...getPeriodState(previous, preferredPeriod),
                        preferredPeriod,
                        inputSignature,
                        isLoading: false,
                        error: detail,
                        mode: effectiveMode,
                    },
                },
            }))

            if (effectiveMode === "active") {
                pushRuntimeEvent("Analisi interrotta", detail, "critical")
            }
        } finally {
            inFlightRuns.delete(runtimeRunKey)
        }
    })()

    inFlightRuns.set(runtimeRunKey, runPromise)
    return runPromise
}

function refreshSubscribedPeriods(): void {
    const periods = new Set(Array.from(registeredConsumers.values()).map((consumer) => consumer.preferredPeriod))

    periods.forEach((preferredPeriod) => {
        const mode = resolveSubscribedMode(preferredPeriod)
        if (!mode) return
        void requestEvolution(preferredPeriod, mode)
    })
}

function initializeRuntime(): void {
    ensureBootstrappedRuntime()
    const newborn = initializeBrain()
    setRuntimeState((previous) => appendEvolutionPoint({
        ...previous,
        snapshot: newborn,
    }))
    pushRuntimeEvent("Brain pronto", "Il Brain è stato preparato e può iniziare a leggere i tuoi dati.", "positive")
    refreshSubscribedPeriods()
}

function resetRuntime(): void {
    resetBrain()
    lastAdaptiveTuneSignatureByPeriod.clear()
    lastRequestedRunKeyByPeriod.clear()
    const resetEvent = buildTimelineEvent(
        "Brain azzerato",
        "Il Brain ha dimenticato le analisi precedenti e ripartirà da zero.",
        "warning"
    )

    setRuntimeState((previous) => ({
        ...previous,
        snapshot: null,
        training: createTrainingState(),
        timeline: [resetEvent],
        evolutionHistory: [],
        periods: Object.fromEntries(
            Object.entries(previous.periods).map(([preferredPeriod, periodState]) => ([
                preferredPeriod,
                {
                    ...periodState,
                    evolution: null,
                    evolutionSignature: "",
                    isLoading: false,
                    error: null,
                },
            ]))
        ),
    }))
}

function registerConsumer(consumerId: string, options: RegisteredBrainConsumer): void {
    ensureBootstrappedRuntime()
    registeredConsumers.set(consumerId, options)
    void requestEvolution(options.preferredPeriod, options.mode)
}

function unregisterConsumer(consumerId: string): void {
    registeredConsumers.delete(consumerId)
}

function handleSameTabStorageChange(event: Event): void {
    const key = (event as CustomEvent<StorageMutationDetail>).detail?.key
    if (!key) return

    if (key === STORAGE_KEY_TRANSACTIONS) {
        __resetTransactionsCache()
        refreshSubscribedPeriods()
        return
    }

    if (key === STORAGE_KEY_CATEGORIES) {
        __resetCategoriesCache()
        refreshSubscribedPeriods()
        return
    }

    if (key === STORAGE_KEY_BRAIN_SNAPSHOT || key === STORAGE_KEY_BRAIN_ADAPTIVE_POLICY) {
        syncStoredBrainState("mutation")
    }
}

function handleNativeStorageChange(event: StorageEvent): void {
    if (!event.key) {
        __resetTransactionsCache()
        __resetCategoriesCache()
        syncStoredBrainState("storage")
        refreshSubscribedPeriods()
        return
    }

    if (event.key === STORAGE_KEY_TRANSACTIONS) {
        __resetTransactionsCache()
        refreshSubscribedPeriods()
        return
    }

    if (event.key === STORAGE_KEY_CATEGORIES) {
        __resetCategoriesCache()
        refreshSubscribedPeriods()
        return
    }

    if (event.key === STORAGE_KEY_BRAIN_SNAPSHOT || event.key === STORAGE_KEY_BRAIN_ADAPTIVE_POLICY) {
        syncStoredBrainState("storage")
    }
}

/** @internal - For testing only */
export function __resetBrainRuntimeForTests(): void {
    if (typeof window !== "undefined" && lifecycleAttached) {
        window.removeEventListener("storage", handleNativeStorageChange)
        window.removeEventListener(STORAGE_MUTATION_EVENT, handleSameTabStorageChange)
    }

    runtimeState = createStoreState()
    hasBootstrappedRuntime = false
    lifecycleAttached = false
    eventCounter = 0
    subscribers.clear()
    registeredConsumers.clear()
    inFlightRuns.clear()
    lastRequestedRunKeyByPeriod.clear()
    lastAdaptiveTuneSignatureByPeriod.clear()
}

function buildRuntimeValue(
    state: BrainRuntimeStoreState,
    preferredPeriod: string,
    mode: BrainRuntimeMode
): BrainRuntimeValue {
    const periodState = getPeriodState(state, preferredPeriod)
    return {
        ...state,
        preferredPeriod,
        mode,
        stage: resolveBrainStage(state.snapshot),
        periodState,
        evolution: periodState.evolution,
        isInitialized: state.snapshot !== null,
        isLoading: periodState.isLoading,
        initialize: initializeRuntime,
        reset: resetRuntime,
        runEvolution: () => {
            void requestEvolution(preferredPeriod, mode, { force: true })
        },
    }
}

function useBrainRuntimeStoreSnapshot(): BrainRuntimeStoreState {
    const snapshot = useSyncExternalStore(
        subscribeToRuntime,
        getRuntimeSnapshot,
        getRuntimeSnapshot
    )

    useEffect(() => {
        ensureBootstrappedRuntime()
    }, [])

    return snapshot
}

export function useBrainRuntime(options: BrainRuntimeOptions = {}): BrainRuntimeValue {
    const preferredPeriod = options.preferredPeriod ?? getCurrentPeriod()
    const mode = options.mode ?? "active"
    const state = useBrainRuntimeStoreSnapshot()
    const consumerId = useId()

    useEffect(() => {
        registerConsumer(consumerId, { mode, preferredPeriod })
        return () => {
            unregisterConsumer(consumerId)
        }
    }, [consumerId, mode, preferredPeriod])

    return useMemo(
        () => buildRuntimeValue(state, preferredPeriod, mode),
        [state, preferredPeriod, mode]
    )
}

export function useBrainRuntimeState() {
    const state = useBrainRuntimeStoreSnapshot()

    return useMemo(() => ({
        ...state,
        stage: resolveBrainStage(state.snapshot),
        brainReadinessPercent: resolveBrainReadiness(state.snapshot, state.training),
        brainExperiencePercent: clampPercent(
            ((state.snapshot?.trainedSamples ?? 0) / BRAIN_MATURITY_SAMPLE_TARGET) * 100
        ),
    }), [state])
}
