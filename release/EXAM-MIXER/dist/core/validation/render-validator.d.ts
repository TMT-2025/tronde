import { VariantExamResult } from "../mixer/variant-generator.js";
export interface RenderValidationIssue {
    code: string;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    message: string;
}
export interface RenderValidationReport {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    issues: RenderValidationIssue[];
    metrics: {
        hasDocumentXml: boolean;
        hasFooterXml: boolean;
        hasStylesXml: boolean;
        hasContentTypesXml: boolean;
        headerExamCodeMatch: boolean;
        footerExamCodeMatch: boolean;
        hasPageField: boolean;
        hasNumPagesField: boolean;
        totalParagraphs: number;
        subscriptCount: number;
        superscriptCount: number;
        hasAnswerLeakage: boolean;
    };
}
export declare function validateRenderedDocx(docxBuffer: Buffer | Uint8Array, expectedVariant: VariantExamResult): Promise<RenderValidationReport>;
