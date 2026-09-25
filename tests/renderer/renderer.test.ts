import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";
import { validateRenderedDocx } from "../../src/core/validation/render-validator.js";

describe("Renderer Core Execution (TEST-RENDER-001 & TEST-RENDER-002)", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Path = path.join(outputDir, "variant-101.json");
  const v102Path = path.join(outputDir, "variant-102.json");

  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(v101Path, "utf8"));
  const v102Result: VariantExamResult = JSON.parse(fs.readFileSync(v102Path, "utf8"));

  it("TEST-RENDER-001: Should render variant-101.json to MA_DE_101_RENDERED.docx and validate structure", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    expect(docxBytes.byteLength).toBeGreaterThan(15000);

    const outPath = path.join(outputDir, "MA_DE_101_RENDERED.docx");
    fs.writeFileSync(outPath, docxBytes);

    expect(fs.existsSync(outPath)).toBe(true);

    // Validate DOCX package
    const report = await validateRenderedDocx(docxBytes, v101Result);
    if (!report.isValid) {
      console.error("Render validation failed for 101:", report.issues);
    }
    expect(report.isValid).toBe(true);
    expect(report.totalErrors).toBe(0);
    expect(report.metrics.headerExamCodeMatch).toBe(true);
    expect(report.metrics.footerExamCodeMatch).toBe(true);
    expect(report.metrics.hasPageField).toBe(true);
    expect(report.metrics.hasNumPagesField).toBe(true);
    expect(report.metrics.hasAnswerLeakage).toBe(false);
  });

  it("TEST-RENDER-002: Should render variant-102.json to MA_DE_102_RENDERED.docx and validate structure", async () => {
    const docxBytes = await renderExamToDocx(v102Result);
    expect(docxBytes.byteLength).toBeGreaterThan(15000);

    const outPath = path.join(outputDir, "MA_DE_102_RENDERED.docx");
    fs.writeFileSync(outPath, docxBytes);

    expect(fs.existsSync(outPath)).toBe(true);

    const report = await validateRenderedDocx(docxBytes, v102Result);
    if (!report.isValid) {
      console.error("Render validation failed for 102:", report.issues);
    }
    expect(report.isValid).toBe(true);
    expect(report.totalErrors).toBe(0);
    expect(report.metrics.headerExamCodeMatch).toBe(true);
    expect(report.metrics.footerExamCodeMatch).toBe(true);
    expect(report.metrics.hasAnswerLeakage).toBe(false);
  });
});
