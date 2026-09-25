import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseDocx } from "../../src/core/parser/docx-parser.js";
import { validateExamIR } from "../../src/core/validation/parser-validator.js";

describe("Validation Engine - Parser Quality Gatekeeper", () => {
  const filePath = path.resolve(process.cwd(), "tests/fixtures/DeGocTron.docx");
  const fileBuffer = fs.readFileSync(filePath);

  it("should validate DeGocTron.docx as 100% valid with 0 errors", async () => {
    const exam = await parseDocx(fileBuffer);
    const report = validateExamIR(exam);

    expect(report.isValid).toBe(true);
    expect(report.totalErrors).toBe(0);
    expect(report.summary.sectionCount).toBe(3);
    expect(report.summary.mcqCount).toBe(18);
    expect(report.summary.tfCount).toBe(4);
    expect(report.summary.shortAnswerCount).toBe(6);
    expect(report.summary.totalQuestions).toBe(28);
  });

  it("should fail validation if a section is missing or question count is wrong", async () => {
    const exam = await parseDocx(fileBuffer);
    
    // Remove section 3
    const corruptedExam = {
      ...exam,
      sections: exam.sections.slice(0, 2)
    };

    const report = validateExamIR(corruptedExam);
    expect(report.isValid).toBe(false);
    expect(report.totalErrors).toBeGreaterThan(0);
    expect(report.issues.some(i => i.code === "VAL-SEC-COUNT")).toBe(true);
  });

  it("should fail validation if an MCQ has no correct answer marked", async () => {
    const exam = await parseDocx(fileBuffer);
    
    // Unmark correct answer in Q1
    const corruptedExam = JSON.parse(JSON.stringify(exam));
    corruptedExam.sections[0].questions[0].options.forEach((o: any) => {
      o.isCorrect = false;
    });

    const report = validateExamIR(corruptedExam);
    expect(report.isValid).toBe(false);
    expect(report.issues.some(i => i.code === "VAL-MCQ-NO-CORRECT")).toBe(true);
  });

  it("should fail validation if duplicate question IDs exist", async () => {
    const exam = await parseDocx(fileBuffer);
    
    const corruptedExam = JSON.parse(JSON.stringify(exam));
    corruptedExam.sections[0].questions[1].id = corruptedExam.sections[0].questions[0].id;

    const report = validateExamIR(corruptedExam);
    expect(report.isValid).toBe(false);
    expect(report.issues.some(i => i.code === "VAL-Q-ID-DUPLICATE")).toBe(true);
  });
});
