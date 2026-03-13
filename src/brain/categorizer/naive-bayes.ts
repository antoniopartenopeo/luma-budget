/**
 * Minimalist Naive Bayes Classifier for Text Classification (NLP)
 * 
 * Optimized for Numa transactions: Fast, lightweight, and capable of
 * online incremental learning (learning one transaction at a time).
 */

export interface TokenizerFn {
    (text: string): string[];
}

export interface NaiveBayesSnapshot {
    categoryCounts: Record<string, number>;
    wordCounts: Record<string, Record<string, number>>;
    vocabulary: string[];
    totalSamples: number;
}

export class NaiveBayesClassifier {
    private categoryCounts: Map<string, number> = new Map();
    private wordCounts: Map<string, Map<string, number>> = new Map();
    private vocabulary: Set<string> = new Set();
    private totalSamples: number = 0;

    // Laplace smoothing parameter to handle unseen words
    private readonly alpha = 1.0;

    constructor(private tokenizer: TokenizerFn) { }

    /**
     * Train the model with a single text example and its known category.
     * Can be called repeatedly (Online Learning).
     */
    public train(text: string, categoryId: string): void {
        const tokens = this.tokenizer(text);
        if (tokens.length === 0) return;

        // Increment total samples
        this.totalSamples++;

        // Update category occurrence count
        this.categoryCounts.set(categoryId, (this.categoryCounts.get(categoryId) || 0) + 1);

        // Update word occurrences for this specific category
        if (!this.wordCounts.has(categoryId)) {
            this.wordCounts.set(categoryId, new Map());
        }
        const catWords = this.wordCounts.get(categoryId)!;

        for (const token of tokens) {
            this.vocabulary.add(token);
            catWords.set(token, (catWords.get(token) || 0) + 1);
        }
    }

    /**
     * Predict the most likely category for a given text.
     * Returns the category ID and the normalized confidence score (0.0 to 1.0).
     */
    public predict(text: string): { categoryId: string | null; confidence: number } {
        if (this.categoryCounts.size === 0) return { categoryId: null, confidence: 0 };

        const tokens = this.tokenizer(text);
        if (tokens.length === 0) return { categoryId: null, confidence: 0 };

        const resultScores: { id: string; logProb: number }[] = [];
        const vocabSize = this.vocabulary.size;

        for (const [categoryId, categoryCount] of this.categoryCounts.entries()) {
            // P(Category) - Prior probability
            const priorLogProb = Math.log(categoryCount / this.totalSamples);

            let logLikelihood = 0;
            const catWords = this.wordCounts.get(categoryId) || new Map();

            // Total words recorded in this category
            let totalWordsInCategory = 0;
            for (const count of catWords.values()) {
                totalWordsInCategory += count;
            }

            for (const token of tokens) {
                const wordCountInCat = catWords.get(token) || 0;
                // P(Word | Category) with Laplace Smoothing
                const wordProb = (wordCountInCat + this.alpha) / (totalWordsInCategory + vocabSize * this.alpha);
                logLikelihood += Math.log(wordProb);
            }

            resultScores.push({
                id: categoryId,
                logProb: priorLogProb + logLikelihood
            });
        }

        if (resultScores.length === 0) return { categoryId: null, confidence: 0 };

        resultScores.sort((a, b) => b.logProb - a.logProb);

        const best = resultScores[0];

        // Calculate a pseudo-confidence score
        // We do softmax over the top 3 competitors to get a normalized confidence 0-1
        const topN = resultScores.slice(0, 3);
        const maxLogProb = topN[0].logProb; // Stabilize exponential

        let sumExp = 0;
        for (const sr of topN) {
            sumExp += Math.exp(sr.logProb - maxLogProb);
        }
        const confidence = Math.exp(best.logProb - maxLogProb) / sumExp;

        return {
            categoryId: best.id,
            confidence
        };
    }

    /**
     * Prevent vocabulary from growing infinitely and causing LocalStorage overflow.
     * Keeps only the top `maxVocabSize` most frequent words across all categories.
     */
    public prune(maxVocabSize: number): void {
        if (this.vocabulary.size <= maxVocabSize) return;

        // Calculate global frequency of each word
        const globalFrequencies = new Map<string, number>();
        for (const catWords of this.wordCounts.values()) {
            for (const [word, count] of catWords.entries()) {
                globalFrequencies.set(word, (globalFrequencies.get(word) || 0) + count);
            }
        }

        // Sort words by frequency (descending)
        const sortedWords = Array.from(globalFrequencies.entries()).sort((a, b) => b[1] - a[1]);

        // Take top N tokens
        const allowedWords = new Set(sortedWords.slice(0, maxVocabSize).map(entry => entry[0]));

        // Rebuild vocabulary
        this.vocabulary = allowedWords;

        // Clean up wordCounts for each category
        for (const catWords of this.wordCounts.values()) {
            for (const word of Array.from(catWords.keys())) {
                if (!allowedWords.has(word)) {
                    catWords.delete(word);
                }
            }
        }
    }

    /**
     * Export the learned model to a plain JS object for localStorage.
     */
    public export(): NaiveBayesSnapshot {
        const exportedWordCounts: Record<string, Record<string, number>> = {};
        for (const [catId, map] of this.wordCounts.entries()) {
            exportedWordCounts[catId] = Object.fromEntries(map);
        }

        return {
            categoryCounts: Object.fromEntries(this.categoryCounts),
            wordCounts: exportedWordCounts,
            vocabulary: Array.from(this.vocabulary),
            totalSamples: this.totalSamples
        };
    }

    /**
     * Restore the model from a previous state.
     */
    public import(snapshot: NaiveBayesSnapshot): void {
        this.categoryCounts = new Map(Object.entries(snapshot.categoryCounts));

        this.wordCounts = new Map();
        for (const [catId, wordsObj] of Object.entries(snapshot.wordCounts)) {
            this.wordCounts.set(catId, new Map(Object.entries(wordsObj)));
        }

        this.vocabulary = new Set(snapshot.vocabulary);
        this.totalSamples = snapshot.totalSamples;
    }
}
