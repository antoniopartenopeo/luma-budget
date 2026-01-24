# NumaBudget

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

## 📜 Development Standards

Numa Budget follows a strict set of development standards to ensure financial accuracy, UI consistency (UBI), and maintainable architecture.

> [!IMPORTANT]
> All technical rules, architectural patterns, and UI constraints are defined in the **[Numa Core Rules](file:///.agent/rules/numa-core-rules.md)**.
> 
> Before contributing, ensure you have read the **[Contributing Guidelines](file:///docs/CONTRIBUTING.md)**.

## 📁 Documentation

- **[Numa Core Rules](file:///.agent/rules/numa-core-rules.md)**: Core development standards and constraints.
- **[App Health Audit](file:///docs/audits/APP_HEALTH_AUDIT_REPORT.md)**: Latest codebase health status.
- **[UBI Analysis](file:///docs/audits/UBI_UI_ANALYSIS.md)**: Principles of the Unitary Behavioral Interface.
- **[Implementation Evidence](file:///docs/IMPLEMENTATION_EVIDENCE.md)**: Detailed technical logs.

## 🚀 Deploy

Standard Next.js deployment on Vercel.

---

Made with 💜 by Numa Team
