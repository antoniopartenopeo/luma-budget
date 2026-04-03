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

## User-Visible Change Ritual

Ogni change utente-visibile deve essere chiuso con il rituale canonico in:

- `/04_execution/USER_VISIBLE_CHANGE_RITUAL.md`

Questo vale per:

- pagine pubbliche e interne
- componenti UI
- copy, CTA, label, empty/error states
- motion, reveal, hover, reduced-motion behavior
- support surfaces, metadata pubblici e documentazione viva che racconta il prodotto

Non vale per refactor puramente tecnici senza impatto percepito.

Vincoli operativi:

- nessun change utente-visibile e "finito" senza review findings-first
- se un rilievo viene ripetuto due volte, va promosso a governance
- le superfici simili devono chiudere con verifica cross-surface, non solo locale

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

Per pagine core app (`/dashboard`, `/transactions`, `/transactions/import`, `/insights`, `/simulator`, `/settings`, `/brain`):
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
4. sezione statica `Come inizi` in 4 passaggi, senza scene animate dedicate
5. opzionalmente un solo explainer immersivo dedicato al Brain come approfondimento della fase forecast
6. CTA finale esplicita su local-first / zero-cloud / no account obbligatorio per la prima scansione
7. CTA finale diretta all'app (`/dashboard`)
8. support surface pubbliche reali per trust/FAQ/privacy senza affordance false

Invarianti:
- ordine narrativo bloccato: import -> lettura del mese -> stima -> decisione su nuova fissa
- un eventuale focus Brain appartiene alla fase "stima", non apre una quinta promessa autonoma
- copy pubblico solo su feature reali, niente hype generico
- preview veritiere e isolate, mai dati utente reali
- navigazione pubblica limitata a anchor interne e route pubbliche intenzionali (`/dashboard`, `/transactions/import`, `/faq`, `/privacy`, `/updates`)
- `/faq`, `/privacy` e `/updates` sono support surface standalone fuori `AppShell`; `/transactions/import` resta la route app-native raggiungibile anche dalla landing per prova sicura/demo
- eventuale CTA secondaria hero ammessa verso `/transactions/import` per prova sicura/demo, senza presentarla come signup o sync flow
- footer supporto solo con link reali a superfici pubbliche implementate
- hero e explainers immersivi della landing devono restare lo stesso componente adattivo su desktop, smartphone e contesti `prefers-reduced-motion`; puo cambiare solo l'intensita del motion, non il pattern visivo
- su mobile il primo viewport deve mantenere leggibile promessa, descrizione e CTA principale
- il reveal finale del Brain hero deve richiudere il messaggio su controllo del mese e calma, non su promessa autonoma di AI
- in dark la landing deve restare editoriale e quasi monocromatica: niente famiglie cromatiche concorrenti, il colore puo restare solo come eco minima

---

## Materiali e Geometria

- Macro surfaces: `rounded-[2.5rem]`, `glass-panel`, `shadow-xl`
- Micro surfaces: `rounded-xl`, `glass-card`
- Brand primary: `primary` (`oklch(0.6 0.16 200)`)
- Vietato usare `indigo` come colore principale per stati attivi/CTA
- In dark mode il materiale canonico e `ink / smoke / paper`: nero, grafite, bianco caldo e neutrali prima del colore
- Le classi shared (`liquid-capsule`, `liquid-chrome`, `glass-panel`, `glass-card`, `surface-*`) devono usare un highlight comune `torchlight white` molto velato, off-axis e non centrato in modo ripetitivo
- Glow cyan/teal/emerald in dark sono eccezioni locali esplicite, non grammatica di default
- Eyebrow, kicker e support surface in dark devono preferire neutrali attenuati (`foreground/white`) e non accenti cromatici forti

---

## Motion System

### Primitive globali consentite (`src/app/globals.css`)
- `animate-enter-up`
- `animate-pulse-soft`
- `animate-flash-green`
- `animate-ping-slow`
- `animate-spin-slow`

### Primitive React Centralizzate
- `AppleFluidMesh`: Per background immersivi, mesh gradient volumetrici animati nativamente in SVG. Usare con parsimonia (`z-0`, `pointer-events-none`) per mantenere l'estetica Apple Premium senza affaticamento cognitivo.

### Eccezione ammessa
Le animazioni state-based Radix/Shadcn (`data-[state=*]:animate-*`) sono consentite per `Dialog`, `Sheet`, `Popover`, `Dropdown`, `Select`.

### Regole
- no fake delay per operazioni AI/analisi
- motion continuo solo su elementi a bassa dominanza visiva
- rispettare `prefers-reduced-motion`
- `prefers-reduced-motion` sulla landing riduce movimento, blur e transizioni ma non sostituisce hero/explainer con layout alternativi semplificati
- animare preferibilmente solo `transform` e `opacity`
- vietato `transition: all`
- eccezione landing: reveal testuale, micro-motion su preview isolate e interludio Brain sono ammessi solo dentro la narrativa pubblica
- l'explainer Brain puo usare spring-smoothed parallax, blur di profondita e lens reveal solo se resta reduced-motion-safe, senza asset remoti e con surface finale leggibile

---

## Frozen Surfaces

- `src/features/dashboard/components/charts/spending-composition-card.tsx` e una frozen surface intenzionalmente preservata.
- Per default e fuori scope da refactor, cleanup, audit-fix, sweep UI, motion cleanup e standardizzazione cross-app.
- Restano congelati anche overlay espanso, `pointermove`, `rotateX` / `rotateY`, `perspective`, light-follow / parallax interno, copy, layout, materiali e motion locali di quella superficie.
- Se un refactor shared tocca import, token o motion contract usati da quella superficie, deve prima dimostrare che il comportamento resta invariato pixel/comportamento-wise; in assenza di questa garanzia, il refactor non e ammesso.
- Solo una richiesta esplicita che nomini `Composizione spese` puo sbloccare modifiche a quella sezione.

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

Per superfici utente-visibili, aggiungere anche:

- nessun wrap indesiderato nei titoli dove la composizione richiede una riga singola
- niente salti di scala arbitrari tra section header, editorial card e hero-card della stessa famiglia
- micro-label e eyebrow devono parlare una sola grammatica per superficie
- se una nuova scala tipografica viene introdotta e riusata, deve essere promossa a token o primitive canonica

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
5. [ ] Etichette fonte previsione coerenti (`Fonte Core` o `Fonte Storico`) su Dashboard, Insights, topbar, Goals e superfici derivate
6. [ ] Typography coerente con scala ufficiale
7. [ ] Nessun inline style statico non giustificato
8. [ ] Verifica `01_rules/UI_REGRESSION_CHECKLIST.md`
9. [ ] Verifica regole MUST/SHOULD/NEVER in `01_rules/UI_EXECUTION_STANDARDS.md`
10. [ ] Se il change e utente-visibile, rituale completato secondo `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`
11. [ ] Se il change tocca il dark theme, verifica coerenza `ink / smoke / paper` su landing, support surfaces e superfici core app condivise

---

**Versione**: 2.3.0
**Ultimo aggiornamento**: 2026-04-03
