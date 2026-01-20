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
2. **Use centralized utilities**:
   ```typescript
   // Import from lib/financial-math.ts
   import { sumExpensesInCents, sumIncomeInCents, calculateSharePct, calculateUtilizationPct } from "@/lib/financial-math"
   
   // Import from lib/currency-utils.ts
   import { getSignedCents, formatCents, parseCurrencyToCents } from "@/lib/currency-utils"
   ```
3. **Transaction amounts**: Always use `amountCents` (integer) not `amount` (string)
4. **Sign convention**: `getSignedCents()` returns positive for income, negative for expense

### 2. UI Component Patterns

When creating or modifying UI components:

1. **Overlays**:
   - `Sheet` → Complex forms, mobile-friendly edit views
   - `Dialog` → Quick confirmations, simple forms
   - `AlertDialog` → Destructive actions (delete, reset)

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

### 3. Code Organization

1. **Feature modules** in `src/features/[feature]/`:
   - `api/` → Repository + React Query hooks
   - `components/` → Feature-specific UI
   - `utils/` → Feature-specific logic
   - `__tests__/` → All tests

2. **Shared code**:
   - `src/lib/` → Generic utilities
   - `src/components/ui/` → Radix/shadcn primitives
   - `src/features/categories/config.ts` → Category definitions

3. **Category handling**:
   ```typescript
   import { getCategoryById, getCategoryIcon } from "@/features/categories/config"
   import { CategoryIcon } from "@/features/categories/components/category-icon"
   ```

### 4. Git Workflow

Before committing:

1. Create branch from `origin/main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/my-feature
   ```

2. Pre-push checklist:
   - [ ] `npm run build` passes
   - [ ] `npm run test` passes  
   - [ ] No `console.log` in production code

3. Commit message format:
   - `feat:` → New features
   - `fix:` → Bug fixes
   - `refactor:` → Code restructuring
   - `docs:` → Documentation

## Constraints

1. **NEVER** use `parseFloat()` on currency values
2. **NEVER** duplicate financial calculations - use `lib/financial-math.ts`
3. **NEVER** use inline styles - only Tailwind classes
4. **ALWAYS** use `getCategoryById()` for category lookups
5. **ALWAYS** run tests before committing

## Examples

### Bad: Inline percentage calculation
```typescript
// ❌ WRONG
const percent = Math.round((spent / budget) * 100)
```

### Good: Use centralized function
```typescript
// ✅ CORRECT
import { calculateUtilizationPct } from "@/lib/financial-math"
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
import { parseCurrencyToCents } from "@/lib/currency-utils"
const amountCents = parseCurrencyToCents(input)
```

## Lessons Learned

| Date | Issue | Root Cause | Prevention |
|------|-------|------------|------------|
| 2026-01-17 | Simulator 100x values | `formatEuroNumber` on cents | Use `formatCents` for cent values |
| 2026-01-18 | Duplicate calcs in Flash | Inline formulas | Always use `financial-math.ts` |
| 2026-01-14 | Contaminated branch | Created from HEAD | Always branch from `origin/main` |
