# Visual Alignment Walkthrough - Update (v2)

**Task:** Raffinamento semantico animazione background per grafici cartesiani.
**Outcome:** ✅ SostituzioneScanner con "Rectangular Echo".

---

## Evoluzione delle Varianti Background

### 1. Radar (Default) per Grafici Circolari
*   **Geometria:** Cerchi concentrici.
*   **Animazione:** `animate-ping` radiale.
*   **Metafora:** "Nasce dal centro della ciambella/radar".

### 2. Cartesian (Rifinito) per Grafici a Linee
*   **Geometria:** Rettangoli concentrici con bordi arrotondati (`rounded-3xl` coerente con il container).
*   **Animazione:** `animate-ping` rettangolare.
*   **Metafora:** "Nasce dalla griglia/struttura rettangolare del grafico".
*   **Fondamenta:** Griglia statica sottostante (`bg-primary/5`) per ancorare visivamente i "ping" allo spazio cartesiano.

---

## Modifiche al Codice

### `PremiumChartSection`
*   Rimosso lo scanner orizzontale (`shimmer`).
*   Implementati 3 layer di rettangoli pulsanti con timing e dimensioni sfalsati:
    *   **Core:** 60% larghezza, 50% altezza, bordo spesso, ping veloce (3s).
    *   **Outer Echo:** 70% larghezza, 60% altezza, bordo sottile, ping lento (4s), delay (0.5s).
    *   **Inner Pulse:** 40% larghezza, 30% altezza, bordo sottilissimo, ping molto veloce (2s).

> **Risultato:** L’animazione ora rispetta la geometria intrinseca del grafico (rettangolo vs cerchio) mantenendo identica la dinamica "breathing/living" del radar, come richiesto ("nascere dalle linee").
