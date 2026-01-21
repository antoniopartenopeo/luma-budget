---
name: luma-governance
description: Use this skill when working on Luma Budget codebase. Enforces financial logic rules, UI standards, and code organization patterns. Activate when modifying transactions, calculations, currency handling, or creating new components.
---

# Luma Budget Development Standards

This skill governs all development on Luma Budget application.

## Goal

Ensure consistent, safe, and maintainable code by enforcing financial logic rules, UI patterns, and code organization standards.

## Instructions

### 1. Financial Logic (CRITICAL - Never Skip)

Before writing any code that handles money:

1. **Never use `parseFloat` on monetary values** - Store and calculate in integer cents
2. **Use centralized domain logic**:
   ```typescript
   // Import from domain/money
   import { sumExpensesInCents, sumIncomeInCents, calculateSharePct, calculateUtilizationPct } from "@/domain/money"
   
   // Import from domain/money/currency
   import { formatCents, parseCurrencyToCents } from "@/domain/money"
   
   // Import from domain/transactions
   import { getSignedCents, normalizeTransactionAmount } from "@/domain/transactions"
   ```
3. **Transaction & Budget amounts**: Always use `amountCents` (integer). For budgets, use `globalBudgetAmountCents` and `amountCents` for groups.
4. **Sign convention**: `getSignedCents()` returns positive for income, negative for expense
5. **UI Tones & Calculations**: Use `@/features/dashboard/utils/kpi-logic` for consistent KPI colors (Tones) and percentages.

### 2. UI Component Patterns

When creating or modifying UI components:

1. **Overlays**:
   - `Sheet` → Complex forms, mobile-friendly edit views
   - `Dialog` → Quick confirmations, simple forms
   - `AlertDialog` → Destructive actions (delete, reset)
   - **Consistency**: Standardize custom overlays with `DialogContent` where possible.

2. **Page Structure**:
   ```tsx
   <div className="container mx-auto p-4 md:p-8 space-y-8">
     <div className="flex items-center justify-between">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">Title</h1>
         <p className="text-muted-foreground mt-1">Subtitle</p>
       </div>
       {/* Actions */}
     </div>
     {/* Content */}
   </div>
   ```

3. **Styling Rules**:
   - Use ONLY Tailwind CSS classes
   - No inline styles
   - No arbitrary values like `[13px]`
   - Spacing scale: `gap-1`, `gap-2`, `gap-4`, `gap-6`, `gap-8`

### 3. UBI (Unitary/Unified Behavioral Interface)

UBI ensures the same UI structure works across all devices without branching.

**Core Principles**:
1. **Same UI tree** – One structure that adapts, never duplicates
2. **CSS-only responsiveness** – Use Tailwind breakpoints, never `if (isMobile)`
3. **Density over structure** – Change spacing/sizing, not components
4. **Semantic consistency** – Click/tap produces the same effect everywhere

**Rules**:

| # | Rule | Pattern |
|---|------|--------|
| 1 | **Overlay Universale** | Use `Sheet` for detail/edit, `Dialog` for wizards. Never create `*Mobile` variants. |
| 2 | **State Before Routes** | UI transitions (view→edit, step 1→2) use `useState`, not navigation. |
| 3 | **CSS Responsiveness Only** | Use `hidden md:block`, `flex-col md:flex-row`. Never `useMediaQuery` for render branching. |
| 4 | **Flex Column Layout** | For scrollable fixed-height containers: `flex flex-col h-full` + `shrink-0` header/footer + `flex-1 overflow-y-auto min-h-0` body. |
| 5 | **Progressive Disclosure** | Use `Accordion`/`Tabs` to reveal info. Never move content to separate "mobile pages". |
| 6 | **Reuse Across Contexts** | Same component works inline AND in overlay (e.g., `<Sidebar>` in layout and Sheet). |
| 7 | **Density Adaptation** | Use `p-4 md:p-8`, `text-sm md:text-base`. Never remove elements for mobile. |
| 8 | **Info Hiding Threshold** | Hide secondary info with `hidden md:block`, not separate components. |
| 9 | **Confirm Patterns** | Use centralized `ConfirmDialog` for destructive actions. |
| 10 | **No Device Branching** | Never create `ComponentMobile.tsx` / `ComponentDesktop.tsx`. |

**Flex Layout Template**:
```tsx
<div className="flex flex-col h-full">
  <div className="shrink-0 border-b">Header</div>
  <div className="flex-1 overflow-y-auto min-h-0">Scrollable Content</div>
  <div className="shrink-0 border-t">Footer</div>
</div>
```

**Reference**: See `docs/audits/UBI_UI_ANALYSIS.md` for detailed analysis.

### 4. Code Organization

1. **Feature modules** in `src/features/[feature]/`:
   - `api/` → Repository + React Query hooks
   - `components/` → Feature-specific UI
   - `utils/` → Feature-specific logic
   - `__tests__/` → All tests

2. **Domain Layer** in `src/domain/[domain-name]/`:
   - Core financial logic, types, and pure utils.
   - `money/` → Math, parsing, currency formatting.
   - `transactions/` → Model normalization, signed cents logic.
   - `categories/` → Category definitions and mapping.

3. **Shared code**:
   - `src/lib/` → Generic utilities (`storage.ts`, `date-ranges.ts`)
   - `src/components/ui/` → Radix/shadcn primitives
   - `src/components/patterns/` → Higher-level reusable patterns (ConfirmDialog, KpiCard)

4. **Filtering & Dates**:
   - Always use `filterByRange` from `@/lib/date-ranges.ts` for consistency in period-based filtering.

### 5. Git & Test Workflow

Before committing:

1. Create branch from `origin/main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/my-feature
   ```

2. **Test Integrity**:
   - **Import Production Logic**: NEVER rewrite or simulate math/logic in tests. Import the actual utility (e.g., `calculateSuperfluousMetrics`) to ensure tests validate the real system.
   - [ ] `npm run test` passes (specifically test the feature you modified)
   - [ ] No `console.log` in production code

3. Pre-push checklist:
   - [ ] `npm run build` passes

4. Commit message format:
   - `feat:` → New features
   - `fix:` → Bug fixes
   - `refactor:` → Code restructuring
   - `docs:` → Documentation

## Constraints

1. **NEVER** use `parseFloat()` on currency values
2. **NEVER** duplicate financial calculations - use `@/domain/money`
3. **NEVER** use inline styles - only Tailwind classes
4. **ALWAYS** use `getCategoryById()` for category lookups
5. **ALWAYS** use `filterByRange()` for period filtering
6. **NEVER** simulate production logic in tests - import from utils
7. **NEVER** use `useMediaQuery` or `if (isMobile)` for render branching - UBI forbids it
8. **NEVER** create `*Mobile.tsx` / `*Desktop.tsx` component variants
9. **ALWAYS** use `Sheet` for detail views, `Dialog` for wizards - same on all devices

## Examples

### Bad: Inline percentage calculation
```typescript
// ❌ WRONG
const percent = Math.round((spent / budget) * 100)
```

### Good: Use centralized function
```typescript
// ✅ CORRECT
import { calculateUtilizationPct } from "@/domain/money"
const percent = calculateUtilizationPct(spentCents, budgetCents)
```

### Bad: ParseFloat on money
```typescript
// ❌ WRONG
const amount = parseFloat(input.replace(/[€,]/g, ''))
```

### Good: Use currency utils
```typescript
// ✅ CORRECT
import { parseCurrencyToCents } from "@/domain/money"
const amountCents = parseCurrencyToCents(input)
```

## Lessons Learned

| Date | Issue | Root Cause | Prevention |
|------|-------|------------|------------|
| 2026-01-17 | Simulator 100x values | `formatEuroNumber` on cents | Use `formatCents` for cent values |
| 2026-01-18 | Duplicate calcs in Flash | Inline formulas | Always use `financial-math.ts` |
| 2026-01-21 | Fragile Tests | Simulated logic in mocks | Import production utils in tests |

---

## 🔄 Self-Update Protocol

**IMPORTANT**: This skill MUST be kept up to date. When any of the following happens:

1. **New rule defined** → Add to appropriate `Instructions` section
2. **Bug caused by pattern** → Add to `Lessons Learned` table
3. **New constraint needed** → Add to `Constraints` section
4. **New code pattern discovered** → Add to `Examples` section

### Update Procedure

1. Edit this `SKILL.md` file with the new rules
2. Update `CHANGELOG.md` with the changes (follow semver):
   - **MAJOR** (X.0.0): Breaking changes to existing rules
   - **MINOR** (1.X.0): New rules added
   - **PATCH** (1.0.X): Clarifications or typo fixes
3. Commit with message: `docs(skill): [description of change]`

### Version
**Current**: v1.3.0  
**Changelog**: 
- v1.3.0: Added UBI (Unitary/Unified Behavioral Interface) section with 10 rules. Added 3 new UBI constraints. Reference to `docs/audits/UBI_UI_ANALYSIS.md`.
- v1.2.0: Budget Cents migration. Centralized KPI Tones logic. Test Integrity rule (prohibits simulating logic in tests).
- v1.1.0: Migrated paths to Domain-Driven Architecture (`@/domain/*`). Consolidated financial logic rules. Added `@/components/patterns`.
- v1.0.0: Initial release.

