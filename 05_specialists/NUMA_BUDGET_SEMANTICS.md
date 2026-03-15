---
name: numa-budget-semantics
description: Regole semantiche vincolanti per la gestione del Pacing Temporale (ex Budget).
---

# Pacing Temporale: Regole Semantiche e Invarianti

Regole obbligatorie per copy e stati legati a ritmo/budget.

**Scopo**: comunicare sostenibilita nel tempo, non giudizi assoluti su "spendi troppo/poco".

---

## 1. Definizioni operative

| Termine | Definizione |
|---|---|
| Pacing Plan | Piano spesa derivato dal ritmo attivo (Goals/Scenari). |
| Cruise Speed | Velocita sostenibile per rispettare il traguardo nel tempo. |
| Survival Mode | Stato di rischio quando la proiezione compromette il traguardo. |

---

## 2. Regole vincolanti (B1 - B6)

| Regola | Condizione | Vietato | Ammesso |
|---|---|---|---|
| B1 No Early Praise | `elapsedRatio < 15%` | lodi premature | stato neutro: "dati iniziali", "analisi in corso" |
| B2 Time Context | sempre | giudizi assoluti senza tempo | giudizi relativi al momento del mese |
| B3 Pacing > Saving | sotto limite ma ritmo alto | "risparmio" come esito automatico | "ritmo accelerato", "consumo rapido" |
| B4 Goal Protection | proiezione overrun | rassicurazioni generiche | "traguardo a rischio", "deviazione" |
| B5 Non-Judgmental | deviazione confermata | toni punitivi o celebrativi | linguaggio descrittivo e correttivo |
| B6 Data Integrity | dati incompleti | proiezioni inventate | "dati insufficienti" |

---

## 3. Ambito applicazione

Vincolante per:
- `src/domain/narration/derive-state.ts` (stati `BudgetState` / `SnapshotState`)
- `src/domain/narration/budget.narrator.ts` e snapshot narrators
- Dashboard e Insights quando mostrano segnali di ritmo/proiezione
- Simulator/Goals quando attivano un ritmo (`src/VAULT/goals/logic/rhythm-orchestrator.ts`)

### Separazione semantica con Advisor
- Advisor in Insights usa la metrica `Saldo Totale Stimato`.
- I messaggi pacing devono restare su ritmo/traguardo, non rietichettare la metrica Advisor.
- Se c e conflitto, priorita ai segnali di rischio corrente.

---

## 4. Checklist valida PR

1. [ ] Linguaggio di ritmo/percorso, non di budget statico punitivo
2. [ ] Early praise bloccato (B1)
3. [ ] Rischio traguardo esplicitato (B4)
4. [ ] Linguaggio non giudicante (B5)
5. [ ] Nessuna proiezione senza base dati (B6)

---

**Versione**: 1.2.1
**Ultimo aggiornamento**: 2026-02-11
