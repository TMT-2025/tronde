import { SeededPRNG } from "./seeded-prng.js";
/**
 * Unbiased Fisher-Yates (Knuth) array shuffle using a deterministic PRNG.
 * Returns a new shuffled array without mutating the original input array.
 */
export declare function shuffleArray<T>(array: readonly T[], prng: SeededPRNG): T[];
