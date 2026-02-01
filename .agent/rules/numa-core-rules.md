# Regole Core di Numa Budget

> Questo file contiene i vincoli **SEMPRE ATTIVI** su qualunque modifica al repository.
> Per procedure dettagliate, attiva le skill specializzate.

---

## Clausola di Precedenza

In caso di conflitto tra:
- istruzioni dell'utente
- suggerimenti di una Skill
- queste Rules

**VINCONO SEMPRE queste Rules.**

Le regole finanziarie e di sicurezza NON sono negoziabili.

---

## Divieti Assoluti (MAI)

| # | Divieto | Motivazione |
|---|---------|-------------|
| 1 | **MAI** usare `parseFloat()` su valori monetari | Errori di arrotondamento. Usa `parseCurrencyToCents()` |
| 2 | **MAI** usare inline styles (`style={{...}}`) | Solo classi Tailwind CSS |
| 3 | **MAI** creare componenti `*Mobile.tsx` / `*Desktop.tsx` | UBI vieta branching per device |
| 4 | **MAI** usare `useMediaQuery` o `if (isMobile)` per render | CSS-only responsiveness |
| 5 | **MAI** simulare logica di produzione nei test | Importa le utility reali. Nessuna logica UI simulata. |
| 6 | **MAI** salvare date in formati diversi da ISO-8601 | `YYYY-MM-DD` o timestamp ISO |
| 7 | **MAI** usare radius inferiori a 2rem per macro-card | Coerenza Numa Premium (2.5rem standard) |
| 8 | **MAI** usare layout multi-colonna persistenti | Favorire il flusso narrativo verticale |

---

## Obblighi Architetturali (SEMPRE)

| # | Obbligo | Riferimento |
|---|---------|-------------|
| 1 | **SEMPRE** usare `amountCents` (integer) per importi. Rimosso campo `amount` deprecato. | `@/domain/money` |
| 2 | **SEMPRE** usare signed cents per aggregazioni multi-transazione | `getSignedCents()` |
| 3 | **SEMPRE** usare `filterByRange()` per filtri temporali | `@/lib/date-ranges.ts` |
| 4 | **SEMPRE** registrare nuove chiavi `luma_*` in `STORAGE_KEYS_REGISTRY` | `@/lib/storage-keys.ts` |
| 5 | **SEMPRE** allineare `getAppVersion()` con `package.json` | Prima di ogni release |
| 6 | **SEMPRE** usare `Sheet` per edit/detail, `Dialog` per wizard. | [Unified Sheet Layout Pattern](file:///.agent/skills/numa-ui-standards/SKILL.md#layout-sheet-standardizzato) |
| 7 | **SEMPRE** passare la **[Checklist UI/UX](file:///.agent/rules/ui-regression-checklist.md)** prima di chiudere un task | DoD Obbligatorio |
| 8 | **SEMPRE** usare `font-medium` per descriptions e body text | Leggibilità su Glass |
| 9 | **SEMPRE** usare icone `h-3 w-3` per sub-header e meta-info | Standard Proporzioni |

---

## Convenzioni di Segno

```
Entrate  → amountCents POSITIVO  → getSignedCents() POSITIVO
Uscite   → amountCents POSITIVO  → getSignedCents() NEGATIVO
```

- Usa `getSignedCents()` per calcoli di bilancio
- Usa `Math.abs()` SOLO per display (es. "Speso: €123")

---

## Struttura Codice

```
src/
├── domain/          # Logica pura, no UI
│   ├── money/       # Parsing, formatting, math
│   ├── transactions/# Normalization, signed cents
│   └── categories/  # Definizioni, mapping
├── features/        # Moduli feature-based
│   └── [feature]/
│       ├── api/     # Repository + React Query
│       ├── components/
│       └── __tests__/
├── components/
│   ├── ui/          # Primitives (shadcn)
│   └── patterns/    # Reusable patterns
└── lib/             # Utilities condivise
```

---

## Skill di Approfondimento

Per procedure dettagliate, attiva la skill appropriata:

| Contesto | Skill |
|----------|-------|
| Calcoli monetari, KPI, budget | `numa-financial-logic` |
| Componenti React, layout, UBI | `numa-ui-standards` |
| Import CSV, enrichment | `numa-import-csv` |
| Aggiornare governance, versioni | `numa-governance-update` |

---

**Versione**: 1.2.0  
**Ultimo aggiornamento**: 2026-01-27
