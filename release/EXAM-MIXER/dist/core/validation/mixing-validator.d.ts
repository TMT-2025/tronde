import { ExamIR } from "../ir/types.js";
import { VariantAuditMap } from "../mixer/answer-mapper.js";
export interface MixingValidationIssue {
    code: string;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    questionId?: string;
    message: string;
}
export interface MixingValidationReport {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    issues: MixingValidationIssue[];
    metrics: {
        totalQuestions: number;
        sectionCounts: {
            p1: number;
            p2: number;
            p3: number;
        };
        mcqPreservedCount: number;
        tfPreservedCount: number;
        saPreservedCount: number;
    };
}
/**
 * Validates that a generated variant is mathematically and academically sound
 * relative to the source ExamIR.
 */
export declare function validateMixedVariant(sourceExam: Readonly<ExamIR>, variantExam: Readonly<ExamIR>, auditMap?: VariantAuditMap): MixingValidationReport;
