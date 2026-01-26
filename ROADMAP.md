# 🗺️ Numa Budget — Roadmap

> **Documento vivente**: Aggiornato automaticamente dopo ogni implementazione significativa.

---

## 📊 Implementazioni Completate

### Core App (Fondamenta)
- [x] **App Shell** — Layout responsive con Sidebar, Topbar, tema dark/light
- [x] **Sistema Temi** — Supporto dark mode con persistenza
- [x] **Navigazione** — Sidebar collapsabile, Sheet mobile
- [x] **Storage Layer** — Persistenza localStorage con registry centralizzato

---

### Dashboard
- [x] **KPI Cards** — Entrate, Uscite, Saldo, con filtri temporali
- [x] **Grafico Spese** — Breakdown per categoria
- [x] **Transazioni Recenti** — Lista ultimi movimenti
- [x] **Flash Summary** — Riepilogo rapido con insights

---

### Transazioni
- [x] **Lista Transazioni** — Tabella desktop / Cards mobile
- [x] **CRUD Completo** — Aggiungi, modifica, elimina
- [x] **Quick Add** — Input rapido dalla Topbar
- [x] **Filtri e Ricerca** — Per data, tipo, categoria
- [x] **Export CSV** — Esporta transazioni filtrate
- [x] **Import CSV Wizard** — Importazione guidata con:
  - Upload file / Incolla testo
  - Raggruppamento automatico esercenti
  - Assegnazione categorie bulk
  - Slider soglia significatività
  - Preview e conferma

---

### Categorie
- [x] **Registro Categorie** — Sistema centralizzato in `src/domain/categories`
- [x] **Gruppi Spending** — Essential / Comfort / Superfluous
- [x] **Icone per Categoria** — Mapping automatico con `CategoryIcon`
- [x] **CRUD Categorie Custom** — Aggiungi/modifica categorie utente

---

### Budget
- [x] **Piano Budget** — Allocazione per categoria
- [x] **Tracking Spese vs Budget** — Progress bar visive
- [x] **Gruppi Budget** — Essential / Comfort / Superfluous

---

### Insights
- [x] **Trend Analysis Card** — Andamento spese nel tempo
- [x] **AI Advisor Card** — Suggerimenti intelligenti

---

### Simulator
- [x] **Simulazione What-If** — Proiezioni finanziarie

---

### Settings
- [x] **Gestione Categorie** — Tab dedicato
- [x] **Backup/Restore** — Esporta/importa dati
- [x] **Reset Dati** — Con conferma
- [x] **Diagnostica** — Storage health, versione app
- [x] **UI Unification** — Standard Numa Premium (2.5rem, Glassmorphism, Scale-in)

---

## 🚀 Feature Probabili (Backlog)

> Idee per sviluppi futuri, ordinate per valore/impatto stimato.

| Feature | Descrizione | Complessità |
|---------|-------------|-------------|
| **📱 PWA** | Installazione app su dispositivo, notifiche | Media |
| **🔄 Transazioni Ricorrenti** | Abbonamenti auto-registrati (Netflix, affitto) | Alta |
| **🏷️ Multi-Tag Transazioni** | Tagging flessibile oltre categoria singola | Media |
| **📊 Report Mensile PDF** | Genera report scaricabile | Media |
| **🎯 Obiettivi di Risparmio** | Goal con progress tracking | Media |
| **💱 Multi-Valuta** | Supporto EUR/USD con conversione | Alta |
| **☁️ Sync Cloud** | Backup automatico su Firebase/Supabase | Alta |
| **🔐 PIN/Biometric Lock** | Protezione accesso app | Media |
| **📈 Grafici Avanzati** | Heatmap spese, confronto periodi | Bassa |
| **🧾 OCR Scontrini** | Scan e parsing automatico | Alta |

---

## 🔧 Fix & Miglioramenti Probabili

> Aree note che potrebbero beneficiare di ottimizzazioni.

### Dashboard
- [ ] **Skeleton Loading** — Migliorare UX durante caricamento dati
- [ ] **Empty State Grafico** — Messaggio più utile quando non ci sono dati

### Transazioni
- [ ] **Paginazione Server-Side** — Performance con molti record (>1000)
- [ ] **Undo Delete** — Toast con azione annulla dopo eliminazione
- [ ] **Bulk Actions** — Selezione multipla per modifica/elimina

### Import CSV
- [ ] **Template Banche** — Preset per formati CSV comuni (Unicredit, Intesa, ecc.)
- [ ] **Memoria Categorizzazioni** — Ricorda scelte utente per esercenti noti
- [ ] **Deduplicazione** — Rileva transazioni già importate

### Budget
- [ ] **Alert Superamento** — Notifica quando superi soglia categoria
- [ ] **Rollover** — Opzione per trasferire residuo al mese successivo

### UX Generale
- [ ] **Onboarding Wizard** — Prima esperienza guidata per nuovi utenti
- [ ] **Keyboard Shortcuts** — Navigazione rapida da tastiera
- [ ] **Accessibilità** — Audit ARIA labels completo

---

## 📝 Storico Aggiornamenti

| Data | Modifica |
|------|----------|
| 2026-01-26 | Unificazione UI/UX, upgrade a Numa Premium Aesthetic |
| 2026-01-24 | Creazione documento, inventario iniziale |

---

> **Nota per l'AI**: Dopo ogni implementazione significativa (nuova feature, fix importante), aggiorna questo documento nella sezione appropriata. Sposta item da "Probabili" a "Completate" quando implementati.
