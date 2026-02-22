---
name: numa-ui-standards
description: Use when creating or modifying React components, styling, layouts, or implementing responsive behavior.
---

# Standard UI di Numa Budget

Questa skill definisce i vincoli operativi per componenti React, layout, styling e motion.

---

## Guard di Attivazione

Se la skill non e attiva esplicitamente, fermati e chiedi conferma.

---

## Principio Fondamentale

> **UBI (Unified Behavioral Interface)**
> Un solo componente adattivo per tutti i device, nessuna duplicazione mobile/desktop.

---

## Overlay Pattern

| Tipo | Uso |
|---|---|
| `Sheet` | Detail/edit form, viste operative |
| `Dialog` | Wizard, overlay contenuto, modali informative |
| `AlertDialog` | Azioni distruttive |

Regole:
- stesso componente su ogni device
- no `*Mobile.tsx` / `*Desktop.tsx`

---

## Gerarchia Layout

Per pagine core (`/`, `/transactions`, `/insights`, `/simulator`, `/settings`, `/brain`):
1. `PageHeader`
2. `StaggerContainer`
3. una macro-surface dominante (`MacroSection` o card equivalente)
4. contenuti subordinati con spaziatura coerente

Vincoli:
- evitare container stretti arbitrari (`max-w-4xl`) sulle pagine principali
- usare il container di sistema di `AppShell`
- favorire flusso verticale e leggibilita dei numeri
- su `/simulator` usare `ScenarioDeck` come superficie dominante, evitando pannelli risultati separati duplicati

---

## Materiali e Geometria

- Macro surfaces: `rounded-[2.5rem]`, `glass-panel`, `shadow-xl`
- Micro surfaces: `rounded-xl`, `glass-card`
- Brand primary: `primary` (`oklch(0.6 0.16 200)`)
- Vietato usare `indigo` come colore principale per stati attivi/CTA

---

## Motion System

### Primitive globali consentite (`src/app/globals.css`)
- `animate-enter-up`
- `animate-pulse-soft`
- `animate-flash-green`
- `animate-ping-slow`
- `animate-spin-slow`

### Eccezione ammessa
Le animazioni state-based Radix/Shadcn (`data-[state=*]:animate-*`) sono consentite per `Dialog`, `Sheet`, `Popover`, `Dropdown`, `Select`.

### Regole
- no fake delay per operazioni AI/analisi
- motion continuo solo su elementi a bassa dominanza visiva
- rispettare `prefers-reduced-motion`

---

## Regole Tailwind

### Consentito
- classi standard Tailwind + breakpoint responsive
- utility arbitrarie solo dove c e motivazione tecnica chiara

### Vietato
- inline style per styling statico
- branching render per device (`useMediaQuery`, `if (isMobile)`)

### Eccezione inline style
Permesso solo per valori runtime non rappresentabili a classi (es. `chartHeight`, `strokeDashoffset`, palette dinamiche SVG/canvas).

---

## Typography (Locked)

| Livello | Classe consigliata | Uso |
|---|---|---|
| Hero Title | `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight` | Titolo pagina |
| Section Title | `text-lg sm:text-xl lg:text-2xl font-bold tracking-tight` | Titolo macro-sezione |
| Main KPI | `text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter tabular-nums` | KPI primario |
| Card KPI | `text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter tabular-nums` | KPI secondario |
| Label | `text-[10px] font-bold uppercase tracking-wider text-muted-foreground` | Meta/label |
| Body | `text-sm font-medium leading-relaxed` | Narrazione, descrizioni |

Regole:
- numeri con `tabular-nums`
- body/description in `font-medium`
- evitare font-size custom non motivati

---

## Sheet Layout Standardizzato

Pattern obbligatorio:

```tsx
<SheetContent className="flex h-full flex-col p-0">
  <SheetHeader className="shrink-0 border-b p-6">...</SheetHeader>
  <div className="flex-1 overflow-y-auto p-6">...</div>
  <div className="shrink-0 border-t p-6">...</div>
</SheetContent>
```

Invarianti:
- scroll solo nel body (`flex-1 overflow-y-auto`)
- header/footer fissi con bordo separatore
- bottoni action primari coerenti (`h-12` quando applicabile)

---

## Checklist UI/UX (DoD minima)

1. [ ] Nessun branching mobile/desktop
2. [ ] Macro geometry e materiali coerenti (`rounded-[2.5rem]`, `glass-panel`)
3. [ ] Motion conforme alle primitive e a `prefers-reduced-motion`
4. [ ] Nessun fake loading su AI/analisi
5. [ ] Etichette fonte previsione coerenti (`Fonte Core` o `Fonte Storico`)
6. [ ] Typography coerente con scala ufficiale
7. [ ] Nessun inline style statico non giustificato
8. [ ] Verifica `/.agent/rules/ui-regression-checklist.md`

---

**Versione**: 1.8.0
**Ultimo aggiornamento**: 2026-02-22
