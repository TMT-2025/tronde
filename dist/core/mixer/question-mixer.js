import { cloneRichContent } from "../ir/helpers.js";
import { shuffleArray } from "./permutation.js";
import { mixOptions } from "./option-mixer.js";
import { mixTrueFalseSubItems } from "./true-false-mixer.js";
export function mixSectionQuestions(section, options, prng) {
    const mcqMappings = {};
    const tfMappings = {};
    const saMappings = {};
    const questionOrders = [];
    // 1. Clone questions list
    const clonedQuestions = section.questions.map(q => ({
        id: q.id,
        sourcePosition: { ...q.sourcePosition },
        type: q.type,
        stem: cloneRichContent(q.stem),
        options: q.options ? q.options.map(o => ({ ...o, content: cloneRichContent(o.content) })) : undefined,
        subItems: q.subItems ? q.subItems.map(s => ({ ...s, content: cloneRichContent(s.content) })) : undefined,
        shortAnswer: q.shortAnswer ? {
            ...q.shortAnswer,
            acceptableAnswers: q.shortAnswer.acceptableAnswers ? [...q.shortAnswer.acceptableAnswers] : undefined,
            sourceAnswerRaw: q.shortAnswer.sourceAnswerRaw ? cloneRichContent(q.shortAnswer.sourceAnswerRaw) : undefined
        } : undefined,
        allowShuffle: q.allowShuffle,
        allowOptionShuffle: q.allowOptionShuffle,
        formattingMetadata: { ...q.formattingMetadata }
    }));
    // 2. Permute question order if enabled
    let permutedQuestions;
    if (!options.shuffleQuestions) {
        permutedQuestions = clonedQuestions;
    }
    else {
        permutedQuestions = shuffleArray(clonedQuestions, prng);
    }
    // 3. Process each question
    for (let newIdx = 0; newIdx < permutedQuestions.length; newIdx++) {
        const q = permutedQuestions[newIdx];
        questionOrders.push({
            originalIndex: q.sourcePosition.questionIndex,
            newIndex: newIdx + 1,
            questionId: q.id,
            sectionIndex: section.sectionIndex
        });
        if (q.type === "MULTIPLE_CHOICE" && q.options) {
            const shouldShuffleOpt = options.shuffleOptions && q.allowOptionShuffle;
            const optResult = mixOptions(q.id, q.options, shouldShuffleOpt, prng);
            q.options = optResult.shuffledOptions;
            mcqMappings[q.id] = optResult.mapping;
        }
        else if (q.type === "TRUE_FALSE" && q.subItems) {
            const shouldShuffleSub = options.shuffleTrueFalseSubItems;
            const tfResult = mixTrueFalseSubItems(q.id, q.subItems, shouldShuffleSub, prng);
            q.subItems = tfResult.shuffledSubItems;
            tfMappings[q.id] = tfResult.mapping;
        }
        else if (q.type === "SHORT_ANSWER" && q.shortAnswer) {
            saMappings[q.id] = {
                questionId: q.id,
                expectedValue: q.shortAnswer.expectedValue,
                acceptableAnswers: q.shortAnswer.acceptableAnswers
            };
        }
    }
    const shuffledSection = {
        id: section.id,
        sectionIndex: section.sectionIndex,
        groupTag: section.groupTag,
        title: section.title,
        type: section.type,
        shufflePolicy: {
            shuffleQuestions: options.shuffleQuestions,
            shuffleOptions: options.shuffleOptions,
            shuffleTrueFalseSubItems: options.shuffleTrueFalseSubItems
        },
        questions: permutedQuestions
    };
    return {
        shuffledSection,
        questionOrders,
        mcqMappings,
        tfMappings,
        saMappings
    };
}
