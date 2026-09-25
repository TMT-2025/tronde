import { TrueFalseSubItem } from "../ir/types.js";
import { SeededPRNG } from "./seeded-prng.js";
import { TFAnswerMapping } from "./answer-mapper.js";
export interface TrueFalseMixResult {
    shuffledSubItems: TrueFalseSubItem[];
    mapping: TFAnswerMapping;
}
export declare function mixTrueFalseSubItems(questionId: string, subItems: readonly TrueFalseSubItem[], shuffle: boolean, prng: SeededPRNG): TrueFalseMixResult;
