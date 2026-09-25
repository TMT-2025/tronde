export interface StageBenchmark {
    totalMs: number;
    avgMsPerDoc: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
}
export interface PipelineBenchmarkReport {
    parse: StageBenchmark;
    mix: StageBenchmark;
    render: StageBenchmark;
    validate: StageBenchmark;
    export: StageBenchmark;
    total: StageBenchmark;
}
export interface ExamManifest {
    manifestVersion: "1.0.0";
    generatedAt: string;
    sourceFile: string;
    templateFile: string;
    seed: number;
    configuration: {
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
        shuffleTrueFalseSubItems: boolean;
    };
    examCodeStart: string;
    variantCount: number;
    examCodes: string[];
    generatedFiles: {
        studentDocx: string[];
        answerKeyFile: string;
        manifestFile: string;
        zipFile?: string;
    };
    validationStatus: {
        gate1PreParsePassed: boolean;
        gate2PostMixingPassed: boolean;
        gate3PostRenderPassed: boolean;
        allGatesPassed: boolean;
        totalErrors: number;
    };
    generationMetadata: {
        engineName: "EXAM_MIXER_CORE";
        engineVersion: "1.0.0";
        totalVariants: number;
        totalQuestionsPerVariant: number;
    };
    benchmarks: PipelineBenchmarkReport;
}
/**
 * Calculates statistical metrics (Total, Average, P50, P95, P99) from an array of sample durations in ms
 */
export declare function calculateStageBenchmark(durationsMs: number[], totalCount: number): StageBenchmark;
export interface ManifestCreationParams {
    sourceFile: string;
    templateFile: string;
    seed: number;
    configuration: {
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
        shuffleTrueFalseSubItems: boolean;
    };
    examCodeStart: string;
    variantCount: number;
    examCodes: string[];
    studentDocxFiles: string[];
    answerKeyFilename?: string;
    manifestFilename?: string;
    zipFilename?: string;
    validationPassed: {
        gate1: boolean;
        gate2: boolean;
        gate3: boolean;
    };
    benchmarks: PipelineBenchmarkReport;
}
/**
 * Builds the official EXAM_MANIFEST.json content
 */
export declare function buildExamManifest(params: ManifestCreationParams): ExamManifest;
