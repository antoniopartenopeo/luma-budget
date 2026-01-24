# Contributing to Numa Budget

Thank you for your interest in contributing to Numa Budget! To maintain the highest standards of financial accuracy and UI consistency, we follow a strict governance process.

## 🛠 Technical Standards

All development is governed by the **[Numa Core Rules](file:///../.agent/rules/numa-core-rules.md)**. 

Before you start writing code, please review the rules regarding:
- **Financial Logic**: Handling cents, sign conventions, and domain-driven architecture.
- **UI/UX (UBI)**: Creating responsive interfaces without device-specific branching.
- **Diagnostics**: Registering storage keys and maintaining app health transparency.

## 🚀 Pull Request Process

1. **Branching**: Create a feature branch from `main` (e.g., `feat/your-feature` or `fix/issue-id`).
2. **Testing**: Ensure `npm run test` passes. Never simulate financial logic in tests; use real domain utilities.
3. **Building**: Ensure `npm run build` passes without errors.
4. **Documentation**: If you introduce new core patterns or find common pitfalls, update the `SKILL.md` and `CHANGELOG.md` in the `.agent/` folder following the **Self-Update Protocol**.

## 🤝 Need Help?

Check the existing `docs/audits/` or `docs/IMPLEMENTATION_EVIDENCE.md` for context on recent changes and architectural decisions.
