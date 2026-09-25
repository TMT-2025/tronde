import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import {
  generateVariantAnswerKey,
  verifyAnswerKeyConsistency,
  BatchAnswerKeyExport
} from "../../src/core/pipeline/answer-key-generator.js";

describe("Answer Key Generation & Consistency (TEST-PIPE-003)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");
  const outDir = path.resolve(process.cwd(), "tests/output/answer_key_test");

  it("should generate valid answer-key.json with MCQ, TF, and Short Answer structure", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 2,
      seed: 20260924,
      outputDir: outDir,
      createZip: true
    });

    const answerKeyFile = path.join(outDir, "answer-key.json");
    expect(fs.existsSync(answerKeyFile)).toBe(true);

    const keyData: BatchAnswerKeyExport = JSON.parse(fs.readFileSync(answerKeyFile, "utf8"));
    expect(keyData.totalVariants).toBe(2);
    expect(keyData.examCodes).toEqual(["101", "102"]);

    // Check variant 101 answers
    const v101Answers = keyData.variants["101"].answers;
    expect(v101Answers).toBeDefined();

    // 1. Check Multiple Choice keys (P1-Q01 to P1-Q18)
    for (let i = 1; i <= 18; i++) {
      const qKey = `P1-Q${String(i).padStart(2, "0")}`;
      expect(v101Answers[qKey]).toBeDefined();
      expect(["A", "B", "C", "D"]).toContain(v101Answers[qKey]);
    }

    // 2. Check True/False keys (P2-Q01 to P2-Q04)
    for (let i = 1; i <= 4; i++) {
      const qKey = `P2-Q${String(i).padStart(2, "0")}`;
      const tfVal = v101Answers[qKey] as Record<string, boolean>;
      expect(tfVal).toBeDefined();
      expect(typeof tfVal.a).toBe("boolean");
      expect(typeof tfVal.b).toBe("boolean");
      expect(typeof tfVal.c).toBe("boolean");
      expect(typeof tfVal.d).toBe("boolean");
    }

    // 3. Check Short Answer keys (P3-Q01 to P3-Q06)
    for (let i = 1; i <= 6; i++) {
      const qKey = `P3-Q${String(i).padStart(2, "0")}`;
      const saVal = v101Answers[qKey] as string;
      expect(typeof saVal).toBe("string");
      expect(saVal.length).toBeGreaterThan(0);
    }
  });

  it("should verify 100% consistency between reconstructed answer key and Variant IR", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 4,
      seed: 55555,
      skipDiskWrite: true,
      createZip: false
    });

    for (const item of result.batchItems) {
      const isConsistent = verifyAnswerKeyConsistency(
        item.variantResult,
        result.answerKey.variants[item.examCode]
      );
      expect(isConsistent).toBe(true);
    }
  });

  it("should guarantee zero answer leakage in rendered student DOCX", async () => {
    const docxPath = path.join(outDir, "MA_DE_101.docx");
    expect(fs.existsSync(docxPath)).toBe(true);

    const docxBytes = fs.readFileSync(docxPath);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // No underline formatting
    expect(documentXml).not.toMatch(/<w:u\s+w:val="single"\s*\/>/);

    // No answer lines
    expect(documentXml).not.toContain("Trả lời:");
    expect(documentXml).not.toContain("Đáp án:");

    // No <g...> markers
    expect(documentXml).not.toMatch(/<g0#\d+>/);
  });
});
