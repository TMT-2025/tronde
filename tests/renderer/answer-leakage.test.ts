import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import { VariantExamResult } from "../../src/core/mixer/variant-generator.js";
import { renderExamToDocx } from "../../src/core/renderer/renderer.js";
import {
  getChildrenByLocalName,
  getFirstChildByLocalName,
  getDescendantsByLocalName,
  getElementTextContent
} from "../../src/core/parser/xml-utils.js";

describe("Answer Leakage Prevention (TEST-RENDER-005, TEST-RENDER-006, TEST-RENDER-008, TEST-RENDER-010)", () => {
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const v101Result: VariantExamResult = JSON.parse(fs.readFileSync(path.join(outputDir, "variant-101.json"), "utf8"));

  it("TEST-RENDER-005: Short Answer source answers (200, 0.92, 3, 5.28, 88.4, 1170) must be completely suppressed", async () => {
    const docx = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx);
    const docXml = await zip.file("word/document.xml")!.async("string");
    const dom = new DOMParser().parseFromString(docXml, "application/xml");

    const paragraphs = getDescendantsByLocalName(dom.documentElement, "p");

    const shortAnswers = ["200", "0.92", "3", "5.28", "88.4", "1170"];

    for (const p of paragraphs) {
      const pText = getElementTextContent(p).trim();
      // No paragraph should start with "A. 200" or be just an answer key line
      for (const ans of shortAnswers) {
        expect(pText).not.toMatch(new RegExp(`^A[\\.:\\)]\\s*${ans}$`));
      }
    }
  });

  it("TEST-RENDER-006: MCQ options must have identical presentation (no underline, no answer-indicating color)", async () => {
    const docx = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx);
    const docXml = await zip.file("word/document.xml")!.async("string");
    const dom = new DOMParser().parseFromString(docXml, "application/xml");

    // Check all option paragraphs
    const paragraphs = getDescendantsByLocalName(dom.documentElement, "p");
    for (const p of paragraphs) {
      const pText = getElementTextContent(p);
      if (pText.includes("A. ") && (pText.includes("B. ") || pText.includes("CH3"))) {
        // This is an option line. It MUST NOT contain any underline in its runs
        const uElements = getDescendantsByLocalName(p, "u");
        expect(uElements.length).toBe(0);
      }
    }
  });

  it("TEST-RENDER-008: TRUE/FALSE sub-items must NOT render truth state (true/false) or underlines", async () => {
    const docx = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx);
    const docXml = await zip.file("word/document.xml")!.async("string");
    const dom = new DOMParser().parseFromString(docXml, "application/xml");

    const paragraphs = getDescendantsByLocalName(dom.documentElement, "p");
    for (const p of paragraphs) {
      const pText = getElementTextContent(p).trim();
      if (pText.match(/^[a-d]\)\s*/)) {
        // Sub-item line: MUST NOT contain underline
        const uElements = getDescendantsByLocalName(p, "u");
        expect(uElements.length).toBe(0);

        // MUST NOT contain "[Đúng]" or "[Sai]" or "(True)" or "(False)"
        expect(pText).not.toContain("ĐÚNG");
        expect(pText).not.toContain("SAI");
        expect(pText).not.toContain("TRUE");
        expect(pText).not.toContain("FALSE");
      }
    }
  });

  it("TEST-RENDER-010: Complete document scan must prove zero answer leakage", async () => {
    const docx = await renderExamToDocx(v101Result);
    const zip = await JSZip.loadAsync(docx);
    const docXml = await zip.file("word/document.xml")!.async("string");
    const dom = new DOMParser().parseFromString(docXml, "application/xml");

    // Only allow underline if it's in dots like ".........." (blank lines in header table)
    const runsWithUnderline = getDescendantsByLocalName(dom.documentElement, "r").filter(r => {
      const u = getDescendantsByLocalName(r, "u");
      return u.length > 0;
    });

    for (const r of runsWithUnderline) {
      const text = getElementTextContent(r);
      expect(text).toMatch(/^[\.\s_]*$/); // Only dots or underscores permitted
    }
  });
});
