# Project Brief

scope: project-brief
owner: engineering
status: active
last-verified: 2026-04-28
canonical-of: project-brief

## Product

Numa Budget is a local-first personal finance app built around calm financial guidance, deterministic narration, rhythm-based planning, and a public trust surface that explains the product before asking for commitment.

## Problem

Most budgeting tools feel punitive, fragmented, or too dependent on remote services. Numa aims to make financial review understandable, private, and actionable without forcing cloud-first behavior.

## Primary User

- Individuals who want a clear picture of spending, trends, and upcoming financial pressure
- Users who prefer local ownership of financial data and predictable UI behavior

## Outcomes

- Understand spending and balance dynamics quickly
- Import and normalize transaction history safely
- Understand the first product promise from the public landing without account creation, bank connection, or technical jargon
- Explore future scenarios without mutating live data accidentally
- Receive guidance in calm, human language rather than punitive budget copy

## In Scope

- Public landing, FAQ/privacy trust surfaces, dashboard, transactions, import CSV, insights, simulator, settings, updates, privacy, and local neural core
- Local-first persistence with backup and restore
- Deterministic narration and governance-enforced semantics
- Optional native shells for mobile and Mac

## Out of Scope by Default

- Server-authoritative financial state
- Open banking enabled by default in production runtime
- Simulator flows that commit scenario output directly into transaction history
