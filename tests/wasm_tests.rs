//! WASM bindgen tests for si-runtime-wasm.

use wasm_bindgen_test::*;
use si_runtime_wasm::*;

// ── Budget tests ──

#[wasm_bindgen_test]
fn budget_new_splits_evenly() {
    let b = Budget::new(300.0);
    assert!((b.total() - 300.0).abs() < 1e-10);
    assert!((b.remaining() - 200.0).abs() < 1e-6);
    assert!(b.audit());
}

#[wasm_bindgen_test]
fn budget_allocate_and_spend() {
    let mut b = Budget::new(100.0);
    b.allocate(30.0).unwrap();
    assert!((b.allocated() - 63.333).abs() < 0.01);
    assert!(b.audit());

    b.spend(10.0).unwrap();
    assert!(b.audit());
}

#[wasm_bindgen_test]
fn budget_over_allocate_fails() {
    let mut b = Budget::new(50.0);
    let result = b.allocate(100.0);
    assert!(result.is_err());
}

#[wasm_bindgen_test]
fn budget_transfer_maintains_invariant() {
    let mut b = Budget::new(200.0);
    let _ = b.transfer_gamma_to_eta(5.0);
    assert!(b.audit());
    let _ = b.transfer_eta_to_gamma(3.0);
    assert!(b.audit());
}

// ── Spectral tests ──

#[wasm_bindgen_test]
fn spectral_rank_empty() {
    let result = spectral_rank(&[], 0);
    assert!(result.is_empty());
}

#[wasm_bindgen_test]
fn spectral_rank_star_hub_first() {
    let n: usize = 5;
    let mut flat = vec![0.0f64; n * n];
    for i in 1..n {
        flat[0 * n + i] = 1.0;
        flat[i * n + 0] = 1.0;
    }
    let ranking = spectral_rank(&flat, n);
    assert_eq!(ranking[0], 0);
}

// ── Capability tests ──

#[wasm_bindgen_test]
fn capability_satisfies() {
    let mut cap = Capability::new("renderer", "1.0.0");
    cap.provides("ui");
    cap.provides("canvas");
    assert!(cap.satisfies("ui"));
    assert!(!cap.satisfies("audio"));
}

#[wasm_bindgen_test]
fn registry_resolve() {
    let mut reg = Registry::new();
    let mut cap1 = Capability::new("canvas-renderer", "1.0.0");
    cap1.provides("ui");
    let mut cap2 = Capability::new("audio-engine", "2.0.0");
    cap2.provides("audio");
    reg.register(&cap1);
    reg.register(&cap2);

    let ui_caps = reg.resolve("ui");
    assert_eq!(ui_caps.len(), 1);
    assert_eq!(ui_caps[0].name(), "canvas-renderer");
}

// ── Grid tests ──

#[wasm_bindgen_test]
fn grid_new_creates_nonempty_state() {
    let g = Grid::new(10, "threshold");
    let state = g.get_state();
    assert_eq!(state.len(), 100);
    assert!(state.iter().any(|&v| v > 0.0));
}

#[wasm_bindgen_test]
fn grid_step_changes_state() {
    let mut g = Grid::new(5, "threshold");
    let before = g.get_state();
    g.step();
    let after = g.get_state();
    assert_ne!(before, after);
}

#[wasm_bindgen_test]
fn grid_run_multiple_steps() {
    let mut g = Grid::new(8, "diffusion");
    g.run(10);
    assert_eq!(g.get_state().len(), 64);
}

#[wasm_bindgen_test]
fn grid_set_get_cell() {
    let mut g = Grid::new_blank(5);
    g.set_cell(2, 3, 7.0);
    assert!((g.get_cell(2, 3) - 7.0).abs() < 1e-10);
}
