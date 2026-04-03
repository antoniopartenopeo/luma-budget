# Rituale Operativo per User-Visible Change

scope: user-visible-change-ritual
owner: governance
status: active
last-verified: 2026-04-03
canonical-of: user-visible-change-ritual

Stato: attivo (guardrail non negoziabile per superfici utente-visibili)

Questo rituale rende severa ma leggera la chiusura di qualsiasi change che modifichi cio che l'utente vede, legge, percepisce o interpreta.

## 1. Quando si applica

Il rituale e obbligatorio per ogni change che tocca anche solo uno di questi aspetti:

- layout, spacing, dimensioni, gerarchia visiva
- tipografia, pesi, contrasti, wrap, label, CTA
- copy, tone of voice, empty/error states, trust messaging
- motion, timing, reveal, hover, reduced-motion behavior
- affordance, navigazione, support links, metadata pubblici
- documentazione canonica che descrive promesse o comportamento percepito dal prodotto

Non si applica ai refactor puramente tecnici senza impatto utente diretto.

## 2. Pass obbligatori di chiusura

Ogni change utente-visibile deve chiudersi in questo ordine:

1. `Narrative pass`
   - qual e il messaggio principale del blocco?
   - ci sono duplicazioni, eco o claim in conflitto?
   - il tono resta premium, tech, calmo, affidabile?

2. `Typography pass`
   - i titoli stanno nella scala canonica?
   - i body text hanno il peso corretto?
   - le micro-label usano la stessa grammatica?
   - ci sono wrap indesiderati o salti di scala arbitrari?

3. `Composition pass`
   - ci sono elementi decentrati accidentalmente?
   - card troppo strette, troppo alte, troppo quadrate?
   - spaziature coerenti col resto del sistema?
   - la scena sembra Numa o sembra un altro prodotto?

4. `Truth pass`
   - il copy racconta solo feature reali?
   - nessuna affordance falsa
   - nessuna promessa cloud/sync/AI/beta non sostenuta dal runtime reale

5. `Cross-surface coherence pass`
   - il change e coerente con le superfici simili?
   - landing, support pages, app core e metadata parlano la stessa lingua?
   - CTA, trust signals e support surfaces restano allineate?

6. `Verification pass`
   - light desktop
   - dark desktop
   - smartphone
   - test mirati
   - build
   - audit findings-first finale se il change e sostanziale

## 3. Formato findings-first obbligatorio

La review finale non parte da un summary. Parte dai finding.

Formato minimo consigliato:

- severita: `bassa | media | alta`
- ambito: `locale | cross-surface | sistemico`
- area: `copy | typography | composition | truth | motion | support`
- finding: cosa rompe la coerenza
- decisione: resta locale oppure va promosso a governance

Un change utente-visibile non e chiuso davvero se il reviewer non e in grado di produrre questo formato.

## 4. Regola di promozione a governance

Se un rilievo viene ripetuto due volte, non e piu gusto personale.

Workflow:

- prima volta: finding locale in review
- seconda volta: finding + decisione esplicita
- terza volta: non ammessa come sorpresa; la regola deve gia vivere nei documenti canonici

Output canonico:

- aggiornamento a `06_decisions/DECISION_LOG.md`
- eventuale aggiornamento a `01_rules/UX_GOVERNANCE.md`
- eventuale aggiornamento a `05_specialists/NUMA_UI_STANDARDS.md`

## 5. Definition of done per change utente-visibile

Il DoD minimo diventa:

- implementazione corretta
- coerenza locale
- coerenza cross-surface
- rituale completato
- test/build/check completati
- drift documentale risolto se il change tocca promesse, tone o comportamento percepito

## 6. Automazione ammessa

L'automazione serve solo a intercettare drift oggettivi.

Controlli automatici ammessi:

- `transition-all`
- route/link pubblici inconsistenti
- affordance verso pagine inesistenti
- copy beta o placeholder su superfici pubbliche
- metadata/updates/changelog non allineati
- classi o tipografia fuori token quando esiste una primitive canonica

Controlli non automatizzabili:

- e bello?
- e abbastanza premium?
- questa chiusura convince?

Queste decisioni restano umane.
