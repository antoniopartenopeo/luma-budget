---
name: numa-import-csv
description: Use when working on CSV import feature, transaction enrichment, merchant normalization, or category auto-assignment.
---

# Import CSV e Data Enrichment

Procedura operativa per lavorare sulla feature import CSV senza rompere i vincoli monetari e semantici.

---

## Guard di Attivazione

Se la skill non e attiva esplicitamente, fermati e chiedi conferma.

---

## Architettura corrente

```text
src/features/import-csv/
├── components/
│   ├── csv-import-wizard.tsx
│   ├── wizard-shell.tsx
│   ├── step-upload.tsx
│   ├── step-review.tsx
│   ├── step-summary.tsx
│   └── review/*
├── config/
│   └── bank-links.ts
└── core/
    ├── parse.ts
    ├── normalize.ts
    ├── dedupe.ts
    ├── enrich.ts
    ├── grouping.ts
    ├── subgrouping.ts
    ├── payload.ts
    ├── pipeline.ts
    ├── overrides.ts
    ├── filters.ts
    ├── types.ts
    └── merchant/
        ├── pipeline.ts
        ├── brand-dict.ts
        ├── normalizers.ts
        ├── payment-rails.ts
        ├── sub-merchant.ts
        ├── token-scorer.ts
        ├── fuzzy-matcher.ts
        └── overrides.ts
```

---

## Pipeline ufficiale

Entry point: `processCSV()` in `core/pipeline.ts`

Ordine vincolante:
1. `parseCSV` -> mappa colonne raw
2. `normalizeRows` -> date/amount/description in formato canonico
3. `detectDuplicates` -> confronto con transazioni esistenti
4. `enrichRows` -> merchant key + categoria suggerita
5. `groupRowsByMerchant` + `computeSubgroups`
6. `generatePayload` -> `CreateTransactionDTO[]` pronto per persistenza

---

## Regole monetarie

- Lavorare in `amountCents` integer signed nel core import.
- Parsing importi CSV via `parseCurrencyToCents()` (dominio money).
- Nessun `parseFloat` nei flussi import correnti.

---

## Merchant normalization (v3)

Funzione chiave: `extractMerchantKey(description)` in `core/merchant/pipeline.ts`.

Priorita:
1. override espliciti (`merchant/overrides.ts`)
2. estrazione payment rail e pulizia rumore
3. lookup `BRAND_DICT`
4. fuzzy match controllato
5. scoring token
6. fallback deterministico (`UNRESOLVED` / `ALTRO`)

Guardrail:
- output merchant key stabile e deterministico
- no euristiche random o dipendenti da UI

---

## Subgrouping

`computeSubgroups(group, rows)`:
- cluster per `amountCents` esatto
- pattern ricorrenti: >= 2 occorrenze
- singoli aggregati in `Varie` quando esistono subgroup ricorrenti
- fallback `Tutti` se non ci sono pattern

---

## Category suggestion

`enrichRows()` usa:
- storico utente (priorita 1)
- pattern rules da `@/domain/categories` (priorita 2)
- `null` quando non c e certezza

Override gerarchici (UI review step):
- livello `row`
- livello `subgroup`
- livello `group`

---

## Checklist pre-commit

- [ ] pipeline end-to-end invariata nell ordine ufficiale
- [ ] importi in `amountCents` (signed) senza conversioni floating duplicate
- [ ] merchant extraction deterministicamente testabile
- [ ] subgrouping coerente con regole ricorrenza
- [ ] payload finale compatibile con `CreateTransactionDTO`
- [ ] test core import aggiornati (`core/__tests__/*`)

---

**Versione**: 1.2.0
**Ultimo aggiornamento**: 2026-02-11
