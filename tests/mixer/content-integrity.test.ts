import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant } from "../../src/core/mixer/variant-generator.js";
import { richContentToPlainText } from "../../src/core/ir/helpers.js";

describe("Content Integrity & Invariance (TEST-MIX-012)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const SEED = 20260924;

  it("TEST-MIX-012: Canonical text and formatting properties of every question, option, and sub-item must remain identical", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const vExam = result.variantExam;
    const sourceQuestions = sourceExam.sections.flatMap(s => s.questions);
    const variantQuestions = vExam.sections.flatMap(s => s.questions);

    expect(variantQuestions.length).toBe(sourceQuestions.length);

    for (const vQ of variantQuestions) {
      const srcQ = sourceQuestions.find(q => q.id === vQ.id)!;
      expect(srcQ).toBeDefined();

      // 1. Stem text exact match
      const srcStemText = richContentToPlainText(srcQ.stem).trim();
      const varStemText = richContentToPlainText(vQ.stem).trim();
      expect(varStemText).toBe(srcStemText);

      // 2. Stem run count and properties exact match
      expect(vQ.stem.paragraphs.length).toBe(srcQ.stem.paragraphs.length);
      for (let pIdx = 0; pIdx < srcQ.stem.paragraphs.length; pIdx++) {
        const srcP = srcQ.stem.paragraphs[pIdx];
        const varP = vQ.stem.paragraphs[pIdx];
        expect(varP.runs.length).toBe(srcP.runs.length);
        for (let rIdx = 0; rIdx < srcP.runs.length; rIdx++) {
          expect(varP.runs[rIdx].text).toBe(srcP.runs[rIdx].text);
          expect(varP.runs[rIdx].vertAlign).toBe(srcP.runs[rIdx].vertAlign);
          expect(varP.runs[rIdx].bold).toBe(srcP.runs[rIdx].bold);
        }
      }

      // 3. Option content exact match
      if (vQ.type === "MULTIPLE_CHOICE" && vQ.options && srcQ.options) {
        const srcOptMap = new Map(srcQ.options.map(o => [o.id, o]));
        for (const vOpt of vQ.options) {
          const srcOpt = srcOptMap.get(vOpt.id)!;
          expect(srcOpt).toBeDefined();

          const srcOptText = richContentToPlainText(srcOpt.content).trim();
          const varOptText = richContentToPlainText(vOpt.content).trim();
          expect(varOptText).toBe(srcOptText);

          // Subscripts must be preserved
          const srcSubscripts = srcOpt.content.paragraphs.flatMap(p => p.runs.filter(r => r.vertAlign === "subscript").map(r => r.text));
          const varSubscripts = vOpt.content.paragraphs.flatMap(p => p.runs.filter(r => r.vertAlign === "subscript").map(r => r.text));
          expect(varSubscripts).toEqual(srcSubscripts);
        }
      }

      // 4. Sub-item content exact match
      if (vQ.type === "TRUE_FALSE" && vQ.subItems && srcQ.subItems) {
        const srcSubMap = new Map(srcQ.subItems.map(s => [s.id, s]));
        for (const vSub of vQ.subItems) {
          const srcSub = srcSubMap.get(vSub.id)!;
          expect(srcSub).toBeDefined();

          const srcSubText = richContentToPlainText(srcSub.content).trim();
          const varSubText = richContentToPlainText(vSub.content).trim();
          expect(varSubText).toBe(srcSubText);
        }
      }

      // 5. Short answer expected value exact match
      if (vQ.type === "SHORT_ANSWER" && vQ.shortAnswer && srcQ.shortAnswer) {
        expect(vQ.shortAnswer.expectedValue).toBe(srcQ.shortAnswer.expectedValue);
      }
    }
  });
});
