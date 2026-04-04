# Numa UX Standards & Patterns

scope: ux-governance
owner: governance
status: active
last-verified: 2026-04-04
canonical-of: ux-policy

> **Stato:** Active
> **Versione:** 2.1
> **Ultimo aggiornamento:** 2026-04-04

Linee guida UX ad alto livello per mantenere fiducia, chiarezza e coerenza cross-feature.

---

## 0. User-Visible Change Ritual

Qualsiasi change che modifica cio che l'utente vede, legge, percepisce o interpreta deve seguire il rituale canonico in:

- `/04_execution/USER_VISIBLE_CHANGE_RITUAL.md`

Il perimetro include:

- UI, layout, spacing, tipografia, CTA, copy, empty/error states
- motion, hover, reveal, reduced-motion behavior
- support surfaces, metadata pubblici e documentazione canonica che descrive promesse utente

Non include refactor interni puramente tecnici senza impatto percepito.

Invarianti:

- il change non si chiude con un summary generico; si chiude con finding concreti
- se un rilievo viene ripetuto due volte, deve essere promosso a governance
- le superfici simili devono restare cross-surface coherent

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
- La stessa regola vale per qualunque superficie che espone la provenienza della stima, incluse dashboard summary, topbar preview, simulator overlay e varianti derivate della stessa metrica.

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
- In dark mode il colore non puo essere la materia dominante della UI: il primary resta un accento, non il fondale.
- Per superfici utente-visibili in dark la base canonica e `ink / smoke / paper`: nero, grafite, bianco caldo e grigi neutri prima del colore.

### B. Geometry Scale
- Macro surfaces: `rounded-[2.5rem]` (40px).
- Micro surfaces: `rounded-xl` (16px).

### C. Material Consistency
- Superfici principali: `glass-panel`.
- Superfici secondarie: `glass-card`.
- Overlay e chrome devono restare coerenti con la materialità della TopBar.
- In dark mode le superfici condivise devono usare un highlight bianco molto velato e off-axis (`torchlight white`), evitando spot centrati ripetuti e glow colorati come default globale.
- Il materiale dark deve sembrare `inchiostro + vetro fumé`, non aurora neon o frosted glass lattiginoso.

### D. Trust Grammar
- Le stesse promesse non devono essere ripetute inutilmente in hero, CTA, footer e support surfaces.
- Trust messaging, support pages e support CTA devono rafforzarsi a vicenda senza eco o ridondanza.
- Una support surface pubblica non deve mai sembrare appartenere a un altro prodotto.

### E. Tone of Voice
- Niente aggressivita gratuita, hype generico o framing punitivo.
- Le promesse devono restare verificabili, specifiche e aderenti al runtime reale.
- Se il prodotto promette calma e affidabilita, la UI non deve parlare come un trailer.

---

## 4. Public Acquisition Surface (`/`)

- La landing pubblica e una trust surface, non una pagina marketing generica.
- Il copy della landing deve restare comprensibile anche a una cold audience nel primo viewport.
- Sopra la piega la hero deve rispondere in pochi secondi a tre domande: cos'e Numa, a cosa serve, perche fidarsi.
- Il copy pubblico usa linguaggio utente prima del lessico di prodotto: beneficio prima del meccanismo, risultato prima dell'architettura.
- I differenziatori tecnici possono comparire solo dopo la prima scansione o nello stesso blocco in cui vengono tradotti in linguaggio umano.
- Privacy e local execution vanno raccontati come rassicurazione concreta, non come infrastruttura da addetti ai lavori.
- Termini come `local-first`, `CSV`, `estratto conto`, `margine`, `Brain locale` e `Financial Lab` non devono guidare la prima scansione della hero pubblica.
- Il copy pubblico deve descrivere solo capacita verificabili nei moduli attivi del prodotto, evitando hype su AI, cloud o automazioni non dimostrate.
- L'ordine narrativo canonico resta: dati gia posseduti -> lettura del mese -> stima se pronta -> decisione su nuova spesa fissa.
- La spiegazione operativa del flusso pubblico deve vivere in una sezione statica `Come inizi` in quattro passaggi, non in una hero separata che duplica la stessa narrativa con scene animate.
- Eventuali interludi dedicati al Brain devono rafforzare trasparenza di readiness e fallback, non spostare la promessa su predizioni assolute.
- La CTA primaria resta l'ingresso nell'app (`/dashboard`), non signup forzato o routing dispersivo.
- Una CTA secondaria puo portare a una prova sicura via `/transactions/import`, ma deve restare esplicita sul fatto che si tratta di import/demo e non di onboarding remoto.
- La CTA finale della landing puo esplicitare local-first, zero-cloud e assenza di account obbligatorio per la prima scansione, ma senza promettere piu di quanto l'app faccia davvero.
- La navigazione pubblica deve rimanere contenuta in anchor interne e route esplicitamente pubbliche.
- Le route pubbliche intenzionali oggi ammesse sono `/dashboard`, `/transactions/import`, `/faq`, `/privacy` e `/updates`.
- `/faq`, `/privacy` e `/updates` sono trust surface standalone fuori `AppShell`; `/transactions/import` resta la route app-native raggiungibile anche dalla landing senza perdere il chrome operativo interno.
- Il footer pubblico deve esporre solo support surface reali; vietate voci statiche o affordance di contatto non ancora implementate.
- La landing deve mantenere tono calmo e non punitivo: niente FOMO, urgenza artificiale o framing colpevolizzante.
- La landing non deve implicare open banking o sync remoti come baseline se il prodotto resta local-first e fail-closed di default.
- In dark mode la landing deve restare editoriale e leggibile: accenti cromatici minimi, grande contrasto tipografico e nessuna sezione che sembri appartenere a un'estetica neon separata.

## 5. UX Invariants

- Nessun branching di experience per device: un solo componente adattivo.
- Sulla landing questo vale anche per hero ed explainers immersivi: smartphone e `prefers-reduced-motion` non devono attivare superfici o pattern alternativi, ma solo ridurre il moto.
- I flussi principali devono preservare orientamento verticale e leggibilità delle metriche.
- Le etichette semantiche finanziarie devono rimanere non giudicanti e contestualizzate nel tempo.
- Ogni change utente-visibile deve chiudersi con narrative pass, typography pass, composition pass, truth pass, cross-surface coherence pass e verification pass.
- Ogni change che tocca il dark theme deve verificare coerenza cross-surface tra landing, support surfaces e superfici core app, non solo il blocco locale.

---

## 6. Implementation Baseline

Le regole tecniche MUST/SHOULD/NEVER per interazioni, accessibilita, performance, hydration e theming sono canoniche in:

- `/01_rules/UI_EXECUTION_STANDARDS.md`

Questa pagina resta il livello UX strategico (trust, feedback, tone).  
Il file `UI_EXECUTION_STANDARDS.md` e il livello operativo per implementazione e review.
