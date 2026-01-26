# Numa Budget - UI Regression Checklist

**Versione**: 2.0.0 (UI Lock)
**Data**: 2026-01-27

Ogni PR o modifica che tocca l'interfaccia utente DEVE superare questa checklist.

## 1. Monolithic Hierarchy (CRITICO)
- [ ] **Single MacroSection**: La pagina ha UNA sola card principale (`MacroSection`)?
- [ ] **Header Integration**: I filtri principali sono integrati nell'header della MacroSection?
- [ ] **Internal Subordination**: Le card interne (KPI, Summary) sono visivamente subordinate (niente shadow pesanti, niente glow)?
- [ ] **No Competition**: Non ci sono altre card "frattali" di livello pari al Monolite?

## 2. Layout & Struttura
- [ ] **Narrative Flow**: Il contenuto segue un flusso verticale logico.
- [ ] **Full Width**: Le macro-card occupano tutto lo spazio disponibile.
- [ ] **Responsive**: Il layout si adatta fluidamente (no branching `*Mobile`).

## 3. Macro-Geometria
- [ ] **Radius**: `rounded-[2.5rem]` (40px) per il Monolite.
- [ ] **Surface**: `glass-panel` per il Monolite.
- [ ] **Shadows**: `shadow-xl` solo per il Monolite.

## 4. Motion System
- [ ] **Loader**: Usare `StaggerContainer` per l'ingresso.
- [ ] **Scale-In**: Scala `0.98` -> `1` (mai offset Y).
- [ ] **Duration**: `500ms`.

## 5. Typography System (LOCKED)
- [ ] **Hero Title**: `text-2xl font-bold tracking-tight`.
- [ ] **Main KPI**: `text-4xl` o `text-5xl` con `font-black`.
- [ ] **Card KPI**: `text-3xl font-black` (NON `2xl`).
- [ ] **Eyebrow/Label**: `text-[10px] uppercase font-bold tracking-wider`.
- [ ] **Body**: `text-sm font-medium`.
- [ ] **NO Custom**: Nessun `text-[14px]`, `font-semibold` locale.

## 6. Visual Consistency
- [ ] **Dashboard** == **Budget** == **Insights** == **Simulatore** == **Transazioni**.
- [ ] Tono dei testi proattivo ("Intelligent Advisor").

---
**Status**: LOCKED. Nessuna deroga ammessa senza approvazione governance.
