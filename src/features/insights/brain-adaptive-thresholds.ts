function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

export function resolveAdaptiveNowcastConfidenceThreshold(params: {
    baseThreshold: number
    maturityScore: number
    reliabilitySampleCount: number
    reliabilityMape: number
    reliabilityMae: number
}): number {
    const {
        baseThreshold,
        maturityScore,
        reliabilitySampleCount,
        reliabilityMape,
        reliabilityMae
    } = params

    // With sparse reliability evidence, require a stricter confidence gate.
    if (reliabilitySampleCount < 6) {
        return clamp(baseThreshold + 0.06, 0.68, 0.9)
    }

    const mapePenalty = clamp((reliabilityMape - 0.22) / 0.5, 0, 0.18)
    const maePenalty = clamp((reliabilityMae - 0.18) / 0.45, 0, 0.12)
    const maturityRelief = clamp((maturityScore - 0.65) / 0.35, 0, 0.08)

    return clamp(baseThreshold + mapePenalty + maePenalty - maturityRelief, 0.66, 0.9)
}

export function resolveAdaptiveOutlierBlendConfidence(params: {
    adaptiveNowcastThreshold: number
    reliabilitySampleCount: number
    baseOutlierConfidence: number
}): number {
    const {
        adaptiveNowcastThreshold,
        reliabilitySampleCount,
        baseOutlierConfidence
    } = params
    const sparsePenalty = reliabilitySampleCount < 8 ? 0.03 : 0
    return clamp(Math.max(baseOutlierConfidence, adaptiveNowcastThreshold + 0.08) + sparsePenalty, 0.84, 0.97)
}
