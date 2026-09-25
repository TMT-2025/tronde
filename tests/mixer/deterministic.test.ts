import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant } from "../../src/core/mixer/variant-generator.js";

describe("Deterministic PRNG Verification (TEST-MIX-007 & TEST-MIX-008)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const SEED_A = 20260924;
  const SEED_B = 20260925;

  it("TEST-MIX-007: Same seed and configuration executed twice must produce 100% identical JSON outputs", () => {
    const run1 = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED_A,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const run2 = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED_A,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const json1 = JSON.stringify(run1);
    const json2 = JSON.stringify(run2);

    expect(json1).toBe(json2);
  });

  it("TEST-MIX-008: Different seeds should produce distinct permutations", () => {
    const runA = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED_A,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const runB = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED_B,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const jsonA = JSON.stringify(runA.variantExam);
    const jsonB = JSON.stringify(runB.variantExam);

    // Permutations must differ
    expect(jsonA).not.toBe(jsonB);

    // Question orders must differ
    const orderA = runA.variantExam.sections[0].questions.map(q => q.id);
    const orderB = runB.variantExam.sections[0].questions.map(q => q.id);
    expect(orderA).not.toEqual(orderB);
  });
});
