/**
 * DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (PRNG)
 * Implementation of Mulberry32 algorithm.
 * Guarantees 100% reproducible sequences across platforms.
 * Conforms to 04_MIXING_SPEC.md.
 */
export declare class SeededPRNG {
    private state;
    private readonly initialSeed;
    constructor(seed: number);
    /**
     * Generates a pseudo-random floating-point number in [0, 1)
     */
    next(): number;
    /**
     * Generates a pseudo-random integer in [min, max] (inclusive)
     */
    nextInt(min: number, max: number): number;
    /**
     * Derives a child PRNG with a deterministic sub-seed
     */
    fork(subSeedOffset?: number): SeededPRNG;
    /**
     * Returns the initial seed
     */
    getSeed(): number;
}
