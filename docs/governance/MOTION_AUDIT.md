# Numa Motion Audit & Strategy

> **Obiettivo:** Definire il ruolo del motion in Numa come linguaggio semantico del prodotto, partendo dall'analisi della micro-animazione "Empty Budget".

---

## 1. Analisi Animazione Riferimento
**Contesto:** Card *Budget Mensile* (Stato: "Da pianificare" / Empty).
**File:** `src/features/budget/components/empty-budget-state.tsx`

| Caratteristica | Intervento | Dettaglio Tecnico |
| :--- | :--- | :--- |
| **Animazione Core** | `animate-bounce` | Applicata a un piccolo badge "€". Loop infinito ma su elemento minuscolo (6px). |
| **Interazione** | `group-hover:scale` | Il background "blob" si espande al passaggio del mouse. |
| **Entrata** | `animate-in fade-in` | La card appare dolcemente (`zoom-in-95`). |
| **Semantica** | **"Richiesta Attenzione Gentile"** | Il rimbalzo attira l'occhio su un'azione mancante (setup budget) senza usare colori allarmanti (rosso). L'espansione al mouse conferma: "Sì, sono cliccabile". |
| **Perché funziona** | **Scala ridotta** | L'animazione è confinata al 5% dell'area. Se l'intera card rimbalzasse, sarebbe ridicolo/fastidioso. Così è "vivo" e "premium". |

---

## 2. Principi di Motion (Numa Physics)
Dal caso analizzato deriviamo 4 regole auree per l'intera app:

1.  **Motion = Stato, Non Decorazione**
    Usiamo l'animazione solo per comunicare un cambiamento di stato (es. "Sto pensando", "Ho finito", "Attenzione qui") o una affordance (es. "Puoi cliccarmi").
2.  **Legge del 5% (Micro-Interaction)**
    Le animazioni di loop (come il bounce) devono occupare meno del 5% della UI visibile. Mai animare grandi layout in loop.
3.  **Risposta Fisica**
    L'interfaccia deve reagire all'input (hover, click, drag) come un oggetto fisico (scale, shadow lift), aumentando la percezione tattile "Premium".
4.  **Transizioni Morbide (No Hard Cuts)**
    I dati non devono "saltare". Il cambio di contesto (es. mese successivo) deve essere accompagnato da fade o slide impercettibili per mantenere la continuità cognitiva.

---

## 3. Audit Opportunità (App-Wide)

Scansione delle sezioni per identificare dove l'assenza di motion crea rigidità o dove lo stato semantico non è chiaro.

### Dashboard (Brain)
*   **Transizione Periodo (Mese Su/Giù):**
    *   *Stato Attuale:* I numeri cambiano istantaneamente (Hard Cut).
    *   *Problema:* Fatica cognitiva nel capire cosa è cambiato.
    *   *Opportunità:* **Fade-Transition** sui KPI numbers.
    *   *Classificazione:* ✅ **Consigliato** (Alto Valore Semantico).
*   **KPI Loading:**
    *   *Stato Attuale:* Skeleton (Statico).
    *   *Opportunità:* Skeleton con `shimmer` (già standard, verificare consistenza).

### Insights (Intelligence)
*   **AI Advisor Generation:**
    *   *Contesto:* Mentre l'AI genera l'analisi.
    *   *Opportunità:* Icona "Sparkles" che pulsa (`animate-pulse` o rotazione lenta).
    *   *Perché:* Conferma che il sistema sta lavorando ("Thinking State").
    *   *Classificazione:* ✅ **Consigliato** (Fiducia utente).

### Simulator (Playground)
*   **Slider Impact:**
    *   *Contesto:* Utente muove slider spesa.
    *   *Problema:* Il risultato cambia istantaneamente, ma l'occhio è sullo slider.
    *   *Opportunità:* Il box "Risparmio Stimato" dovrebbe avere un **Flash/Glow** (verde/rosso) quando il valore cambia significativamente.
    *   *Classificazione:* ✅ **Consigliato** (Feedback Causa-Effetto).

### Settings & Wizard (Configuration)
*   **Salvataggio Preferenze:**
    *   *Opportunità:* Icona check che si disegna (`path length animation`) al salvataggio.
    *   *Classificazione:* ⚠️ **Possibile** (Carino, ma non critico).
*   **CSV Drag & Drop:**
    *   *Opportunità:* Area di drop che "pulsa" magneticamente quando si trascina un file sopra.
    *   *Classificazione:* ⚠️ **Possibile** (Standard UX atteso).

---

## 4. Confini Rigidi (No-Go Zones)

Dove IL MOTION È VIETATO:

1.  **Lista Transazioni (Memory):**
    *   Assolutamente **nessun motion** su righe, importi o categorie durante lo scroll. La leggibilità deve essere cartacea.
    *   Eccezione: Unico motion ammesso è un impercettibile `background-color` fade quando si modifica una categoria in linea.
2.  **Valori Finanziari Critici (Tickers):**
    *   Mai usare "rolling numbers" (numeri che girano come slot machine) per il Saldo Finale. Trivializza il denaro. I numeri devono essere solidi.
3.  **Loop Grandi:**
    *   Mai animare intere card o sezioni in loop (eccetto il radar chart background che è *subtle* e dietro al contenuto).

---

## 5. Raccomandazione Strategica

**Stato:** L'app è solida ma "rigida" nelle transizioni dati.
**Azione:**
Non implementare decorazioni ora.
Pianificare un **"Motion Sprint" (Low Priority)** focalizzato solo su 2 punti:
1.  **Data Transitions:** Ammorbidire il cambio mese/filtro in Dashboard.
2.  **Feedback Loop:** Aggiungere feedback visivo (flash/pulse) nel Simulatore.

Questi due interventi coprono l'80% del valore percepito del motion in un'app fintech.
