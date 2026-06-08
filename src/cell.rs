//! Cellular automaton grid with pluggable rules.

use wasm_bindgen::prelude::*;

/// A cellular automaton rule function signature.
pub type RuleFn = fn(f64, &[f64]) -> f64;

/// Built-in rules for cellular automata.
pub mod rules {
    /// Conway-like threshold rule: alive if sum of neighbors in (lower, upper).
    pub fn threshold(cell: f64, neighbors: &[f64]) -> f64 {
        let sum: f64 = neighbors.iter().sum();
        let n = neighbors.len() as f64;
        let avg = if n > 0.0 { sum / n } else { 0.0 };

        if cell > 0.5 {
            // Alive: survive if avg in [0.2, 0.8]
            if avg >= 0.2 && avg <= 0.8 { 1.0 } else { 0.0 }
        } else {
            // Dead: born if avg in [0.35, 0.65]
            if avg >= 0.35 && avg <= 0.65 { 1.0 } else { 0.0 }
        }
    }

    /// Diffusion rule: cell value moves toward neighbor average.
    pub fn diffusion(cell: f64, neighbors: &[f64]) -> f64 {
        let sum: f64 = neighbors.iter().sum();
        let n = neighbors.len() as f64;
        if n == 0.0 { return cell; }
        let avg = sum / n;
        cell * 0.5 + avg * 0.5
    }

    /// Smooth life rule: continuous version of Life.
    pub fn smoothlife(cell: f64, neighbors: &[f64]) -> f64 {
        let sum: f64 = neighbors.iter().sum();
        let n = neighbors.len() as f64;
        let avg = if n > 0.0 { sum / n } else { 0.0 };

        // Sigmoid-like birth/death
        let birth = 1.0 / (1.0 + (-20.0 * (avg - 0.5)).exp());
        let survival = 1.0 / (1.0 + (-20.0 * (avg - 0.3)).exp());

        if cell > 0.5 {
            survival
        } else {
            birth
        }
    }
}

/// A 2D cellular automaton grid with pluggable rules.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Grid {
    size: usize,
    state: Vec<f64>,
    rule: String,
}

#[wasm_bindgen]
impl Grid {
    /// Create a new grid with given size and rule name ("threshold", "diffusion", "smoothlife").
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize, rule: &str) -> Grid {
        let mut state = vec![0.0; size * size];
        // Seed with some noise
        for i in 0..state.len() {
            state[i] = if (i * 7 + 13) % 3 == 0 { 1.0 } else { 0.0 };
        }
        Grid {
            size,
            state,
            rule: rule.to_string(),
        }
    }

    /// Create a blank grid (all zeros).
    #[wasm_bindgen(js_name = newBlank)]
    pub fn new_blank(size: usize) -> Grid {
        Grid {
            size,
            state: vec![0.0; size * size],
            rule: "threshold".to_string(),
        }
    }

    /// Advance the grid by one step.
    #[wasm_bindgen]
    pub fn step(&mut self) {
        let n = self.size;
        let mut new_state = self.state.clone();

        for y in 0..n {
            for x in 0..n {
                let idx = y * n + x;
                let neighbors = self.get_neighbors(x, y);
                new_state[idx] = self.apply_rule(self.state[idx], &neighbors);
            }
        }

        self.state = new_state;
    }

    /// Run n steps.
    #[wasm_bindgen]
    pub fn run(&mut self, steps: usize) {
        for _ in 0..steps {
            self.step();
        }
    }

    /// Get the current state as a flat array.
    #[wasm_bindgen(js_name = getState)]
    pub fn get_state(&self) -> Vec<f64> {
        self.state.clone()
    }

    /// Get the grid size.
    #[wasm_bindgen(js_name = getSize)]
    pub fn get_size(&self) -> usize {
        self.size
    }

    /// Set a cell value.
    #[wasm_bindgen(js_name = setCell)]
    pub fn set_cell(&mut self, x: usize, y: usize, value: f64) {
        if x < self.size && y < self.size {
            self.state[y * self.size + x] = value;
        }
    }

    /// Get a cell value.
    #[wasm_bindgen(js_name = getCell)]
    pub fn get_cell(&self, x: usize, y: usize) -> f64 {
        if x < self.size && y < self.size {
            self.state[y * self.size + x]
        } else {
            0.0
        }
    }

    /// Get the rule name.
    #[wasm_bindgen(js_name = getRule)]
    pub fn get_rule(&self) -> String {
        self.rule.clone()
    }

    /// Set the rule.
    #[wasm_bindgen(js_name = setRule)]
    pub fn set_rule(&mut self, rule: &str) {
        self.rule = rule.to_string();
    }
}

impl Grid {
    fn get_neighbors(&self, x: usize, y: usize) -> Vec<f64> {
        let n = self.size;
        let mut neighbors = Vec::new();
        for dy in -1i32..=1 {
            for dx in -1i32..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx >= 0 && (nx as usize) < n && ny >= 0 && (ny as usize) < n {
                    neighbors.push(self.state[(ny as usize) * n + (nx as usize)]);
                }
            }
        }
        neighbors
    }

    fn apply_rule(&self, cell: f64, neighbors: &[f64]) -> f64 {
        match self.rule.as_str() {
            "diffusion" => rules::diffusion(cell, neighbors),
            "smoothlife" => rules::smoothlife(cell, neighbors),
            _ => rules::threshold(cell, neighbors), // default
        }
    }
}
