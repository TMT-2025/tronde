import { ExamIR } from "../ir/types.js";
export interface ParseDocxOptions {
    fileName?: string;
}
export declare function parseDocx(bufferOrUint8Array: Buffer | Uint8Array, options?: ParseDocxOptions): Promise<ExamIR>;
