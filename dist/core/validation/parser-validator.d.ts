import { ExamIR } from "../ir/types.js";
export interface ValidationIssue {
    code: string;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    sectionIndex?: number;
    questionId?: string;
    message: string;
}
export interface ValidationReport {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    issues: ValidationIssue[];
    summary: {
        sectionCount: number;
        mcqCount: number;
        tfCount: number;
        shortAnswerCount: number;
        totalQuestions: number;
    };
}
export declare function validateExamIR(exam: ExamIR): ValidationReport;
