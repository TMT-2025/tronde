import { ExamIR } from "../ir/types.js";
import { QuestionMixingOptions } from "../mixer/question-mixer.js";
import { VariantExamResult } from "../mixer/variant-generator.js";
import { TemplateProfile } from "../renderer/template-loader.js";
export interface BatchItemResult {
    examCode: string;
    variantResult: VariantExamResult;
    docxBytes: Uint8Array;
    timings: {
        mixMs: number;
        renderMs: number;
        validateMs: number;
    };
}
export interface BatchGenerationResult {
    items: BatchItemResult[];
    timings: {
        mixDurationsMs: number[];
        renderDurationsMs: number[];
        validateDurationsMs: number[];
    };
}
export interface BatchOptions {
    examCodeStart: number | string;
    variantCount: number;
    seed: number;
    mixingConfig?: Partial<QuestionMixingOptions>;
    templateBuffer: Buffer | Uint8Array;
    profile?: TemplateProfile;
}
/**
 * Computes an array of sequential exam code strings from a starting value
 */
export declare function generateExamCodes(start: number | string, count: number): string[];
/**
 * Executes batch generation, mixing, rendering, and Gate 2 & 3 quality checks
 */
export declare function executeBatchGeneration(sourceExam: Readonly<ExamIR>, options: BatchOptions): Promise<BatchGenerationResult>;
