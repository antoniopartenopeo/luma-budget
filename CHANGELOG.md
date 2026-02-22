# CHANGELOG

Aggiornamenti pensati per chi usa Numa ogni giorno.

Schema usato in tutte le release:
- `Added (Novità per te)`: nuove funzioni che puoi usare subito.
- `Changed (Miglioramenti per te)`: funzioni esistenti rese più chiare e utili.
- `Fixed (Correzioni)`: problemi risolti.
- `Removed (Semplificazioni)`: elementi tolti per ridurre confusione.

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

### Fixed (Correzioni)
- Corretto il calcolo periodo mensile in Dashboard usando range locale, riducendo incoerenze nei passaggi di mese/fuso.
- Sincronizzati i report audit di governance sul branch (`quick-check` + summary).
- Corretto il comportamento del link "Apri transazioni filtrate" nel portfolio abbonamenti per evitare side effect di propagazione evento.

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
