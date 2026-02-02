# ADR 005: Semantic Shift from "Budgeting" to "Rhythm"

## Status
Accepted

## Context
Fixed "Budgeting" concepts often create anxiety and are perceived as restrictive. Numa aims to be a "Financial Pilot", providing guidance rather than just limits. 

## Decision
We are transitioning the user-facing language from "Budget" to "Rhythm" (Ritmo) or "Path" (Percorso).
- "Over Budget" -> "Elevated Rhythm" (Ritmo Accelerato)
- "Budget Goal" -> "Ideal Path" (Percorso Ideale)
- "Spike" -> "Acceleration" (Accelerazione)

## Consequences
- The narration layer must be updated to use these terms.
- UI labels should reflect the "Guiding" nature of the tool.
- Internal logic still uses `amountCents` and mathematical thresholds, but the *explanation* is human-centric.
