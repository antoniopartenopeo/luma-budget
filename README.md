# NumaBudget

Personal Finance Management built with **Next.js 16**, **React 19**, and **Tailwind CSS**.  
Local-first persistence with rich analytics and insights.

## ✨ Features

| Module | Status | Description |
|--------|--------|-------------|
| **Dashboard** | Stable | KPIs, charts, and financial atmosphere |
| **Transactions** | Stable | CRUD, filters, CSV import/export with Motion |
| **Financial Lab**| **v2.0** | Adaptive Genius Core & Technical Audit Panel |
| **Categories** | Stable | Full CRUD with custom icons |
| **Insights** | **v2.0** | Rhythm-based analysis, Labor Illusion & AI Advisor |
| **UI/UX** | **Premium v1.1**| Glassmorphism, Living Effect & Staggered Motion |
| **Settings** | Stable v1.3 | Preferences, backup/restore, themes |
| **Notifications** | Stable | Topbar bell, unread badge, in-app beta changelog |
| **Updates** | Stable | Dedicated `/updates` release history page |

## 🏗 Architecture

```
src/
├── app/              # Next.js routing
├── features/         # Domain modules
│   ├── transactions/ # api/, components/, utils/
│   ├── budget/
│   ├── dashboard/
│   ├── insights/
│   ├── notifications/
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
numa_goal_portfolio_v1
numa_active_goal_v1
insights_smart_advice_signature_v1
numa_notifications_state_v2
```

Note: `luma_*` keys are legacy naming kept for backward compatibility with existing local data.

### Global Semantic Enforcement
- **Deterministic Narration Layer**: All text generation is governed by strict semantic rules (ADR-005).
- **Rhythm over Budget**: Focus on financial "Path" and "Acceleration" rather than fixed limits.
- **Labor Illusion**: AI interactions are paced (1.5s delay) to ensure perceived intelligence and trust.
- **Global Enforcement Tests**: Automated tests (`semantic-enforcement.test.ts`) ensure no "tone-deaf" or mathematically incorrect statements are generated.
- **No Inline Strings**: UI components are forbidden from generating logic-based narrative strings internally.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Release helpers:

```bash
npm run release:sync
npm run release:validate
```

## 📜 Development Standards

Numa Budget follows a strict set of development standards to ensure financial accuracy, UI consistency (UBI), and maintainable architecture.

> [!IMPORTANT]
> All technical rules, architectural patterns, and UI constraints are defined in the **[Numa Core Rules](./.agent/rules/numa-core-rules.md)**.
> 
> Before contributing, ensure you have read the **[Numa Core Rules](./.agent/rules/numa-core-rules.md)**.

## 📁 Documentation

- **[Numa Core Rules](./.agent/rules/numa-core-rules.md)**: Core development standards and constraints.
- **[UI Standards](./.agent/skills/numa-ui-standards/SKILL.md)**: Design system and UBI rules.
- **[Financial Logic](./.agent/skills/numa-financial-logic/SKILL.md)**: Monetary domain rules.
- **[Governance Update Skill](./.agent/skills/numa-governance-update/SKILL.md)**: Governance and release process.

## 🚀 Deploy

Standard Next.js deployment on Vercel.

Release flow:
- Work branches: `codex/*`
- Public beta deploy branch: `main`
- Merge to `main` only when a release is approved

---

Made with 💜 by Numa Team
