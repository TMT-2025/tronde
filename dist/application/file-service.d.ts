import { ExamJobFile } from "./types.js";
export declare const MAX_FILE_SIZE_BYTES: number;
export declare const ALLOWED_MIME_TYPES: Set<string>;
export declare class FileValidationError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
/**
 * Sanitizes a file name to prevent path traversal or unsafe characters
 */
export declare function sanitizeFileName(rawName: string): string;
/**
 * Validates file buffer, MIME type, extension, size, and OpenXML integrity
 */
export declare function validateUploadedDocx(buffer: Buffer | Uint8Array, fileName: string, mimeType?: string): Promise<{
    sanitizedName: string;
    size: number;
}>;
/**
 * Resolves a safe path inside the workspace sandbox
 */
export declare function getSandboxDirectory(...subPaths: string[]): string;
/**
 * Saves uploaded file securely in the sandbox for a job
 */
export declare function saveUploadedFileToSandbox(jobId: string, buffer: Buffer | Uint8Array, fileName: string, mimeType?: string): Promise<ExamJobFile>;
