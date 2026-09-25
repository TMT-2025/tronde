import { ExamIR } from "../ir/types.js";
import { VariantExamResult } from "../mixer/variant-generator.js";
import { ValidationReport } from "../validation/parser-validator.js";
import { MixingValidationReport } from "../validation/mixing-validator.js";
import { RenderValidationReport } from "../validation/render-validator.js";
export type QualityGateName = "GATE_1_PRE_PARSE" | "GATE_2_POST_MIXING" | "GATE_3_POST_RENDER";
export declare class PipelineQualityGateError extends Error {
    readonly gate: QualityGateName;
    readonly issues: any[];
    constructor(gate: QualityGateName, message: string, issues?: any[]);
}
/**
 * Gate 1: Pre-parse & Post-parse validation
 * Verifies DOCX binary structure and parsed ExamIR academic schema
 */
export declare function executeGate1Validation(sourceDocxBuffer: Buffer | Uint8Array, parsedExam: ExamIR): Promise<ValidationReport>;
/**
 * Gate 2: Post-mixing validation for a single variant
 * Verifies question count, section integrity, option integrity, answer correctness preservation
 */
export declare function executeGate2Validation(sourceExam: Readonly<ExamIR>, variantResult: Readonly<VariantExamResult>): MixingValidationReport;
/**
 * Gate 3: Post-render validation for a single rendered DOCX
 * Verifies OpenXML package validity, zero answer leakage, dynamic fields, and styling
 */
export declare function executeGate3Validation(renderedDocxBuffer: Buffer | Uint8Array, variantResult: Readonly<VariantExamResult>): Promise<RenderValidationReport>;
