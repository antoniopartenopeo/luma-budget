# UBI Pattern Analysis - Numa Budget

**Report Date**: 2026-01-21  
**Author**: AI Analysis Agent  
**Scope**: Analisi della tecnica UBI (Unitary/Unified Behavioral Interface) già applicata nell'app

---

## A) Executive Summary

### Cos'è UBI nel contesto di questa app

**UBI (Unitary/Unified Behavioral Interface)** è una filosofia di design UI che evita la frammentazione "desktop vs mobile" attraverso:

1. **Stesso albero UI** – Un'unica struttura DOM che si adatta, non si duplica
2. **Stessa semantica delle interazioni** – Click, tap, swipe producono lo stesso effetto semantico
3. **Adattamento di densità, non di struttura** – Cambiano spaziature e dimensioni, non i componenti
4. **Assenza di branching `if (isMobile)`** – La responsività è dichiarativa (CSS), non imperativa (JS)

### Perché è già una scelta architetturale implicita

Numa Budget **applica già UBI in modo naturale** attraverso:

| Evidenza | Esempio |
|----------|---------|
| Overlay universali | `Sheet` usato per detail view su tutte le dimensioni |
| CSS-only responsività | Classi `hidden md:block` al posto di `isMobile` |
| State transitions interni | Edit mode via `useState`, non navigazione |
| Struttura header-body-footer | Pattern ripetuto in wizard, sheet, page |

> [!IMPORTANT]
> L'app **NON** ha biforcazioni mobile/desktop a livello di routing o logica. L'unica eccezione parziale è `TransactionsTable` (vedi sezione D).

---

## B) UBI Patterns già presenti

### B.1 – Sheet come Focus Layer Universale

**Descrizione**: Lo Sheet (overlay modale laterale) è usato per tutti i flussi di dettaglio e modifica, indipendentemente dal dispositivo.

**Dove si trova**:
- [transaction-detail-sheet.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transaction-detail-sheet.tsx)
- [category-form-sheet.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/categories/components/category-form-sheet.tsx)

**Perché è UBI-compliant**:
```tsx
// SheetContent supporta side="left|right|top|bottom"
// La stessa struttura funziona ovunque senza duplicazione
<SheetContent className="sm:max-w-md">
  <SheetHeader className="shrink-0" />
  <div className="flex-1 overflow-y-auto" />
  <div className="shrink-0 border-t" />
</SheetContent>
```

---

### B.2 – Dialog per Wizard Multi-Step

**Descrizione**: I wizard complessi usano `Dialog` con step gestiti via state interno.

**Dove si trova**:
- [csv-import-wizard.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/csv-import-wizard.tsx)

**Perché è UBI-compliant**:
```tsx
// Stesso Dialog su tutti i device
// Gli step sono stati, non route
<DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] flex flex-col">
  {step === "upload" && <ImportStepUpload />}
  {step === "review" && <ImportStepReview />}
  {step === "summary" && <ImportStepSummary />}
</DialogContent>
```

---

### B.3 – Accordion per Progressive Disclosure

**Descrizione**: Gruppi di contenuto espandibili che si adattano automaticamente.

**Dove si trova**:
- [step-review.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx) (category drilldown)

**Perché è UBI-compliant**:
```tsx
// L'Accordion funziona identicamente su touch e mouse
<Accordion type="multiple">
  <AccordionItem value={cg.id}>
    <AccordionTrigger>...</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### B.4 – Tabs per View Mode Switching

**Descrizione**: Alternative di visualizzazione nello stesso spazio.

**Dove si trova**:
- [step-review.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx) – "Per Esercente" / "Per Categoria"
- [categories-section.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/settings/components/categories-section.tsx) – "Uscite" / "Entrate"

**Perché è UBI-compliant**:
```tsx
// I tabs sono struttura, non layout: funzionano sempre
<Tabs value={viewMode} onValueChange={setViewMode}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="merchant">Per Esercente</TabsTrigger>
    <TabsTrigger value="category">Per Categoria</TabsTrigger>
  </TabsList>
  <TabsContent value="merchant">...</TabsContent>
  <TabsContent value="category">...</TabsContent>
</Tabs>
```

---

### B.5 – Sticky Header + Scrollable Body

**Descrizione**: Pattern layout con header fisso, body scorrevole, footer ancorato.

**Dove si trova**:
- [topbar.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/components/layout/topbar.tsx) – `sticky top-0`
- [step-review.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/import-csv/components/step-review.tsx) – flex column con `flex-1 overflow-y-auto`
- [transaction-detail-sheet.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transaction-detail-sheet.tsx)

**Perché è UBI-compliant**:
```tsx
// Lo stesso pattern funziona in overlay e in page
<div className="flex flex-col h-full">
  <div className="shrink-0 border-b">Header</div>
  <div className="flex-1 overflow-y-auto min-h-0">Content</div>
  <div className="shrink-0 border-t">Footer</div>
</div>
```

---

### B.6 – Mobile Sidebar via Sheet

**Descrizione**: Su schermi piccoli, la sidebar diventa un overlay Sheet, non un componente separato.

**Dove si trova**:
- [app-shell.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/components/layout/app-shell.tsx)
- [topbar.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/components/layout/topbar.tsx)

**Perché è UBI-compliant**:
```tsx
// Desktop: sidebar sempre visibile
<Sidebar className="hidden lg:block" />

// Mobile: stessa Sidebar in Sheet
<Sheet>
  <SheetTrigger className="lg:hidden" />
  <SheetContent side="left">
    <Sidebar onNavigate={() => setIsMenuOpen(false)} />
  </SheetContent>
</Sheet>
```

La **stessa Sidebar component** viene renderizzata in entrambi i contesti.

---

### B.7 – Confirm Dialog Pattern

**Descrizione**: Pattern centralizzato per conferme distruttive.

**Dove si trova**:
- [confirm-dialog.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/components/patterns/confirm-dialog.tsx)

**Perché è UBI-compliant**:
```tsx
// Un solo componente, una sola implementazione
<ConfirmDialog
  open={showDeleteConfirm}
  onOpenChange={setShowDeleteConfirm}
  title="Sei sicuro?"
  onConfirm={handleDelete}
  variant="destructive"
/>
```

---

## C) Tecniche di Auto-Adattamento

### C.1 – Responsive via CSS Classes

L'app usa **esclusivamente classi Tailwind** per responsività:

| Pattern | Uso | Esempio |
|---------|-----|---------|
| `hidden md:block` | Desktop-only | Stats counter in wizard header |
| `hidden sm:block` | Mobile-hide | QuickExpenseInput in topbar |
| `sm:hidden` | Mobile-only | QuickExpenseInput row separata |
| `flex-col sm:flex-row` | Stack → horizontal | Card layouts |
| `w-full sm:max-w-xs` | Full → constrained | Search inputs |

**Esempio concreto** da [topbar.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/components/layout/topbar.tsx#L49-L70):
```tsx
{/* Desktop: inline */}
<div className="flex-1 max-w-2xl hidden sm:block">
  <QuickExpenseInput />
</div>

{/* Mobile: separate row */}
<div className="sm:hidden px-4 pb-4">
  <QuickExpenseInput />
</div>
```

---

### C.2 – Flex Container con min-h-0

Pattern critico per scroll contenuti:

```tsx
// Da sidebar.tsx
<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
  <div className="flex-1 overflow-y-auto">
    {/* Navigation items */}
  </div>
</div>
```

`min-h-0` risolve il problema di flex items che non rispettano `overflow` del parent.

---

### C.3 – Priorità Visiva con hidden/visible

Alcune informazioni appaiono solo quando c'è spazio:

```tsx
// step-review.tsx - stats visibili solo su desktop
<div className="text-right hidden md:block">
  <div className="text-2xl font-bold">{stats.assigned} / {stats.total}</div>
</div>
```

---

### C.4 – Grid Responsive senza Breakpoint Logic

```tsx
// transactions-table.tsx - pagination
<div className="flex items-center justify-between">
  // Stesso layout, si adatta naturalmente
</div>
```

---

## D) Anti-Pattern Evitati (o da Evitare)

### ✅ Evitato: Routing Mobile vs Desktop

L'app **NON** ha:
- `/mobile/dashboard`
- `/desktop/transactions`
- Wrapper `<MobileLayout>` vs `<DesktopLayout>`

### ✅ Evitato: Branching `if (isMobile)`

Nessun uso di:
```tsx
// ❌ QUESTO NON ESISTE
const isMobile = useMediaQuery("(max-width: 768px)")
if (isMobile) return <MobileView />
return <DesktopView />
```

### ✅ Evitato: Logica duplicata per device

Le feature non hanno `*-mobile.tsx` / `*-desktop.tsx`.

---

### ⚠️ Incoerenza Rilevata: TransactionsTable

[transactions-table.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/scalar-curiosity/src/features/transactions/components/transactions-table.tsx) contiene un pattern borderline:

```tsx
{/* Desktop View: Table */}
<div className="hidden md:block">
  <Table>...</Table>
</div>

{/* Mobile View: Cards */}
<div className="grid grid-cols-1 gap-3 md:hidden">
  {transactions.map(t => <Card>...</Card>)}
</div>
```

**Analisi**:
- ✅ **Stesso codice** – non c'è branching JS, solo CSS
- ✅ **Stessa semantica** – click row/card apre stesso sheet
- ✅ **Stessa data source** – `transactions.map()` identico
- ⚠️ **Struttura doppia** – due render tree coesistono

**Verdetto**: È un **compromesso accettabile** perché:
1. Non viola la regola "no JS branching"
2. L'interazione semantica è identica
3. È locale a un componente, non architetturale

**Alternativa UBI-pura** (non richiesta):
```tsx
// Possibile: unico grid adattivo
<div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto]">
  {/* Items che si adattano */}
</div>
```

---

## E) Linee Guida UBI Estratte

Le seguenti regole possono essere integrate in `SKILL.md`:

### Rule 1: Overlay Universale
> Usa `Sheet` per detail/edit views e `Dialog` per wizard. Non creare componenti `*Mobile` separati.

### Rule 2: State Before Routes
> Per transizioni UI (view/edit, step 1/2/3), usa `useState` non `router.push()`. Mantieni lo stesso overlay aperto.

### Rule 3: CSS Responsiveness Only
> Mai `if (isMobile)` in render logic. Usa `hidden md:block`, `sm:hidden`, `flex-col md:flex-row`.

### Rule 4: Flex Column Layout
> Per contenuti scrollabili in box fisso:
> ```tsx
> <div className="flex flex-col h-full">
>   <div className="shrink-0">Header</div>
>   <div className="flex-1 overflow-y-auto min-h-0">Body</div>
>   <div className="shrink-0">Footer</div>
> </div>
> ```

### Rule 5: Progressive Disclosure
> Usa `Accordion` e `Tabs` per rivelare informazioni. Mai spostare contenuti in pagine separate per "semplicità mobile".

### Rule 6: Reuse Component Across Contexts
> Lo stesso componente deve funzionare sia inline che in overlay.
> Esempio: `<Sidebar>` funziona nel layout E nello Sheet.

### Rule 7: Density Over Structure
> Riduci padding/margin su mobile, non rimuovere elementi. Usa `p-4 md:p-8`.

### Rule 8: Semantic Consistency
> Un tap/click deve produrre lo stesso effetto su ogni device. Non cambiare flussi per form factor.

### Rule 9: Info Hiding con Threshold
> Nascondi info secondarie su mobile con `hidden md:block`, non con componenti separati.

### Rule 10: Confirm Patterns
> Usa `ConfirmDialog` centralizzato per azioni distruttive, funziona identicamente ovunque.

---

## F) Mapping Concettuale: CSV Import Wizard

Il CSV Import Wizard attuale segue già UBI. Ecco come **mantenere UBI-compliance** nelle evoluzioni future:

### F.1 – Gruppi sempre espandibili

**Principio**: I gruppi di transazioni devono essere **Accordion nodes**, visibili su ogni dispositivo.

**Mapping**:
| Pattern corrente | UBI Rule |
|------------------|----------|
| `<Accordion type="multiple">` | ✅ Rule 5 (Progressive Disclosure) |
| `.categoryGroups.map()` | ✅ Rule 8 (Semantic Consistency) |

**Applicazione futura**:
- Se si aggiungono subgroups, usare Accordion nested
- Non creare "vista compatta mobile" separata

---

### F.2 – Stessa interazione su desktop e smartphone

**Principio**: Il workflow select-category → confirm deve essere identico.

**Mapping**:
| Azione | Desktop | Mobile | UBI Compliance |
|--------|---------|--------|----------------|
| Seleziona categoria | Click dropdown | Tap dropdown | ✅ Stessa semantica |
| Naviga step | Click button | Tap button | ✅ Stessa transizione |
| Expand gruppo | Click trigger | Tap trigger | ✅ Stesso Accordion |

**Applicazione futura**:
- Non introdurre "swipe per cambiare step" solo mobile
- Non usare bottom sheet solo su mobile

---

### F.3 – Adattamento solo di densità

**Principio**: Su mobile cambia la spaziatura, non la struttura.

**Mapping tecnico già presente in `step-review.tsx`**:
```tsx
// Flex responsive senza branching
<div className="flex flex-col md:flex-row md:items-center gap-4">

// Padding responsive
className="p-6 pb-4"  // Stesso su tutti

// Text size responsive (opzionale)
className="text-base md:text-lg"
```

**Applicazione futura**:
- Usare `text-sm md:text-base` per labels
- Usare `gap-2 md:gap-4` per spaziatura
- MAI creare `GroupCardMobile` vs `GroupCardDesktop`

---

### F.4 – Checklist UBI per nuove feature nel Wizard

Prima di implementare nuove UI nel wizard:

- [ ] Usa lo stesso componente su tutti i breakpoint?
- [ ] L'interazione principale (click/tap) produce lo stesso effetto?
- [ ] Le transizioni sono via state, non route?
- [ ] La responsività è solo Tailwind classes?
- [ ] Gli elementi nascondibili usano `hidden md:block`?
- [ ] I form usano lo stesso layout wrapper?

---

## Conclusione

Numa Budget **implementa già UBI implicitamente** attraverso scelte architetturali coerenti. L'unica area grigia (`TransactionsTable` dual render) è un compromesso accettabile e non viola i principi core.

Per mantenere UBI-compliance nelle evoluzioni future:
1. Non creare componenti `*Mobile` / `*Desktop`
2. Non usare `useMediaQuery` per branching render
3. Non duplicare flussi per form factor
4. Adattare densità con CSS, non struttura con JS

Questo report serve come **riferimento architetturale** per ogni nuova UI complessa.
