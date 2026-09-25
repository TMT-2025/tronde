import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant } from "../../src/core/mixer/variant-generator.js";

describe("Answer Mapping & Consistency (TEST-MIX-011)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const SEED = 20260924;

  it("TEST-MIX-011: For every single MCQ, verify 5-step answer consistency pipeline", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const vExam = result.variantExam;
    const auditMap = result.auditMap;
    const answerKey = result.answerKey;

    const sourceMCQs = sourceExam.sections[0].questions;
    const variantMCQs = vExam.sections[0].questions;

    expect(variantMCQs.length).toBe(18);

    for (const vQ of variantMCQs) {
      // Step 1: Lấy original options
      const srcQ = sourceMCQs.find(q => q.id === vQ.id);
      expect(srcQ).toBeDefined();
      const originalOptions = srcQ!.options!;
      expect(originalOptions.length).toBe(4);

      // Step 2: Lấy original correct option
      const originalCorrectOpt = originalOptions.find(o => o.isCorrect);
      expect(originalCorrectOpt).toBeDefined();
      const originalCorrectLabel = originalCorrectOpt!.originalLabel;

      // Step 3: Lấy permutation
      const mapping = auditMap.mcqMappings[vQ.id];
      expect(mapping).toBeDefined();
      expect(mapping.originalCorrectLabel).toBe(originalCorrectLabel);
      expect(mapping.permutations.length).toBe(4);

      // Step 4: Xác định option mới từ permutation
      const mappedCorrectEntry = mapping.permutations.find(p => p.originalLabel === originalCorrectLabel);
      expect(mappedCorrectEntry).toBeDefined();
      const expectedNewLabel = mappedCorrectEntry!.newLabel;

      // Step 5: So sánh với new correctAnswer trong variant và answerKey
      expect(mapping.newCorrectLabel).toBe(expectedNewLabel);

      const variantCorrectOpt = vQ.options!.find(o => o.isCorrect);
      expect(variantCorrectOpt).toBeDefined();
      expect(variantCorrectOpt!.currentLabel).toBe(expectedNewLabel);
      expect(variantCorrectOpt!.id).toBe(originalCorrectOpt!.id);

      // Check AnswerKey
      expect(answerKey.mcqAnswers[vQ.id]).toBe(expectedNewLabel);
    }
  });
});
