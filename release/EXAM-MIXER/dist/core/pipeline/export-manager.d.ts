import { BatchItemResult } from "./batch-generator.js";
import { BatchAnswerKeyExport } from "./answer-key-generator.js";
import { ExamManifest } from "./manifest-generator.js";
export interface ExportOptions {
    outputDir: string;
    createZip?: boolean;
    skipDiskWrite?: boolean;
}
export interface ExportResult {
    outputDir: string;
    docxFileNames: string[];
    docxPaths: string[];
    answerKeyFileName: string;
    answerKeyPath: string;
    manifestFileName: string;
    manifestPath: string;
    zipFileName?: string;
    zipPath?: string;
    zipBuffer?: Uint8Array;
    exportDurationMs: number;
}
/**
 * Exports generated files to disk and packs them into a single deliverable ZIP package
 */
export declare function executeExport(batchItems: BatchItemResult[], answerKeyData: BatchAnswerKeyExport, manifestData: ExamManifest, options: ExportOptions): Promise<ExportResult>;
