//! Conservation budget with gamma/eta tracking.
//!
//! Maintains the invariant: total = gamma + eta + allocated.

use wasm_bindgen::prelude::*;

/// A conservation budget that tracks allocation across gamma, eta, and
/// allocated pools. The total is invariant — transfers redistribute without
/// creating or destroying budget units.
#[wasm_bindgen(inspectable)]
#[derive(Clone, Debug)]
pub struct Budget {
    total: f64,
    gamma: f64,
    eta: f64,
    allocated: f64,
}

#[wasm_bindgen]
impl Budget {
    /// Create a new budget with the given total.
    #[wasm_bindgen(constructor)]
    pub fn new(total: f64) -> Budget {
        Budget {
            total,
            gamma: total / 3.0,
            eta: total / 3.0,
            allocated: total / 3.0,
        }
    }

    /// Allocate `amount` from the free pool (split from gamma/eta proportionally).
    #[wasm_bindgen]
    pub fn allocate(&mut self, amount: f64) -> Result<(), JsValue> {
        if amount < 0.0 {
            return Err(JsValue::from_str("amount must be non-negative"));
        }
        let free = self.gamma + self.eta;
        if amount > free {
            return Err(JsValue::from_str(&format!(
                "insufficient free budget: requested {}, available {}",
                amount, free
            )));
        }
        // Take proportionally from gamma and eta
        let gamma_frac = if free > 0.0 { self.gamma / free } else { 0.5 };
        let from_gamma = amount * gamma_frac;
        let from_eta = amount - from_gamma;

        self.gamma -= from_gamma;
        self.eta -= from_eta;
        self.allocated += amount;
        Ok(())
    }

    /// Spend `amount` from the allocated pool (returns it to gamma/eta).
    #[wasm_bindgen]
    pub fn spend(&mut self, amount: f64) -> Result<(), JsValue> {
        if amount < 0.0 {
            return Err(JsValue::from_str("amount must be non-negative"));
        }
        if amount > self.allocated {
            return Err(JsValue::from_str(&format!(
                "insufficient allocated budget: requested {}, available {}",
                amount, self.allocated
            )));
        }
        self.allocated -= amount;
        // Return 60% to gamma, 40% to eta
        self.gamma += amount * 0.6;
        self.eta += amount * 0.4;
        Ok(())
    }

    /// Transfer `amount` from gamma to eta.
    #[wasm_bindgen(js_name = transferGammaToEta)]
    pub fn transfer_gamma_to_eta(&mut self, amount: f64) -> Result<(), JsValue> {
        if amount < 0.0 || amount > self.gamma {
            return Err(JsValue::from_str("invalid transfer amount"));
        }
        self.gamma -= amount;
        self.eta += amount;
        Ok(())
    }

    /// Transfer `amount` from eta to gamma.
    #[wasm_bindgen(js_name = transferEtaToGamma)]
    pub fn transfer_eta_to_gamma(&mut self, amount: f64) -> Result<(), JsValue> {
        if amount < 0.0 || amount > self.eta {
            return Err(JsValue::from_str("invalid transfer amount"));
        }
        self.eta -= amount;
        self.gamma += amount;
        Ok(())
    }

    /// Remaining free budget (gamma + eta).
    #[wasm_bindgen]
    pub fn remaining(&self) -> f64 {
        self.gamma + self.eta
    }

    /// Get total budget.
    #[wasm_bindgen]
    pub fn total(&self) -> f64 {
        self.total
    }

    /// Get gamma pool.
    #[wasm_bindgen]
    pub fn gamma(&self) -> f64 {
        self.gamma
    }

    /// Get eta pool.
    #[wasm_bindgen]
    pub fn eta(&self) -> f64 {
        self.eta
    }

    /// Get allocated pool.
    #[wasm_bindgen]
    pub fn allocated(&self) -> f64 {
        self.allocated
    }

    /// Audit: verify the conservation invariant holds.
    #[wasm_bindgen]
    pub fn audit(&self) -> bool {
        let sum = self.gamma + self.eta + self.allocated;
        (sum - self.total).abs() < 1e-10
    }

    /// Serialize to JSON.
    #[wasm_bindgen(js_name = toJson)]
    pub fn to_json(&self) -> String {
        format!(
            r#"{{"total":{},"gamma":{},"eta":{},"allocated":{}}}"#,
            self.total, self.gamma, self.eta, self.allocated
        )
    }
}

impl Default for Budget {
    fn default() -> Self {
        Budget::new(100.0)
    }
}
