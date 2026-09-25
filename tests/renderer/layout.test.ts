import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";
import { determineOptionLayout } from "../../src/core/renderer/layout-engine.js";
import { QuestionOption } from "../../src/types/exam-ir.js";

function makeOption(text: string, label: string): QuestionOption {
  return {
    label,
    content: {
      paragraphs: [
        {
          runs: [{ text }]
        }
      ]
    },
    isCorrect: false
  };
}

describe("Layout Engine & Tab Stops Verification (TEST-RENDER-005, 006, 009)", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Path = path.join(outputDir, "variant-101.json");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(v101Path, "utf8"));

  it("should calculate correct layout column types based on text length", () => {
    // 4-column: short options (all <= 18 chars)
    const shortOptions: QuestionOption[] = [
      makeOption("C2H5OH", "A"),
      makeOption("CH3COOH", "B"),
      makeOption("CH3CHO", "C"),
      makeOption("HCOOH", "D"),
    ];
    expect(determineOptionLayout(shortOptions)).toBe("4_COLUMNS");

    // 2-column: medium options (all <= 45 chars)
    const mediumOptions: QuestionOption[] = [
      makeOption("nhiệt độ sôi cao hơn", "A"),
      makeOption("nhiệt độ sôi thấp hơn", "B"),
      makeOption("không tan trong nước", "C"),
      makeOption("tan vô hạn trong nước", "D"),
    ];
    expect(determineOptionLayout(mediumOptions)).toBe("2_COLUMNS");

    // 1-column: long options (any > 45 chars)
    const longOptions: QuestionOption[] = [
      makeOption("Xà phòng hoá hoàn toàn chất béo trong dung dịch NaOH đun nóng thu được muối và glixerol.", "A"),
      makeOption("Chất béo nhẹ hơn nước, không tan trong nước nhưng tan nhiều.", "B"),
      makeOption("Dầu mỡ động thực vật để lâu bị ôi thiu do liên kết đôi C=C bị oxi hoá.", "C"),
      makeOption("Phản ứng thuỷ phân este trong môi trường axit là phản ứng một chiều.", "D"),
    ];
    expect(determineOptionLayout(longOptions)).toBe("1_COLUMN");
  });

  it("TEST-RENDER-005: should generate 4-column layout tab stops pos=283, 2906, 5528, 8150", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // Check for 4-column tab definition
    expect(documentXml).toContain('w:pos="283"');
    expect(documentXml).toContain('w:pos="2906"');
    expect(documentXml).toContain('w:pos="5528"');
    expect(documentXml).toContain('w:pos="8150"');

    // Tab characters should be present
    const tabMatches = documentXml.match(/<w:tab\s*\/>/g);
    expect(tabMatches).not.toBeNull();
    expect(tabMatches!.length).toBeGreaterThan(40);
  });

  it("TEST-RENDER-006: should generate 2-column layout tab stops pos=283, 5528", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // 2-column tab definitions have 283 and 5528
    const twoColTabsPattern = /<w:tabs>\s*<w:tab\s+w:val="left"\s+w:pos="283"\s*\/>\s*<w:tab\s+w:val="left"\s+w:pos="5528"\s*\/>\s*<\/w:tabs>/;
    expect(documentXml).toMatch(twoColTabsPattern);
  });

  it("TEST-RENDER-009: should generate 1-column layout with tab stop pos=283 for long options", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // 1-column tab definition has single tab pos=283
    const oneColTabsPattern = /<w:tabs>\s*<w:tab\s+w:val="left"\s+w:pos="283"\s*\/>\s*<\/w:tabs>/;
    expect(documentXml).toMatch(oneColTabsPattern);
  });

  it("should compress page space by utilizing 4-col and 2-col packing", async () => {
    // Check MCQ questions in variant 101: 18 questions total
    const mcqSection = v101Result.variantExam.sections[0];
    let fourColCount = 0;
    let twoColCount = 0;
    let oneColCount = 0;

    for (const q of mcqSection.questions) {
      if (q.options) {
        const layout = determineOptionLayout(q.options);
        if (layout === "4_COLUMNS") fourColCount++;
        else if (layout === "2_COLUMNS") twoColCount++;
        else oneColCount++;
      }
    }

    // Out of 18 questions, most should be 4-col or 2-col
    expect(fourColCount).toBeGreaterThanOrEqual(4);
    expect(twoColCount).toBeGreaterThanOrEqual(5);
    expect(fourColCount + twoColCount).toBeGreaterThan(12);
  });
});
