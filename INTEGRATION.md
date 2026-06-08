# INTEGRATION.md — si-runtime-wasm

Cross-language integration guide for the **SuperInstance WebAssembly runtime** (`si-runtime-wasm`).
This document shows the same conservation budget operation in all 7 supported languages,
how this library connects to the broader SuperInstance ecosystem, and FFI binding patterns.

---

## Table of Contents

1. [Same Operation in 7 Languages](#1-same-operation-in-7-languages)
2. [Cross-Repo Integration](#2-cross-repo-integration)
3. [FFI Bindings](#3-ffi-bindings)

---

## 1. Same Operation in 7 Languages

The canonical operation: **create a conservation budget of C=1000, allocate budget, verify the conservation invariant, then transfer between gamma and eta pools.**

### WASM (si-runtime-wasm — this repo, from JavaScript)

```javascript
import init, { Budget, Agent, Capability, Registry, Grid, spectralRank, getVersion } from 'si-runtime-wasm';

async function main() {
    // Initialize the WASM module
    await init();

    console.log('si-runtime-wasm version:', getVersion());

    // ── Create budget with total C = 1000 ──
    const budget = new Budget(1000);
    // Initial split: gamma=333.3, eta=333.3, allocated=333.3

    console.log(`Initial: gamma=${budget.gamma()} eta=${budget.eta()} ` +
                `allocated=${budget.allocated()} total=${budget.total()}`);

    // ── Allocate from free pool (gamma+eta) ──
    budget.allocate(200);
    // Takes proportionally from gamma and eta, adds to allocated

    console.log(`After allocate(200): gamma=${budget.gamma()} ` +
                `eta=${budget.eta()} allocated=${budget.allocated()}`);

    // ── Verify conservation invariant ──
    const auditValid = budget.audit();
    console.log(`Conservation invariant holds: ${auditValid}`);
    // gamma + eta + allocated == total

    // ── Transfer between gamma and eta ──
    budget.transfer_gamma_to_eta(50);
    console.log(`After γ→η(50): gamma=${budget.gamma()} eta=${budget.eta()}`);

    budget.transfer_eta_to_gamma(25);
    console.log(`After η→γ(25): gamma=${budget.gamma()} eta=${budget.eta()}`);

    // ── Spend from allocated back to free pool ──
    budget.spend(100);
    console.log(`After spend(100): gamma=${budget.gamma()} ` +
                `eta=${budget.eta()} allocated=${budget.allocated()}`);

    // ── Final audit ──
    console.log(`Final audit: ${budget.audit()}`);
    console.log(`JSON: ${budget.to_json()}`);

    // ── Agent with PID homeostasis ──
    const agent = new Agent('wasm-agent');
    agent.set_setpoint(0.7);
    agent.run_ticks(20);
    console.log(`Agent: ${agent.name()}, tick=${agent.get_tick()}, ` +
                `primary=${agent.primary_gauge().toFixed(4)}`);

    // ── Capability registry ──
    const registry = new Registry();
    const cap = new Capability('planner', '1.0');
    cap.provides('plan');
    cap.provides('schedule');
    cap.requires('context');
    registry.register(cap);
    console.log(`Registry has ${registry.count()} capabilities`);

    const resolved = registry.resolve('plan');
    console.log(`Resolved 'plan': ${resolved.length} providers`);

    // ── Spectral ranking ──
    const adjacency = new Float64Array([
        4, 1, 0,
        1, 3, 1,
        0, 1, 2,
    ]);
    const ranked = spectralRank(adjacency, 3);
    console.log(`Spectral ranking: [${ranked}]`);

    // ── Cellular automaton grid ──
    const grid = new Grid(5, 'diffusion');
    grid.set_cell(2, 2, 1.0);
    grid.run(10);
    console.log(`Grid state (center): ${grid.get_cell(2, 2).toFixed(4)}`);
}

main();
```

### Rust (conservation-law-rs — reference implementation)

```rust
use conservation_law::ConservationBudget;

fn main() {
    let mut budget = ConservationBudget::new(1000.0);
    budget.allocate(600.0, 400.0).expect("allocation failed");

    let audit = budget.audit();
    assert!((audit.gamma + audit.eta - audit.total).abs() < 1e-10);
    println!("gamma={} eta={} total={}", audit.gamma, audit.eta, audit.total);

    budget.transfer("gamma", "eta", 50.0).expect("transfer failed");
    let audit = budget.audit();
    println!("After transfer: gamma={} eta={}", audit.gamma, audit.eta);
}
```

### C (si-core-c)

```c
#include "si_core.h"
#include <stdio.h>
#include <assert.h>

int main(void) {
    si_init();
    SiBudget *budget = budget_create(1000.0);
    budget_allocate(budget, 600.0, 400.0);

    BudgetReport rpt = budget_audit(budget);
    assert(rpt.violation == 0);
    printf("gamma=%.1f eta=%.1f total=%.1f\n", rpt.gamma, rpt.eta, rpt.total_budget);

    budget_transfer(budget, 0, 1, 50.0);
    rpt = budget_audit(budget);
    printf("After transfer: gamma=%.1f eta=%.1f\n", rpt.gamma, rpt.eta);

    budget_free(budget);
    si_shutdown();
    return 0;
}
```

### Python (si-runtime-python)

```python
from si_runtime import Budget, validate_budget

budget = Budget(total=1000.0, gamma=600.0, eta=400.0)
assert validate_budget(budget)
print(f"gamma={budget.gamma} eta={budget.eta} total={budget.total}")
```

### TypeScript (si-runtime-js)

```typescript
import { ConservationBudget } from 'si-runtime-js';

const budget = new ConservationBudget(1000);
budget.allocate(600, 400);
const report = budget.audit();
console.log(`gamma=${report.gamma} eta=${report.eta} total=${report.C}`);
budget.transfer('gamma', 'eta', 50);
```

### Zig (si-runtime-zig)

```zig
const conservation = @import("conservation.zig");

pub fn main() !void {
    var budget = conservation.ConservationBudget.init(1000.0);
    try budget.allocate(600.0, 400.0);
    const report = try budget.audit();
    std.debug.print("gamma={d:.1} eta={d:.1} total={d:.1}\n",
        .{ report.gamma, report.eta, report.total });
    try budget.transfer(true, 50.0);
}
```

### Go (si-runtime-go)

```go
package main

import siruntime "github.com/SuperInstance/si-runtime-go"

func main() {
    budget := siruntime.NewBudget(1000)
    budget.Allocate(600, 400)
    fmt.Printf("gamma=%.1f eta=%.1f total=%.1f\n",
        budget.Gamma, budget.Eta, budget.Total)
    budget.Transfer(50)
}
```

---

## 2. Cross-Repo Integration

### conservation-law-rs (Mathematical Foundation)

The WASM `Budget` class is compiled from Rust using `wasm-bindgen` and enforces the same
conservation invariant as `conservation-law-rs`. The WASM version adds an `allocated`
pool (γ+η+allocated=total), extending the two-pool model to three pools for more
granular budget tracking in browser environments.

**Connection points:**
- `new Budget(total)` ↔ `ConservationBudget::new(C)`
- `budget.allocate(amount)` moves from free to allocated
- `budget.spend(amount)` returns from allocated to free
- `budget.transfer_gamma_to_eta()` / `transfer_eta_to_gamma()` for γ↔η transfers
- `budget.audit()` verifies γ+η+allocated=total

### spectral-fleet-rs (Fleet Ranking)

The WASM `spectralRank()` function uses the same power-iteration algorithm as
`spectral-fleet-rs`. The flat adjacency matrix format (row-major `Float64Array`) is
compatible with all other runtimes.

**Connection points:**
- `spectralRank(flatAdjacency, n)` ↔ Rust `rank()`
- `eigenvectorCentrality(flatAdjacency, n)` ↔ Rust `power_iteration()`
- Flat matrix format is language-agnostic (C, Rust, Python, Go all use row-major)

### si-cli (CLI Discovery)

WASM agents run in browsers or Node.js and are discovered via HTTP endpoints. The CLI
communicates with WASM agents through the fleet API, not directly.

**Connection points:**
- `Agent` state serialized via `get_name()`, `get_tick()`, `get_setpoint()`
- `Registry` capabilities exposed via HTTP API
- `Grid` state exported via `get_state()` for CLI visualization

### si-fleet-api (REST API Layer)

WASM agents communicate with the fleet API via HTTP/JSON from the browser. The `Budget`
class provides `to_json()` for serialization and `audit()` for invariant verification.

**Connection points:**
- `budget.to_json()` → `POST /agents/:id/budget` body
- `budget.audit()` → health check response
- `spectralRank()` → `POST /fleet/rank` with adjacency data
- `Registry` data → `GET /agents/:id/capabilities`

### Supabase Fleet Registry (Data Backend)

WASM agents persist state to Supabase through the fleet API. The `budget.to_json()` output
maps directly to Supabase table schemas.

**Connection points:**
- `Budget.to_json()` → `agent_budgets` table
- `Agent` state → `agent_snapshots` table
- `Capability` metadata → `capabilities` table
- `Grid.get_state()` → `cell_states` table (for visualization persistence)

### sunset-ecosystem (Fleet Coordination)

`sunset-ecosystem` coordinates multi-fleet operations. WASM agents participate by exposing
their budget state, agent homeostasis, and spectral rankings through the fleet API.

**Connection points:**
- `Budget.transfer_gamma_to_eta()` for budget rebalancing
- `Agent.tick()` for homeostatic regulation within fleet
- `spectralRank()` for fleet-wide ranking contribution
- `Grid` for cellular automaton-based fleet simulation

---

## 3. FFI Bindings

### WASM is the Bridge

WASM serves as the universal runtime bridge — any language that compiles to WASM can
run in any WASM host. The `si-runtime-wasm` package is the canonical WASM build of
the SuperInstance runtime.

### Calling si-runtime-wasm from JavaScript/TypeScript (native)

```typescript
import init, { Budget, Agent } from 'si-runtime-wasm';

await init();
const budget = new Budget(1000);
budget.allocate(200);
console.log(budget.audit()); // true
```

### Calling si-runtime-wasm from Rust (wasm-bindgen)

```rust
// The WASM module IS compiled from Rust source in this repo.
// To call it from another Rust project via WASM:
use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "si-runtime-wasm")]
extern "C" {
    type Budget;
    #[wasm_bindgen(constructor)]
    fn new(total: f64) -> Budget;
    #[wasm_bindgen(method)]
    fn allocate(this: &Budget, amount: f64);
    #[wasm_bindgen(method)]
    fn audit(this: &Budget) -> bool;
    #[wasm_bindgen(method, js_name = to_json)]
    fn to_json(this: &Budget) -> String;
}
```

### Calling si-runtime-wasm from Python (via wasmtime)

```python
from wasmtime import Store, Module, Instance

store = Store()
module = Module.from_file(store.engine, 'si_runtime_wasm_bg.wasm')
instance = Instance(store, module, [])

# Call exported functions
init = instance.exports(store)["init"]
init(store)

# Budget functions would need wrapper logic for memory management
# In practice, use the JS bridge pattern:
# Python → HTTP → Node.js → WASM
```

### Calling si-runtime-wasm from Go (via wasmtime-go)

```go
package main

import "github.com/bytecodealliance/wasmtime-go"

func main() {
    engine := wasmtime.NewEngine()
    module, _ := wasmtime.NewModuleFromFile(engine, "si_runtime_wasm_bg.wasm")
    store := wasmtime.NewStore(engine)
    instance, _ := wasmtime.NewInstance(store, module, [])

    init := instance.GetFunc(store, "init")
    init.Call(store)
}
```

### Calling C from WASM (Emscripten pattern)

```c
// Compile si-core-c to WASM via Emscripten
// emcc si_core.c -o si_core_wasm.js -s EXPORTED_FUNCTIONS='["_si_init","_budget_create","_budget_allocate","_budget_free"]'

// Then in JavaScript:
const Module = require('./si_core_wasm.js');
Module().then(mod => {
    mod._si_init();
    const budget = mod._budget_create(1000.0);
    mod._budget_allocate(budget, 600.0, 400.0);
    mod._budget_free(budget);
});
```

### Calling Rust from WASM (wasm-bindgen pattern)

```rust
// In the WASM Rust source (src/lib.rs):
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[wasm_bindgen]
pub fn spectral_rank(flat_adjacency: &[f64], n: usize) -> Vec<usize> {
    // Power iteration on flat row-major matrix
    // ...
}
```

### Calling si-runtime-wasm from Zig (via WASM target)

Zig can compile to WASM but cannot directly import WASM modules at runtime.
Use the C ABI path instead, or run the WASM module in a host and communicate
via a side-channel (HTTP, shared memory).

---

## Integration Test Matrix

| From → To | C | Rust | Python | TypeScript | Zig | Go | WASM |
|---|---|---|---|---|---|---|---|
| **WASM** | emscripten | wasm-bindgen | wasmtime | JS import | N/A | wasmtime-go | ✅ native |
| **C** | ✅ native | cdylib | ctypes | ffi-napi | `@cImport` | cgo | emscripten |
| **Rust** | extern "C" | ✅ native | PyO3 | wasm-bindgen | C ABI | C ABI | wasm-bindgen |
| **Python** | ctypes | PyO3 | ✅ native | pythonia | C API | wasmtime | wasmtime |
| **TypeScript** | ffi-napi | wasm-bindgen | pythonia | ✅ native | N/A | HTTP | JS import |
| **Zig** | `@cImport` | C ABI | C API | N/A | ✅ native | C ABI | N/A |
| **Go** | cgo | C ABI | C API | HTTP bridge | C ABI | ✅ native | wasmtime-go |

---

## WASM Export Summary

| Export | Type | Description |
|---|---|---|
| `init()` | Function | Initialize WASM module |
| `getVersion()` | Function | Return crate version string |
| `Budget` | Class | Conservation budget (γ+η+allocated=total) |
| `Budget.new(total)` | Constructor | Create budget |
| `budget.allocate(amt)` | Method | Move from free to allocated |
| `budget.spend(amt)` | Method | Return from allocated to free |
| `budget.transfer_gamma_to_eta(amt)` | Method | γ→η transfer |
| `budget.transfer_eta_to_gamma(amt)` | Method | η→γ transfer |
| `budget.audit()` | Method | Verify invariant (returns bool) |
| `budget.to_json()` | Method | Serialize to JSON string |
| `budget.gamma()` / `eta()` / `total()` | Getters | Pool values |
| `Agent` | Class | Agent with PID homeostasis |
| `Agent.new(name)` | Constructor | Create agent |
| `agent.tick()` | Method | Run one homeostatic step |
| `agent.run_ticks(n)` | Method | Run n steps |
| `agent.configure_pid(kp, ki, kd)` | Method | Set PID gains |
| `Capability` | Class | Named capability with provides/requires |
| `Registry` | Class | Capability registry with resolution |
| `Grid` | Class | 2D cellular automaton |
| `Grid.new(size, rule)` | Constructor | Create grid with rule |
| `grid.step()` / `grid.run(n)` | Methods | Advance simulation |
| `spectralRank(flat, n)` | Function | Eigenvector centrality ranking |
| `eigenvectorCentrality(flat, n)` | Function | Raw centrality scores |

---

## Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import init, { Budget, spectralRank, getVersion } from './pkg/si_runtime_wasm.js';

        async function run() {
            await init();
            document.getElementById('version').textContent = getVersion();

            const budget = new Budget(1000);
            budget.allocate(300);
            budget.transfer_gamma_to_eta(50);

            document.getElementById('audit').textContent =
                `Audit: ${budget.audit()}, γ=${budget.gamma()}, η=${budget.eta()}, total=${budget.total()}`;
        }
        run();
    </script>
</head>
<body>
    <div id="version"></div>
    <div id="audit"></div>
</body>
</html>
```

---

*Generated for SuperInstance cross-language integration — si-runtime-wasm v0.1.0*
