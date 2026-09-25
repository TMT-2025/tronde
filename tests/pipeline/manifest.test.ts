import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import { ExamManifest } from "../../src/core/pipeline/manifest-generator.js";

describe("Exam Manifest Generation (TEST-PIPE-004)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");
  const outDir = path.resolve(process.cwd(), "tests/output/manifest_test");

  it("should generate a complete, valid EXAM_MANIFEST.json with stage benchmarks", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 5,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });

    const manifestFile = path.join(outDir, "EXAM_MANIFEST.json");
    expect(fs.existsSync(manifestFile)).toBe(true);

    const manifest: ExamManifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));

    // 1. Root metadata
    expect(manifest.manifestVersion).toBe("1.0.0");
    expect(manifest.sourceFile).toBe("DeGocTron.docx");
    expect(manifest.templateFile).toBe("DeSauTron.docx");
    expect(manifest.seed).toBe(20260924);
    expect(manifest.examCodeStart).toBe("101");
    expect(manifest.variantCount).toBe(5);
    expect(manifest.examCodes).toEqual(["101", "102", "103", "104", "105"]);

    // 2. Configuration
    expect(manifest.configuration.shuffleQuestions).toBe(true);
    expect(manifest.configuration.shuffleOptions).toBe(true);
    expect(manifest.configuration.shuffleTrueFalseSubItems).toBe(false);

    // 3. Generated files
    expect(manifest.generatedFiles.studentDocx.length).toBe(5);
    expect(manifest.generatedFiles.answerKeyFile).toBe("answer-key.json");
    expect(manifest.generatedFiles.manifestFile).toBe("EXAM_MANIFEST.json");
    expect(manifest.generatedFiles.zipFile).toBe("EXAM_OUTPUT_101_105.zip");

    // 4. Validation status
    expect(manifest.validationStatus.gate1PreParsePassed).toBe(true);
    expect(manifest.validationStatus.gate2PostMixingPassed).toBe(true);
    expect(manifest.validationStatus.gate3PostRenderPassed).toBe(true);
    expect(manifest.validationStatus.allGatesPassed).toBe(true);
    expect(manifest.validationStatus.totalErrors).toBe(0);

    // 5. Generation metadata
    expect(manifest.generationMetadata.engineName).toBe("EXAM_MIXER_CORE");
    expect(manifest.generationMetadata.totalVariants).toBe(5);
    expect(manifest.generationMetadata.totalQuestionsPerVariant).toBe(28);

    // 6. Benchmarks breakdown
    const b = manifest.benchmarks;
    expect(b.parse.totalMs).toBeGreaterThan(0);
    expect(b.mix.totalMs).toBeGreaterThan(0);
    expect(b.render.totalMs).toBeGreaterThan(0);
    expect(b.validate.totalMs).toBeGreaterThan(0);
    expect(b.export.totalMs).toBeGreaterThan(0);
    expect(b.total.totalMs).toBeGreaterThan(0);

    // Statistical metrics
    expect(typeof b.mix.p50Ms).toBe("number");
    expect(typeof b.render.p50Ms).toBe("number");
    expect(typeof b.validate.p95Ms).toBe("number");
    expect(typeof b.total.p99Ms).toBe("number");
  });
});
