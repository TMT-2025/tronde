import { ExamIR } from "../ir/types.js";
import { VariantExamResult } from "../mixer/variant-generator.js";
import { TemplateProfile } from "./template-loader.js";
export interface RenderOptions {
    templateBuffer?: Buffer | Uint8Array;
    profile?: TemplateProfile;
}
export declare function buildDocumentXml(exam: ExamIR, examCode: string, profile: TemplateProfile): string;
export declare function renderExamToDocx(variantOrExam: VariantExamResult | ExamIR, examCodeParam?: string, options?: RenderOptions): Promise<Uint8Array>;
