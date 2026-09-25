import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseDocx } from "../../src/core/parser/docx-parser.js";
import { countQuestions } from "../../src/core/ir/helpers.js";

describe("JSON Snapshot Export", () => {
  const filePath = path.resolve(process.cwd(), "tests/fixtures/DeGocTron.docx");
  const outputDir = path.resolve(process.cwd(), "tests/output");
  const outputFile = path.join(outputDir, "exam-ir.json");

  it("should parse DeGocTron.docx and export full ExamIR to tests/output/exam-ir.json", async () => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const exam = await parseDocx(fileBuffer, { fileName: "DeGocTron.docx" });

    const jsonString = JSON.stringify(exam, null, 2);
    fs.writeFileSync(outputFile, jsonString, "utf8");

    expect(fs.existsSync(outputFile)).toBe(true);
    const stats = fs.statSync(outputFile);
    expect(stats.size).toBeGreaterThan(1000); // Substantial JSON

    // Re-read and verify validity
    const readExam = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    expect(readExam.schemaVersion).toBe("1.0.0");
    expect(readExam.sections.length).toBe(3);
    expect(countQuestions(readExam)).toBe(28);

    // Verify run-level formatting is retained in JSON (not plain text)
    const q1 = readExam.sections[0].questions[0];
    const optC = q1.options.find((o: any) => o.originalLabel === "C");
    expect(optC).toBeDefined();
    expect(optC.content.paragraphs[0].runs.length).toBeGreaterThan(1);
    expect(optC.content.paragraphs[0].runs.some((r: any) => r.vertAlign === "subscript")).toBe(true);
  });
});
