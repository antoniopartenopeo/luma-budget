/**
 * Domain Narration Layer
 * ======================
 * 
 * Pure functions for generating user-facing narrative text.
 * Based on Narration Contract v1.
 */

// Types
export type { NarrationResult, SnapshotFacts, SnapshotState } from "./types"

// Snapshot (Flash Summary)
export { narrateSnapshot } from "./snapshot.narrator"
export { deriveSnapshotState } from "./derive-state"
