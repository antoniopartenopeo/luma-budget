# DD-003: UI Theme Consistency & Glass Standard

> "Il tema non è un'opzione, è una legge fisica dell'applicazione."

## 1. Obiettivo
Standardizzare l'uso del sistema "Glass" e garantire la perfetta compatibilità Dark/Light mode, prevenendo regressioni hardcoded.

## 2. Standard Normativi
### A. Utility Classes (Glass System)
L'uso di utility classes centralizzate è mandatorio per elementi card/panel.
- **Glass Panel** (`.glass-panel`): Per contenitori principali, modali, e sezioni di sfondo.
- **Glass Card** (`.glass-card`): Per elementi interattivi, carte interne, e item di liste.

Queste classi gestiscono automaticamente:
- Background transparency (Light/Dark aware)
- Border opacity/color
- Backdrop blur
- Shadow

### B. Prohibited Patterns (Violazioni)
È vietato usare stili hardcoded che rompono il tema scuro.
- **VIETATO**: `bg-white` (o `/x`), `bg-slate-900` (diretto, senza supporto light), `text-slate-900`, `border-white`.
- **OBBLIGATORIO**: Usare token semantici (`bg-background`, `text-foreground`, `border-border`) o le classi Glass.

### C. Text Colors
- **Primary Text**: `text-foreground` (o `text-foreground/90`)
- **Secondary Text**: `text-muted-foreground`
- **Accents**: `text-primary`, `text-destructive`, `text-emerald-600 dark:text-emerald-400` (sempre con fallback dark).

## 3. Verifica Automatica
Il comando `npm run doe:verify` controlla i file modificati per pattern vietati:
- `bg-white/` (senza `dark:` contestuale o fuori dalle utility)
- `text-slate-900` (usare `text-foreground`)
- `border-white` (usare `.glass-*` o `border-white/x` solo con `dark:border-white/y`)

## 4. Eccezioni
Eventuali eccezioni (es. grafici legacy, componenti esterni) devono essere registrate in `docs/doe/legacy-registry.md`.
