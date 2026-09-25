import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";
import { getDescendantsByLocalName, getElementTextContent } from "../../src/core/parser/xml-utils.js";

describe("Header, Footer & Template Settings (TEST-RENDER-003, TEST-RENDER-004, TEST-RENDER-011)", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(path.join(outputDir, "variant-101.json"), "utf8"));
  const v102Result: VariantExamResult = JSON.parse(fs.readFileSync(path.join(outputDir, "variant-102.json"), "utf8"));

  it("TEST-RENDER-003: Header table must dynamically display correct Mã đề (101 vs 102)", async () => {
    const docx101 = await renderExamToDocx(v101Result);
    const docx102 = await renderExamToDocx(v102Result);

    const zip101 = await JSZip.loadAsync(docx101);
    const zip102 = await JSZip.loadAsync(docx102);

    const doc101Xml = await zip101.file("word/document.xml")!.async("string");
    const doc102Xml = await zip102.file("word/document.xml")!.async("string");

    expect(doc101Xml).toContain("Mã đề 101");
    expect(doc101Xml).not.toContain("Mã đề 102");

    expect(doc102Xml).toContain("Mã đề 102");
    expect(doc102Xml).not.toContain("Mã đề 101");
  });

  it("TEST-RENDER-004: Footer must contain Word dynamic fields (Page, NUMPAGES), not static numbers", async () => {
    const docx101 = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx101);

    const footerXml = await zip.file("word/footer1.xml")!.async("string");
    const dom = new DOMParser().parseFromString(footerXml, "application/xml");

    expect(footerXml).toContain("Mã đề 101");

    // Dynamic field assertions
    const instrTexts = getDescendantsByLocalName(dom.documentElement, "instrText").map(e => e.textContent?.trim());
    expect(instrTexts).toContain("Page");
    expect(instrTexts).toContain("NUMPAGES");

    const fldChars = getDescendantsByLocalName(dom.documentElement, "fldChar").map(e => e.getAttribute("w:fldCharType"));
    expect(fldChars).toContain("begin");
    expect(fldChars).toContain("separate");
    expect(fldChars).toContain("end");
  });

  it("TEST-RENDER-011: Template margins and section properties must conform to Vietnamese educational standard", async () => {
    const docx101 = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx101);

    const docXml = await zip.file("word/document.xml")!.async("string");
    const dom = new DOMParser().parseFromString(docXml, "application/xml");

    // Check pgSz: A4 (w=11906, h=16838)
    expect(docXml).toContain('w:w="11906"');
    expect(docXml).toContain('w:h="16838"');

    // Check margins: top=567 (1cm), right=567 (1cm), bottom=567 (1cm), left=1134 (2cm)
    expect(docXml).toContain('w:top="567"');
    expect(docXml).toContain('w:right="567"');
    expect(docXml).toContain('w:bottom="567"');
    expect(docXml).toContain('w:left="1134"');

    // Check footer reference
    expect(docXml).toContain('<w:footerReference w:type="default" r:id="rId7"/>');
  });
});
