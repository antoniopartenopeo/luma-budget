---
name: numa-governance-update
description: Use when updating rules, skills, CHANGELOG, or version numbers after adding new patterns or fixing bugs.
---

# Aggiornamento Governance Numa Budget

Questa skill fornisce le procedure per aggiornare regole, skill, changelog, e versioni.

---

## Guard di Attivazione

Se questa skill non è chiaramente attiva, **FERMATI** e chiedi all'utente di invocarla esplicitamente per nome.
Non procedere in modalità "best effort".

---

## Quando Aggiornare la Governance

| Evento | Azione |
|--------|--------|
| Nuovo pattern definito | Aggiungi a skill appropriata |
| Bug causato da pattern mancante | Aggiungi a Lessons Learned |
| Nuovo vincolo critico | Aggiungi a `numa-core-rules.md` |
| Nuova feature con regole specifiche | Valuta se creare nuova skill |
| **Feature implementata** | **Aggiorna `ROADMAP.md`** ✨ |
| **Fix significativo applicato** | **Spunta in `ROADMAP.md`** ✨ |


---

## Protocollo Auto-Sync (OBBLIGATORIO)

> **Regola**: L'allineamento tra Documentazione Umana (`docs/`) e Memoria Agente (`.agent/`) NON è opzionale.

Ogni volta che modifichi un file di "Policy" nel progetto, devi **IMMEDIATAMENTE** verificare se una Skill agente deve essere aggiornata.

| Se modifichi questo... | Devi aggiornare questo... |
|------------------------|---------------------------|
| `docs/governance/MOTION_*` | `.agent/skills/numa-ui-standards` |
| `docs/governance/UX_STANDARDS.md` | `.agent/skills/numa-ui-standards` |
| `src/domain/money.ts` | `.agent/skills/numa-financial-logic` |
| `src/domain/narration` | `.agent/skills/numa-*-semantics` |
| `src/domain/import` | `.agent/skills/numa-import-csv` |

**Non aspettare l'input dell'utente.** Falo come parte atomica del task.


## Struttura File Governance

```
.agent/
├── rules/
│   └── numa-core-rules.md      # Vincoli always-on
└── skills/
    ├── numa-financial-logic/
    │   └── SKILL.md
    ├── numa-ui-standards/
    │   └── SKILL.md
    ├── numa-import-csv/
    │   └── SKILL.md
    └── numa-governance-update/
        ├── SKILL.md            # Questo file
        ├── CHANGELOG.md        # Storico modifiche
        └── scripts/
            ├── pre-commit      # Hook git
            └── validate.sh     # Validatore
```

---

## Procedura di Aggiornamento

### 1. Modifica alla Rule

```bash
# 1. Edita il file
vim .agent/rules/numa-core-rules.md

# 2. Aggiorna versione in fondo al file
# 3. Documenta in CHANGELOG
# 4. Commit
git commit -m "docs(rules): [descrizione]"
```

### 2. Modifica a una Skill

```bash
# 1. Edita SKILL.md della skill appropriata
vim .agent/skills/numa-financial-logic/SKILL.md

# 2. Aggiorna "Ultimo aggiornamento" in fondo
# 3. Documenta in CHANGELOG consolidato
# 4. Commit
git commit -m "docs(skill): [nome-skill] - [descrizione]"
```

### 3. Nuova Skill

1. Crea directory: `.agent/skills/[nome-skill]/`
2. Crea `SKILL.md` con:
   - Frontmatter (`name`, `description`)
   - Guard di Attivazione
   - Contenuto specifico
   - Versione e data
3. Documenta in CHANGELOG

---

## Semver per Governance

| Tipo | Bump | Esempio |
|------|------|---------|
| **MAJOR** | X.0.0 | Breaking change a regole esistenti |
| **MINOR** | 1.X.0 | Nuove regole aggiunte |
| **PATCH** | 1.1.X | Chiarimenti, typo, riorganizzazione |

---

## Storage Keys: Registrazione Obbligatoria

Ogni nuova chiave `luma_*` DEVE essere registrata:

```typescript
// src/lib/storage-keys.ts
export const STORAGE_KEYS_REGISTRY = {
  // ... chiavi esistenti
  luma_new_feature: {
    key: "luma_new_feature",
    label: "Nuova Feature",
    countFn: () => /* conta record */,
    invalidatesQueries: ["queryName"]
  }
}
```

---

## Allineamento Versione App

Prima di ogni release:

```bash
# 1. Verifica allineamento
grep '"version"' package.json
grep 'getAppVersion' src/features/settings/diagnostics/diagnostics-utils.ts

# 2. Se non allineati, aggiorna entrambi
```

---

## Script di Validazione

### Esecuzione Manuale

```bash
./.agent/skills/numa-governance-update/scripts/validate.sh
```

### Setup Pre-Commit Hook

```bash
cp .agent/skills/numa-governance-update/scripts/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

---

## Template CHANGELOG Entry

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

---

- [ ] Superata **Checklist di Verifica UI/UX** (se applicabile)
- [ ] Modifica al file appropriato (Rule o Skill)
- [ ] Versione/data aggiornata
- [ ] Entry in CHANGELOG
- [ ] Commit con prefisso `docs(rules):` o `docs(skill):`
- [ ] Nessuna regola finanziaria rimossa/allentata

---

**Versione**: 1.1.1  
**Ultimo aggiornamento**: 2026-02-04
