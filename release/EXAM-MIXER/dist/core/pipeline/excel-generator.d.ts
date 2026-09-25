import { BatchAnswerKeyExport } from "./answer-key-generator.js";
/**
 * Generates an Excel (.xlsx) workbook buffer containing the complete answer key matrix
 */
export declare function generateAnswerKeyExcel(batchKey: BatchAnswerKeyExport): Promise<Uint8Array>;
