# LumaBudget

Personal Finance Management built with Next.js 16, React 19, and Tailwind CSS.
Focuses on simplicity, local-only persistence (for now), and rich insights.

## Project Structure
- `src/features`: Domain logic (Transactions, Budget, Insights).
- `src/components`: Shared UI (Shadcn/Primitive).
- `src/lib`: Utilities (Currency, Storage, dates).
- `docs/doe`: **Directive, Orchestration, Execution** system.

## getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## DOE System (Development & Operations)

This project uses a strict governance system for code quality and consistency.

### 📚 Directives
Read the rules before contributing:
- [Core Principles](docs/doe/directives/00-core-principles.md)
- [UX Standards](docs/doe/directives/ux-standards.md)
- [Legacy Registry](docs/doe/legacy-registry.md) (Known issues)

### 🛠 Verification
Before committing, you **MUST** run the verification protocol:

```bash
npm run doe:verify
```

This script performs:
1. Linting (`eslint`)
2. Unit Testing (`vitest`)
3. Static Analysis for prohibited patterns (e.g. `parseFloat` for currency).

### 🧪 Regression Testing
Check [Regression Map](docs/doe/regression-map.md) for critical manual test scenarios.

## Deploy on Vercel
Standard Next.js deployment.
