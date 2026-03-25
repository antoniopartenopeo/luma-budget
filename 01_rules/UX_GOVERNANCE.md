# Numa UX Standards & Patterns

scope: ux-governance
owner: governance
status: active
last-verified: 2026-03-22
canonical-of: ux-policy

> **Stato:** Active
> **Versione:** 1.5
> **Ultimo aggiornamento:** 2026-03-22

Linee guida UX ad alto livello per mantenere fiducia, chiarezza e coerenza cross-feature.

---

## 1. Trust & AI Interaction

### A. Real Processing Honesty (No Fake Delay)
Per Advisor/Insights e per ogni operazione dichiarata come "analisi", lo stato di attesa deve riflettere lavoro reale (query, calcolo, training, fetch).

**Regole:**
- Vietato introdurre delay artificiali per simulare intelligenza.
- Lo stato "in analisi" deve dipendere da `isLoading/isPending` reali.
- In assenza di segnale dati sufficiente, usare copy esplicito di insufficienza dati (no rassicurazioni implicite).

### B. Forecast Source Transparency
Quando viene mostrata una previsione in Insights/Advisor, la UI deve dichiarare la fonte:
- `Fonte Core` solo se il nowcast è realmente pronto (internal source: `brain`).
- `Fonte Storico` quando il Core non è pronto o non è aggiornato.

### C. Contradiction Suppression
Se nel periodo corrente è presente un segnale `high/critical`, i messaggi rassicuranti a bassa severità nello stesso orizzonte vanno soppressi.

---

## 2. Feedback Loops

### A. Causal Feedback on Financial Inputs
Ogni interazione che modifica valori economici deve dare feedback visivo immediato e leggibile.

**Standard:**
- Preferire `animate-flash-green` per confermare l'applicazione di una modifica monetaria.
- Il feedback parte al commit dell'azione utente (non in ritardo decorativo).

### B. Honest Progress on Long Tasks
Per processi tecnici estesi (es. training locale Neural Core), mostrare progresso reale (percentuale/epoch/campioni), non stati fittizi.

---

## 3. Brand Identity & Geometry

### A. Palette (Locked)
- Primary state: `primary` (`oklch(0.6 0.16 200)`).
- Vietato usare Indigo come colore principale per CTA/stati attivi.

### B. Geometry Scale
- Macro surfaces: `rounded-[2.5rem]` (40px).
- Micro surfaces: `rounded-xl` (16px).

### C. Material Consistency
- Superfici principali: `glass-panel`.
- Superfici secondarie: `glass-card`.
- Overlay e chrome devono restare coerenti con la materialità della TopBar.

---

## 4. Public Acquisition Surface (`/`)

- La landing pubblica e una trust surface, non una pagina marketing generica.
- Il copy pubblico deve descrivere solo capacita verificabili nei moduli attivi del prodotto, evitando hype su AI, cloud o automazioni non dimostrate.
- L'ordine narrativo canonico resta: dati gia posseduti -> lettura del mese -> stima se pronta -> decisione su nuova spesa fissa.
- Eventuali interludi dedicati al Brain devono rafforzare trasparenza di readiness e fallback, non spostare la promessa su predizioni assolute.
- La CTA primaria resta l'ingresso nell'app (`/dashboard`), non signup forzato o routing dispersivo.
- La CTA finale della landing puo esplicitare local-first, zero-cloud e assenza di account obbligatorio per la prima scansione, ma senza promettere piu di quanto l'app faccia davvero.
- La navigazione pubblica deve rimanere contenuta in anchor interne e route esplicitamente pubbliche.
- La landing deve mantenere tono calmo e non punitivo: niente FOMO, urgenza artificiale o framing colpevolizzante.
- La landing non deve implicare open banking o sync remoti come baseline se il prodotto resta local-first e fail-closed di default.

## 5. UX Invariants

- Nessun branching di experience per device: un solo componente adattivo.
- Sulla landing questo vale anche per hero ed explainers immersivi: smartphone e `prefers-reduced-motion` non devono attivare superfici o pattern alternativi, ma solo ridurre il moto.
- I flussi principali devono preservare orientamento verticale e leggibilità delle metriche.
- Le etichette semantiche finanziarie devono rimanere non giudicanti e contestualizzate nel tempo.

---

## 6. Implementation Baseline

Le regole tecniche MUST/SHOULD/NEVER per interazioni, accessibilita, performance, hydration e theming sono canoniche in:

- `/01_rules/UI_EXECUTION_STANDARDS.md`

Questa pagina resta il livello UX strategico (trust, feedback, tone).  
Il file `UI_EXECUTION_STANDARDS.md` e il livello operativo per implementazione e review.
