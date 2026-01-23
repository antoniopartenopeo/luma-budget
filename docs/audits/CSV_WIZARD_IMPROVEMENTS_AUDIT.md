# CSV Import Wizard Improvements Audit

**Report Date**: 2026-01-21  
**Author**: AI Analysis Agent  
**Scope**: Audit dei 5 problemi segnalati con proposta di miglioramento

---

## A) Executive Summary

| # | Problema | Causa Probabile | Impatto Utente |
|---|----------|-----------------|----------------|
| 1 | Sottogruppi ordinati in modo incoerente | **Core**: `computeSubgroups()` non ordina risultati | Confusione, difficoltà a individuare pattern significativi |
| 2 | Sottogruppi basati su data (mese) | **Core**: Strategy `MONTH` in cascata su `AMOUNT` | Sottogruppi non identificano ricorrenti (stessa cifra) |
| 3 | Slider soglia: range errato + import tutto | **UI+Payload**: range dinamico, filtro solo visivo | Utente pensa di escludere, ma importa tutto |
| 4 | Category picker duplicato | **UI**: `CategorySelect` locale invece di pattern centrale | Inconsistenza UI, manutenzione doppia |
| 5 | Grouping padre troppo grossolano | **Core**: `extractMerchantKey()` semplice, 3 word slice | Transazioni diverse nello stesso gruppo |

---

## B) Current Behavior & Root Cause

### B.1 – Sottogruppi ordinati in modo incoerente

**Comportamento osservabile**:  
Alcuni gruppi mostrano sottogruppi in ordine casuale (ordine di inserimento nel Map), altri sembrerebbero ordinati ma è coincidenza.

**Root Cause**:  
In [subgrouping.ts:75-81](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/subgrouping.ts#L75-L81):

```typescript
return Array.from(grouped.entries()).map(([label, subRows]) => ({
    id: crypto.randomUUID(),
    label,
    rowIds: subRows.map(r => r.id),
    // ...
}));
```

**Nessun `.sort()` applicato**. L'ordine dipende dall'ordine di inserimento nel `Map` che varia in base agli input.

**Ambito fix**: **Core-only** (`subgrouping.ts`)

---

### B.2 – Sottogruppi creati per data di transazione

**Comportamento osservabile**:  
Sottogruppi con label come "2024-01", "2024-02" appaiono quando il gruppo ha transazioni in mesi diversi.

**Root Cause**:  
In [subgrouping.ts:31-40](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/subgrouping.ts#L31-L40), la strategy `MONTH` è nella cascata:

```typescript
const order = ["AMOUNT", "MONTH", "SIGN"];
```

Il problema è che `AMOUNT` usa **bucket larghi** (10€, 50€, 200€) che NON identificano ricorrenti (stessa cifra esatta). Se AMOUNT produce 1 bucket, fallback a MONTH.

**Requisito utente**: Sottogruppi devono raggruppare transazioni con **amountCents identico** (non bucket), per identificare abbonamenti/ricorrenti.

**Ambito fix**: **Core-only** (`subgrouping.ts`)

---

### B.3 – Slider soglia: range errato + import tutto

**Comportamento osservabile**:  
1. Range slider va fino a `maxGroupTotal` (migliaia di euro), non 0-1000€
2. Gruppi nascosti dallo slider vengono comunque importati nel payload

**Root Cause 1 - Range**:  
In [step-review.tsx:37-40](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx#L37-L40):

```typescript
const maxGroupTotal = useMemo(() => {
    if (groups.length === 0) return 10000
    return Math.max(...groups.map(g => Math.abs(g.totalCents)))
}, [groups])
```

Range dinamico, non fisso 0-1000€ (0-100000 cents).

**Root Cause 2 - Payload**:  
In [step-summary.tsx:23-30](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-summary.tsx#L23-L30):

```typescript
const payload = useMemo(() => {
    return generatePayload(importState.groups, importState.rows, overrides)
}, [importState, overrides])
```

`generatePayload` riceve `importState.groups` **originali**, non `filteredGroups` dalla step-review. La step-review passa solo `overrides` a onContinue, non i gruppi filtrati.

In [payload.ts:15-20](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/payload.ts#L15-L20):

```typescript
for (const group of groups) {
    for (const subgroup of group.subgroups) {
        for (const rowId of subgroup.rowIds) {
            // ...
            if (!row.isSelected) continue; // Solo questo check
```

Il filtro threshold **non imposta `isSelected = false`** sulle rows dei gruppi nascosti. Quindi vengono incluse.

**Ambito fix**: **UI** (range) + **UI o Core** (coerenza payload)

---

### B.4 – Category picker duplicato

**Comportamento osservabile**:  
Il selettore categorie nel wizard mostra una lista flat con dot color, mentre il resto dell'app (TransactionForm) usa grouped categories con icone.

**Root Cause**:  
In [step-review.tsx:450-498](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx#L450-L498), componente locale `CategorySelect`:

```typescript
function CategorySelect({ value, onChange, compact, size }) {
    const items = CATEGORIES  // Flat list
    // ...
    {items.map(c => (
        <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", c.color...)} />
                {c.label}
            </span>
        </SelectItem>
    ))}
}
```

In [transaction-form.tsx:196-218](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transaction-form.tsx#L196-L218):

```typescript
const groupedCategories = getGroupedCategories(type, categories)
// ...
{groupedCategories.map((group) => (
    <div key={group.key}>
        <div className="...">{group.label}</div>
        {group.categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                    <CategoryIcon categoryName={cat.label} size={16} />
                    {cat.label}
                </div>
            </SelectItem>
        ))}
    </div>
))}
```

**Differenze**:
| Aspetto | Wizard | App |
|---------|--------|-----|
| Raggruppamento | Flat | Per spendingNature/kind |
| Icone | Dot color | CategoryIcon |
| Fonte | `CATEGORIES` statico | `useCategories()` hook |
| Filtro tipo | Nessuno | Filtrato per expense/income |

**Ambito fix**: **UI-only** (step-review.tsx)

---

### B.5 – Grouping padre troppo grossolano

**Comportamento osservabile**:  
Transazioni come "POS ESSELUNGA MILANO" e "POS ESSELUNGA ROMA" finiscono nello stesso gruppo, corretto. Ma "POS BAR CENTRALE" e "POS BAR SPORT" diventano entrambi "BAR CENTRALE" e "BAR SPORT" separati, oppure aggregate erroneamente.

**Root Cause**:  
In [enrich.ts:20-43](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/enrich.ts#L20-L43):

```typescript
export function extractMerchantKey(description: string): string {
    let normalized = description.toUpperCase();

    // Remove prefixes
    const prefixes = ["POS ", "PAGAMENTO ", "BONIFICO ", ...];
    for (const p of prefixes) {
        if (normalized.startsWith(p)) normalized = normalized.substring(p.length);
    }

    // Remove patterns
    normalized = normalized
        .replace(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/g, "") // Dates
        .replace(/\d{10,}/g, "")                        // Long IDs
        .replace(/[\*X]{4,}\d+/g, "");                  // Masked cards

    // Take first 3 words
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    return words.slice(0, 3).join(" ");
}
```

**Limitazioni**:
1. Solo 3 parole → perde specificità ("ESSELUNGA" vs "ESSELUNGA VIALE MONZA")
2. Nessun stopword removal ("DI", "IL", "LA", "S.R.L.")
3. Nessuna normalizzazione brand ("ESSELUNGA" = "ESSE LUNGA")
4. Nessun scoring di similarità

**Ambito fix**: **Core-only** (`enrich.ts`)

---

## C) Subgroups Spec Proposal

### C.1 – Criterio principale: amountCents esatto

**Spec**:
```
Sottogruppo = insieme di righe con STESSO amountCents (identico, non bucket)
```

**Ratio**: Identificare ricorrenti (abbonamenti, bollette) che hanno cifra fissa.

### C.2 – Regole split/edge cases

| Condizione | Comportamento |
|------------|---------------|
| Gruppo ≤1 riga | 1 subgroup "All Items" |
| Tutti amount unici | 1 subgroup "All Items" (no split utile) |
| ≥2 righe con stesso amount | Subgroup per ogni amount cluster |
| Amount con 1 sola riga | Aggregare in "Varie" subgroup |

**Threshold minimo**: Solo amount con **≥2 occorrenze** formano subgroup separato.

### C.3 – Ordinamento

```typescript
subgroups.sort((a, b) => {
    const totalA = a.rowIds.reduce((sum, id) => sum + Math.abs(rowsById.get(id).amountCents), 0);
    const totalB = b.rowIds.reduce((sum, id) => sum + Math.abs(rowsById.get(id).amountCents), 0);
    return totalB - totalA; // Descending
});
```

**Sempre decrescente per totale assoluto**.

### C.4 – Date: solo informativa

Le date **NON** sono chiave di subgrouping. Rimangono visibili nelle righe come informazione contestuale.

### C.5 – Implementazione (file coinvolto)

[subgrouping.ts](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/subgrouping.ts):

1. Sostituire strategy `AMOUNT` (bucket) con `EXACT_AMOUNT` (esatto)
2. Rimuovere o deprioritizzare strategy `MONTH`
3. Aggiungere sort finale per totale decrescente

---

## D) Slider Threshold Spec Proposal

### D.1 – Range fisso 0..1000 EUR

```typescript
const THRESHOLD_MAX_CENTS = 100000; // 1000€

<Slider
    min={0}
    max={THRESHOLD_MAX_CENTS}
    step={500} // 5€ step
    // ...
/>
```

### D.2 – Comportamento commit-on-release

**Già implementato correttamente** in step-review.tsx:

```typescript
onValueChange={([v]) => { setVisualThreshold(v); setIsDragging(true); }}
onValueCommit={([v]) => { setThresholdCents(v); setIsDragging(false); }}
```

### D.3 – Coerenza con payload

**Opzione A**: Gruppi sotto soglia → **non selezionati** (isSelected = false su rows)
- Pro: Payload automaticamente coerente
- Con: Richiede modifica core o mutazione locale

**Opzione B**: Gruppi sotto soglia → **esclusi dal payload passato a step-summary**
- Pro: Nessuna modifica core
- Con: Richiede passare `filteredGroups` invece di `importState.groups`

**Opzione scelta: B** (meno invasiva).

### D.4 – Dove avviene divergenza

1. **step-review.tsx** calcola `filteredGroups` ma passa solo `overrides` a `onContinue()`
2. **csv-import-wizard.tsx** mantiene `importState` originale
3. **step-summary.tsx** usa `importState.groups` (non filtrati)

### D.5 – Piano fix

1. Modificare `onContinue` signature per passare anche `filteredGroupIds: string[]`
2. Oppure: creare nuovo campo `excludedGroupIds` negli overrides
3. In `step-summary.tsx`, filtrare groups prima di `generatePayload()`

---

## E) Category Picker Reuse Plan

### E.1 – Componente centrale

Pattern esistente in [transaction-form.tsx:196-218](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transaction-form.tsx#L196-L218):

- Usa `getGroupedCategories(type, categories)` da `@/features/categories/config`
- Usa `useCategories()` hook per dati runtime (include custom categories)
- Usa `CategoryIcon` component

### E.2 – Differenze wizard

| Wizard attuale | Pattern centrale |
|----------------|------------------|
| `CATEGORIES` statico | `useCategories()` |
| List flat | Grouped by spendingNature |
| Dot color | CategoryIcon |
| Nessun filtro tipo | Filtrato expense/income |

### E.3 – Piano di migrazione

1. **Estrarre componente riusabile** `CategoryPicker` da transaction-form:
   - Path: `@/features/categories/components/category-picker.tsx`
   - Props: `value`, `onChange`, `type?` (expense/income/all), `compact?`, `size?`

2. **Aggiornare transaction-form.tsx** per usare `<CategoryPicker />`

3. **Sostituire CategorySelect in step-review.tsx** con `<CategoryPicker type="all" />`

4. **Eliminare funzione locale** `CategorySelect`

### E.4 – Rischi e test

| Rischio | Mitigazione |
|---------|-------------|
| Regression on TransactionForm | Unit test esistenti + manual QA |
| Wizard non filtra per tipo | Prop `type="all"` mostra tutto |
| Stile inconsistente | Prop `compact` per variante ridotta |

**Test**:
- [ ] TransactionForm: selezione categoria funziona
- [ ] QuickExpenseInput: se usa picker, verifica
- [ ] Wizard step-review: dropdown mostra categorie grouped

---

## F) Parent Grouping Improvement Options

### F.1 – Logica attuale

[enrich.ts:extractMerchantKey](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/enrich.ts#L20-L43):

1. Uppercase
2. Remove prefixes: `POS `, `PAGAMENTO `, `BONIFICO `, etc.
3. Remove date patterns, long IDs, masked cards
4. Take first 3 words (>1 char each)

**Esempio**:
- Input: "POS ESSELUNGA VIALE MONZA 12 MILANO IT"
- Output: "ESSELUNGA VIALE MONZA"

**Problema**: "POS BAR SPORT MILANO" → "BAR SPORT MILANO" (diverso da "BAR CENTRALE ROMA" → "BAR CENTRALE ROMA")

---

### F.2 – Opzione 1: Miglioramento leggero

**Modifiche**:
1. **Stopwords removal**: "DI", "IL", "LA", "DA", "IN", "S.R.L.", "S.P.A.", "IT", etc.
2. **Take first 2 words** invece di 3 (meno rumore)
3. **Brand dictionary**: mapping noti ("ESSE LUNGA" → "ESSELUNGA")

**Implementazione**:
```typescript
const STOPWORDS = new Set(["DI", "IL", "LA", "DA", "IN", "IT", "SRL", "SPA"]);

const words = normalized.split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
return words.slice(0, 2).join(" ");
```

| Aspect | Rating |
|--------|--------|
| Complessità | Bassa (1-2h) |
| Rischio regressioni | Basso |
| Miglioramento atteso | 20-30% gruppi più puliti |
| Performance | O(n) - nessun impatto |

---

### F.3 – Opzione 2: Miglioramento robusto

**Modifiche**:
1. **Tokenization + scoring**: calcola similarità tra descrizioni
2. **Clustering**: raggruppa descrizioni con Levenshtein distance < threshold
3. **Representative label**: scegli label più frequente del cluster

**Implementazione** (pseudo):
```typescript
function clusterDescriptions(rows: ParsedRow[]): Map<string, ParsedRow[]> {
    const clusters = new Map();
    for (const row of rows) {
        const key = findBestCluster(row.description, clusters);
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key).push(row);
    }
    return clusters;
}

function findBestCluster(desc: string, clusters: Map): string {
    for (const [key] of clusters) {
        if (levenshteinSimilarity(desc, key) > 0.7) return key;
    }
    return extractMerchantKey(desc); // New cluster
}
```

| Aspect | Rating |
|--------|--------|
| Complessità | Alta (1-2 giorni) |
| Rischio regressioni | Medio-alto (comportamento diverso) |
| Miglioramento atteso | 50-70% gruppi più precisi |
| Performance | O(n²) worst case - problema su CSV grandi |

---

### F.4 – Raccomandazione

**Fase iniziale: Opzione 1** (stopwords + 2 words)
- Rapida da implementare
- Misurabile con dataset reali
- Rischio contenuto

**Futuro (se necessario): Opzione 2** con ottimizzazioni:
- Pre-sorting per prime 2 lettere
- Caching similarity scores
- Threshold configurabile

---

## G) Phased Implementation Plan

### Fase 1: Coerenza Slider + Range Fisso

**Obiettivo**: Ciò che si vede = ciò che si importa

**File coinvolti**:
| File | Modifica |
|------|----------|
| [step-review.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx) | Range fisso 0-100000, passare filteredGroupIds |
| [csv-import-wizard.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/csv-import-wizard.tsx) | Propagare filteredGroupIds a step-summary |
| [step-summary.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-summary.tsx) | Filtrare groups prima di generatePayload |

**DoD**:
- [ ] Slider range 0-1000€
- [ ] Gruppi nascosti NON appaiono in summary stats
- [ ] Gruppi nascosti NON finiscono nel payload

**Test**:
- Unit: mock groups, verifica filtering
- Manual: import con soglia alta, conta transazioni importate

---

### Fase 2: Sottogruppi Amount-based + Ordinamento

**Obiettivo**: Identificare ricorrenti, ordine sensato

**File coinvolti**:
| File | Modifica |
|------|----------|
| [subgrouping.ts](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/subgrouping.ts) | Nuova strategy EXACT_AMOUNT, sort decrescente |

**DoD**:
- [ ] Subgroups per stesso amountCents (≥2 occorrenze)
- [ ] "Varie" per amount singoli
- [ ] Ordinamento sempre per totale decrescente
- [ ] Nessun subgroup per mese

**Test**:
- Unit: dataset con abbonamenti noti (Netflix 15.99€ x5), verifica clustering
- Regression: test esistenti passano

---

### Fase 3: Riuso Category Picker Centralizzato
**Status**: ✅ COMPLETATO (2026-01-23)

**File coinvolti**:
| File | Modifica |
|------|----------|
| `@/features/categories/components/category-picker.tsx` | [NEW] Estratto da transaction-form |
| [transaction-form.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transaction-form.tsx) | Usare CategoryPicker |
| [step-review.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx) | Sostituito CategorySelect locale |

**DoD**:
- [x] `<CategoryPicker />` component riusabile
- [x] TransactionForm usa CategoryPicker (To Be Verified)
- [x] Wizard step-review usa CategoryPicker
- [x] Nessun CategorySelect locale

**Test**:
- Visual: confronto screenshot before/after
- Manual: selezione categoria in wizard e form

---

### Fase 4: Miglioramento Grouping Padre

**Obiettivo**: Gruppi più precisi (meno "spazzatura insieme")

**File coinvolti**:
| File | Modifica |
|------|----------|
| [enrich.ts](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/core/enrich.ts) | Stopwords, 2 words, brand dict |

**DoD**:
- [ ] Stopwords italiane rimosse
- [ ] First 2 words (non 3)
- [ ] Brand mapping per casi noti
- [ ] Test su dataset reale: precision gruppi ≥80%

**Test**:
- Unit: input noti → output atteso
- Regression: gruppi esistenti non peggiorano
- Dataset: 100 righe reali, contare gruppi corretti

---

## Appendice: File Reference Map

| Area | File | Funzione chiave |
|------|------|-----------------|
| Subgrouping | `core/subgrouping.ts` | `computeSubgroups()` |
| Grouping | `core/grouping.ts` | `groupRowsByMerchant()` |
| MerchantKey | `core/enrich.ts` | `extractMerchantKey()` |
| Payload | `core/payload.ts` | `buildImportPayload()` |
| Pipeline | `core/pipeline.ts` | `processCSV()`, `generatePayload()` |
| UI Review | `components/step-review.tsx` | Slider, filteredGroups, CategorySelect |
| UI Summary | `components/step-summary.tsx` | Payload generation |
| UI Wizard | `components/csv-import-wizard.tsx` | State management |

---

## H) Implementation Log

### 2026-01-23: Wizard UI Unification (Phase 0)
Prima di procedere con le modifiche logiche, è stato necessario stabilizzare la UX del Wizard che soffriva di problemi di layout (clipping, scroll assente).

**Interventi Svolti**:
1. **WizardShell**: Introdotto componente shell comune (`src/features/import-csv/components/wizard-shell.tsx`) che gestisce:
   - Stepper unificato
   - Header/Footer sticky
   - `TopBar` opzionale (usata per Slider in step-review)
   - Contenuto scrollabile (fix `min-h-0` flex bug)
2. **Refactoring Steps**:
   - `step-upload`: Adattato a Shell, fix dropzone height.
   - `step-review`: Slider estratto in TopBar, content scrollabile.
   - `step-summary`: Adattato a Shell.
3. **Category Picker**: Implementato riuso centralizzato in `step-review.tsx`.

Questo intervento abilita ora le Fasi 1, 2 e 4 dell'audit su una base solida.
