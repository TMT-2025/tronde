export type OptionLabel = "A" | "B" | "C" | "D";
export type SubItemLabel = "a" | "b" | "c" | "d";
export interface OptionPermutationEntry {
    originalLabel: OptionLabel;
    newLabel: OptionLabel;
    optionId: string;
    isCorrect: boolean;
}
export interface MCQAnswerMapping {
    questionId: string;
    originalCorrectLabel: OptionLabel;
    newCorrectLabel: OptionLabel;
    permutations: OptionPermutationEntry[];
}
export interface SubItemPermutationEntry {
    originalLabel: SubItemLabel;
    newLabel: SubItemLabel;
    subItemId: string;
    isCorrect: boolean;
}
export interface TFAnswerMapping {
    questionId: string;
    permutations: SubItemPermutationEntry[];
    answers: Record<SubItemLabel, boolean>;
}
export interface SAAnswerMapping {
    questionId: string;
    expectedValue: string;
    acceptableAnswers?: string[];
}
export interface QuestionOrderEntry {
    originalIndex: number;
    newIndex: number;
    questionId: string;
    sectionIndex: number;
}
export interface VariantAuditMap {
    examCode: string;
    seed: number;
    questionOrder: QuestionOrderEntry[];
    mcqMappings: Record<string, MCQAnswerMapping>;
    tfMappings: Record<string, TFAnswerMapping>;
    saMappings: Record<string, SAAnswerMapping>;
}
export interface VariantAnswerKey {
    examCode: string;
    mcqAnswers: Record<string, OptionLabel>;
    tfAnswers: Record<string, Record<SubItemLabel, boolean>>;
    saAnswers: Record<string, string>;
}
/**
 * Creates an empty audit map for a variant
 */
export declare function createEmptyAuditMap(examCode: string, seed: number): VariantAuditMap;
/**
 * Derives a clean student scoring answer key from the audit map
 */
export declare function deriveAnswerKey(auditMap: VariantAuditMap): VariantAnswerKey;
