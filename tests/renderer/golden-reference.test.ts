import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";

describe("TEST-RENDER-011: Golden Reference Semantic Equivalence (vs DeSauTron.docx)", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Path = path.join(outputDir, "variant-101.json");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(v101Path, "utf8"));

  const goldenDocxPath = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");

  it("should match golden reference structural components", async () => {
    expect(fs.existsSync(goldenDocxPath)).toBe(true);
    const goldenBytes = fs.readFileSync(goldenDocxPath);
    const goldenZip = await JSZip.loadAsync(goldenBytes);
    const goldenXml = await goldenZip.file("word/document.xml")!.async("string");

    const renderedBytes = await renderExamToDocx(v101Result);
    const renderedZip = await JSZip.loadAsync(renderedBytes);
    const renderedXml = await renderedZip.file("word/document.xml")!.async("string");

    // 1. Both contain 3 main parts
    expect(goldenXml).toContain("PHẦN I");
    expect(goldenXml).toContain("PHẦN II");
    expect(goldenXml).toContain("PHẦN III");

    expect(renderedXml).toContain("PHẦN I");
    expect(renderedXml).toContain("PHẦN II");
    expect(renderedXml).toContain("PHẦN III");

    // 2. Question numbering structure matching DeSauTron.docx:
    // Part I: Câu 1. to Câu 18.
    for (let i = 1; i <= 18; i++) {
      const qPattern = new RegExp(`Câu ${i}\\.`);
      expect(renderedXml).toMatch(qPattern);
      expect(goldenXml).toMatch(qPattern);
    }

    // Part II: Câu 1. to Câu 4.
    // Part III: Câu 1. to Câu 6.
    // In DeSauTron, questions in Part II and III restart at 1, so Câu 19. does not exist in either.
    expect(renderedXml).not.toContain("Câu 19.");
    expect(goldenXml).not.toContain("Câu 19.");

    // Total questions check: exactly 28 questions
    const renderedQuestions = renderedXml.match(/Câu\s+\d+[\.:]/g) || [];
    const goldenQuestions = goldenXml.match(/Câu\s+\d+[\.:]/g) || [];
    expect(renderedQuestions.length).toBe(28);
    expect(goldenQuestions.length).toBe(28);

    // 3. Student table presence (w:tbl)
    expect(renderedXml).toContain("<w:tbl>");
    expect(renderedXml).toContain("Họ và tên");
    expect(renderedXml).toContain("Số báo danh");
    expect(renderedXml).toContain("Mã đề");

    // 4. Section headings presence
    expect(renderedXml).toContain("PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.");
    expect(renderedXml).toContain("PHẦN II. Câu trắc nghiệm đúng sai.");
    expect(renderedXml).toContain("PHẦN III. Câu trắc nghiệm trả lời ngắn.");
  });

  it("should have footer matching golden reference pattern", async () => {
    const renderedBytes = await renderExamToDocx(v101Result);
    const renderedZip = await JSZip.loadAsync(renderedBytes);
    const renderedFooterXml = await renderedZip.file("word/footer1.xml")!.async("string");

    expect(renderedFooterXml).toContain("Mã đề 101");
    expect(renderedFooterXml).toContain("Trang");
    expect(renderedFooterXml).toContain("Page");
    expect(renderedFooterXml).toContain("NUMPAGES");
  });

  it("should eliminate teacher answer leakage present in raw templates", async () => {
    const renderedBytes = await renderExamToDocx(v101Result);
    const renderedZip = await JSZip.loadAsync(renderedBytes);
    const renderedXml = await renderedZip.file("word/document.xml")!.async("string");

    // No answer lines
    expect(renderedXml).not.toContain("<w:t>Trả lời:</w:t>");
    expect(renderedXml).not.toContain("<w:t>Đáp án:</w:t>");

    // No <g...> markers
    expect(renderedXml).not.toMatch(/<g\d+/);
  });
});
