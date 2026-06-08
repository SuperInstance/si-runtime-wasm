/* tslint:disable */
/* eslint-disable */

/**
 * An agent with gauges and PID homeostatic control.
 */
export class Agent {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Add a gauge.
     */
    addGauge(gauge: Gauge): void;
    /**
     * Configure PID parameters.
     */
    configurePid(kp: number, ki: number, kd: number): void;
    /**
     * Get the agent name.
     */
    getName(): string;
    /**
     * Get the setpoint.
     */
    getSetpoint(): number;
    /**
     * Get the tick counter.
     */
    getTick(): bigint;
    /**
     * Create a new agent with a name and PID parameters.
     */
    constructor(name: string);
    /**
     * Get the primary gauge value (first gauge).
     */
    primaryGauge(): number;
    /**
     * Run n ticks, returning the final correction.
     */
    runTicks(n: number): number;
    /**
     * Set the homeostatic setpoint.
     */
    setSetpoint(sp: number): void;
    /**
     * Run one homeostatic tick — applies PID correction to the primary gauge.
     */
    tick(): number;
}

/**
 * A conservation budget that tracks allocation across gamma, eta, and
 * allocated pools. The total is invariant — transfers redistribute without
 * creating or destroying budget units.
 */
export class Budget {
    /**
     ** Return copy of self without private attributes.
     */
    toJSON(): Object;
    /**
     * Return stringified version of self.
     */
    toString(): string;
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Allocate `amount` from the free pool (split from gamma/eta proportionally).
     */
    allocate(amount: number): void;
    /**
     * Get allocated pool.
     */
    allocated(): number;
    /**
     * Audit: verify the conservation invariant holds.
     */
    audit(): boolean;
    /**
     * Get eta pool.
     */
    eta(): number;
    /**
     * Get gamma pool.
     */
    gamma(): number;
    /**
     * Create a new budget with the given total.
     */
    constructor(total: number);
    /**
     * Remaining free budget (gamma + eta).
     */
    remaining(): number;
    /**
     * Spend `amount` from the allocated pool (returns it to gamma/eta).
     */
    spend(amount: number): void;
    /**
     * Serialize to JSON.
     */
    toJson(): string;
    /**
     * Get total budget.
     */
    total(): number;
    /**
     * Transfer `amount` from eta to gamma.
     */
    transferEtaToGamma(amount: number): void;
    /**
     * Transfer `amount` from gamma to eta.
     */
    transferGammaToEta(amount: number): void;
}

/**
 * A capability with a name, version, and lists of what it provides and requires.
 */
export class Capability {
    /**
     ** Return copy of self without private attributes.
     */
    toJSON(): Object;
    /**
     * Return stringified version of self.
     */
    toString(): string;
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Get the capability name.
     */
    getName(): string;
    /**
     * Get the list of provided interfaces.
     */
    getProvides(): any[];
    /**
     * Get the list of required dependencies.
     */
    getRequires(): any[];
    /**
     * Get the capability version.
     */
    getVersion(): string;
    /**
     * Create a new capability.
     */
    constructor(name: string, version: string);
    /**
     * Add a provided interface.
     */
    provides(iface: string): Capability;
    /**
     * Add a required dependency.
     */
    requires(dep: string): Capability;
    /**
     * Check if this capability satisfies a given need.
     */
    satisfies(need: string): boolean;
}

/**
 * A named gauge tracking a value with min/max bounds.
 */
export class Gauge {
    /**
     ** Return copy of self without private attributes.
     */
    toJSON(): Object;
    /**
     * Return stringified version of self.
     */
    toString(): string;
    free(): void;
    [Symbol.dispose](): void;
    getMax(): number;
    getMin(): number;
    getName(): string;
    getValue(): number;
    constructor(name: string, value: number);
    set(value: number): void;
}

/**
 * A 2D cellular automaton grid with pluggable rules.
 */
export class Grid {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Get a cell value.
     */
    getCell(x: number, y: number): number;
    /**
     * Get the rule name.
     */
    getRule(): string;
    /**
     * Get the grid size.
     */
    getSize(): number;
    /**
     * Get the current state as a flat array.
     */
    getState(): Float64Array;
    /**
     * Create a new grid with given size and rule name ("threshold", "diffusion", "smoothlife").
     */
    constructor(size: number, rule: string);
    /**
     * Create a blank grid (all zeros).
     */
    static newBlank(size: number): Grid;
    /**
     * Run n steps.
     */
    run(steps: number): void;
    /**
     * Set a cell value.
     */
    setCell(x: number, y: number, value: number): void;
    /**
     * Set the rule.
     */
    setRule(rule: string): void;
    /**
     * Advance the grid by one step.
     */
    step(): void;
}

/**
 * A registry of capabilities with resolution.
 */
export class Registry {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Count of registered capabilities.
     */
    count(): number;
    /**
     * Get all registered capabilities.
     */
    getAll(): Capability[];
    /**
     * Create a new empty registry.
     */
    constructor();
    /**
     * Register a capability.
     */
    register(cap: Capability): void;
    /**
     * Resolve capabilities that provide a given need.
     */
    resolve(needs: string): Capability[];
    /**
     * Resolve all dependencies for a capability (returns capabilities that
     * satisfy each requirement).
     */
    resolveDeps(cap: Capability): Capability[];
}

/**
 * Compute raw eigenvector centrality scores from a flat adjacency matrix.
 */
export function eigenvectorCentrality(flat_adjacency: Float64Array, n: number): Float64Array;

/**
 * Return the crate version as a string.
 */
export function getVersion(): string;

/**
 * Initialize the WASM module — call from JS once on load.
 */
export function init(): void;

/**
 * Compute spectral ranking from a flat adjacency matrix.
 *
 * `flat_adjacency` is a row-major flat array of size n*n.
 * `n` is the matrix dimension.
 *
 * Returns indices sorted by eigenvector centrality (highest first).
 */
export function spectralRank(flat_adjacency: Float64Array, n: number): Uint32Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_agent_free: (a: number, b: number) => void;
    readonly __wbg_gauge_free: (a: number, b: number) => void;
    readonly agent_addGauge: (a: number, b: number) => void;
    readonly agent_configurePid: (a: number, b: number, c: number, d: number) => void;
    readonly agent_getName: (a: number) => [number, number];
    readonly agent_getSetpoint: (a: number) => number;
    readonly agent_getTick: (a: number) => bigint;
    readonly agent_new: (a: number, b: number) => number;
    readonly agent_primaryGauge: (a: number) => number;
    readonly agent_runTicks: (a: number, b: number) => number;
    readonly agent_setSetpoint: (a: number, b: number) => void;
    readonly agent_tick: (a: number) => number;
    readonly gauge_getMax: (a: number) => number;
    readonly gauge_getMin: (a: number) => number;
    readonly gauge_getName: (a: number) => [number, number];
    readonly gauge_getValue: (a: number) => number;
    readonly gauge_new: (a: number, b: number, c: number) => number;
    readonly gauge_set: (a: number, b: number) => void;
    readonly __wbg_grid_free: (a: number, b: number) => void;
    readonly grid_getCell: (a: number, b: number, c: number) => number;
    readonly grid_getRule: (a: number) => [number, number];
    readonly grid_getSize: (a: number) => number;
    readonly grid_getState: (a: number) => [number, number];
    readonly grid_new: (a: number, b: number, c: number) => number;
    readonly grid_newBlank: (a: number) => number;
    readonly grid_run: (a: number, b: number) => void;
    readonly grid_setCell: (a: number, b: number, c: number, d: number) => void;
    readonly grid_setRule: (a: number, b: number, c: number) => void;
    readonly grid_step: (a: number) => void;
    readonly __wbg_budget_free: (a: number, b: number) => void;
    readonly budget_allocate: (a: number, b: number) => [number, number];
    readonly budget_allocated: (a: number) => number;
    readonly budget_audit: (a: number) => number;
    readonly budget_eta: (a: number) => number;
    readonly budget_gamma: (a: number) => number;
    readonly budget_new: (a: number) => number;
    readonly budget_remaining: (a: number) => number;
    readonly budget_spend: (a: number, b: number) => [number, number];
    readonly budget_toJson: (a: number) => [number, number];
    readonly budget_total: (a: number) => number;
    readonly budget_transferEtaToGamma: (a: number, b: number) => [number, number];
    readonly budget_transferGammaToEta: (a: number, b: number) => [number, number];
    readonly __wbg_capability_free: (a: number, b: number) => void;
    readonly __wbg_registry_free: (a: number, b: number) => void;
    readonly capability_getName: (a: number) => [number, number];
    readonly capability_getProvides: (a: number) => [number, number];
    readonly capability_getRequires: (a: number) => [number, number];
    readonly capability_getVersion: (a: number) => [number, number];
    readonly capability_new: (a: number, b: number, c: number, d: number) => number;
    readonly capability_provides: (a: number, b: number, c: number) => number;
    readonly capability_requires: (a: number, b: number, c: number) => number;
    readonly capability_satisfies: (a: number, b: number, c: number) => number;
    readonly registry_count: (a: number) => number;
    readonly registry_getAll: (a: number) => [number, number];
    readonly registry_new: () => number;
    readonly registry_register: (a: number, b: number) => void;
    readonly registry_resolve: (a: number, b: number, c: number) => [number, number];
    readonly registry_resolveDeps: (a: number, b: number) => [number, number];
    readonly getVersion: () => [number, number];
    readonly init: () => void;
    readonly eigenvectorCentrality: (a: number, b: number, c: number) => [number, number];
    readonly spectralRank: (a: number, b: number, c: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
