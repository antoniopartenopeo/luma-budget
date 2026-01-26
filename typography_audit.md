# Audit Tipografico - NUMA Budget

**Data**: 2026-01-27
**Scope**: Mappatura descrittiva di font, pesi e dimensioni per ogni sezione.
**Font Base**: `Geist Sans` (Variable) - Default application font.
**Titoli Alternativi**: `Outfit` (Importato in `layout.tsx` ma **NON** utilizzato esplicitamente nelle classi Tailwind scannerizzate).

---

## 1. Budget (Reference)
**File Analizzati**: `budget/page.tsx`, `global-budget-card.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Page Title** | `text-3xl font-bold tracking-tight` | ~30px / 700 | Standard PageHeader |
| **Section Title** | `text-xl font-bold tracking-tight` | ~20px / 700 | In "Gruppi di Spesa" |
| **Hero Title** | `text-2xl font-bold tracking-tight` | ~24px / 700 | MacroSection (Premium) |
| **Hero Subtitle** | `text-sm font-medium text-muted-foreground` | ~14px / 500 | MacroSection |
| **Main KPI** | `text-4xl font-black tracking-tighter` | ~36px / 900 | Global Budget Amount |
| **KPI Label** | `text-[10px] uppercase font-bold tracking-wider` | 10px / 700 | Label "Analisi", Status badges |
| **Body/Narration** | `text-sm font-medium leading-relaxed` | ~14px / 500 | AI/Insight Text |

**Pattern**: Uso marcato di `tracking-tight` su titoli e `tracking-wider` su label maiuscole. Pesi estremi (`font-black`) per i numeri.

---

## 2. Simulatore (Reference)
**File Analizzati**: `simulator/page.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Page Title** | (PageHeader standard) | - | - |
| **Hero Title** | `text-2xl font-bold tracking-tight` | ~24px / 700 | MacroSection |
| **Hero Subtitle** | `text-sm font-bold uppercase tracking-widest` | ~14px / 700 | Divergenza: Uppercase vs CamelCase budget |
| **Main KPI** | `text-5xl font-black tracking-tighter` | ~48px / 900 | Savings Amount (Più grande del Budget) |
| **KPI Label** | `text-[10px] uppercase tracking-[0.3em] font-black` | 10px / 900 | "Risparmio Stimato" (Tracking estremo) |
| **Group Title** | `text-lg font-bold tracking-tight` | ~18px / 700 | Card dei gruppi |

**Pattern**: Simile al Budget ma con enfasi maggiore (`5xl`, `tracking-[0.3em]`) sulla Hero Card.

---

## 3. Dashboard
**File Analizzati**: `page.tsx`, `kpi-cards.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Page Title** | (PageHeader standard) | - | - |
| **Hero Title** | `text-xl` (Default MacroSection) | ~20px / 700 | "Panoramica Finanziaria" |
| **Grid KPI Value** | `text-2xl font-bold` | ~24px / 700 | Numeri nelle card piccole |
| **Grid KPI Label** | `text-sm font-medium text-muted-foreground` | ~14px / 500 | Titolo card KPI |
| **Grid Subtext** | `text-xs text-muted-foreground` | ~12px / 400 | Trend/Comparison |

**Incoerenza**: La Dashboard usa due `MacroSection` annidate. La `MacroSection` interna ("Overview Performance") introduce un titolo `text-xl` dentro una Hero `MacroSection` esterna. I numeri (`2xl`) sono molto più piccoli rispetto ai riferimenti (`4xl/5xl`).

---

## 4. Insights
**File Analizzati**: `insights-page-content.tsx`, `ai-advisor-card.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `text-2xl` (Premium MacroSection) | ~24px / 700 | "Numa AI Advisor" |
| **Hero Subtitle** | `text-sm font-bold uppercase tracking-widest` | ~14px / 700 | "Financial Intelligence" |
| **Main KPI** | `text-4xl font-black tracking-tighter` | ~36px / 900 | Forecast Savings |
| **Narration** | `text-lg font-bold tracking-tight` | ~18px / 700 | Smart Advice text (Più grande del Budget) |
| **Sub-section Title** | `text-xl font-bold tracking-tight` | ~20px / 700 | "Analisi Mensile" (div style) |

**Pattern**: Allineato al Simulatore per i sottotitoli uppercase e al Budget per i pesi `font-black`. Narrazione più evidente (`text-lg`).

---

## 5. Transazioni
**File Analizzati**: `transactions/page.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `text-xl` (Default MacroSection) | ~20px / 700 | "Elenco Movimenti" |
| **Empty State** | `text-xl font-bold tracking-tight` | ~20px / 700 | - |

**Pattern**: Tipografia molto sobria, funzionale alla tabella. Manca l'enfasi "Hero" presente in Budget/Simulatore.

---

## 6. Wizard (Import CSV)
**File Analizzati**: `wizard-shell.tsx`, `step-upload.tsx`

| Elemento | Font specs (Tailwind) | Size/Weight | Note |
| :--- | :--- | :--- | :--- |
| **Dialog Title** | `text-2xl font-bold` | ~24px / 700 | Nel Shell Header |
| **Step Title** | `text-lg font-semibold` | ~18px / 600 | - |
| **Upload Label** | `text-sm font-medium` | ~14px / 500 | - |

**Pattern**: Standard Dialog typography, meno "Brandizzato" rispetto alle pagine principali.

---

## Sintesi Incoerenze

1.  **Scale Numeriche (KPI)**:
    *   **Budget/Simulatore/Insights**: Usano `4xl` o `5xl` `font-black` `tracking-tighter`.
    *   **Dashboard**: Usa `2xl` `font-bold` (molto più piccolo).

2.  **Sottotitoli Hero**:
    *   **Budget**: `text-sm font-medium` (Sentence case).
    *   **Simulatore/Insights**: `text-sm font-bold uppercase tracking-widest` (All caps, bold).

3.  **Titoli MacroSection**:
    *   Alcuni usano variant "Premium" (`text-2xl`), altri default (`text-xl`).

4.  **Narrazione AI**:
    *   **Insights**: `text-lg font-bold`.
    *   **Budget**: `text-sm font-medium` (più discorsivo).

## Conclusioni
Il sistema tipografico base (`Geist`) è consistente.
Le divergenze principali riguardano la **Gerarchia Visuale (Size/Weight)** dei numeri KPI e lo stile dei **Sottotitoli** (Uppercase vs Sentence case) tra le card "Hero" delle diverse sezioni.
La Dashboard risulta la sezione con i KPI tipograficamente più deboli.
