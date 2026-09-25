import { QuestionOption } from "../ir/types.js";
import { SeededPRNG } from "./seeded-prng.js";
import { MCQAnswerMapping } from "./answer-mapper.js";
export interface OptionMixResult {
    shuffledOptions: QuestionOption[];
    mapping: MCQAnswerMapping;
}
export declare function mixOptions(questionId: string, options: readonly QuestionOption[], shuffle: boolean, prng: SeededPRNG): OptionMixResult;
