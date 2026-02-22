# Numa Motion Principles & Governance

> **Stato:** Attivo e vincolante
> **Versione:** 1.4
> **Ultimo aggiornamento:** 2026-02-22

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

---

## 4. Zoning

### Zone Motion-Positive
- Dashboard: transizioni KPI/charts.
- Insights: stati advisor/trend.
- Simulator/Goals: feedback su scenario e derivazione quota sostenibile.
- Neural Core: progresso e stato evolutivo.

### Zone Static-First
- Tabelle dense e liste transazioni: motion minimo, orientato a entrata/focus, non a distrazione.
- Totali finanziari critici: no effetti slot-machine o oscillazioni invasive.

---

## 5. Accessibilità & Performance

### Prefers Reduced Motion
`prefers-reduced-motion: reduce` deve disattivare animazioni e accorciare transizioni.

### Performance
Animare solo proprietà composite (`transform`, `opacity`). Evitare animazioni su proprietà layout (`width`, `height`, `margin`, `padding`) salvo casi tecnici strettamente necessari.

---

## 6. Regola di Estensione

Nuove animazioni sono ammesse solo se:
1. hanno stato semantico esplicito;
2. rispettano zoning e legge del 5%;
3. non introducono regressioni di accessibilità/performance.
