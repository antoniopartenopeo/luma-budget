# Numa Neuro Core (TS-Neuro) Roadmap 🧠

This document outlines the technical path for building **Numa Neuro Core**, a zero-dependency, private-by-design Neural Network engine tailored for Numa Budget.

**Philosophy**: "Backend First." We build the brain in isolation, verify its intelligence with mathematical rigour, and only then connect it to the user interface.

> **Implementation Note (2026-02-11)**  
> The current production core is a lightweight adaptive engine in `src/brain/*` with local training, readiness gates, and current-month remaining-expense nowcast.  
> The LSTM-specific phases below are to be considered **long-term research track**, not current runtime architecture.

## 🧭 Philosophy & Scope
**"The Two-Brain Architecture"**

1.  **The Left Brain (Deterministic Logic)**
    *   *Role*: Architecture, Accounting, Precision.
    *   *Task*: "Quanto ho speso?" "Qual è il saldo?"
    *   *Tech*: Standard TypeScript logic (`src/domain/money/*`, `src/domain/transactions/*`, `src/domain/simulation/savings.ts`).
    *   *Rule*: **NEVER REPLACE**. Accounting must be exact (1+1=2).

2.  **The Right Brain (Numa Neuro Core)**
    *   *Role*: Intuition, Prediction, Pattern Recognition.
    *   *Task*: "Ce la farò a fine mese?" "Questa spesa è anomala?"
    *   *Tech*: Neural Network (TS-Neuro).
    *   *Rule*: **ALWAYS MONITOR**. It observes the Logic and adds context.

**Scope Application**:
*   The AI acts as an **Omni-Observer**. It can feed insights into *any* section (Dashboard, Insights, Financial Lab).
*   It does **not** replace the calculator; it acts as the **Analyst** reading the calculator.

---

## 🏗️ Phase 1: The Math Kernel (Foundation)
**Objective**: Build a robust linear algebra library capable of handling tensor operations in pure TypeScript.

### 1.1 Matrix Engine (`core/math/matrix.ts`)
- [ ] **Class Structure**: Typed `Float64Array` backing for performance.
- [ ] **Operations**:
    - `dot(A, B)`: Matrix multiplication (O(n³)).
    - `add(A, B)`: Element-wise addition.
    - `multiplyScalar(A, k)`: Scaling.
    - `transpose(A)`: Dimensions flip.
    - `map(fn)`: Element-wise function application (for activations).
- [ ] **Static Factory**: `Matrix.random(rows, cols)` for weight initialization.

### 1.2 Vector Engine (`core/math/vector.ts`)
- [ ] **Class Structure**: Simple wrapper around `Float64Array`.
- [ ] **Operations**:
    - `dot(v1, v2)`: Scalar product.
    - `add`, `sub`, `scale`.

### 1.3 Activation Functions (`core/math/activations.ts`)
- [ ] **Sigmoid**: $\sigma(x) = \frac{1}{1 + e^{-x}}$ (Gates)
- [ ] **DSigmoid**: Derivative for backprop.
- [ ] **Tanh**: Hyperbolic Tangent (Cell State).
- [ ] **DTanh**: Derivative.

### ✅ Phase 1 Criteria
- Unit Tests passing for all matrix operations.
- Benchmark: 100x100 matrix multiplication < 1ms.

---

## 🧠 Phase 2: Neural Architecture (The Structure)
**Objective**: Implement a Long Short-Term Memory (LSTM) network manually.

### 2.1 The LSTM Cell (`core/architecture/lstm-cell.ts`)
- [ ] **State**:
    - `cellState` ($C_t$): Long-term memory.
    - `hiddenState` ($h_t$): Short-term output.
- [ ] **Gates Logic**:
    - **Forget Gate**: What to throw away?
    - **Input Gate**: What to store?
    - **Output Gate**: What to reveal?
- [ ] **Forward Pass**: Compute next state based on input $x_t$ and prev state $h_{t-1}$.

### 2.2 Network Toplogy (`core/architecture/network.ts`)
- [ ] **Layer Management**: Stack of LSTM cells.
- [ ] **Backpropagation Through Time (BPTT)**:
    - The breakdown of the gradient chain rule over time steps.
    - Weight updates using Gradient Descent.

### ✅ Phase 2 Criteria
- **XOR Test**: Can it learn the XOR function? (Sanity check).
- **Sequence Test**: Can it learn "1, 2, 3, 1, 2, 3"?
- **Persistence**: Valid JSON export/import of weights.

---

## 🎓 Phase 3: The Supervisor (Data Interface)
**Objective**: Translate financial data into neural signals.

### 3.1 Data Normalization (`observer/normalizer.ts`)
- [ ] **Input Standardizer**: Map varied Euro amounts (e.g., 5€ - 2000€) to [0, 1] range.
    - Strategy: Logarithmic scaling + MinMax normalization to handle outliers (e.g., rent).
- [ ] **Time Encoding**: Represent "Day of Month" as cyclical Sine/Cosine features.

### 3.2 Online Learning Loop (`observer/trainer.ts`)
- [ ] **Training Strategy**:
    - On Dashboard load, fetch last N transactions.
    - Run forward pass -> Measure Error -> Backpropagate.
    - **Note**: This happens *every session*. The brain adapts live.
- [ ] **Persistence**: Save weights to LocalStorage after training.

### ✅ Phase 3 Criteria
- Complete pipeline: `Transaction[]` -> `Prediction`.
- No regression on main thread performance.

---

## 👁️ Phase 4: Integration (UI/UX)
**Objective**: Surface insights to the user.

### 4.1 Hooks & State
- [ ] `useNumaBrain()`: React hook exposing prediction state.
- [ ] `BrainProvider`: Context to hold the singleton brain instance.

### 4.2 Dashboard Connection
- [ ] Inject predictions into dashboard insight surfaces.
- [ ] **New Rule**: "Anomaly Guard" - alert if spending deviates > 2σ from predicted.

---

## Technical Constraints
- **Zero External Dependencies**: No `tensorflow.js`, no `brain.js`.
- **Performance**: Inference budget < 16ms (one frame).
- **Privacy**: No data leaves the client.
