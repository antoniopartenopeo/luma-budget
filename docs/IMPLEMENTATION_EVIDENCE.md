# IMPLEMENATION EVIDENCE: CSV Import Wizard

**Status:** Product Ready (UI)
**Modules:** Core Logic + UI Wizard + Integration

## 1. File Inventory
| Module | File | Purpose |
|--------|------|---------|
| **Core** | `src/features/import-csv/core/**` | Pure logic (Parse/Normalize/Enrich/Group/Pipeline) |
| **Logic Types** | `types.ts` | Shared models (ImportState, EnrichedRow, etc.) |
| **UI Orchestrator** | `components/csv-import-wizard.tsx` | Dialog implementation, step state machine. |
| **Step 1: Upload** | `components/step-upload.tsx` | **[NEW]** File Input + Text Paste Tabs. FileReader API. |
| **Step 2: Review** | `components/step-review.tsx` | **[UPDATED]** Consultant Advice (Alerts), Bulk Categorization. |
| **Step 3: Summary** | `components/step-summary.tsx` | KPI stats, final confirmation stub. |
| **Integration** | `app/transactions/page.tsx` | Entry point in `PageHeader`. |

## 2. Key Implementation Snippets

### A. Dual Input Mode (Upload / Paste) - `step-upload.tsx`
Demonstrates use of generic `Tabs` and `FileReader` for client-side processing without server upload.
```tsx
<Tabs defaultValue="upload">
    <TabsList>
        <TabsTrigger value="upload">Upload File</TabsTrigger>
        <TabsTrigger value="paste">Incolla Testo</TabsTrigger>
    </TabsList>
    <TabsContent value="upload">
       <input type="file" onChange={handleFileChange} />
       {/* Visual Card with Drag & Drop styling */}
    </TabsContent>
    {/* ... */}
</Tabs>
```

### B. Consultant Logic - `step-review.tsx`
Adaptive feedback based on user progress, reducing anxiety.
```tsx
{completionPercent < 50 ? (
    <Alert>
        <Info />
        <AlertTitle>Consiglio Rapido</AlertTitle>
        <AlertDescription>Non devi classificare tutto ora...</AlertDescription>
    </Alert>
) : ( ... )}
```

### C. Entry Point Integration - `transactions/page.tsx`
Clean integration using the DOE `PageHeader` actions slot.
```tsx
<PageHeader
    title="Transazioni"
    actions={<CsvImportWizard />}
/>
```

## 3. Verification Checklist
Use this to manually verify the UI behavior:

- [ ] **Entry Point**: Is the "Importa CSV" button visible in Transactions page header?
- [ ] **Dialog**: Does clicking it open the Modal centered?
- [ ] **Tab Switching**: Can you switch between "Upload File" and "Incolla Testo"?
- [ ] **File Read**: Does selecting a CSV file populate the preview (or error)?
- [ ] **Flow**: Can you proceed to "Revisione Rapida"?
- [ ] **Categorization**: Do dropdowns work? Do stats update in the header?
- [ ] **Consultant**: Does the Alert box change message if you classify more items?
- [ ] **Completion**: Does "Conferma Import" show a success state/animation?
- [ ] **Responsive**: Does the layout break on mobile (check Sheet vs Dialog width)?

## 4. UI Fixes & Enhancements (Post-MVP)
- **Wizard Shell Unification**: Introduced `WizardShell` for a consistent, robust UI across all steps.
  - Resolved flexbox clipping issues with `min-h-0` and proper overflow handling.
  - Standardized Stepper, Header and Footer layout.
  - Implemented sticky `TopBar` pattern for the Threshold Slider in review step.
- **Category Drill-Down**: Added "Per Categoria" tab in `StepReview`, enabling:
  - Aggregate view of spending per category.
  - Drill-down accordion to see specific transactions (first 50) and identify outliers.
  - Consistent logic re-using `resolveCategory` and internal `overrides` state.
- **Category Picker Reuse**: Refactored `step-review.tsx` to use the shared `<CategoryPicker />` component, ensuring consistency with the Transaction Form.
- **Non-blocking Payload**: Updated `generatePayload` to default unassigned rows to:
  - `altro` (Expenses)
  - `entrate-occasionali` (Income)
  - Instead of throwing errors, preventing blocking bugs when user skips categorization.

## 6. Real Persistence (P0 Fix)
- **Atomic Batch Import**: Implemented `createBatchTransactions` in `repository.ts` to save all imported transactions in a single operation.
- **UX Truth**: Replaced fake success message with real async mutation state (`useCreateBatchTransactions`).
- **UI Refresh**: Automatically invalidates `transactions.all`, `dashboard.all`, and `transactions.recent` on success, ensuring the user sees the new data immediately upon return.

## 7. DOE Compliance
- **Components**: Reused `Button`, `Dialog`, `Select`, `Card`, `Tabs`, `Alert`, `Badge`, `Accordion`.
- **Tone**: Maintained friendly, non-blocking language ("Fotografia del passato").
- **Structure**: Feature folder isolation (`features/import-csv`).

## 6. Next Steps (Backend)
- Connect `step-summary.tsx` `handleConfirm` to real `useCreateBatchTransactions` mutation.
- Persist `ImportSummary` to DB if history definition is required.
