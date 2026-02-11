import { buildBrainDataset, BrainCategoryLike, BrainTransactionLike } from "./features"
import {
    finalizeCurrentMonthTrainingSnapshot,
    finalizeTrainingSnapshot,
    predictCurrentMonthWithBrain,
    predictWithBrain,
    trainBrainEpoch,
    trainCurrentMonthHeadEpoch,
} from "./model"
import { getBrainSnapshot } from "./core"
import { saveBrainSnapshot } from "./storage"
import { BrainEvolutionResult, BrainTrainingProgress, NeuralBrainSnapshot } from "./types"

const MIN_SAMPLES_FOR_TRAINING = 1
const MIN_NOWCAST_SAMPLES_FOR_TRAINING = 1
const MIN_SAMPLES_FOR_PREDICTION = 1
const MIN_NOWCAST_READY_MONTHS = 2
const MIN_NOWCAST_READY_SAMPLES = 16
const MIN_NOWCAST_READY_CONFIDENCE = 0.55

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function resolveEpochs(sampleCount: number): number {
    if (sampleCount <= 2) return 10
    if (sampleCount <= 6) return 7
    if (sampleCount <= 12) return 5
    return 4
}

function resolvePredictionResult(snapshot: NeuralBrainSnapshot, inferenceInput: ReturnType<typeof buildBrainDataset>["inferenceInput"]) {
    if (!inferenceInput || snapshot.trainedSamples < MIN_SAMPLES_FOR_PREDICTION) {
        return {
            prediction: null,
            currentIncomeCents: inferenceInput?.currentIncomeCents ?? 0,
            currentExpensesCents: inferenceInput?.currentExpensesCents ?? 0,
            inferredPeriod: inferenceInput?.period ?? null,
            predictedExpensesNextMonthCents: 0,
        }
    }

    const prediction = predictWithBrain(
        snapshot,
        inferenceInput.values,
        inferenceInput.names
    )

    const incomeBaseline = inferenceInput.currentIncomeCents > 0
        ? inferenceInput.currentIncomeCents
        : inferenceInput.currentExpensesCents

    const predictedExpensesNextMonthCents = Math.max(
        0,
        Math.round(prediction.predictedExpenseRatio * Math.max(incomeBaseline, 1))
    )

    return {
        prediction,
        currentIncomeCents: inferenceInput.currentIncomeCents,
        currentExpensesCents: inferenceInput.currentExpensesCents,
        inferredPeriod: inferenceInput.period,
        predictedExpensesNextMonthCents,
    }
}

function resolveCurrentMonthNowcastResult(
    snapshot: NeuralBrainSnapshot,
    currentMonthInferenceInput: ReturnType<typeof buildBrainDataset>["currentMonthInferenceInput"],
    monthsAnalyzed: number
) {
    if (!currentMonthInferenceInput || snapshot.currentMonthHead.trainedSamples < MIN_SAMPLES_FOR_PREDICTION) {
        return {
            predictedCurrentMonthRemainingExpensesCents: 0,
            currentMonthNowcastConfidence: 0,
            currentMonthNowcastReady: false,
        }
    }

    const prediction = predictCurrentMonthWithBrain(
        snapshot,
        currentMonthInferenceInput.values,
        currentMonthInferenceInput.names
    )

    const predictedCurrentMonthRemainingExpensesCents = Math.max(
        0,
        Math.round(prediction.predictedExpenseRatio * Math.max(currentMonthInferenceInput.nowcastBaselineCents, 1))
    )
    const currentMonthNowcastConfidence = prediction.confidence
    const currentMonthNowcastReady = monthsAnalyzed >= MIN_NOWCAST_READY_MONTHS
        && snapshot.currentMonthHead.trainedSamples >= MIN_NOWCAST_READY_SAMPLES
        && currentMonthNowcastConfidence >= MIN_NOWCAST_READY_CONFIDENCE

    return {
        predictedCurrentMonthRemainingExpensesCents,
        currentMonthNowcastConfidence,
        currentMonthNowcastReady,
    }
}

function yieldMainThread(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

export interface EvolveBrainOptions {
    preferredPeriod?: string
    onProgress?: (progress: BrainTrainingProgress) => void
}

export async function evolveBrainFromHistory(
    transactions: BrainTransactionLike[],
    categories: BrainCategoryLike[],
    options: EvolveBrainOptions = {}
): Promise<BrainEvolutionResult> {
    const snapshot = getBrainSnapshot()
    const dataset = buildBrainDataset(transactions, categories, options.preferredPeriod)
    const combinedSampleCount = dataset.samples.length + dataset.nowcastSamples.length

    if (!snapshot) {
        return {
            reason: "uninitialized",
            snapshot: null,
            datasetFingerprint: dataset.fingerprint,
            didTrain: false,
            epochsRun: 0,
            sampleCount: combinedSampleCount,
            monthsAnalyzed: dataset.months,
            averageLoss: 0,
            prediction: null,
            inferencePeriod: dataset.inferenceInput?.period ?? null,
            currentIncomeCents: dataset.inferenceInput?.currentIncomeCents ?? 0,
            currentExpensesCents: dataset.inferenceInput?.currentExpensesCents ?? 0,
            predictedExpensesNextMonthCents: 0,
            predictedCurrentMonthRemainingExpensesCents: 0,
            currentMonthNowcastConfidence: 0,
            currentMonthNowcastReady: false,
        }
    }

    const predictionState = resolvePredictionResult(snapshot, dataset.inferenceInput)
    const nowcastState = resolveCurrentMonthNowcastResult(
        snapshot,
        dataset.currentMonthInferenceInput,
        dataset.months
    )

    if (
        dataset.samples.length < MIN_SAMPLES_FOR_TRAINING
        && dataset.nowcastSamples.length < MIN_NOWCAST_SAMPLES_FOR_TRAINING
    ) {
        return {
            reason: "insufficient-data",
            snapshot,
            datasetFingerprint: dataset.fingerprint,
            didTrain: false,
            epochsRun: 0,
            sampleCount: combinedSampleCount,
            monthsAnalyzed: dataset.months,
            averageLoss: snapshot.lossEma,
            prediction: predictionState.prediction,
            inferencePeriod: predictionState.inferredPeriod,
            currentIncomeCents: predictionState.currentIncomeCents,
            currentExpensesCents: predictionState.currentExpensesCents,
            predictedExpensesNextMonthCents: predictionState.predictedExpensesNextMonthCents,
            predictedCurrentMonthRemainingExpensesCents: nowcastState.predictedCurrentMonthRemainingExpensesCents,
            currentMonthNowcastConfidence: nowcastState.currentMonthNowcastConfidence,
            currentMonthNowcastReady: nowcastState.currentMonthNowcastReady,
        }
    }

    if (
        snapshot.dataFingerprint !== "" &&
        snapshot.dataFingerprint === dataset.fingerprint
    ) {
        return {
            reason: "no-new-data",
            snapshot,
            datasetFingerprint: dataset.fingerprint,
            didTrain: false,
            epochsRun: 0,
            sampleCount: combinedSampleCount,
            monthsAnalyzed: dataset.months,
            averageLoss: snapshot.lossEma,
            prediction: predictionState.prediction,
            inferencePeriod: predictionState.inferredPeriod,
            currentIncomeCents: predictionState.currentIncomeCents,
            currentExpensesCents: predictionState.currentExpensesCents,
            predictedExpensesNextMonthCents: predictionState.predictedExpensesNextMonthCents,
            predictedCurrentMonthRemainingExpensesCents: nowcastState.predictedCurrentMonthRemainingExpensesCents,
            currentMonthNowcastConfidence: nowcastState.currentMonthNowcastConfidence,
            currentMonthNowcastReady: nowcastState.currentMonthNowcastReady,
        }
    }

    let working = snapshot
    let epochsRun = 0
    let trainedSampleCount = 0
    let trainedPhases = 0
    let cumulativePhaseLoss = 0

    if (dataset.samples.length >= MIN_SAMPLES_FOR_TRAINING) {
        const epochs = resolveEpochs(dataset.samples.length)
        let cumulativeLoss = 0
        for (let epoch = 1; epoch <= epochs; epoch++) {
            const { snapshot: nextSnapshot, averageLoss } = trainBrainEpoch(working, dataset.samples)
            working = nextSnapshot
            cumulativeLoss += averageLoss

            options.onProgress?.({
                epoch,
                totalEpochs: epochs,
                averageLoss,
                sampleCount: dataset.samples.length,
            })

            await yieldMainThread()
        }

        const averageLoss = clamp(cumulativeLoss / epochs, 0, 10)
        working = finalizeTrainingSnapshot(
            working,
            dataset.samples.length,
            averageLoss,
            dataset.fingerprint
        )
        epochsRun += epochs
        trainedSampleCount += dataset.samples.length
        cumulativePhaseLoss += averageLoss
        trainedPhases += 1
    }

    if (dataset.nowcastSamples.length >= MIN_NOWCAST_SAMPLES_FOR_TRAINING) {
        const epochs = resolveEpochs(dataset.nowcastSamples.length)
        let cumulativeLoss = 0
        for (let epoch = 1; epoch <= epochs; epoch++) {
            const { snapshot: nextSnapshot, averageLoss } = trainCurrentMonthHeadEpoch(working, dataset.nowcastSamples)
            working = nextSnapshot
            cumulativeLoss += averageLoss

            options.onProgress?.({
                epoch,
                totalEpochs: epochs,
                averageLoss,
                sampleCount: dataset.nowcastSamples.length,
            })

            await yieldMainThread()
        }

        const averageLoss = clamp(cumulativeLoss / epochs, 0, 10)
        working = finalizeCurrentMonthTrainingSnapshot(
            working,
            dataset.nowcastSamples.length,
            averageLoss,
            dataset.fingerprint
        )
        epochsRun += epochs
        trainedSampleCount += dataset.nowcastSamples.length
        cumulativePhaseLoss += averageLoss
        trainedPhases += 1
    }

    if (trainedPhases === 0) {
        return {
            reason: "insufficient-data",
            snapshot,
            datasetFingerprint: dataset.fingerprint,
            didTrain: false,
            epochsRun: 0,
            sampleCount: combinedSampleCount,
            monthsAnalyzed: dataset.months,
            averageLoss: snapshot.lossEma,
            prediction: predictionState.prediction,
            inferencePeriod: predictionState.inferredPeriod,
            currentIncomeCents: predictionState.currentIncomeCents,
            currentExpensesCents: predictionState.currentExpensesCents,
            predictedExpensesNextMonthCents: predictionState.predictedExpensesNextMonthCents,
            predictedCurrentMonthRemainingExpensesCents: nowcastState.predictedCurrentMonthRemainingExpensesCents,
            currentMonthNowcastConfidence: nowcastState.currentMonthNowcastConfidence,
            currentMonthNowcastReady: nowcastState.currentMonthNowcastReady,
        }
    }

    const averageLoss = clamp(cumulativePhaseLoss / trainedPhases, 0, 10)
    saveBrainSnapshot(working)

    const predictionAfterTraining = resolvePredictionResult(working, dataset.inferenceInput)
    const nowcastAfterTraining = resolveCurrentMonthNowcastResult(
        working,
        dataset.currentMonthInferenceInput,
        dataset.months
    )

    return {
        reason: "trained",
        snapshot: working,
        datasetFingerprint: dataset.fingerprint,
        didTrain: true,
        epochsRun,
        sampleCount: trainedSampleCount,
        monthsAnalyzed: dataset.months,
        averageLoss,
        prediction: predictionAfterTraining.prediction,
        inferencePeriod: predictionAfterTraining.inferredPeriod,
        currentIncomeCents: predictionAfterTraining.currentIncomeCents,
        currentExpensesCents: predictionAfterTraining.currentExpensesCents,
        predictedExpensesNextMonthCents: predictionAfterTraining.predictedExpensesNextMonthCents,
        predictedCurrentMonthRemainingExpensesCents: nowcastAfterTraining.predictedCurrentMonthRemainingExpensesCents,
        currentMonthNowcastConfidence: nowcastAfterTraining.currentMonthNowcastConfidence,
        currentMonthNowcastReady: nowcastAfterTraining.currentMonthNowcastReady,
    }
}
