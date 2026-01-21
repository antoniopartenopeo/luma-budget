# Changelog - Luma Governance Skill

Storico di tutte le modifiche alle regole di sviluppo.

---

## [1.2.0] - 2026-01-21

### Added
- Regola di **Test Integrity**: divieto di simulare logica di calcolo nei test (obbligo import da utils di produzione).
- Centralizzazione logic dei **KPI Tones** in `src/features/dashboard/utils/kpi-logic.ts`.
- Obbligo utilizzo `filterByRange` da `@/lib/date-ranges.ts` per coerenza temporale.
- Standardizzazione overlay custom con `DialogContent`.

### Changed
- Migrazione completa del modulo **Budget** a centesimi (AmountCents).
- Rafforzamento restrizioni nel `SKILL.md`.

## [1.1.0] - 2026-01-21

### Added
- Nuova sezione `Lessons Learned` documentando errori di visualizzazione e logic leak.
- Riferimento a `@/components/patterns/` per UI riutilizzabile (ConfirmDialog, KpiCard).
- Centralizzazione del filtraggio date in `src/lib/date-ranges.ts`.

### Changed
- Migrazione massiva della Financial Logic al layer `src/domain/`.
- Aggiornamento path import da `@/lib/currency-utils` a `@/domain/money`.
- Rafforzamento regola `no-parseFloat`: estesa anche al wizard di importazione CSV.
- Pulizia modello dati: rimosso campo `icon` da transazioni in favore di `categoryId`.

---

## [1.0.0] - 2026-01-20

### Added
- Creazione skill in formato Antigravity standard
- Financial Logic rules (no parseFloat, use cents)
- UI Component Patterns (Sheet, Dialog, AlertDialog)
- Code Organization standards
- Git Workflow guidelines
- Constraints section (5 regole assolute)
- Examples section (Bad vs Good)
- Lessons Learned (3 errori storici documentati)

### Migrated From
- `docs/doe/` system (eliminato)
- `docs/SKILLS.md` (eliminato)

---

## Template per nuove entry

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Nuove regole aggiunte

### Changed
- Regole modificate

### Removed
- Regole obsolete rimosse

### Lessons Learned
- Nuovi errori documentati
```
