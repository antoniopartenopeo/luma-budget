# 🗺️ Numa Budget — Roadmap

## 1. Principi Non Negoziabili
- **Trust > Feature**: La precisione dei dati ha priorità assoluta su nuove funzionalità.
- **Local-first by default**: I dati rimangono sul dispositivo dell'utente.
- **Explainability > Automazione**: Ogni automatismo deve essere trasparente e spiegabile.
- **Ogni numero ha una fonte**: Tracciabilità completa da aggregato a transazione.
- **UX che riduce ansia**: Design calmo, non allarmista, e focalizzato sulla chiarezza.

---

## 2. Epiche Strategiche
1. **Trust & Reliability Foundation**: Stabilità, precisione dati, importazione robusta.
2. **Automation Without Betrayal**: Automatismi che l'utente può verificare e correggere.
3. **Decision & Future Planning**: Strumenti per pianificare e prevedere, non solo tracciare.
4. **Privacy, Power & Delight**: Funzioni pro-user, privacy, e gioia nell'utilizzo.
5. **Category Creation (Vision)**: Innovazione radicale nell'interazione finanziaria.

---

## 3. Fasi Temporali
- **NOW (0–3 mesi)**: fiducia nel dato e perfezionamento core
- **NEXT (3–6 mesi)**: automazione controllata e intelligenza
- **NEXT+ (6–9 mesi)**: pianificazione e decisioni persistenti
- **LATER (9–15 mesi)**: espansione piattaforma e power features
- **VISION (15–24 mesi)**: intelligenza conversazionale

---

## 4. Iniziative per Fase

### NOW — Trust & Reliability
#### Advanced Data Ingestion
Epica: Trust & Reliability Foundation
Outcome: importazione dati a prova di errore e duplicati
Items: Deduplicazione Transazioni, Template Banche, Onboarding Wizard

#### UI/UX Stabilization
Epica: Privacy, Power & Delight
Outcome: accessibilità totale e fluidità d'uso
Items: Accessibilità (Audit ARIA), [x] Skeleton Loading, [x] Empty States, [x] Living Effect / Motion Entry

### NEXT — Automation Without Betrayal
#### Smart Import 2.0
Epica: Automation Without Betrayal
Outcome: categorizzazione automatica basata su memoria locale
Items: Smart Import con Memoria, Memoria Categorizzazioni

#### Smart Subscription Hub
Epica: Automation Without Betrayal
Outcome: controllo proattivo delle spese ricorrenti
Items: Rilevamento automatico abbonamenti, Calendario rinnovi

### NEXT+ — Decision & Future Planning
#### Behavioral Buckets
Epica: Decision & Future Planning
Outcome: segregazione mentale dei fondi per obiettivi
Items: "Secchielli" per obiettivi, Mental Accounting

#### Financial Forecasting
Epica: Decision & Future Planning
Outcome: visibilità del futuro finanziario basata sullo storico
Items: Proiezione saldo futura (What-Will-Be)

### LATER — Power & Delight
#### Platform Expansion
Epica: Trust & Reliability Foundation
Outcome: ubiquità e sicurezza dei dati
Items: PWA, Sync Cloud, PIN/Biometric Lock

#### Deep Analysis
Epica: Privacy, Power & Delight
Outcome: analisi granulare e reportistica
Items: Grafici Avanzati (Heatmap), Report Mensile PDF, Multi-Tag

### VISION — Category Creation
#### Conversational AI
Epica: Category Creation
Outcome: interazione naturale con le proprie finanze
Items: Chat query dati ("Quanto ho speso in pizza?")

---

## 5. Stato di Implementazione

### Completate
**Trust & Reliability Foundation**
- App Shell & Navigation
- Storage Layer & Source of Truth (amountCents)
- Import CSV Wizard v1
- Registro e Gestione Categorie
- Backup/Restore & Reset Dati
- Filtri, Ricerca ed Export CSV

**Privacy, Power & Delight**
- Privacy Shield (Blur effect & Toggle)
- Sistema Temi (Dark/Light)
- PremiumChartSection & Grafico Spese
- UI Unification (Glassmorphism)
- Flash Summary

- **Decision & Future Planning**
- KPI Cards & Dashboard
- Ottimizzatore Avanzato (Interactive)
- Goals Lab & Active Rhythm Tracking
- Gruppi Spending & Budget

**Nuclear Reset & Refactor (Jan-Feb 2026)**
- Budget Plan & Tracking (Logic Vault)
- Goals Lab UI (Refactored & Active)
- Global Sheet Refactor (Standardized Layout)
- UI/UX Premium Polish (Typography & Icons)
- Legacy Simulator (REMOVED)

**Automation Without Betrayal**
- Trend Analysis
- [x] AI Advisor Card (Labor Illusion & Dynamic Atmospheres)
- Laboratorio Budget (Core Logic Vault)

### In corso
- **Paginazione Server-Side** (Transactions)
- **Bulk Actions** (Selection mode)

### Backlog Validato (Trust, Fix & Power)
- **Trust**: Paginazione Server-Side, Undo Delete
- **Power**: Bulk Actions, Keyboard Shortcuts, Multi-Valuta (Nicchia)
- **Automation**: OCR Scontrini
- **Decision**: Alert Superamento Budget, Rollover Budget mensile

### Vision / Speculative
- Numa AI Conversational Layer (Full integration)

---

## 6. Regole di Governance
- Nessuna feature senza Epica + Fase.
- Vietata anticipazione silenziosa o sviluppo non tracciato.
- Roadmap aggiornata tassativamente dopo ogni merge significativo.
