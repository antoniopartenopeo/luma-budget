# Regole Core di Numa Budget

> Vincoli **sempre attivi** su qualsiasi modifica al repository.
> Per procedure operative dettagliate usa le skill specializzate.

---

## Clausola di Precedenza

In caso di conflitto tra:
- istruzioni utente
- suggerimenti skill
- queste regole

**prevalgono sempre queste regole**.

---

## Divieti Assoluti (MAI)

| # | Divieto | Motivazione |
|---|---|---|
| 1 | **MAI** usare `parseFloat()` su flussi monetari di prodotto | Errori di arrotondamento. Usa `parseCurrencyToCents()` |
| 2 | **MAI** usare inline style per styling/layout statico | Coerenza Tailwind e manutenzione. Eccezione: soli valori runtime non esprimibili a classi (es. dimensioni chart, stroke offset SVG, palette dinamiche) |
| 3 | **MAI** creare componenti `*Mobile.tsx` / `*Desktop.tsx` | UBI: una UI adattiva, non duplicata |
| 4 | **MAI** usare `useMediaQuery` o branching `if (isMobile)` per il render | Responsive solo con CSS/Tailwind |
| 5 | **MAI** simulare logica di produzione nei test se esiste util/domain importabile | Integrità test |
| 6 | **MAI** salvare date in formati diversi da ISO-8601 | Stabilità parsing e filtri |
| 7 | **MAI** introdurre copy narrativo finanziario inline nei componenti | Il testo semantico appartiene al Narration Layer |
| 8 | **MAI** usare design flat (`shadow-none`, `border-none`) su elementi strutturali KPI senza motivazione di design system | Coerenza Numa Premium |

---

## Obblighi Architetturali (SEMPRE)

| # | Obbligo | Riferimento |
|---|---|---|
| 1 | **SEMPRE** usare `amountCents` integer come source of truth monetaria | `@/domain/money`, `@/domain/transactions` |
| 2 | **SEMPRE** usare signed cents per aggregazioni multi-transazione | `getSignedCents()` |
| 3 | **SEMPRE** usare util condivise per filtri periodo/range | `@/lib/date-ranges.ts` |
| 4 | **SEMPRE** registrare nuove storage keys app in `STORAGE_KEYS_REGISTRY` | `@/lib/storage-keys.ts` |
| 5 | **SEMPRE** allineare `getAppVersion()` con `package.json` prima del rilascio | release hygiene |
| 6 | **SEMPRE** usare `Sheet` per detail/edit e `Dialog` per overlay/wizard | `.agent/skills/numa-ui-standards` |
| 7 | **SEMPRE** passare la checklist UI canonica prima di chiudere un task UI | `.agent/rules/ui-regression-checklist.md` |
| 8 | **SEMPRE** aderire alle skill semantiche (`numa-*-semantics`) per copy/insight | determinismo narrativo |
| 9 | **SEMPRE** sviluppare su branch `codex/*` e promuovere su `main` solo con release approvata | flusso release |

---

## Convenzioni di Segno

```text
Entrate  -> amountCents positivo -> getSignedCents positivo
Uscite   -> amountCents positivo -> getSignedCents negativo
```

- `Math.abs()` solo per display o confronti di magnitudine.
- I calcoli di saldo usano sempre signed cents.

---

## Struttura Codice (mappa minima)

```text
src/
├── domain/          # Logica pura (money, transactions, categories, narration)
├── features/        # Moduli feature-based
├── brain/           # Neural core locale
├── VAULT/           # Logica isolata goals/budget
├── components/      # UI primitives + patterns + layout
└── lib/             # Utility condivise
```

---

## Skill di Approfondimento

| Contesto | Skill |
|---|---|
| Calcoli monetari, KPI, ritmi | `numa-financial-logic` |
| Componenti React/layout/motion | `numa-ui-standards` |
| Import CSV ed enrichment | `numa-import-csv` |
| Governance/docs/rules/changelog | `numa-governance-update` |

---

**Versione**: 2.3.0
**Ultimo aggiornamento**: 2026-02-11
