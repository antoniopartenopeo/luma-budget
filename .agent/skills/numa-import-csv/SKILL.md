---
name: numa-import-csv
description: Use when working on CSV import feature, transaction enrichment, merchant normalization, or category auto-assignment.
---

# Import CSV e Data Enrichment

Questa skill fornisce le procedure dettagliate per lavorare sulla feature di importazione CSV.

---

## Guard di Attivazione

Se questa skill non è chiaramente attiva, **FERMATI** e chiedi all'utente di invocarla esplicitamente per nome.
Non procedere in modalità "best effort".

---

## Architettura Import

```
src/features/import-csv/
├── core/           # Logica pura (no React)
│   ├── normalize.ts    # Parsing e normalizzazione
│   ├── group.ts        # Raggruppamento per merchant
│   ├── enrich.ts       # Arricchimento categorie
│   └── types.ts        # Tipi condivisi
├── components/     # UI del wizard
├── hooks/          # React hooks
└── __tests__/      # Test
```

---

## Normalizzazione Merchant

### Funzione Chiave

```typescript
extractMerchantKey(description: string): string
```

### Regole di Estrazione

| Priorità | Regola | Esempio |
|----------|--------|---------|
| 1 | Rimuovi stop words | DI, IL, LA, POS, PAGAMENTO |
| 2 | Rimuovi date | 12/01, 2024-01-15 |
| 3 | Rimuovi ID/riferimenti | N. 12345, RIF:ABC |
| 4 | Mantieni 2-3 parole significative | "AMAZON EU" da "Pagamento Amazon EU Sarl Milano" |

### ⚠️ Eccezione `parseFloat`

Il file `normalize.ts` è l'**UNICO** autorizzato a usare `parseFloat`:

```typescript
// ✅ PERMESSO SOLO QUI: parsing CSV grezzo
const rawAmount = parseFloat(row.amount.replace(",", "."))
const amountCents = Math.round(rawAmount * 100)
```

Questo perché il CSV è input esterno non strutturato.

---

## Strategia Subgrouping

### Raggruppamento per Amount

```typescript
// Identifica abbonamenti ricorrenti
groupByExactAmount(transactions): SubGroup[]
```

| Criterio | Logica |
|----------|--------|
| Stesso `merchantKey` | Raggruppa per merchant normalizzato |
| Stesso `amountCents` | Sotto-raggruppa per importo esatto |
| Ordinamento | Per magnitudine totale (descending) |

### Use Case

- Netflix €15,99/mese → subgroup "NETFLIX / €15,99"
- Spotify €9,99/mese → subgroup "SPOTIFY / €9,99"

---

## Arricchimento Categorie

### Auto-Assignment

```typescript
assignCategory(merchantKey: string): CategoryId | null
```

| Priorità | Fonte |
|----------|-------|
| 1 | Match esatto dallo storico utente |
| 2 | Frequenza categoria per merchant |
| 3 | `null` → richiede selezione manuale |

### UI Override

```tsx
<CategoryPicker
  value={currentCategory}
  onChange={handleCategoryChange}
/>
```

---

## Riferimenti

- Specifica completa: [docs/specs/WIZARD_LOGIC_SPEC.md](file:///docs/specs/WIZARD_LOGIC_SPEC.md)

---

## Checklist Pre-Commit

- [ ] `parseFloat` solo in `normalize.ts` per CSV grezzo
- [ ] Merchant key normalizzata correttamente
- [ ] Subgrouping per amount funzionante
- [ ] Category assignment testato
- [ ] Nessun calcolo monetario fuori da `@/domain/money`

---

**Versione**: 1.1.0  
**Ultimo aggiornamento**: 2026-02-01
