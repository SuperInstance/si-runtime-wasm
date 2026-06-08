# ⚡ si-runtime-wasm

> WebAssembly runtime for constraint-aware AI — conservation budgets, spectral ranking, capability discovery in the browser.

**si-runtime-wasm** brings the [SuperInstance](https://github.com/SuperInstance) runtime primitives to the browser via a high-performance WebAssembly module compiled from Rust. It provides:

- **💰 Conservation Budgets** — Track resource allocation with invariant-preserving transfers
- **📊 Spectral Ranking** — Eigenvector centrality via power iteration for importance ranking
- **🔍 Capability Registry** — Dependency-aware service discovery and resolution
- **🧬 Cellular Automata** — Grid simulations with pluggable rules (threshold, diffusion, SmoothLife)
- **🤖 Homeostatic Agents** — PID-controlled agents with gauge tracking

All running at native speed in the browser, with zero external dependencies.

---

## Quick Start

### Using from JavaScript

```html
<script type="module">
  import init, { Budget, spectralRank, Capability, Registry, Grid, Agent } from './pkg/si_runtime_wasm.js';

  async function run() {
    await init();

    // Conservation budget
    const budget = new Budget(100.0);
    console.log('Total:', budget.total());
    console.log('Remaining:', budget.remaining());

    budget.allocate(30.0);
    console.log('After allocating 30:', budget.allocated());
    console.log('Audit passes:', budget.audit());

    budget.spend(10.0);
    console.log('After spending 10:', budget.remaining());

    // Spectral ranking — pass flat adjacency matrix + dimension
    const adj = [
      [0, 1, 1, 1],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ];
    const flat = adj.flat();
    const n = adj.length;
    const ranking = spectralRank(flat, n);
    console.log('Spectral ranking:', ranking); // [0, 1, 2, 3] — hub is #1

    // Capability registry
    const reg = new Registry();
    const cap = new Capability('my-service', '1.0.0');
    cap.provides('compute');
    cap.requires('storage');
    reg.register(cap);

    const providers = reg.resolve('compute');
    console.log('Compute providers:', providers.length);

    // Cellular automaton
    const grid = Grid.new(20, 'threshold');
    console.log('Grid state:', grid.getState());
    grid.run(10);
    console.log('After 10 steps:', grid.getState());
  }

  run();
</script>
```

### Installation via npm

```bash
npm install si-runtime-wasm
```

```javascript
import init, { Budget } from 'si-runtime-wasm';

await init();
const b = new Budget(100.0);
```

### From CDN

```html
<script type="module">
  import init, { Budget } from 'https://unpkg.com/si-runtime-wasm/pkg/si_runtime_wasm.js';
  await init();
  const b = new Budget(100.0);
</script>
```

---

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### Build

```bash
git clone https://github.com/SuperInstance/si-runtime-wasm.git
cd si-runtime-wasm

# Build for web targets
wasm-pack build --target web

# Build for bundler (webpack, vite, etc.)
wasm-pack build --target bundler

# Build for Node.js
wasm-pack build --target nodejs
```

The output goes to `pkg/` — a ready-to-publish npm package.

### Run the Demo

```bash
# Serve the demo page (any static file server)
python3 -m http.server 8080
# Open http://localhost:8080/index.html
```

Or use the pre-built demo:

```bash
npx serve .
```

---

## API Reference

### Budget

Conservation budget with gamma/eta tracking. The total is invariant: `total = gamma + eta + allocated`.

```javascript
const b = new Budget(300.0);

// Inspect
b.total();      // 300
b.gamma();      // ~100
b.eta();        // ~100
b.allocated();  // ~100
b.remaining();  // ~200 (gamma + eta)

// Allocate from free pool to allocated
b.allocate(50.0);  // Returns void, throws on over-allocation

// Spend from allocated (returns to gamma/eta)
b.spend(20.0);

// Transfer between pools
b.transferGammaToEta(5.0);
b.transferEtaToGamma(3.0);

// Verify conservation invariant
b.audit();  // true — total = gamma + eta + allocated

// Serialize
const json = b.toJson();
```

**Key invariant:** `b.audit()` always returns `true`. The total never changes; only the distribution shifts.

### spectralRank(adjacency)

Compute eigenvector centrality ranking via power iteration.

```javascript
// Adjacency matrix (symmetric for undirected graph)
const adj = [
  [0, 1, 1, 1, 1],  // Node 0 is the hub
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
];
const flat = adj.flat();
const n = adj.length;

const ranking = spectralRank(flat, n);
// ranking = [0, 1, 2, 3, 4] — hub ranks first
```

Returns indices sorted by eigenvector centrality (highest first).

### eigenvectorCentrality(adjacency)

Get raw eigenvector centrality scores.

```javascript
const flat = adj.flat();
const n = adj.length;
const scores = eigenvectorCentrality(flat, n);
// scores[0] ≈ 0.707 (hub)
// scores[1..4] ≈ 0.354 (leaves)
```

### Capability

A named, versioned capability with provides/requires lists.

```javascript
const cap = new Capability('renderer', '1.0.0');
cap.provides('ui');
cap.provides('canvas');
cap.requires('events');

cap.getName();       // 'renderer'
cap.getVersion();    // '1.0.0'
cap.satisfies('ui'); // true
cap.satisfies('audio'); // false
```

### Registry

Service registry with dependency resolution.

```javascript
const reg = new Registry();

const renderer = new Capability('canvas-renderer', '1.0.0');
renderer.provides('ui');
renderer.provides('canvas');
reg.register(renderer);

const audio = new Capability('web-audio', '2.0.0');
audio.provides('audio');
audio.requires('ui');
reg.register(audio);

// Resolve by interface
const uiProviders = reg.resolve('ui');
// → [canvas-renderer]

// Resolve dependencies for a capability
const deps = reg.resolveDeps(audio);
// → [canvas-renderer] (satisfies 'ui' requirement)

reg.count(); // 2
```

### Grid

Cellular automaton with pluggable rules.

```javascript
// Create grid with rule: "threshold" | "diffusion" | "smoothlife"
const grid = Grid.new(50, 'threshold');

// Or blank
const blank = Grid.newBlank(50);

// Step simulation
grid.step();

// Run multiple steps
grid.run(100);

// Read state
const state = grid.getState(); // Float64Array of size*size
grid.getSize();                 // 50
grid.getRule();                 // "threshold"

// Set individual cells
grid.setCell(10, 20, 1.0);
grid.getCell(10, 20);          // 1.0

// Change rule on the fly
grid.setRule('diffusion');
```

**Built-in rules:**

| Rule | Description |
|------|-------------|
| `threshold` | Conway-like: alive if neighbor average in [0.2, 0.8], born if in [0.35, 0.65] |
| `diffusion` | Smooth blend: each cell moves 50% toward neighbor average |
| `smoothlife` | Continuous sigmoid-based birth/survival |

### Agent

Homeostatic agent with PID controller and gauge tracking.

```javascript
const agent = new Agent('controller-1');

// Configure PID
agent.configurePid(1.0, 0.1, 0.05);

// Set target
agent.setSetpoint(0.5);

// Add a gauge
const gauge = new Gauge('temperature', 0.8);
agent.addGauge(gauge);

// Run homeostatic ticks
agent.tick();      // Returns correction value
agent.runTicks(50); // Run 50 ticks

agent.primaryGauge(); // Current value after PID correction
agent.getTick();      // Tick counter
agent.getSetpoint();  // Current setpoint
```

---

## Integration with si-runtime-js

`si-runtime-wasm` is the WASM backend for [`si-runtime-js`](https://github.com/SuperInstance/si-runtime-js). The JS runtime wraps the WASM module with a higher-level API:

```javascript
// si-runtime-js internally uses si-runtime-wasm
import { Runtime } from 'si-runtime-js';

const runtime = new Runtime({
  wasmModule: await import('si-runtime-wasm'),
});

// The JS runtime delegates hot-path computations to WASM:
const budget = runtime.createBudget(1000);
const ranking = runtime.spectralRank(myGraph);
```

If you're building a custom integration:

```javascript
import init, * as si from 'si-runtime-wasm';

let loaded = false;

export async function load() {
  if (!loaded) {
    await init();
    loaded = true;
  }
  return si;
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser / JS                    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Budget   │  │ Registry │  │  Grid (CA)    │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │                │           │
│  ═════╪═════════════╪════════════════╪═════════  │
│       │    wasm-bindgen bridge       │           │
│  ═════╪═════════════╪════════════════╪═════════  │
│       │             │                │           │
│  ┌────▼─────┐  ┌────▼─────┐  ┌──────▼───────┐  │
│  │ Budget   │  │ Registry │  │  Grid        │  │
│  │ (Rust)   │  │ (Rust)   │  │  (Rust)      │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                   │
│              WASM (wasm32-unknown-unknown)         │
└─────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── lib.rs           — Entry point, exports, init
├── conservation.rs  — Budget with gamma/eta tracking
├── spectral.rs      — Power iteration eigenvector centrality
├── capability.rs    — Capability + Registry with resolution
├── cell.rs          — Cellular automaton with pluggable rules
└── agent.rs         — Agent with gauges and PID homeostasis
```

---

## Conservation Law Details

The budget system maintains a strict conservation law:

```
total = gamma + eta + allocated
```

- **total**: Fixed at creation. Never changes.
- **gamma**: First pool, weighted toward system overhead
- **eta**: Second pool, weighted toward reactive reserves
- **allocated**: Budget committed to active operations

All operations are transfers — nothing is created or destroyed:

- `allocate(amount)` — Moves from gamma/eta (proportionally) to allocated
- `spend(amount)` — Returns from allocated to gamma (60%) and eta (40%)
- `transferGammaToEta(amount)` — Moves between free pools
- `audit()` — Verifies `|total - gamma - eta - allocated| < 1e-10`

This models physical conservation laws — the budget is a closed system.

---

## Spectral Ranking Details

Eigenvector centrality computed via power iteration:

1. Start with uniform vector `v₀ = [1/n, 1/n, ..., 1/n]`
2. Iterate: `v_{k+1} = A · v_k / ||A · v_k||`
3. Converge when `||v_{k+1} - v_k|| < 1e-10`
4. Max 200 iterations

The ranking sorts nodes by their eigenvector centrality score — nodes connected
to other high-scoring nodes rank higher. This is the same algorithm used by
PageRank (with modifications).

---

## Testing

### Native Rust tests

```bash
cargo test
```

### WASM-specific tests (requires wasm-pack)

```bash
wasm-pack test --headless --firefox
# or
wasm-pack test --headless --chrome
```

The test suite includes 14+ tests covering:
- Budget creation, allocation, spending, transfer, audit
- Spectral ranking (empty, single, star graph)
- Capability satisfies and registry resolution
- Grid creation, stepping, cell get/set
- Agent PID homeostasis convergence

---

## Performance

Compiled with `-O s` (size optimization) and LTO:

| Metric | Value |
|--------|-------|
| WASM binary size | ~15-20 KB gzipped |
| Budget operations | < 1μs per call |
| Spectral ranking (50 nodes) | < 100μs |
| Grid step (50×50) | < 500μs |
| First load + init | < 50ms |

All benchmarks run in Chrome on a modern laptop. Your mileage may vary.

---

## Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

Requires `WebAssembly.instantiateStreaming` support.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Add tests
5. Run `cargo test` and `wasm-pack test --headless --chrome`
6. Commit and push
7. Open a Pull Request

### Adding a new rule

Add your rule function in `src/cell.rs`:

```rust
pub fn my_rule(cell: f64, neighbors: &[f64]) -> f64 {
    // Your logic here
    let sum: f64 = neighbors.iter().sum();
    // ...
}
```

Then add it to the `apply_rule` match in `Grid`:

```rust
fn apply_rule(&self, cell: f64, neighbors: &[f64]) -> f64 {
    match self.rule.as_str() {
        "diffusion" => rules::diffusion(cell, neighbors),
        "smoothlife" => rules::smoothlife(cell, neighbors),
        "my_rule" => rules::my_rule(cell, neighbors),
        _ => rules::threshold(cell, neighbors),
    }
}
```

### Adding a new module

1. Create `src/my_module.rs`
2. Add `pub mod my_module;` to `src/lib.rs`
3. Add `pub use my_module::MyType;` for JS export
4. Add `#[wasm_bindgen]` annotations
5. Update this README

---

## License

MIT © SuperInstance Contributors

---

## Links

- [SuperInstance Organization](https://github.com/SuperInstance)
- [si-runtime-js](https://github.com/SuperInstance/si-runtime-js) — JavaScript wrapper
- [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) — Rust ↔ JS bridge
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) — Build tooling

---

## Changelog

### 0.1.0 (2026-06-07)

- Initial release
- Conservation budget with gamma/eta tracking
- Spectral ranking via power iteration
- Capability registry with dependency resolution
- Cellular automaton with threshold, diffusion, and SmoothLife rules
- Homeostatic agent with PID controller
- Demo page with interactive visualizations
- Full wasm-bindgen test suite
