---
name: numa-budget-semantics
description: Regole semantiche vincolanti per la gestione del budget e del pacing temporale.
---

# Budget: Regole Semantiche e Invarianti

Questo documento definisce le regole semantiche OBBLIGATORIE per tutta la sezione Budget e per i messaggi narrativi correlati.

**Scopo**: Impedire che il sistema fornisca false rassicurazioni ("Early Praise") o ignori il fattore tempo ("Pacing"), garantendo una comunicazione onesta e proattiva sullo stato delle finanze dell'utente.

---

## 1. Definizioni Operative

| Termine | Definizione |
| :--- | :--- |
| **utilizationRatio** | `spentCents / budgetLimitCents` |
| **elapsedRatio** | `currentDay / totalDaysInPeriod` |
| **pacingRatio** | `utilizationRatio / elapsedRatio` |
| **projectedOverrun** | `(spentCents / elapsedRatio) > budgetLimitCents` |

---

## 2. Regole Vincolanti (B1 - B6)

> [!IMPORTANT]
> **Precedenza**: Se si applica la **REGOLA B1** (early-month), nessun'altra regola può produrre uno stato positivo o elogiativo.

| Regola | Condizione | Vietato 🚫 | Ammesso ✅ | Note |
| :--- | :--- | :--- | :--- | :--- |
| **REGOLA B1 — No Early Praise** | `elapsedRatio < 15%` | "In linea", "OK", "Sotto controllo", "Ottimo lavoro" | **Stati neutrali:** `early_uncertain`, "Dati iniziali", "Analisi in corso" | Evita di validare un comportamento di spesa troppo presto. |
| **REGOLA B2 — Pacing Required** | Mancanza di `elapsedRatio` o confronto spesa/tempo | Qualsiasi stato "On Track / OK" | **Stati prudenti:** "Stato non calcolabile", "Necessario contesto temporale" | Senza tempo, non c'è giudizio di andamento. |
| **REGOLA B3 — On Track ≠ Under Budget** | `spent < limit` MA `utilizationRatio > elapsedRatio` | Stato "On Track" | `at_risk`, "Spesa superiore alla proiezione temporale" | Essere sotto il limite non significa essere "in linea" se il ritmo è troppo alto. |
| **REGOLA B4 — At Risk Before Over** | `projectedOverrun == true` | Qualsiasi framing rassicurante | Stato `at_risk` obbligatorio | La protezione deve essere anticipata rispetto allo sforamento reale. |
| **REGOLA B5 — Over Budget** | `spent > limit` | Qualsiasi termine positivo ("Ottimo", "Wow") o giudizi punitivi | **Linguaggio descrittivo:** "Budget superato", "Limite raggiunto" | Il tono deve essere neutro e informativo, mai celebrativo dello sforamento. |
| **REGOLA B6 — Data Integrity** | Dati incompleti o import recente | Qualsiasi giudizio di andamento o performance | **Stati neutri / incerti:** `calm`, `neutral` | Ammesso **solo** per dati mancanti/parziali o assenza di segnale; **mai** come fallback per rischio o pacing errato. |

---

## 3. Applicazione
Questa skill è **vincolante** per:
- **Narration Layer**: Tutte le funzioni `deriveState` e `narrate` per il budget.
- **UI Components**: Colori, label e badge nelle card del budget (`BudgetProgressBar`, `GlobalBudgetCard`, etc.).
- **AI Advisor**: Qualsiasi consiglio o feedback riguardante la spesa corrente.

---

## 4. Checklist di Validazione
1. [ ] Il messaggio di "Ottimo lavoro" è disabilitato nei primi 4-5 giorni del mese?
2. [ ] Se l'utente ha speso il 50% del budget il giorno 10, lo stato è `at_risk` e non `ok`?
3. [ ] Il superamento del budget è comunicato senza toni entusiastici o derisori?
4. [ ] In assenza di transazioni o con import parziale, il sistema dichiara l'incertezza?
