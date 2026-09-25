import { BatchAnswerKeyExport } from "./answer-key-generator.js";
/**
 * Generates an Excel (.xlsx) workbook containing ONLY the Horizontal Answer Key Matrix
 * with dynamically calculated column widths fitting cell contents.
 */
export declare function generateAnswerKeyExcel(batchKey: BatchAnswerKeyExport): Promise<Uint8Array>;
