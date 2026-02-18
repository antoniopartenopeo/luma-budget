# UI Regression Checklist: Automation-Ready

Questa checklist definisce controlli **deterministici** per garantire l'integrità del design system Numa Premium. È progettata per essere integrata in test E2E (Playwright) o Unit (Vitest/Testing Library).

---

## 1. Macro-Geometry: Card Radius
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Presenza della classe `rounded-[2.5rem]` su macro-card. | Il raggio da 40px è il tratto distintivo di Numa Premium. | **DOM**: Verifica presenza della stringa `rounded-[2.5rem]` o computed style `border-radius: 40px`. |

## 2. Layout: Page Constraints
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Assenza di `max-w-4xl` sui container principali. | Evita il layout "stretto e centrato" su schermi larghi. | **Static/DOM**: Ricerca classi `max-w-*` diverse da `max-w-7xl` nel wrapper di pagina. |
| Presenza di `w-full` o layout adattivo. | Garantisce che la UI sfrutti lo spazio del sistema AppShell. | **Layout**: Verifica che `offsetWidth` del componente corrisponda a quello del parent (meno padding). |

## 3. Surface & Depth: Glassmorphism
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Applicazione classe `glass-panel` o `glass-card`. | Definisce la materialità e la leggibilità (blur). | **DOM**: Verifica presenza classe `glass-panel`. Verifica computed style `backdrop-filter: blur(20px)` (o valore definito in CSS). |
| Presenza ombre `shadow-xl`. | Fornisce la profondità necessaria per separare il contenuto dallo sfondo. | **DOM**: Verifica classe `shadow-xl`. |

## 4. Spacing: Vertical Narrative Flow
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Utilizzo di `space-y-8` o `gap-6` tra macro-sezioni. | Mantiene il ritmo verticale e la scansione del contenuto. | **DOM**: Verifica classi `space-y-8`, `gap-8` o `gap-6` sui parent container. |
| Padding uniforme `p-4` (mobile) e `p-8` (desktop). | Coerenza dei margini interni per evitare affollamento. | **Layout**: Verifica computed padding in pixel per diversi breakpoint. |

## 5. Motion: Entrance Animations
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Uso della primitive `animate-enter-up` per ingressi sezione/card. | Standard motion condiviso e centralizzato in `globals.css`. | **DOM/Static**: verifica presenza classe `animate-enter-up` nei container di ingresso principali. |
| Nessun fallback a utility legacy (`animate-in fade-in`) per i flussi core. | Evita drift tra policy e implementazione motion. | **Static**: ricerca classi legacy e segnala occorrenze nei componenti core. |
| Presenza di supporto `prefers-reduced-motion` sulle primitive globali. | Accessibilità motion non negoziabile. | **CSS/Integration**: verifica media query `@media (prefers-reduced-motion: reduce)` e override animation. |

## 6. Tone & Semantics: Numa Advisor
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Presenza di `PageHeader` in ogni vista principale. | Struttura semantica coerente (Titolo + Descrizione). | **DOM**: Verifica l'esistenza del componente/tag con `role="heading"` e testo descrittivo non vuoto. |

## 7. Sheet Layout: Consistency
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| Struttura `flex flex-col h-full` con Header/Footer delimitati da bordi. | Garantisce che le azioni siano sempre visibili e lo scrolling corretto. | **DOM**: Verifica `flex-col` sul wrapper e `border-b` / `border-t` sugli elementi estremi. |
| Altezza bottoni footer esattamente `h-12`. | Uniformità delle azioni primarie. | **CSS**: Verifica computed height di `48px` sui bottoni nel footer dello Sheet. |

## 8. Typography: Premium Readability
| Verifica | Criticità | Automazione (Come) |
|:---|:---|:---|
| `SheetDescription` usa la classe `font-medium`. | Leggibilità critica su materiali semitrasparenti. | **DOM**: Verifica classe `font-medium` su elementi con classe `SheetDescription`. |
| Icone secondarie (meta-info) sono `h-3 w-3`. | Gerarchia visiva per evitare rumore. | **DOM/SVG**: Verifica attributi `width="12"` e `height="12"` su icone non principali. |

---

## 🛠 Esempi di Codice per l'Automa

### Playwright (E2E)
```typescript
test('Verifica Macro-Geometry Numa Premium', async ({ page }) => {
  const card = page.locator('.glass-panel').first();
  
  // 1. Verifica raggio di curvatura (Target: 40px)
  const borderRadius = await card.evaluate(el => getComputedStyle(el).borderRadius);
  expect(borderRadius).toBe('40px');
  
  // 2. Verifica assenza di constraint narrow
  const container = page.locator('main > div');
  const classes = await container.getAttribute('class');
  expect(classes).not.toContain('max-w-4xl');
});
```

### Vitest + React Testing Library (Unit)
```typescript
test('Configurazione Motion standardizzata', () => {
  render(<GlobalBudgetCard />);
  const motionDiv = screen.getByTestId('motion-container');
  
  // Verifica props passate a Framer Motion
  expect(motionDiv).toHaveAttribute('initial', expect.stringContaining('"scale":0.98'));
  expect(motionDiv).toHaveAttribute('animate', expect.stringContaining('"scale":1'));
});
```

---

## Conclusioni
Questa checklist rimuove l'incertezza dalla review UI. Se un controllo DOM fallisce, la feature NON è conforme al sistema Numa Premium, indipendentemente dal giudizio estetico soggettivo.
