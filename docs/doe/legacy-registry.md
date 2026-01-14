# Legacy Registry

> "Know your enemy."

| ID | Component / File | Issue | Severity | Trigger for Refactor | Verification Required |
|----|------------------|-------|----------|----------------------|-----------------------|
| **LEG-01** | `src/features/transactions/api/repository.ts` | Logica "On-Read" per conversione float -> cents. Complessità alta, rischio corruzione. | **P0** (Critico) | Modifiche alla struttura dati Transaction o problemi di performance notabili. | Test di migrazione dati massivi. Unit test su casi limite float (es. 10.999). |
| **LEG-02** | `src/components/providers/theme-applier.tsx` | Uso di `any` per listener eventi legacy. | **P2** (Low) | Switch a React 19 strict mode o rimozione supporto browser antichi. | Verifica dark mode toggle su Safari/Chrome. |
| **LEG-03** | `src/features/transactions` (vari) | Alcuni componenti test usano `parseFloat`. | **P1** (Medium) | Riscrittura test suite transactions. | Linter rule `no-restricted-syntax`. |
| **LEG-04** | Global CSS | Variabili CSS duplicate o non usate in `index.css`. | **P2** (Low) | Redesign sistema colori. | Visual regression test. |

**Legenda Severity:**
- **P0**: Bomba a orologeria. Toccare con estrema cautela.
- **P1**: Debito tecnico che rallenta lo sviluppo.
- **P2**: Brutto a vedersi, ma innocuo funzionalmente.
