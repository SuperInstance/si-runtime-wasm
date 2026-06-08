/* @ts-self-types="./si_runtime_wasm.d.ts" */

/**
 * An agent with gauges and PID homeostatic control.
 */
export class Agent {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AgentFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_agent_free(ptr, 0);
    }
    /**
     * Add a gauge.
     * @param {Gauge} gauge
     */
    addGauge(gauge) {
        _assertClass(gauge, Gauge);
        wasm.agent_addGauge(this.__wbg_ptr, gauge.__wbg_ptr);
    }
    /**
     * Configure PID parameters.
     * @param {number} kp
     * @param {number} ki
     * @param {number} kd
     */
    configurePid(kp, ki, kd) {
        wasm.agent_configurePid(this.__wbg_ptr, kp, ki, kd);
    }
    /**
     * Get the agent name.
     * @returns {string}
     */
    getName() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.agent_getName(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the setpoint.
     * @returns {number}
     */
    getSetpoint() {
        const ret = wasm.agent_getSetpoint(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the tick counter.
     * @returns {bigint}
     */
    getTick() {
        const ret = wasm.agent_getTick(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Create a new agent with a name and PID parameters.
     * @param {string} name
     */
    constructor(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.agent_new(ptr0, len0);
        this.__wbg_ptr = ret;
        AgentFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the primary gauge value (first gauge).
     * @returns {number}
     */
    primaryGauge() {
        const ret = wasm.agent_primaryGauge(this.__wbg_ptr);
        return ret;
    }
    /**
     * Run n ticks, returning the final correction.
     * @param {number} n
     * @returns {number}
     */
    runTicks(n) {
        const ret = wasm.agent_runTicks(this.__wbg_ptr, n);
        return ret;
    }
    /**
     * Set the homeostatic setpoint.
     * @param {number} sp
     */
    setSetpoint(sp) {
        wasm.agent_setSetpoint(this.__wbg_ptr, sp);
    }
    /**
     * Run one homeostatic tick — applies PID correction to the primary gauge.
     * @returns {number}
     */
    tick() {
        const ret = wasm.agent_tick(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) Agent.prototype[Symbol.dispose] = Agent.prototype.free;

/**
 * A conservation budget that tracks allocation across gamma, eta, and
 * allocated pools. The total is invariant — transfers redistribute without
 * creating or destroying budget units.
 */
export class Budget {
    toJSON() {
        return {
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BudgetFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_budget_free(ptr, 0);
    }
    /**
     * Allocate `amount` from the free pool (split from gamma/eta proportionally).
     * @param {number} amount
     */
    allocate(amount) {
        const ret = wasm.budget_allocate(this.__wbg_ptr, amount);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get allocated pool.
     * @returns {number}
     */
    allocated() {
        const ret = wasm.budget_allocated(this.__wbg_ptr);
        return ret;
    }
    /**
     * Audit: verify the conservation invariant holds.
     * @returns {boolean}
     */
    audit() {
        const ret = wasm.budget_audit(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get eta pool.
     * @returns {number}
     */
    eta() {
        const ret = wasm.budget_eta(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get gamma pool.
     * @returns {number}
     */
    gamma() {
        const ret = wasm.budget_gamma(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a new budget with the given total.
     * @param {number} total
     */
    constructor(total) {
        const ret = wasm.budget_new(total);
        this.__wbg_ptr = ret;
        BudgetFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Remaining free budget (gamma + eta).
     * @returns {number}
     */
    remaining() {
        const ret = wasm.budget_remaining(this.__wbg_ptr);
        return ret;
    }
    /**
     * Spend `amount` from the allocated pool (returns it to gamma/eta).
     * @param {number} amount
     */
    spend(amount) {
        const ret = wasm.budget_spend(this.__wbg_ptr, amount);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Serialize to JSON.
     * @returns {string}
     */
    toJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.budget_toJson(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get total budget.
     * @returns {number}
     */
    total() {
        const ret = wasm.budget_total(this.__wbg_ptr);
        return ret;
    }
    /**
     * Transfer `amount` from eta to gamma.
     * @param {number} amount
     */
    transferEtaToGamma(amount) {
        const ret = wasm.budget_transferEtaToGamma(this.__wbg_ptr, amount);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Transfer `amount` from gamma to eta.
     * @param {number} amount
     */
    transferGammaToEta(amount) {
        const ret = wasm.budget_transferGammaToEta(this.__wbg_ptr, amount);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) Budget.prototype[Symbol.dispose] = Budget.prototype.free;

/**
 * A capability with a name, version, and lists of what it provides and requires.
 */
export class Capability {
    static __wrap(ptr) {
        const obj = Object.create(Capability.prototype);
        obj.__wbg_ptr = ptr;
        CapabilityFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    toJSON() {
        return {
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CapabilityFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_capability_free(ptr, 0);
    }
    /**
     * Get the capability name.
     * @returns {string}
     */
    getName() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.capability_getName(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the list of provided interfaces.
     * @returns {any[]}
     */
    getProvides() {
        const ret = wasm.capability_getProvides(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Get the list of required dependencies.
     * @returns {any[]}
     */
    getRequires() {
        const ret = wasm.capability_getRequires(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Get the capability version.
     * @returns {string}
     */
    getVersion() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.capability_getVersion(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a new capability.
     * @param {string} name
     * @param {string} version
     */
    constructor(name, version) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.capability_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret;
        CapabilityFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Add a provided interface.
     * @param {string} iface
     * @returns {Capability}
     */
    provides(iface) {
        const ptr0 = passStringToWasm0(iface, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.capability_provides(this.__wbg_ptr, ptr0, len0);
        return Capability.__wrap(ret);
    }
    /**
     * Add a required dependency.
     * @param {string} dep
     * @returns {Capability}
     */
    requires(dep) {
        const ptr0 = passStringToWasm0(dep, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.capability_requires(this.__wbg_ptr, ptr0, len0);
        return Capability.__wrap(ret);
    }
    /**
     * Check if this capability satisfies a given need.
     * @param {string} need
     * @returns {boolean}
     */
    satisfies(need) {
        const ptr0 = passStringToWasm0(need, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.capability_satisfies(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
}
if (Symbol.dispose) Capability.prototype[Symbol.dispose] = Capability.prototype.free;

/**
 * A named gauge tracking a value with min/max bounds.
 */
export class Gauge {
    toJSON() {
        return {
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GaugeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gauge_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    getMax() {
        const ret = wasm.gauge_getMax(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    getMin() {
        const ret = wasm.gauge_getMin(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    getName() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.gauge_getName(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    getValue() {
        const ret = wasm.gauge_getValue(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} name
     * @param {number} value
     */
    constructor(name, value) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gauge_new(ptr0, len0, value);
        this.__wbg_ptr = ret;
        GaugeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} value
     */
    set(value) {
        wasm.gauge_set(this.__wbg_ptr, value);
    }
}
if (Symbol.dispose) Gauge.prototype[Symbol.dispose] = Gauge.prototype.free;

/**
 * A 2D cellular automaton grid with pluggable rules.
 */
export class Grid {
    static __wrap(ptr) {
        const obj = Object.create(Grid.prototype);
        obj.__wbg_ptr = ptr;
        GridFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GridFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_grid_free(ptr, 0);
    }
    /**
     * Get a cell value.
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    getCell(x, y) {
        const ret = wasm.grid_getCell(this.__wbg_ptr, x, y);
        return ret;
    }
    /**
     * Get the rule name.
     * @returns {string}
     */
    getRule() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.grid_getRule(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the grid size.
     * @returns {number}
     */
    getSize() {
        const ret = wasm.grid_getSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the current state as a flat array.
     * @returns {Float64Array}
     */
    getState() {
        const ret = wasm.grid_getState(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Create a new grid with given size and rule name ("threshold", "diffusion", "smoothlife").
     * @param {number} size
     * @param {string} rule
     */
    constructor(size, rule) {
        const ptr0 = passStringToWasm0(rule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.grid_new(size, ptr0, len0);
        this.__wbg_ptr = ret;
        GridFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a blank grid (all zeros).
     * @param {number} size
     * @returns {Grid}
     */
    static newBlank(size) {
        const ret = wasm.grid_newBlank(size);
        return Grid.__wrap(ret);
    }
    /**
     * Run n steps.
     * @param {number} steps
     */
    run(steps) {
        wasm.grid_run(this.__wbg_ptr, steps);
    }
    /**
     * Set a cell value.
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    setCell(x, y, value) {
        wasm.grid_setCell(this.__wbg_ptr, x, y, value);
    }
    /**
     * Set the rule.
     * @param {string} rule
     */
    setRule(rule) {
        const ptr0 = passStringToWasm0(rule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.grid_setRule(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Advance the grid by one step.
     */
    step() {
        wasm.grid_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) Grid.prototype[Symbol.dispose] = Grid.prototype.free;

/**
 * A registry of capabilities with resolution.
 */
export class Registry {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RegistryFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_registry_free(ptr, 0);
    }
    /**
     * Count of registered capabilities.
     * @returns {number}
     */
    count() {
        const ret = wasm.registry_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get all registered capabilities.
     * @returns {Capability[]}
     */
    getAll() {
        const ret = wasm.registry_getAll(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Create a new empty registry.
     */
    constructor() {
        const ret = wasm.registry_new();
        this.__wbg_ptr = ret;
        RegistryFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Register a capability.
     * @param {Capability} cap
     */
    register(cap) {
        _assertClass(cap, Capability);
        wasm.registry_register(this.__wbg_ptr, cap.__wbg_ptr);
    }
    /**
     * Resolve capabilities that provide a given need.
     * @param {string} needs
     * @returns {Capability[]}
     */
    resolve(needs) {
        const ptr0 = passStringToWasm0(needs, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.registry_resolve(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * Resolve all dependencies for a capability (returns capabilities that
     * satisfy each requirement).
     * @param {Capability} cap
     * @returns {Capability[]}
     */
    resolveDeps(cap) {
        _assertClass(cap, Capability);
        const ret = wasm.registry_resolveDeps(this.__wbg_ptr, cap.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) Registry.prototype[Symbol.dispose] = Registry.prototype.free;

/**
 * Compute raw eigenvector centrality scores from a flat adjacency matrix.
 * @param {Float64Array} flat_adjacency
 * @param {number} n
 * @returns {Float64Array}
 */
export function eigenvectorCentrality(flat_adjacency, n) {
    const ptr0 = passArrayF64ToWasm0(flat_adjacency, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.eigenvectorCentrality(ptr0, len0, n);
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * Return the crate version as a string.
 * @returns {string}
 */
export function getVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.getVersion();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Initialize the WASM module — call from JS once on load.
 */
export function init() {
    wasm.init();
}

/**
 * Compute spectral ranking from a flat adjacency matrix.
 *
 * `flat_adjacency` is a row-major flat array of size n*n.
 * `n` is the matrix dimension.
 *
 * Returns indices sorted by eigenvector centrality (highest first).
 * @param {Float64Array} flat_adjacency
 * @param {number} n
 * @returns {Uint32Array}
 */
export function spectralRank(flat_adjacency, n) {
    const ptr0 = passArrayF64ToWasm0(flat_adjacency, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.spectralRank(ptr0, len0, n);
    var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_1506f2235d1bdba0: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_capability_new: function(arg0) {
            const ret = Capability.__wrap(arg0);
            return ret;
        },
        __wbg_log_cf2e968649f3384e: function(arg0) {
            console.log(arg0);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./si_runtime_wasm_bg.js": import0,
    };
}

const AgentFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_agent_free(ptr, 1));
const BudgetFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_budget_free(ptr, 1));
const CapabilityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_capability_free(ptr, 1));
const GaugeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gauge_free(ptr, 1));
const GridFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_grid_free(ptr, 1));
const RegistryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_registry_free(ptr, 1));

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('si_runtime_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
