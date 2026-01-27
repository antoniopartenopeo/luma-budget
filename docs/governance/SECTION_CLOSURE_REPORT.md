# Documento Finale di Chiusura delle Sezioni - Numa Budget

**Data:** 27 Gennaio 2026
**Stato:** APPROVATO
**Versione:** 1.0

---

## 1. Introduzione

### Scopo del Documento
Il presente documento certifica formalmente il raggiungimento dello stato di "maturità" e "chiusura" per le sezioni core dell'applicazione Numa. Esso cristallizza le decisioni architettoniche, semantiche e di design prese durante la fase di sviluppo e audit.

### Definizione di Chiusura
La "chiusura delle sezioni" non coincide con la chiusura del progetto. Indica che le aree specificate hanno raggiunto un livello di stabilità, coerenza e completezza tale da non richiedere ulteriori interventi strutturali o di rifacimento. Qualsiasi modifica futura dovrà essere gestita come un'evoluzione controllata e non come una correzione.

### Principio Guida
Il sistema Numa si fonda su ruoli cognitivi chiari e non sovrapposti. Ogni sezione ha una responsabilità unica e comunica con il tono adeguato a tale responsabilità. La stabilità del prodotto dipende dal rispetto rigoroso di questi confini.

---

## 2. Mappa Concettuale del Prodotto

La struttura dell'applicazione risponde a una precisa mappatura cognitiva, validata dagli audit:

| Ruolo Cognitivo | Sezioni | Funzione |
| :--- | :--- | :--- |
| **CERVELLO** | **Dashboard / Insights** | Sintesi, narrazione, contestualizzazione. È la voce che guida l'utente. |
| **MEMORIA** | **Transazioni** | Fatti, dati grezzi, precisione forense. È la fonte di verità neutra. |
| **VOLONTÀ** | **Budget / Simulatore** | Intenzione, pianificazione, ipotesi. È lo spazio decisionale dell'utente. |
| **STRUMENTI** | **Impostazioni / Wizard** | Configurazione, manutenzione, input massivo. È la sala macchine. |

Questa suddivisione non è puramente estetica, ma strutturale. Mantenere queste aree distinte previene il sovraccarico cognitivo e garantisce la fiducia dell'utente.

---

## 3. Sezioni Chiuse

Di seguito sono dettagliati i perimetri di chiusura per ciascuna sezione auditata.

### 3.1. Dashboard & Insights
*   **Ruolo:** Torre di Controllo e Narratore.
*   **Funzione:** Aggregare i dati sparsi in KPI intelligibili e fornire contesto narrativo (es. "Stai spendendo troppo in Essenziali").
*   **Motivazione Chiusura:** La gerarchia visiva è stabile (North Star chiara), il linguaggio è coerente (uso di `StateMessage` e `Narrator`) e l'integrazione con i dati è robusta.
*   **Non-goals (Vietato):**
    *   Permettere l'editing diretto delle transazioni (compito della lista Transazioni).
    *   Diventare un chatbot generalista senza contesto specifico.
    *   Mostrare dati grezzi senza interpretazione semantica.

### 3.2. Transazioni
*   **Ruolo:** Ispettore Forense.
*   **Funzione:** Consultazione, filtraggio e verifica puntuale delle singole operazioni.
*   **Motivazione Chiusura:** L'audit ha confermato che il valore di questa sezione risiede nella sua neutralità e velocità. Non necessita di "intelligenza" aggiuntiva che genererebbe rumore.
*   **Non-goals (Vietato):**
    *   Inserire narrative o giudizi riga per riga (es. "Spesa alta!").
    *   Nascondere o raggruppare transazioni arbitrariamente.
    *   Prioritizzare l'estetica sulla leggibilità dei dati.

### 3.3. Budget
*   **Ruolo:** Il Limite (Legge).
*   **Funzione:** Definizione dei tetti di spesa (Globali e per Gruppo) e monitoraggio del rispetto delle regole.
*   **Motivazione Chiusura:** La logica di pacing temporale, early-month e over-budget è corretta. L'UI comunica responsabilità e controllo in modo allineato al design system.
*   **Non-goals (Vietato):**
    *   Includere grafici storici complessi (appartengono a Trends/Insights).
    *   Automatismi che modificano il budget senza conferma esplicita dell'utente.
    *   Diventare uno strumento di analisi predittiva (ruolo del Simulatore).

### 3.4. Simulatore
*   **Ruolo:** Il Laboratorio (Ipotesi).
*   **Funzione:** Permettere scenari "What-if" (es. "Se risparmio il 10% sul superfluo...") senza conseguenze sui dati reali.
*   **Motivazione Chiusura:** Il concetto di ambiente effimero è ben implementato. La distinzione tra stato reale (Budget) e stato ipotetico è chiara.
*   **Non-goals (Vietato):**
    *   Salvare gli scenari come "Budget effettivi" (rischio confusione).
    *   Gestire la riconciliazione con spese passate.
    *   Diventare un duplicato della pagina Budget.

### 3.5. Impostazioni
*   **Ruolo:** Sala Macchine.
*   **Funzione:** Gestione preferenze, categorie, backup e configurazioni di basso livello.
*   **Motivazione Chiusura:** Struttura a Tab efficiente, copertura funzionale completa, separazione netta dai flussi operativi quotidiani.
*   **Non-goals (Vietato):**
    *   Includere dashboard o reportistica.
    *   Diventare un wizard di onboarding (che è un flusso a parte).

### 3.6. Wizard CSV
*   **Ruolo:** Ponte Dati.
*   **Funzione:** Importazione massiva, mappatura e normalizzazione dei dati esterni.
*   **Motivazione Chiusura:** Il flusso modale (Upload -> Review -> Summary) è robusto e gestisce correttamente gli edge cases e la validazione.
*   **Non-goals (Vietato):**
    *   Gestione generica di file non pertinenti all'import.
    *   Diventare un editor di transazioni (l'editing avviene solo per correggere l'import).

---

## 4. Regole di Evoluzione Futura

Per preservare l'integrità del sistema ora certificata, ogni sviluppo futuro deve attenersi alle seguenti regole di governance:

1.  **Obbligo di Discovery:** Nessuna sezione chiusa può essere riaperta per "modifiche al volo". Ogni intervento strutturale richiede una fase di discovery e audit preliminare.
2.  **Priorità alla Coerenza:** La coerenza sistemica (UX, pattern, linguaggio) ha sempre priorità sulla novità o sulla singola feature richiesta ("Novelty Tax").
3.  **Principio dell'AI:** L'Intelligenza Artificiale non è un valore intrinseco da spalmare ovunque. Va applicata solo dove riduce il carico cognitivo (Cervello), mai dove lo aumenta o offusca la verità (Memoria).
4.  **Invarianti di Dominio:** Le regole finanziarie e semantiche (es. calcolo dei centesimi, definizione di superfluo) sono bloccate e condivise tra tutte le sezioni.

---

## 5. Chiusura

Con il presente documento, le sezioni **Dashboard, Insights, Budget, Simulatore, Transazioni, Impostazioni e Wizard CSV** sono dichiarate **STABILI**.

Il prodotto possiede ora un'identità definita e matura. Ogni lavoro futuro dovrà essere una scelta strategica esplicita, giustificata da nuove necessità di business o utente, e non dalla correzione di ciò che è già stato definito.

> *Questo documento chiude le sezioni attualmente implementate, non il percorso evolutivo del prodotto.*
