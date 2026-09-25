import { ExamSection } from "../ir/types.js";
import { SeededPRNG } from "./seeded-prng.js";
import { MCQAnswerMapping, TFAnswerMapping, SAAnswerMapping, QuestionOrderEntry } from "./answer-mapper.js";
export interface QuestionMixingOptions {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    shuffleTrueFalseSubItems: boolean;
}
export interface SectionMixResult {
    shuffledSection: ExamSection;
    questionOrders: QuestionOrderEntry[];
    mcqMappings: Record<string, MCQAnswerMapping>;
    tfMappings: Record<string, TFAnswerMapping>;
    saMappings: Record<string, SAAnswerMapping>;
}
export declare function mixSectionQuestions(section: Readonly<ExamSection>, options: QuestionMixingOptions, prng: SeededPRNG): SectionMixResult;
