import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import { validateRenderedDocx } from "../../src/core/validation/render-validator.js";
import { richContentToPlainText } from "../../src/core/ir/helpers.js";
import { ExamQuestion } from "../../src/types/exam-ir.js";

describe("End-to-End Pipeline & Deliverable Package (TEST-PIPE-005)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");
  const outDir = path.resolve(process.cwd(), "tests/output/e2e_batch_101_110");

  it("should complete full E2E pipeline for 10 variants, packaging into valid ZIP", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 10,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });

    // 1. Verify ZIP file existence
    const zipPath = path.join(outDir, "EXAM_OUTPUT_101_110.zip");
    expect(fs.existsSync(zipPath)).toBe(true);

    const zipBuffer = fs.readFileSync(zipPath);
    expect(zipBuffer.byteLength).toBeGreaterThan(50000);

    // 2. Unpack ZIP and verify package contents
    const zip = await JSZip.loadAsync(zipBuffer);

    expect(zip.file("answer-key.json")).not.toBeNull();
    expect(zip.file("EXAM_MANIFEST.json")).not.toBeNull();

    for (let code = 101; code <= 110; code++) {
      expect(zip.file(`MA_DE_${code}.docx`)).not.toBeNull();
    }

    // 3. Validate every extracted DOCX file
    for (const item of result.batchItems) {
      const docxFileInZip = zip.file(`MA_DE_${item.examCode}.docx`);
      expect(docxFileInZip).not.toBeNull();

      const extractedDocx = await docxFileInZip!.async("uint8array");
      const validation = await validateRenderedDocx(extractedDocx, item.variantResult);

      expect(validation.isValid).toBe(true);
      expect(validation.totalErrors).toBe(0);
      expect(validation.metrics.hasAnswerLeakage).toBe(false);
      expect(validation.metrics.headerExamCodeMatch).toBe(true);
      expect(validation.metrics.footerExamCodeMatch).toBe(true);
    }

    // 4. Content Integrity across all 10 variants
    const sourceQuestions = result.sourceExam.sections.flatMap(s => s.questions);
    const sourceMap = new Map<string, ExamQuestion>();
    for (const q of sourceQuestions) {
      sourceMap.set(q.id, q);
    }

    for (const item of result.batchItems) {
      const variantQuestions = item.variantResult.variantExam.sections.flatMap(s => s.questions);
      expect(variantQuestions.length).toBe(28);

      const seenIds = new Set<string>();

      for (const vQ of variantQuestions) {
        expect(seenIds.has(vQ.id)).toBe(false);
        seenIds.add(vQ.id);

        const srcQ = sourceMap.get(vQ.id);
        expect(srcQ).toBeDefined();

        // Stem content matches exactly
        const srcStem = richContentToPlainText(srcQ!.stem).trim();
        const vStem = richContentToPlainText(vQ.stem).trim();
        expect(vStem).toBe(srcStem);

        // Options content matches
        if (vQ.type === "MULTIPLE_CHOICE") {
          expect(vQ.options?.length).toBe(4);
          const srcOptTexts = (srcQ!.options || []).map(o => richContentToPlainText(o.content).trim()).sort();
          const vOptTexts = (vQ.options || []).map(o => richContentToPlainText(o.content).trim()).sort();
          expect(vOptTexts).toEqual(srcOptTexts);
        } else if (vQ.type === "TRUE_FALSE") {
          expect(vQ.subItems?.length).toBe(4);
          const srcSubTexts = (srcQ!.subItems || []).map(s => richContentToPlainText(s.content).trim());
          const vSubTexts = (vQ.subItems || []).map(s => richContentToPlainText(s.content).trim());
          expect(vSubTexts.sort()).toEqual(srcSubTexts.sort());
        } else if (vQ.type === "SHORT_ANSWER") {
          expect(vQ.shortAnswer?.expectedValue).toBe(srcQ!.shortAnswer?.expectedValue);
        }
      }
    }
  }, 30000);
});
