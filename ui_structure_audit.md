# Audit Strutturale UI - Core Sections

**Data**: 2026-01-27
**Scope**: Analisi descrittiva della gerarchia e struttura delle sezioni principali.
**Vincolo**: Nessuna proposta di soluzione, solo descrizione dello stato attuale.

---

## 1. Insights
**File**: `src/features/insights/components/insights-page-content.tsx`

### Struttura Generale
La pagina utilizza un **Layout a Blocchi Multipli** orchestrato da `StaggerContainer`.
Non esiste una singola MacroSection che racchiude tutto il contenuto.

### Componenti Principali
1.  **AIAdvisorCard**: Card indipendente posizionata in cima.
2.  **TrendAnalysisCard**: Card indipendente successiva.
3.  **MacroSection ("Analisi Mensile")**: Card dedicata specificamente all'approfondimento mensile, contenente il selettore periodo e la lista di `InsightCard`.

### Gerarchia
- **Modello**: "Stack of Cards".
- **Dominanza**: Nessuna card domina visivamente l'intera pagina; sono sezioni distinte di peso simile.
- **Header**: Il titolo "Analisi Mensile" appartiene solo al terzo blocco, non alla pagina.

---

## 2. Simulatore
**File**: `src/app/simulator/page.tsx`

### Struttura Generale
La pagina utilizza un **Layout Hero + Lista Espansa**.
Il contenuto è diviso in due blocchi logici distinti non racchiusi in un unico contenitore grafico.

### Componenti Principali
1.  **MacroSection Hero ("Risultati Simulazione")**: Card prominente in cima (`PageHeader` -> `MacroSection`). Contiene i KPI globali e i controlli principali (slider, periodo).
2.  **Lista Gruppi**: Sotto la Hero, renderizzate direttamente nel layout, ci sono le card espanbili dei gruppi (`essential`, `comfort`, `superfluous`).

### Gerarchia
- **Modello**: "Hero + Detail List".
- **Dominanza**: La "Risultati Simulazione" funge da card principale di controllo/output.
- **Subordinazione**: Le card dei gruppi sono visivamente separate e seguono nel flusso verticale.

---

## 3. Budget
**File**: `src/app/budget/page.tsx`

### Struttura Generale
Simile al Simulatore, utilizza un **Layout Hero + Lista Espansa**.

### Componenti Principali
1.  **GlobalBudgetCard**: Card principale in cima (Layout di tipo `Card` standard).
2.  **Lista Gruppi**: Sequenza di `GroupBudgetCard` renderizzate sotto la card globale.

### Gerarchia
- **Modello**: "Hero + Detail List".
- **Dominanza**: `GlobalBudgetCard` stabilisce il contesto (Budget Totale).
- **Subordinazione**: I gruppi di spesa sono trattati come entità separate in sequenza.

---

## 4. Dashboard
**File**: `src/app/page.tsx`

### Struttura Generale
La pagina utilizza un **Layout a Griglia Aperta** (Open Grid/Widget).
Gli elementi sono posizionati direttamente all'interno dello `StaggerContainer` senza un contenitore grafico padre (MacroSection).

### Componenti Principali
1.  **DashboardFilterBar**: Barra filtri posizionata direttamente nel flusso.
2.  **DashboardKpiGrid**: Griglia di card KPI.
3.  **SpendingCompositionCard**: Card grafici.
4.  **RecentTransactions**: Card lista.

### Gerarchia
- **Modello**: "Widget Dashboard".
- **Dominanza**: Nessuna. È una collezione di widget indipendenti.
- **Assenza**: Non vi è alcuna `MacroSection` che raggruppa questi elementi (a differenza di quanto analizzato per il refactoring "Monolithic").

---

## 5. Transazioni
**File**: `src/app/transactions/page.tsx`

### Struttura Generale
La pagina utilizza un **Layout Rigorosamente Monolitico** (Strict Monolithic).
Tutto il contenuto operazionale è racchiuso in un'unica `MacroSection`.

### Componenti Principali
1.  **MacroSection ("Elenco Movimenti")**: Container unico e totale.
    - **HeaderActions**: Ospita la `TransactionsFilterBar`.
    - **Content**: Ospita `TransactionsSummaryBar` e `TransactionsTable`.

### Gerarchia
- **Modello**: "True Monolith".
- **Dominanza**: Totale. Esiste solo la `MacroSection` oltre al titolo pagina.
- **Subordinazione**: Tutti gli elementi (filtri, kpi, tabella) sono interni e subordinati al contenitore principale.

---

## Tabella Riassuntiva delle Strutture

| Sezione | Modello Strutturale | Wrapper Principale | Elementi Top-Level |
| :--- | :--- | :--- | :--- |
| **Insights** | Stack of Cards | Nessuno | 3 Card Distinte (Advisor, Trend, Analysis) |
| **Simulatore** | Hero + List | Nessuno | 1 Hero Card + 3 Group Cards |
| **Budget** | Hero + List | Nessuno | 1 Global Card + N Group Cards |
| **Dashboard** | Widget Grid | Nessuno | N Widgets indipendenti |
| **Transazioni** | True Monolith | **MacroSection** | **1 MacroSection Contentitore** |

## Pattern Analysis

### Pattern Comuni
- **PageHeader**: Presente uniformemente in tutte le sezioni.
- **StaggerContainer**: Utilizzato in Dashboard, Budget, Insights (per animazione ingresso).
- **Styling**: Uso diffuso di classi `glass-panel` e `rounded-[2.5rem]` (o simili) per le card, indipendentemente dalla gerarchia.

### Divergenze Strutturali
- **Transazioni** è l'unica sezione che incapsula **FILTRI** e **CONTENUTO** dentro una singola `MacroSection` con titolo.
- **Dashboard** espone i filtri e i widget come elementi fratelli nel DOM.
- **Insights/Budget/Simulatore** usano card multiple per separare logicamente i concetti (e.g. Globale vs Gruppi, Advisor vs Trend), mentre Transazioni unifica tutto.
