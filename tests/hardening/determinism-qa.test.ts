import { describe, it, expect } from "vitest";
import * as path from "path";
import JSZip from "jszip";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";

describe("Determinism Verification QA (TASK 5)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");

  it("should produce identical outputs for two identical pipeline executions", async () => {
    const config = {
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 5,
      seed: 888888,
      skipDiskWrite: true,
      createZip: true
    };

    const runA = await runExamPipeline({ ...config });
    const runB = await runExamPipeline({ ...config });

    expect(runA.batchItems.length).toBe(runB.batchItems.length);

    // 1. Answer Key byte-level equivalence
    const keyStrA = JSON.stringify(runA.answerKey.variants);
    const keyStrB = JSON.stringify(runB.answerKey.variants);
    expect(keyStrA).toBe(keyStrB);

    // 2. Per-variant DOCX document.xml equivalence
    for (let i = 0; i < runA.batchItems.length; i++) {
      const itemA = runA.batchItems[i];
      const itemB = runB.batchItems[i];

      expect(itemA.examCode).toBe(itemB.examCode);

      const zipA = await JSZip.loadAsync(itemA.docxBytes);
      const zipB = await JSZip.loadAsync(itemB.docxBytes);

      const docXmlA = await zipA.file("word/document.xml")!.async("string");
      const docXmlB = await zipB.file("word/document.xml")!.async("string");
      expect(docXmlA).toBe(docXmlB);

      const footerA = await zipA.file("word/footer1.xml")!.async("string");
      const footerB = await zipB.file("word/footer1.xml")!.async("string");
      expect(footerA).toBe(footerB);
    }

    // 3. Manifest configuration equivalence
    expect(runA.manifest.configuration).toEqual(runB.manifest.configuration);
    expect(runA.manifest.examCodes).toEqual(runB.manifest.examCodes);
    expect(runA.manifest.seed).toBe(runB.manifest.seed);
  });
});
