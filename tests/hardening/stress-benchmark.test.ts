import { describe, it, expect } from "vitest";
import * as path from "path";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";

describe("Stress Benchmark & Real-World Scalability (TASK 6)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");

  it("Benchmark 1: 10 variants stress test", async () => {
    const memBefore = process.memoryUsage().heapUsed;
    const tStart = performance.now();

    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 10,
      seed: 20260925,
      skipDiskWrite: true,
      createZip: true
    });

    const elapsedMs = performance.now() - tStart;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMb = ((memAfter - memBefore) / (1024 * 1024)).toFixed(2);
    const avgMs = (elapsedMs / 10).toFixed(2);
    const zipSizeKb = result.exportResult.zipBuffer ? (result.exportResult.zipBuffer.byteLength / 1024).toFixed(1) : 0;

    console.log(`[STRESS 10] Total: ${elapsedMs.toFixed(1)}ms | Avg: ${avgMs}ms/doc | Heap Delta: ${memDeltaMb}MB | ZIP: ${zipSizeKb}KB`);

    expect(result.batchItems.length).toBe(10);
    expect(result.manifest.validationStatus.allGatesPassed).toBe(true);
    expect(result.manifest.validationStatus.totalErrors).toBe(0);
  });

  it("Benchmark 2: 100 variants stress test", async () => {
    const memBefore = process.memoryUsage().heapUsed;
    const tStart = performance.now();

    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 100,
      seed: 20260925,
      skipDiskWrite: true,
      createZip: true
    });

    const elapsedMs = performance.now() - tStart;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMb = ((memAfter - memBefore) / (1024 * 1024)).toFixed(2);
    const avgMs = (elapsedMs / 100).toFixed(2);
    const zipSizeKb = result.exportResult.zipBuffer ? (result.exportResult.zipBuffer.byteLength / 1024).toFixed(1) : 0;

    console.log(`[STRESS 100] Total: ${elapsedMs.toFixed(1)}ms | Avg: ${avgMs}ms/doc | Heap Delta: ${memDeltaMb}MB | ZIP: ${zipSizeKb}KB`);

    expect(result.batchItems.length).toBe(100);
    expect(result.manifest.validationStatus.allGatesPassed).toBe(true);
    expect(result.manifest.validationStatus.totalErrors).toBe(0);
    expect(elapsedMs).toBeLessThan(10000); // Expect < 10 seconds for 100 variants
  }, 30000);

  it("Benchmark 3: 500 variants stress test", async () => {
    const memBefore = process.memoryUsage().heapUsed;
    const tStart = performance.now();

    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 500,
      seed: 20260925,
      skipDiskWrite: true,
      createZip: true
    });

    const elapsedMs = performance.now() - tStart;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMb = ((memAfter - memBefore) / (1024 * 1024)).toFixed(2);
    const avgMs = (elapsedMs / 500).toFixed(2);
    const zipSizeMb = result.exportResult.zipBuffer ? (result.exportResult.zipBuffer.byteLength / (1024 * 1024)).toFixed(2) : 0;

    console.log(`[STRESS 500] Total: ${elapsedMs.toFixed(1)}ms | Avg: ${avgMs}ms/doc | Heap Delta: ${memDeltaMb}MB | ZIP: ${zipSizeMb}MB`);

    expect(result.batchItems.length).toBe(500);
    expect(result.manifest.validationStatus.allGatesPassed).toBe(true);
    expect(result.manifest.validationStatus.totalErrors).toBe(0);
  }, 90000);
});
