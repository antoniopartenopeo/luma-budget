# Numa Documentation Hub

Single source of truth for project documentation structure and governance.

## 1) Documentation Structure (centralized)

- `docs/core/`
  - Core system knowledge (architecture + project context)
- `docs/governance/`
  - Policy and standards that guide decisions (UX/UI/motion/semantic)
- `docs/operations/`
  - Operational playbooks and audit procedures
- `docs/reference/`
  - Module-level technical contracts moved from `src/**/README.md`

## 2) Fast Reading Path

1. `README.md` (product + setup entrypoint)
2. `docs/core/system-architecture.md` (system boundaries)
3. `docs/governance/governance-ux-standards.md`
4. `docs/governance/governance-motion-principles.md`
5. `docs/governance/governance-ui-execution-standards.md`
6. `CHANGELOG.md` (release truth + in-app notifications source)

## 3) Canonical Sources by Topic

| Topic | Canonical file |
|---|---|
| Project architecture | `docs/core/system-architecture.md` |
| Operational context | `docs/core/project-operational-context.md` |
| UX governance | `docs/governance/governance-ux-standards.md` |
| Motion governance | `docs/governance/governance-motion-principles.md` |
| UI execution standards | `docs/governance/governance-ui-execution-standards.md` |
| Semantic strategy (ADR) | `docs/governance/governance-semantic-adr-005-rhythm-shift.md` |
| UI regression checklist bridge | `docs/governance/governance-ui-regression-checklist-bridge.md` |
| Audit process | `docs/operations/governance-audit-process.md` |
| Release notes + notifications feed | `CHANGELOG.md` |

## 4) Naming Standard (mandatory)

- All documentation filenames use lowercase `kebab-case`.
- Filenames must be self-descriptive without opening the file.

Examples:
- `governance-ui-execution-standards.md`
- `module-goals-logic-vault-contract.md`

## 5) Document Type Contract

- `canonical`: normative source for a topic (single source)
- `bridge`: redirect-only file, no policy duplication
- `reference`: supporting technical context
- `generated`: tool output, non-normative and non-versioned

Priority when documents disagree:
1. `canonical`
2. `bridge`
3. `reference`
4. `generated`

## 6) Metadata Header Schema (recommended)

Use this header for new/updated docs:

```md
scope: <topic boundary>
owner: <team or role>
status: <active|reference|generated|historical>
last-verified: <YYYY-MM-DD>
canonical-of: <topic-id or none>
```

## 7) Temporary/Legacy Handling

- Temporary and historical docs are removed from repository when no longer needed.
- Generated audit output is transient (`docs/reports/`) and not versioned.
- Module contracts are centralized in `docs/reference/`.

## 8) Runtime Governance (outside docs)

- Runtime constraints: `/.agent/rules/numa-core-rules.md`
- Agent execution rules/skills: `/.agent/skills/*`
- Governance update workflow: `$numa-governance-update`
