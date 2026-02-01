# Numa Motion Principles & Governance

> **Stato:** Attivo e Vincolante
> **Versione:** 1.1
> **Fonte:** Motion Audit (Feb 2026)

Questo documento definisce le regole immutabili per l'uso dell'animazione (Motion) all'interno dell'applicazione Numa. Il Motion in Numa è un linguaggio funzionale, non una decorazione estetica.

---

## 1. Scopo del Motion
In Numa, l'animazione ha tre soli scopi legittimi:
1.  **Comunicare Stato:** Segnalare che il sistema sta lavorando, ha finito, o richiede attenzione.
2.  **Mantenere il Contesto:** Guidare l'occhio durante i cambi di dati per evitare "salti" cognitivi (Object Permanence).
3.  **Migliorare l'Affordance:** Suggerire interattività (es. hover states) senza testo esplicito.

**Regola d'Oro:** Se un'animazione non assolve a uno di questi scopi, va eliminata.

---

## 2. Principi Fondamentali

### A. Motion = Semantica
Ogni movimento deve corrispondere a un evento logico del sistema.
*   *Caricamento* -> Skeleton Shimmer / Pulse
*   *Cambio Filtro* -> Crossfade
*   *Azione Utente* -> Feedback fisico immediato

### B. Legge del 5% (Micro-Interaction)
Le animazioni continue (loop, bounce, pulse) non devono mai occupare più del **5%** dell'area visibile della viewport.
*   ✅ Badge che pulsa, icona che ruota.
*   ❌ Intera card che trema, sfondi animati a tutto schermo.

### C. Sobrietà Fisica
Preferiamo transizioni che non "spostano" troppi pixel.
*   ✅ **Preferiti:** Opacity (Fade), Scale (Zoom leggero), Colors.
*   ⚠️ **Con Cautela:** Slide (Spostamento spaziale), Rotation.
*   ❌ **Vietati:** Flip 3D, Rimbalzi elastici esagerati.

### D. Timing e Easing (Premium Standard)
*   **Default Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-like friction). Mai usare `linear` o `ease-out` standard per le entrate UI.
*   **Durata:** 
    *   *Micro:* 200-300ms (Click, Hover)
    *   *Macro:* 500-600ms (Page Entry, Grid Replace)
    *   *Feedback:* 800ms (Decay lento per flash di successo)

### E. Libreria Primitive (Globals.css)
Usare ESCLUSIVAMENTE queste 3 primitive definite a livello globale. Non inventare keyframe custom nei componenti.

| Nome | Easing | Uso Obbligatorio |
| :--- | :--- | :--- |
| `animate-enter-up` | Custom Bezier | Entrata di liste, griglie, card. Sostituisce `fade-in`. |
| `animate-pulse-soft` | Ease-in-out | Stati di caricamento/attesa (Thinking). Sostituisce `pulse`. |
| `animate-flash-green`| Ease-out decay | Feedback positivo immediato (es. Aggiornamento soldi). |

---

## 3. Mappa delle Zone (Zoning)

### ✅ Zone Consentite (Motion-Positive)
1.  **Dashboard (Macro):** Transizioni morbide tra periodi temporali sui KPI.
2.  **Insights (Intelligence):** Feedback visivo ("thinking") durante l'elaborazione AI.
3.  **Simulatore (What-If):** Feedback immediato causa-effetto sugli slider.
4.  **Empty States:** Micro-animazioni per invitare all'azione (es. "Inizia qui").

### ❌ Zone Vietate (Static-Only)
1.  **Lista Transazioni:** Nessun movimento durante lo scroll, filtro o renderizzazione delle righe. La leggibilità è prioritaria.
2.  **Dati Finanziari Critici:** Il Saldo Finale e i totali di bilancio NON devono usare "rolling numbers" (slot machine effect). Devono essere solidi e stabili.
3.  **Tabelle Dense:** Nessuna animazione di riga/colonna.

---

## 4. Accessibilità & Performance

### Prefers-Reduced-Motion
Tutte le animazioni devono rispettare la media query `prefers-reduced-motion: reduce`.
In React/Framer Motion, usare hook condizionali o varianti CSS che azzerano la durata/spostamento.

### Performance
*   Animare solo proprietà composite: `transform` (translate, scale, rotate) e `opacity`.
*   Mai animare: `width`, `height`, `margin`, `padding` (causano reflow).

---

## 5. Regola di Estensione
L'introduzione di qualsiasi NUOVA animazione non prevista in questo documento richiede:
1.  Identificazione dello **Stato Semantico** che la giustifica.
2.  Verifica della **Legge del 5%**.
3.  Conferma che non ricada in una **Zona Vietata**.

Senza questi requisiti, la PR deve essere rifiutata.
