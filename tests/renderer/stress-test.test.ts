import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/types/exam-ir.js";
import { generateMultipleVariants } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";
import { validateRenderedDocx } from "../../src/core/validation/render-validator.js";

describe("TEST-RENDER-012: Stress Test (100 Rendered Variants)", () => {
  const examIrPath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(examIrPath, "utf8"));

  it("should render and validate 100 variants (101 to 200) with zero errors", async () => {
    const startTime = Date.now();
    const examCodes = Array.from({ length: 100 }, (_, i) => String(101 + i));

    // Generate 100 variants using mixing engine
    const variants = generateMultipleVariants(sourceExam, 424242, examCodes);

    expect(variants.length).toBe(100);

    let totalRenderTime = 0;
    let validCount = 0;

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const rStart = Date.now();
      const docxBytes = await renderExamToDocx(variant);
      totalRenderTime += (Date.now() - rStart);

      // Validate rendered DOCX package
      const report = await validateRenderedDocx(docxBytes, variant);
      if (!report.isValid) {
        throw new Error(`Variant ${variant.metadata.examCode} failed render validation: ${JSON.stringify(report.issues)}`);
      }

      expect(report.isValid).toBe(true);
      expect(report.totalErrors).toBe(0);
      expect(report.metrics.headerExamCodeMatch).toBe(true);
      expect(report.metrics.footerExamCodeMatch).toBe(true);
      expect(report.metrics.hasAnswerLeakage).toBe(false);

      validCount++;
    }

    const elapsed = Date.now() - startTime;
    const avgRenderMs = (totalRenderTime / 100).toFixed(2);

    console.log(`Rendered and validated 100 variants in ${elapsed}ms (avg render: ${avgRenderMs}ms/variant)`);

    expect(validCount).toBe(100);
    // Performance expectation: average render time under 100ms per document
    expect(totalRenderTime / 100).toBeLessThan(150);
  }, 60000); // 60s timeout for 100 variants
});
