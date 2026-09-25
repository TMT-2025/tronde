import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import { validateRenderedDocx } from "../../src/core/validation/render-validator.js";

describe("DOCX Visual & Layout QA (TASK 3)", () => {
  const sourceDocx = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocx = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");
  const outDir = path.resolve(process.cwd(), "tests/output/visual_qa_run");

  it("should verify visual fidelity, formatting, layout columns, and zero leakage in rendered DOCX", async () => {
    const result = await runExamPipeline({
      sourceDocx,
      templateDocx,
      examCodeStart: 101,
      variantCount: 2,
      seed: 20260925,
      outputDir: outDir,
      createZip: true
    });

    const docxPath = path.join(outDir, "MA_DE_101.docx");
    expect(fs.existsSync(docxPath)).toBe(true);

    const docxBytes = fs.readFileSync(docxPath);
    const zip = await JSZip.loadAsync(docxBytes);

    const documentXml = await zip.file("word/document.xml")!.async("string");
    const footerXml = await zip.file("word/footer1.xml")!.async("string");

    // 1. Exam code consistency between Header Table and Footer
    expect(documentXml).toContain("Mã đề 101");
    expect(footerXml).toContain("Mã đề 101");

    // 2. Dynamic Word Page fields (Page and NUMPAGES)
    expect(footerXml).toMatch(/<w:instrText[^>]*>\s*Page\s*<\/w:instrText>/i);
    expect(footerXml).toMatch(/<w:instrText[^>]*>\s*NUMPAGES\s*<\/w:instrText>/i);
    expect(footerXml).toContain('w:fldCharType="begin"');
    expect(footerXml).toContain('w:fldCharType="separate"');
    expect(footerXml).toContain('w:fldCharType="end"');

    // 3. Page margins: Left 2cm (1134 dxa), Top/Bottom/Right 1cm (567 dxa)
    expect(documentXml).toContain('w:left="1134"');
    expect(documentXml).toContain('w:top="567"');
    expect(documentXml).toContain('w:bottom="567"');
    expect(documentXml).toContain('w:right="567"');

    // 4. Layout column modes
    // 4-column tabs: 283, 2906, 5528, 8150
    expect(documentXml).toContain('w:pos="283"');
    expect(documentXml).toContain('w:pos="2906"');
    expect(documentXml).toContain('w:pos="5528"');
    expect(documentXml).toContain('w:pos="8150"');

    // 2-column tabs pattern: 283, 5528
    expect(documentXml).toMatch(/<w:tabs>\s*<w:tab[^>]*w:pos="283"[^>]*\/>\s*<w:tab[^>]*w:pos="5528"[^>]*\/>\s*<\/w:tabs>/);

    // 1-column tab pattern: single 283
    expect(documentXml).toMatch(/<w:tabs>\s*<w:tab[^>]*w:pos="283"[^>]*\/>\s*<\/w:tabs>/);

    // 5. Chemical formulas & subscripts
    // Subscripts must be preserved via w:vertAlign w:val="subscript"
    expect(documentXml).toContain('w:val="subscript"');
    const subscriptMatches = documentXml.match(/<w:vertAlign\s+w:val="subscript"\s*\/>/g) || [];
    expect(subscriptMatches.length).toBeGreaterThan(50);

    // Verify key formulas are present with subscript numbers
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>3<\/w:t>/);
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>2<\/w:t>/);
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>5<\/w:t>/);

    // 6. True/False formatting: a), b), c), d) with YoungMixChar and bold
    expect(documentXml).toMatch(/<w:rStyle\s+w:val="YoungMixChar"\s*\/>\s*<w:b\/>/);
    expect(documentXml).toContain("a) ");
    expect(documentXml).toContain("b) ");
    expect(documentXml).toContain("c) ");
    expect(documentXml).toContain("d) ");

    // 7. Short Answer student exam suppression
    expect(documentXml).not.toContain("Trả lời:");
    expect(documentXml).not.toContain("Đáp án:");
    expect(documentXml).not.toMatch(/<g0#\d+>/);

    // 8. Zero answer leakage
    expect(documentXml).not.toMatch(/<w:u\s+w:val="single"\s*\/>/);

    // 9. Full validator pass
    const validation = await validateRenderedDocx(docxBytes, result.batchItems[0].variantResult);
    expect(validation.isValid).toBe(true);
    expect(validation.totalErrors).toBe(0);
  });
});
