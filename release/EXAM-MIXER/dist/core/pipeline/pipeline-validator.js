import JSZip from "jszip";
import { validateExamIR } from "../validation/parser-validator.js";
import { validateMixedVariant } from "../validation/mixing-validator.js";
import { validateRenderedDocx } from "../validation/render-validator.js";
export class PipelineQualityGateError extends Error {
    gate;
    issues;
    constructor(gate, message, issues = []) {
        super(`[PipelineQualityGateError - ${gate}] ${message}`);
        this.name = "PipelineQualityGateError";
        this.gate = gate;
        this.issues = issues;
    }
}
/**
 * Gate 1: Pre-parse & Post-parse validation
 * Verifies DOCX binary structure and parsed ExamIR academic schema
 */
export async function executeGate1Validation(sourceDocxBuffer, parsedExam) {
    // Pre-parse check: Is it a valid ZIP containing word/document.xml?
    try {
        const zip = await JSZip.loadAsync(sourceDocxBuffer);
        if (!zip.file("word/document.xml")) {
            throw new PipelineQualityGateError("GATE_1_PRE_PARSE", "Source DOCX package is missing required 'word/document.xml' part.");
        }
    }
    catch (err) {
        if (err instanceof PipelineQualityGateError)
            throw err;
        throw new PipelineQualityGateError("GATE_1_PRE_PARSE", `Source DOCX is corrupt or not a valid ZIP/OpenXML package: ${err.message}`);
    }
    // Post-parse check: Validate ExamIR
    const report = validateExamIR(parsedExam);
    if (!report.isValid) {
        throw new PipelineQualityGateError("GATE_1_PRE_PARSE", `Parsed ExamIR failed validation with ${report.totalErrors} error(s).`, report.issues);
    }
    return report;
}
/**
 * Gate 2: Post-mixing validation for a single variant
 * Verifies question count, section integrity, option integrity, answer correctness preservation
 */
export function executeGate2Validation(sourceExam, variantResult) {
    const report = validateMixedVariant(sourceExam, variantResult.variantExam, variantResult.auditMap);
    if (!report.isValid) {
        throw new PipelineQualityGateError("GATE_2_POST_MIXING", `Variant ${variantResult.metadata.examCode} failed mixing validation with ${report.totalErrors} error(s).`, report.issues);
    }
    return report;
}
/**
 * Gate 3: Post-render validation for a single rendered DOCX
 * Verifies OpenXML package validity, zero answer leakage, dynamic fields, and styling
 */
export async function executeGate3Validation(renderedDocxBuffer, variantResult) {
    const report = await validateRenderedDocx(renderedDocxBuffer, variantResult);
    if (!report.isValid) {
        throw new PipelineQualityGateError("GATE_3_POST_RENDER", `Rendered DOCX for variant ${variantResult.metadata.examCode} failed validation with ${report.totalErrors} error(s).`, report.issues);
    }
    return report;
}
