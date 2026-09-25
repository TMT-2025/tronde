import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../ir/types.js";
import { QuestionMixingOptions } from "../mixer/question-mixer.js";
import { parseDocx } from "../parser/docx-parser.js";
import { loadTemplateBuffer, TemplateProfile } from "../renderer/template-loader.js";
import { executeGate1Validation } from "./pipeline-validator.js";
import { executeBatchGeneration, BatchItemResult } from "./batch-generator.js";
import {
  generateBatchAnswerKey,
  verifyAnswerKeyConsistency,
  BatchAnswerKeyExport
} from "./answer-key-generator.js";
import {
  buildExamManifest,
  calculateStageBenchmark,
  ExamManifest,
  PipelineBenchmarkReport
} from "./manifest-generator.js";
import { executeExport, ExportResult } from "./export-manager.js";

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
export async function runExamPipeline(input: ExamPipelineInput): Promise<ExamPipelineResult> {
  const tTotalStart = performance.now();

  const examCodeStart = input.examCodeStart ?? 101;
  const variantCount = input.variantCount ?? 1;
  const seed = input.seed ?? 20260924;
  const outputDir = input.outputDir ?? path.resolve(process.cwd(), "output");
  const createZip = input.createZip ?? true;
  const skipDiskWrite = input.skipDiskWrite ?? false;

  const mixingConfig: QuestionMixingOptions = {
    shuffleQuestions: input.mixingConfiguration?.shuffleQuestions ?? true,
    shuffleOptions: input.mixingConfiguration?.shuffleOptions ?? true,
    shuffleTrueFalseSubItems: input.mixingConfiguration?.shuffleTrueFalseSubItems ?? false
  };

  // 1. Load source DOCX buffer
  let sourceBuffer: Buffer;
  let sourceFileName = "source.docx";
  if (typeof input.sourceDocx === "string") {
    sourceFileName = path.basename(input.sourceDocx);
    sourceBuffer = fs.readFileSync(input.sourceDocx);
  } else {
    sourceBuffer = Buffer.isBuffer(input.sourceDocx) ? input.sourceDocx : Buffer.from(input.sourceDocx);
  }

  // 2. Load template DOCX buffer
  let templateBuffer: Buffer;
  let templateFileName = "template.docx";
  if (typeof input.templateDocx === "string") {
    templateFileName = path.basename(input.templateDocx);
    templateBuffer = fs.readFileSync(input.templateDocx);
  } else if (input.templateDocx) {
    templateBuffer = Buffer.isBuffer(input.templateDocx) ? input.templateDocx : Buffer.from(input.templateDocx);
  } else {
    templateFileName = "DeSauTron.docx";
    templateBuffer = loadTemplateBuffer();
  }

  // 3. Stage 1: Parse DOCX to ExamIR
  const tParseStart = performance.now();
  const sourceExam = await parseDocx(sourceBuffer, { fileName: sourceFileName });
  const parseMs = performance.now() - tParseStart;

  // 4. Quality Gate 1: Pre-parse & Post-parse validation
  await executeGate1Validation(sourceBuffer, sourceExam);

  // 5. Stage 2, 3, 4: Batch Mixing, Gate 2, Rendering, Gate 3
  const batchResult = await executeBatchGeneration(sourceExam, {
    examCodeStart,
    variantCount,
    seed,
    mixingConfig,
    templateBuffer,
    profile: input.profile
  });

  // 6. Stage 5: Generate Answer Key & verify consistency
  const answerKey = generateBatchAnswerKey(batchResult.items.map(i => i.variantResult));
  for (const item of batchResult.items) {
    verifyAnswerKeyConsistency(item.variantResult, answerKey.variants[item.examCode]);
  }

  // 7. Calculate stage benchmarks
  const parseBenchmark = calculateStageBenchmark([parseMs], variantCount);
  const mixBenchmark = calculateStageBenchmark(batchResult.timings.mixDurationsMs, variantCount);
  const renderBenchmark = calculateStageBenchmark(batchResult.timings.renderDurationsMs, variantCount);
  const validateBenchmark = calculateStageBenchmark(batchResult.timings.validateDurationsMs, variantCount);

  // 8. Prepare Manifest
  const firstCode = batchResult.items[0]?.examCode || "101";
  const lastCode = batchResult.items[batchResult.items.length - 1]?.examCode || firstCode;
  const zipFileName = createZip ? `EXAM_OUTPUT_${firstCode}_${lastCode}.zip` : undefined;

  const manifestDraft = buildExamManifest({
    sourceFile: sourceFileName,
    templateFile: templateFileName,
    seed,
    configuration: mixingConfig,
    examCodeStart: String(examCodeStart),
    variantCount,
    examCodes: batchResult.items.map(i => i.examCode),
    studentDocxFiles: batchResult.items.map(i => `MA_DE_${i.examCode}.docx`),
    zipFilename: zipFileName,
    validationPassed: {
      gate1: true,
      gate2: true,
      gate3: true
    },
    benchmarks: {
      parse: parseBenchmark,
      mix: mixBenchmark,
      render: renderBenchmark,
      validate: validateBenchmark,
      export: { totalMs: 0, avgMsPerDoc: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0 },
      total: { totalMs: 0, avgMsPerDoc: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0 }
    }
  });

  // 9. Stage 6: Export files & ZIP
  const exportResult = await executeExport(
    batchResult.items,
    answerKey,
    manifestDraft,
    {
      outputDir,
      createZip,
      skipDiskWrite
    }
  );

  const exportBenchmark = calculateStageBenchmark([exportResult.exportDurationMs], variantCount);
  const totalMs = performance.now() - tTotalStart;
  const totalBenchmark = calculateStageBenchmark([totalMs], variantCount);

  const finalBenchmarks: PipelineBenchmarkReport = {
    parse: parseBenchmark,
    mix: mixBenchmark,
    render: renderBenchmark,
    validate: validateBenchmark,
    export: exportBenchmark,
    total: totalBenchmark
  };

  // Update manifest with final benchmarks
  manifestDraft.benchmarks = finalBenchmarks;
  if (!skipDiskWrite) {
    fs.writeFileSync(exportResult.manifestPath, JSON.stringify(manifestDraft, null, 2), "utf8");
  }

  return {
    sourceExam,
    manifest: manifestDraft,
    answerKey,
    batchItems: batchResult.items,
    exportResult,
    benchmarks: finalBenchmarks
  };
}
