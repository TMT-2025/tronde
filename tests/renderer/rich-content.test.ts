import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";

describe("TEST-RENDER-007: Rich Text & Chemistry Subscript Fidelity", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Path = path.join(outputDir, "variant-101.json");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(v101Path, "utf8"));

  it("should preserve subscript and superscript tags in document.xml", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // Subscript count should be significant due to chemistry formulas
    const subscriptMatches = documentXml.match(/<w:vertAlign\s+w:val="subscript"\s*\/>/g);
    expect(subscriptMatches).not.toBeNull();
    expect(subscriptMatches!.length).toBeGreaterThan(50);

    // Verify key chemical formula runs exist with subscript
    // E.g. CH3COOC2H5, CnH2nO2, CnH2n-2O2, (C17H35COO)3C3H5
    expect(documentXml).toContain("CH");
    expect(documentXml).toContain("COOC");
    expect(documentXml).toContain("vertAlign");

    // Check specific subscript runs: <w:rPr>...<w:vertAlign w:val="subscript"/>...</w:rPr><w:t...>3</w:t>
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>3<\/w:t>/);
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>2<\/w:t>/);
    expect(documentXml).toMatch(/<w:vertAlign\s+w:val="subscript"\s*\/>[^<]*<\/w:rPr><w:t[^>]*>5<\/w:t>/);
  });

  it("should preserve bold and italic formatting where present in stem or options", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // Question stem bold labels: "Câu 1. ", "Câu 18. "
    expect(documentXml).toMatch(/<w:rPr>[^<]*<w:b\/>[^<]*<\/w:rPr><w:t[^>]*>Câu 1\. /);
    expect(documentXml).toMatch(/<w:rPr>[^<]*<w:b\/>[^<]*<\/w:rPr><w:t[^>]*>Câu 18\. /);

    // Part headings: "PHẦN I", "PHẦN II", "PHẦN III"
    expect(documentXml).toContain("PHẦN I");
    expect(documentXml).toContain("PHẦN II");
    expect(documentXml).toContain("PHẦN III");

    // True/False sub-item labels: "a) ", "b) ", "c) ", "d) " with YoungMixChar and bold
    expect(documentXml).toMatch(/<w:rStyle\s+w:val="YoungMixChar"\s*\/>\s*<w:b\/>[\s\S]*?<w:t[^>]*>a\) /);
  });

  it("should not drop chemistry subscripts in scrambled option order", async () => {
    // Render 102 as well
    const v102Path = path.join(outputDir, "variant-102.json");
    const v102Result: VariantExamResult = JSON.parse(fs.readFileSync(v102Path, "utf8"));
    const docxBytes = await renderExamToDocx(v102Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    const subscriptMatches = documentXml.match(/<w:vertAlign\s+w:val="subscript"\s*\/>/g);
    expect(subscriptMatches).not.toBeNull();
    // Subscript count in variant 102 should be identical to 101 since options are permuted, not removed
    const zip101 = await JSZip.loadAsync(await renderExamToDocx(v101Result));
    const xml101 = await zip101.file("word/document.xml")!.async("string");
    const sub101 = xml101.match(/<w:vertAlign\s+w:val="subscript"\s*\/>/g)!.length;
    const sub102 = subscriptMatches!.length;

    expect(sub102).toBe(sub101);
  });
});
