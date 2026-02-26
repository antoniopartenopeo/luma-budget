# Numa UI Execution Standards (MUST/SHOULD/NEVER)

scope: ui-execution-governance
owner: governance
status: active
last-verified: 2026-02-26
canonical-of: ui-execution-policy

> **Stato:** Attivo e vincolante
> **Versione:** 1.0
> **Ultimo aggiornamento:** 2026-02-25

Regole operative concise per costruire interfacce accessibili, veloci e credibili.
Questo documento guida implementation e review tecnica cross-feature.

---

## 1. Interactions

### Keyboard
- MUST: supporto tastiera completo secondo pattern [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).
- MUST: focus visibile (`:focus-visible` e, quando utile, `:focus-within`).
- MUST: gestione focus corretta (trap, move, return) nei componenti overlay/compositi.
- NEVER: `outline: none` senza sostituzione visibile equivalente.

### Targets & Input
- MUST: hit target >=24px; su mobile >=44px. Se il visual e piu piccolo, espandere l'area cliccabile.
- MUST: su mobile, `<input>` con `font-size` >=16px per evitare zoom iOS.
- NEVER: disabilitare zoom browser (`user-scalable=no`, `maximum-scale=1`).
- MUST: `touch-action: manipulation` su controlli interattivi tappabili.
- SHOULD: `-webkit-tap-highlight-color` coerente con la palette.

### Forms
- MUST: input hydration-safe (niente perdita di focus o valore).
- NEVER: bloccare paste in `<input>` o `<textarea>`.
- MUST: bottoni loading con spinner + label originale visibile.
- MUST: Enter invia l'input focalizzato; in `<textarea>`, `Cmd/Ctrl+Enter` invia.
- MUST: submit abilitato fino all'inizio request; poi disabled + spinner.
- MUST: accettare testo libero e validare dopo (non bloccare digitazione).
- MUST: consentire submit incompleto per mostrare errori reali.
- MUST: errori inline vicino al campo; al submit focus sul primo errore.
- MUST: usare `autocomplete`, `name` significativo, `type` e `inputmode` corretti.
- SHOULD: disattivare spellcheck su email/codici/username.
- SHOULD: placeholder con esempio reale e suffisso `…` quando apre una continuazione.
- MUST: warning su unsaved changes prima di navigare via.
- MUST: compatibilita con password manager e 2FA; consentire incolla codici.
- MUST: trim dei valori per spazi finali involontari.
- MUST: checkbox/radio senza dead zone: label + control nello stesso target.

### State & Navigation
- MUST: URL riflette stato UI (tab, filtri, paginazione, pannelli espansi) per deep-link.
- MUST: Back/Forward ripristina posizione di scroll.
- MUST: navigazione con `<a>`/`<Link>` (Cmd/Ctrl/middle-click devono funzionare).
- NEVER: usare `<div onClick>` per navigazione.

### Feedback
- SHOULD: optimistic UI quando utile, con rollback/Undo in caso di failure.
- MUST: azioni distruttive con conferma o finestra Undo.
- MUST: toast/validazioni con `aria-live="polite"` o strategia equivalente non invasiva.
- SHOULD: usare `…` per azioni con follow-up ("Rinomina…") e loading ("Caricamento…").

### Touch & Drag
- MUST: target generosi e affordance chiare; evitare interazioni finicky.
- MUST: tooltip con ritardo alla prima apertura; successivi sibling immediati.
- MUST: `overscroll-behavior: contain` in modali/drawer.
- MUST: durante drag, disabilitare text selection e rendere inert gli elementi non coinvolti.
- MUST: se sembra cliccabile, deve esserlo davvero.

### Autofocus
- SHOULD: autofocus su desktop solo con singolo input primario; raramente su mobile.

---

## 2. Animation

- MUST: rispettare `prefers-reduced-motion` con variante ridotta o disattivazione.
- SHOULD: preferire CSS, poi Web Animations API, poi librerie JS.
- MUST: animare solo `transform` e `opacity` salvo eccezioni tecniche motivate.
- NEVER: animare proprieta layout (`top`, `left`, `width`, `height`).
- NEVER: usare `transition: all`; dichiarare proprieta esplicite.
- SHOULD: animare solo per chiarire causa/effetto o feedback intenzionale.
- SHOULD: easing coerente con distanza/tipo trigger.
- MUST: animazioni interrompibili e input-driven (no autoplay decorativo).
- MUST: `transform-origin` fisicamente coerente col moto percepito.
- MUST: per SVG complessi, applicare transform su wrapper `<g>` con `transform-box: fill-box`.

---

## 3. Layout

- SHOULD: usare allineamento ottico quando migliora la percezione (aggiustamenti minimi ammessi).
- MUST: allineamento deliberato a griglia/baseline/edge; niente placement accidentale.
- SHOULD: bilanciare lockup icona/testo (peso, scala, spaziatura, colore).
- MUST: verificare mobile, laptop e ultra-wide (simulare ultra-wide anche via zoom out).
- MUST: rispettare safe area (`env(safe-area-inset-*)`) su shell sticky/fixed.
- MUST: evitare scrollbar spurie e overflow non intenzionali.
- SHOULD: privilegiare flex/grid rispetto a misurazioni JS per layout.

---

## 4. Content & Accessibility

- SHOULD: help inline prima dei tooltip.
- MUST: skeleton coerenti con layout finale per evitare layout shift.
- MUST: `<title>` coerente col contesto corrente.
- MUST: nessun dead-end: sempre prossimo step o recovery path.
- MUST: progettare esplicitamente stati empty/sparse/dense/error.
- SHOULD: preferire virgolette tipografiche dove il tone lo richiede; evitare vedove/orfane (`text-wrap: balance` quando utile).
- MUST: numeri comparativi con `font-variant-numeric: tabular-nums`.
- MUST: stato comunicato con segnali ridondanti (non solo colore); icone con testo.
- MUST: accessible name presente anche quando la label visuale e assente.
- MUST: usare il carattere `…` (non `...`) nei copy di continuita.
- MUST: heading con gerarchia corretta (`h1`-`h6`), `scroll-margin-top` e "Skip to content".
- MUST: UI resiliente a contenuti user-generated (molto corti, medi, molto lunghi).
- MUST: date/ore/numeri locale-aware (`Intl.DateTimeFormat`, `Intl.NumberFormat`).
- MUST: `aria-label` accurati; elementi decorativi con `aria-hidden="true"`.
- MUST: bottoni icon-only con `aria-label` descrittivo.
- MUST: preferire semantica nativa (`button`, `a`, `label`, `table`) prima di ARIA custom.
- MUST: non-breaking spaces per unita/coppie non separabili (`10&nbsp;MB`, `⌘&nbsp;K`).

---

## 5. Content Handling

- MUST: container testo robusti a overflow (`truncate`, `line-clamp-*`, `break-words`).
- MUST: figli flex che troncano devono avere `min-w-0`.
- MUST: gestire array/stringhe vuote senza UI rotta o placeholder ambiguo.

---

## 6. Performance

- SHOULD: verifiche anche in iOS Low Power Mode e Safari desktop.
- MUST: misurare in ambiente pulito (estensioni che alterano runtime disabilitate).
- MUST: tracciare e ridurre re-render evitabili (React DevTools/React Scan).
- MUST: profilare con CPU/network throttling.
- MUST: batch layout reads/writes per evitare reflow/repaint inutili.
- MUST: mutation UX (`POST`/`PATCH`/`DELETE`) target <500ms percepiti quando sotto controllo client/server.
- SHOULD: preferire uncontrolled inputs se i controlled non sono economicamente cheap per keystroke.
- MUST: virtualizzare liste grandi (>50 elementi renderizzati simultaneamente).
- MUST: preload immagini above-the-fold, lazy-load per il resto.
- MUST: prevenire CLS (dimensioni immagini esplicite).
- SHOULD: `preconnect` per CDN critici.
- SHOULD: font critici preloaded + `font-display: swap`.

---

## 7. Dark Mode & Theming

- MUST: dark theme con `color-scheme: dark` su `<html>` quando il tema attivo e scuro.
- SHOULD: `theme-color` del browser coerente con background pagina.
- MUST: su `<select>` nativi impostare `background-color` e `color` espliciti (compatibilita Windows).

---

## 8. Hydration

- MUST: input con `value` devono avere `onChange` (oppure usare `defaultValue`).
- SHOULD: proteggere rendering date/ora da hydration mismatch (SSR/CSR).

---

## 9. Visual Design

- SHOULD: ombre stratificate (ambient + direct) per profondita credibile.
- SHOULD: bordi semitrasparenti + ombra per edge nitidi.
- SHOULD: nested radii coerenti (child <= parent).
- SHOULD: hue consistency: border/shadow/text leggermente tinti verso hue di sfondo.
- MUST: chart accessibili (palette color-blind-friendly).
- MUST: contrasto adeguato; preferire APCA come riferimento operativo quando applicabile.
- MUST: aumentare contrasto su stati `:hover`, `:active`, `:focus`.
- SHOULD: browser UI cromaticamente coerente con superficie pagina.
- SHOULD: evitare banding su gradient scuri (aggiungere texture/noise quando necessario).
