use wasm_bindgen::prelude::*;

pub mod conservation;
pub mod spectral;
pub mod capability;
pub mod cell;
pub mod agent;

pub use conservation::Budget;
pub use spectral::spectral_rank;
pub use capability::{Capability, Registry};
pub use cell::Grid;
pub use agent::Agent;

/// Initialize the WASM module — call from JS once on load.
#[wasm_bindgen(start)]
pub fn init() {
    console_log("si-runtime-wasm initialized");
}

/// Log to the browser console.
fn console_log(msg: &str) {
    web_sys::console::log_1(&msg.into());
}

/// Return the crate version as a string.
#[wasm_bindgen(js_name = getVersion)]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
