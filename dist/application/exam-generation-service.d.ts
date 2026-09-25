import { ExamAnalysisPreview, ExamGenerationJob, ExamJobProgress, ExamJobResult } from "./types.js";
/**
 * Analyzes an uploaded source DOCX, extracts structural preview, and reports potential layout warnings
 */
export declare function analyzeSourceDocx(buffer: Buffer | Uint8Array, fileName: string): Promise<ExamAnalysisPreview>;
/**
 * Runs the full generation job with progress reporting and error translation
 */
export declare function executeJobPipeline(job: ExamGenerationJob, onProgress?: (progress: ExamJobProgress) => void): Promise<ExamJobResult>;
