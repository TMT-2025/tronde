import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import { PipelineQualityGateError } from "../../src/core/pipeline/pipeline-validator.js";

describe("Core Exam Pipeline (TEST-PIPE-001)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");
  const outputDir = path.resolve(process.cwd(), "tests/output/pipeline_test_run");

  it("should run complete pipeline for 1 variant and pass all gates", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 1,
      seed: 20260924,
      outputDir,
      createZip: true
    });

    expect(result.sourceExam).toBeDefined();
    expect(result.batchItems.length).toBe(1);
    expect(result.batchItems[0].examCode).toBe("101");

    // Manifest verification
    expect(result.manifest.validationStatus.allGatesPassed).toBe(true);
    expect(result.manifest.validationStatus.gate1PreParsePassed).toBe(true);
    expect(result.manifest.validationStatus.gate2PostMixingPassed).toBe(true);
    expect(result.manifest.validationStatus.gate3PostRenderPassed).toBe(true);

    // Benchmarks stage breakdown
    expect(result.benchmarks.parse.totalMs).toBeGreaterThan(0);
    expect(result.benchmarks.mix.totalMs).toBeGreaterThan(0);
    expect(result.benchmarks.render.totalMs).toBeGreaterThan(0);
    expect(result.benchmarks.validate.totalMs).toBeGreaterThan(0);
    expect(result.benchmarks.export.totalMs).toBeGreaterThan(0);
    expect(result.benchmarks.total.totalMs).toBeGreaterThan(0);

    // Export files verification
    expect(fs.existsSync(path.join(outputDir, "MA_DE_101.docx"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "answer-key.json"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "EXAM_MANIFEST.json"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "EXAM_OUTPUT_101_101.zip"))).toBe(true);
  });

  it("should fail Gate 1 and abort pipeline immediately on corrupt input DOCX", async () => {
    const corruptBuffer = Buffer.from("NOT_A_VALID_DOCX_OR_ZIP_FILE");
    const corruptOutputDir = path.resolve(process.cwd(), "tests/output/pipeline_corrupt_test");

    await expect(
      runExamPipeline({
        sourceDocx: corruptBuffer,
        templateDocx,
        examCodeStart: 101,
        variantCount: 1,
        outputDir: corruptOutputDir
      })
    ).rejects.toThrow();

    // Ensure no zip is created on failure
    expect(fs.existsSync(path.join(corruptOutputDir, "EXAM_OUTPUT_101_101.zip"))).toBe(false);
  });
});
