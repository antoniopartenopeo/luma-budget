# Decision Log

scope: decision-log
owner: engineering
status: active
last-verified: 2026-03-25
canonical-of: decision-log

| Date | Decision | Status | Why | Alternatives rejected |
| --- | --- | --- | --- | --- |
| 2026-02-11 | Shift user-facing semantics from "Budget" to "Rhythm" | accepted | Reduce punitive framing and align narration with the product promise | Keep classic budgeting language as the primary semantic layer |
| 2026-03-15 | Adopt the root scaffold as the only canonical project governance system | accepted | Keep context, rules, playbooks, specialist guidance, decisions, and handoff interconnected inside one structure | Keep bootstrap, governance, and process knowledge distributed across legacy surfaces |
| 2026-03-15 | Consolidate specialist governance into `05_specialists/*` | accepted | Keep domain-specific operating context close to the rest of the root scaffold and remove competing agent-only paths | Preserve `.agent/*` as a second canonical layer |
| 2026-03-15 | Keep open banking fail-closed by default | accepted | Preserve the local-first product baseline until remote integration is explicitly hardened | Enable remote banking flows by default |
| 2026-03-15 | Expose the public landing page at `/` and move the in-app dashboard to `/dashboard` | accepted | Separate acquisition and product surfaces while keeping the existing app shell and internal modules intact | Keep the dashboard at `/` and force the landing into a secondary route that users may never see |
| 2026-03-22 | Treat the public landing as a product-truth acquisition surface with constrained navigation | accepted | Keep public promise, motion language, and entrypoints aligned with real modules instead of generic marketing patterns | Turn `/` into a broad marketing hub with loose routing, speculative claims, or signup-first CTA |
| 2026-03-22 | Allow one immersive Brain explainer on the landing only as a forecast-stage deep dive | accepted | Explain Brain readiness and forecast trust without turning `/` into a separate AI-first promise or breaking local-first positioning | Add multiple immersive module spotlights or position Brain as an unconditional prediction engine |
| 2026-03-25 | Keep one adaptive hero surface across device sizes and reduced-motion contexts on the public landing | accepted | Preserve the same product perception on smartphone and accessibility-reduced contexts while avoiding alternate simplified marketing patterns | Render separate static/mobile hero variants for landing explainers when motion is reduced |
| 2026-03-25 | Replace the old animated four-moment landing demo with a static `Come inizi` explainer | accepted | Keep the acquisition story simpler, remove redundant motion, and explain the real product flow with one stable four-step section in the same narrative slot | Preserve a separate sticky/scrollytelling module that duplicates the later onboarding explanation |
