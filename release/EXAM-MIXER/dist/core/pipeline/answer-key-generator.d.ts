import { VariantExamResult } from "../mixer/variant-generator.js";
import { QuestionType } from "../ir/types.js";
export interface QuestionAnswerDetail {
    questionKey: string;
    sectionIndex: number;
    questionNumber: number;
    questionId: string;
    type: QuestionType;
    answer: string | Record<string, boolean>;
}
export interface VariantAnswerKeyJson {
    examCode: string;
    answers: Record<string, string | Record<string, boolean>>;
    detailedAnswers: QuestionAnswerDetail[];
}
export interface BatchAnswerKeyExport {
    generatedAt: string;
    totalVariants: number;
    examCodes: string[];
    variants: Record<string, VariantAnswerKeyJson>;
}
/**
 * Generates an answer key JSON representation for a single variant
 */
export declare function generateVariantAnswerKey(variantResult: VariantExamResult): VariantAnswerKeyJson;
/**
 * Generates the unified answer-key.json object for a batch of variants
 */
export declare function generateBatchAnswerKey(variants: VariantExamResult[]): BatchAnswerKeyExport;
/**
 * Reconstructs answer key from Variant IR and compares against generated answer key.
 * Throws an error if any discrepancy is found.
 */
export declare function verifyAnswerKeyConsistency(variantResult: VariantExamResult, answerKey: VariantAnswerKeyJson): boolean;
