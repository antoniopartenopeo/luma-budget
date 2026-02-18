---
name: numa-insights-semantics
description: Regole semantiche e invarianti per la generazione di testi in Insights e AI Advisor.
---

# Insights: Invarianti e Regole Semantiche

Questo documento definisce le regole semantiche OBBLIGATORIE per tutti i testi generati nella pagina Insights e nelle sezioni correlate (Flash Summary, AI Advisor, Trend Cards).

**Scopo**: Garantire che l'AI non faccia affermazioni semanticamente false, fuorvianti o "tone-deaf" (prive di tatto), proteggendo la fiducia dell'utente.

---

## 1. Definizioni Operative

Tutti i componenti devono aderire rigorosamente a queste definizioni matematiche.

| Termine | Formula / Condizione | Note |
| :--- | :--- | :--- |
| **Saldo Totale Stimato (Advisor)** | `baseBalanceCents - predictedRemainingCurrentMonthExpensesCents` | Metrica primaria della card Advisor. |
| **Spesa Residua Stimata** | `predictedRemainingCurrentMonthExpensesCents >= 0` | Mai negativa; può provenire da Brain o fallback storico. |
| **Fonte Core** | `currentMonthNowcastReady === true` | Etichetta consentita solo con nowcast realmente pronto (source interna: `brain`). |
| **Fonte Storico** | fallback attivo | Usare quando il Core non è pronto o non aggiornato sul dataset corrente. |
| **Risparmio (Savings)** | `(Income - Expenses) > 0` | Valido solo se strettamente positivo. Se negativo, è "Deficit" o "Perdita". |
| **Savings Rate** | `(Income - Expenses) / Income` | Calcolabile solo se `Income > 0`. Se `Income = 0`, il tasso è indefinito. |
| **Deficit** | `(Income - Expenses) < 0` | Saldo negativo in valore assoluto. |
| **Surplus** | `Savings > Threshold` | Non basta essere in attivo. Deve superare una soglia significativa (relativa o assoluta) per essere chiamato "Surplus". |

---

## 2. Never-Say Rules

Regole di esclusione per termini specifici in base allo stato finanziario.

| Condizione (Facts) | Termini Vietati 🚫 | Alternative Corrette ✅ | Esempio Ammesso |
| :--- | :--- | :--- | :--- |
| **Saldo Negativo** <br> `Income < Expenses` | "Risparmio", "Efficienza", "Surplus", "Stabile", "Ottimo", "Crescita" | "Deficit", "Recupero", "Riduzione perdite", "Disavanzo" | "Il disavanzo si è ridotto rispetto al mese scorso." |
| **Trend in Miglioramento ma ancora in perdita** <br> `OldSavings < NewSavings < 0` | "Efficienza aumentata", "Guadagno", "Successo" | "Miglioramento", " Recupero", "Positivo" | "La situazione sta migliorando, le perdite sono diminuite." |
| **Micro-Attivo** <br> `0 < Savings < 5% Income` (o `< €50`) | "Stabile", "Solido", "Sicuro" | "In equilibrio", "Bilanciato", "Marginale" | "Sei in equilibrio precario, con poco margine." |
| **Micro-Review** <br> `Surplus < Soglia Relativa` | "Surplus", "Investimento", "Fondo Emergenza" | "Piccolo margine", "Avanzo" | "Hai un piccolo avanzo disponibile." |
| **Budget Sforato** <br> `Expenses > Budget` | "Ottimo controllo", "Perfetto", "Gestione ideale", "Ottimo lavoro" | "Attenzione", "Revisione", "Fuori Ritmo", "Accelerazione" | "Stai spendendo più del tuo ritmo abituale." |

---

## 3. Linee Guida per il Narration Layer

L'architettura di Insights deve rispettare la separazione delle responsabilità per applicare queste regole.

### 3.1 Niente Calcoli nel Narrator
Il **Narrator** (funzioni `narrateX`) non deve mai eseguire calcoli matematici sui fatti.
*   🚫 `if (income - expense > 0)` -> VIETATO
*   ✅ `if (state === 'thriving')` -> CORRETTO

### 3.2 Derive-State Decide
Tutta la logica di classificazione ("Thriving", "Critical", "Stable") deve risiedere SOLO in `derive-state.ts`. È qui che si applicano le soglie (es. "Stable" richiede `savings > 5%`, non solo `> 0`).

### 3.3 Priorità dei segnali correnti
Quando è attivo un segnale critico/alto sul periodo corrente, i messaggi rassicuranti di bassa severità nello stesso orizzonte devono essere soppressi per evitare contraddizioni.

### 3.4 Vietate le Stringhe Inline
Nessun componente React (`use-ai-advisor.ts`, componenti UI) deve contenere logica di generazione testo con `if/else`. Tutto il testo deve provenire dal dominio `narration`.

---

## 4. Trust Semantics (Real Processing)

La fiducia deriva dalla coerenza tra stato UI e stato reale del calcolo.
*   **Regola No-Fake-Delay**: sono vietati ritardi artificiali per simulare "pensiero".
*   **Mandato**: gli stati "analisi in corso" devono dipendere solo da loading/query/calcolo reale.
*   **Cold Start Honesty**: in assenza dati, il copy deve dire "dati insufficienti", non "nessun alert".

---

## 5. Checklist di Validazione

Prima di approvare una PR su Insights, verificare:
1.  [ ] Il termine "Risparmio" è usato solo con saldo positivo?
2.  [ ] Termini entusiastici ("Ottimo", "Wow") sono disabilitati se c'è un Deficit?
3.  [ ] "Surplus" è usato solo per cifre significative?
4.  [ ] Nessun calcolo matematico dentro le stringhe di template?
5.  [ ] La formula Advisor usa `Saldo Totale Stimato = baseBalance - spesa residua stimata`?
6.  [ ] La fonte mostrata (`Core`/`Storico`) è coerente con il readiness reale?
7.  [ ] **Eseguire `npm test src/domain/narration/__tests__/semantic-enforcement.test.ts` e verificare che passi.**
---

**Versione**: 1.4.0  
**Ultimo aggiornamento**: 2026-02-18
