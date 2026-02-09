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
- **Livello 2 (Subordinato)**: Card interne o grid. DEVONO usare `glass-card` (che include `shadow-sm` e `border`) per garantire l'effetto **Premium 3D**. **VIETATO** il design "Flat" (`shadow-none`, `border-none`) su elementi strutturali.

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

### 1. Materiali & Superfici
- **Glass Panel (Standard)**: `bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20`.
- **Glass Overlay (Sheet/Dialog)**: DEVE usare lo stesso materiale della Top Bar: `bg-white/60` (non 80/90) `backdrop-blur-xl` per garantire coerenza visiva.
- **Background**: `bg-[#F8F9FA]` (light) / `bg-black` (dark) + Ambient Mesh Gradients.
- **Card**: `rounded-[2.5rem]` (Macro) o `rounded-xl` (Micro).
- **Brand Color**: `primary` (Numa Teal - oklch(0.6 0.16 200)). **VIETATO** l'uso di `indigo` per stati attivi.
- **Shadows**: `shadow-xl` + **Ambient Glows** (gradienti radiali sfocati) per stati critici.

### 2. Motion System (Premium Standard)
- **Primitives Only**: Usare **ESCLUSIVAMENTE** le classi globali `src/app/globals.css`.
    - `animate-enter-up`: Entrata standard per card/griglie (sostituisce fade-in).
    - `animate-pulse-soft`: Stati di attesa/thinking (sostituisce pulse).
    - `animate-flash-green`: Feedback successo azione (sostituisce flash).
- **Easing**: Il default è `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-like friction).
- **Divieti**: Vietato usare utility standard come `animate-in fade-in` o `animate-pulse`.

### 3. UX Patterns (Critical)
- **Labor Illusion (AI)**: Ogni operazione "Intelligente" (es. Advisor) DEVE avere un ritardo artificiale di almeno **1.5s - 2.0s** per permettere all'utente di vedere l'animazione "Thinking".
- **Tactile Feedback**: Ogni slider o input che cambia valori monetari deve triggerare `animate-flash-green` sul risultato.

### 4. Ultra-Tech Premium Visuals (Command Center)
Per sezioni ad alto impatto (Dashboard, Insights), utilizzare il pattern **Ultra-Tech**:
- **Componente Core**: `PremiumChartSection` (`src/features/dashboard/components/charts/premium-chart-section.tsx`).
- **Visuals**:
    - **Radar Background**: Impulsi neon (`animate-ping`) circolari. Devono essere posizionati nello slot `background` della `MacroSection` per garantire un effetto full-bleed (dietro header e content).
    - **Immersive Timing**: Animazioni di ingresso dei dati sensibili (es. radar o slice del grafico) possono estendersi fino a **5000ms** per enfatizzare il carattere analitico/premium.
    - **Focus-Mode**: Al passaggio del mouse, nascondere gli elementi non attivi (`blur state`) per evitare sovrapposizioni e guidare l'occhio.
    - **Kinetic Labels**: Etichette esterne che scalano e si illuminano in sincronia con i segmenti del grafico.
    - **Pure Glass**: Preferire centri vuoti o estremamente minimalisti per grafici a ciambella.
- **Theme Awareness**: Il componente gestisce automaticamente i colori di contrasto tra Light e Dark mode.

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

---

## Layout Sheet Standardizzato

Ogni `SheetContent` deve seguire rigorosamente questo schema flex-box per garantire che le azioni (Header/Footer) restino ancorate durante lo scroll.

```tsx
<SheetContent className="flex flex-col h-full p-0 ...">
  {/* 1. Header: Titolo + Icona + Bordo */}
  <SheetHeader className="shrink-0 p-6 border-b border-white/20">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 ...">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex flex-col">
        <SheetTitle className="text-xl font-bold tracking-tight">Titolo</SheetTitle>
        <SheetDescription className="text-sm font-medium">Descrizione premium.</SheetDescription>
      </div>
    </div>
  </SheetHeader>

  {/* 2. Body: Contenuto scrollabile */}
  <div className="flex-1 overflow-y-auto p-6 space-y-6">
    {/* Form o informazioni */}
  </div>

  {/* 3. Footer: Azioni + Bordo + Blur */}
  <div className="shrink-0 p-6 bg-white/40 dark:bg-white/5 border-t border-white/20 backdrop-blur-md">
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="h-12 ...">Annulla</Button>
      <Button className="h-12 ...">Salva</Button>
    </div>
  </div>
</SheetContent>
```

### Regole Invarianti del Layout
1. **Scrolling**: Solo il body (`flex-1 overflow-y-auto`) deve scorrere.
2. **Padding**: Usare `p-0` sullo `SheetContent` e re-iniettare il padding `p-6` nelle 3 micro-sezioni.
3. **Bordi**: Header e Footer devono essere separati dal corpo via `border-b` / `border-t`.
4. **Altezza Bottoni**: Sempre `h-12`.
5. **Icone Header**: Standard `h-6 w-6`.


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
**Fluidità**: Per Titoli e KPI è incoraggiato l'uso di breakpoint Tailwind per rendere il testo "fluido" tra mobile e desktop (es. `text-2xl sm:text-3xl lg:text-4xl`).

| Livello | Tailwind Class | Uso Obbligatorio |
| :--- | :--- | :--- |
| **Hero Title** | `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight` | Titoli principali pagine |
| **Section Title** | `text-lg sm:text-xl lg:text-2xl font-bold tracking-tight` | Titoli MacroSections |
| **Hero Eyebrow**| `text-[10px] font-bold uppercase tracking-wider` | Sottotitoli / Badge Hero |
| **Main KPI** | `text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter tabular-nums` | KPI Primario Pagina |
| **Card KPI** | `text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter tabular-nums` | KPI Card Secondarie |
| **Label** | `text-[10px] font-bold uppercase tracking-wider text-muted-foreground` | Etichette, Intestazioni colonne |
| **Body/Narration**| `text-sm font-medium leading-relaxed` | Testo discorsivo, AI Insights |
| **Empty State** | `text-xl font-bold tracking-tight` | Titolo stati vuoti |

> [!TIP]
> **Fluid Rule**: Se un KPI o un Titolo risulta troppo ingombrante su mobile, usa `text-xl sm:text-2xl lg:text-3xl` invece di una classe fissa. La scala deve essere armoniosa.

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

Ogni feature/componente deve passare la **UI Regression Checklist** (`.agent/rules/ui-regression-checklist.md`) prima di essere considerata **COMPLETA**.

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
- [ ] **Padding**: Padding interno adattivo (`px-4` su mobile, `px-8` su desktop per card principali).
- [ ] **Background Slot**: Sezioni con animazioni grafiche devono usare lo slot `background` della `MacroSection`.

### 4. Animazioni
- [ ] **Pattern**: Utilizzato lo standard `scale-in 0.98` (non `y: 10`).
- [ ] **Duration**: Durata fissa di `500ms`.
- [ ] **Smoothness**: Le transizioni sono fluide e non scattose.

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

**Versione**: 1.4.0  
**Ultimo aggiornamento**: 2026-02-04
