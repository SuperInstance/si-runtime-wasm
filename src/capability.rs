//! Capability discovery and registry with dependency resolution.

use wasm_bindgen::prelude::*;

/// A capability with a name, version, and lists of what it provides and requires.
#[wasm_bindgen(inspectable)]
#[derive(Clone, Debug)]
pub struct Capability {
    name: String,
    version: String,
    provides: Vec<String>,
    requires: Vec<String>,
}

#[wasm_bindgen]
impl Capability {
    /// Create a new capability.
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, version: &str) -> Capability {
        Capability {
            name: name.to_string(),
            version: version.to_string(),
            provides: Vec::new(),
            requires: Vec::new(),
        }
    }

    /// Add a provided interface.
    #[wasm_bindgen]
    pub fn provides(&mut self, iface: &str) -> Capability {
        self.provides.push(iface.to_string());
        self.clone()
    }

    /// Add a required dependency.
    #[wasm_bindgen]
    pub fn requires(&mut self, dep: &str) -> Capability {
        self.requires.push(dep.to_string());
        self.clone()
    }

    /// Get the capability name.
    #[wasm_bindgen(js_name = getName)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    /// Get the capability version.
    #[wasm_bindgen(js_name = getVersion)]
    pub fn version(&self) -> String {
        self.version.clone()
    }

    /// Get the list of provided interfaces.
    #[wasm_bindgen(js_name = getProvides)]
    pub fn get_provides(&self) -> Vec<JsValue> {
        self.provides.iter().map(|s| JsValue::from_str(s)).collect()
    }

    /// Get the list of required dependencies.
    #[wasm_bindgen(js_name = getRequires)]
    pub fn get_requires(&self) -> Vec<JsValue> {
        self.requires.iter().map(|s| JsValue::from_str(s)).collect()
    }

    /// Check if this capability satisfies a given need.
    #[wasm_bindgen]
    pub fn satisfies(&self, need: &str) -> bool {
        self.provides.iter().any(|p| p == need)
    }
}

/// A registry of capabilities with resolution.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Registry {
    capabilities: Vec<Capability>,
}

#[wasm_bindgen]
impl Registry {
    /// Create a new empty registry.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Registry {
        Registry {
            capabilities: Vec::new(),
        }
    }

    /// Register a capability.
    #[wasm_bindgen]
    pub fn register(&mut self, cap: &Capability) {
        self.capabilities.push(cap.clone());
    }

    /// Resolve capabilities that provide a given need.
    #[wasm_bindgen]
    pub fn resolve(&self, needs: &str) -> Vec<Capability> {
        self.capabilities
            .iter()
            .filter(|cap| cap.satisfies(needs))
            .cloned()
            .collect()
    }

    /// Get all registered capabilities.
    #[wasm_bindgen(js_name = getAll)]
    pub fn get_all(&self) -> Vec<Capability> {
        self.capabilities.clone()
    }

    /// Count of registered capabilities.
    #[wasm_bindgen(js_name = count)]
    pub fn count(&self) -> usize {
        self.capabilities.len()
    }

    /// Resolve all dependencies for a capability (returns capabilities that
    /// satisfy each requirement).
    #[wasm_bindgen(js_name = resolveDeps)]
    pub fn resolve_deps(&self, cap: &Capability) -> Vec<Capability> {
        let mut resolved = Vec::new();
        for req in &cap.requires {
            let providers = self.resolve(req);
            resolved.extend(providers);
        }
        resolved
    }
}

impl Default for Registry {
    fn default() -> Self {
        Registry::new()
    }
}
