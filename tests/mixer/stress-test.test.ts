import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant, generateMultipleVariants } from "../../src/core/mixer/variant-generator.js";
import { validateMixedVariant } from "../../src/core/validation/mixing-validator.js";

describe("Stress & Scale Verification (TEST-MIX-010)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const BASE_SEED = 20260924;

  it("TEST-MIX-010: Generate 100 variants (codes 101 to 200) and validate 100% of them with zero errors", () => {
    const examCodes: string[] = [];
    for (let code = 101; code <= 200; code++) {
      examCodes.push(code.toString());
    }

    expect(examCodes.length).toBe(100);

    const startTime = performance.now();
    const variants = generateMultipleVariants(sourceExam, BASE_SEED, examCodes, {
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });
    const duration = performance.now() - startTime;

    expect(variants.length).toBe(100);
    // 100 variants should generate very quickly (under 2 seconds)
    expect(duration).toBeLessThan(5000);

    // Validate every single variant
    for (const vResult of variants) {
      const report = validateMixedVariant(sourceExam, vResult.variantExam, vResult.auditMap);
      if (!report.isValid) {
        console.error(`Validation failed for variant ${vResult.metadata.examCode}:`, report.issues);
      }
      expect(report.isValid).toBe(true);
      expect(report.totalErrors).toBe(0);
      expect(report.metrics.totalQuestions).toBe(28);
      expect(report.metrics.sectionCounts.p1).toBe(18);
      expect(report.metrics.sectionCounts.p2).toBe(4);
      expect(report.metrics.sectionCounts.p3).toBe(6);
    }
  });

  it("should export variant-101.json and variant-102.json to tests/output/", () => {
    const v101 = generateVariant(sourceExam, {
      examCode: "101",
      seed: BASE_SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const v102 = generateVariant(sourceExam, {
      examCode: "102",
      seed: BASE_SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const file101 = path.join(outputDir, "variant-101.json");
    const file102 = path.join(outputDir, "variant-102.json");

    fs.writeFileSync(file101, JSON.stringify(v101, null, 2), "utf8");
    fs.writeFileSync(file102, JSON.stringify(v102, null, 2), "utf8");

    expect(fs.existsSync(file101)).toBe(true);
    expect(fs.existsSync(file102)).toBe(true);

    const stat101 = fs.statSync(file101);
    const stat102 = fs.statSync(file102);

    expect(stat101.size).toBeGreaterThan(50000);
    expect(stat102.size).toBeGreaterThan(50000);
  });
});
