/**
 * Unbiased Fisher-Yates (Knuth) array shuffle using a deterministic PRNG.
 * Returns a new shuffled array without mutating the original input array.
 */
export function shuffleArray(array, prng) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = prng.nextInt(0, i);
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}
