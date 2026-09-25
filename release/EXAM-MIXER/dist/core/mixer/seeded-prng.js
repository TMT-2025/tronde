/**
 * DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (PRNG)
 * Implementation of Mulberry32 algorithm.
 * Guarantees 100% reproducible sequences across platforms.
 * Conforms to 04_MIXING_SPEC.md.
 */
export class SeededPRNG {
    state;
    initialSeed;
    constructor(seed) {
        this.initialSeed = seed;
        // Ensure unsigned 32-bit integer state
        this.state = seed >>> 0;
    }
    /**
     * Generates a pseudo-random floating-point number in [0, 1)
     */
    next() {
        let t = (this.state += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    /**
     * Generates a pseudo-random integer in [min, max] (inclusive)
     */
    nextInt(min, max) {
        if (min > max) {
            throw new Error(`Invalid range: min (${min}) cannot be greater than max (${max})`);
        }
        if (min === max) {
            return min;
        }
        const range = max - min + 1;
        return Math.floor(this.next() * range) + min;
    }
    /**
     * Derives a child PRNG with a deterministic sub-seed
     */
    fork(subSeedOffset = 1) {
        // Generate a new seed derived from current state and offset
        const nextVal = Math.floor(this.next() * 0xffffffff);
        const combined = (nextVal ^ (subSeedOffset * 0x9e3779b9)) >>> 0;
        return new SeededPRNG(combined);
    }
    /**
     * Returns the initial seed
     */
    getSeed() {
        return this.initialSeed;
    }
}
