import { ExamIR } from "../ir/types.js";
import { QuestionMixingOptions } from "../mixer/question-mixer.js";
import { TemplateProfile } from "../renderer/template-loader.js";
import { BatchItemResult } from "./batch-generator.js";
import { BatchAnswerKeyExport } from "./answer-key-generator.js";
import { ExamManifest, PipelineBenchmarkReport } from "./manifest-generator.js";
import { ExportResult } from "./export-manager.js";
export interface ExamPipelineInput {
    sourceDocx: string | Buffer | Uint8Array;
    templateDocx?: string | Buffer | Uint8Array;
    examCodeStart?: number | string;
    variantCount?: number;
    seed?: number;
    mixingConfiguration?: Partial<QuestionMixingOptions>;
    outputDir?: string;
    createZip?: boolean;
    skipDiskWrite?: boolean;
    profile?: TemplateProfile;
}
export interface ExamPipelineResult {
    sourceExam: ExamIR;
    manifest: ExamManifest;
    answerKey: BatchAnswerKeyExport;
    batchItems: BatchItemResult[];
    exportResult: ExportResult;
    benchmarks: PipelineBenchmarkReport;
}
/**
 * End-to-End Exam Mixer Pipeline Orchestrator
 */
export declare function runExamPipeline(input: ExamPipelineInput): Promise<ExamPipelineResult>;
