import { ExamJobResult } from "./types.js";
export declare class ResultNotFoundError extends Error {
    constructor(message: string);
}
/**
 * Retrieves the result object of a completed job
 */
export declare function getJobResult(jobId: string): ExamJobResult;
/**
 * Reads and returns the ZIP buffer for downloading
 */
export declare function getJobZipBuffer(jobId: string): {
    buffer: Buffer;
    fileName: string;
};
/**
 * Reads and returns the Answer Key JSON object
 */
export declare function getJobAnswerKey(jobId: string): any;
/**
 * Reads and returns the Manifest JSON object
 */
export declare function getJobManifest(jobId: string): any;
/**
 * Reads and returns the Excel Answer Key buffer for downloading
 */
export declare function getJobExcelBuffer(jobId: string): {
    buffer: Buffer;
    fileName: string;
};
