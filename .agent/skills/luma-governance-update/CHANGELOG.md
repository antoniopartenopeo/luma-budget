# Changelog - Governance Luma Budget

Storico consolidato di tutte le modifiche a regole, skill, e standard di sviluppo.

---

## [2.0.0] - 2026-01-24

### Major Refactor: Separazione Rules vs Skills

**Problema risolto**: Attivazione intermittente della governance (skill on-demand vs regole always-on).

### Added

- **Nuova struttura**:
  - `.agent/rules/luma-core-rules.md` → Vincoli always-on (~85 righe)
  - `.agent/skills/luma-financial-logic/` → Logica finanziaria dettagliata
  - `.agent/skills/luma-ui-standards/` → Standard UI e UBI
  - `.agent/skills/luma-import-csv/` → Import CSV e enrichment
  - `.agent/skills/luma-governance-update/` → Questo file + scripts

- **Nuove feature**:
  - Guard di Attivazione in ogni skill
  - Clausola di Precedenza nella Rule
  - Separazione chiara vincoli vs procedure

### Changed

- Migrazione da skill monolitica `luma-governance` a sistema modulare
- Scripts spostati in `luma-governance-update/scripts/`
- CHANGELOG consolidato in un unico file

### Removed

- `luma-governance/` (contenuto redistribuito)

---

## Storico Pre-Refactor (v1.x)

Le versioni precedenti erano nella skill monolitica `luma-governance`.

### [1.5.0] - 2026-01-23

- Consolidamento Single Source of Truth
- Nuova sezione Date & Time Standards (ISO-8601)
- Nuova sezione CSV Import & Data Enrichment
- Nuovi Constraints: divieto date non ISO, obbligo signed cents

### [1.4.0] - 2026-01-22

- Nuova sezione System Health & Diagnostics
- Obbligo registrazione chiavi `luma_*` in `STORAGE_KEYS_REGISTRY`
- Regola allineamento versione `package.json` ↔ `getAppVersion()`

### [1.3.0] - 2026-01-21

- Nuova sezione UBI (10 regole anti-branching)
- 3 nuovi Constraints UBI
- Template Flex Layout

### [1.2.0] - 2026-01-21

- Regola Test Integrity (no simulated logic in tests)
- Centralizzazione KPI Tones
- Migrazione Budget a centesimi

### [1.1.0] - 2026-01-21

- Migrazione a Domain-Driven Architecture (`@/domain/*`)
- Sezione Lessons Learned
- Riferimento a `@/components/patterns/`

### [1.0.0] - 2026-01-20

- Creazione skill in formato Antigravity
- Financial Logic rules
- UI Component Patterns
- Code Organization standards
- Git Workflow guidelines

---

## Template per Nuove Entry

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
