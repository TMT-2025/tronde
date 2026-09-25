import { ExamIR } from "../ir/types.js";
import { QuestionMixingOptions } from "./question-mixer.js";
import { VariantAuditMap, VariantAnswerKey } from "./answer-mapper.js";
export interface VariantGenerationOptions extends Partial<QuestionMixingOptions> {
    examCode: string;
    seed: number;
}
export interface VariantMetadata {
    variantId: string;
    examCode: string;
    sourceExamId?: string;
    seed: number;
    mixingConfiguration: {
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
        shuffleTrueFalseSubItems: boolean;
    };
}
export interface VariantExamResult {
    variantExam: ExamIR;
    auditMap: VariantAuditMap;
    answerKey: VariantAnswerKey;
    metadata: VariantMetadata;
}
/**
 * Derives a deterministic 32-bit seed from a base seed and exam code
 */
export declare function deriveExamSeed(baseSeed: number, examCode: string): number;
/**
 * Deep clones an entire ExamIR tree to guarantee immutability of the source
 */
export declare function deepCloneExamIR(source: Readonly<ExamIR>): ExamIR;
/**
 * Generates a single deterministic exam variant from a source ExamIR
 */
export declare function generateVariant(sourceExam: Readonly<ExamIR>, options: VariantGenerationOptions): VariantExamResult;
/**
 * Generates multiple deterministic variants for a list of exam codes
 */
export declare function generateMultipleVariants(sourceExam: Readonly<ExamIR>, baseSeed: number, examCodes: string[], config?: Partial<QuestionMixingOptions>): VariantExamResult[];
