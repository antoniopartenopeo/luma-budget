# Numa UX Standards & Patterns
> **Stato:** Active
> **Versione:** 1.1
> **Ultimo aggiornamento:** 2026-02-11

Questo documento raccoglie i pattern UX di alto livello che definiscono l'esperienza d'uso di Numa, al di là della pura UI.

---

## 1. Trust & AI Interaction

### A. Real Processing Honesty (No Fake Delay)
Numa deve comunicare in modo trasparente: lo stato "in analisi" va mostrato solo quando c'è lavoro reale in corso.

**Regola:**
Per le operazioni "Intelligenti" (AI Advisor, Smart Analysis), è **VIETATO** introdurre ritardi artificiali solo per simulare intelligenza.

*   **Fonte dello stato:** `loading` reale (query/calcolo effettivo), non timer forzati.
*   **Stato Visivo:** lo stato di attesa deve riflettere il ciclo tecnico reale.
*   **Obiettivo:** affidabilità percepita attraverso coerenza tra stato UI e stato computazionale.

---

## 2. Feedback Loops

### A. Risposta Tattile
Ogni azione che modifica un valore finanziario (es. simulatore) deve restituire un feedback visivo immediato che confermi la relazione causa-effetto.

**Standard:**
*   Usa `animate-flash-green` sul contenitore del risultato.
*   Il feedback deve partire *immediatamente* al rilascio dell'input.

---

## 3. Brand Identity & Geometry

### A. Color Palette (LOCKED)
Numa utilizza un'identità Premium basata sul Teal.
*   **Primary State**: `primary` (Numa Teal - `oklch(0.6 0.16 200)`).
*   **Banned**: Vietato l'uso di Indigo o colori generici Tailwind per stati attivi o call-to-action primarie.

### B. Geometry Scale
La geometria segue una gerarchia di importanza:
*   **Macro Surfaces**: `rounded-[2.5rem]` (40px) per container principali e MacroSections.
*   **Micro Surfaces**: `rounded-xl` (16px) per card interne, sezioni di dettaglio e input.
