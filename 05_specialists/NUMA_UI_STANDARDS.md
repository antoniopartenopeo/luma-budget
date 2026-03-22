---
name: numa-ui-standards
description: Use when creating or modifying React components, styling, layouts, or implementing responsive behavior.
---

# Standard UI di Numa Budget

Questa skill definisce i vincoli operativi per componenti React, layout, styling e motion.

---

## Riferimenti Canonici

- Strategia UX trust/feedback: `/01_rules/UX_GOVERNANCE.md`
- Motion semantico: `/01_rules/MOTION_PRINCIPLES.md`
- Baseline tecnica MUST/SHOULD/NEVER: `/01_rules/UI_EXECUTION_STANDARDS.md`

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

Per pagine core app (`/dashboard`, `/transactions`, `/insights`, `/simulator`, `/settings`, `/brain`, `/updates`):
1. `PageHeader`
2. `StaggerContainer`
3. una macro-surface dominante (`MacroSection` o card equivalente)
4. contenuti subordinati con spaziatura coerente

Vincoli:
- evitare container stretti arbitrari (`max-w-4xl`) sulle pagine principali
- usare il container di sistema di `AppShell`
- favorire flusso verticale e leggibilita dei numeri
- su `/simulator` usare `ScenarioDeck` come superficie dominante, evitando pannelli risultati separati duplicati

## Landing Pubblica (`/`)

`/` non e una pagina core app e non deve imitare `AppShell` o `PageHeader`.

Pattern richiesto:
1. hero immersivo con promessa prodotto verificabile
2. anchor nav desktop compatta e non dispersiva
3. sezioni esplicative a blocchi (`MacroSection`) con motion minimo
4. demo sticky/scrollytelling che mostra un solo step attivo per volta
5. opzionalmente un solo explainer immersivo dedicato al Brain come approfondimento della fase forecast
6. CTA finale esplicita su local-first / zero-cloud / no account obbligatorio per la prima scansione
7. CTA finale diretta all'app (`/dashboard`)

Invarianti:
- ordine narrativo bloccato: import -> lettura del mese -> stima -> decisione su nuova fissa
- un eventuale focus Brain appartiene alla fase "stima", non apre una quinta promessa autonoma
- copy pubblico solo su feature reali, niente hype generico
- preview veritiere e isolate, mai dati utente reali
- navigazione pubblica limitata a anchor interne e app entry intenzionali
- su mobile il primo viewport deve mantenere leggibile promessa, descrizione e CTA principale
- il reveal finale del Brain hero deve richiudere il messaggio su controllo del mese e calma, non su promessa autonoma di AI

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
- animare preferibilmente solo `transform` e `opacity`
- vietato `transition: all`
- eccezione landing: reveal testuale, sticky demo e progress fill sono ammessi solo dentro la narrativa pubblica e frame preview isolati
- l'explainer Brain puo usare spring-smoothed parallax, blur di profondita e lens reveal solo se resta reduced-motion-safe, senza asset remoti e con surface finale leggibile

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

## Baseline Non Negoziabile (Estratto Operativo)

- keyboard support completo, focus visibile e gestione focus corretta su overlay
- target minimi: 24px desktop, 44px mobile
- mai bloccare paste nei form; errori inline e focus sul primo errore
- URL deve riflettere stato UI rilevante (tab/filtri/paginazione)
- navigazione con elementi semantici (`a`/`Link`), mai `div onClick`
- nessun dead-end: empty/error states con recovery path esplicito
- ridurre CLS (dimensioni media esplicite) e virtualizzare liste grandi (>50)
- semantica nativa prima di ARIA custom; icon-only button con `aria-label`
- layout resilienti a contenuto lungo (`min-w-0`, truncation/break-words)

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
8. [ ] Verifica `01_rules/UI_REGRESSION_CHECKLIST.md`
9. [ ] Verifica regole MUST/SHOULD/NEVER in `01_rules/UI_EXECUTION_STANDARDS.md`

---

**Versione**: 2.0.0
**Ultimo aggiornamento**: 2026-03-22
