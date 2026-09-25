import { cloneRichContent } from "../ir/helpers.js";
import { shuffleArray } from "./permutation.js";
const SUB_LABELS = ["a", "b", "c", "d"];
export function mixTrueFalseSubItems(questionId, subItems, shuffle, prng) {
    if (subItems.length !== 4) {
        throw new Error(`TRUE_FALSE Question '${questionId}' expected 4 sub-items, got ${subItems.length}`);
    }
    // Deep clone sub-items
    const clonedSubItems = subItems.map(item => ({
        id: item.id,
        originalLabel: item.originalLabel,
        currentLabel: item.originalLabel,
        content: cloneRichContent(item.content),
        isCorrect: item.isCorrect,
        answerSource: item.answerSource,
        isPinned: item.isPinned
    }));
    let permutedSubItems;
    if (!shuffle) {
        permutedSubItems = clonedSubItems;
    }
    else {
        permutedSubItems = shuffleArray(clonedSubItems, prng);
    }
    const permutations = [];
    const answers = {
        a: false,
        b: false,
        c: false,
        d: false
    };
    for (let idx = 0; idx < permutedSubItems.length; idx++) {
        const newLabel = SUB_LABELS[idx];
        const item = permutedSubItems[idx];
        item.currentLabel = newLabel;
        permutations.push({
            originalLabel: item.originalLabel,
            newLabel,
            subItemId: item.id,
            isCorrect: item.isCorrect
        });
        answers[newLabel] = item.isCorrect;
    }
    return {
        shuffledSubItems: permutedSubItems,
        mapping: {
            questionId,
            permutations,
            answers
        }
    };
}
