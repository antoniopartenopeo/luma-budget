import { NaiveBayesClassifier, NaiveBayesSnapshot } from "./naive-bayes";
import { Transaction } from "@/features/transactions/api/types";

// Re-using the normalizers from the import-csv pipeline to ensure tokens match
import { normalize, stripPrefixes, cleanNoise, tokenize, filterStopwords } from "@/features/import-csv/core/merchant/normalizers";

const STORAGE_KEY_BRAIN_CATEGORIZER = "numa:brain:categorizer_v1";

export interface PredictionResult {
    categoryId: string | null;
    confidence: number;
}

/**
 * Intelligent Text Tokenizer
 * Re-uses the exact same NLP normalization steps used by the regex pipeline
 * to ensure that the words the AI learns are the identical words the pipeline sees.
 */
function createTokens(text: string): string[] {
    let cleaned = normalize(text);
    cleaned = stripPrefixes(cleaned);
    cleaned = cleanNoise(cleaned);

    const tokens = tokenize(cleaned);
    return filterStopwords(tokens);
}

/**
 * The Brain Categorizer Lobo (Singleton)
 * 
 * Responsible for wrapping the pure math engine, tokenizing real Numa transactions,
 * persisting the learned weights to localStorage, and running predictions.
 */
class BrainCategorizer {
    private engine: NaiveBayesClassifier;
    private initialized = false;

    // Minimum number of total categorized transactions required before the brain 
    // considers itself "mature enough" to start giving predictions over confidence 0.8
    private readonly MATURITY_THRESHOLD = 30;

    constructor() {
        this.engine = new NaiveBayesClassifier(createTokens);
    }

    /**
     * Initializes the lobo from LocalStorage if available.
     * Call this very early in the app lifecycle.
     */
    public initialize(): void {
        if (this.initialized) return;
        if (typeof window === "undefined" || !window.localStorage) return;

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY_BRAIN_CATEGORIZER);
            if (raw) {
                const snapshot = JSON.parse(raw) as NaiveBayesSnapshot;
                this.engine.import(snapshot);
            }
        } catch (e) {
            console.warn("BrainCategorizer: Failed to restore snapshot, starting fresh.", e);
        } finally {
            this.initialized = true;
        }
    }

    /**
     * Save the current neural weights to LocalStorage.
     */
    public persist(): void {
        if (typeof window === "undefined" || !window.localStorage) return;
        try {
            // Prevent LocalStorage Overflow by keeping the vocab size manageable (FM-01)
            this.engine.prune(3000);

            const snapshot = this.engine.export();
            window.localStorage.setItem(STORAGE_KEY_BRAIN_CATEGORIZER, JSON.stringify(snapshot));
        } catch (e) {
            console.error("BrainCategorizer: Failed to persist snapshot", e);
        }
    }

    /**
     * Train the brain on a batch of history transactions.
     * Perfect for initial setup when scanning the existing DB.
     */
    public trainBatch(transactions: Transaction[]): void {
        if (!this.initialized) this.initialize();

        let learned = 0;
        for (const tx of transactions) {
            if (tx.categoryId) {
                this.engine.train(tx.description, tx.categoryId);
                learned++;
            }
        }

        if (learned > 0) {
            this.persist();
        }
    }

    /**
     * Train the brain on a single correction (Online Learning).
     * Call this when the user manually changes a category in the CSV Wizard or UI.
     */
    public learn(description: string, categoryId: string): void {
        if (!this.initialized) this.initialize();
        this.engine.train(description, categoryId);
        this.persist();
    }

    /**
     * Predict the category for an unknown raw bank string.
     */
    public predict(description: string): PredictionResult {
        if (!this.initialized) this.initialize();

        const snapshot = this.engine.export(); // Quick read to check maturity
        if (snapshot.totalSamples < this.MATURITY_THRESHOLD) {
            return { categoryId: null, confidence: 0 };
        }

        const prediction = this.engine.predict(description);

        // Artificial dampening based on maturity
        // Even if the math says 99% confident, if we only have 35 samples total, 
        // we scale the confidence down slightly to avoid arrogant early guesses.
        const maturityScore = Math.min(1, snapshot.totalSamples / 150);

        return {
            categoryId: prediction.categoryId,
            confidence: prediction.confidence * maturityScore
        };
    }

    /**
     * Get the total number of transactions the brain has learned from.
     */
    public getSampleCount(): number {
        if (!this.initialized) this.initialize();
        return this.engine.export().totalSamples;
    }
}

// Export a singleton instance
export const brainCategorizer = new BrainCategorizer();
