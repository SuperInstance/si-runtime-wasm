//! Agent with gauges and PID homeostasis.

use wasm_bindgen::prelude::*;

/// A simple PID controller for homeostatic regulation.
#[derive(Clone, Debug, Default)]
struct PidController {
    kp: f64,
    ki: f64,
    kd: f64,
    integral: f64,
    prev_error: f64,
}

impl PidController {
    fn new(kp: f64, ki: f64, kd: f64) -> Self {
        PidController {
            kp,
            ki,
            kd,
            integral: 0.0,
            prev_error: 0.0,
        }
    }

    fn update(&mut self, setpoint: f64, measurement: f64, dt: f64) -> f64 {
        let error = setpoint - measurement;
        self.integral += error * dt;
        let derivative = if dt > 0.0 { (error - self.prev_error) / dt } else { 0.0 };
        self.prev_error = error;
        self.kp * error + self.ki * self.integral + self.kd * derivative
    }
}

/// A named gauge tracking a value with min/max bounds.
#[wasm_bindgen(inspectable)]
#[derive(Clone, Debug)]
pub struct Gauge {
    name: String,
    value: f64,
    min: f64,
    max: f64,
}

#[wasm_bindgen]
impl Gauge {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, value: f64) -> Gauge {
        Gauge {
            name: name.to_string(),
            value,
            min: value,
            max: value,
        }
    }

    #[wasm_bindgen]
    pub fn set(&mut self, value: f64) {
        self.min = self.min.min(value);
        self.max = self.max.max(value);
        self.value = value;
    }

    #[wasm_bindgen(js_name = getValue)]
    pub fn value(&self) -> f64 {
        self.value
    }

    #[wasm_bindgen(js_name = getName)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(js_name = getMin)]
    pub fn min(&self) -> f64 {
        self.min
    }

    #[wasm_bindgen(js_name = getMax)]
    pub fn max(&self) -> f64 {
        self.max
    }
}

/// An agent with gauges and PID homeostatic control.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Agent {
    name: String,
    gauges: Vec<Gauge>,
    pid: PidController,
    setpoint: f64,
    tick: u64,
}

#[wasm_bindgen]
impl Agent {
    /// Create a new agent with a name and PID parameters.
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str) -> Agent {
        Agent {
            name: name.to_string(),
            gauges: Vec::new(),
            pid: PidController::new(1.0, 0.1, 0.05),
            setpoint: 0.5,
            tick: 0,
        }
    }

    /// Configure PID parameters.
    #[wasm_bindgen(js_name = configurePid)]
    pub fn configure_pid(&mut self, kp: f64, ki: f64, kd: f64) {
        self.pid = PidController::new(kp, ki, kd);
    }

    /// Set the homeostatic setpoint.
    #[wasm_bindgen(js_name = setSetpoint)]
    pub fn set_setpoint(&mut self, sp: f64) {
        self.setpoint = sp;
    }

    /// Add a gauge.
    #[wasm_bindgen(js_name = addGauge)]
    pub fn add_gauge(&mut self, gauge: &Gauge) {
        self.gauges.push(gauge.clone());
    }

    /// Get the primary gauge value (first gauge).
    #[wasm_bindgen(js_name = primaryGauge)]
    pub fn primary_gauge(&self) -> f64 {
        self.gauges.first().map(|g| g.value).unwrap_or(0.0)
    }

    /// Run one homeostatic tick — applies PID correction to the primary gauge.
    #[wasm_bindgen]
    pub fn tick(&mut self) -> f64 {
        let current = self.primary_gauge();
        let correction = self.pid.update(self.setpoint, current, 1.0);
        if let Some(g) = self.gauges.first_mut() {
            g.set(current + correction);
        }
        self.tick += 1;
        correction
    }

    /// Run n ticks, returning the final correction.
    #[wasm_bindgen(js_name = runTicks)]
    pub fn run_ticks(&mut self, n: usize) -> f64 {
        let mut last = 0.0;
        for _ in 0..n {
            last = self.tick();
        }
        last
    }

    /// Get the agent name.
    #[wasm_bindgen(js_name = getName)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    /// Get the tick counter.
    #[wasm_bindgen(js_name = getTick)]
    pub fn get_tick(&self) -> u64 {
        self.tick
    }

    /// Get the setpoint.
    #[wasm_bindgen(js_name = getSetpoint)]
    pub fn get_setpoint(&self) -> f64 {
        self.setpoint
    }
}
