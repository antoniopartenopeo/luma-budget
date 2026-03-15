# Template Report Audit Numa (Diagnostico, Read-Only)

Usare questo schema in output.
Non aggiungere sezioni di soluzione o remediation.

## 1. Valutazione complessiva del sistema (1-5)

- **Score complessivo:** [1-5]
- **Tesi diagnostica:** [2-5 frasi]
- **Allineamento a visione Numa:**
  - Fiducia: [Basso/Medio/Alto]
  - Chiarezza: [Basso/Medio/Alto]
  - Premium: [Basso/Medio/Alto]
  - Explainability: [Basso/Medio/Alto]

## 2. Architettura: punti solidi e fragili

- **Maturità architetturale (1-5):** [score]
- **Punti solidi:**
  - [finding + evidenza]
- **Punti fragili:**
  - [finding + evidenza]
- **Drift intenzione vs implementazione:**
  - [finding + evidenza]

## 3. Debito tecnico critico (top risks)

| ID | Area | Descrizione diagnostica | Tipo | Gravità | Impatto roadmap | Evidenza |
|---|---|---|---|---|---|---|
| TD-01 | ... | ... | Legacy\|Semantic Drift\|Fragility\|Overengineering | Low\|Medium\|High\|Critical | Basso\|Medio\|Alto | path/file |

### Codice da uccidere
- [elemento + evidenza]

### Codice da congelare
- [elemento + evidenza]

### Codice da proteggere
- [elemento + evidenza]

## 4. Scalabilità futura: principali failure mode

- **Future-proof score (1-5):** [score]
- **Failure mode principali:**
  - [FM-01: descrizione + trigger + evidenza]
  - [FM-02: descrizione + trigger + evidenza]
- **Punti di rottura governance nel tempo:**
  - [finding + evidenza]

## 5. UI/UX: livello di coerenza sistemica

- **Coerenza sistemica (1-5):** [score]
- **Zone ad alta coerenza:**
  - [area + evidenza]
- **Zone a media coerenza:**
  - [area + evidenza]
- **Zone a bassa coerenza:**
  - [area + evidenza]
- **Rotture dell'illusione premium:**
  - [finding + evidenza]

## 6. Tipografia, colori, materiali: drift principali

### Tipografia
- [drift + evidenza]

### Colori e semantica
- [drift + evidenza]

### Materiali/superfici/profondità
- [drift + evidenza]

## 7. Motion & percezione: coerenza temporale

- **Coerenza motion (1-5):** [score]
- **Motion che aiuta comprensione:**
  - [finding + evidenza]
- **Motion che indebolisce fiducia o chiarezza:**
  - [finding + evidenza]
- **Zone con motion eccessivo o assente:**
  - [finding + evidenza]

## 8. Rischi strategici se il sistema evolve senza interventi

1. [Rischio strategico + evidenza]
2. [Rischio strategico + evidenza]
3. [Rischio strategico + evidenza]

## Regole finali di compliance report

1. Scrivere solo diagnosi e valutazione critica.
2. Non includere fix, piani, refactor o redesign.
3. Distinguere osservazioni fattuali da inferenze.
