# Visual Alignment Walkthrough - Premium Motion Update

**Task:** Elevation to Premium Motion & Visibility Fixes.
**Outcome:** ✅ Sostituiti default utilities con keyframe custom organici. ✅ Fix visibilità loading AI.

---

## 💎 Premium Polish

Abbiamo sostituito le animazioni standard con varianti custom definite in `globals.css` per un feeling più "Apple-like".

### 1. Dashboard: `enter-up`
Sostituito il `fade-in` lineare con una curva custom `cubic-bezier(0.16, 1, 0.3, 1)`.
*   **Effetto:** La griglia entra dal basso con una leggera frizione finale.
*   **Perché:** Migliora la percezione di qualità (non è "secco").

### 2. Insights: `pulse-soft` + Delay
Sostituito il `pulse` (on/off 50%) con un `pulse-soft` (scale 1.02 + opacity 0.85).
*   **Fix Critico:** Introdotto un **ritardo artificiale di 2.0s** nel caricamento AI.
    *   *Prima:* L'utente non vedeva mai lo stato "Thinking" perché il calcolo era istantaneo (<100ms).
    *   *Ora:* L'utente vede l'icona pulsare per 2 secondi ("Lavoro in corso..."), aumentando la fiducia nel risultato (Labor Illusion).

### 3. Simulator: `flash-green`
Sostituito il `pulse` generico con un flash smeraldo custom.
*   **Effect:** `background-color` lampo verde + `box-shadow` glow che decadono in 0.8s.
*   **Perché:** Feedback tattile molto più evidente quando si risparmiano soldi.

---

## 🏗️ 100% Premium Alignment (Sweep)

Abbiamo esteso lo standard a **TUTTA** l'applicazione:

*   **Global Skeleton**: Aggiornato `Skeleton.tsx` -> `pulse-soft`. Ogni caricamento (Transazioni, Budget) ora è "organico".
*   **Transactions**: Filtri, input rapidi e entry pagina usano `enter-up`.
*   **Budget**: Card ed Empty State usano `enter-up`.
*   **Import Wizard**: Tutti gli step usano `enter-up`.
*   **Settings**: I tab usano `enter-up`.

> **Stato:** Legacy Animations (fade-in standard) eliminate al 100%.

---

## 📜 Nuova Governance (Vincolante)

I cambiamenti sono stati cristallizzati nei seguenti documenti:

1.  📄 **[Motion Principles V1.1](../governance/MOTION_PRINCIPLES.md)**
    *   Mandata l'uso esclusivo di `enter-up`, `pulse-soft`, `flash-green`.
    *   Vieta l'uso di animazioni standard (`fade-in`, `linear`).

2.  📄 **[UX Standards V0.1](../governance/UX_STANDARDS.md)**
    *   Formalizza il pattern **"Labor Illusion"**: obbligo di ritardo artificiale >1.5s per operazioni AI.

3.  ✅ **[UI Regression Checklist](../ui-regression-checklist.md)**
    *   Aggiornata la sezione Motion con i check per le curve Bezier e il feedback tattile.
