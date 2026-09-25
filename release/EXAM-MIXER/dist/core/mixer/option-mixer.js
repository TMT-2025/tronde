import { cloneRichContent } from "../ir/helpers.js";
import { shuffleArray } from "./permutation.js";
const LABELS = ["A", "B", "C", "D"];
export function mixOptions(questionId, options, shuffle, prng) {
    if (options.length !== 4) {
        throw new Error(`Question '${questionId}' expected 4 options, got ${options.length}`);
    }
    // Deep clone options
    const clonedOptions = options.map(opt => ({
        id: opt.id,
        originalLabel: opt.originalLabel,
        currentLabel: opt.originalLabel,
        content: cloneRichContent(opt.content),
        isCorrect: opt.isCorrect,
        answerSource: opt.answerSource,
        isPinned: opt.isPinned
    }));
    // Identify original correct option
    const originalCorrectOpt = clonedOptions.find(o => o.isCorrect);
    if (!originalCorrectOpt) {
        throw new Error(`Question '${questionId}' has no correct option marked`);
    }
    const originalCorrectLabel = originalCorrectOpt.originalLabel;
    let permutedOptions;
    if (!shuffle) {
        permutedOptions = clonedOptions;
    }
    else {
        permutedOptions = shuffleArray(clonedOptions, prng);
    }
    // Re-assign new labels A, B, C, D
    const permutations = [];
    let newCorrectLabel = null;
    for (let idx = 0; idx < permutedOptions.length; idx++) {
        const newLabel = LABELS[idx];
        const opt = permutedOptions[idx];
        opt.currentLabel = newLabel;
        permutations.push({
            originalLabel: opt.originalLabel,
            newLabel,
            optionId: opt.id,
            isCorrect: opt.isCorrect
        });
        if (opt.isCorrect) {
            newCorrectLabel = newLabel;
        }
    }
    if (!newCorrectLabel) {
        throw new Error(`Failed to map new correct option in Question '${questionId}'`);
    }
    return {
        shuffledOptions: permutedOptions,
        mapping: {
            questionId,
            originalCorrectLabel,
            newCorrectLabel,
            permutations
        }
    };
}
