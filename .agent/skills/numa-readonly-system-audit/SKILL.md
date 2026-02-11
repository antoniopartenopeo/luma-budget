---
name: numa-readonly-system-audit
description: Eseguire audit diagnostico completo e read-only del progetto Numa su architettura, debito tecnico, scalabilità, UI/UX, tipografia, colori/materiali, motion e rischi strategici, senza modificare codice e senza proporre soluzioni. Usare quando l'utente chiede valutazione critica sistemica, maturity scoring o verifica di allineamento a fiducia, chiarezza, premium, explainability.
---

# Numa System Audit (Read-Only Assoluto)

## Obiettivo

Produrre una diagnosi profonda e scomoda dello stato reale del sistema, basata su evidenze verificabili nel repository.

## Modalità Operativa Vincolante

1. Operare in sola lettura assoluta.
2. Non modificare file, non usare `apply_patch`, non creare commit.
3. Non eseguire comandi che scrivono output persistente o rigenerano artefatti.
4. Usare solo comandi di analisi (`rg`, `find`, `ls`, `cat`, `sed`, `head`, `wc`, `git status`, `git log`, `git show`).
5. Non proporre refactor, redesign, fix, workaround o roadmap implementative.
6. Fornire solo analisi, diagnosi, classificazione rischio, valutazioni critiche.

## Attivazione Governance Numa (Obbligatoria)

Leggere sempre questi file prima della diagnosi finale:

1. `/.agent/rules/numa-core-rules.md`
2. `/.agent/rules/ui-regression-checklist.md`
3. `/.agent/skills/numa-ui-standards/SKILL.md` (attivazione esplicita obbligatoria)
4. `/.agent/skills/numa-financial-logic/SKILL.md`
5. `/.agent/skills/numa-budget-semantics/SKILL.md`
6. `/.agent/skills/numa-insights-semantics/SKILL.md`
7. `/docs/README.md`
8. `/docs/ARCHITECTURE.md`
9. `/docs/governance/UX_STANDARDS.md`
10. `/docs/governance/MOTION_PRINCIPLES.md`
11. `/docs/governance/adr/ADR-005-Semantic-Shift-Rhythm.md`
12. `/docs/audit/README.md`
13. `/docs/audit/quick-check.md` (se presente)

Se uno di questi riferimenti manca, dichiararlo nel report come rischio di governance/documentation drift.

## Workflow Audit

### 1) Costruire la mappa reale del sistema

1. Mappare layer e moduli effettivi dal codice, non dalla documentazione dichiarata.
2. Distinguere moduli core, accessori, legacy, zombie.
3. Tracciare i confini dominio e rilevare violazioni inter-layer.
4. Ricostruire il flusso dati finanziario e la source of truth reale.
5. Evidenziare accoppiamenti critici e drift architetturale.

### 2) Estrarre debito tecnico strutturale

1. Cercare backward-compatibility code path ancora vivi.
2. Individuare duplicazioni logiche e naming semanticamente superato.
3. Identificare TODO impliciti e codice concettualmente morto.
4. Classificare ogni finding con:
   - Tipo: `Legacy` | `Semantic Drift` | `Fragility` | `Overengineering`
   - Gravità: `Low` | `Medium` | `High` | `Critical`
   - Impatto roadmap: `Basso` | `Medio` | `Alto`
5. Produrre tre elenchi: `Codice da uccidere`, `Codice da congelare`, `Codice da proteggere`.

### 3) Valutare scalabilità futura e failure mode

1. Analizzare crescita funzionale, dati, UI e costo cognitivo manutentivo.
2. Valutare stato globale, persistenza local-first e complessità del derived state.
3. Valutare rischio re-render, performance UI e robustezza test (falsi positivi).
4. Identificare i punti in cui la governance può degradare nel tempo.

### 4) Eseguire audit UI/UX sistemico

1. Applicare esplicitamente `numa-ui-standards` come baseline.
2. Valutare coerenza globale, gerarchia visiva/cognitiva, ritmo verticale, pattern di layout, continuità percettiva.
3. Segmentare l'interfaccia in zone a coerenza alta, media, bassa.
4. Evidenziare dove l'esperienza rompe l'illusione premium.

### 5) Eseguire audit tipografia, colori/materiali, motion

1. Tipografia: family, scale reale, pesi, gerarchie, consistenza cross-page.
2. Colori/materiali/profondità: palette semantica, contrasto, superfici, shadow/depth, ridondanze visive.
3. Motion: durata, easing, pattern entrata/feedback/stagger, coerenza temporale e impatto sulla fiducia.

## Standard di Evidenza

1. Ancorare i finding a evidenze concrete (path file e, se possibile, linee rilevanti).
2. Separare fatti osservati da inferenze.
3. Evitare linguaggio generico non verificabile.
4. Privilegiare rischi sistemici rispetto a micro-osservazioni cosmetiche.

## Formato Output Obbligatorio

Seguire il template in `references/report-template.md`.
Usare anche la scala in `references/scoring-rubrics.md`.

Vincoli finali:

1. Includere esattamente le 8 sezioni richieste dal committente.
2. Includere punteggi numerici (1-5) per valutazione complessiva, maturità architetturale e future-proofing.
3. Non includere alcuna soluzione o proposta di intervento.
