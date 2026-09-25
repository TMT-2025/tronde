import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";

describe("TEST-RENDER-001: DOCX Package Integrity & OpenXML Validity", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Path = path.join(outputDir, "variant-101.json");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(v101Path, "utf8"));

  it("should contain all required OPC package files", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);

    // Essential OpenXML parts
    expect(zip.file("[Content_Types].xml")).not.toBeNull();
    expect(zip.file("_rels/.rels")).not.toBeNull();
    expect(zip.file("word/document.xml")).not.toBeNull();
    expect(zip.file("word/_rels/document.xml.rels")).not.toBeNull();
    expect(zip.file("word/footer1.xml")).not.toBeNull();
    expect(zip.file("word/styles.xml")).not.toBeNull();
    expect(zip.file("word/settings.xml")).not.toBeNull();
    expect(zip.file("word/fontTable.xml")).not.toBeNull();
  });

  it("should have valid XML syntax in all XML package files", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const parser = new DOMParser({
      onError: (level, msg) => {
        if (level === "error" || level === "fatalError") {
          throw new Error(`XML ${level}: ${msg}`);
        }
      }
    });

    const xmlFiles = [
      "[Content_Types].xml",
      "_rels/.rels",
      "word/document.xml",
      "word/_rels/document.xml.rels",
      "word/footer1.xml",
      "word/styles.xml",
      "word/settings.xml",
    ];

    for (const relPath of xmlFiles) {
      const file = zip.file(relPath);
      expect(file).not.toBeNull();
      const content = await file!.async("string");
      expect(() => parser.parseFromString(content, "text/xml")).not.toThrow();
    }
  });

  it("should specify standard compact page margins in sectPr", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    // Margins: top=567, bottom=567, left=1134 (2cm), right=567 (1cm)
    expect(documentXml).toContain('w:top="567"');
    expect(documentXml).toContain('w:bottom="567"');
    expect(documentXml).toContain('w:left="1134"');
    expect(documentXml).toContain('w:right="567"');
  });

  it("should link footer in sectPr", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const documentXml = await zip.file("word/document.xml")!.async("string");

    expect(documentXml).toMatch(/<w:footerReference\s+w:type="default"\s+r:id="rId\d+"\s*\/>/);
  });

  it("should declare footer content type in [Content_Types].xml", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const contentTypes = await zip.file("[Content_Types].xml")!.async("string");

    expect(contentTypes).toContain('PartName="/word/footer1.xml"');
    expect(contentTypes).toContain('ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"');
  });

  it("should declare footer relationship in word/_rels/document.xml.rels", async () => {
    const docxBytes = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docxBytes);
    const rels = await zip.file("word/_rels/document.xml.rels")!.async("string");

    expect(rels).toContain('Target="footer1.xml"');
    expect(rels).toContain('Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"');
  });
});
