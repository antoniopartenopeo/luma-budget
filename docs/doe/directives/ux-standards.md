# UX Standards & Contracts

> "Consistency is the bedrock of trust."

## 1. Page Title Contract (Structure)
**Rule**: Every main page MUST follow this DOM structure.
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
- **H1**: `text-3xl font-bold tracking-tight` (Desktop), `text-2xl` (Mobile).
- **Subtitle**: `text-muted-foreground` + `mt-1`.
- **Top Padding**: `p-4` (Mobile) -> `p-8` (Desktop).

## 2. Spacing Scale (Tailwind)
**Rule**: Use ONLY these values. Custom arbitrary values (e.g., `not-[13px]`) are banned.
- **Micro**: `gap-1` (4px), `gap-2` (8px).
- **Component**: `gap-4` (16px), `p-4` (16px).
- **Section**: `gap-6` (24px), `gap-8` (32px).
- **Layout**: `py-6` or `py-10`.

## 3. Interaction Patterns

### Modali (Dialog/Sheet)
**Rule**: Use `Sheet` for complex forms on mobile, `Dialog` for confirmations.
- **Footer Placement**:
  - `SheetFooter` -> `mt-auto` (Sticks to bottom on mobile).
  - Button Order: `[Cancel/Ghost] [Spacer] [Action/Primary]`.

### Alerts
**Rule**: Use `Alert` mainly for errors or warnings, `Toaster` for transient success.
- **Error**: `variant="destructive"`
- **Icon**: Always include icon (e.g. `AlertCircle`).

### Dirty State
**Rule**: Components with unsaved changes MUST:
1. Prevent tab closing (optional browser API).
2. Show visual indicator on "Save" button (e.g. not disabled, or specific label).
3. If navigating away via client-router, prompt confirmation.
