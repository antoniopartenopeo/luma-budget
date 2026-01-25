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

## Struttura Pagina Standard

```tsx
<div className="container mx-auto p-4 md:p-8 space-y-8">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Titolo</h1>
      <p className="text-muted-foreground mt-1">Sottotitolo</p>
    </div>
    {/* Azioni */}
  </div>
  
  {/* Contenuto */}
</div>
```

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

## Componenti Pattern

### Posizione

`src/components/patterns/` per pattern riutilizzabili:
- `ConfirmDialog` → Conferme distruttive
- `KpiCard` → Card metriche
- `EmptyState` → Stato vuoto

### Posizione UI Primitives

`src/components/ui/` per primitives shadcn/radix

---

## Checklist Pre-Commit

- [ ] Nessun inline style
- [ ] Nessun componente `*Mobile/*Desktop`
- [ ] Responsive solo con CSS/Tailwind
- [ ] Overlay corretti (`Sheet`, `Dialog`, `AlertDialog`)
- [ ] Layout flex corretto per scroll
- [ ] Spacing dalla scala standard

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2026-01-24
