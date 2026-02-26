# Numa UX Standards & Patterns

scope: ux-governance
owner: governance
status: active
last-verified: 2026-02-26
canonical-of: ux-policy

> **Stato:** Active
> **Versione:** 1.4
> **Ultimo aggiornamento:** 2026-02-25

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

## 4. UX Invariants

- Nessun branching di experience per device: un solo componente adattivo.
- I flussi principali devono preservare orientamento verticale e leggibilità delle metriche.
- Le etichette semantiche finanziarie devono rimanere non giudicanti e contestualizzate nel tempo.

---

## 5. Implementation Baseline

Le regole tecniche MUST/SHOULD/NEVER per interazioni, accessibilita, performance, hydration e theming sono canoniche in:

- `/docs/governance/governance-ui-execution-standards.md`

Questa pagina resta il livello UX strategico (trust, feedback, tone).  
Il file `governance-ui-execution-standards.md` e il livello operativo per implementazione e review.
