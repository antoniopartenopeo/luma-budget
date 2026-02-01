# Numa UX Standards & Patterns
> **Stato:** Active
> **Versione:** 0.2
> **Ultimo aggiornamento:** 2026-02-01

Questo documento raccoglie i pattern UX di alto livello che definiscono l'esperienza d'uso di Numa, al di là della pura UI.

---

## 1. Trust & AI Interaction

### A. Labor Illusion (Illusione dello Sforzo)
Quando l'AI esegue compiti complessi (come esaminare mesi di transazioni per dare un consiglio), una risposta istantanea (<100ms) viene percepita paradossalmente come "meno intelligente" o "finta".

**Regola:**
Per le operazioni "Intelligenti" (AI Advisor, Smart Analysis), è **OBBLIGATORIO** introdurre un ritardo artificiale (Artificial Delay) se la risposta tecnica è troppo veloce.

*   **Durata Minima:** 1.5s - 2.0s
*   **Stato Visivo:** Deve essere accompagnato da un'animazione semantica "Thinking" (`animate-pulse-soft`).
*   **Obiettivo:** Permettere all'utente di percepire che il sistema "sta lavorando per lui".

---

## 2. Feedback Loops

### A. Risposta Tattile
Ogni azione che modifica un valore finanziario (es. simulatore) deve restituire un feedback visivo immediato che confermi la relazione causa-effetto.

**Standard:**
*   Usa `animate-flash-green` sul contenitore del risultato.
*   Il feedback deve partire *immediatamente* al rilascio dell'input.
