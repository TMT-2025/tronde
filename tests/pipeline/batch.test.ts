import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";

describe("Batch Generation & Determinism (TEST-PIPE-002)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");

  it("Test 1: should generate 1 variant (101)", async () => {
    const outDir = path.resolve(process.cwd(), "tests/output/batch_1");
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 1,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });

    expect(result.batchItems.length).toBe(1);
    expect(result.batchItems[0].examCode).toBe("101");
    expect(fs.existsSync(path.join(outDir, "MA_DE_101.docx"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "EXAM_OUTPUT_101_101.zip"))).toBe(true);
  });

  it("Test 2: should generate 10 variants (101 -> 110)", async () => {
    const outDir = path.resolve(process.cwd(), "tests/output/batch_10");
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 10,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });

    expect(result.batchItems.length).toBe(10);
    const expectedCodes = Array.from({ length: 10 }, (_, i) => String(101 + i));
    expect(result.manifest.examCodes).toEqual(expectedCodes);

    for (const code of expectedCodes) {
      expect(fs.existsSync(path.join(outDir, `MA_DE_${code}.docx`))).toBe(true);
    }
    expect(fs.existsSync(path.join(outDir, "EXAM_OUTPUT_101_110.zip"))).toBe(true);
  });

  it("Test 3: should generate 100 variants (101 -> 200)", async () => {
    const outDir = path.resolve(process.cwd(), "tests/output/batch_100");
    const tStart = performance.now();
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 100,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });
    const duration = performance.now() - tStart;

    expect(result.batchItems.length).toBe(100);
    expect(result.manifest.validationStatus.allGatesPassed).toBe(true);
    expect(result.manifest.validationStatus.totalErrors).toBe(0);

    console.log(`100 variants pipeline completed in ${duration.toFixed(2)}ms`);
    console.log(`Stage benchmarks:`, JSON.stringify(result.benchmarks, null, 2));

    expect(fs.existsSync(path.join(outDir, "EXAM_OUTPUT_101_200.zip"))).toBe(true);
  }, 60000); // 60s timeout

  it("Test 4: same seed + same configuration should produce deterministic outputs", async () => {
    const runA = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 3,
      seed: 99999,
      skipDiskWrite: true,
      createZip: false
    });

    const runB = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 3,
      seed: 99999,
      skipDiskWrite: true,
      createZip: false
    });

    for (let i = 0; i < 3; i++) {
      expect(runA.batchItems[i].examCode).toBe(runB.batchItems[i].examCode);
      // Answer keys must match exactly
      expect(runA.answerKey.variants[runA.batchItems[i].examCode]).toEqual(
        runB.answerKey.variants[runB.batchItems[i].examCode]
      );
    }
  });

  it("Test 5: different seed should produce different permutations", async () => {
    const run1 = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 2,
      seed: 11111,
      skipDiskWrite: true,
      createZip: false
    });

    const run2 = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 2,
      seed: 88888,
      skipDiskWrite: true,
      createZip: false
    });

    // The answer keys should not be identical because seeds differ
    const key1 = run1.answerKey.variants["101"].answers;
    const key2 = run2.answerKey.variants["101"].answers;

    const areIdentical = JSON.stringify(key1) === JSON.stringify(key2);
    expect(areIdentical).toBe(false);
  });
});
