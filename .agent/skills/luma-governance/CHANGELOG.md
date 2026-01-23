# Changelog - Luma Governance Skill

Storico di tutte le modifiche alle regole di sviluppo.

---

## [1.5.0] - 2026-01-23

### Added
- **Consolidamento Single Source of Truth**: `SKILL.md` è ora l'unico riferimento tecnico; `README.md` è stato semplificato.
- Nuova sezione **Date & Time Standards** (obbligo ISO-8601).
- Nuova sezione **CSV Import & Data Enrichment** con regole su merchant normalization e subgrouping.
- Nuovi Constraints: divieto formati date non ISO, obbligo signed cents per aggregazioni.

### Changed
- Rafforzamento regole **Sign Convention**: chiarito l'uso di `Math.abs()` solo per display.
- README.md: rimosse regole duplicate, aggiunti link diretti alla Skill e alle linee guida di contribuzione.

---

## [1.4.0] - 2026-01-22

### Added
- Nuova sezione **System Health & Diagnostics** per garantire la trasparenza dello stato locale.
- Obbligo registrazione di tutte le chiavi `luma_*` in `STORAGE_KEYS_REGISTRY`.
- Regola di allineamento versione tra `package.json` e `getAppVersion()`.
- Monitoraggio dello storage totale nella sezione Advanced Settings.

---

## [1.3.0] - 2026-01-21

### Added
- Nuova sezione **UBI (Unitary/Unified Behavioral Interface)** con 10 regole per UI responsive senza branching mobile/desktop.
- 3 nuove regole in Constraints: divieto `useMediaQuery`, divieto componenti `*Mobile/*Desktop`, obbligo `Sheet`/`Dialog` universali.
- Riferimento a `docs/audits/UBI_UI_ANALYSIS.md` per analisi dettagliata.
- Template Flex Layout per contenitori scrollabili.

### Changed
- Rinumerazione sezioni (Code Organization → 4, Git Workflow → 5).

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
