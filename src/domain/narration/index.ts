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
export * from "./types"
export * from "./snapshot.narrator"
export * from "./kpi.narrator"
export * from "./derive-state"
