# CHANGELOG

Aggiornamenti pensati per chi usa Numa ogni giorno.

Schema usato in tutte le release:
- `Added (Novità per te)`: nuove funzioni che puoi usare subito.
- `Changed (Miglioramenti per te)`: funzioni esistenti rese più chiare e utili.
- `Fixed (Correzioni)`: problemi risolti.
- `Removed (Semplificazioni)`: elementi tolti per ridurre confusione.

---

## [0.4.1] - 2026-02-26

### Added (Novità per te)
- Nuova lettura KPI su carte usate nel periodo in Dashboard, con breakdown più chiaro dei metodi di pagamento rilevati.
- Potenziato il parser transazioni carta per riconoscere in modo più affidabile pattern e intestazioni utili all'analisi.

### Changed (Miglioramenti per te)
- Rifinita la resa delle card KPI e delle superfici Numa Engine per mantenere maggiore coerenza visuale tra pagine core.
- TopBar azioni/notifiche resa più robusta, con comportamento più stabile su trigger, badge e stato aggiornamenti.
- Documentazione progetto centralizzata in una struttura unica con naming coerente e percorso di lettura esplicito.

### Fixed (Correzioni)
- Allineati script e riferimenti governance per evitare path obsoleti nei check automatici e negli audit.
- Migliorata la coerenza operativa tra release notes, feed notifiche in-app e versione corrente del pacchetto.

### Removed (Semplificazioni)
- Rimossi dal flusso documentale attivo i file temporanei/storici non normativi (riclassificati in `docs/archive` e `docs/reports`).

---

## [0.4.0] - 2026-02-22

### Added (Novità per te)
- Nuovo report UI 360 aggiornato allo stato reale post-sync, con matrice route, finding attivi e chiusure verificate.

### Changed (Miglioramenti per te)
- Dashboard e Insights hanno ricevuto una revisione ampia su KPI, layout card, leggibilità mobile e consistenza visuale.
- Financial Lab è stato consolidato su scenari quota espandibili con lettura step-by-step più chiara.
- Import CSV è stato semplificato con revisione guidata a preset e flusso più lineare tra upload, review e summary.
- Settings, `/transactions/import` e `/updates` sono stati riallineati al pattern motion comune per ingresso pagina più coerente.
- Notifiche TopBar e pagina `/updates` ora usano copy orientata agli aggiornamenti app e non più framing beta.

### Fixed (Correzioni)
- Allineata la pipeline notifiche in-app: le modifiche testuali alla stessa release ora generano nuova notifica tramite fingerprint contenuto.
- Ridotta la possibilità di feed notifiche non aggiornato per effetto cache API, con risposta changelog impostata `no-store`.
- Migliorata la coerenza di validazione release/governance tra `CHANGELOG`, feed notifiche e versione pacchetto.

### Removed (Semplificazioni)
- Rimossi residui UI non più agganciati ai flussi attivi (componenti legacy review/timeline e export superflui).

---

## [0.3.3] - 2026-02-12

### Changed (Miglioramenti per te)
- La card **Composizione Spese** in Dashboard ora usa direttamente il riepilogo categorie del backend dashboard come fonte unica, con ordinamento più stabile.
- Su mobile, la Composizione Spese passa a una vista più leggibile a card/legenda (senza grafico a torta completo).
- Aggiunta la KPI **Segnale del mese** in Dashboard, con stato sintetico e rimando rapido a Insights.
- Aggiornata la responsività dei grafici ECharts con resize più affidabile.
- In Insights, la sezione **Abbonamenti attivi** ora è organizzata in card espandibili per gruppo, con dettaglio transazioni rilevate.
- La vista **Prossimi addebiti** è stata trasformata in una timeline visuale a milestone, più leggibile e orientata alle scadenze.
- In Dashboard, il selettore periodo ora usa pill segmentate (`Mese`, `3M`, `6M`, `12M`) per una lettura più immediata.
- In Financial Lab, gli scenari sono stati consolidati in card espandibili con dettaglio step-by-step della quota (base storica, correzione live, quota sostenibile), senza pannello separato.
- Nel wizard Import CSV, la revisione ora usa preset di soglia rapidi (al posto dello slider continuo) con KPI sintetiche su righe valide, duplicati e righe non leggibili.
- La pagina `/transactions/import` include una card "Come Funziona Numa" dedicata al flusso di import.
- Uniformato il pattern `NumaEngineCard` con titolo canonico condiviso e migliorata la consistenza dei componenti espandibili.
- In Impostazioni, i tab ora sono ottimizzati per mobile con layout a griglia e label più leggibili.
- Notifiche TopBar e pagina `/updates` ora usano copy orientata agli aggiornamenti app (non più linguaggio beta) e tipografia più leggibile.

### Fixed (Correzioni)
- Corretto il calcolo periodo mensile in Dashboard usando range locale, riducendo incoerenze nei passaggi di mese/fuso.
- Sincronizzati i report audit di governance sul branch (`quick-check` + summary).
- Corretto il comportamento del link "Apri transazioni filtrate" nel portfolio abbonamenti per evitare side effect di propagazione evento.
- Le notifiche in-app ora rilevano anche aggiornamenti testuali della stessa release (fingerprint contenuto), evitando feed apparentemente non aggiornato.

---

## [0.3.2] - 2026-02-11

### Changed (Miglioramenti per te)
- In Insights, la metrica principale è ora `Saldo totale stimato`: parte dal saldo totale e sottrae la spesa residua prevista nel mese corrente.
- La provenienza della stima è più chiara: `Fonte Core` quando il modello è pronto, `Fonte Storico` quando si usa il fallback.
- Gli stati di caricamento compaiono solo quando serve davvero: niente attese artificiali.
- La lettura dei trend è più lineare e coerente tra le card.
- Le notifiche aggiornamenti in-app ora vengono generate direttamente da questo changelog, mantenendo allineati campanella TopBar e pagina `/updates`.

### Fixed (Correzioni)
- Quando i dati non bastano, Insights lo comunica in modo esplicito (senza messaggi ambigui).
- L'analisi dei picchi categoria usa solo mesi storici validi, riducendo falsi segnali.

### Removed (Semplificazioni)
- Rimossa la card "Consiglio del momento" in Advisor per evitare duplicazioni con analisi già presenti.
- Rimossa la pipeline legacy `use-orchestrated-insights` non più utilizzata.

---

## [0.3.1] - 2026-02-09

### Added (Novità per te)
- Nuovo centro aggiornamenti beta in TopBar con badge non letti e stato criticità.
- Introdotta la pagina `/updates` con storico release leggibile e azione "segna tutto come letto".

### Changed (Miglioramenti per te)
- Gestione importi più uniforme, con calcoli più stabili nelle viste principali.
- Architettura più chiara tra logica finanziaria e interfaccia, per ridurre comportamenti incoerenti.
- Controlli qualità più severi per intercettare regressioni prima del rilascio.
- Animazioni e stati UI più consistenti, con maggiore rispetto delle preferenze di riduzione movimento.
- Metadata build/versione centralizzati nelle diagnostiche per tracciare meglio gli aggiornamenti distribuiti.

### Fixed (Correzioni)
- Date di fine mese più affidabili nei passaggi tra mesi e fusi orari.
- Filtri periodo più coerenti tra tutti i range nella vista movimenti.
- Rimossa una ripetizione nei testi generati dagli insight.

### Removed (Semplificazioni)
- Eliminato codice non più utile in produzione.
- Spostati i materiali roadmap fuori dal runtime, nella documentazione.

---

## [0.3.0] - 2026-02-04

### Added (Novità per te)
- Insight e Advisor con messaggi più coerenti grazie a regole semantiche centralizzate.
- Analisi più adattiva su stabilità ed elasticità finanziaria.
- Nuovo pannello tecnico nel Financial Lab per capire meglio come vengono lette le metriche.
- Controlli automatici sul linguaggio IA per ridurre messaggi incoerenti o fuorvianti.

### Changed (Miglioramenti per te)
- Generazione testi centralizzata, con meno varianti non controllate.
- Standard semantici di progetto rafforzati nelle principali sezioni.

---

## [0.2.5] - 2026-02-04

### Added (Novità per te)
- Interfaccia più viva con animazioni progressive nelle superfici principali.
- Simulator più lineare, con accesso scenario semplificato e unificato.

### Changed (Miglioramenti per te)
- Identità visiva più allineata al brand Numa.
- Geometrie (raggi e forme) più consistenti tra le sezioni.

---

## [0.2.0] - 2026-02-01

### Added (Novità per te)
- Financial Lab v3 con nuova esperienza obiettivi e scenari.
- Logic Vault per separare la logica obiettivi dall'interfaccia.

### Changed (Miglioramenti per te)
- Calcoli monetari più stabili grazie a una gestione numerica più robusta degli importi.

---

## [0.1.5] - 2026-01-28

### Added (Novità per te)
- Privacy Shield: blur globale quando attivi la privacy.
- Feedback immediato sul ritmo, con conferma più chiara dopo la selezione.

### Changed (Miglioramenti per te)
- Nuovo linguaggio prodotto: focus su percorso e ritmo, non su logiche statiche di budget.

---

## [0.1.2] - 2026-01-27

### Added (Novità per te)
- Tipografia governata con gerarchia testi più leggibile e uniforme.
- Sheet standardizzati con pattern unico per dettaglio e modifica.

### Changed (Miglioramenti per te)
- Dashboard e Insights riallineati agli standard Numa Premium.

---

## [0.1.0] - 2026-01-25

### Added (Novità per te)
- Prima release con base operativa: import CSV, KPI e categorie.
- Approccio local-first: i dati restano gestiti localmente con persistenza dedicata.
