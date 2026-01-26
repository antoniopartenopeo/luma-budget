---
name: numa-ui-standards
description: Use when creating or modifying React components, styling, layouts, or implementing responsive behavior.
---

# Standard UI di Numa Budget

Questa skill fornisce le procedure dettagliate per creare e modificare componenti React, layout, e stili.

---

## Guard di Attivazione

Se questa skill non è chiaramente attiva, **FERMATI** e chiedi all'utente di invocarla esplicitamente per nome.
Non procedere in modalità "best effort".

---

## Principio Fondamentale

> **UBI (Unitary/Unified Behavioral Interface)**: 
> Una sola struttura UI che si adatta, mai si duplica.

---

## Overlay Pattern

| Tipo | Uso | Esempio |
|------|-----|---------|
| `Sheet` | Form complessi, viste edit, mobile-friendly | Edit transazione, dettaglio categoria |
| `Dialog` | Conferme rapide, wizard step | Modal di conferma, step import |
| `AlertDialog` | Azioni distruttive | Elimina, reset dati |

### Regola Universale

- **STESSO componente** su tutti i device
- **MAI** creare `*Mobile.tsx` / `*Desktop.tsx`

---

## 2. Section Hierarchy Model: Monolithic Card

Per le pagine "Core" (Dashboard, Budget, Insights, Simulator, Transactions), vige la regola **MONOLITHIC CARD**.

### Regola del Monolite
Ogni sezione principale DEVE essere composta da:
1. **Header Pagina**: `PageHeader` (Titolo + Azioni Globali).
2. **Container**: `StaggerContainer`.
3. **MacroSection Dominante**: **UNA e UNA SOLA** `MacroSection` per pagina.
   - **Header**: Titolo sezione e Filtri (`headerActions`).
   - **Body**: Tutto il contenuto (KPI, Tabelle, Grafici).

### Gerarchia Visiva
- **Livello 0 (Sfondo)**: `bg-background`
- **Livello 1 (Dominante)**: `MacroSection` (`glass-panel`, `rounded-[2.5rem]`, `shadow-xl`).
- **Livello 2 (Subordinato)**: Card interne o grid (`bg-card/20` o `bg-transparent`). **VIETATO** usare shadow o glass pesanti per elementi interni al Monolite.

---

## Struttura Pagina Standard

```tsx
<div className="space-y-8 animate-in fade-in duration-500 w-full">
  {/* Header: PageHeader component preferred */}
  <PageHeader
    title="Titolo"
    description="Sottotitolo"
    actions={<Actions />}
  />
  
  {/* Contenuto: Macro-card full-width */}
  <Card className="rounded-[2.5rem] border-none glass-panel shadow-xl">
    {/* ... */}
  </Card>
</div>
```

> [!IMPORTANT]
> **MAI** usare `max-w-4xl` o limiti di larghezza arbitrari sulle pagine principali. 
> Il layout deve adattarsi al container di sistema (`max-w-7xl` fornito dall'AppShell).

---

## Numa Premium Aesthetic

Tutti i componenti principali devono seguire questi standard visuali:

### 1. Macro-Geometria
- **Border Radius**: `rounded-[2.5rem]` (40px) per tutte le macro-card principali.
- **Surface**: Classe `glass-panel` (backdrop-blur-xl, bg-white/60).
- **Shadows**: `shadow-xl` + **Ambient Glows** (gradienti radiali sfocati) per stati critici.

### 2. Motion System (Standard Numa)
- **Orchestrazione**: Usare sempre `StaggerContainer` (`src/components/patterns/stagger-container.tsx`) a livello di layout/pagina.
- **Vietato Motion Locale**: Non definire `initial`, `animate` o `transition` direttamente nei componenti. Usare i `Variants`.
- **Grammatica Scale-In**: L'ingresso deve avvenire tramite scale-in (`0.98` -> `1`) e fade-in opacità.
- **Divieto Y-Offset**: È severamente vietato l'uso di `y: 20` o simili per animazioni di ingresso.
- **Easing**: Usare `[0.22, 1, 0.36, 1]` per transizioni premium.

### 3. Tono & Feedback
- **Advisor-centric**: Gli stati vuoti o i messaggi di sistema devono avere un tono proattivo e "intelligente" (es. "Pianificazione Necessaria" invece di "Nessun Dato").
- **Visual Hierarchy**: Risparmio e focus primario sempre in evidenza con pesi font maggiori (font-black, tracking-tighter).

---

## UBI: 10 Regole Anti-Branching

| # | Regola | Pattern |
|---|--------|---------|
| 1 | **Overlay Universale** | `Sheet` per detail/edit, `Dialog` per wizard. Mai varianti `*Mobile` |
| 2 | **State Before Routes** | Transizioni UI con `useState`, non navigazione |
| 3 | **CSS-Only Responsiveness** | `hidden md:block`, `flex-col md:flex-row`. Mai `useMediaQuery` |
| 4 | **Flex Column Layout** | `flex flex-col h-full` + header/footer `shrink-0` + body `flex-1 overflow-y-auto min-h-0` |
| 5 | **Progressive Disclosure** | `Accordion`/`Tabs` per rivelare info. Mai pagine separate per mobile |
| 6 | **Reuse Across Contexts** | Stesso componente inline E in overlay |
| 7 | **Density Adaptation** | `p-4 md:p-8`, `text-sm md:text-base`. Mai rimuovere elementi per mobile |
| 8 | **Info Hiding Threshold** | `hidden md:block` per info secondarie, non componenti separati |
| 9 | **Confirm Patterns** | `ConfirmDialog` centralizzato per azioni distruttive |
| 10 | **No Device Branching** | Mai `ComponentMobile.tsx` / `ComponentDesktop.tsx` |

---

## Template Flex Layout

Per contenitori scrollabili con header/footer fissi:

```tsx
<div className="flex flex-col h-full">
  {/* Header fisso */}
  <div className="shrink-0 border-b p-4">
    Header
  </div>
  
  {/* Body scrollabile */}
  <div className="flex-1 overflow-y-auto min-h-0">
    Contenuto scrollabile
  </div>
  
  {/* Footer fisso */}
  <div className="shrink-0 border-t p-4">
    Footer
  </div>
</div>
```

---

## Regole Tailwind

### ✅ Permesso

- Classi standard: `p-4`, `gap-2`, `text-sm`
- Breakpoint: `md:p-8`, `lg:grid-cols-3`
- Nascondere elementi: `hidden md:block`

### ❌ Vietato

- Inline styles: `style={{...}}`
- Valori arbitrari problematici: `[13px]` per spacing
- `useMediaQuery` per render branching

### Scala Spacing

Usa la scala standard: `gap-1`, `gap-2`, `gap-4`, `gap-6`, `gap-8`

---

## Typography System (LOCKED)

La tipografia su NUMA è rigorosamente governata.
**Reference**: Budget & Simulatore.

### 1. Scala Ufficiale
Ogni testo deve appartenere a uno di questi livelli.
**È VIETATO** usare dimensioni o pesi arbitrari (es. `text-[13px]`, `font-semibold` se non previsto).

| Livello | Tailwind Class | Uso Obbligatorio |
| :--- | :--- | :--- |
| **Hero Title** | `text-2xl font-bold tracking-tight` | Titoli MacroSections |
| **Hero Eyebrow**| `text-[10px] font-bold uppercase tracking-wider` | Sottotitoli / Badge Hero |
| **Main KPI** | `text-4xl font-black tracking-tighter tabular-nums` | KPI Primario Pagina |
| **Card KPI** | `text-3xl font-black tracking-tighter tabular-nums` | KPI Card Secondarie |
| **Section Title**| `text-xl font-bold tracking-tight` | Titoli sottosezioni / Liste |
| **Label** | `text-[10px] font-bold uppercase tracking-wider text-muted-foreground` | Etichette, Intestazioni colonne |
| **Body/Narration**| `text-sm font-medium leading-relaxed` | Testo discorsivo, AI Insights |
| **Empty State** | `text-xl font-bold tracking-tight` | Titolo stati vuoti |

### 2. Regole di Applicazione
1.  **Numeri**: Usare sempre `tabular-nums` per cifre incolonnate (KPI, Tabelle).
2.  **Tracking**:
    *   `tracking-tight` o `tighter` per TITOLI e NUMERI GRANDI.
    *   `tracking-wider` per tutto ciò che è UPPERCASE (Labels, Eyebrows).
3.  **Pesi**:
    *   `font-black` (900) SOLO per KPI numerici.
    *   `font-bold` (700) per Titoli e Label.
    *   `font-medium` (500) per Body text (migliore leggibilità su sfondi glass).
4.  **Colore**:
    *   Titoli: `text-foreground`.
    *   Label/Eyebrow: `text-muted-foreground`.

### 3. Divieti Assoluti
> [!CAUTION]
> **È severamente vietato:**
> - Definire font-size arbitrari (es. `text-[13px]`).
> - Usare `font-semibold` (usare `font-bold` o `font-medium`).
> - Sovrascrivere i livelli della scala ufficiale nei singoli componenti.
> - Creare varianti "Mobile" dei testi (la scala è responsive-by-system non by-breakpoint).

---

## Componenti Pattern

### Posizione

`src/components/patterns/` per pattern riutilizzabili:
- `ConfirmDialog` → Conferme distruttive
- `KpiCard` → Card metriche
- `EmptyState` → Stato vuoto

### Posizione UI Primitives

`src/components/ui/` per primitives shadcn/radix

---

---

## Checklist di Verifica UI/UX (Obbligatoria)

Ogni feature/componente deve passare la **[UI Regression Checklist](file:///.agent/rules/ui-regression-checklist.md)** prima di essere considerata **COMPLETA**.

Il mancato rispetto anche di un solo punto della checklist tecnica automatizzabile è motivo di scarto della feature.

### 1. Layout & Struttura
- [ ] **Narrative Flow**: Il contenuto segue un flusso verticale logico. Nessuna colonna laterale persistente.
- [ ] **Full Width**: Le macro-card occupano tutto lo spazio disponibile nel container di sistema.
- [ ] **Responsive**: Il layout si adatta fluidamente senza "branching" (no `ComponentMobile.tsx`).

### 2. Macro-Geometria & Stile
- [ ] **Radius**: Le macro-card usano esattamente `rounded-[2.5rem]` (40px).
- [ ] **Surface**: Utilizzata la classe `glass-panel` per le superfici principali.
- [ ] **Shadows/Glows**: Ombre standard `shadow-xl` + `ambient-glows` per stati critici.

### 3. Spacing & Densità
- [ ] **Vertical Gap**: Spacing tra card/sezioni coerente (tipicamente `space-y-8` o `gap-6`).
- [ ] **Padding**: Padding interno uniforme (es. `p-8` desktop, `p-4` mobile).

### 4. Animazioni
- [ ] **Pattern**: Utilizzato lo standard `scale-in 0.98` (non `y: 10`).
- [ ] **Duration**: Durata fissa di `500ms`.
- [ ] **Smoothness**: Le transizioni sono fluide e non scattose.

### 5. Tone of Voice
### 5. Tone of Voice
- [ ] **Advisor Style**: I testi (empty states, errori) hanno un tono proattivo e intelligente.

### 6. Tipografia (Critical)
- [ ] **KPI Size**: I KPI principali usano `text-4xl` o `text-5xl` con `font-black`.
- [ ] **Card KPI**: I KPI nelle grid usano `text-3xl font-black` (NON `2xl bold`).
- [ ] **Tracking**: Labels uppercase hanno `tracking-wider`. Titoli hanno `tracking-tight`.
- [ ] **No Custom Sizes**: Nessun `text-[14px]` o simili. Solo classi Tailwind standard.

---

## Checklist Pre-Commit

- [ ] Superata **Checklist di Verifica UI/UX** sopra riportata
- [ ] Nessun inline style
- [ ] Nessun componente `*Mobile/*Desktop`
- [ ] Responsive solo con CSS/Tailwind
- [ ] Layout flex corretto per scroll

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2026-01-24
