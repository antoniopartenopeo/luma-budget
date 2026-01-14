# Regression Map

> "Trust, but verify."

## 1. Transaction Detail & Editing

### Scenario 1.1: Transaction Detail Sheet (Mobile)
- [ ] **Setup**: Viewport < 768px (Mobile Chrome simulation).
- [ ] **Action**: Tap on any transaction row.
- [ ] **Expectation**:
    - Sheet opens from bottom (or right if configured).
    - Sheet occupies ~90% height or full height.
    - Title is visible.
    - "Salva" button is visible without scrolling OR sticks to bottom.
    - Tapping "Back" (native) or Background closes sheet.

### Scenario 1.2: Dirty State Protection
- [ ] **Setup**: Open Transaction Edit form.
- [ ] **Action**: Change "Amount" from 10.00 to 99.00.
- [ ] **Action**: Try to close Sheet (click X or background).
- [ ] **Expectation**:
    - UI **BLOCKS** closing immediately? OR
    - UI Closes but shows Toast "Modifiche salvate"? (Dipende da policy, verificare implementation default).
    - *Ideal Goal*: Confirm dialog if changes are complex, otherwise auto-save draft? -> **Current App Policy**: Explicit Save Required.
    - **Pass criteria**: If changes are not saved, re-opening shows original value.

### Scenario 1.3: Switch w/ Unsaved Changes (Tablet/Desktop)
- [ ] **Setup**: Desktop view. Click Transaction A.
- [ ] **Action**: Edit Description "Test". DO NOT SAVE.
- [ ] **Action**: Click Transaction B.
- [ ] **Expectation**:
    - Transaction B details load.
    - Re-clicking Transaction A shows ORIGINAL description (unless draft saved in state).
    - NO crash or mixed data (e.g. Desc A on Trans B).

## 2. Core Data Integrity

### Scenario 2.1: Delete Transaction
- [ ] **Action**: Delete transaction via menu.
- [ ] **Expectation**:
    - Removed from list instantly.
    - "Total Expenses" KPI decreases exactly by transaction amount.
    - Refresh page -> Transaction still gone.

### Scenario 2.2: Float Entry Resistance
- [ ] **Action**: In "Amount" field, type/paste "12.345".
- [ ] **Expectation**:
    - Field formats to "12,34 €" or "12.345,00 €" (depends on locale).
    - internal value saved as integers.
    - NO `NaN` displayed.

## 3. Responsive Layout

### Scenario 3.1: Mobile Fullscreen Behavior
- [ ] **Action**: Open Settings.
- [ ] **Expectation**:
    - No horizontal scrollbar on body.
    - Tabs (if present) are scrollable horizontally or stacked.
    - Bottom Navigation (if present) is not covered by browser chrome.

### Scenario 3.2: Export Feature
- [ ] **Action**: Filters Active (e.g. "Last Month"). Click Export.
- [ ] **Expectation**:
    - Downloaded CSV/JSON contains ONLY filtered items.
    - Dates are readable.
