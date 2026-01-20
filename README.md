# LumaBudget

Personal Finance Management built with **Next.js 16**, **React 19**, and **Tailwind CSS**.  
Local-first persistence with rich analytics and insights.

## ✨ Features

| Module | Status | Description |
|--------|--------|-------------|
| **Dashboard** | Stable | KPIs, charts, budget overview |
| **Transactions** | Stable | CRUD, filters, CSV import/export |
| **Budget** | Stable | Monthly planning by spending groups |
| **Categories** | Stable | Full CRUD with custom icons |
| **Simulator** | Stable v2.0 | "What-If" expense reduction analysis |
| **Insights** | Stable v1.2 | 12-month trends, AI Advisor |
| **Settings** | Stable v1.3 | Preferences, backup/restore, themes |

## 🏗 Architecture

```
src/
├── app/              # Next.js routing
├── features/         # Domain modules
│   ├── transactions/ # api/, components/, utils/
│   ├── budget/
│   ├── dashboard/
│   ├── insights/
│   ├── categories/
│   ├── settings/
│   └── simulator/
├── components/       # Shared UI (Shadcn/Radix)
└── lib/              # Utilities (currency, dates, storage)
```

### Data Flow
- **Repositories** → Read/write to `localStorage`
- **React Query** → Caching and UI reactivity
- **Cross-tab sync** → Storage event listener

### Persistence Keys
```
luma_transactions_v1
luma_budget_plans_v1
luma_categories_v1
luma_settings_v1
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📜 Development Rules

All development standards are defined in `.agent/skills/luma-governance/SKILL.md`.

### Key Rules
- **Currency**: Always use integer cents, never `parseFloat`
- **Calculations**: Use `lib/financial-math.ts`
- **Styling**: Tailwind CSS only, no inline styles
- **Categories**: Use `getCategoryById()` for lookups

### Pre-Commit
```bash
npm run build   # Must pass
npm run test    # Must pass
```

## 📁 Documentation

```
docs/
├── IMPLEMENTATION_EVIDENCE.md  # Implementation details
└── audits/
    └── APP_HEALTH_AUDIT_REPORT.md  # Codebase health audit
```

## 🚀 Deploy

Standard Next.js deployment on Vercel.

---

Made with 💜 by Luma Team
