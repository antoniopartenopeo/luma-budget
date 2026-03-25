# Numa Motion Principles & Governance

scope: motion-governance
owner: governance
status: active
last-verified: 2026-03-22
canonical-of: motion-policy

> **Stato:** Attivo e vincolante
> **Versione:** 1.5
> **Ultimo aggiornamento:** 2026-03-22

Il motion in Numa comunica stato e priorità. Non è decorazione autonoma.

---

## 1. Scopo del Motion

In Numa l'animazione è ammessa solo per:
1. Comunicare stato (loading, completamento, attenzione).
2. Preservare contesto durante cambi di dati.
3. Rafforzare affordance e focus interattivo.

Se non copre uno di questi scopi, va rimossa.

---

## 2. Principi Fondamentali

### A. Motion = Evento Semantico
- Stato di attesa reale -> `animate-pulse-soft`
- Entrata contenuto -> `animate-enter-up`
- Conferma modifica finanziaria -> `animate-flash-green`
- Focus/energia su elementi di accento -> `animate-ping-slow`
- Orbite/rotazioni continue di sistema -> `animate-spin-slow`

### B. Sobrietà Fisica
Preferire `opacity` e `transform` (scale/translate leggere). Evitare movimenti ampi che compromettano leggibilità di numeri e tabelle.

### C. Timing Standard
- `animate-enter-up`: 0.6s, easing `cubic-bezier(0.16, 1, 0.3, 1)`
- `animate-flash-green`: 0.8s decay
- Loop continui (`pulse/ping/spin`): solo su elementi a basso peso visivo

### D. Legge del 5%
Le animazioni continue non devono occupare più del 5% della viewport in modo dominante.

---

## 3. Primitive Consentite

### Global primitives (`src/app/globals.css`)
- `animate-enter-up`
- `animate-pulse-soft`
- `animate-flash-green`
- `animate-ping-slow`
- `animate-spin-slow`

### Eccezione controllata: Radix/Shadcn state animations
Per overlay Radix (`Dialog`, `Sheet`, `Popover`, `Dropdown`, `Select`) sono consentite classi `data-[state=*]:animate-*` e transition utility già presenti nei primitives UI.

### Eccezione controllata: Landing narrativa pubblica
Sulla landing pubblica (`/`) sono ammesse eccezioni aggiuntive quando restano semanticamente collegate al prodotto e tutelano il limite cognitivo:
- Primitive mesh matematiche (es. `AppleFluidMesh`) come SVG background animati nativamente, obbligatoriamente isolate con `pointer-events-none` e posizionate sullo strato visuale di fondo (`z-0`);
- reveal testuale cinematico in ingresso per il titolo hero;
- demo sticky/scrollytelling che attiva un solo step per volta;
- micro-animazioni interne a preview frame isolati (progress fill, shimmer, check state, orbite a bassa dominanza);
- un solo interludio immersivo dedicato al Brain con parallax/lens effect se rimane nella fase forecast e non introduce nuova navigazione.

Guardrail obbligatori:
- le primitive di pura immersione spaziale o ambientale (es. background mesh) sfuggono alla Legge del 5% perché non richiedono parsing cognitivo, a condizione che non ostacolino testi e grafici;
- le eccezioni tematiche valgono solo per superfici pubbliche narrative e preview isolate, non per i pannelli operativi del prodotto live;
- `blur/filter` sono ammessi solo come transizione iniziale breve, non come stato persistente;
- animazioni su `width` sono ammesse solo dentro frame fissi che non causano reflow del layout circostante;
- l'interludio Brain puo usare `useSpring` e blur di profondita sui layer retrostanti per ottenere separazione cinematica, ma il layer di lettura principale deve restare leggibile e il reveal finale non deve diventare una nuova CTA autonoma;
- i layer della landing non devono dipendere da asset remoti di texture o da claim non verificabili;
- ogni eccezione deve avere fallback `prefers-reduced-motion`.

---

## 4. Zoning

### Zone Motion-Positive
- Dashboard: transizioni KPI/charts.
- Insights: stati advisor/trend.
- Simulator/Goals: feedback su scenario e derivazione quota sostenibile.
- Neural Core: progresso e stato evolutivo.
- Landing pubblica: hero immersivo e demo step-based che raccontano il flusso prodotto senza imitare dati live utente.

### Zone Static-First
- Tabelle dense e liste transazioni: motion minimo, orientato a entrata/focus, non a distrazione.
- Totali finanziari critici: no effetti slot-machine o oscillazioni invasive.

---

## 5. Accessibilità & Performance

### Prefers Reduced Motion
`prefers-reduced-motion: reduce` deve disattivare animazioni e accorciare transizioni.

Sulla landing questo implica:
- hero text senza blur persistente;
- demo step con cambio stato immediato o fade minimo;
- interludi e hero immersivi che mantengono la stessa composizione adattiva, riducendo pero blur, parallax, loop e transizioni lunghe invece di sostituire la scena con un pattern diverso;
- nessun loop continuo dominante fuori dai preview frame.

### Performance
Animare solo proprietà composite (`transform`, `opacity`). Evitare animazioni su proprietà layout (`width`, `height`, `margin`, `padding`) salvo casi tecnici strettamente necessari.

---

## 6. Regola di Estensione

Nuove animazioni sono ammesse solo se:
1. hanno stato semantico esplicito;
2. rispettano zoning e legge del 5%;
3. non introducono regressioni di accessibilità/performance.
