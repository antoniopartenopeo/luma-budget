---
name: numa-budget-semantics
description: Regole semantiche vincolanti per la gestione del Pacing Temporale (ex Budget).
---

# Pacing Temporale: Regole Semantiche e Invarianti

Questo documento definisce le regole semantiche OBBLIGATORIE per tutta la sezione Pacing (generata dai Goals) e per i messaggi narrativi correlati.

**Scopo**: Il "Budget" non esiste più come entità statica, ma come proiezione del "Ritmo" (Pacing). Il sistema deve comunicare in termini di *tempo* e *sostenibilità*, non di "limiti" o "risparmio".

---

## 1. Nuove Definizioni Operative

| Termine | Definizione |
| :--- | :--- |
| **Pacing Plan** | Il piano di spesa derivato automaticamente dal `ActiveRhythm` dei Goals. |
| **Cruise Speed** | La velocità di crociera ideale (baseline) per raggiungere il traguardo nel tempo previsto. |
| **Survival Mode** | Quando il `ProjectedOverrun` minaccia la sostenibilità del traguardo principale. |

---

## 2. Regole Vincolanti (B1 - B6)

> [!IMPORTANT]
> **Precedenza**: Il "Ritmo" (Goals) è la fonte di verità. Qualsiasi "Budget" visualizzato è solo una conseguenza del Ritmo scelto.

| Regola | Condizione | Vietato 🚫 | Ammesso ✅ | Note |
| :--- | :--- | :--- | :--- | :--- |
| **REGOLA B1 — No Early Praise** | `elapsedRatio < 15%` | "In linea", "OK", "Sotto controllo", "Ottimo lavoro" | **Stati neutrali:** `early_uncertain`, "Dati iniziali", "Analisi in corso" | Evita di validare un comportamento di spesa troppo presto. |
| **REGOLA B2 — Time Context** | Sempre | Giudizi assoluti ("Hai speso poco") | **Giudizi relativi:** "Hai speso poco *per questo momento del mese*" | Il valore assoluto non ha significato senza il tempo. |
| **REGOLA B3 — Pacing > Saving** | Sotto il limite ma ritmo alto | "Risparmio", "Sotto budget" | "Ritmo accelerato", "Consumo rapido" | L'obiettivo è la costanza (Pacing), non il risparmio fine a se stesso. |
| **REGOLA B4 — Goal Protection** | `projectedOverrun == true` | Rassicurazioni generiche | "Traguardo a rischio", "Deviazione dal percorso" | La priorità è proteggere il traguardo finale (Goal). |
| **REGOLA B5 — Non-Judgmental Deviation** | Overrun confermato | Termini punitivi ("Disastro", "Male") o celebrativi ("Wow") | **Linguaggio descrittivo:** "Ritmo insostenibile", "Deviazione rilevata" | Il sistema segnala la deviazione come un dato di fatto per permettere la correzione. |
| **REGOLA B6 — Data Integrity** | Dati incompleti | Stime di arrivo o proiezioni | "Dati insufficienti per la proiezione" | Mai inventare proiezioni senza dati solidi. |

---

## 3. Applicazione
Questa skill è **vincolante** per:
- **Goals Engine**: Calcolo delle proiezioni e messaggi di stato (`NUMAExperience`, `useGoalProjection`).
- **Dashboard**: KPI Cards e grafici di andamento (collegati al Pacing).
- **Insights**: Consigli finanziari (devono puntare al Ritmo, non al Budget).

---

## 4. Checklist di Validazione
1. [ ] I messaggi parlano di "Ritmo" o "Viaggio" invece di "Budget"?
2. [ ] L'early praise è bloccato (Regola B1)?
3. [ ] Le deviazioni sono notificate come rischi per il Traguardo (Regola B4)?
4. [ ] Il linguaggio è privo di giudizio morale (Regola B5)?
---

**Versione**: 1.1.0  
**Ultimo aggiornamento**: 2026-02-01
